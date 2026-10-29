import { expect, it } from 'vitest'
import { createTestClient } from './test-client.ts'
import { yoga } from './yoga.ts'

const execute = createTestClient(yoga)

it('answers article(id)', async () => {
  const result = await execute<{ article: { title: string } | null }>(
    `query { article(id: "ar-1") { title } }`,
  )
  expect(result.data?.article).toEqual({ title: 'Notes on the Analytical Engine' })
})

it('Query.articles has no resolver yet: the non-null list fails', async () => {
  const result = await execute(`query { articles { id } }`)
  expect(result.data).toBeNull()
  expect(result.errors?.[0]?.path).toEqual(['articles'])
  // Yoga masks the internal message ("Cannot return null for non-nullable field"), see the log.
  expect(result.errors?.[0]?.message).toBe('Unexpected error.')
})
