// esbuild-flex.config.js

/** @type {import('esbuild-flex').FlexConfig} */
module.exports = {
    // Global defaults (can be overridden per group)
    target: 'es2018',
    sourcemap: false,
    minify: true,

    groups: [
        // Example 1: Simple string array with glob patterns
        {
            name: 'Main scripts',
            tags: ['dev', 'js', 'frontend'],
            entryPoints: [
                'public/assets/js/main.js',
                'public/assets/js/components/*.js',
            ],
            outdir: 'public/dist/js',
        },

        // Example 2: Using {in, out} objects for explicit output names
        {
            name: 'Named outputs',
            tags: ['production', 'js'],
            entryPoints: [
                { in: 'src/home.ts', out: 'home-page' },
                { in: 'src/about.ts', out: 'about-page' },
            ],
            outdir: 'public/dist/js',
            bundle: true,
        },

        // Example 3: Using Record format (object mapping)
        {
            name: 'Record format',
            entryPoints: {
                'app': 'src/app.js',
                'admin': 'src/admin.js',
            },
            outdir: 'public/dist/js',
        },

        // Example 4: Using esbuild's entryNames for custom naming
        {
            name: 'Custom naming with entryNames',
            entryPoints: ['src/**/*.js'],
            outdir: 'public/dist/js',
            outbase: 'src',
            entryNames: '[dir]/[name].min',  // esbuild native option
        },

        // Example 5: CSS processing with glob patterns
        {
            name: 'Stylesheets',
            tags: ['dev', 'css', 'frontend'],
            entryPoints: [
                'public/assets/css/main.css',
                'public/assets/css/themes/*.css',
            ],
            outdir: 'public/dist/css',
            loader: { '.css': 'css' },
        },

        // Example 6: CSS with custom output names
        {
            name: 'Named CSS outputs',
            tags: ['production', 'css'],
            entryPoints: [
                { in: 'src/styles/light.css', out: 'theme-light' },
                { in: 'src/styles/dark.css', out: 'theme-dark' },
            ],
            outdir: 'public/dist/css',
            minify: true,
        },

        // Example 7: Mixed JS and CSS in one group
        {
            name: 'Mixed assets',
            entryPoints: [
                'src/app.js',
                'src/app.css',
            ],
            outdir: 'public/dist',
            bundle: true,
        },

        // Example 8: SCSS processing (requires esbuild-sass-plugin)
        // Note: Install with: npm install -D esbuild-sass-plugin
        {
            name: 'SCSS stylesheets',
            entryPoints: [
                'src/styles/main.scss',
                'src/styles/components/*.scss',
            ],
            outdir: 'public/dist/css',
            bundle: true,
            plugins: [
                // require('esbuild-sass-plugin').sassPlugin()
            ],
        },

        // Example 9: SCSS with custom output extension
        {
            name: 'SCSS to CSS',
            entryPoints: {
                'app': 'src/styles/app.scss',
                'vendor': 'src/styles/vendor.scss',
            },
            outdir: 'public/dist/css',
            outExtension: { '.css': '.min.css' },
            bundle: true,
            plugins: [
                // require('esbuild-sass-plugin').sassPlugin()
            ],
        },
    ]
};
