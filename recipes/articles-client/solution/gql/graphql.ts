/* eslint-disable */
/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type ArticleState =
  | 'DRAFT'
  | 'PUBLISHED';

export type ArticlesPageQueryVariables = Exact<{ [key: string]: never; }>;


export type ArticlesPageQuery = { articles: Array<(
    { id: string }
    & { ' $fragmentRefs'?: { 'ArticleRowFragment': ArticleRowFragment } }
  )> };

export type ArticleRowFragment = (
  { id: string, title: string }
  & { ' $fragmentRefs'?: { 'StateBadgeFragment': StateBadgeFragment } }
) & { ' $fragmentName'?: 'ArticleRowFragment' };

export type StateBadgeFragment = { state: ArticleState } & { ' $fragmentName'?: 'StateBadgeFragment' };

export const StateBadgeFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StateBadge"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Article"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"state"}}]}}]} as unknown as DocumentNode<StateBadgeFragment, unknown>;
export const ArticleRowFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ArticleRow"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Article"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"StateBadge"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StateBadge"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Article"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"state"}}]}}]} as unknown as DocumentNode<ArticleRowFragment, unknown>;
export const ArticlesPageDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ArticlesPage"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"articles"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"ArticleRow"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StateBadge"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Article"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"state"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ArticleRow"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Article"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"StateBadge"}}]}}]} as unknown as DocumentNode<ArticlesPageQuery, ArticlesPageQueryVariables>;