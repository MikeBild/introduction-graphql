import { ApolloProvider } from '@apollo/client/react'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ArticleList } from './ArticleList.tsx'
import { createClient } from '../src/client.ts'

createRoot(document.getElementById('app')!).render(
  <StrictMode>
    <ApolloProvider client={createClient()}>
      <h1>Articles</h1>
      <ArticleList />
    </ApolloProvider>
  </StrictMode>,
)
