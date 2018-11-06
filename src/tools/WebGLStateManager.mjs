class Utils {

    static isFunction(value) {
        return typeof value === 'function';
    }

    static isNumber(value) {
        return typeof value === 'number';
    }

    static isInteger(value) {
        return (typeof value === 'number' && (value % 1) === 0);
    }

    static isBoolean(value) {
        return value === true || value === false;
    }

    static isString(value) {
        return typeof value == 'string';
    }

    static isObject(value) {
        let type = typeof value;
        return !!value && (type == 'object' || type == 'function');
    }

    static isPlainObject(value) {
        let type = typeof value;
        return !!value && (type == 'object');
    }

    static isObjectLiteral(value){
        return typeof value === 'object' && value && value.constructor === Object
    }

    static getArrayIndex(index, arr) {
        return Utils.getModuloIndex(index, arr.length);
    }

    static equalValues(v1, v2) {
        if ((typeof v1) !== (typeof v2)) return false
        if (Utils.isObjectLiteral(v1)) {
            return Utils.isObjectLiteral(v2) && Utils.equalObjectLiterals(v1, v2)
        } else if (Array.isArray(v1)) {
            return Array.isArray(v2) && Utils.equalArrays(v1, v2)
        } else {
            return v1 === v2
        }
    }

    static equalObjectLiterals(obj1, obj2) {
        let keys1 = Object.keys(obj1);
        let keys2 = Object.keys(obj2);
        if (keys1.length !== keys2.length) {
            return false
        }

        for (let i = 0, n = keys1.length; i < n; i++) {
            const k1 = keys1[i];
            const k2 = keys2[i];
            if (k1 !== k2) {
                return false
            }

            const v1 = obj1[k1];
            const v2 = obj2[k2];

            if (!Utils.equalValues(v1, v2)) {
                return false
            }
        }

        return true;
    }

    static equalArrays(v1, v2) {
        if (v1.length !== v2.length) {
            return false
        }
        for (let i = 0, n = v1.length; i < n; i++) {
            if (!this.equalValues(v1[i], v2[i])) {
                return false
            }
        }

        return true
    }

}

/**
 * Maintains the state of a WebGLRenderingContext.
 */
class WebGLState {

    constructor(id, gl) {
        this._id = id;
        this._gl = gl;
        this._program = undefined;
        this._buffers = new Map();
        this._framebuffers = new Map();
        this._renderbuffers = new Map();

        // Contains vertex attribute definition arrays (enabled, size, type, normalized, stride, offset).
        this._vertexAttribs = new Array(16);
        this._nonDefaultFlags = new Set();
        this._settings = new Map();
        this._textures = new Array(8);
        this._maxTexture = 0;
        this._activeTexture = gl.TEXTURE0;
        this._pixelStorei = new Array(5);
    }

    _getDefaultFlag(cap) {
        return (cap === this._gl.DITHER);
    }

    setFlag(cap, v) {
        const def = this._getDefaultFlag(cap);
        if (v === def) {
            return this._nonDefaultFlags.delete(cap);
        } else {
            if (!this._nonDefaultFlags.has(cap)) {
                this._nonDefaultFlags.add(cap);
                return true;
            } else {
                return false;
            }
        }
    }

    setBuffer(target, buffer) {
        const change = this._buffers.get(target) !== buffer;
        this._buffers.set(target, buffer);

        if (change && (target === this._gl.ARRAY_BUFFER)) {
            // When the array buffer is changed all attributes are cleared.
            this._vertexAttribs = [];
        }

        return change;
    }

    setFramebuffer(target, buffer) {
        const change = this._framebuffers.get(target) !== buffer;
        this._framebuffers.set(target, buffer);
        return change;
    }

    setRenderbuffer(target, buffer) {
        const change = this._renderbuffers.get(target) !== buffer;
        this._renderbuffers.set(target, buffer);
        return change;
    }

    setProgram(program) {
        const change = this._program !== program;
        this._program = program;
        return change
    }

