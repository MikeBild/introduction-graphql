// Werkstatt-Shop: money is always integer cents.
export type OrderStatus = 'DRAFT' | 'PLACED' | 'PAID' | 'SHIPPED' | 'CANCELLED'
export type Customer = { id: string; name: string; email: string; phone: string; city: string }
export type Product = {
  id: string
  name: string
  description: string
  priceCents: number
  stock: number
}
export type OrderItem = { productId: string; quantity: number; priceCents: number }
export type Order = {
  id: string
  customerId: string
  items: OrderItem[]
  status: OrderStatus
  createdAt: string
}

export const customers: Customer[] = [
  {
    id: 'c-1',
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    phone: '+49 30 1234',
    city: 'Berlin',
  },
  {
    id: 'c-2',
    name: 'Alan Turing',
    email: 'alan@example.com',
    phone: '+49 40 5678',
    city: 'Hamburg',
  },
]

export const products: Product[] = [
  {
    id: 'p-1',
    name: 'Keyboard',
    description: 'Mechanical keyboard with brown switches',
    priceCents: 8900,
    stock: 12,
  },
  {
    id: 'p-2',
    name: 'Mouse',
    description: 'Wireless mouse with silent buttons',
    priceCents: 3900,
    stock: 0,
  },
  {
    id: 'p-3',
    name: 'Monitor',
    description: '27 inch 4K monitor with USB-C',
    priceCents: 34900,
    stock: 4,
  },
]

export const orders: Order[] = [
  {
    id: 'o-1',
    customerId: 'c-1',
    items: [
      { productId: 'p-1', quantity: 1, priceCents: 8900 },
      { productId: 'p-2', quantity: 2, priceCents: 3900 },
    ],
    status: 'PLACED',
    createdAt: '2026-10-01T09:00:00Z',
  },
  {
    id: 'o-2',
    customerId: 'c-2',
    items: [{ productId: 'p-3', quantity: 1, priceCents: 34900 }],
    status: 'PAID',
    createdAt: '2026-10-02T10:30:00Z',
  },
  {
    id: 'o-3',
    customerId: 'c-2',
    items: [{ productId: 'p-1', quantity: 3, priceCents: 8900 }],
    status: 'PLACED',
    createdAt: '2026-10-03T14:15:00Z',
  },
]

export const findCustomer = (customerId: string) =>
  customers.find((customer) => customer.id === customerId)
export const findProduct = (productId: string) =>
  products.find((product) => product.id === productId)
