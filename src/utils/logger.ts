/**
 * Structured logger for SDK operations
 */

/**
 * Log levels
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * Logger configuration
 */
export interface LoggerConfig {
  /**
   * Log level threshold (default: 'info')
   * - debug: Log everything
   * - info: Log info, warn, and error
   * - warn: Log warn and error
   * - error: Log only errors
   */
  level?: LogLevel;

  /**
   * Enable timestamps in logs (default: false)
   */
  timestamp?: boolean;

  /**
   * Custom log handler (default: console)
   */
  handler?: {
    debug: (message: string) => void;
    info: (message: string) => void;
    warn: (message: string) => void;
    error: (message: string) => void;
  };
}

/**
 * Log level priority (for comparison)
 */
const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

/**
 * Sensitive field names to redact
 */
const SENSITIVE_FIELDS = [
  'accessToken',
  'access_token',
  'password',
  'secret',
  'token',
  'apiKey',
  'api_key',
  'authorization',
  'auth',
];

/**
 * Structured logger with branding and sensitive data redaction
 */
export class WazapinLogger {
  private readonly level: LogLevel;
  private readonly timestamp: boolean;
  private readonly handler: Required<LoggerConfig>['handler'];

  constructor(config?: LoggerConfig) {
    this.level = config?.level || 'info';
    this.timestamp = config?.timestamp || false;
    this.handler = config?.handler || {
      // eslint-disable-next-line no-console -- Default logger delegates to the host console.
      debug: console.debug.bind(console),
      // eslint-disable-next-line no-console -- Default logger delegates to the host console.
      info: console.info.bind(console),
      warn: console.warn.bind(console),
      error: console.error.bind(console),
    };
  }

  /**
   * Log debug message
   * @param message - Log message
   * @param data - Optional data to log
   */
  debug(message: string, data?: unknown): void {
    if (this.isLevelEnabled('debug')) {
      this.handler.debug(this.format('DEBUG', message, data));
    }
  }

  /**
   * Log info message
   * @param message - Log message
   * @param data - Optional data to log
   */
  info(message: string, data?: unknown): void {
    if (this.isLevelEnabled('info')) {
      this.handler.info(this.format('INFO', message, data));
    }
  }

  /**
   * Log warning message
   * @param message - Log message
   * @param data - Optional data to log
   */
  warn(message: string, data?: unknown): void {
    if (this.isLevelEnabled('warn')) {
      this.handler.warn(this.format('WARN', message, data));
    }
  }

  /**
   * Log error message
   * @param message - Log message
   * @param data - Optional data to log
   */
  error(message: string, data?: unknown): void {
    if (this.isLevelEnabled('error')) {
      this.handler.error(this.format('ERROR', message, data));
    }
  }

  /**
   * Check if a log level is enabled
   * @param level - Log level to check
   * @returns True if level is enabled
   */
  private isLevelEnabled(level: LogLevel): boolean {
    return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[this.level];
  }

  /**
   * Format log message with branding and optional timestamp
   * @param level - Log level
   * @param message - Log message
   * @param data - Optional data to log
   * @returns Formatted log message
   */
  private format(level: string, message: string, data?: unknown): string {
    const parts: string[] = [];

    // Add timestamp if enabled
    if (this.timestamp) {
      parts.push(`[${new Date().toISOString()}]`);
    }

    // Add branding and level
    parts.push(`[wazapin-wa]`);
    parts.push(`[${level}]`);
    parts.push(message);

    // Add sanitized data if provided
    if (data !== undefined) {
      const sanitized = this.sanitize(data);
      parts.push(JSON.stringify(sanitized, null, 2));
    }

    return parts.join(' ');
  }

  /**
   * Sanitize sensitive data from logs
   * @param data - Data to sanitize
   * @returns Sanitized data
   */
  private sanitize(data: unknown): unknown {
    // Handle null/undefined
    if (data == null) {
      return data;
    }

    // Handle primitives
    if (typeof data !== 'object') {
      return data;
    }

    // Handle arrays
    if (Array.isArray(data)) {
      return data.map((item) => this.sanitize(item));
    }

    // Handle Error objects
    if (data instanceof Error) {
      return {
        name: data.name,
        message: data.message,
        stack: data.stack,
      };
    }

    // Handle objects
    const sanitized: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(data)) {
      // Redact sensitive fields (exact match or ends with sensitive field)
      const keyLower = key.toLowerCase();
      const isSensitive = SENSITIVE_FIELDS.some((field) => {
        const fieldLower = field.toLowerCase();
        // Exact match or key ends with field (e.g., "userToken" matches "token")
        return keyLower === fieldLower || keyLower.endsWith(fieldLower);
      });

      if (isSensitive) {
        sanitized[key] = '[REDACTED]';
      } else {
        sanitized[key] = this.sanitize(value);
      }
    }

    return sanitized;
  }
}

/**
 * Default logger instance (INFO level, no timestamp)
 */
export const defaultLogger = new WazapinLogger();