    setSetting(func, v) {
        const s = this._settings.get(func);
        const change = !s || !Utils.equalValues(s, v);
        this._settings.set(func, v);
        return change
    }

    disableVertexAttribArray(index) {
        const va = this._vertexAttribs[index];
        if (va && va[5]) {
            va[5] = false;
            return true;
        }
        return false;
    }

    enableVertexAttribArray(index) {
        const va = this._vertexAttribs[index];
        if (va) {
            if (!va[0]) {
                va[0] = true;
                return true;
            }
        } else {
            this._vertexAttribs[index] = [0, 0, 0, 0, 0, true];
            return true;
        }
        return false;
    }

    vertexAttribPointer(index, props) {
        let va = this._vertexAttribs[index];
        let equal = false;
        if (va) {
            equal = va[0] === props[0] &&
                va[1] === props[1] &&
                va[2] === props[2] &&
                va[3] === props[3] &&
                va[4] === props[4];
        }

        if (equal) {
            return false;
        } else {
            props[5] = va ? va[5] : false;
            return true;
        }
    }

    setActiveTexture(texture) {
        const changed = this._activeTexture !== texture;
        this._activeTexture = texture;
        return changed;
    }

    bindTexture(target, texture) {
        const activeIndex = WebGLState._getTextureIndex(this._activeTexture);
        this._maxTexture = Math.max(this._maxTexture, activeIndex + 1);
        const current = this._textures[activeIndex];
        const targetIndex = WebGLState._getTextureTargetIndex(target);
        if (current) {
            if (current[targetIndex] === texture) {
                return false;
            }
            current[targetIndex] = texture;
            return true;
        } else {
            if (texture) {
                this._textures[activeIndex] = [];
                this._textures[activeIndex][targetIndex] = texture;
                return true
            } else {
                return false
            }
        }
    }

    setPixelStorei(pname, param) {
        const i = WebGLState._getPixelStoreiIndex(pname);
        const change = !Utils.equalValues(this._pixelStorei[i], param);
        this._pixelStorei[i] = param;
        return change;
    }

    migrate(s) {
        const t = this;

        // Warning: migrate should call the original prototype methods directly.

        this._migrateFlags(t, s);

        // useProgram
        if (s._program !== t._program) {
            this._gl._useProgram(s._program);
        }

        this._migrateFramebuffers(t, s);
        this._migrateRenderbuffers(t, s);

        const buffersChanged = this._migrateBuffers(t, s);
        this._migrateAttributes(t, s, buffersChanged);

        this._migrateFlags(t, s);

        this._migrateSettings(t, s);

        this._migratePixelStorei(t, s);
        
        this._migrateTextures(t, s);
        
    }

    _migratePixelStorei(t, s) {
        for (let i = 0, n = t._pixelStorei.length; i < n; i++) {
            if (t._pixelStorei[i] !== s._pixelStorei[i]) {
                const value = s._pixelStorei[i] !== undefined ? s._pixelStorei[i] : WebGLState._getDefaultPixelStoreiByIndex(i);
                this._gl._pixelStorei(WebGLState._getPixelStoreiByIndex(i), value);
            }
        }
    }

    _migrateTextures(t, s) {
        const max = Math.max(t._maxTexture, s._maxTexture);

        let activeTexture = t._activeTexture;

        for (let i = 0; i < max; i++) {
            const sTargets = s._textures[i];
            const tTargets = t._textures[i];
            const textureNumb = WebGLState._getTextureByIndex(i);

            const targetMax = Math.max(tTargets ? tTargets.length : 0, sTargets ? sTargets.length : 0);
            for (let j = 0, n = targetMax; j < n; j++) {
                const target = WebGLState._getTextureTargetByIndex(j);
                if (activeTexture !== textureNumb) {
                    this._gl._activeTexture(textureNumb);
                    activeTexture = textureNumb;
                }

                const texture = (sTargets && sTargets[j]) || null;
                this._gl._bindTexture(target, texture);
            }
        }

        if (s._activeTexture !== activeTexture) {
            this._gl._activeTexture(s._activeTexture);
        }
    }

