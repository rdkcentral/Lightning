import { resolve } from 'path'
import { defineConfig } from 'vite'
import { babel } from '@rollup/plugin-babel';
import cleanup from 'rollup-plugin-cleanup';
import license from 'rollup-plugin-license';

const isEs5Build = process.env.BUILD_ES5 === 'true';
const isMinifiedBuild = process.env.BUILD_MINIFY === 'true';

export default defineConfig(({ command, mode, ssrBuild }) => {
  return {
    plugins: [
      /* Cleanup comments */
      cleanup({
        comments: 'none',
        extensions: ['mjs']
      }),
      // !!! License banner NOT working right now !!!
      /* Add version number to bundle */
      license({
        banner: `Lightning v<%= pkg.version %>\n\n https://github.com/rdkcentral/Lightning`,
      }),
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
    ],
    build: {
      sourcemap: isMinifiedBuild,
      emptyOutDir: false,
      outDir: 'dist-vite',
      minify: isMinifiedBuild ? 'terser' : false,
      terserOptions: {
        keep_classnames: true,
        keep_fnames: true,
      },
      lib: {
        // Could also be a dictionary or array of multiple entry points
        entry: resolve(__dirname, 'src/lightning.mjs'),
        formats: ['umd'],
        name: 'lng',
        // the proper extensions will be added
        fileName: () => {
          let extension = isMinifiedBuild ? '.min.js' : '.js';
          if (isEs5Build) {
            extension = '.es5' + extension;
          }
          return 'lightning' + extension;
        }
      },
    },
    vitest: {
      commandLine: 'npm test --',
    },
  }
});
