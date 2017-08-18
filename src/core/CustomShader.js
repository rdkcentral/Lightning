/**
 * Copyright Metrological, 2017
 */

let Shader = require('./Shader')

class CustomShader extends Shader {

    enableAttribs() {
        // Override to not setup defaults.
    }

    disableAttribs() {
        // Override to not setup defaults.
    }

    draw(operation) {
        // Extend / implement.
    }

    setupUniforms(operation) {
        // Add required uniforms.
    }

    addEmpty() {
        // Make sure that shader is drawn even if there are no quads.
        return true
    }

    supportsMerging() {
        return false
    }

}

module.exports = CustomShader;