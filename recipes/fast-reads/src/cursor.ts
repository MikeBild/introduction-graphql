// Opaque for clients: they only hand it back. It carries the sort key of the row: the date and,
// because several orders share one timestamp, the id.
export type Cursor = { createdAt: string; id: string }

export const encodeCursor = ({ createdAt, id }: Cursor) =>
  Buffer.from(JSON.stringify([createdAt, id])).toString('base64url')

export const decodeCursor = (cursor: string): Cursor | null => {
  try {
    const [createdAt, id] = JSON.parse(Buffer.from(cursor, 'base64url').toString()) as string[]
    return createdAt && id ? { createdAt, id } : null
  } catch {
    return null
  }
}
