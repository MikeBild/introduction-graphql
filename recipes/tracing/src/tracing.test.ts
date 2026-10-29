import { afterAll, expect, it } from 'vitest'
import { createApp } from './app.ts'
import { startTestServer } from './test-client.ts'

const lines: string[] = []
const { url, execute, close } = await startTestServer(await createApp((line) => lines.push(line)))
afterAll(close)

it('field errors arrive with HTTP 200 – the operation log counts them', async () => {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      query: `query OrdersPage { orders { id customer { name } } }`,
      operationName: 'OrdersPage',
    }),
  })
  expect(response.status).toBe(200)
  expect(lines.at(-1) ?? '').toMatch(/^\[graphql\] OrdersPage \d+ms errors=1$/)
})

it('a named query sent without operationName is logged as "anonymous"', async () => {
  await execute(`query OrdersPage { orders { id } }`)
  expect(lines.at(-1) ?? '').toMatch(/^\[graphql\] anonymous \d+ms errors=0$/)
})
