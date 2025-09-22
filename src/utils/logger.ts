import winston from 'winston';
import chalk from 'chalk';

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const level = (): string => {
  const env = process.env.NODE_ENV ?? 'development';
  const isDevelopment = env === 'development';
  return isDevelopment ? 'debug' : 'warn';
};

// Pastel colors using chalk
const colors = {
  error: chalk.hex('#FF6961'), // Pastel red
  warn: chalk.hex('#FDFD96'), // Pastel yellow
  info: chalk.hex('#77DD77'), // Pastel green
  http: chalk.hex('#84B6F4'), // Pastel blue
  debug: chalk.hex('#CBC3E3'), // Pastel purple
};

// Enhanced format with better structure
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.errors({ stack: true }), // Capture stack traces
  winston.format(info => {
    // Add emoji icons for better visual distinction
    const icons: Record<string, string> = {
      error: '❌',
      warn: '⚠️',
      info: 'ℹ️',
      http: '🌐',
      debug: '🐛',
    };
    info.icon = icons[info.level] ?? '📝';
    return info;
  })(),
  winston.format.printf(info => {
    const { timestamp, level, message, icon, stack } = info;

    // Base log message
    let logMessage = `${timestamp} ${icon} [${level.toUpperCase()}]: ${message}`;

    // Include stack trace for errors
    if (stack && level === 'error') {
      logMessage += `\n${stack}`;
    }

    // Apply colors based on level with type safety
    const colorMap: Record<string, (text: string) => string> = colors;
    const colorizer = colorMap[level] ?? ((text: string): string => text);

    return colorizer(logMessage);
  })
);

// Enhanced transports with better file management
const transports = [
  // Console transport with level-based filtering
  new winston.transports.Console({
    level: level(),
    handleExceptions: true,
  }),
  // Error-specific file
  new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error',
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  }),
  // Combined log file
  new winston.transports.File({
    filename: 'logs/combined.log',
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  }),
];

// Create the logger instance
const Logger = winston.createLogger({
  level: level(),
  levels,
  format,
  transports,
  // Handle uncaught exceptions
  exceptionHandlers: [new winston.transports.File({ filename: 'logs/exceptions.log' })],
  // Handle unhandled promise rejections
  rejectionHandlers: [new winston.transports.File({ filename: 'logs/rejections.log' })],
  exitOnError: false, // Don't exit on handled exceptions
});

// Type extensions for custom methods
interface CustomLogger extends winston.Logger {
  success: (message: string, meta?: any) => winston.Logger;
}

// Optional: Add a development-friendly shortcut
if (process.env.NODE_ENV === 'development') {
  // Quick access methods with emojis
  (Logger as CustomLogger).success = (message: string, meta?: any) =>
    Logger.info(`✅ ${message}`, meta);
}

export default Logger as CustomLogger;
