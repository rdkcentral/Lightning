const resolve = require('./rollup.plugin.resolver');

export default {
    input: './lightning.mjs',
    plugins: [resolve("node")],
    output: {
        file: './dist/lightning-node.js',
        format: 'cjs',
        name: 'lng'
    }
};