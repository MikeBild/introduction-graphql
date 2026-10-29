// Roles come from the identity provider, e.g. as a claim in the access token.
export type User = { id: string; roles: string[] }
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

// A stand-in for real token verification (exercise 2 replaces it with jose):
// maps a fixed bearer token to a user, or null.
const tokens = new Map<string, User>([
  ['token-ada', { id: 'c-1', roles: ['CUSTOMER'] }],
  ['token-grace', { id: 'c-2', roles: ['CUSTOMER'] }],
  ['token-support', { id: 'u-1', roles: ['SUPPORT'] }],
])

export const verifyToken = async (authorization: string | null): Promise<User | null> => {
  const token = authorization?.match(/^Bearer (.+)$/)?.[1]
  return (token && tokens.get(token)) || null
}
