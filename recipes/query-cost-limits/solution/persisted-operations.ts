import type { RequestHandler } from 'express'

type Options = {
  manifest: Readonly<Record<string, string>>
  allowArbitraryOperations: (request: Parameters<RequestHandler>[0]) => boolean
}

const reject = (code: string, message: string) => ({ errors: [{ message, extensions: { code } }] })

// Express middleware in front of Apollo Server: own clients send only the hash of an operation
// from the manifest (an allowlist), partners with a key may send their own queries.
export const persistedOperations =
  ({ manifest, allowArbitraryOperations }: Options): RequestHandler =>
  (req, res, next) => {
    const hash = req.body?.extensions?.persistedQuery?.sha256Hash
    if (typeof hash === 'string') {
      const query = manifest[hash]
      if (!query) {
        res.status(400).json(reject('PERSISTED_QUERY_NOT_IN_LIST', 'Unknown persisted operation.'))
        return
      }
      const { persistedQuery: _persistedQuery, ...extensions } = req.body.extensions
      req.body = { ...req.body, query, extensions }
      next()
      return
    }
    if (allowArbitraryOperations(req)) {
      next()
      return
    }
    res.status(400).json(reject('PERSISTED_QUERY_ONLY', 'Only persisted operations are allowed.'))
  }
