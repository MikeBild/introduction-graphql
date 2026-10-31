type ResolverMap = Record<string, Record<string, unknown>>

// Apollo Server also accepts an array of resolver maps, but there the last module wins silently.
export const mergeResolvers = (...modules: ResolverMap[]): ResolverMap => {
  const merged: ResolverMap = {}
  for (const module of modules) {
    for (const [type, fields] of Object.entries(module)) {
      merged[type] ??= {}
      for (const [field, resolver] of Object.entries(fields)) {
        if (Object.hasOwn(merged[type], field))
          throw new Error(`Two modules define the resolver ${type}.${field}`)
        merged[type][field] = resolver
      }
    }
  }
  return merged
}
