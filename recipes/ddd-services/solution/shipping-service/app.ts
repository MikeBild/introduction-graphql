// The shipping context as its own Express 5 service: the repository moved here, the graph only calls.
import express from 'express'
import {
  findAddressesByCustomerIds,
  findShipments,
  findShipmentsByOrderIds,
} from '../../src/shipping-service/repository.ts'

const idsFrom = (value: unknown) =>
  String(value ?? '')
    .split(',')
    .filter(Boolean)

export const createShippingApp = () => {
  const app = express()
  app.disable('x-powered-by')

  app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'shipping' })
  })

  // Batch endpoints: a loader sends all ids of one request at once, so the service answers a list.
  app.get('/shipments', (req, res) => {
    const orderIds = idsFrom(req.query.orderIds)
    res.json(orderIds.length ? findShipmentsByOrderIds(orderIds) : findShipments())
  })

  app.get('/addresses', (req, res) => {
    res.json(findAddressesByCustomerIds(idsFrom(req.query.customerIds)))
  })

  return app
}
