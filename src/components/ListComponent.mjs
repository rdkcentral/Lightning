import Component from "../application/Component.mjs";

export default class ListComponent extends Component {

    constructor(stage) {
        super(stage);

        this._wrapper = super._children.a({});

        this._reloadVisibleElements = false;

        this._visibleItems = new Set();

        this._index = 0;

        this._started = false;

        /**
         * The transition definition that is being used when scrolling the items.
         * @type TransitionSettings
         */
        this._scrollTransitionSettings = this.stage.transitions.createSettings({});

        /**
         * The scroll area size in pixels per item.
         */
        this._itemSize = 100;

        this._viewportScrollOffset = 0;

        this._itemScrollOffset = 0;

        /**
         * Should the list jump when scrolling between end to start, or should it be continuous, like a carrousel?
         */
        this._roll = false;

        /**
         * Allows restricting the start scroll position.
         */
        this._rollMin = 0;

        /**
         * Allows restricting the end scroll position.
         */
        this._rollMax = 0;

        /**
         * Definition for a custom animation that is applied when an item is (partially) selected.
         * @type AnimationSettings
         */
        this._progressAnimation = null;

        /**
         * Inverts the scrolling direction.
         * @type {boolean}
         * @private
         */
        this._invertDirection = false;

        /**
         * Layout the items horizontally or vertically?
         * @type {boolean}
         * @private
         */
        this._horizontal = true;

        this.itemList = new ListItems(this);
    }

    _allowChildrenAccess() {
        return false;
    }

    get items() {
        return this.itemList.get();
    }

    set items(children) {
        this.itemList.patch(children);
    }

    start() {
        this._wrapper.transition(this.property, this._scrollTransitionSettings);
        this._scrollTransition = this._wrapper.transition(this.property);
        this._scrollTransition.on('progress', p => this.update());

        this.setIndex(0, true, true);

        this._started = true;

        this.update();
    }

    setIndex(index, immediate = false, closest = false) {
        let nElements = this.length;
        if (!nElements) return;

        this.emit('unfocus', this.getElement(this.realIndex), this._index, this.realIndex);

        if (closest) {
            // Scroll to same offset closest to the index.
            let offset = Utils.getModuloIndex(index, nElements);
            let o = Utils.getModuloIndex(this.index, nElements);
            let diff = offset - o;
            if (diff > 0.5 * nElements) {
                diff -= nElements;
            } else if (diff < -0.5 * nElements) {
                diff += nElements;
            }
            this._index += diff;
        } else {
            this._index = index;
        }

        if (this._roll || (this.viewportSize > this._itemSize * nElements)) {
            this._index = Utils.getModuloIndex(this._index, nElements);
        }

        let direction = (this._horizontal ^ this._invertDirection ? -1 : 1);
        let value = direction * this._index * this._itemSize;

        if (this._roll) {
            let min, max, scrollDelta;
            if (direction == 1) {
                max = (nElements - 1) * this._itemSize;
                scrollDelta = this._viewportScrollOffset * this.viewportSize - this._itemScrollOffset * this._itemSize;

                max -= scrollDelta;

                min = this.viewportSize - (this._itemSize + scrollDelta);

                if (this._rollMin) min -= this._rollMin;
                if (this._rollMax) max += this._rollMax;

                value = Math.max(Math.min(value, max), min);
            } else {
                max = (nElements * this._itemSize - this.viewportSize);
                scrollDelta = this._viewportScrollOffset * this.viewportSize - this._itemScrollOffset * this._itemSize;

                max += scrollDelta;

                let min = scrollDelta;

                if (this._rollMin) min -= this._rollMin;
                if (this._rollMax) max += this._rollMax;

                value = Math.min(Math.max(-max, value), -min);
            }
        }

        this._scrollTransition.start(value);

        if (immediate) {
            this._scrollTransition.finish();
        }

        this.emit('focus', this.getElement(this.realIndex), this._index, this.realIndex);
    }

    getAxisPosition() {
        let target = -this._scrollTransition._targetValue;

        let direction = (this._horizontal ^ this._invertDirection ? -1 : 1);
        let value = -direction * this._index * this._itemSize;

        return this._viewportScrollOffset * this.viewportSize + (value - target);
    }

    update() {
        if (!this._started) return;

        let nElements = this.length;
        if (!nElements) return;

        let direction = (this._horizontal ^ this._invertDirection ? -1 : 1);

        // Map position to index value.
        let v = (this._horizontal ? this._wrapper.x : this._wrapper.y);

        let viewportSize = this.viewportSize;
        let scrollDelta = this._viewportScrollOffset * viewportSize - this._itemScrollOffset * this._itemSize;
        v += scrollDelta;

        let s, e, ps, pe;
        if (direction == -1) {
            s = Math.floor(-v / this._itemSize);
            ps = 1 - ((-v / this._itemSize) - s);
            e = Math.floor((viewportSize - v) / this._itemSize);
            pe = (((viewportSize - v) / this._itemSize) - e);
        } else {
            s = Math.ceil(v / this._itemSize);
            ps = 1 + (v / this._itemSize) - s;
            e = Math.ceil((v - viewportSize) / this._itemSize);
            pe = e - ((v - viewportSize) / this._itemSize);
        }
        if (this._roll || (viewportSize > this._itemSize * nElements)) {
            // Don't show additional items.
            if (e >= nElements) {
                e = nElements - 1;
                pe = 1;
            }
            if (s >= nElements) {
                s = nElements - 1;
                ps = 1;
            }
            if (e <= -1) {
                e = 0;
                pe = 1;
            }
            if (s <= -1) {
                s = 0;
                ps = 1;
            }
        }

        let offset = -direction * s * this._itemSize;

        let item;
        for (let index = s; (direction == -1 ? index <= e : index >= e); (direction == -1 ? index++ : index--)) {
            let realIndex = Utils.getModuloIndex(index, nElements);

            let element = this.getElement(realIndex);
            item = element.parent;
            this._visibleItems.delete(item);
            if (this._horizontal) {
                item.x = offset + scrollDelta;
            } else {
                item.y = offset + scrollDelta;
            }

            let wasVisible = item.visible;
            item.visible = true;

            if (!wasVisible || this._reloadVisibleElements) {
                // Turned visible.
                this.emit('visible', index, realIndex);
            }



            if (this._progressAnimation) {
                let p = 1;
                if (index == s) {
                    p = ps;
                } else if (index == e) {
                    p = pe;
                }

                // Use animation to progress.
                this._progressAnimation.apply(element, p);
            }

            offset += this._itemSize;
        }

        // Handle item visibility.
        let self = this;
        this._visibleItems.forEach(function(invisibleItem) {
            invisibleItem.visible = false;
            self._visibleItems.delete(invisibleItem);
        });

        for (let index = s; (direction == -1 ? index <= e : index >= e); (direction == -1 ? index++ : index--)) {
            let realIndex = Utils.getModuloIndex(index, nElements);
            this._visibleItems.add(this.getWrapper(realIndex));
        }

        this._reloadVisibleElements = false;
    }

