const fs = require('fs');
const { styleText } = require('node:util');

/**
 * Loads the esbuild-flex configuration file.
 * @param {string} configPath - Path to the configuration file
 * @returns {Object} The loaded configuration
 * @throws {Error} If config file is not found or invalid
 */
function loadConfig(configPath) {
    if (!fs.existsSync(configPath)) {
        console.error(`Config file not found: ${configPath}`);
        process.exit(1);
    }

    let userConfig = {};
    try {
        userConfig = require(configPath) || {};
        console.log(`Loaded config from ${configPath}`);
    } catch (e) {
        console.error('Invalid esbuild-flex.config.js file:', e.message);
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
        console.error(
            styleText(['white', 'bgRed'], 'esbuild-flex config validation failed:'),
            '\n - config.groups must be a non-empty array'
        );
        process.exit(1);
    }

    for (let i = 0; i < config.groups.length; i++) {
        const group = config.groups[i];
        if (!group.entryPoints) {
            console.error(
                styleText(['white', 'bgRed'], 'esbuild-flex config validation failed:'),
                `\n - config.groups[${i}] must have an 'entryPoints' property`
            );
            process.exit(1);
        }
    }
}

module.exports = {
    loadConfig,
    validateConfig,
};