    _migrateBuffers(t, s) {
        s._buffers.forEach((framebuffer, target) => {
            if (t._buffers.get(target) !== framebuffer) {
                this._gl._bindBuffer(target, framebuffer);
            }
        });

        t._buffers.forEach((buffer, target) => {
            const b = s._buffers.get(target);
            if (b === undefined) {
                this._gl._bindBuffer(target, null);
            }
        });
        return (s._buffers.get(this._gl.ARRAY_BUFFER) !== t._buffers.get(this._gl.ARRAY_BUFFER))
    }

    _migrateFramebuffers(t, s) {
        s._framebuffers.forEach((framebuffer, target) => {
            if (t._framebuffers.get(target) !== framebuffer) {
                this._gl._bindFramebuffer(target, framebuffer);
            }
        });

        t._framebuffers.forEach((framebuffer, target) => {
            const fb = s._framebuffers.get(target);
            if (fb === undefined) {
                this._gl._bindFramebuffer(target, null);
            }
        });
    }

    _migrateRenderbuffers(t, s) {
        s._renderbuffers.forEach((renderbuffer, target) => {
            if (t._renderbuffers.get(target) !== renderbuffer) {
                this._gl._bindRenderbuffer(target, renderbuffer);
            }
        });

        t._renderbuffers.forEach((renderbuffer, target) => {
            const fb = s._renderbuffers.get(target);
            if (fb === undefined) {
                this._gl._bindRenderbuffer(target, null);
            }
        });
    }

    _migrateAttributes(t, s, buffersChanged) {

        if (!buffersChanged) {
            t._vertexAttribs.forEach((attrib, index) => {
                if (!s._vertexAttribs[index]) {
                    // We can't 'delete' a vertex attrib so we'll disable it.
                    this._gl._disableVertexAttribArray(index);
                }
            });

            s._vertexAttribs.forEach((attrib, index) => {
                this._gl._vertexAttribPointer(index, attrib[0], attrib[1], attrib[2], attrib[4]);
                if (attrib[5]) {
                    this._gl._enableVertexAttribArray(index);
                } else {
                    this._gl._disableVertexAttribArray(index);
                }
            });
        } else {
            // When buffers are changed, previous attributes were reset automatically.
            s._vertexAttribs.forEach((attrib, index) => {
                if (attrib[0]) {
                    // Do not set vertex attrib pointer when it was just the default value.
                    this._gl._vertexAttribPointer(index, attrib[0], attrib[1], attrib[2], attrib[3], attrib[4]);
                }
                if (attrib[5]) {
                    this._gl._enableVertexAttribArray(index);
                }
            });
        }
    }

    _migrateSettings(t, s) {
        const defaults = this.constructor.getDefaultSettings();
        t._settings.forEach((value, func) => {
            const name = func.name || func.xname;
            if (!s._settings.has(func)) {
                let args = defaults.get(name);
                if (Utils.isFunction(args)) {
                    args = args(this._gl);
                }
                // We are actually setting the setting for optimization purposes.
                s._settings.set(func, args);
                func.apply(this._gl, args);
            }
        });
        s._settings.forEach((value, func) => {
            const tValue = t._settings.get(func);
            if (!tValue || !Utils.equalValues(tValue, value)) {
                func.apply(this._gl, value);
            }
        });
    }

    _migrateFlags(t, s) {
        t._nonDefaultFlags.forEach(setting => {
            if (!s._nonDefaultFlags.has(setting)) {
                if (this._getDefaultFlag(setting)) {
                    this._gl._enable(setting);
                } else {
                    this._gl._disable(setting);
                }
            }
        });
        s._nonDefaultFlags.forEach(setting => {
            if (!t._nonDefaultFlags.has(setting)) {
                if (this._getDefaultFlag(setting)) {
                    this._gl._disable(setting);
                } else {
                    this._gl._enable(setting);
                }
            }
        });
    }