    setPrevious() {
        this.setIndex(this._index - 1);
    }

    setNext() {
        this.setIndex(this._index + 1);
    }

    getWrapper(index) {
        return this._wrapper.children[index];
    }

    getElement(index) {
        let e = this._wrapper.children[index];
        return e ? e.children[0] : null;
    }

    reload() {
        this._reloadVisibleElements = true;
        this.update();
    }

    get element() {
        let e = this._wrapper.children[this.realIndex];
        return e ? e.children[0] : null;
    }

    get length() {
        return this._wrapper.children.length;
    }

    get property() {
        return this._horizontal ? 'x' : 'y';
    }

    get viewportSize() {
        return this._horizontal ? this.w : this.h;
    }

    get index() {
        return this._index;
    }

    get realIndex() {
        return Utils.getModuloIndex(this._index, this.length);
    }

    get itemSize() {
        return this._itemSize;
    }

    set itemSize(v) {
        this._itemSize = v;
        this.update();
    }

    get viewportScrollOffset() {
        return this._viewportScrollOffset;
    }

    set viewportScrollOffset(v) {
        this._viewportScrollOffset = v;
        this.update();
    }

    get itemScrollOffset() {
        return this._itemScrollOffset;
    }

    set itemScrollOffset(v) {
        this._itemScrollOffset = v;
        this.update();
    }

    get scrollTransitionSettings() {
        return this._scrollTransitionSettings;
    }

    set scrollTransitionSettings(v) {
        this._scrollTransitionSettings.patch(v);
    }

    set scrollTransition(v) {
        this._scrollTransitionSettings.patch(v);
    }

    get scrollTransition() {
        return this._scrollTransition;
    }

    get progressAnimation() {
        return this._progressAnimation;
    }

    set progressAnimation(v) {
        if (Utils.isObjectLiteral(v)) {
            this._progressAnimation = this.stage.animations.createSettings(v);
        } else {
            this._progressAnimation = v;
        }
        this.update();
    }

    get roll() {
        return this._roll;
    }

    set roll(v) {
        this._roll = v;
        this.update();
    }

    get rollMin() {
        return this._rollMin;
    }

    set rollMin(v) {
        this._rollMin = v;
        this.update();
    }

    get rollMax() {
        return this._rollMax;
    }

    set rollMax(v) {
        this._rollMax = v;
        this.update();
    }

    get invertDirection() {
        return this._invertDirection;
    }

    set invertDirection(v) {
        if (!this._started) {
            this._invertDirection = v;
        }
    }

    get horizontal() {
        return this._horizontal;
    }

    set horizontal(v) {
        if (v !== this._horizontal) {
            if (!this._started) {
                this._horizontal = v;
            }
        }
    }

}

import ObjectListWrapper from "../tools/ObjectListWrapper.mjs";
class ListItems extends ObjectListWrapper {
    constructor(list) {
        let wrap = (item => {
            let parent = item.stage.createElement();
            parent.add(item);
            parent.visible = false;
            return parent;
        })

        super(list._wrapper._children, wrap);
        this.list = list;
    }

    onAdd(item, index) {
        super.onAdd(item, index);
        this.checkStarted(index);
    }

    checkStarted(index) {
        this.list._reloadVisibleElements = true;
        if (!this.list._started) {
            this.list.start();
        } else {
            if (this.list.length === 1) {
                this.list.setIndex(0, true, true);
            } else {
                if (this.list._index >= this.list.length) {
                    this.list.setIndex(0);
                }
            }
            this.list.update();
        }
    }

    onRemove(item, index) {
        super.onRemove(item, index);
        let ri = this.list.realIndex;
        if (ri === index) {
            if (ri === this.list.length) {
                ri--;
            }
            if (ri >= 0) {
                this.list.setIndex(ri);
            }
        } else if (ri > index) {
            this.list.setIndex(ri - 1);
        }

        this.list._reloadVisibleElements = true;
    }

    onSet(item, index) {
        super.onSet(item, index);
        this.checkStarted(index);
    }

    onSync(removed, added, order) {
        super.onSync(removed, added, order);
        this.checkStarted(0);
    }

    get _signalProxy() {
        return true;
    }

}

import Utils from "../tree/Utils.mjs";
