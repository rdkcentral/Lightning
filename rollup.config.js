const resolve = require('./rollup.plugin.resolver');

export default {
    input: './examples/examples.mjs',
    plugins: [resolve("web")],
    output: {
        file: './dist/lightning-web.js',
        format: 'iife',
        name: 'lng'
    }
};