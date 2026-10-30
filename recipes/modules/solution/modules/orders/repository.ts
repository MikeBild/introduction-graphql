import { db, type OrderItemRow } from '../../../src/db.ts'

// Data access only: no rule, no identity, no GraphQL.
export const findOrdersByCustomer = (customerId: string) => db.orders.findByCustomer(customerId)
export const findOrder = (id: string) => db.orders.findById(id)
export const saveOrderItems = (id: string, items: OrderItemRow[]) => db.orders.saveItems(id, items)