    static getDefaultSettings() {
        if (!this._defaultSettings) {
            this._defaultSettings = new Map();
            const d = this._defaultSettings;
            const g = WebGLRenderingContext.prototype;
            d.set("viewport", function(gl) {return [0,0,gl.canvas.width, gl.canvas.height]});
            d.set("scissor", function(gl) {return [0,0,gl.canvas.width, gl.canvas.height]});
            d.set("blendColor", [0, 0, 0, 0]);
            d.set("blendEquation", [g.FUNC_ADD]);
            d.set("blendEquationSeparate", [g.FUNC_ADD, g.FUNC_ADD]);
            d.set("blendFunc", [g.ONE, g.ZERO]);
            d.set("blendFuncSeparate", [g.ONE, g.ZERO, g.ONE, g.ZERO]);
            d.set("clearColor", [0, 0, 0, 0]);
            d.set("clearDepth", [1]);
            d.set("clearStencil", [0]);
            d.set("colorMask", [true, true, true, true]);
            d.set("cullFace", [g.BACK]);
            d.set("depthFunc", [g.LESS]);
            d.set("depthMask", [true]);
            d.set("depthRange", [0, 1]);
            d.set("frontFace", [g.CCW]);
            d.set("lineWidth", [1]);
            d.set("polygonOffset", [0, 0]);
            d.set("sampleCoverage", [1, false]);
            d.set("stencilFunc", [g.ALWAYS, 0, 1]);
            d.set("_stencilFuncSeparateFront", [g.ALWAYS, 0, 1]);
            d.set("_stencilFuncSeparateBack", [g.ALWAYS, 0, 1]);
            d.set("_stencilFuncSeparateFrontAndBack", [g.ALWAYS, 0, 1]);
            d.set("stencilMask", [1]);
            d.set("_stencilMaskSeparateFront", [1]);
            d.set("_stencilMaskSeparateBack", [1]);
            d.set("_stencilMaskSeparateFrontAndBack", [1]);
            d.set("stencilOp", [g.KEEP, g.KEEP, g.KEEP]);
            d.set("_stencilOpSeparateFront", [g.KEEP, g.KEEP, g.KEEP]);
            d.set("_stencilOpSeparateBack", [g.KEEP, g.KEEP, g.KEEP]);
            d.set("_stencilOpSeparateFrontAndBack", [g.KEEP, g.KEEP, g.KEEP]);
            d.set("vertexAttrib1f", []);
            d.set("vertexAttrib1fv", []);
            d.set("vertexAttrib2f", []);
            d.set("vertexAttrib2fv", []);
            d.set("vertexAttrib3f", []);
            d.set("vertexAttrib3fv", []);
            d.set("vertexAttrib4f", []);
            d.set("vertexAttrib4fv", []);
        }
        return this._defaultSettings
    }

    static _getTextureTargetIndex(target) {
        switch(target) {
            case 0x0DE1:
                /* TEXTURE_2D */
                return 0;
            case 0x8513:
                /* TEXTURE_CUBE_MAP */
                return 1;
            default:
                // Shouldn't happen.
                throw new Error('Unknown texture target: ' + target);
        }
    }

    static _getTextureTargetByIndex(index) {
        if (!this._textureTargetIndices) {
            this._textureTargetIndices = [0x0DE1, 0x8513];
        }
        return this._textureTargetIndices[index]
    }

    static _getTextureIndex(index) {
        return index - 0x84C0 /* GL_TEXTURE0 */;
    }

    static _getTextureByIndex(index) {
        return index + 0x84C0;
    }

    static _getPixelStoreiIndex(pname) {
        switch(pname) {
            case 0x0D05:
                /* PACK_ALIGNMENT */
                return 0;
            case 0x0CF5:
                /* UNPACK_ALIGNMENT */
                return 1;
            case 0x9240:
                /* UNPACK_FLIP_Y_WEBGL */
                return 2;
            case 0x9241:
                /* UNPACK_PREMULTIPLY_ALPHA_WEBGL */
                return 3;
            case 0x9243:
                /* UNPACK_COLORSPACE_CONVERSION_WEBGL */
                return 4;
                //@todo: support WebGL2 properties, see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/pixelStorei
            case 0x9245:
                /* UNPACK_FLIP_BLUE_RED */
                return 5;
            default:
                // Shouldn't happen.
                throw new Error('Unknown pixelstorei: ' + pname);
        }
    }

