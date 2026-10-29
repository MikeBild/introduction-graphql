export type Product = { id: string; name: string; priceCents: number }

// The catalog belongs to the GraphQL service; the stock lives in another team's REST service.
export const products: Product[] = [
  { id: 'p-1', name: 'Hammer', priceCents: 1990 },
  { id: 'p-2', name: 'Screwdriver set', priceCents: 2490 },
  { id: 'p-3', name: 'Cordless drill', priceCents: 8900 },
]
