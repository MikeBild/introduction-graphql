// The workshop shop: orders move DRAFT → PLACED → PAID → SHIPPED. Money in whole cents.
export type OrderStatus = 'DRAFT' | 'PLACED' | 'PAID' | 'SHIPPED' | 'CANCELLED'
export type Order = { id: string; customerId: string; status: OrderStatus; totalCents: number }

export const createOrders = () => {
  const orders: Order[] = [
    { id: 'o-1', customerId: 'c-1', status: 'PLACED', totalCents: 2580 },
    { id: 'o-2', customerId: 'c-2', status: 'PLACED', totalCents: 2490 },
  ]
  const find = (id: string) => orders.find((order) => order.id === id)

  // One step along the status flow – or an error that names the rule.
  const move = (id: string, from: OrderStatus, to: OrderStatus) => {
    const order = find(id)
    if (!order) throw new Error(`Order ${id} not found`)
    if (order.status !== from) throw new Error(`Only ${from} orders can become ${to}`)
    order.status = to
    return order
  }

  return {
    find,
    pay: (id: string) => move(id, 'PLACED', 'PAID'),
    ship: (id: string) => move(id, 'PAID', 'SHIPPED'),
  }
}

export type Orders = ReturnType<typeof createOrders>
