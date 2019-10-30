import license from 'rollup-plugin-license';
import { terser } from 'rollup-plugin-terser';

const TERSER_CONFIG = {
    keep_classnames: true,
    keep_fnames: true,
    sourcemap: true,
}

export default [{
    /** lightning.js */
    input: './src/lightning.mjs',
    plugins: [

        /* Add version number to bundle */
        license({
            banner: `Lightning v<%= pkg.version %>\n\n https://github.com/WebPlatformForEmbedded/Lightning`,
          }),
    ],
    output: {
        file: './dist/lightning.js',
        format: 'iife',
        name: 'lng'
    }
},

{
    /** lightning.min.js */
    input: './src/lightning.mjs',
    plugins: [
        terser(TERSER_CONFIG),

        /* Add version number to bundle */
        license({
            banner: `Lightning v<%= pkg.version %>\n\n https://github.com/WebPlatformForEmbedded/Lightning`,
          }),
    ],
    output: {
        file: './dist/lightning.min.js',
        format: 'iife',
        name: 'lng',
        sourcemap: true,
    }

}];
