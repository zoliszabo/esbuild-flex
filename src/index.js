const path = require('path');
const { loadConfig, validateConfig } = require('./config');
const { resolveEsbuildOptions, createContext, logBuildResult } = require('./builder');
const { DEFAULT_ESBUILD_OPTIONS } = require('./defaults');
const { logger, isVerboseMode } = require('./logger');

async function build(options = {}) {
    const isWatch = options.watch || false;
    const configPath = path.resolve(process.cwd(), options.configPath || 'esbuild-flex.config.js');
    const filterTags = options.tags || null;

    // Load and validate configuration
    const userConfig = loadConfig(configPath);
    validateConfig(userConfig);

    let { groups = [], ...rootConfig } = userConfig;

    // Filter groups by tags if specified
    if (filterTags && filterTags.length > 0) {
        const originalCount = groups.length;
        groups = groups.filter(group => {
            // If group has no tags, it's not included when filtering by tags
            if (!group.tags || !Array.isArray(group.tags) || group.tags.length === 0) {
                return false;
            }
            // Include group if it has at least one matching tag
            return group.tags.some(tag => filterTags.includes(tag));
        });

        logger.log(`Filtered ${originalCount} group(s) to ${groups.length} group(s) matching tag(s): ${filterTags.join(', ')}`);

        if (groups.length === 0) {
            logger.error(`No groups found matching tags: ${filterTags.join(', ')}`);
            process.exit(1);
        }
    }
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
        logger.info('[WATCH MODE] Started. Watching for changes...');
    }
}

// Export for programmatic API
module.exports = { build };
