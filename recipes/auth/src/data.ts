export type Role = 'CUSTOMER' | 'SUPPORT'
export type User = { id: string; role: Role }
export type Customer = { id: string; name: string; email: string }
export type Order = { id: string; totalCents: number; customerId: string }

export const customers: Customer[] = [
  { id: 'c-1', name: 'Ada Lovelace', email: 'ada@example.com' },
  { id: 'c-2', name: 'Grace Hopper', email: 'grace@example.com' },
]

export const orders: Order[] = [
  { id: 'o-1', totalCents: 2580, customerId: 'c-1' },
  { id: 'o-2', totalCents: 2490, customerId: 'c-2' },
  { id: 'o-3', totalCents: 18900, customerId: 'c-1' },
]

export const findCustomer = (id: string) => customers.find((customer) => customer.id === id)

// Stands in for JWT or session verification: maps a bearer token to a user, or null.
const tokens = new Map<string, User>([
  ['token-ada', { id: 'c-1', role: 'CUSTOMER' }],
  ['token-grace', { id: 'c-2', role: 'CUSTOMER' }],
  ['token-support', { id: 'u-1', role: 'SUPPORT' }],
])

export const verifyToken = async (authorization: string | null): Promise<User | null> => {
  const token = authorization?.match(/^Bearer (.+)$/)?.[1]
  return (token && tokens.get(token)) || null
}