    static _getPixelStoreiByIndex(index) {
        if (!this._pixelStoreiIndices) {
            this._pixelStoreiIndices = [0x0D05, 0x0CF5, 0x9240, 0x9241, 0x9243];
        }
        return this._pixelStoreiIndices[index]
    }

    static _getDefaultPixelStoreiByIndex(index) {
        if (!this._pixelStoreiDefaults) {
            this._pixelStoreiDefaults = [4, 4, false, false, WebGLRenderingContext.prototype.BROWSER_DEFAULT_WEBGL];
        }
        return this._pixelStoreiDefaults[index]
    }
}

class WebGLStateManager {

    _initStateManager(id = "default") {
        this._states = {};
        this._state = this._getState(id);
    }

    _getState(id) {
        if (!this._states[id]) {
            this._states[id] = new WebGLState(id, this);
        }
        return this._states[id];
    }

    switchState(id = "default") {
        if (this._state._id !== id) {
            const newState = this._getState(id);
            this._state.migrate(newState);
            this._state = newState;
        }
    }

    $useProgram(program) {
        if (this._state.setProgram(program))
            this._useProgram(program);
    }

    $bindBuffer(target, fb) {
        if (this._state.setBuffer(target, fb))
            this._bindBuffer(target, fb);
    }

    $bindFramebuffer(target, fb) {
        if (this._state.setFramebuffer(target, fb))
            this._bindFramebuffer(target, fb);
    }

    $bindRenderbuffer(target, fb) {
        if (this._state.setRenderbuffer(target, fb))
            this._bindRenderbuffer(target, fb);
    }

    $enable(cap) {
        if (this._state.setFlag(cap, true))
            this._enable(cap);
    }

    $disable(cap) {
        if (this._state.setFlag(cap, false))
            this._disable(cap);
    }

    $viewport(x, y, w, h) {
        if (this._state.setSetting(this._viewport, [x, y, w, h]))
            this._viewport(x, y, w, h);
    }

    $scissor(x, y, w, h) {
        if (this._state.setSetting(this._scissor, [x, y, w, h]))
            this._scissor(x, y, w, h);
    }

    $disableVertexAttribArray(index) {
        if (this._state.disableVertexAttribArray(index))
            this._disableVertexAttribArray(index);
    }

    $enableVertexAttribArray(index) {
        if (this._state.enableVertexAttribArray(index))
            this._enableVertexAttribArray(index);
    }

    $vertexAttribPointer(index, size, type, normalized, stride, offset) {
        if (this._state.vertexAttribPointer(index, [size, type, normalized, stride, offset]))
            this._vertexAttribPointer(index, size, type, normalized, stride, offset);
    }

    $activeTexture(texture) {
        if (this._state.setActiveTexture(texture))
            this._activeTexture(texture);
    }

    $bindTexture(target, texture) {
        if (this._state.bindTexture(target, texture))
            this._bindTexture(target, texture);
    }

    $pixelStorei(pname, param) {
        if (this._state.setPixelStorei(pname, param)) {
            this._pixelStorei(pname, param);
        }
    }

    $stencilFuncSeparate(face, func, ref, mask) {
        let f;
        switch(face) {
            case this.FRONT:
                f = this._stencilFuncSeparateFront;
                break;
            case this.BACK:
                f = this._stencilFuncSeparateBack;
                break;
            case this.FRONT_AND_BACK:
                f = this._stencilFuncSeparateFrontAndBack;
                break;
        }

        if (this._state.setSetting(f, [func, ref, mask]))
            f.apply(this, [func, ref, mask]);
    }

    _stencilFuncSeparateFront(func, ref, mask) {
        this._stencilFuncSeparate(this.FRONT, func, ref, mask);
    }

