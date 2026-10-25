import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createTestClient } from './test-client.ts'
import { createServer } from './yoga.ts'

test('field errors arrive with HTTP 200 – the operation log counts them', async () => {
  const lines: string[] = []
  const server = createServer((line) => lines.push(line))
  const response = await server.fetch('http://localhost/graphql', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      query: `query OrdersPage { orders { id customer { name } } }`,
      operationName: 'OrdersPage',
    }),
  })
  assert.equal(response.status, 200)
  assert.match(lines[0] ?? '', /^\[graphql\] OrdersPage \d+ms errors=1$/)
})

test('a named query sent without operationName is logged as "anonymous"', async () => {
  const lines: string[] = []
  const execute = createTestClient(createServer((line) => lines.push(line)))
  await execute(`query OrdersPage { orders { id } }`)
  assert.match(lines[0] ?? '', /^\[graphql\] anonymous \d+ms errors=0$/)
})
