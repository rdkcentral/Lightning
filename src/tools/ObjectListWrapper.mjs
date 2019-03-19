/**
 * Manages the list of children for an element.
 */

import ObjectListProxy from "./ObjectListProxy.mjs";

export default class ObjectListWrapper extends ObjectListProxy {

    constructor(target, wrap) {
        super(target);
        this._wrap = wrap;
    }

    wrap(item) {
        let wrapper = this._wrap(item);
        item._wrapper = wrapper;
        return wrapper;
    }

    onAdd(item, index) {
        item = this.wrap(item);
        super.onAdd(item, index);
    }

    onRemove(item, index) {
        super.onRemove(item, index);
    }

    onSync(removed, added, order) {
        added.forEach(a => this.wrap(a));
        order = order.map(a => a._wrapper);
        super.onSync(removed, added, order);
    }

    onSet(item, index) {
        item = this.wrap(item);
        super.onSet(item, index);
    }

    onMove(item, fromIndex, toIndex) {
        super.onMove(item, fromIndex, toIndex);
    }

}
