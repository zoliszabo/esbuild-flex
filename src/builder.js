const esbuild = require('esbuild');
const { logger } = require('./logger');

// esbuild-flex specific options that should NOT be passed to esbuild.context()
const FLEX_SPECIFIC_OPTIONS = ['name', 'groups'];

/**
 * Resolves esbuild options for a group by merging global config with group-specific overrides.
 * Excludes esbuild-flex specific options (FLEX_SPECIFIC_OPTIONS).
 * @param {Object} globalConfig - Global configuration
 * @param {Object} group - Group-specific configuration
 * @returns {Object} Resolved esbuild options
 */
function resolveEsbuildOptions(globalConfig, group) {
    const options = { ...globalConfig };

    // Override with group-specific options
    for (const key in group) {
        if (!FLEX_SPECIFIC_OPTIONS.includes(key)) {
            options[key] = group[key];
        }
    }

    return options;
}

/**
 * Creates an esbuild context for a group.
 * @param {Object} esbuildOptions - Resolved esbuild options
 * @returns {Promise<Object>} esbuild context
 */
async function createContext(esbuildOptions) {
    return await esbuild.context(esbuildOptions);
}

/**
 * Logs the build result.
 * @param {Object} result - esbuild build result
 * @param {Object} group - Group configuration (with label property)
 */
function logBuildResult(result, group) {
    // Handle build errors
    if (result.errors && result.errors.length > 0) {
        logger.error(`Build failed for ${group.label}`);
        return;
    }

    // Log successful build output
    if (result.warnings && result.warnings.length > 0) {
        logger.warn(`Build successful - but with warning(s) - for ${group.label}`);
    } else {
        logger.info(`Build successful for ${group.label}`);
    }

    if (result.metafile) {
        for (const output of Object.keys(result.metafile.outputs)) {
            logger.log(`  - ${output}`);
        }
    } else {
        // Fallback logging when metafile is not available
        const entryCount = Array.isArray(group.entryPoints)
            ? group.entryPoints.length
            : Object.keys(group.entryPoints).length;
        logger.log(`  Built ${entryCount} entry point(s)`);
    }
}

module.exports = {
    resolveEsbuildOptions,
    createContext,
    logBuildResult,
};
