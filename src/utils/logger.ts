/**
 * Development-only console utilities
 * Use these instead of native console.* methods
 * to automatically remove logs in production builds
 */

const isDevelopment = import.meta.env.DEV;

export const logger = {
  log: (...args: any[]) => {
    if (isDevelopment) console.log(...args);
  },
  warn: (...args: any[]) => {
    if (isDevelopment) console.warn(...args);
  },
  error: (...args: any[]) => {
    if (isDevelopment) console.error(...args);
  },
  debug: (...args: any[]) => {
    if (isDevelopment) console.debug(...args);
  },
  info: (...args: any[]) => {
    if (isDevelopment) console.info(...args);
  },
};

export default logger;
