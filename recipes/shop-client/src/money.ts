// Money is always in whole cents – formatted only for display.
export const formatCents = (cents: number) =>
  new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(cents / 100)
