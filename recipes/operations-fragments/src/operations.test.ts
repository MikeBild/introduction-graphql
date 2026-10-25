import assert from 'node:assert/strict'
import { test } from 'node:test'
import { loadOperation, runOperation } from './operations.ts'
import { yoga } from './yoga.ts'

const run = runOperation(yoga)

test('OrderOverview runs with variables and the OrderRow fragment', async () => {
  const document = await loadOperation(
    new URL('../operations/order-overview.graphql', import.meta.url),
  )
  const result = await run<{ open: { id: string }[] }>(document, { first: 5 })
  assert.equal(result.errors, undefined)
  assert.deepEqual(result.data?.open, [{ id: 'o-1' }, { id: 'o-3' }])
})

test('a nullable variable for a required argument fails validation before any resolver runs', async () => {
  const result = await run(`query OrderDetail($id: ID) { order(id: $id) { id } }`, { id: 'o-1' })
  assert.equal(result.data, undefined)
  assert.match(
    result.errors?.[0]?.message ?? '',
    /Variable "\$id" of type "ID" used in position expecting type "ID!"/,
  )
})
