// A tiny console logger. LOG_LEVEL: debug, info, warn or error (default info).
const levels = ['debug', 'info', 'warn', 'error'] as const
type Level = (typeof levels)[number]

const threshold = Math.max(0, levels.indexOf((process.env.LOG_LEVEL ?? 'info') as Level))
const at =
  (level: Level) =>
  (...args: unknown[]) => {
    if (levels.indexOf(level) >= threshold) console[level](...args)
  }

export const log = { debug: at('debug'), info: at('info'), warn: at('warn'), error: at('error') }
