/**
 * Simple logger wrapper that prefixes all messages with [esbuild-flex]
 */

const { styleText } = require("util");

const PREFIX = styleText(['gray'], '[esbuild-flex]');

const logger = {
    log: (...args) => console.log(PREFIX, ...args),
    warn: (...args) => console.warn(styleText(['black', 'bgYellow'], ' WARN '), PREFIX, ...args),
    error: (...args) => console.error(styleText(['white', 'bgRed'], ' ERROR '), PREFIX, ...args),
    info: (...args) => console.info(styleText(['white', 'bgBlue'], ' INFO '), PREFIX, ...args),
};

module.exports = { logger };
