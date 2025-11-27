# esbuild-flex

A thin wrapper around [esbuild](https://esbuild.github.io) for managing multiple build configurations in a single config file.

Run different esbuild configurations for different parts of your project - each with its own entry points, output directory, and options. Perfect for projects that need separate builds for client/server code, modern/legacy browsers, or different output formats.

## Features

- **Multiple configurations (groups)** - different settings for different parts of your app;
- **Supports all esbuild** entryPoints formats (`string[]`, `{in, out}[]`, `Record<string, string>`) and options;
- **Tagging** of configurations for selective building.

## Installation

```bash
npm install --save-dev esbuild-flex
```

## Usage

### 1. Create `esbuild-flex.config.js`

Add the `@type` comment for full autocomplete and type checking in your editor:

```javascript
/** @type {import('esbuild-flex').FlexConfig} */
module.exports = {
    // Global defaults (apply to all groups)
    target: 'es2018',
    sourcemap: false,
    minify: true,

    groups: [
        // Group 1: Simple string array with globs
        {
            name: 'Main scripts',
            entryPoints: [
                'src/app.js',
                'src/components/*.js',
            ],
            outdir: 'dist/js',
        },

        // Group 2: Using {in, out} for explicit names
        {
            name: 'Pages',
            entryPoints: [
                { in: 'src/home.ts', out: 'home-page' },
                { in: 'src/about.ts', out: 'about-page' },
            ],
            outdir: 'dist/js',
            bundle: true,  // Override global setting
        },

        // Group 3: Record format
        {
            name: 'Admin',
            entryPoints: {
                'admin-app': 'src/admin/app.js',
                'admin-dashboard': 'src/admin/dashboard.js',
            },
            outdir: 'dist/admin',
        },

        // Group 4: Using esbuild's entryNames
        {
            name: 'Utilities',
            entryPoints: ['src/utils/**/*.js'],
            outdir: 'dist/utils',
            outbase: 'src/utils',
            entryNames: '[dir]/[name].min',
        },
    ]
};
```

### 2. Run the build

```bash
# One-time build
npx esbuild-flex

# Watch mode
npx esbuild-flex --watch

# Custom config file
npx esbuild-flex --config=custom.config.js

# Watch with custom config
npx esbuild-flex --watch --config=custom.config.js
```

### 3. Add to package.json scripts

```json
{
  "scripts": {
    "build": "esbuild-flex",
    "dev": "esbuild-flex --watch"
  }
}
```

## Configuration

### Root Level Options

Any esbuild option can be set at the root level as a global default:

```javascript
module.exports = {
    target: 'es2020',
    sourcemap: true,
    minify: false,
    bundle: false,
    // ... any esbuild option

    groups: [ /* ... */ ]
};
```

### Group Options

Each group must have:
- `entryPoints` (required) - Any esbuild entryPoints format

Each group can optionally have:
- `name` (string) - For logging purposes
- `tags` (string[]) - Tags for selective building/watching
- Any esbuild option to override global config

### esbuild-flex Specific Options

Only three options are specific to esbuild-flex and won't be passed to esbuild:
- `name` - Group label for logging
- `tags` - Array of tags for filtering groups
- `groups` - Array of group configurations

Everything else is passed directly to esbuild.

### Selective Building with Tags

You can tag groups and build only specific groups using the `--tags` flag:

```javascript
module.exports = {
    groups: [
        {
            name: 'JavaScript',
            tags: ['dev', 'js'],
            entryPoints: ['src/**/*.js'],
            outdir: 'dist/js',
        },
        {
            name: 'Stylesheets',
            tags: ['dev', 'css'],
            entryPoints: ['src/**/*.css'],
            outdir: 'dist/css',
        },
        {
            name: 'Production bundle',
            tags: ['production'],
            entryPoints: ['src/app.js'],
            outdir: 'dist',
            bundle: true,
            minify: true,
        }
    ]
};
```

Build only specific groups:

```bash
# Build only JavaScript groups
npx esbuild-flex --tags=js

# Build only CSS groups
npx esbuild-flex --tags=css

# Build groups tagged with 'dev' (both JS and CSS)
npx esbuild-flex --tags=dev

# Build multiple tags (groups matching ANY of these tags)
npx esbuild-flex --tags=js,css

# Watch only production builds
npx esbuild-flex --watch --tags=production
```

**Note:** Groups without tags will only be built when no `--tags` filter is specified.

## Examples

### Example 1: Non-bundled scripts with minification

```javascript
module.exports = {
    minify: true,
    groups: [
        {
            name: 'Legacy scripts',
            entryPoints: ['public/js/*.js'],
            outdir: 'public/dist/js',
        }
    ]
};
```

### Example 2: Bundled app with source maps

```javascript
module.exports = {
    bundle: true,
    sourcemap: true,
    groups: [
        {
            name: 'App bundle',
            entryPoints: ['src/index.js'],
            outdir: 'dist',
        }
    ]
};
```

### Example 3: Multiple targets

```javascript
module.exports = {
    groups: [
        {
            name: 'Modern browsers',
            entryPoints: ['src/app.js'],
            outdir: 'dist/modern',
            target: 'es2020',
        },
        {
            name: 'Legacy browsers',
            entryPoints: ['src/app.js'],
            outdir: 'dist/legacy',
            target: 'es2015',
        }
    ]
};
```

### Example 4: With plugins (e.g., SCSS)

```javascript
const { sassPlugin } = require('esbuild-sass-plugin');

module.exports = {
    groups: [
        {
            name: 'Styles',
            entryPoints: ['src/styles/*.scss'],
            outdir: 'dist/css',
            plugins: [sassPlugin()],
        }
    ]
};
```

## License

MIT

## Contributing

Issues and PRs welcome!
