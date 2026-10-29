import { expect, it } from 'vitest'
import { createTestClient } from './test-client.ts'
import { createServer } from './yoga.ts'

it('field errors arrive with HTTP 200 – the operation log counts them', async () => {
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
  expect(response.status).toBe(200)
  expect(lines[0] ?? '').toMatch(/^\[graphql\] OrdersPage \d+ms errors=1$/)
})

it('a named query sent without operationName is logged as "anonymous"', async () => {
  const lines: string[] = []
  const execute = createTestClient(createServer((line) => lines.push(line)))
  await execute(`query OrdersPage { orders { id } }`)
  expect(lines[0] ?? '').toMatch(/^\[graphql\] anonymous \d+ms errors=0$/)
})
