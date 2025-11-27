/**
 * TypeScript definitions for esbuild-flex configuration
 *
 * To get autocomplete and type checking in your JavaScript config file, add this JSDoc comment:
 * @example
 * // esbuild-flex.config.js
 * /** @type {import('esbuild-flex').FlexConfig} *\/
 * module.exports = {
 *   // Your config with full autocomplete support
 * }
 */

import type { BuildOptions } from 'esbuild';

/**
 * A build group with its own entry points and esbuild options.
 * All esbuild BuildOptions are supported and can override global settings.
 */
export interface FlexGroup extends BuildOptions {
  /**
   * Optional name for this group (used in console output for better logging)
   * @example 'Main scripts'
   * @example 'Admin bundle'
   */
  name?: string;

  /**
   * Entry points for this group. Supports all three esbuild formats:
   * - string[] - Array of file paths or glob patterns
   * - {in: string, out: string}[] - Explicit input/output pairs
   * - Record<string, string> - Object mapping output names to input files
   *
   * @example
   * // String array with globs (esbuild handles glob expansion)
   * entryPoints: ['src/app.js', 'src/components/*.js']
   *
   * @example
   * // Explicit output names
   * entryPoints: [
   *   { in: 'src/home.ts', out: 'home-page' },
   *   { in: 'src/about.ts', out: 'about-page' }
   * ]
   *
   * @example
   * // Record format
   * entryPoints: {
   *   'app': 'src/app.js',
   *   'admin': 'src/admin.js'
   * }
   */
  entryPoints: BuildOptions['entryPoints'];
}

/**
 * esbuild-flex configuration.
 * Root-level options serve as global defaults for all groups.
 * Each group can override any option.
 */
export interface FlexConfig extends Omit<BuildOptions, 'entryPoints'> {
  /**
   * Array of build groups. Each group has its own entry points and can override global options.
   * At least one group is required.
   */
  groups: FlexGroup[];
}

declare const config: FlexConfig;
export default config;
