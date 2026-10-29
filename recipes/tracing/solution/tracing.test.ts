import { expect, it } from 'vitest'
import { InMemorySpanExporter } from '@opentelemetry/sdk-trace-base'
import { createTestClient } from '../src/test-client.ts'
import { operationMetrics } from './operation-log.ts'
import { createServer } from './yoga.ts'

const spanExporter = new InMemorySpanExporter()
const lines: string[] = []
const execute = createTestClient(createServer({ write: (line) => lines.push(line), spanExporter }))

it('the operation name comes from the document, even without operationName', async () => {
  await execute(`query OrdersPage { orders { id customer { name } } }`)
  expect(lines.at(-1) ?? '').toMatch(/^\[graphql\] OrdersPage \d+ms errors=1$/)
  expect({
    count: operationMetrics.get('OrdersPage')?.count,
    errors: operationMetrics.get('OrdersPage')?.errors,
  }).toEqual({ count: 1, errors: 1 })
})

it('anonymous operations are rejected', async () => {
  const result = await execute(`{ orders { id } }`)
  expect(result.errors?.[0]?.extensions?.code).toBe('ANONYMOUS_OPERATION')
})

it('a trace contains the operation span and spans for resolvers with own logic only', async () => {
  spanExporter.reset()
  await execute(
    `query OrdersPage($withCustomer: Boolean!) { orders { id customer @include(if: $withCustomer) { name } } }`,
    {
      withCustomer: true,
    },
  )
  const spans = spanExporter.getFinishedSpans()
  const names = spans.map((span) => span.name)
  expect(names.includes('query.OrdersPage')).toBeTruthy()
  expect(names.filter((name) => name !== 'query.OrdersPage').toSorted()).toEqual([
    'Order.customer',
    'Order.customer',
    'Query.orders',
  ])
  const failedCustomer = spans.find(
    (span) =>
      span.name === 'Order.customer' &&
      span.events.some(
        (event) => event.attributes?.['exception.type'] === 'graphql.resolver.exception',
      ),
  )
  expect(failedCustomer, 'the failing CRM call is visible in the trace').toBeTruthy()
  expect(
    spans.every((span) => !('graphql.execute.variables' in span.attributes)),
    'no variables in spans',
  ).toBeTruthy()
})
