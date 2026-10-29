// Werkstatt-Shop: an order keeps its creation time as a Date, the customer an e-mail address.
export type Customer = { id: string; name: string; email: string }
export type Order = { id: string; customerId: string; createdAt: Date }

export const customers: Customer[] = [
  { id: 'c-1', name: 'Ada Lovelace', email: 'ada@example.com' },
  { id: 'c-2', name: 'Alan Turing', email: 'alan@example.com' },
]

export const orders: Order[] = [
  { id: 'o-1', customerId: 'c-1', createdAt: new Date('2026-10-01T09:00:00Z') },
  { id: 'o-2', customerId: 'c-2', createdAt: new Date('2026-10-05T10:30:00+02:00') },
  { id: 'o-3', customerId: 'c-1', createdAt: new Date('2026-10-09T14:15:00Z') },
]

export const findCustomer = (id: string) => customers.find((customer) => customer.id === id)

export const createdAfter = (date: Date | null | undefined) =>
  orders.filter((order) => !date || order.createdAt.getTime() > date.getTime())

export const updateEmail = (customerId: string, email: string) => {
  const customer = findCustomer(customerId)
  if (customer) customer.email = email
  return customer ?? null
}
