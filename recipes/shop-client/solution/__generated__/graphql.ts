/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** Lifecycle of an order: DRAFT → PLACED → PAID → SHIPPED; CANCELLED only from DRAFT or PLACED */
export type OrderStatus =
  | 'CANCELLED'
  | 'DRAFT'
  | 'PAID'
  | 'PLACED'
  | 'SHIPPED';

export type OrdersPageQueryVariables = Exact<{
  status?: OrderStatus | null | undefined;
}>;


export type OrdersPageQuery = { orders: Array<{ __typename: 'Order', id: string, status: OrderStatus, totalCents: number }> };

export type OrderRowFragment = { __typename: 'Order', id: string, status: OrderStatus, totalCents: number };
