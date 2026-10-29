import { afterAll, beforeEach, expect, it } from 'vitest'
import { createApp } from './app.ts'
import { database } from './schema.ts'
import { startTestServer } from './test-client.ts'

const { execute, close } = await startTestServer(await createApp())
afterAll(close)
beforeEach(() => {
  database.reads = 0
})

it('without a cache every identical request reads the database again', async () => {
  const query = `query Products { products { id name priceCents } }`
  await execute(query)
  await execute(query)
  await execute(query)
  expect(database.reads).toBe(3)
})

it('the viewer cart is private per user', async () => {
  const query = `query MyCart { me { id cart { name } } }`
  type CartData = { me: { cart: { name: string }[] } }
  const ada = await execute<CartData>(query, {}, { authorization: 'user-ada' })
  const alan = await execute<CartData>(query, {}, { authorization: 'user-alan' })
  expect(ada.data?.me.cart).toEqual([{ name: 'Hammer' }])
  expect(alan.data?.me.cart).toEqual([{ name: 'Screwdriver set' }])
})
