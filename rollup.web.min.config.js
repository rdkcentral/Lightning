import { uglify } from "rollup-plugin-uglify";

export default {
    input: './dist/lightning-web.mjs',
    output: {
        file: './dist/lightning-web.min.js',
        plugins: [uglify()],
        format: 'iife',
        name: 'lng'
    }
};