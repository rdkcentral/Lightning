// @ts-check
/// <reference types="vitest" />
import { resolve } from 'path'
import { defineConfig } from 'vite'
import { babel } from '@rollup/plugin-babel';
import { banner } from './banner.vite-plugin';
import cleanup from 'rollup-plugin-cleanup';
import packageJson from './package.json';
import { fixTsImportsFromJs } from './fixTsImportsFromJs.vite-plugin';

const isEs5Build = process.env.BUILD_ES5 === 'true';
const isMinifiedBuild = process.env.BUILD_MINIFY === 'true';
const isInspectorBuild = process.env.BUILD_INSPECTOR === 'true';
const isBidiTokenizerBuild = process.env.BUILD_BIDI_TOKENIZER === 'true';

let outDir = 'dist';
let entry = resolve(__dirname, 'src/index.ts');
let outputBase = 'lightning';
let sourcemap = true;
let useDts = true;

if (isInspectorBuild) {
  outDir = 'devtools';
  entry = resolve(__dirname, 'devtools/lightning-inspect.js');
  outputBase = 'lightning-inspect';
  sourcemap = false;
  useDts = false;
}

if (isBidiTokenizerBuild) {
  outDir = 'dist';
  entry = resolve(__dirname, 'src/textures/bidiTokenizer.ts');
  outputBase = 'bidiTokenizer';
  sourcemap = true;
  useDts = true;
}

export default defineConfig(() => {
  return {
    // Disable esbuild completely for ES5 builds
    esbuild: isEs5Build ? false : undefined,
    plugins: [
      fixTsImportsFromJs(),
      /* Cleanup comments */
      cleanup({
        comments: 'none',
      }),
      /* ES5 (if requested) */
      isEs5Build && babel({
        babelHelpers: 'bundled',
        exclude: 'node_modules/**',
        extensions: ['.js', '.ts', '.mjs', '.mts'],
        presets: [
          [
            '@babel/preset-env',
            {
              targets: {
                chrome: '39',
              },
              spec: true,
              debug: false,
              modules: false,
            },
          ],
          '@babel/preset-typescript'
        ]
      }),
      /* Add comment banner to top of bundle */
      banner([
        '/*',
        ` * Lightning v${packageJson.version}`,
        ' *',
        ' * https://github.com/rdkcentral/Lightning',
        ' */',
      ].join('\n')),
    ],
    build: {
      sourcemap,
      emptyOutDir: false,
      outDir,
      minify: isMinifiedBuild ? 'terser' : false,
      terserOptions: {
        keep_classnames: true,
        keep_fnames: true,
      },
      // Disable esbuild for ES5 builds to let Babel handle transpilation
      target: isEs5Build ? false : 'esnext',
      lib: {
        // Could also be a dictionary or array of multiple entry points
        entry,
        /**
         * @type {import('vite').LibraryFormats[]}
         */
        formats: ['umd', .../** @type {[] | ['es']} */ (isEs5Build ? [] : ['es'])],
        name: 'lng',
        // the proper extensions will be added
        fileName: (format) => {
          let extension = isMinifiedBuild ? '.min.js' : '.js';
          if (isEs5Build) {
            extension = '.es5' + extension;
          }
          if (format === 'es') {
            extension = '.esm' + extension;
          }
          return outputBase + extension;
        }
      },
    },
    test: {
      exclude: [
        './dist/**',
        './node_modules/**',
        './tests/**'
      ]
    }
  }
});
