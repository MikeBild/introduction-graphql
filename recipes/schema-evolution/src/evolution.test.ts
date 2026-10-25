import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import { diffSchemas } from './schema-diff.ts'
import { createTestClient } from './test-client.ts'
import { yoga } from './yoga.ts'

const productionSdl = await readFile(
  new URL('../schema/production.graphql', import.meta.url),
  'utf8',
)
const currentSdl = await readFile(new URL('../schema/current.graphql', import.meta.url), 'utf8')

test('the working copy only adds – no breaking change against production', async () => {
  const result = await diffSchemas(productionSdl, currentSdl)
  assert.deepEqual(result.breaking, [])
  assert.deepEqual(
    result.safe.map((change) => change.message),
    ["Field 'placedAt' was added to object type 'Order'"],
  )
})

test('renaming a field "because the name is nicer" breaks every client that uses it', async () => {
  const renamed = productionSdl.replace('total: Float!', 'grandTotal: Float!')
  const result = await diffSchemas(productionSdl, renamed)
  assert.deepEqual(
    result.breaking.map((change) => change.message),
    ["Field 'total' was removed from object type 'Order'"],
  )
})

test('the server answers with the current schema', async () => {
  const result = await createTestClient(yoga)(`query Orders { orders { id total } }`)
  assert.deepEqual(result.data, {
    orders: [
      { id: 'o-1', total: 167 },
      { id: 'o-2', total: 349 },
    ],
  })
})
