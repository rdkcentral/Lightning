/**
 * Manages the list of children for a view.
 */

let ObjectList = require('../../core/ObjectList')

class ObjectListProxy extends ObjectList {

    constructor(target) {
        super()
        this._target = target
    }

    onAdd(item, index) {
        this._target.addAt(item, index)
    }

    onRemove(item, index) {
        this._target.removeAt(index)
    }

    onSync(removed, added, order) {
        this._target._setByArray(order)
    }

    onSet(item, index) {
        this._target.setAt(item, index)
    }

    onMove(item, fromIndex, toIndex) {
        this._target.setAt(item, toIndex)
    }

    createItem(object) {
        return this._target.createItem(object)
    }

    isItem(object) {
        return this._target.isItem(object)
    }

}

module.exports = ObjectListProxy;