    _stencilFuncSeparateBack(func, ref, mask) {
        this._stencilFuncSeparate(this.BACK, func, ref, mask);
    }

    _stencilFuncSeparateFrontAndBack(func, ref, mask) {
        this._stencilFuncSeparate(this.FRONT_AND_BACK, func, ref, mask);
    }

    $stencilMaskSeparate(face, mask) {
        let f;
        switch(face) {
            case this.FRONT:
                f = this._stencilMaskSeparateFront;
                break;
            case this.BACK:
                f = this._stencilMaskSeparateBack;
                break;
            case this.FRONT_AND_BACK:
                f = this._stencilMaskSeparateFrontAndBack;
                break;
        }

        if (this._state.setSetting(f, [mask]))
            f.apply(this, [mask]);
    }

    _stencilMaskSeparateFront(mask) {
        this._stencilMaskSeparate(this.FRONT, mask);
    }

    _stencilMaskSeparateBack(mask) {
        this._stencilMaskSeparate(this.BACK, mask);
    }

    _stencilMaskSeparateFrontAndBack(mask) {
        this._stencilMaskSeparate(this.FRONT_AND_BACK, mask);
    }

    $stencilOpSeparate(face, fail, zfail, zpass) {
        let f;
        switch(face) {
            case this.FRONT:
                f = this._stencilOpSeparateFront;
                break;
            case this.BACK:
                f = this._stencilOpSeparateBack;
                break;
            case this.FRONT_AND_BACK:
                f = this._stencilOpSeparateFrontAndBack;
                break;
        }

        if (this._state.setSetting(f, [fail, zfail, zpass]))
            f.apply(this, [fail, zfail, zpass]);
    }

    _stencilOpSeparateFront(fail, zfail, zpass) {
        this._stencilOpSeparate(this.FRONT, fail, zfail, zpass);
    }

    _stencilOpSeparateBack(fail, zfail, zpass) {
        this._stencilOpSeparate(this.BACK, fail, zfail, zpass);
    }

    _stencilOpSeparateFrontAndBack(fail, zfail, zpass) {
        this._stencilOpSeparate(this.FRONT_AND_BACK, fail, zfail, zpass);
    }

    $blendColor(red, green, blue, alpha) {
        if (this._state.setSetting(this._blendColor, [red, green, blue, alpha]))
            this._blendColor(red, green, blue, alpha);
    }

    $blendEquation(mode) {
        if (this._state.setSetting(this._blendEquation, [mode]))
            this._blendEquation(mode);
    }

    $blendEquationSeparate(modeRGB, modeAlpha) {
        if (this._state.setSetting(this._blendEquationSeparate, [modeRGB, modeAlpha]))
            this._blendEquationSeparate(modeRGB, modeAlpha);
    }

    $blendFunc(sfactor, dfactor) {
        if (this._state.setSetting(this._blendFunc, [sfactor, dfactor]))
            this._blendFunc(sfactor, dfactor);
    }

    $blendFuncSeparate(srcRGB, dstRGB, srcAlpha, dstAlpha) {
        if (this._state.setSetting(this._blendFuncSeparate, [srcRGB, dstRGB, srcAlpha, dstAlpha]))
            this._blendFuncSeparate(srcRGB, dstRGB, srcAlpha, dstAlpha);
    }

    $clearColor(red, green, blue, alpha) {
        if (this._state.setSetting(this._clearColor, [red, green, blue, alpha]))
            this._clearColor(red, green, blue, alpha);
    }

    $clearDepth(depth) {
        if (this._state.setSetting(this._clearDepth, [depth]))
            this._clearDepth(depth);
    }

    $clearStencil(s) {
        if (this._state.setSetting(this._clearStencil, [s]))
            this._clearStencil(s);
    }

    $colorMask(red, green, blue, alpha) {
        if (this._state.setSetting(this._colorMask, [red, green, blue, alpha]))
            this._colorMask(red, green, blue, alpha);
    }

    $cullFace(mode) {
        if (this._state.setSetting(this._cullFace, [mode]))
            this._cullFace(mode);
    }

