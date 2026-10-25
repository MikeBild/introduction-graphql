import { createHash } from 'node:crypto'
import { writeFile } from 'node:fs/promises'
import { log } from '../src/logger.ts'

// In a real project the client build (e.g. GraphQL Codegen) produces this list.
const operations = [
  'query OrdersPage { orders(first: 20) { id status customer { name } } }',
  'query CustomerOrders { orders(first: 5) { customer { name orders(first: 5) { id status } } } }',
]

const hash = (document: string) => createHash('sha256').update(document).digest('hex')
const manifest = Object.fromEntries(operations.map((document) => [hash(document), document]))

await writeFile(
  new URL('../persisted-documents.json', import.meta.url),
  JSON.stringify(manifest, null, 2) + '\n',
)
log.info(`[manifest] wrote ${operations.length} persisted operations`)
