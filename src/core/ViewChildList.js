/**
 * Manages the list of children for a view.
 */
class ViewChildList {

    /**
     * @param view
     * @param isProxy
     *   A proxy mutates the children of another view. It is not used in core but is handy for extensions that extend
     *   the View class and wish to provide an alternative children implementation or other view collections.
     */
    constructor(view, isProxy = true) {

        this._view = view;

        /**
         * @type {View[]}
         */
        this._children = isProxy ? this._view._children._children : [];

    }

    get() {
        return this._children;
    }

    add(view) {
        if (view._parent === this && this._children.indexOf(view) >= 0) {
            return view;
        }
        this.addAt(view, this._children.length);
    };

    addAt(view, index) {
        // prevent adding self as view
        if (view === this._view) {
            return
        }

        if (index >= 0 && index <= this._children.length) {
            if (view._parent === this._view && this._children.indexOf(view) === index) {
                // Ignore.
            } else {
                if (view._parent) {
                    let p = view._parent;
                    p._children.remove(view);
                }

                view._setParent(this._view);
                this._children.splice(index, 0, view);

                // Sync.
                this._view.renderer.addChildAt(index, view.renderer);
            }

            return;
        } else {
            throw new Error(view + 'addChildAt: The index ' + index + ' supplied is out of bounds ' + this._children.length);
        }
    };

    getIndex(view) {
        return this._children.indexOf(view);
    };

    remove(view) {
        let index = this.getIndex(view);

        if (index !== -1) {
            this.removeAt(index);
        }
    };

    removeAt(index) {
        let view = this._children[index];

        view._setParent(null);
        this._children.splice(index, 1);

        // Sync.
        this._view.renderer.removeAt(index);

        return view;
    };

    clear() {
        let n = this._children.length;
        if (n) {
            for (let i = 0; i < n; i++) {
                let view = this._children[i];
                view._setParent(null);
            }
            this._children.splice(0, n);

            // Sync.
            this._view.renderer.removeChildren();
        }
    };

    a(o) {
        if (Utils.isObjectLiteral(o)) {
            let c = this._view.stage.view(o);
            this.add(c);
            return c;
        } else if (Array.isArray(o)) {
            for (let i = 0, n = o.length; i < n; i++) {
                this.a(o[i]);
            }
            return null;
        } else if (o.isView) {
            this.add(o);
            return o;
        }
    };
    
    set(views) {
        this.clear();
        for (let i = 0, n = views.length; i < n; i++) {
            let o = views[i];
            if (Utils.isObjectLiteral(o)) {
                let c = this._view.stage.view(o);
                this.add(c);
            } else if (o.isView) {
                this.add(o);
            }
        }
    }

    get length() {
        return this._children.length;
    }
}

let Utils = require('./Utils');
module.exports = ViewChildList;

