export type Order = { id: string; totalCents: number; createdAt: string }

export type Store = {
  // Newest first; ties on createdAt are broken by id so the order is always unique.
  list: () => Order[]
  place: (totalCents: number) => Order
}

const byNewest = (a: Order, b: Order) =>
  b.createdAt.localeCompare(a.createdAt) || b.id.localeCompare(a.id)

export const createStore = (count = 5): Store => {
  const start = Date.parse('2026-10-01T09:00:00Z')
  let sequence = 0
  const rows: Order[] = []
  const place = (totalCents: number) => {
    sequence += 1
    const order = {
      id: `o-${String(sequence).padStart(4, '0')}`,
      totalCents,
      createdAt: new Date(start + sequence * 60_000).toISOString(),
    }
    rows.push(order)
    return order
  }
  for (let index = 1; index <= count; index++) place(index * 1290)
  return { list: () => rows.toSorted(byNewest), place }
}