    $depthFunc(func) {
        if (this._state.setSetting(this._depthFunc, [func]))
            this._depthFunc(func);
    }

    $depthMask(flag) {
        if (this._state.setSetting(this._depthMask, [flag]))
            this._depthMask(flag);
    }

    $depthRange(zNear, zFar) {
        if (this._state.setSetting(this._depthRange, [zNear, zFar]))
            this._depthRange(zNear, zFar);
    }

    $frontFace(mode) {
        if (this._state.setSetting(this._frontFace, [mode]))
            this._frontFace(mode);
    }

    $lineWidth(width) {
        if (this._state.setSetting(this._lineWidth, [width]))
            this._lineWidth(width);
    }

    $polygonOffset(factor, units) {
        if (this._state.setSetting(this._polygonOffset, [factor, units]))
            this._polygonOffset(factor, units);
    }

    $sampleCoverage(value, invert) {
        if (this._state.setSetting(this._sampleCoverage, [value, invert]))
            this._sampleCoverage(value, invert);
    }

    $stencilFunc(func, ref, mask) {
        if (this._state.setSetting(this._stencilFunc, [func, ref, mask]))
            this._stencilFunc(func, ref, mask);
    }

    $stencilMask(mask) {
        if (this._state.setSetting(this._stencilMask, [mask]))
            this._stencilMask(mask);
    }

    $stencilOp(fail, zfail, zpass) {
        if (this._state.setSetting(this._stencilOp, [fail, zfail, zpass]))
            this._stencilOp(fail, zfail, zpass);
    }

    $vertexAttrib1f(indx, x) {
        if (this._state.setSetting(this._vertexAttrib1f, [indx, x]))
            this._vertexAttrib1f(indx, x);
    }

    $vertexAttrib1fv(indx, values) {
        if (this._state.setSetting(this._vertexAttrib1fv, [indx, values]))
            this._vertexAttrib1fv(indx, values);
    }

    $vertexAttrib2f(indx, x, y) {
        if (this._state.setSetting(this._vertexAttrib2f, [indx, x, y]))
            this._vertexAttrib2f(indx, x, y);
    }

    $vertexAttrib2fv(indx, values) {
        if (this._state.setSetting(this._vertexAttrib2fv, [indx, values]))
            this._vertexAttrib2fv(indx, values);
    }

    $vertexAttrib3f(indx, x, y, z) {
        if (this._state.setSetting(this._vertexAttrib3f, [indx, x, y, z]))
            this._vertexAttrib3f(indx, x, y, z);
    }

    $vertexAttrib3fv(indx, values) {
        if (this._state.setSetting(this._vertexAttrib3fv, [indx, values]))
            this._vertexAttrib3fv(indx, values);
    }

    $vertexAttrib4f(indx, x, y, z, w) {
        if (this._state.setSetting(this._vertexAttrib4f, [indx, x, y, z, w]))
            this._vertexAttrib4f(indx, x, y, z, w);
    }

    $vertexAttrib4fv(indx, values) {
        if (this._state.setSetting(this._vertexAttrib4fv, [indx, values]))
            this._vertexAttrib4fv(indx, values);
    }

    /**
     * Sets up the rendering context for context sharing.
     * @param {WebGLRenderingContext} gl
     * @param {string} id
     */
    static enable(gl, id = "default") {
        const names = Object.getOwnPropertyNames(WebGLStateManager.prototype);
        const WebGLRenderingContextProto = gl.__proto__;
        names.forEach(name => {
            if (name !== "constructor") {
                const method = WebGLStateManager.prototype[name];
                if (name.charAt(0) === "$") {
                    name = name.substr(1);
                }
                if (gl[name]) {
                    if (!gl[name].name) {
                        // We do this for compatibility with the Chrome WebGL Inspector plugin.
                        gl[name].xname = name;
                    }
                    gl['_' + name] = gl[name];
                }
                gl[name] = method;
            }
        });

        WebGLStateManager.prototype._initStateManager.call(gl, id);

        return gl;
    }

}

export default WebGLStateManager;
