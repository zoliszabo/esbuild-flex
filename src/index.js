const path = require('path');
const { loadConfig, validateConfig } = require('./config');
const { resolveEsbuildOptions, createContext, logBuildResult } = require('./builder');
const { DEFAULT_ESBUILD_OPTIONS } = require('./defaults');
const { logger, isVerboseMode } = require('./logger');

async function build(options = {}) {
    const isWatch = options.watch || false;
    const configPath = path.resolve(process.cwd(), options.configPath || 'esbuild-flex.config.js');

    // Load and validate configuration
    const userConfig = loadConfig(configPath);
    validateConfig(userConfig);

    const { groups = [], ...rootConfig } = userConfig;
    const globalConfig = {
        ...DEFAULT_ESBUILD_OPTIONS,
        ...rootConfig,
        // Set esbuild logLevel: show warnings only in verbose mode
        logLevel: isVerboseMode() ? 'warning' : 'error',
    };

    const contexts = [];

    for (let i = 0; i < groups.length; i++) {
        const group = groups[i];

        const esbuildOptions = resolveEsbuildOptions(globalConfig, group);

        // Add label to group for logging. The `group` object can be altered only after esbuildOptions is built.
        group.label = `group #${i + 1}` + (group.name ? ` (${group.name})` : '');

        // Add plugin for build result logging
        const plugins = esbuildOptions.plugins || [];
        plugins.push({
            name: 'esbuild-flex-build-logger',
            setup(build) {
                build.onStart(() => {
                    logger.log(); // Leave one empty line.
                    logger.log(`> Building ${group.label}...`);
                });

                build.onEnd((result) => {
                    logBuildResult(result, group);
                });
            },
        });

        // Create a single context for all entry points in this group
        // esbuild natively handles glob patterns in entryPoints
        const ctx = await createContext({
            ...esbuildOptions,
            plugins,
            entryPoints: group.entryPoints,
        });

        contexts.push(ctx);

        if (!isWatch) {
            // Trigger initial build for non-watch mode
            await ctx.rebuild();
            await ctx.dispose();
        }
    }

    if (isWatch) {
        // In watch mode, ctx.watch() will trigger the initial build
        logger.log(); // Leave one empty line.
        logger.log('[WATCH MODE] Starting watch mode...');
        await Promise.all(contexts.map(ctx => ctx.watch()));
        logger.log('[WATCH MODE] Started. Watching for changes...');
    }
}

// Export for programmatic API
module.exports = { build };
