// The shipping context as its own Express 5 service. Today the graph still reads the repository
// in-process; your job is to put this HTTP API in between.
import express from 'express'
import { findShipments } from './repository.ts'

export const createShippingApp = () => {
  const app = express()
  app.disable('x-powered-by')

  app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'shipping' })
  })

  // TODO: GET /shipments?orderIds=o-1,o-2 answers the whole batch of a loader; without the parameter all shipments.
  app.get('/shipments', (req, res) => {
    res.json(findShipments())
  })

  // TODO: GET /addresses?customerIds=c-1,c-2

  return app
}
