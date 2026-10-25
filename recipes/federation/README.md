# Federation

Two subgraphs – `customers` and `orders`, each its own GraphQL Yoga server – composed into one supergraph and served by a gateway (Hive Gateway runtime). The orders subgraph only knows the customer id; the gateway fetches the name from the customers subgraph via the `Customer` entity (`@key`).

```
client -> gateway :4000 -> customers :4001
                        -> orders    :4002
```

## Setup

```sh
npm install
npm test
npm start            # gateway with GraphiQL on http://localhost:4000/graphql
```

## Exercise

1. Query `orders { id customer { name } }` through the gateway and find the `@join__field` entries in the supergraph (`composeSupergraph` returns it as SDL).
2. In `src/orders-subgraph.ts`, make `Customer` resolvable and contribute a field `Customer.orders: [Order!]!` (with `__resolveReference`) – without touching the customers subgraph.
3. Query `customers { name orders { id status } }` through the gateway and assert it in a test.
4. Break the composition on purpose (e.g. `Customer.id: Int!` in one subgraph) and read the composition errors.

Note: this recipe uses `graphql` 16, because `@apollo/subgraph` and the Hive Gateway runtime require it. The subgraphs use GraphQL Yoga 6, composition runs with `@theguild/federation-composition`.

## Solution

`solution/` contains a possible solution: `npm run start:solution`.
