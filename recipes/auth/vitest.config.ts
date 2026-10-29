import { defineConfig } from 'vitest/config'

// graphql 17 ships a separate "development" build. Vite would resolve it for the test files,
// while Node loads the default build for graphql-yoga: two graphql instances, failing
// instanceof checks and masked errors. Resolve with the same conditions as Node instead.
const conditions = ['module-sync', 'node', 'import', 'default']

export default defineConfig({
  ssr: { resolve: { conditions } },
  test: {
    include: ['src/**/*.test.ts', 'solution/**/*.test.ts'],
    // LOG_LEVEL is read by src/logger.ts: keep test output quiet
    env: { LOG_LEVEL: 'warn' },
  },
})
