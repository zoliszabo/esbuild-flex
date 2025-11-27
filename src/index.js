const path = require('path');
const { loadConfig, validateConfig } = require('./config');
const { resolveEsbuildOptions, createContext, logBuildResult } = require('./builder');
const { DEFAULT_ESBUILD_OPTIONS } = require('./defaults');
const { logger } = require('./logger');

async function build(options = {}) {
    const isWatch = options.watch || false;
    const configPath = path.resolve(process.cwd(), options.configPath || 'esbuild-flex.config.js');

    // Load and validate configuration
    const userConfig = loadConfig(configPath);
    validateConfig(userConfig);

    const { groups = [], ...rootConfig } = userConfig;
    const globalConfig = { ...DEFAULT_ESBUILD_OPTIONS, ...rootConfig };

    const contexts = [];

    for (let i = 0; i < groups.length; i++) {
        const group = groups[i];

        if (!group.entryPoints) {
            logger.warn(`Group #${i + 1} has no entryPoints defined`);
            continue;
        }

        const groupLabel = `Group #${i + 1}` + (group.name ? ` (${group.name})` : '');
        logger.log(`> ${groupLabel}`);

        const esbuildOptions = resolveEsbuildOptions(globalConfig, group);

        // Create a single context for all entry points in this group
        // esbuild natively handles glob patterns in entryPoints
        const ctx = await createContext({
            ...esbuildOptions,
            entryPoints: group.entryPoints,
        });

        contexts.push(ctx);

        // Initial build
        const result = await ctx.rebuild();

        // Log build result
        logBuildResult(result, group);

        if (!isWatch) {
            await ctx.dispose();
        }
    }

    if (isWatch) {
        logger.log('[watch] build finished, watching for changes...');
        await Promise.all(contexts.map(ctx => ctx.watch()));
    }
}

// Export for programmatic API
module.exports = { build };
