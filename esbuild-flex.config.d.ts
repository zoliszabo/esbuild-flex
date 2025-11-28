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
   * Optional tags for this group. Used to selectively build/watch specific groups.
   * Groups without tags will only be built when no tag filter is specified.
   *
   * @example
   * tags: ['dev', 'js']
   * tags: ['production', 'css']
   */
  tags?: string[];

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
 * Result of a single group build, passed to callbacks
 */
export interface BuildResult {
  /**
   * The group configuration that was built
   */
  group: FlexGroup;

  /**
   * The esbuild build result
   */
  result: {
    errors: any[];
    warnings: any[];
    metafile?: any;
    outputFiles?: any[];
  };
}

/**
 * Callback invoked before a group starts building
 * @param group - The group that is about to be built
 */
export type OnBuildStartCallback = (group: FlexGroup) => void | Promise<void>;

/**
 * Callback invoked after a group finishes building (success or failure)
 * @param group - The group that was built
 * @param result - The esbuild build result
 */
export type OnBuildEndCallback = (group: FlexGroup, result: BuildResult['result']) => void | Promise<void>;

/**
 * Callback invoked after all groups finish building (only in non-watch mode)
 * @param results - Array of all build results
 */
export type OnAllBuildsCompleteCallback = (results: BuildResult[]) => void | Promise<void>;

/**
 * Options for the programmatic build API
 */
export interface BuildApiOptions {
  /**
   * Path to the configuration file
   * @default 'esbuild-flex.config.js'
   */
  configPath?: string;

  /**
   * Enable watch mode
   * @default false
   */
  watch?: boolean;

  /**
   * Filter groups by tags. Only groups with at least one matching tag will be built.
   */
  tags?: string[];

  /**
   * Callback invoked before each group starts building
   */
  onBuildStart?: OnBuildStartCallback;

  /**
   * Callback invoked after each group finishes building
   */
  onBuildEnd?: OnBuildEndCallback;

  /**
   * Callback invoked after all groups finish building (only in non-watch mode)
   */
  onAllBuildsComplete?: OnAllBuildsCompleteCallback;
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

/**
 * Programmatic build API
 * @param options - Build options including callbacks
 */
export function build(options?: BuildApiOptions): Promise<void>;

declare const config: FlexConfig;
export default config;
