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

esbuild-flex can be used in two ways:
1. **CLI** - Simple command-line interface for most use cases
2. **Programmatic API** - JavaScript API for advanced scenarios and custom tooling

### CLI Usage

The CLI is the simplest way to use esbuild-flex. It reads your config file and runs the build.

#### 1. Create `esbuild-flex.config.js`

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

#### 2. Run the build

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

#### 3. Add to package.json scripts

```json
{
  "scripts": {
    "build": "esbuild-flex",
    "dev": "esbuild-flex --watch"
  }
}
```

### Programmatic API Usage

For advanced use cases, you can use esbuild-flex programmatically in your Node.js scripts. This is useful when you need to:
- Integrate esbuild-flex into custom build tools
- Dynamically generate configurations
- Run builds conditionally based on runtime logic
- Orchestrate complex build pipelines with pre/post-build tasks

#### Basic Programmatic Usage

```javascript
const { build } = require('esbuild-flex');

// Using a config file
async function runBuild() {
    try {
        await build({
            configFile: './esbuild-flex.config.js'
        });
        console.log('Build completed successfully!');
    } catch (error) {
        console.error('Build failed:', error);
        process.exit(1);
    }
}

runBuild();
```

#### Inline Configuration

You can also pass the configuration directly without a config file:

```javascript
const { build } = require('esbuild-flex');

async function runBuild() {
    await build({
        config: {
            target: 'es2020',
            sourcemap: true,
            groups: [
                {
                    name: 'App',
                    entryPoints: ['src/app.js'],
                    outdir: 'dist',
                    bundle: true,
                }
            ]
        }
    });
}

runBuild();
```

#### Watch Mode Programmatically

```javascript
const { build } = require('esbuild-flex');

async function startWatching() {
    await build({
        configFile: './esbuild-flex.config.js',
        watch: true
    });
    console.log('Watching for changes...');
}

startWatching();
```

#### Filtering by Tags Programmatically

```javascript
const { build } = require('esbuild-flex');

async function buildProduction() {
    await build({
        configFile: './esbuild-flex.config.js',
        tags: ['production']
    });
}

buildProduction();
```

#### Dynamic Configuration

Generate configurations dynamically based on environment or other factors:

```javascript
const { build } = require('esbuild-flex');

async function buildForEnvironment(env) {
    const isDev = env === 'development';
    
    await build({
        config: {
            target: isDev ? 'es2020' : 'es2015',
            sourcemap: isDev,
            minify: !isDev,
            groups: [
                {
                    name: `${env} build`,
                    entryPoints: ['src/app.js'],
                    outdir: `dist/${env}`,
                    bundle: true,
                    define: {
                        'process.env.NODE_ENV': JSON.stringify(env)
                    }
                }
            ]
        }
    });
}

// Usage
buildForEnvironment(process.env.NODE_ENV || 'development');
```

#### Integration with Custom Build Scripts

```javascript
const { build } = require('esbuild-flex');
const fs = require('fs').promises;

async function customBuildPipeline() {
    // Pre-build tasks
    console.log('Running pre-build tasks...');
    await fs.mkdir('dist', { recursive: true });
    
    // Run esbuild-flex
    console.log('Building with esbuild-flex...');
    await build({
        configFile: './esbuild-flex.config.js'
    });
    
    // Post-build tasks
    console.log('Running post-build tasks...');
    await fs.copyFile('public/index.html', 'dist/index.html');
    
    console.log('Build pipeline completed!');
}

customBuildPipeline().catch(error => {
    console.error('Build pipeline failed:', error);
    process.exit(1);
});
```

#### API Options

The `build()` function accepts an options object with the following properties:

| Option | Type | Description |
|--------|------|-------------|
| `config` | `FlexConfig` | Inline configuration object (alternative to `configFile`) |
| `configFile` | `string` | Path to config file (default: `'esbuild-flex.config.js'`) |
| `watch` | `boolean` | Enable watch mode (default: `false`) |
| `tags` | `string[]` | Filter groups by tags |

**Note:** You must provide either `config` or `configFile`, but not both.

### CLI vs Programmatic API: When to Use Which?

**Use the CLI when:**
- You have a straightforward build setup
- You want to run builds from npm scripts
- You prefer configuration files over code
- You don't need custom pre/post-build logic

**Use the Programmatic API when:**
- You need to integrate esbuild-flex into custom tooling
- You want to generate configurations dynamically
- You need to run conditional builds based on runtime logic
- You want to handle build results or errors programmatically
- You're building a meta-build tool or framework

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
