/**
 * Prosty logger dla API Gateway
 */
class Logger {
  info(message, ...args) {
    console.log(`[INFO] [${new Date().toISOString()}] ${message}`, ...args);
  }

  error(message, ...args) {
    console.error(`[ERROR] [${new Date().toISOString()}] ${message}`, ...args);
  }

  warn(message, ...args) {
    console.warn(`[WARN] [${new Date().toISOString()}] ${message}`, ...args);
  }

  debug(message, ...args) {
    if (process.env.NODE_ENV === "development") {
      console.debug(
        `[DEBUG] [${new Date().toISOString()}] ${message}`,
        ...args
      );
    }
  }

  requestLogger(req, res, next) {
    const start = Date.now();
    const loggerInstance = this; // Zachowaj referencję do instancji
    res.on("finish", () => {
      const duration = Date.now() - start;
      loggerInstance.info(
        `${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`
      );
    });
    next();
  }
}

export const logger = new Logger();
