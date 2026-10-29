import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// The GraphQL server runs separately: recipes/shop-server on port 4000.
export default defineConfig({
  plugins: [react()],
  server: { port: 5173, proxy: { '/graphql': 'http://localhost:4000' } },
})
