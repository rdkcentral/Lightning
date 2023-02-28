// @ts-check
/// <reference types="vitest" />
import { resolve } from 'path'
import { defineConfig } from 'vite'
import { babel } from '@rollup/plugin-babel';
import { banner } from './banner.vite-plugin';
import dts from 'vite-plugin-dts';
// @ts-expect-error Ignore esModuleInterop error ts(1259)
import cleanup from 'rollup-plugin-cleanup';
// @ts-expect-error Ignore "Consider using --resolveJsonModule" error ts(2732)
import packageJson from './package.json';

const isEs5Build = process.env.BUILD_ES5 === 'true';
const isMinifiedBuild = process.env.BUILD_MINIFY === 'true';

export default defineConfig(() => {
  return {
    plugins: [
      dts(),
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
      sourcemap: true,
      emptyOutDir: false,
      outDir: 'dist',
      minify: isMinifiedBuild ? 'terser' : false,
      terserOptions: {
        keep_classnames: true,
        keep_fnames: true,
      },
      lib: {
        // Could also be a dictionary or array of multiple entry points
        entry: resolve(__dirname, 'src/lightning.mjs'),
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
          return 'lightning' + extension;
        }
      },
    },
  }
});
