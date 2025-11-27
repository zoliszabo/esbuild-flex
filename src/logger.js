/**
 * Logger gateway that controls verbosity and forwards to actual logger implementations.
 *
 * @typedef {import('./logger').LoggerImplementation} LoggerImplementation
 */

/**
 * Create a console logger implementation.
 * @param {string|null} [prefix] - Optional custom prefix (defaults to styled '[esbuild-flex]')
 * @returns {LoggerImplementation}
 */
function consoleLogger(prefix = null) {
    const { styleText } = require("util");
    prefix = prefix ?? styleText(['gray'], '[esbuild-flex]');

    return {
        log: (...args) => console.log(prefix, ...args),
        warn: (...args) => console.warn(styleText(['black', 'bgYellow'], ' WARN '), prefix, ...args),
        error: (...args) => console.error(styleText(['white', 'bgRed'], ' ERROR '), prefix, ...args),
        info: (...args) => console.info(styleText(['white', 'bgBlue'], ' INFO '), prefix, ...args),
    };
}

/**
 * Noop logger (does nothing) - use with care.
 * @returns {LoggerImplementation}
 */
function noopLogger() {
    return {
        log: () => {},
        warn: () => {},
        error: () => {},
        info: () => {},
    };
}

// Logger state
let isVerbose = false;
let backendLogger = noopLogger(); // Default to noop

/**
 * Logger gateway
 */
const logger = {
    log: (...args) => {
        if (isVerbose && backendLogger) {
            backendLogger.log(...args);
        }
    },
    warn: (...args) => {
        if (backendLogger) {
            backendLogger.warn(...args);
        }
    },
    error: (...args) => {
        if (backendLogger) {
            backendLogger.error(...args);
        }
    },
    info: (...args) => {
        if (backendLogger) {
            backendLogger.info(...args);
        }
    },
};

/**
 * Set a logger implementation (e.g. console logger).
 * @param {LoggerImplementation} loggerImpl - The logger implementation to use
 */
function setLogger(loggerImpl) {
    backendLogger = loggerImpl;
}

/**
 * Set logger verbosity.
 * @param {boolean} verbose - Whether to enable verbose logging
 */
function setLoggerVerbosity(verbose) {
    isVerbose = verbose;
}

module.exports = { logger, setLogger, setLoggerVerbosity, consoleLogger, noopLogger };
