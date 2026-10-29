import { afterAll, expect, it } from 'vitest'
import { startInventoryService } from '../src/inventory-service.ts'
import { createTestClient } from '../src/test-client.ts'
import { createGateway } from './yoga.ts'

const healthy = await startInventoryService()
const slow = await startInventoryService({ delayMs: 1_000 })
const broken = await startInventoryService({ failingSkus: ['MN-3'] })
afterAll(() => [healthy, slow, broken].forEach((service) => service.close()))

type ProductsData = { products: { title: string; available: number | null }[] }
const query = `query Products { products { title available } }`

it('DataLoader bundles all products into one REST call and forwards the token', async () => {
  const execute = createTestClient(createGateway({ inventoryUrl: healthy.url }))
  const result = await execute<ProductsData>(query, {}, { authorization: 'Bearer user-42' })
  expect(result.data?.products.map((product) => product.available)).toEqual([12, 0, 4])
  expect(healthy.requests).toEqual(['/stock?skus=KB-1%2CMS-2%2CMN-3'])
  expect(healthy.authorizations).toEqual(['Bearer user-42'])
})

it('a slow upstream costs only the nullable field, with a code in the errors field', async () => {
  const execute = createTestClient(createGateway({ inventoryUrl: slow.url }))
  const startedAt = performance.now()
  const result = await execute<ProductsData>(query)
  expect(performance.now() - startedAt < 900, 'the timeout must cut the call short').toBeTruthy()
  expect(result.data?.products[0]).toEqual({ title: 'Keyboard', available: null })
  expect(result.errors?.[0]?.extensions?.code).toBe('UPSTREAM_TIMEOUT')
})

it('upstream failures are mapped to UPSTREAM_ERROR instead of leaking upstream texts', async () => {
  const execute = createTestClient(createGateway({ inventoryUrl: broken.url }))
  const result = await execute<ProductsData>(query)
  expect(result.data?.products.length).toBe(3)
  expect(result.errors?.[0]?.message).toBe('Inventory is not available.')
  expect(result.errors?.[0]?.extensions?.code).toBe('UPSTREAM_ERROR')
})
