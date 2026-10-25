import assert from 'node:assert/strict'
import { beforeEach, test } from 'node:test'
import { database } from './schema.ts'
import { createTestClient } from './test-client.ts'
import { yoga } from './yoga.ts'

const execute = createTestClient(yoga)
beforeEach(() => {
  database.reads = 0
})

test('without a cache every identical request reads the database again', async () => {
  const query = `query Products { products { id title price } }`
  await execute(query)
  await execute(query)
  await execute(query)
  assert.equal(database.reads, 3)
})

test('the viewer cart is private per user', async () => {
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
  assert.deepEqual(ada.data?.me.cart, [{ title: 'Keyboard' }])
  assert.deepEqual(alan.data?.me.cart, [{ title: 'Mouse' }])
})
