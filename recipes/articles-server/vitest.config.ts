import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['src/**/*.test.ts', 'solution/**/*.test.ts'],
    // LOG_LEVEL is read by src/logger.ts: keep test output quiet
    env: { LOG_LEVEL: 'warn' },
  },
})
