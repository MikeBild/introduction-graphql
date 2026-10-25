import assert from 'node:assert/strict'
import { test } from 'node:test'
import { InMemorySpanExporter } from '@opentelemetry/sdk-trace-base'
import { createTestClient } from '../src/test-client.ts'
import { operationMetrics } from './operation-log.ts'
import { createServer } from './yoga.ts'

const spanExporter = new InMemorySpanExporter()
const lines: string[] = []
const execute = createTestClient(createServer({ write: (line) => lines.push(line), spanExporter }))

test('the operation name comes from the document, even without operationName', async () => {
  await execute(`query OrdersPage { orders { id customer { name } } }`)
  assert.match(lines.at(-1) ?? '', /^\[graphql\] OrdersPage \d+ms errors=1$/)
  assert.deepEqual(
    {
      count: operationMetrics.get('OrdersPage')?.count,
      errors: operationMetrics.get('OrdersPage')?.errors,
    },
    { count: 1, errors: 1 },
  )
})

test('anonymous operations are rejected', async () => {
  const result = await execute(`{ orders { id } }`)
  assert.equal(result.errors?.[0]?.extensions?.code, 'ANONYMOUS_OPERATION')
})

test('a trace contains the operation span and spans for resolvers with own logic only', async () => {
  spanExporter.reset()
  await execute(
    `query OrdersPage($withCustomer: Boolean!) { orders { id customer @include(if: $withCustomer) { name } } }`,
    {
      withCustomer: true,
    },
  )
  const spans = spanExporter.getFinishedSpans()
  const names = spans.map((span) => span.name)
  assert.ok(names.includes('query.OrdersPage'))
  assert.deepEqual(names.filter((name) => name !== 'query.OrdersPage').toSorted(), [
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
  assert.ok(failedCustomer, 'the failing CRM call is visible in the trace')
  assert.ok(
    spans.every((span) => !('graphql.execute.variables' in span.attributes)),
    'no variables in spans',
  )
})
