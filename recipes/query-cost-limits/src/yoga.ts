import { createYoga } from 'graphql-yoga'
import { yogaLogger } from './logger.ts'
import { schema } from './schema.ts'

// Starting point: the graph executes every valid query, no matter how expensive.
export const yoga = createYoga({ logging: yogaLogger, schema })
