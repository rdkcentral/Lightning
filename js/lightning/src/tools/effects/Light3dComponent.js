export default class Light3dComponent extends lng.Component {

    constructor(stage) {
        super(stage);

        this.patch({
            __create: true,
            Main: {
                x: -1,
                y: -1,
                shader: {type: lng.shaders.Light3d, fudge: 0.3},
                renderToTexture: true,
                Wrapper: {
                    x: 1,
                    y: 1,
                    clipping: true,
                    Content: {}
                }
            }
        });

        this._shaderZ = 0;
        this._shaderZ0 = 0;
        this._shaderZ1 = 0;

        this._shaderRx = 0;
        this._shaderRx0 = 0;
        this._shaderRx1 = 0;

        this._shaderRy = 0;
        this._shaderRy0 = 0;
        this._shaderRy1 = 0;

        this._focusedZ = -150;
        this._createAnimations();

        this.transition('lightShader.strength', {duration: 0.2});
        this.transition('lightShader.ambient', {duration: 0.2});
    }

    get focusedZ() {
        return this._focusedZ;
    }

    set focusedZ(v) {
        this._focusedZ = v;
        this._createAnimations();
    }

    _createAnimations() {
        this._anims = {
            neutral: this.animation({
                duration: 0.4, actions: [
                    {p: 'shaderZ0', merger: lng.StageUtils.mergeNumbers, v: {0: 0, 0.5: -140, 1: -150}}
                ]
            }),
            left: this._createAnimation('x', -1, 0),
            right: this._createAnimation('x', 1, 1),
            up: this._createAnimation('y', -1, 0),
            down: this._createAnimation('y', 1, 0)
        };
    }

    _createAnimation(axis, sign, idx) {
        return this.animation({
            duration: 0.4, stopDuration: 0.2, actions: [
                {p: 'shaderR' + axis + idx, merger: lng.StageUtils.mergeNumbers, v: {0: 0, 0.3: -0.20 * sign, 1: 0}},
                {
                    p: 'shaderZ' + idx,
                    merger: lng.StageUtils.mergeNumbers,
                    v: {0: 0, 0.5: this._focusedZ + 10, 1: this._focusedZ}
                }
            ]
        });
    }

    set w(v) {
        this.tag('Main').w = v + 2;
        this.tag('Wrapper').w = v;
    }

    set h(v) {
        this.tag('Main').h = v + 2;
        this.tag('Wrapper').h = v;
    }

    get lightShader() {
        return this.tag('Main').shader;
    }

    set lightShader(v) {
        this.tag('Main').shader = v;
    }

    get content() {
        return this.tag('Content');
    }

    set content(v) {
        this.tag('Content').patch(v, true);
    }

    _recalc() {
        this.tag('Main').shader.rx = this._shaderRx0 + this._shaderRx1 + this._shaderRx;
        this.tag('Main').shader.ry = this._shaderRy0 + this._shaderRy1 + this._shaderRy;
        this.tag('Main').shader.z = this._shaderZ0 + this._shaderZ1 + this._shaderZ;
        this.tag('Main').shader.pivotZ = this._shaderZ0 + this._shaderZ1 + this._shaderZ;
    }

    get shaderZ() {
        return this._shaderZ;
    }

    set shaderZ(v) {
        this._shaderZ = v;
        this._recalc();
    }

    get shaderZ0() {
        return this._shaderZ0;
    }

    set shaderZ0(v) {
        this._shaderZ0 = v;
        this._recalc();
    }

    get shaderZ1() {
        return this._shaderZ1;
    }

    set shaderZ1(v) {
        this._shaderZ1 = v;
        this._recalc();
    }

    get shaderRx() {
        return this._shaderRx;
    }

    set shaderRx(v) {
        this._shaderRx = v;
        this._recalc();
    }

    get shaderRx0() {
        return this._shaderRx0;
    }

    set shaderRx0(v) {
        this._shaderRx0 = v;
        this._recalc();
    }

    get shaderRx1() {
        return this._shaderRx1;
    }

    set shaderRx1(v) {
        this._shaderRx1 = v;
        this._recalc();
    }

    get shaderRy() {
        return this._shaderRy;
    }

    set shaderRy(v) {
        this._shaderRy = v;
        this._recalc();
    }

    get shaderRy0() {
        return this._shaderRy0;
    }

    set shaderRy0(v) {
        this._shaderRy0 = v;
        this._recalc();
    }

    get shaderRy1() {
        return this._shaderRy1;
    }

    set shaderRy1(v) {
        this._shaderRy1 = v;
        this._recalc();
    }

    leftEnter() {
        this._anims['left'].start();
        this._enable3dShader();
    }

    leftExit() {
        this.neutralExit();
    }

    rightEnter() {
        this._anims['right'].start();
        this._enable3dShader();
    }

    rightExit() {
        this.neutralExit();
    }

    upEnter() {
        this._anims['up'].start();
        this._enable3dShader();
    }

    upExit() {
        this.neutralExit();
    }

    downEnter() {
        this._anims['down'].start();
        this._enable3dShader();
    }

    downExit() {
        this.neutralExit();
    }

    neutralEnter() {
        this._anims['neutral'].start();
        this._enable3dShader();
    }

    neutralExit() {
        this._anims['up'].stop();
        this._anims['down'].stop();
        this._anims['left'].stop();
        this._anims['right'].stop();
        this._anims['neutral'].stop();
        this._disable3dShader();
    }

    _enable3dShader() {
        this.patch({smooth: {'lightShader.strength': 0.4, 'lightShader.ambient': 0.6}});
    }

    _disable3dShader() {
        this.patch({smooth: {'lightShader.strength': 0, 'lightShader.ambient': 1}});
    }


}
