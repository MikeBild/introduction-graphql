import assert from 'node:assert/strict'
import { beforeEach, test } from 'node:test'
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

test('identical requests are answered from the cache', async () => {
  const first = await execute<ProductsData>(productsQuery)
  const second = await execute<ProductsData>(productsQuery)
  assert.equal(cacheHit(first.extensions), false)
  assert.equal(cacheHit(second.extensions), true)
  assert.equal(database.reads, 1)
})

test('a mutation returning a Product invalidates cached results with that product', async () => {
  await execute(productsQuery)
  await execute(`mutation Reprice { updatePrice(id: "p-1", price: 79) { id price } }`)
  const afterUpdate = await execute<ProductsData>(productsQuery)
  assert.equal(cacheHit(afterUpdate.extensions), false)
  assert.equal(afterUpdate.data?.products[0]?.price, 79)
})

test('the session keeps private answers apart', async () => {
  const query = `query MyCart { me { id cart { title } } }`
  type CartData = { me: { cart: { title: string }[] } }
  await execute<CartData>(query, {}, { authorization: 'user-ada' })
  const alan = await execute<CartData>(query, {}, { authorization: 'user-alan' })
  const adaAgain = await execute<CartData>(query, {}, { authorization: 'user-ada' })
  assert.deepEqual(alan.data?.me.cart, [{ title: 'Mouse' }])
  assert.equal(cacheHit(alan.extensions), false)
  assert.equal(cacheHit(adaAgain.extensions), true)
})
