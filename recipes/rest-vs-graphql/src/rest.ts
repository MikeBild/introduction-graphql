import { Router } from 'express'
import { customers, findCustomer, orders, products } from './data.ts'
import { log } from './logger.ts'

// A classic resource API: fixed endpoints, full objects, one resource per URL.
export const restRouter = Router()
  .use((req, _res, next) => {
    log.debug(`[rest] ${req.method} ${req.originalUrl}`)
    next()
  })
  .get('/orders', (req, res) => {
    const status = req.query.status
    res.json(status ? orders.filter((order) => order.status === status) : orders)
  })
  .get('/customers', (_req, res) => {
    res.json(customers)
  })
  .get('/customers/:id', (req, res) => {
    const customer = findCustomer(req.params.id)
    if (customer) res.json(customer)
    else res.status(404).json({ message: 'Customer not found' })
  })
  .get('/products', (req, res) => {
    const ids = typeof req.query.ids === 'string' ? req.query.ids.split(',') : []
    res.json(ids.length ? products.filter((product) => ids.includes(product.id)) : products)
  })
