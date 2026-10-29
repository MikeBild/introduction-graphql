import { expect, it } from 'vitest'
import { loadOperation, runOperation } from './operations.ts'
import { yoga } from './yoga.ts'

const run = runOperation(yoga)

it('OrderOverview runs with variables and the OrderRow fragment', async () => {
  const document = await loadOperation(
    new URL('../operations/order-overview.graphql', import.meta.url),
  )
  const result = await run<{ open: { id: string }[] }>(document, { first: 5 })
  expect(result.errors).toBeUndefined()
  expect(result.data?.open).toEqual([{ id: 'o-1' }, { id: 'o-3' }])
})

it('a nullable variable for a required argument fails validation before any resolver runs', async () => {
  const result = await run(`query OrderDetail($id: ID) { order(id: $id) { id } }`, { id: 'o-1' })
  expect(result.data).toBeUndefined()
  expect(result.errors?.[0]?.message ?? '').toMatch(
    /Variable "\$id" of type "ID" used in position expecting type "ID!"/,
  )
})
