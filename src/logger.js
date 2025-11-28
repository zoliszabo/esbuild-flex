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
    const util = require("util");
    const styleText = util.styleText || ((styles, text) => text); // Fallback for Node.js < 20.12.0
    prefix = prefix ?? styleText(['gray'], '[esbuild-flex]');

    return {
        log: (...args) => console.log(prefix, ...args),
        warn: (...args) => console.warn(prefix, styleText(['black', 'bgYellow'], ' WARN '), ...args),
        error: (...args) => console.error(prefix, styleText(['white', 'bgRed'], ' ERROR '), ...args),
        info: (...args) => console.info(prefix, styleText(['white', 'bgBlue'], ' INFO '), ...args),
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

// Verbosity levels (exported for client use)
const VERBOSITY_SILENT = 0;  // Only errors and warnings
const VERBOSITY_NORMAL = 1;  // + info
const VERBOSITY_VERBOSE = 2; // + log (debug)

// Logger state
let verbosityLevel = VERBOSITY_NORMAL;
let backendLogger = noopLogger(); // Default to noop

/**
 * Logger gateway
 */
const logger = {
    log: (...args) => {
        if (verbosityLevel >= VERBOSITY_VERBOSE && backendLogger) {
            backendLogger.log(...args);
        }
    },
    info: (...args) => {
        if (verbosityLevel >= VERBOSITY_NORMAL && backendLogger) {
            backendLogger.info(...args);
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
};

/**
 * Set a logger implementation (e.g. console logger).
 * @param {LoggerImplementation} loggerImpl - The logger implementation to use
 */
function setLogger(loggerImpl) {
    backendLogger = loggerImpl;
}

/**
 * Set logger verbosity level.
 * @param {number} level - Verbosity level (use VERBOSITY_* constants)
 */
function setLoggerVerbosity(level) {
    verbosityLevel = level;
}

/**
 * Check if verbose mode is enabled.
 * @returns {boolean}
 */
function isVerboseMode() {
    return verbosityLevel >= VERBOSITY_VERBOSE;
}

module.exports = {
    logger,
    setLogger,
    setLoggerVerbosity,
    isVerboseMode,
    consoleLogger,
    noopLogger,
    VERBOSITY_SILENT,
    VERBOSITY_NORMAL,
    VERBOSITY_VERBOSE,
};
