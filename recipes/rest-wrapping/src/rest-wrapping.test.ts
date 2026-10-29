import { afterAll, expect, it } from 'vitest'
import { createApp } from './app.ts'
import { startInventoryService } from './inventory-service.ts'
import { startTestServer } from './test-client.ts'

const healthy = await startInventoryService()
const broken = await startInventoryService({ failingIds: ['p-3'] })
const servers = [
  await startTestServer(await createApp({ inventoryUrl: healthy.url })),
  await startTestServer(await createApp({ inventoryUrl: broken.url })),
]
afterAll(async () => {
  healthy.close()
  broken.close()
  await Promise.all(servers.map((server) => server.close()))
})
const [onHealthy, onBroken] = servers.map((server) => server.execute)

const query = `query Products { products { name stock } }`

it('every product triggers its own REST call (N calls for N products)', async () => {
  const result = await onHealthy!<{ products: { name: string; stock: number }[] }>(query)
  expect(result.data?.products.map((product) => product.stock)).toEqual([12, 0, 4])
  expect(healthy.requests.toSorted()).toEqual(['/stock/p-1', '/stock/p-2', '/stock/p-3'])
})

it('one failing upstream call wipes out the whole list and leaks the upstream text', async () => {
  const result = await onBroken!(query)
  expect(result.data).toBeNull()
  expect(result.errors?.[0]?.message).toBe('Upstream 503')
  expect(result.errors?.[0]?.extensions?.code).toBe('INTERNAL_SERVER_ERROR')
})
