/* eslint-disable */
/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
/** Lifecycle of an order: DRAFT → PLACED → PAID → SHIPPED; CANCELLED only from DRAFT or PLACED */
export type OrderStatus =
  | 'CANCELLED'
  | 'DRAFT'
  | 'PAID'
  | 'PLACED'
  | 'SHIPPED';

export type OrdersPageQueryVariables = Exact<{ [key: string]: never; }>;


export type OrdersPageQuery = { orders: Array<(
    { id: string }
    & { ' $fragmentRefs'?: { 'OrderRowFragment': OrderRowFragment } }
  )> };

export type OrderRowFragment = (
  { id: string, totalCents: number }
  & { ' $fragmentRefs'?: { 'StatusBadgeFragment': StatusBadgeFragment } }
) & { ' $fragmentName'?: 'OrderRowFragment' };

export type StatusBadgeFragment = { status: OrderStatus } & { ' $fragmentName'?: 'StatusBadgeFragment' };

export const StatusBadgeFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StatusBadge"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Order"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]} as unknown as DocumentNode<StatusBadgeFragment, unknown>;
export const OrderRowFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OrderRow"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Order"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"totalCents"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"StatusBadge"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StatusBadge"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Order"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]} as unknown as DocumentNode<OrderRowFragment, unknown>;
export const OrdersPageDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"OrdersPage"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"orders"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"OrderRow"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StatusBadge"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Order"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OrderRow"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Order"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"totalCents"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"StatusBadge"}}]}}]} as unknown as DocumentNode<OrdersPageQuery, OrdersPageQueryVariables>;