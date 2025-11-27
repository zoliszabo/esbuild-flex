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

const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');
const { styleText } = require('node:util');

const isWatch = process.argv.includes('--watch');

const CONFIG_FILE = path.resolve(process.cwd(), 'esbuild-flex.config.js');

if (!fs.existsSync(CONFIG_FILE)) {
    console.error(`Config file not found: ${CONFIG_FILE}`);
    process.exit(1);
}

let userConfig = {};
try {
    userConfig = require(CONFIG_FILE) || {};
    console.log(`Loaded config from ${CONFIG_FILE}`);
} catch (e) {
    console.error('Invalid esbuild-flex.config.js file:', e.message);
    process.exit(1);
}

// Simple validation for esbuild-flex specific structure.
// All esbuild options (including entryPoints) are validated by esbuild itself.
if (!userConfig.groups || !Array.isArray(userConfig.groups) || userConfig.groups.length === 0) {
    console.error(styleText(['white', 'bgRed'], 'esbuild-flex config validation failed:'), '\n - config.groups must be a non-empty array');
    process.exit(1);
}

for (let i = 0; i < userConfig.groups.length; i++) {
    const group = userConfig.groups[i];
    if (!group.entryPoints) {
        console.error(styleText(['white', 'bgRed'], 'esbuild-flex config validation failed:'), `\n - config.groups[${i}] must have an 'entryPoints' property`);
        process.exit(1);
    }
}

const defaultGlobalConfig = {
    target: 'es2018',
    sourcemap: false,
    bundle: false,
    minify: true,
    metafile: true  // Enable metafile for better output logging
};

const { groups = [], ...rootConfig } = userConfig;
const globalConfig = { ...defaultGlobalConfig, ...rootConfig };

// esbuild-flex specific options that should NOT be passed to esbuild.context()
const FLEX_SPECIFIC_OPTIONS = ['name', 'groups'];

/**
 * Resolves esbuild options for a group by merging global config with group-specific overrides.
 * Excludes esbuild-flex specific options (FLEX_SPECIFIC_OPTIONS).
 */
function resolveEsbuildOptions(group) {
    const options = { ...globalConfig };

    // Override with group-specific options
    for (const key in group) {
        if (!FLEX_SPECIFIC_OPTIONS.includes(key)) {
            options[key] = group[key];
        }
    }

    return options;
}



async function build() {
    const contexts = [];

    for (let i = 0; i < groups.length; i++) {
        const group = groups[i];

        if (!group.entryPoints) {
            console.warn(`Group #${i + 1} has no entryPoints defined`);
            continue;
        }

        const groupLabel = `Group #${i + 1}` + (group.name ? ` (${group.name})` : '');
        console.log(`\n> ${groupLabel}`);

        const esbuildOptions = resolveEsbuildOptions(group);

        // Create a single context for all entry points in this group
        // esbuild natively handles glob patterns in entryPoints
        const ctx = await esbuild.context({
            ...esbuildOptions,
            entryPoints: group.entryPoints,
        });

        contexts.push(ctx);

        // Initial build
        const result = await ctx.rebuild();

        // Log output files
        if (result.metafile) {
            //console.log(result.metafile);
            for (const output of Object.keys(result.metafile.outputs)) {
                console.log(`  → ${output}`);
            }
        } else {
            // Fallback logging when metafile is not available
            const entryCount = Array.isArray(group.entryPoints)
                ? group.entryPoints.length
                : Object.keys(group.entryPoints).length;
            console.log(`  Built ${entryCount} entry point(s)`);
        }

        if (!isWatch) {
            await ctx.dispose();
        }
    }

    if (isWatch) {
        console.log('\n[watch] build finished, watching for changes...');
        await Promise.all(contexts.map(ctx => ctx.watch()));
    }
}

build().catch(err => {
    console.error('Fatal build error:', err);
    process.exit(1);
});
