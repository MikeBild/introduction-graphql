/* eslint-disable */
import * as types from './graphql';
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "\n  query OrdersPage {\n    orders {\n      id\n      ...OrderRow\n    }\n  }\n": typeof types.OrdersPageDocument,
    "\n  fragment OrderRow on Order {\n    id\n    totalCents\n    ...StatusBadge\n  }\n": typeof types.OrderRowFragmentDoc,
    "\n  fragment StatusBadge on Order {\n    status\n  }\n": typeof types.StatusBadgeFragmentDoc,
};
const documents: Documents = {
    "\n  query OrdersPage {\n    orders {\n      id\n      ...OrderRow\n    }\n  }\n": types.OrdersPageDocument,
    "\n  fragment OrderRow on Order {\n    id\n    totalCents\n    ...StatusBadge\n  }\n": types.OrderRowFragmentDoc,
    "\n  fragment StatusBadge on Order {\n    status\n  }\n": types.StatusBadgeFragmentDoc,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query OrdersPage {\n    orders {\n      id\n      ...OrderRow\n    }\n  }\n"): (typeof documents)["\n  query OrdersPage {\n    orders {\n      id\n      ...OrderRow\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment OrderRow on Order {\n    id\n    totalCents\n    ...StatusBadge\n  }\n"): (typeof documents)["\n  fragment OrderRow on Order {\n    id\n    totalCents\n    ...StatusBadge\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment StatusBadge on Order {\n    status\n  }\n"): (typeof documents)["\n  fragment StatusBadge on Order {\n    status\n  }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;