# From the domain to the schema

A possible solution. The mapping is a reading that helps you design, not a standard: no large public schema calls itself DDD.

| DDD term                   | In the shop               | In the schema                                  |
| -------------------------- | ------------------------- | ---------------------------------------------- |
| Ubiquitous Language        | order, order item, status | `type Order`, `type OrderItem`, `Order.status` |
| Ubiquitous Language        | invoice recipient         | `Customer.name`, `Customer.email`              |
| Ubiquitous Language        | shipping address          | `type Address`, `Customer.shippingAddress`     |
| Bounded Context            | Sales                     | module `orders`                                |
| Bounded Context            | Shipping                  | module `shipping`                              |
| Aggregate root             | Order                     | `type Order` with `id: ID!`                    |
| Value inside the aggregate | Order item                | `type OrderItem`, no `id` of its own           |
| Command                    | PlaceOrder                | `Mutation.placeOrder`                          |
| Command                    | CancelOrder               | `Mutation.cancelOrder`                         |
| Command                    | RemoveOrderItem           | `Mutation.removeOrderItem`                     |
| Read Model                 | Open orders               | `Query.openOrders`                             |
| Read Model                 | Shipments                 | `Query.shipments`                              |
| Domain Event               | OrderPlaced               | `Subscription.orderStatusChanged`              |
| Domain Event               | OrderCancelled            | `Subscription.orderStatusChanged`              |

1. `name` and `email` belong to Sales, `shippingAddress` belongs to Shipping, `id` belongs to both.
2. `updateOrder`: it stands for "change anything", so it hides several commands and checks no rule.
