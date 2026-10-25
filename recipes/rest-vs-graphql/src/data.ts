export type OrderStatus = 'OPEN' | 'PAID' | 'SHIPPED'
export type Customer = {
  id: string
  name: string
  email: string
  phone: string
  street: string
  city: string
}
export type Product = {
  id: string
  title: string
  description: string
  price: number
  stock: number
}
export type OrderItem = { productId: string; quantity: number }
export type Order = {
  id: string
  status: OrderStatus
  customerId: string
  createdAt: string
  items: OrderItem[]
}

export const customers: Customer[] = [
  {
    id: 'c-1',
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    phone: '+49 30 1234',
    street: 'Main St 1',
    city: 'Berlin',
  },
  {
    id: 'c-2',
    name: 'Alan Turing',
    email: 'alan@example.com',
    phone: '+49 40 5678',
    street: 'Harbour 2',
    city: 'Hamburg',
  },
]

export const products: Product[] = [
  {
    id: 'p-1',
    title: 'Keyboard',
    description: 'Mechanical keyboard with brown switches',
    price: 89,
    stock: 12,
  },
  {
    id: 'p-2',
    title: 'Mouse',
    description: 'Wireless mouse with silent buttons',
    price: 39,
    stock: 0,
  },
  {
    id: 'p-3',
    title: 'Monitor',
    description: '27 inch 4K monitor with USB-C',
    price: 349,
    stock: 4,
  },
]

export const orders: Order[] = [
  {
    id: 'o-1',
    status: 'OPEN',
    customerId: 'c-1',
    createdAt: '2026-10-01T09:00:00Z',
    items: [
      { productId: 'p-1', quantity: 1 },
      { productId: 'p-2', quantity: 2 },
    ],
  },
  {
    id: 'o-2',
    status: 'PAID',
    customerId: 'c-2',
    createdAt: '2026-10-02T10:30:00Z',
    items: [{ productId: 'p-3', quantity: 1 }],
  },
  {
    id: 'o-3',
    status: 'OPEN',
    customerId: 'c-2',
    createdAt: '2026-10-03T14:15:00Z',
    items: [{ productId: 'p-1', quantity: 3 }],
  },
]

export const findCustomer = (customerId: string) =>
  customers.find((customer) => customer.id === customerId)
export const findProduct = (productId: string) =>
  products.find((product) => product.id === productId)
