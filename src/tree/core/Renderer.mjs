export default class Renderer {

    constructor(stage) {
        this.stage = stage;
        this._defaultShader = undefined;
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

    createShader(shaderType, ctx) {
        // If shader type is not correct, use a different platform.
        if (!this.isValidShaderType(shaderType)) {
            const convertedShaderType = this._getShaderAlternative(shaderType);
            if (!convertedShaderType) {
                console.warn("Shader has no implementation for render target: " + shaderType.name);
                return this.getDefaultShader();
            }
            shaderType = convertedShaderType;
        }

        return new shaderType(ctx);
    }

    _getShaderBaseType() {
    }

    _getShaderAlternative(shaderType) {
        return this.getDefaultShader();
    }

}