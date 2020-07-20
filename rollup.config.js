/*
 * If not stated otherwise in this file or this component's LICENSE file the
 * following copyright and licenses apply:
 *
 * Copyright 2020 RDK Management
 *
 * Licensed under the Apache License, Version 2.0 (the License);
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import license from 'rollup-plugin-license';
import cleanup from 'rollup-plugin-cleanup';
import { terser } from 'rollup-plugin-terser';
import babel from 'rollup-plugin-babel';

const TERSER_CONFIG = {
    keep_classnames: true,
    keep_fnames: true,
    sourcemap: true,
}

const CLEANUP_CONFIG = {
    comments: 'none',
    extensions: ['mjs']
}

export default [{
    /** lightning.js */
    input: './src/lightning.mjs',
    plugins: [

        /* Cleanup comments */
        cleanup(CLEANUP_CONFIG),

        /* Add version number to bundle */
        license({
            banner: `Lightning v<%= pkg.version %>\n\n https://github.com/rdkcentral/Lightning`,
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
            banner: `Lightning v<%= pkg.version %>\n\n https://github.com/rdkcentral/Lightning`,
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

        /* Cleanup comments */
        cleanup(),

        /* Add version number to bundle */
        license({
            banner: `Lightning v<%= pkg.version %>\n\n https://github.com/rdkcentral/Lightning`,
        }),
        babel({
            presets: [
                [
                '@babel/env',
                {
                    targets: {
                        chrome: '39',
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
            banner: `Lightning v<%= pkg.version %>\n\n https://github.com/rdkcentral/Lightning`,
        }),
        babel({
            presets: [
                [
                '@babel/env',
                {
                    targets: {
                        chrome: '39',
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
                        chrome: '39',
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
