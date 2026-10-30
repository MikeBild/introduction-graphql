import { expect, it } from 'vitest'
import { mergeResolvers } from './merge-resolvers.ts'

it('combines the fields of a type from several modules', () => {
  const orders = { Query: { orders: () => [] } }
  const products = { Query: { products: () => [] }, Product: { inStock: () => true } }
  const merged = mergeResolvers(orders, products)
  expect(Object.keys(merged.Query)).toEqual(['orders', 'products'])
  expect(Object.keys(merged.Product)).toEqual(['inStock'])
})

it('throws when two modules define the same Query field', () => {
  const orders = { Query: { catalog: () => 'from orders' } }
  const products = { Query: { catalog: () => 'from products' } }
  expect(() => mergeResolvers(orders, products)).toThrow(
    'Two modules define the resolver Query.catalog',
  )
})
