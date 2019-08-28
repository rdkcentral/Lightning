const resolve = require('./rollup.plugin.resolver');

export default {
    input: './src/lightning.mjs', './examples/water-waves/WaterWaveShader.mjs'
    plugins: [resolve("web")],
    output: {
        file: './dist/lightning-web.js',
        format: 'iife',
        name: 'lng'
    }
};