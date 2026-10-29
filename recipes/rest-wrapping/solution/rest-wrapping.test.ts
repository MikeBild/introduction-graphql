import { afterAll, expect, it } from 'vitest'
import { startInventoryService } from '../src/inventory-service.ts'
import { startTestServer } from '../src/test-client.ts'
import { createApp } from './app.ts'

const healthy = await startInventoryService()
const slow = await startInventoryService({ delayMs: 1_000 })
const broken = await startInventoryService({ failingIds: ['p-3'] })
const servers = await Promise.all(
  [healthy, slow, broken].map(async (service) =>
    startTestServer(await createApp({ inventoryUrl: service.url })),
  ),
)
afterAll(async () => {
  ;[healthy, slow, broken].forEach((service) => service.close())
  await Promise.all(servers.map((server) => server.close()))
})
const [onHealthy, onSlow, onBroken] = servers.map((server) => server.execute)

type ProductsData = { products: { name: string; stock: number | null }[] }
const query = `query Products { products { name stock } }`

it('DataLoader bundles all products into one REST call and forwards the token', async () => {
  const result = await onHealthy!<ProductsData>(query, {}, { authorization: 'Bearer user-42' })
  expect(result.data?.products.map((product) => product.stock)).toEqual([12, 0, 4])
  expect(healthy.requests).toEqual(['/stock?ids=p-1,p-2,p-3'])
  expect(healthy.authorizations).toEqual(['Bearer user-42'])
})

it('a slow upstream costs only the nullable field, with a code in the errors field', async () => {
  const startedAt = performance.now()
  const result = await onSlow!<ProductsData>(query)
  expect(performance.now() - startedAt < 900, 'the timeout must cut the call short').toBeTruthy()
  expect(result.data?.products[0]).toEqual({ name: 'Hammer', stock: null })
  expect(result.errors?.[0]?.extensions?.code).toBe('UPSTREAM_TIMEOUT')
})

it('upstream failures are mapped to UPSTREAM_ERROR instead of leaking upstream texts', async () => {
  const result = await onBroken!<ProductsData>(query)
  expect(result.data?.products.length).toBe(3)
  expect(result.errors?.[0]?.message).toBe('Inventory is not available.')
  expect(result.errors?.[0]?.extensions?.code).toBe('UPSTREAM_ERROR')
})
