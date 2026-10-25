import { customers, findCustomer, orders, products } from './data.ts'
import { log } from './logger.ts'

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } })

// A classic resource API: fixed endpoints, full objects, one resource per URL.
export const restHandler = async (request: Request): Promise<Response> => {
  const { pathname, searchParams } = new URL(request.url)
  log.debug(`[rest] ${request.method} ${pathname}${searchParams.size ? `?${searchParams}` : ''}`)

  if (pathname === '/orders') {
    const status = searchParams.get('status')
    return json(status ? orders.filter((order) => order.status === status) : orders)
  }
  const customerMatch = pathname.match(/^\/customers\/([\w-]+)$/)
  if (customerMatch) {
    const customer = findCustomer(customerMatch[1] ?? '')
    return customer ? json(customer) : json({ message: 'Customer not found' }, 404)
  }
  if (pathname === '/customers') return json(customers)
  if (pathname === '/products') {
    const productIds = searchParams.get('ids')?.split(',') ?? []
    return json(
      productIds.length ? products.filter((product) => productIds.includes(product.id)) : products,
    )
  }
  return json({ message: 'Not found' }, 404)
}
