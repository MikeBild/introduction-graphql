import { afterAll, expect, it } from 'vitest'
import { startInventoryService } from './inventory-service.ts'
import { createTestClient } from './test-client.ts'
import { createGateway } from './yoga.ts'

const healthy = await startInventoryService()
const broken = await startInventoryService({ failingSkus: ['MN-3'] })
afterAll(() => [healthy, broken].forEach((service) => service.close()))

const query = `query Products { products { title available } }`

it('every product triggers its own REST call (N calls for N products)', async () => {
  const result = await createTestClient(createGateway({ inventoryUrl: healthy.url }))<{
    products: { title: string; available: number }[]
  }>(query)
  expect(result.data?.products.map((product) => product.available)).toEqual([12, 0, 4])
  expect(healthy.requests.toSorted()).toEqual(['/stock/KB-1', '/stock/MN-3', '/stock/MS-2'])
})

it('one failing upstream call wipes out the whole list, and the reason is masked', async () => {
  const result = await createTestClient(createGateway({ inventoryUrl: broken.url }))(query)
  expect(result.data).toBeNull()
  expect(result.errors?.[0]?.message).toBe('Unexpected error.')
})
