const resolve = require('./rollup.plugin.resolver');

export default {
    input: './lightning.mjs',
    plugins: [resolve("web")],
    output: {
        file: './dist/lightning-web.js',
        format: 'iife',
        name: 'lng'
    }
};