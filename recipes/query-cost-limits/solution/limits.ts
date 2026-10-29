import {
  GraphQLError,
  Kind,
  type ASTVisitor,
  type DocumentNode,
  type FieldNode,
  type FragmentDefinitionNode,
  type OperationDefinitionNode,
  type SelectionSetNode,
  type ValidationContext,
} from 'graphql'
import type { ApolloServerPlugin } from '@apollo/server'
import { log } from '../src/logger.ts'

type Fragments = ReadonlyMap<string, FragmentDefinitionNode>
const fragmentsOf = (document: DocumentNode): Fragments =>
  new Map(
    document.definitions
      .filter((definition) => definition.kind === Kind.FRAGMENT_DEFINITION)
      .map((fragment) => [fragment.name.value, fragment]),
  )

// Walks a selection set and calls `onField` for every field, fragments included.
const walk = (
  selectionSet: SelectionSetNode,
  fragments: Fragments,
  onField: (field: FieldNode, depth: number) => void,
  depth = 1,
  seen = new Set<string>(),
): void => {
  for (const selection of selectionSet.selections) {
    if (selection.kind === Kind.FIELD) {
      onField(selection, depth)
      if (selection.selectionSet) walk(selection.selectionSet, fragments, onField, depth + 1, seen)
    } else if (selection.kind === Kind.INLINE_FRAGMENT) {
      walk(selection.selectionSet, fragments, onField, depth, seen)
    } else if (!seen.has(selection.name.value)) {
      const fragment = fragments.get(selection.name.value)
      if (fragment)
        walk(
          fragment.selectionSet,
          fragments,
          onField,
          depth,
          new Set(seen).add(fragment.name.value),
        )
    }
  }
}

// Validation rules: they only look at the document, so Apollo may cache their result.
const operationRule =
  (check: (operation: OperationDefinitionNode, fragments: Fragments) => string | undefined) =>
  (context: ValidationContext): ASTVisitor => ({
    OperationDefinition: (operation) => {
      const message = check(operation, fragmentsOf(context.getDocument()))
      if (message) context.reportError(new GraphQLError(message, { nodes: [operation] }))
    },
  })

export const maxDepthRule = (max: number) =>
  operationRule((operation, fragments) => {
    let deepest = 0
    walk(operation.selectionSet, fragments, (_field, depth) => (deepest = Math.max(deepest, depth)))
    return deepest > max ? `Query depth limit of ${max} exceeded (found ${deepest}).` : undefined
  })

export const maxAliasesRule = (max: number) =>
  operationRule((operation, fragments) => {
    let aliases = 0
    walk(operation.selectionSet, fragments, (field) => (aliases += field.alias ? 1 : 0))
    return aliases > max ? `Aliases limit of ${max} exceeded (found ${aliases}).` : undefined
  })

// Lists cost their `first` argument (literal or variable), everything else costs 1.
const listSize = (field: FieldNode, variables: Readonly<Record<string, unknown>>) => {
  const first = field.arguments?.find((argument) => argument.name.value === 'first')?.value
  if (first?.kind === Kind.INT) return Number(first.value)
  if (first?.kind === Kind.VARIABLE) return Number(variables[first.name.value] ?? 1)
  return 1
}

const selectionCost = (
  selectionSet: SelectionSetNode,
  fragments: Fragments,
  variables: Readonly<Record<string, unknown>>,
): number =>
  selectionSet.selections.reduce((sum, selection) => {
    if (selection.kind === Kind.FIELD) {
      const children = selection.selectionSet
        ? selectionCost(selection.selectionSet, fragments, variables)
        : 0
      return sum + listSize(selection, variables) * (1 + children)
    }
    if (selection.kind === Kind.INLINE_FRAGMENT)
      return sum + selectionCost(selection.selectionSet, fragments, variables)
    const fragment = fragments.get(selection.name.value)
    return sum + (fragment ? selectionCost(fragment.selectionSet, fragments, variables) : 0)
  }, 0)

// The cost depends on variables, so it cannot be a validation rule: Apollo caches validation
// per document. didResolveOperation runs for every request, with its variables, before any resolver.
export const costLimitPlugin = ({ maxCost }: { maxCost: number }): ApolloServerPlugin => ({
  requestDidStart: async () => ({
    didResolveOperation: async ({ document, operation, request }) => {
      if (!operation) return
      const cost = selectionCost(
        operation.selectionSet,
        fragmentsOf(document),
        request.variables ?? {},
      )
      log.debug(`[cost] ${operation.name?.value ?? 'anonymous'} cost=${cost}`)
      if (cost > maxCost)
        throw new GraphQLError(`Query cost ${cost} exceeds the limit of ${maxCost}.`, {
          extensions: { code: 'QUERY_TOO_EXPENSIVE', cost, maxCost, http: { status: 400 } },
        })
    },
  }),
})
