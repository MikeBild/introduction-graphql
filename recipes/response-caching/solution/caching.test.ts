import { beforeEach, expect, it } from 'vitest'
import { database } from '../src/schema.ts'
import { createTestClient } from '../src/test-client.ts'
import { yoga } from './yoga.ts'

const execute = createTestClient(yoga)
beforeEach(() => {
  database.reads = 0
})

type ProductsData = { products: { id: string; price: number }[] }
const productsQuery = `query Products { products { id title price } }`
const cacheHit = (extensions: Record<string, unknown> | undefined) =>
  (extensions?.responseCache as { hit?: boolean } | undefined)?.hit

it('identical requests are answered from the cache', async () => {
  const first = await execute<ProductsData>(productsQuery)
  const second = await execute<ProductsData>(productsQuery)
  expect(cacheHit(first.extensions)).toBe(false)
  expect(cacheHit(second.extensions)).toBe(true)
  expect(database.reads).toBe(1)
})

it('a mutation returning a Product invalidates cached results with that product', async () => {
  await execute(productsQuery)
  await execute(`mutation Reprice { updatePrice(id: "p-1", price: 79) { id price } }`)
  const afterUpdate = await execute<ProductsData>(productsQuery)
  expect(cacheHit(afterUpdate.extensions)).toBe(false)
  expect(afterUpdate.data?.products[0]?.price).toBe(79)
})

it('the session keeps private answers apart', async () => {
  const query = `query MyCart { me { id cart { title } } }`
  type CartData = { me: { cart: { title: string }[] } }
  await execute<CartData>(query, {}, { authorization: 'user-ada' })
  const alan = await execute<CartData>(query, {}, { authorization: 'user-alan' })
  const adaAgain = await execute<CartData>(query, {}, { authorization: 'user-ada' })
  expect(alan.data?.me.cart).toEqual([{ title: 'Mouse' }])
  expect(cacheHit(alan.extensions)).toBe(false)
  expect(cacheHit(adaAgain.extensions)).toBe(true)
})
