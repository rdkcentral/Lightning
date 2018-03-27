/**
 * Manages the list of children for a view.
 */

let ObjectList = require('./ObjectList')

class ViewChildList extends ObjectList {

    constructor(view) {
        super()
        this._view = view
    }

    _connectParent(item) {
        const prevParent = item.parent
        if (prevParent && prevParent !== this._view) {
            // Cleanup in previous child list, without
            const prevChildList = item.parent.childList
            const index = prevChildList.getIndex(item)

            if (item.ref) {
                prevChildList._refs[item.ref] = undefined
            }
            prevChildList._items.splice(index, 1);

            // Also clean up view core.
            prevParent.core.removeChildAt(index)

        }

        item._setParent(this._view)

        // We are expecting the caller to sync it to the core.
    }

    onAdd(item, index) {
        this._connectParent(item)
        this._view.core.addChildAt(index, item.core)
    }

    onRemove(item, index) {
        item._setParent(null)
        this._view.core.removeChildAt(index)
    }

    onSync(removed, added, order) {
        for (let i = 0, n = removed.length; i < n; i++) {
            removed[i]._setParent(null)
        }
        for (let i = 0, n = added.length; i < n; i++) {
            this._connectParent(added[i])
        }
        let gc = i => i.core
        this._view.core.syncChildren(removed.map(gc), added.map(gc), order.map(gc))
    }

    onSet(item, index, prevItem) {
        prevItem._setParent(null)

        this._connectParent(item)
        this._view.core.setChildAt(index, item.core)
    }

    onMove(item, fromIndex, toIndex) {
        this._view.core.moveChild(fromIndex, toIndex)
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

