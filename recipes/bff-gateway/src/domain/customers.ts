export type Customer = { id: string; name: string; email: string }

const customers: Customer[] = [
  { id: 'c-1', name: 'Ada Lovelace', email: 'ada@example.com' },
  { id: 'c-2', name: 'Grace Hopper', email: 'grace@example.com' },
]

// Domain "customers": owned by the customer team, no GraphQL in here.
export const findCustomer = (customerId: string) =>
  customers.find((customer) => customer.id === customerId)
