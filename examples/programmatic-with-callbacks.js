/**
 * Example: Using esbuild-flex programmatically with callbacks
 *
 * This demonstrates how to use the callback system to:
 * - Track build progress
 * - Handle build results
 * - Perform custom actions after builds complete
 */

const { build } = require('../src/index.js');

async function runBuildWithCallbacks() {
    console.log('Starting build with callbacks...\n');

    const startTimes = new Map();

    await build({
        configPath: './esbuild-flex.config.js',

        // Called before each group starts building
        onBuildStart: (group) => {
            startTimes.set(group.label, Date.now());
            console.log(`[CALLBACK] Starting: ${group.name || group.label}`);
        },

        // Called after each group finishes building
        onBuildEnd: (group, result) => {
            const duration = Date.now() - startTimes.get(group.label);

            if (result.errors.length > 0) {
                console.log(`[CALLBACK] Failed: ${group.name || group.label} (${duration}ms)`);
                console.log(`[CALLBACK] Errors: ${result.errors.length}`);
            } else {
                console.log(`[CALLBACK] Completed: ${group.name || group.label} (${duration}ms)`);

                if (result.metafile) {
                    const outputCount = Object.keys(result.metafile.outputs).length;
                    console.log(`[CALLBACK] Generated ${outputCount} output file(s)`);
                }
            }
        },

        // Called after all groups finish building (only in non-watch mode)
        onAllBuildsComplete: (results) => {
            console.log('\n[CALLBACK] All builds complete!');
            console.log(`[CALLBACK] Total groups built: ${results.length}`);

            const successful = results.filter(r => r.result.errors.length === 0).length;
            const failed = results.length - successful;

            console.log(`[CALLBACK] Successful: ${successful}, Failed: ${failed}`);

            // Example: Generate a build report
            const totalOutputs = results.reduce((sum, r) => {
                return sum + (r.result.metafile ? Object.keys(r.result.metafile.outputs).length : 0);
            }, 0);

            console.log(`[CALLBACK] Total output files: ${totalOutputs}`);
        }
    });
}

// Run the example
runBuildWithCallbacks().catch(error => {
    console.error('Build failed:', error);
    process.exit(1);
});
