import { spawn } from 'node:child_process'
import { Database } from 'node:sqlite'
import { encodeCursor } from './cursor.ts'
import { databasePath } from './seed.ts'

// npm run load -- offset 40000   the starter, page after 40,000 rows
// npm run load -- keyset 40000   the solution, the same page via its cursor
const [mode = 'offset', depthArgument = '0'] = process.argv.slice(2)
const depth = Number(depthArgument)
const baseUrl = `http://127.0.0.1:${process.env.PORT ?? 4000}`
const connections = process.env.CONNECTIONS ?? '20'
const duration = process.env.DURATION ?? '10'

const fields = 'id status totalCents items { quantity product { name } }'

const cursorAt = (offset: number) => {
  const database = new Database(databasePath, { readOnly: true })
  const row = database
    .prepare('select created_at, id from orders order by created_at desc, id desc limit 1 offset ?')
    .get(offset - 1) as { created_at: string; id: string }
  database.close()
  return encodeCursor({ createdAt: row.created_at, id: row.id })
}

const operation =
  mode === 'offset'
    ? {
        query: `query OrdersPage($offset: Int) { orders(offset: $offset) { ${fields} } }`,
        variables: { offset: depth },
      }
    : {
        query: `query OrdersPage($after: String) {
          orders(after: $after) { edges { node { ${fields} } } }
        }`,
        variables: { after: depth > 0 ? cursorAt(depth) : null },
      }

type Result = {
  latency: { p50: number; p99: number }
  requests: { average: number; total: number }
  non2xx: number
  errors: number
}

// autocannon as in the profiling example: via npx, no extra dependency for one measurement
const autocannon = () =>
  new Promise<Result>((resolve, reject) => {
    const args = ['--yes', 'autocannon@8.0.0', '--json', '-c', connections, '-d', duration]
    args.push('-m', 'POST', '-H', 'content-type: application/json')
    args.push('-b', JSON.stringify(operation), `${baseUrl}/graphql`)
    const child = spawn('npx', args, { stdio: ['ignore', 'pipe', 'ignore'] })
    let output = ''
    child.stdout.on('data', (chunk) => (output += chunk))
    child.on('error', reject)
    child.on('close', () => resolve(JSON.parse(output) as Result))
  })

const queriesSoFar = async () =>
  ((await (await fetch(`${baseUrl}/stats`)).json()) as { queries: number }).queries

const before = await queriesSoFar()
const { latency, requests, non2xx, errors } = await autocannon()
const queries = (await queriesSoFar()) - before

console.log(`${mode}, depth ${depth}, ${connections} connections, ${duration} s`)
console.log(`${Math.round(requests.average)} req/s, p50 ${latency.p50} ms, p99 ${latency.p99} ms`)
console.log(`${(queries / requests.total).toFixed(1)} queries per request`)
if (non2xx + errors > 0) console.log(`${non2xx + errors} failed requests, is the right server up?`)
