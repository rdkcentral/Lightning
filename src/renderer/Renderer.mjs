export default class Renderer {

    constructor(stage) {
        this.stage = stage;
        this._defaultShader = undefined;
    }

    gc(aggressive) {
    }

    destroy() {
    }

    getDefaultShader(ctx = this.stage.ctx) {
        if (!this._defaultShader) {
            this._defaultShader = this._createDefaultShader(ctx);
        }
        return this._defaultShader;
    }

    _createDefaultShader(ctx) {
    }

    isValidShaderType(shaderType) {
        return (shaderType.prototype instanceof this._getShaderBaseType());
    }

    createShader(ctx, settings) {
        const shaderType = settings.type;
        // If shader type is not correct, use a different platform.
        if (!this.isValidShaderType(shaderType)) {
            const convertedShaderType = this._getShaderAlternative(shaderType);
            if (!convertedShaderType) {
                console.warn("Shader has no implementation for render target: " + shaderType.name);
                return this._createDefaultShader(ctx);
            }
            return new convertedShaderType(ctx);
        } else {
            const shader = new shaderType(ctx);
            Base.patchObject(this, settings);
            return shader;
        }
    }

    _getShaderBaseType() {
    }

    _getShaderAlternative(shaderType) {
        return this.getDefaultShader();
    }

    copyRenderTexture(renderTexture, nativeTexture, options) {
        console.warn('copyRenderTexture not supported by renderer');
    }
}

import Base from "../tree/Base.mjs";
