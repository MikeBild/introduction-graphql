import assert from 'node:assert/strict'
import { after, test } from 'node:test'
import { startInventoryService } from './inventory-service.ts'
import { createTestClient } from './test-client.ts'
import { createGateway } from './yoga.ts'

const healthy = await startInventoryService()
const broken = await startInventoryService({ failingSkus: ['MN-3'] })
after(() => [healthy, broken].forEach((service) => service.close()))

const query = `query Products { products { title available } }`

test('every product triggers its own REST call (N calls for N products)', async () => {
  const result = await createTestClient(createGateway({ inventoryUrl: healthy.url }))<{
    products: { title: string; available: number }[]
  }>(query)
  assert.deepEqual(
    result.data?.products.map((product) => product.available),
    [12, 0, 4],
  )
  assert.deepEqual(healthy.requests.toSorted(), ['/stock/KB-1', '/stock/MN-3', '/stock/MS-2'])
})

test('one failing upstream call wipes out the whole list, and the reason is masked', async () => {
  const result = await createTestClient(createGateway({ inventoryUrl: broken.url }))(query)
  assert.equal(result.data, null)
  assert.equal(result.errors?.[0]?.message, 'Unexpected error.')
})
