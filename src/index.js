const path = require('path');
const { loadConfig, validateConfig } = require('./config');
const { resolveEsbuildOptions, createContext, logBuildResult } = require('./builder');
const { DEFAULT_ESBUILD_OPTIONS } = require('./defaults');
const { logger, isVerboseMode } = require('./logger');

/**
 * Safely invokes a user callback and handles errors.
 * @param {Function} callback - The callback function to invoke
 * @param {Array} args - Arguments to pass to the callback
 * @param {string} callbackName - Name of the callback for error reporting
 */
async function safeInvokeCallback(callback, args, callbackName) {
    if (typeof callback !== 'function') {
        return;
    }

    try {
        await callback(...args);
    } catch (error) {
        logger.error(`Error in ${callbackName} callback: ${error.message}`);
        throw error; // Re-throw to stop the build process
    }
}

async function build(options = {}) {
    const isWatch = options.watch || false;
    const configPath = path.resolve(process.cwd(), options.configPath || 'esbuild-flex.config.js');
    const filterTags = options.tags || null;

    // Extract callbacks from options
    const { onBuildStart, onBuildEnd, onAllBuildsComplete } = options;

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
    const buildResults = []; // Store results for onAllBuildsComplete callback

    for (let i = 0; i < groups.length; i++) {
        const group = groups[i];

        const esbuildOptions = resolveEsbuildOptions(globalConfig, group);

        // Add label to group for logging. The `group` object can be altered only after esbuildOptions is built.
        group.label = `group #${i + 1}` + (group.name ? ` (${group.name})` : '');

        // Add plugin for build result logging and callbacks
        const plugins = esbuildOptions.plugins || [];
        plugins.push({
            name: 'esbuild-flex-build-logger',
            setup(build) {
                build.onStart(async () => {
                    logger.log(); // Leave one empty line.
                    logger.log(`> Building ${group.label}...`);

                    // Invoke user's onBuildStart callback
                    await safeInvokeCallback(onBuildStart, [group], 'onBuildStart');
                });

                build.onEnd(async (result) => {
                    logBuildResult(result, group);

                    // Store result for onAllBuildsComplete callback
                    if (!isWatch) {
                        buildResults.push({ group, result });
                    }

                    // Invoke user's onBuildEnd callback
                    await safeInvokeCallback(onBuildEnd, [group, result], 'onBuildEnd');
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

    // Invoke onAllBuildsComplete callback for non-watch mode
    if (!isWatch && onAllBuildsComplete) {
        await safeInvokeCallback(onAllBuildsComplete, [buildResults], 'onAllBuildsComplete');
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
