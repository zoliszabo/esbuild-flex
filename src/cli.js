#!/usr/bin/env node

/**
 * CLI entry point for esbuild-flex
 *
 * Usage:
 *   npx esbuild-flex
 *   npx esbuild-flex --watch
 *   npx esbuild-flex --verbose
 *   npx esbuild-flex --silent
 *   npx esbuild-flex --config=custom.config.js
 *   npx esbuild-flex --watch --verbose --config=custom.config.js
 */

const { build } = require('./index');
const {
    logger,
    setLogger,
    setLoggerVerbosity,
    consoleLogger,
    VERBOSITY_SILENT,
    VERBOSITY_NORMAL,
    VERBOSITY_VERBOSE,
} = require('./logger');

// Parse CLI arguments
const args = process.argv.slice(2);
const watch = args.includes('--watch');
const verbose = args.includes('--verbose');
const silent = args.includes('--silent');

// Check for conflicting flags
if (verbose && silent) {
    console.error('Make up your mind! You can\'t be both --verbose AND --silent at the same time.');
    process.exit(1);
}

// Parse --config= argument
let configPath;
const configArg = args.find(arg => arg.startsWith('--config='));
if (configArg) {
    configPath = configArg.split('=')[1];
}

// Configure logger & verbosity level
setLogger(consoleLogger());
setLoggerVerbosity(silent ? VERBOSITY_SILENT : (verbose ? VERBOSITY_VERBOSE : VERBOSITY_NORMAL));

// Run build and handle errors
build({ watch, configPath }).catch(err => {
    logger.error('Fatal build error:', err);
    process.exit(1);
});
