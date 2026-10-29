import { createRequire } from 'node:module'
import { defineConfig } from 'vitest/config'

// graphql 16 has no exports map: Vite would load its ESM build (index.mjs) for the test files,
// while Node loads the CommonJS build (index.js) for Apollo Server and other dependencies.
// Two graphql instances fail with "Cannot use GraphQLObjectType from another module or realm".
// So the test files get the same file Node picks.
const graphql = createRequire(import.meta.url).resolve('graphql')

export default defineConfig({
  resolve: { alias: [{ find: /^graphql$/, replacement: graphql }] },
  test: {
    include: ['src/**/*.test.ts', 'solution/**/*.test.ts'],
    // LOG_LEVEL is read by src/logger.ts: keep test output quiet
    env: { LOG_LEVEL: 'warn' },
  },
})
