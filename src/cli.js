#!/usr/bin/env node

/**
 * CLI entry point for esbuild-flex
 *
 * Usage:
 *   npx esbuild-flex
 *   npx esbuild-flex --watch
 *   npx esbuild-flex --verbose
 *   npx esbuild-flex --config=custom.config.js
 *   npx esbuild-flex --watch --verbose --config=custom.config.js
 */

const { build } = require('./index');
const { logger, setLogger, setLoggerVerbosity, consoleLogger } = require('./logger');

// Parse CLI arguments
const args = process.argv.slice(2);
const watch = args.includes('--watch');
const verbose = args.includes('--verbose');

// Parse --config= argument
let configPath;
const configArg = args.find(arg => arg.startsWith('--config='));
if (configArg) {
    configPath = configArg.split('=')[1];
}

// Configure logger
setLogger(consoleLogger());
setLoggerVerbosity(verbose);

// Run build and handle errors
build({ watch, configPath }).catch(err => {
    logger.error('Fatal build error:', err);
    process.exit(1);
});
