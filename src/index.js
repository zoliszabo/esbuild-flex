#!/usr/bin/env node

/**
 * Flexible ESBuild pipeline (Standalone npm package)
 * Supports:
 *  - Multiple groups for JS and optional SCSS
 *  - Entry points as direct file paths or glob patterns (aligned with esbuild native API)
 *  - All three esbuild entryPoints formats: string[], {in, out}[], Record<string, string>
 *  - Per-group esbuild options with global fallback
 *  - Watch mode with efficient single context per group
 *  - Optional SCSS compilation if user installs esbuild-sass-plugin
 *
 * Usage:
 *   npx esbuild-flex
 *   npx esbuild-flex --watch
 */

const path = require('path');
const { loadConfig, validateConfig } = require('./config');
const { resolveEsbuildOptions, createContext, logOutputFiles } = require('./builder');

const isWatch = process.argv.includes('--watch');
const CONFIG_FILE = path.resolve(process.cwd(), 'esbuild-flex.config.js');

// Default esbuild options for esbuild-flex
const DEFAULT_OPTIONS = {
    target: 'es2018',
    sourcemap: false,
    bundle: false,
    minify: true,
    metafile: true  // Enable metafile for better output logging
};

async function build() {
    // Load and validate configuration
    const userConfig = loadConfig(CONFIG_FILE);
    validateConfig(userConfig);

    const { groups = [], ...rootConfig } = userConfig;
    const globalConfig = { ...DEFAULT_OPTIONS, ...rootConfig };

    const contexts = [];

    for (let i = 0; i < groups.length; i++) {
        const group = groups[i];

        if (!group.entryPoints) {
            console.warn(`Group #${i + 1} has no entryPoints defined`);
            continue;
        }

        const groupLabel = `Group #${i + 1}` + (group.name ? ` (${group.name})` : '');
        console.log(`\n> ${groupLabel}`);

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

        // Log output files
        logOutputFiles(result, group);

        if (!isWatch) {
            await ctx.dispose();
        }
    }

    if (isWatch) {
        console.log('\n[watch] build finished, watching for changes...');
        await Promise.all(contexts.map(ctx => ctx.watch()));
    }
}

// Main execution
build().catch(err => {
    console.error('Fatal build error:', err);
    process.exit(1);
});

// Export for programmatic API
module.exports = { build };
