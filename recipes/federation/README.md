# Federation

Two subgraphs – `customers` and `orders`, each its own Apollo Server 5 on Express 5 – composed into one supergraph and served by Apollo Gateway. The orders subgraph only knows the customer id; the gateway fetches the name from the customers subgraph via the `Customer` entity (`@key`).

```
client -> gateway :4000 -> customers :4001
                        -> orders    :4002
```

## Setup

```sh
npm install
npm test
npm start            # Apollo Gateway with Apollo Sandbox on http://localhost:4000/graphql
```

## Exercise

1. Query `orders { id customer { name } }` through the gateway and find the `@join__field` entries in the supergraph (`composeSupergraph` returns it as SDL).
2. In `src/orders-subgraph.ts`, make `Customer` resolvable and contribute a field `Customer.orders: [Order!]!` (with `__resolveReference`) – without touching the customers subgraph.
3. Query `customers { name orders { id status } }` through the gateway and assert it in a test.
4. Break the composition on purpose (e.g. `Customer.id: Int!` in one subgraph) and read the composition errors.

Note: this recipe uses `graphql` 16, which Apollo Server 5 and `@apollo/subgraph` require. Composition runs with `@apollo/composition`, the gateway is `@apollo/gateway` – both under the Elastic License 2.0, not MIT; fine for learning and for running them yourself. In production you would compose with `rover` or GraphOS and usually run the Apollo Router instead of the Node.js gateway.

## Solution

`solution/` contains a possible solution: `npm run start:solution`.
