const fs = require('fs');
const { logger } = require('./logger');

/**
 * Loads the esbuild-flex configuration file.
 * @param {string} configPath - Path to the configuration file
 * @returns {Object} The loaded configuration
 * @throws {Error} If config file is not found or invalid
 */
function loadConfig(configPath) {
    if (!fs.existsSync(configPath)) {
        logger.error(`Config file not found: ${configPath}`);
        process.exit(1);
    }

    let userConfig = {};
    try {
        userConfig = require(configPath) || {};
        logger.log(`Loaded config from ${configPath}`);
    } catch (e) {
        logger.error('Invalid esbuild-flex.config.js file:', e.message);
        process.exit(1);
    }

    return userConfig;
}

/**
 * Validates the esbuild-flex configuration structure.
 * Simple validation for esbuild-flex specific structure.
 * All esbuild options (including entryPoints) are validated by esbuild itself.
 * @param {Object} config - The configuration to validate
 * @throws {Error} If validation fails
 */
function validateConfig(config) {
    if (!config.groups || !Array.isArray(config.groups) || config.groups.length === 0) {
        logger.error('Config validation failed: config.groups must be a non-empty array');
        process.exit(1);
    }

    for (let i = 0; i < config.groups.length; i++) {
        const group = config.groups[i];

        if (!group.entryPoints) {
            logger.error(`Config validation failed: config.groups[${i}] must have an 'entryPoints' property`);
            process.exit(1);
        }

        // Validate entryPoints is either an array or an object
        // esbuild supports: string[], {in, out}[], or Record<string, string>
        const isArray = Array.isArray(group.entryPoints);
        const isObject = typeof group.entryPoints === 'object' && group.entryPoints !== null;

        if (!isArray && !isObject) {
            logger.error(`Config validation failed: config.groups[${i}].entryPoints must be an array or object`);
            process.exit(1);
        }

        // If it's an array, check it's not empty
        if (isArray && group.entryPoints.length === 0) {
            logger.error(`Config validation failed: config.groups[${i}].entryPoints array must not be empty`);
            process.exit(1);
        }

        // If it's an object (Record format), check it has at least one key
        if (isObject && !isArray && Object.keys(group.entryPoints).length === 0) {
            logger.error(`Config validation failed: config.groups[${i}].entryPoints object must not be empty`);
            process.exit(1);
        }
    }
}

module.exports = {
    loadConfig,
    validateConfig,
};
