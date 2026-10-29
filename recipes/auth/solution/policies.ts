import { GraphQLError } from 'graphql'
import type { Customer, Order, User } from '../src/data.ts'

// Business rules for access – every path in the graph asks the same functions.

export const requireUser = (user: User | null): User => {
  if (!user)
    throw new GraphQLError('Not authenticated', { extensions: { code: 'UNAUTHENTICATED' } })
  return user
}

export const requireRole = (user: User | null, role: User['role']): User => {
  const known = requireUser(user)
  if (known.role !== role)
    throw new GraphQLError('Not allowed', { extensions: { code: 'FORBIDDEN' } })
  return known
}

export const canSeeOrder = (user: User, order: Order) =>
  user.role === 'SUPPORT' || order.customerId === user.id

export const canSeeContactData = (user: User | null, _customer: Customer) =>
  user?.role === 'SUPPORT'
