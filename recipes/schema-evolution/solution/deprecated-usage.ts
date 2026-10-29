import type { ApolloServerPlugin } from '@apollo/server'
import { TypeInfo, visit, visitWithTypeInfo, type DocumentNode, type GraphQLSchema } from 'graphql'
import { log } from '../src/logger.ts'

// "client name@version" -> deprecated schema coordinates it still requests
export const deprecatedUsage = new Map<string, Set<string>>()

const findDeprecatedFields = (schema: GraphQLSchema, document: DocumentNode) => {
  const typeInfo = new TypeInfo(schema)
  const coordinates = new Set<string>()
  visit(
    document,
    visitWithTypeInfo(typeInfo, {
      Field: () => {
        const field = typeInfo.getFieldDef()
        const parentType = typeInfo.getParentType()
        if (field?.deprecationReason && parentType)
          coordinates.add(`${parentType.name}.${field.name}`)
      },
    }),
  )
  return coordinates
}

// Clients identify themselves with Apollo's client awareness headers, so we know
// whom to ask before removing a field.
export const deprecatedFieldUsagePlugin = (): ApolloServerPlugin => ({
  requestDidStart: async () => ({
    didResolveOperation: async ({ document, schema, request }) => {
      const coordinates = findDeprecatedFields(schema, document)
      if (coordinates.size === 0) return
      const headers = request.http?.headers
      const client = `${headers?.get('apollographql-client-name') ?? 'unknown'}@${headers?.get('apollographql-client-version') ?? '?'}`
      const usage = deprecatedUsage.get(client) ?? new Set<string>()
      coordinates.forEach((coordinate) => usage.add(coordinate))
      deprecatedUsage.set(client, usage)
      log.warn(`[usage] ${client} still requests ${[...coordinates].join(', ')}`)
    },
  }),
})
