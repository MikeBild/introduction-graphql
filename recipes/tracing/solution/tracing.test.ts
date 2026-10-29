import { InMemorySpanExporter } from '@opentelemetry/sdk-trace-base'
import { SpanStatusCode } from '@opentelemetry/api'
import { afterAll, expect, it } from 'vitest'
import { startTestServer } from '../src/test-client.ts'
import { createApp } from './app.ts'
import { operationMetrics } from './operation-log.ts'

const spanExporter = new InMemorySpanExporter()
const lines: string[] = []
const { execute, close } = await startTestServer(
  await createApp({ write: (line) => lines.push(line), spanExporter }),
)
afterAll(close)

it('the operation name comes from the document, even without operationName', async () => {
  await execute(`query OrdersPage { orders { id customer { name } } }`)
  expect(lines.at(-1) ?? '').toMatch(/^\[graphql\] OrdersPage \d+ms errors=1$/)
  expect({
    count: operationMetrics.get('OrdersPage')?.count,
    errors: operationMetrics.get('OrdersPage')?.errors,
  }).toEqual({ count: 1, errors: 1 })
})

it('anonymous operations are rejected before execution', async () => {
  const result = await execute(`{ orders { id } }`)
  expect(result.status).toBe(400)
  expect(result.errors?.[0]?.extensions?.code).toBe('ANONYMOUS_OPERATION')
})

it('a trace contains the operation span and spans for resolvers with own logic only', async () => {
  spanExporter.reset()
  await execute(
    `query OrdersPage($withCustomer: Boolean!) { orders { id customer @include(if: $withCustomer) { name } } }`,
    { withCustomer: true },
  )
  const spans = spanExporter.getFinishedSpans()
  const names = spans.map((span) => span.name)
  expect(names).toContain('query.OrdersPage')
  expect(names.filter((name) => name !== 'query.OrdersPage').toSorted()).toEqual([
    'Order.customer',
    'Order.customer',
    'Query.orders',
  ])
  const operation = spans.find((span) => span.name === 'query.OrdersPage')
  expect(
    spans
      .filter((span) => span !== operation)
      .every((span) => span.parentSpanContext?.spanId === operation?.spanContext().spanId),
    'resolver spans are children of the operation span',
  ).toBeTruthy()
})

it('finds the failing CRM call as an error span with its path', async () => {
  spanExporter.reset()
  await execute(`query OrdersPage { orders { id customer { name } } }`)
  const failed = spanExporter
    .getFinishedSpans()
    .filter((span) => span.status.code === SpanStatusCode.ERROR)
  expect(failed.map((span) => [span.name, span.attributes['graphql.field.path']])).toEqual([
    ['Order.customer', 'orders.1.customer'],
  ])
  expect(failed[0]?.events[0]?.attributes?.['exception.message']).toBe('CRM service unavailable')
  expect(
    failed.every((span) => Object.keys(span.attributes).every((key) => !key.includes('variables'))),
    'no variables in spans',
  ).toBeTruthy()
})
