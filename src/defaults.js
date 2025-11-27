/**
 * Default esbuild options for esbuild-flex
 */

const DEFAULT_ESBUILD_OPTIONS = {
    target: 'es2018',
    sourcemap: false,
    bundle: false,
    minify: true,
    metafile: true  // Enable metafile for better output logging
};

module.exports = {
    DEFAULT_ESBUILD_OPTIONS,
};
