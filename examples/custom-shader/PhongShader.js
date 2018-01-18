/**
 * Copyright Metrological, 2017
 */

let Shader = require('../../src/core/Shader')

// @see https://www.tomdalling.com/blog/modern-opengl/07-more-lighting-ambient-specular-attenuation-gamma/

class PhongShader extends Shader {

    constructor(ctx) {
        super(ctx)
        this._radius = 5.5
        this._x = 0
        this._y = 350
        this._z = -100
    }

    getFragmentShaderSource() {
        return PhongShader.fragmentShaderSource
    }

    get radius() {
        return this._radius
    }

    set radius(v) {
        this._radius = v
        this.redraw()
    }

    get x() {
        return this._x
    }

    set x(v) {
        this._x = v
        this.redraw()
    }

    get y() {
        return this._y
    }

    set y(v) {
        this._y = v
        this.redraw()
    }

    setupUniforms(operation) {
        super.setupUniforms(operation)
        this._setUniform("resolution", new Float32Array([operation.getRenderWidth(), operation.getRenderHeight()]), this.gl.uniform2fv)
        this._setUniform("radius", this._radius, this.gl.uniform1f)
        this._setUniform("light", new Float32Array([this._x, this._y, this._z]), this.gl.uniform3fv)
    }

}

PhongShader.fragmentShaderSource = `
    #ifdef GL_ES
    precision lowp float;
    #endif
    varying vec2 vTextureCoord;
    varying vec4 vColor;
    uniform sampler2D uSampler;
    uniform float radius;
    uniform vec2 resolution;
    uniform vec3 light;

    void main(void){
        /* Phase 1: get z, n (normal vector), diffuseColor, specularColor */
        vec2 p = gl_FragCoord.xy - 0.5 * resolution;
        
        float dist = sqrt(dot(p, p));
        
        vec3 pos = vec3(p, radius * cos(dist * 0.05));
        
        vec3 dx = vec3(1.0, 0.0, radius * -0.05 * sin(dist * 0.05));
        vec3 dy = vec3(0.0, 1.0, 0.0);
        vec3 normal = normalize(cross(dx, dy));
        
        float ambient = 0.2;
        vec3 lightColor = vec3(1.0, 1.0, 1.0);
        vec4 diffuseColor = vec4(1.0, 1.0, 1.0, 1.0) * 0.8;
        vec3 specularColor = vec3(1.0, 1.0, 1.0);
        float specular = 0.8;
        float attenuation = 0.000001;
        vec3 lightPos = light;
        lightPos.xy -= 0.5 * resolution;
        
        /* Phase 2: apply ambient & diffuse light */
        vec3 surfaceToLight = (lightPos - pos);
        vec3 normSurfaceToLight = normalize(surfaceToLight);

        float intensity = 1.0 / (1.0 + attenuation * dot(surfaceToLight, surfaceToLight));
        vec3 color = intensity * (lightColor * diffuseColor.rgb * (ambient + dot(normal, -normSurfaceToLight)));
        
        /* Phase 3: apply specular light */
        vec3 reflectionVector = reflect(-normSurfaceToLight, normal);
        float cosAngle = max(0.0, dot(normalize(-pos), reflectionVector));
        cosAngle = cosAngle * cosAngle * cosAngle * cosAngle;
        color += specular * specularColor * intensity * cosAngle;
        
        gl_FragColor = vec4(color, diffuseColor.a);
    }
`;

module.exports = PhongShader