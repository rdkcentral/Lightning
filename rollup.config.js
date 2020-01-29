import license from 'rollup-plugin-license';
import { terser } from 'rollup-plugin-terser';
import babel from 'rollup-plugin-babel';

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
        format: 'umd',
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
        format: 'umd',
        name: 'lng',
        sourcemap: true,
    }

},
{
    /** lightning.es5.js */
    input: './src/lightning.mjs',
    plugins: [

        /* Add version number to bundle */
        license({
            banner: `Lightning v<%= pkg.version %>\n\n https://github.com/WebPlatformForEmbedded/Lightning`,
        }),
        babel({
            presets: [
                [
                '@babel/env',
                {
                    targets: {
                        ie: '11',
                    },
                    spec: true,
                    debug: false
                },
                ],
            ],
            plugins: ['@babel/plugin-transform-spread', '@babel/plugin-transform-parameters'],
        }),
    ],
    output: {
        file: './dist/lightning.es5.js',
        format: 'umd',
        name: 'lng'
    }
},
{
    /** lightning.es5.min.js */
    input: './src/lightning.mjs',
    plugins: [
        terser(TERSER_CONFIG),

        /* Add version number to bundle */
        license({
            banner: `Lightning v<%= pkg.version %>\n\n https://github.com/WebPlatformForEmbedded/Lightning`,
        }),
        babel({
            presets: [
                [
                '@babel/env',
                {
                    targets: {
                        ie: '11',
                    },
                    spec: true,
                    debug: false
                },
                ],
            ],
            plugins: ['@babel/plugin-transform-spread', '@babel/plugin-transform-parameters'],
        }),
    ],
    output: {
        file: './dist/lightning.es5.min.js',
        format: 'umd',
        name: 'lng',
        sourcemap: true,
    }
},
{
    /** lightning-inspect.es5.js */
    input: './devtools/lightning-inspect.js',
    plugins: [

        babel({
            presets: [
                [
                '@babel/env',
                {
                    targets: {
                        ie: '11',
                    },
                    spec: true,
                    debug: false
                },
                ],
            ],
            plugins: ['@babel/plugin-transform-spread', '@babel/plugin-transform-parameters'],
        }),
    ],
    output: {
        file: './devtools/lightning-inspect.es5.js',
        format: 'umd',
        name: 'lng'
    }
},
]
