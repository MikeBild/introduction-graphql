import { readFile } from 'node:fs/promises'
import { afterAll, expect, it } from 'vitest'
import { createApp } from './app.ts'
import { diffSchemas } from './schema-diff.ts'
import { startTestServer } from './test-client.ts'

const productionSdl = await readFile(
  new URL('../schema/production.graphql', import.meta.url),
  'utf8',
)
const currentSdl = await readFile(new URL('../schema/current.graphql', import.meta.url), 'utf8')
const { execute, close } = await startTestServer(await createApp())
afterAll(close)

it('the working copy only adds – no breaking change against production', async () => {
  const result = await diffSchemas(productionSdl, currentSdl)
  expect(result.breaking).toEqual([])
  expect(result.safe.map((change) => change.message)).toEqual([
    "Field 'createdAt' was added to object type 'Order'",
  ])
})

it('renaming a field "because the name is nicer" breaks every client that uses it', async () => {
  const renamed = productionSdl.replace('total: Int!', 'grandTotal: Int!')
  const result = await diffSchemas(productionSdl, renamed)
  expect(result.breaking.map((change) => change.message)).toEqual([
    "Field 'total' was removed from object type 'Order'",
  ])
})

it('the server answers with the current schema, totals in cents', async () => {
  const result = await execute(`query Orders { orders { id total } }`)
  expect(result.data).toEqual({
    orders: [
      { id: 'o-1', total: 2580 },
      { id: 'o-2', total: 3780 },
    ],
  })
})
