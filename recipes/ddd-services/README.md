# The graph stays, services grow behind it

The workshop shop graph from the recipe [`ddd`](../ddd/README.md) with both modules connected: `src/orders` (sales, trimmed to its queries) and `src/shipping`. Every module owns its schema, its resolvers and its loaders, and other modules reach it only through ids and loaders.

Schema, module and bounded context share one boundary. In this recipe the module `shipping` becomes its own Express 5 service: the repository stays in the service, the loader in the graph calls it over HTTP, the schema does not change, and the clients of the graph notice nothing.

Today the shipping data still lives in the same process: `src/shipping/loaders.ts` and `src/shipping/resolvers.ts` import `src/shipping-service/repository.ts` directly. The folder `src/shipping-service` is the service to be: an Express 5 app with a health check and a list of all shipments, nothing else. `src/ddd-services.test.ts` documents the crossing import; it passes for the wrong reason.

```
                  before                          after
client ──> graph ─┬─ orders:   loader ─> repo     graph ─┬─ orders:   loader ─> repo
                  └─ shipping: loader ─> repo           └─ shipping: loader ─> fetch ──> shipping service ─> repo
```

| Aspect        | Module in the graph        | Own service                            |
| ------------- | -------------------------- | -------------------------------------- |
| Boundary      | folder, test in the build  | network, contract                      |
| Data          | own tables                 | own database                           |
| Call          | loader → repository        | loader → fetch with timeout, one batch |
| Failure       | exception in the process   | `null` in the field, entry in `errors` |
| Deployment    | with the graph             | own cadence, own monitoring            |
| Worth it when | one team, one load profile | own team, or own load or runtime       |

## Setup

```sh
npm install
npm test
npm start                  # graph with Apollo Sandbox on http://localhost:4000/graphql
npm run start:shipping     # the shipping service on http://localhost:4001 (solution: SHIPPING_URL for the graph)
```

## Exercise

**The service**

1. In `src/shipping-service/app.ts`, add `GET /shipments?orderIds=o-1,o-2` (without the parameter: all shipments) and `GET /addresses?customerIds=c-1,c-2`. Both answer with a list of the rows they find, nothing for unknown ids. A loader sends its whole batch in one request, so the service answers a batch.

**The client in the graph**

2. Write `src/shipping/client.ts` with `createShippingClient(baseUrl)`: `shipments()`, `shipmentsByOrderIds(ids)` and `addressesByCustomerIds(ids)`, each a `fetch` with `AbortSignal.timeout` and a status check. Declare the row types there: they are the published part of the service's contract, the graph never imports from the service.
3. Change `createLoaders(client)` in `src/shipping/loaders.ts`: the body of each loader calls the client and maps the rows back to the ids with `byKey`. The signature stays. `Query.shipments` takes the client from the context. Delete every import of `shipping-service` from `src/shipping`.
4. `createApp({ shippingUrl })` creates the client once and puts `loaders` and `shipping` into every context. `src/server.ts` reads `SHIPPING_URL`.

**The tests**

5. Start the service with `startService(createShippingApp())` on port 0 and pass its URL to `createApp`. The three client tests stay exactly as they are, only the setup changes.
6. Replace the `it.todo` entries with tests for the two batch endpoints, for a graph whose service is down (`shipment` is `null`, the order is still there, one entry in `errors`), and for the boundary: no file in `src/shipping` mentions `shipping-service`.

## When to take this step

A service costs a network hop, a timeout, a deployment and a monitor. Take the step when an own team deploys the context at its own cadence, or when the context needs a different load profile or runtime. Otherwise the module stays in the process, with its boundary under test. Federation carries the same cut across deployments: every subgraph is a bounded context.

## Solution

`solution/` contains a possible solution: `npm run start:solution:shipping` in one terminal, `npm run start:solution` in another.
