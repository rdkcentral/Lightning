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

let outDir = 'dist';
let entry = resolve(__dirname, 'src/lightning.mjs');
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

export default defineConfig(() => {
  return {
    plugins: [
      fixTsImportsFromJs(),
      /* Cleanup comments */
      cleanup({
        comments: 'none',
      }),
      /* ES5 (if requested) */
      isEs5Build && babel({
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
        ],
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
        './node_modules/**',
        './tests/**'
      ]
    }
  }
});
