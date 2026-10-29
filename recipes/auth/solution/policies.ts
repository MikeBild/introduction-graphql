import { GraphQLError } from 'graphql'
import type { Customer, Order, User } from '../src/data.ts'

// Business rules for access – every path in the graph asks the same functions.

export const requireUser = (user: User | null): User => {
  if (!user)
    throw new GraphQLError('Not authenticated', { extensions: { code: 'UNAUTHENTICATED' } })
  return user
}

export const requireRole = (user: User | null, role: string): User => {
  const known = requireUser(user)
  if (!known.roles.includes(role))
    throw new GraphQLError('Not allowed', { extensions: { code: 'FORBIDDEN' } })
  return known
}

export const canSeeOrder = (user: User, order: Order) =>
  order.customerId === user.id || user.roles.includes('SUPPORT')

export const canSeeContactData = (user: User | null, _customer: Customer) =>
  !!user?.roles.includes('SUPPORT')
