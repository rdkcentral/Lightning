const compiler = require('rollup-plugin-closure-compiler')

export default {
    input: './src/lightning-web.mjs',
    plugins: [compiler({
        compilation_level: "SIMPLE",
        language_out: "ECMASCRIPT_2015"
    })],
    output: {
        file: './dist/lightning-web.min.js',
        format: 'iife',
        name: 'lng'
    }
};