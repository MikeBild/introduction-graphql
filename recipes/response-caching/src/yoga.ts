import { createYoga } from 'graphql-yoga'
import { yogaLogger } from './logger.ts'
import { schema } from './schema.ts'

// Starting point: every request goes to the database.
export const yoga = createYoga({ logging: yogaLogger, schema })
