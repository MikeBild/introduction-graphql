import { ApolloProvider } from '@apollo/client/react'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { OrderList } from './OrderList.tsx'
import { createClient } from '../src/client.ts'

createRoot(document.getElementById('app')!).render(
  <StrictMode>
    <ApolloProvider client={createClient()}>
      <h1>Orders</h1>
      <OrderList />
    </ApolloProvider>
  </StrictMode>,
)
