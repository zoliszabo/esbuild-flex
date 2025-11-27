/**
 * Logger implementation interface
 */
export interface LoggerImplementation {
    log: (...args: any[]) => void;
    warn: (...args: any[]) => void;
    error: (...args: any[]) => void;
    info: (...args: any[]) => void;
}

/**
 * Logger gateway that controls verbosity and forwards to logger implementations
 */
export interface Logger {
    log: (...args: any[]) => void;
    warn: (...args: any[]) => void;
    error: (...args: any[]) => void;
    info: (...args: any[]) => void;
}

/**
 * The logger gateway instance
 */
export const logger: Logger;

/**
 * Set the logger implementation
 */
export function setLogger(loggerImpl: LoggerImplementation): void;

/**
 * Set logger verbosity
 */
export function setLoggerVerbosity(verbose: boolean): void;

/**
 * Create a console logger implementation (logs to console with styled output)
 * @param prefix - Optional custom prefix (defaults to styled '[esbuild-flex]')
 */
export function consoleLogger(prefix?: string | null): LoggerImplementation;

/**
 * Create a noop logger implementation (does nothing)
 */
export function noopLogger(): LoggerImplementation;
