import loglevel from 'loglevel'
import { Logger } from 'graphql-yoga'

export const log = loglevel.getLogger('operations-fragments')
// LOG_LEVEL is also read by Yoga's logger: trace, debug, info, warn or error
log.setLevel((process.env.LOG_LEVEL ?? 'info') as loglevel.LogLevelDesc)

// Bridges Yoga's built-in logger to loglevel, so all server output shares one level.
export const yogaLogger = new Logger({
  writers: [{ write: (level, attributes, message) => log[level](message ?? '', attributes ?? '') }],
})
