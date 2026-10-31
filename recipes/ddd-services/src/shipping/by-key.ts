// A loader answers in the order of its keys, with null where nothing was found.
export const byKey = <T>(rows: readonly T[], key: (row: T) => string, keys: readonly string[]) => {
  const found = new Map(rows.map((row) => [key(row), row]))
  return keys.map((k) => found.get(k) ?? null)
}
