/**
 * Manages the list of children for a view.
 */

let ObjectList = require('./ObjectList')

class ViewChildList extends ObjectList {

    constructor(view) {
        super()
        this._view = view
    }

    _detachParent(item) {
        if (item.parent && item.parent !== this._view) {
            item.parent.childList.remove(item)
        }
    }

    onAdd(item, index) {
        this._detachParent(item)
        item._setParent(this._view)
        this._view._core.addChildAt(index, item._core)
    }

    onRemove(item, index) {
        item._setParent(null)
        this._view._core.removeChildAt(index)
    }

    onSync(removed, added, order) {
        for (let i = 0, n = removed.length; i < n; i++) {
            removed[i]._setParent(null)
        }
        for (let i = 0, n = added.length; i < n; i++) {
            this._detachParent(added[i])
            added[i]._setParent(this._view)
        }
        let gc = i => i._core
        this._view._core.syncChildren(removed.map(gc), added.map(gc), order.map(gc))
    }

    onSet(item, index) {
        this._detachParent(item)
        item._setParent(this._view)
        this._view._core.setChildAt(index, item._core)
    }

    onMove(item, fromIndex, toIndex) {
        this._view._core.moveChild(fromIndex, toIndex)
    }

    createItem(object) {
        if (object.type) {
            return new object.type(this._view.stage)
        } else {
            return this._view.stage.createView()
        }
    }

    isItem(object) {
        return object.isView
    }

}

module.exports = ViewChildList;

