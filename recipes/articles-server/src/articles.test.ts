import { afterAll, expect, it } from 'vitest'
import { createApp } from './app.ts'
import { startTestServer } from './test-client.ts'

const { execute, close } = await startTestServer(await createApp())
afterAll(close)

it('answers article(id)', async () => {
  const result = await execute<{ article: { title: string } | null }>(
    `query { article(id: "ar-1") { title } }`,
  )
  expect(result.data?.article).toEqual({ title: 'Notes on the Analytical Engine' })
})

it('Query.articles has no resolver yet: the non-null list fails', async () => {
  const result = await execute(`query { articles { id } }`)
  expect(result.status).toBe(200)
  expect(result.data).toBeNull()
  expect(result.errors?.[0]?.path).toEqual(['articles'])
  // Apollo Server passes the internal message on to the client.
  expect(result.errors?.[0]?.message).toMatch(/Cannot return null for non-nullable field/)
})
