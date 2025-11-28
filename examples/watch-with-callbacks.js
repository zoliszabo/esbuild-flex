/**
 * Example: Using watch mode with callbacks
 *
 * This demonstrates how callbacks work in watch mode:
 * - onBuildStart and onBuildEnd are called for each rebuild
 * - onAllBuildsComplete is NOT called in watch mode
 * - Useful for triggering browser reloads, notifications, etc.
 */

const { build } = require('../src/index.js');

async function watchWithCallbacks() {
    console.log('Starting watch mode with callbacks...\n');

    let buildCount = 0;

    await build({
        configPath: './esbuild-flex.config.js',
        watch: true,

        onBuildStart: (group) => {
            buildCount++;
            console.log(`[WATCH] Build #${buildCount} started for: ${group.name || group.label}`);
        },

        onBuildEnd: (group, result) => {
            if (result.errors.length > 0) {
                console.log(`[WATCH] Build failed for: ${group.name || group.label}`);
                // Could send desktop notification here
            } else {
                console.log(`[WATCH] Build succeeded for: ${group.name || group.label}`);
                // Could trigger browser reload here
                // Could send success notification here
            }

            if (result.warnings.length > 0) {
                console.log(`[WATCH] Warnings: ${result.warnings.length}`);
            }
        }
    });

    console.log('\n[WATCH] Watching for changes... (Press Ctrl+C to stop)');
}

// Run the example
watchWithCallbacks().catch(error => {
    console.error('Watch mode failed:', error);
    process.exit(1);
});
