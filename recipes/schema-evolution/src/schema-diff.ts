import { readFile } from 'node:fs/promises'
import { CriticalityLevel, diff, type Change } from '@graphql-inspector/core'
import { buildSchema } from 'graphql'
import { log } from './logger.ts'

export const diffSchemas = async (productionSdl: string, currentSdl: string) => {
  const changes = await diff(buildSchema(productionSdl), buildSchema(currentSdl))
  const byLevel = (level: CriticalityLevel) =>
    changes.filter((change: Change) => change.criticality.level === level)
  return {
    breaking: byLevel(CriticalityLevel.Breaking),
    dangerous: byLevel(CriticalityLevel.Dangerous),
    safe: byLevel(CriticalityLevel.NonBreaking),
  }
}

// CLI for CI: node src/schema-diff.ts [production.graphql] [current.graphql]
if (import.meta.main) {
  const [productionPath = 'schema/production.graphql', currentPath = 'schema/current.graphql'] =
    process.argv.slice(2)
  const result = await diffSchemas(
    await readFile(productionPath, 'utf8'),
    await readFile(currentPath, 'utf8'),
  )
  result.safe.forEach((change) => log.info(`[schema] safe       ${change.message}`))
  result.dangerous.forEach((change) => log.warn(`[schema] dangerous  ${change.message}`))
  result.breaking.forEach((change) => log.error(`[schema] BREAKING   ${change.message}`))
  log.info(
    `[schema] ${result.breaking.length} breaking, ${result.dangerous.length} dangerous, ${result.safe.length} safe`,
  )
  process.exitCode = result.breaking.length > 0 ? 1 : 0
}
