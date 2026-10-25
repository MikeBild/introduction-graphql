import assert from 'node:assert/strict'
import { after, test } from 'node:test'
import { startInventoryService } from '../src/inventory-service.ts'
import { createTestClient } from '../src/test-client.ts'
import { createGateway } from './yoga.ts'

const healthy = await startInventoryService()
const slow = await startInventoryService({ delayMs: 1_000 })
const broken = await startInventoryService({ failingSkus: ['MN-3'] })
after(() => [healthy, slow, broken].forEach((service) => service.close()))

type ProductsData = { products: { title: string; available: number | null }[] }
const query = `query Products { products { title available } }`

test('DataLoader bundles all products into one REST call and forwards the token', async () => {
  const execute = createTestClient(createGateway({ inventoryUrl: healthy.url }))
  const result = await execute<ProductsData>(query, {}, { authorization: 'Bearer user-42' })
  assert.deepEqual(
    result.data?.products.map((product) => product.available),
    [12, 0, 4],
  )
  assert.deepEqual(healthy.requests, ['/stock?skus=KB-1%2CMS-2%2CMN-3'])
  assert.deepEqual(healthy.authorizations, ['Bearer user-42'])
})

test('a slow upstream costs only the nullable field, with a code in the errors field', async () => {
  const execute = createTestClient(createGateway({ inventoryUrl: slow.url }))
  const startedAt = performance.now()
  const result = await execute<ProductsData>(query)
  assert.ok(performance.now() - startedAt < 900, 'the timeout must cut the call short')
  assert.deepEqual(result.data?.products[0], { title: 'Keyboard', available: null })
  assert.equal(result.errors?.[0]?.extensions?.code, 'UPSTREAM_TIMEOUT')
})

test('upstream failures are mapped to UPSTREAM_ERROR instead of leaking upstream texts', async () => {
  const execute = createTestClient(createGateway({ inventoryUrl: broken.url }))
  const result = await execute<ProductsData>(query)
  assert.equal(result.data?.products.length, 3)
  assert.equal(result.errors?.[0]?.message, 'Inventory is not available.')
  assert.equal(result.errors?.[0]?.extensions?.code, 'UPSTREAM_ERROR')
})
