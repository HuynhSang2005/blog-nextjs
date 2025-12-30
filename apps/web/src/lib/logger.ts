/**
 * Structured Logging System
 * Uses Pino for high-performance, structured JSON logging
 * 
 * Best Practices (2025):
 * - JSON-first output for observability tools
 * - Zero-cost filtering (disabled levels skipped at runtime)
 * - Child loggers for context propagation
 * - Edge runtime compatible
 * 
 * @see https://getpino.io/#/docs/api
 */

import pino from 'pino'

/**
 * Log levels (syslog standard):
 * - fatal (60): application crash
 * - error (50): errors requiring immediate attention
 * - warn (40): potential issues
 * - info (30): general information (default)
 * - debug (20): detailed debugging info
 * - trace (10): ultra-verbose tracing
 */
const isDevelopment = process.env.NODE_ENV === 'development'
const isTest = process.env.NODE_ENV === 'test'

/**
 * Base logger instance
 * Configured for development (pretty) or production (JSON)
 */
export const logger = pino({
  level: process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info'),
  
  // Base metadata added to all logs
  base: {
    service: 'blog-nextjs',
    env: process.env.NODE_ENV,
  },

  // Development: pretty output
  // Production: JSON for log aggregators
  ...(!isTest && isDevelopment
    ? {
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
            singleLine: false,
          },
        },
      }
    : {}),

  // Silence in test environment
  ...(isTest ? { level: 'silent' } : {}),
})

/**
 * Create child logger with additional context
 * Use for per-request or per-module logging
 * 
 * @example
 * const log = createLogger({ module: 'api', route: '/blog' })
 * log.info({ userId: 123 }, 'Fetching blog posts')
 */
export function createLogger(context: Record<string, unknown>) {
  return logger.child(context)
}

/**
 * Log error with stack trace
 * Automatically extracts error properties
 * 
 * @example
 * logError(error, { context: 'user-auth', userId: 123 })
 */
export function logError(
  error: unknown,
  context?: Record<string, unknown>
) {
  const errorObj = error instanceof Error
    ? {
        message: error.message,
        name: error.name,
        stack: error.stack,
        cause: error.cause,
      }
    : { error }

  logger.error({ err: errorObj, ...context })
}

/**
 * Module-specific loggers
 * Pre-configured with context for common areas
 */
export const loggers = {
  /** Supabase queries and database operations */
  db: createLogger({ module: 'database' }),
  
  /** Authentication and authorization */
  auth: createLogger({ module: 'auth' }),
  
  /** API routes and server actions */
  api: createLogger({ module: 'api' }),
  
  /** Admin dashboard operations */
  admin: createLogger({ module: 'admin' }),
  
  /** Blog operations */
  blog: createLogger({ module: 'blog' }),
  
  /** Media/Cloudinary operations */
  media: createLogger({ module: 'media' }),
  
  /** Documentation operations */
  docs: createLogger({ module: 'docs' }),
  
  /** Projects operations */
  projects: createLogger({ module: 'projects' }),
}

/**
 * Type-safe log methods
 * Use these for common logging patterns
 */
export const log = {
  /** Debug info (development only) */
  debug: (msg: string, data?: Record<string, unknown>) =>
    logger.debug(data, msg),
  
  /** General information */
  info: (msg: string, data?: Record<string, unknown>) =>
    logger.info(data, msg),
  
  /** Warnings (potential issues) */
  warn: (msg: string, data?: Record<string, unknown>) =>
    logger.warn(data, msg),
  
  /** Errors (immediate attention) */
  error: (msg: string, error?: unknown, data?: Record<string, unknown>) =>
    logError(error, { message: msg, ...data }),
  
  /** Fatal errors (application crash) */
  fatal: (msg: string, error?: unknown, data?: Record<string, unknown>) =>
    logger.fatal({ err: error, ...data }, msg),
}

/**
 * Flush logs before shutdown
 * Call in graceful shutdown handlers
 */
export async function flushLogs() {
  return new Promise<void>((resolve) => {
    logger.flush(() => resolve())
  })
}

/**
 * Export default logger for direct use
 */
export default logger
