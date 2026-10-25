import {
  GraphQLError,
  Kind,
  type DefinitionNode,
  type DocumentNode,
  type FieldNode,
  type FragmentDefinitionNode,
  type OperationDefinitionNode,
  type SelectionSetNode,
} from 'graphql'
import type { Plugin } from 'graphql-yoga'
import { log } from '../src/logger.ts'

type Variables = Readonly<Record<string, unknown>>
type Fragments = ReadonlyMap<string, FragmentDefinitionNode>

// Lists cost their `first` argument (literal or variable), everything else costs 1.
const listSize = (field: FieldNode, variables: Variables) => {
  const firstArgument = field.arguments?.find((argument) => argument.name.value === 'first')?.value
  if (firstArgument?.kind === Kind.INT) return Number(firstArgument.value)
  if (firstArgument?.kind === Kind.VARIABLE) return Number(variables[firstArgument.name.value] ?? 1)
  return 1
}

const selectionCost = (
  selectionSet: SelectionSetNode,
  fragments: Fragments,
  variables: Variables,
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

// Runs in onExecute, not as a validation rule: Yoga caches validation results per document,
// so a rule that depends on variable values would only ever see the first request's variables.
export const useCostLimit = ({ maxCost }: { maxCost: number }): Plugin => ({
  onExecute: ({ args, setResultAndStopExecution }) => {
    const document: DocumentNode = args.document
    const variables: Variables = args.variableValues ?? {}
    const fragments: Fragments = new Map(
      document.definitions
        .filter(
          (definition): definition is FragmentDefinitionNode =>
            definition.kind === Kind.FRAGMENT_DEFINITION,
        )
        .map((fragment) => [fragment.name.value, fragment]),
    )
    const isSelectedOperation = (
      definition: DefinitionNode,
    ): definition is OperationDefinitionNode =>
      definition.kind === Kind.OPERATION_DEFINITION &&
      (!args.operationName || definition.name?.value === args.operationName)
    const operation = document.definitions.find(isSelectedOperation)
    if (!operation) return
    const cost = selectionCost(operation.selectionSet, fragments, variables)
    log.debug(`[cost] ${operation.name?.value ?? 'anonymous'} cost=${cost}`)
    if (cost > maxCost)
      setResultAndStopExecution({
        errors: [
          new GraphQLError(`Query cost ${cost} exceeds the limit of ${maxCost}.`, {
            extensions: { code: 'QUERY_TOO_EXPENSIVE', cost, maxCost },
          }),
        ],
      })
  },
})
