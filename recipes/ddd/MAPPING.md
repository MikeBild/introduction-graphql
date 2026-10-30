# From the domain to the schema

Fill in the last column for the workshop shop, the first row of each kind is done. The mapping is a reading that helps you design, not a standard: no large public schema calls itself DDD.

| DDD term                   | In the shop               | In the schema                                  |
| -------------------------- | ------------------------- | ---------------------------------------------- |
| Ubiquitous Language        | order, order item, status | `type Order`, `type OrderItem`, `Order.status` |
| Ubiquitous Language        | invoice recipient         |                                                |
| Ubiquitous Language        | shipping address          |                                                |
| Bounded Context            | Sales                     | module `src/orders`                            |
| Bounded Context            | Shipping                  |                                                |
| Aggregate root             | Order                     | `type Order` with `id: ID!`                    |
| Value inside the aggregate | Order item                |                                                |
| Command                    | PlaceOrder                | `Mutation.placeOrder`                          |
| Command                    | CancelOrder               |                                                |
| Command                    | RemoveOrderItem           |                                                |
| Read Model                 | Open orders               | `Query.openOrders`                             |
| Read Model                 | Shipments                 |                                                |
| Domain Event               | OrderPlaced               | `Subscription.orderStatusChanged`              |
| Domain Event               | OrderCancelled            |                                                |

Two questions to finish with:

1. Which field of `Customer` belongs to which bounded context?
2. Which mutation in `src/orders/schema.graphql` has no single command behind it?
