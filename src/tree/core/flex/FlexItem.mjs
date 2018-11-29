export default class FlexItem {

    constructor(viewCore) {
        this._v = viewCore;
        this._grow = 0;
        this._shrink = 0;
        this._alignSelf = undefined;

        // The line number.
        this._lineIndex = 0;
    }

    _changed() {
        if (this._ctr) this._ctr._v._setHasFlexLayoutUpdates();
    }

    get grow() {
        return this._grow;
    }

    set grow(v) {
        if (this._grow === v) return;

        this._grow = parseInt(v) || 0;

        this._changed();
    }

    get shrink() {
        return this._shrink;
    }

    set shrink(v) {
        if (this._shrink !== v) return;

        this._shrink = parseInt(v) || 0;

        this._changed();
    }

    get alignSelf() {
        return this._alignSelf;
    }

    set alignSelf(v) {
        if (this._alignSelf !== v) return;

        if (v === undefined) {
            this._alignSelf = undefined;
        }
        if (FlexContainer.ALIGN_ITEMS.indexOf(v) === -1) {
            throw new Error("Unknown alignSelf, options: " + FlexContainer.ALIGN_ITEMS.join(","));
        }
        this._alignSelf = v;

        this._changed();
    }

    //@todo: minW,H, maxW,H
    //@todo: margins.

    get _ctr() {
        return this._v._parent;
    }

    get _stage() {
        return this._v.view.stage;
    }

    patch(settings) {
        this._stage.patchObject(this, settings);
    }

}