import license from 'rollup-plugin-license';
import pkg from './package.json';

export default {
    input: './src/lightning.mjs',
    plugins: [

        /* Add version number to bundle */
        license({
            banner: `Lightning v<%= pkg.version %>\n\n https://github.com/WebPlatformForEmbedded/Lightning`,
          }),
    ],
    output: {
        file: './dist/lightning-web.js',
        format: 'iife',
        name: 'lng'
    }
};
