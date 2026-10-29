import { beforeEach, expect, it } from 'vitest'
import { database } from './schema.ts'
import { createTestClient } from './test-client.ts'
import { yoga } from './yoga.ts'

const execute = createTestClient(yoga)
beforeEach(() => {
  database.reads = 0
})

it('without a cache every identical request reads the database again', async () => {
  const query = `query Products { products { id title price } }`
  await execute(query)
  await execute(query)
  await execute(query)
  expect(database.reads).toBe(3)
})

it('the viewer cart is private per user', async () => {
  const query = `query MyCart { me { id cart { title } } }`
  const ada = await execute<{ me: { cart: { title: string }[] } }>(
    query,
    {},
    { authorization: 'user-ada' },
  )
  const alan = await execute<{ me: { cart: { title: string }[] } }>(
    query,
    {},
    { authorization: 'user-alan' },
  )
  expect(ada.data?.me.cart).toEqual([{ title: 'Keyboard' }])
  expect(alan.data?.me.cart).toEqual([{ title: 'Mouse' }])
})
