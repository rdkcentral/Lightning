import WebGLRenderer from "../webgl/WebGLRenderer.mjs";
import SparkShader from "./shaders/SparkShader.mjs";

export default class SparkRenderer extends WebGLRenderer {

    constructor(stage) {
        super(stage);
    }

    _createDefaultShader(ctx) {
        return new SparkShader(ctx);
    }
}