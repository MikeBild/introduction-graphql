import { readFile } from 'node:fs/promises'
import { expect, it } from 'vitest'
import { diffSchemas } from './schema-diff.ts'
import { createTestClient } from './test-client.ts'
import { yoga } from './yoga.ts'

const productionSdl = await readFile(
  new URL('../schema/production.graphql', import.meta.url),
  'utf8',
)
const currentSdl = await readFile(new URL('../schema/current.graphql', import.meta.url), 'utf8')

it('the working copy only adds – no breaking change against production', async () => {
  const result = await diffSchemas(productionSdl, currentSdl)
  expect(result.breaking).toEqual([])
  expect(result.safe.map((change) => change.message)).toEqual([
    "Field 'placedAt' was added to object type 'Order'",
  ])
})

it('renaming a field "because the name is nicer" breaks every client that uses it', async () => {
  const renamed = productionSdl.replace('total: Float!', 'grandTotal: Float!')
  const result = await diffSchemas(productionSdl, renamed)
  expect(result.breaking.map((change) => change.message)).toEqual([
    "Field 'total' was removed from object type 'Order'",
  ])
})

it('the server answers with the current schema', async () => {
  const result = await createTestClient(yoga)(`query Orders { orders { id total } }`)
  expect(result.data).toEqual({
    orders: [
      { id: 'o-1', total: 167 },
      { id: 'o-2', total: 349 },
    ],
  })
})
