import { TypeInfo, visit, visitWithTypeInfo, type DocumentNode, type GraphQLSchema } from 'graphql'
import type { Plugin } from 'graphql-yoga'
import { log } from '../src/logger.ts'

// "Client name@version" -> deprecated schema coordinates it still requests
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

// Clients identify themselves via headers, so we know whom to ask before removing a field.
export const useDeprecatedFieldUsage = (): Plugin => ({
  onExecute: ({ args, context }) => {
    const document: DocumentNode = args.document
    const schema: GraphQLSchema = args.schema
    const coordinates = findDeprecatedFields(schema, document)
    if (coordinates.size === 0) return
    const headers = context.request.headers
    const client = `${headers.get('x-client-name') ?? 'unknown'}@${headers.get('x-client-version') ?? '?'}`
    const usage = deprecatedUsage.get(client) ?? new Set<string>()
    coordinates.forEach((coordinate) => usage.add(coordinate))
    deprecatedUsage.set(client, usage)
    log.warn(`[usage] ${client} still requests ${[...coordinates].join(', ')}`)
  },
})
