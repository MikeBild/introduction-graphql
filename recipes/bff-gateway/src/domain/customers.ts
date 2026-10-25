export type Customer = { id: string; name: string; email: string; segment: 'B2C' | 'B2B' }

const customers: Customer[] = [
  { id: 'c-1', name: 'Ada Lovelace', email: 'ada@example.com', segment: 'B2C' },
  { id: 'c-2', name: 'Alan Turing', email: 'alan@example.com', segment: 'B2B' },
]

// Domain "customers": owned by the customer team, no GraphQL in here.
export const findCustomer = (customerId: string) =>
  customers.find((customer) => customer.id === customerId)
