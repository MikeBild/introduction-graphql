import type { ApolloServerPlugin } from '@apollo/server'
import { ROOT_CONTEXT, SpanStatusCode, trace, type Tracer } from '@opentelemetry/api'
import { responsePathAsArray } from 'graphql'

// Schema coordinates such as "Order.customer" for every resolver you wrote yourself.
export const ownResolvers = (resolvers: Record<string, object>) =>
  new Set(
    Object.entries(resolvers).flatMap(([type, fields]) =>
      Object.keys(fields).map((field) => `${type}.${field}`),
    ),
  )

// One span per operation, child spans for resolvers with own logic only.
// No variables, no results in the spans: they may contain personal data.
export const tracingPlugin = (tracer: Tracer, traced: Set<string>): ApolloServerPlugin => ({
  requestDidStart: async () => {
    const operationSpan = tracer.startSpan('graphql.request')
    const parent = trace.setSpan(ROOT_CONTEXT, operationSpan)
    return {
      didResolveOperation: async ({ operation, operationName }) => {
        const type = operation?.operation ?? 'query'
        operationSpan.updateName(`${type}.${operationName ?? 'anonymous'}`)
        operationSpan.setAttribute('graphql.operation.name', operationName ?? 'anonymous')
        operationSpan.setAttribute('graphql.operation.type', type)
      },
      executionDidStart: async () => ({
        willResolveField: ({ info }) => {
          // Default resolvers only read a property – a span for each would be noise.
          const coordinate = `${info.parentType.name}.${info.fieldName}`
          if (!traced.has(coordinate)) return
          const span = tracer.startSpan(
            coordinate,
            { attributes: { 'graphql.field.path': responsePathAsArray(info.path).join('.') } },
            parent,
          )
          return (error) => {
            if (error) {
              span.recordException(error)
              span.setStatus({ code: SpanStatusCode.ERROR, message: error.message })
            }
            span.end()
          }
        },
      }),
      willSendResponse: async () => operationSpan.end(),
    }
  },
})
