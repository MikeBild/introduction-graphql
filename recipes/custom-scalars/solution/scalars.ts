import { GraphQLError, GraphQLScalarType, Kind } from 'graphql'

const ISO_DATE_TIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/

const toDate = (value: unknown): Date => {
  const date = typeof value === 'string' && ISO_DATE_TIME.test(value) ? new Date(value) : null
  if (!date || Number.isNaN(date.getTime()))
    throw new GraphQLError(
      'DateTime expects an RFC 3339 string with offset, e.g. 2026-10-01T09:00:00Z',
    )
  return date
}

// graphql 17 names: coerceOutputValue, coerceInputValue, coerceInputLiteral.
// The older serialize, parseValue and parseLiteral still work but are deprecated until v18.
export const DateTime = new GraphQLScalarType<Date, string>({
  name: 'DateTime',
  specifiedByURL: 'https://www.rfc-editor.org/rfc/rfc3339',
  coerceOutputValue: (value) => {
    if (!(value instanceof Date)) throw new GraphQLError('DateTime can only serialize Date values')
    return value.toISOString()
  },
  coerceInputValue: toDate,
  coerceInputLiteral: (ast) => toDate(ast.kind === Kind.STRING ? ast.value : null),
})
