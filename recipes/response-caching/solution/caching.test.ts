import { afterAll, beforeEach, expect, it } from 'vitest'
import { database } from '../src/schema.ts'
import { startTestServer } from '../src/test-client.ts'
import { createApp } from './app.ts'

const { url, execute, close } = await startTestServer(await createApp())
afterAll(close)
beforeEach(() => {
  database.reads = 0
})

type ProductsData = { products: { id: string; priceCents: number }[] }
type CartData = { me: { cart: { name: string }[] } }
const productsQuery = `query Products { products { id name priceCents } }`
const cartQuery = `query MyCart { me { id cart { name } } }`

it('identical requests are answered from the cache', async () => {
  await execute<ProductsData>(productsQuery)
  await execute<ProductsData>(productsQuery)
  await execute<ProductsData>(productsQuery)
  expect(database.reads).toBe(1)
})

it('the cache policy follows the hints: the shortest maxAge wins', async () => {
  const headersFor = async (query: string, headers: Record<string, string> = {}) =>
    (
      await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json', ...headers },
        body: JSON.stringify({ query }),
      })
    ).headers.get('cache-control')
  expect(await headersFor(`{ products { name } }`)).toBe('max-age=60, public')
  expect(await headersFor(`{ products { name stock } }`)).toBe('max-age=10, public')
  expect(await headersFor(cartQuery, { authorization: 'user-ada' })).toBe('max-age=30, private')
})

it('updatePrice clears the cache, so the list shows the new price', async () => {
  await execute(productsQuery)
  const readsBefore = database.reads
  await execute(`mutation Reprice { updatePrice(id: "p-1", priceCents: 1790) { id priceCents } }`)
  const afterUpdate = await execute<ProductsData>(productsQuery)
  expect(afterUpdate.data?.products[0]?.priceCents).toBe(1790)
  // Without clearing, the cached list would still say 1990 for another 60 seconds.
  expect(database.reads - readsBefore).toBe(1)
})

it('the session keeps private answers apart: Ada never sees Alan’s cart', async () => {
  // A fresh app with an empty cache, independent of the tests above.
  const fresh = await startTestServer(await createApp())
  const ada = await fresh.execute<CartData>(cartQuery, {}, { authorization: 'user-ada' })
  const alan = await fresh.execute<CartData>(cartQuery, {}, { authorization: 'user-alan' })
  const adaAgain = await fresh.execute<CartData>(cartQuery, {}, { authorization: 'user-ada' })
  await fresh.close()
  expect(ada.data?.me.cart).toEqual([{ name: 'Hammer' }])
  expect(alan.data?.me.cart).toEqual([{ name: 'Screwdriver set' }])
  expect(adaAgain.data).toEqual(ada.data)
  // Ada's second request came from her own cache entry: two reads, not three.
  expect(database.reads).toBe(2)
})
