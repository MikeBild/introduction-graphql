import { GraphQLError, type ValidationRule } from 'graphql'
import type { Plugin } from 'graphql-yoga'

// Depends only on the document, so it is safe with Yoga's validation cache.
const operationNameRule: ValidationRule = (context) => ({
  OperationDefinition: (operation) => {
    if (!operation.name)
      context.reportError(
        new GraphQLError('Anonymous operations are not allowed. Give your operation a name.', {
          nodes: [operation],
          extensions: { code: 'ANONYMOUS_OPERATION' },
        }),
      )
  },
})

export const useRequireOperationName = (): Plugin => ({
  onValidate: ({ addValidationRule }) => addValidationRule(operationNameRule),
})
