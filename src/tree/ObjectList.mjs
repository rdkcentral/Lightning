/**
 * Manages a list of objects.
 * Objects may be patched. Then, they can be referenced using the 'ref' (string) property.
 */
export default class ObjectList {

    constructor() {
        this._items = [];
        this._refs = {}
    }

    get() {
        return this._items;
    }

    get first() {
        return this._items[0];
    }

    get last() {
        return this._items.length ? this._items[this._items.length - 1] : undefined;
    }

    add(item) {
        this.addAt(item, this._items.length);
    }

    addAt(item, index) {
        if (index >= 0 && index <= this._items.length) {
            let currentIndex = this._items.indexOf(item);
            if (currentIndex === index) {
                return item;
            }

            if (currentIndex != -1) {
                this.setAt(item, index);
            } else {
                if (item.ref) {
                    this._refs[item.ref] = item;
                }
                this._items.splice(index, 0, item);
                this.onAdd(item, index);
            }
        } else {
            throw new Error('addAt: The index ' + index + ' is out of bounds ' + this._items.length);
        }
    }

    replaceByRef(item) {
        if (item.ref) {
            const existingItem = this.getByRef(item.ref);
            if (!existingItem) {
                throw new Error('replaceByRef: no item found with reference: ' + item.ref);
            }
            this.replace(item, existingItem);
        } else {
            throw new Error('replaceByRef: no ref specified in item');
        }
        this.addAt(item, this._items.length);

    }

    replace(item, prevItem) {
        const index = this.getIndex(prevItem);
        if (index === -1) {
            throw new Error('replace: The previous item does not exist');
        }
        this.setAt(item, index);
    }

    setAt(item, index) {
        if (index >= 0 && index <= this._items.length) {
            let currentIndex = this._items.indexOf(item);
            if (currentIndex != -1) {
                if (currentIndex !== index) {
                    const fromIndex = currentIndex;
                    if (fromIndex !== index) {
                        this._items.splice(fromIndex, 1);
                        this._items.splice(index, 0, item);
                        this.onMove(item, fromIndex, index);
                    }
                }
            } else {
                if (index < this._items.length) {
                    if (this._items[index].ref) {
                        this._refs[this._items[index].ref] = undefined;
                    }
                }

                const prevItem = this._items[index];

                // Doesn't exist yet: overwrite current.
                this._items[index] = item;

                if (item.ref) {
                    this._refs[item.ref] = item;
                }

                this.onSet(item, index, prevItem);
            }
        } else {
            throw new Error('setAt: The index ' + index + ' is out of bounds ' + this._items.length);
        }
    }

    getAt(index) {
        return this._items[index];
    }

    getIndex(item) {
        return this._items.indexOf(item);
    }

    remove(item) {
        let index = this._items.indexOf(item);

        if (index !== -1) {
            this.removeAt(index);
        }
    };

    removeAt(index) {
        let item = this._items[index];

        if (item.ref) {
            this._refs[item.ref] = undefined;
        }

        this._items.splice(index, 1);

        this.onRemove(item, index);

        return item;
    };

    clear() {
        let n = this._items.length;
        if (n) {
            let prev = this._items;
            this._items = [];
            this._refs = {}
            this.onSync(prev, [], []);
        }
    };

    a(o) {
        if (Utils.isObjectLiteral(o)) {
            let c = this.createItem(o);
            c.patch(o);
            this.add(c);
            return c;
        } else if (Array.isArray(o)) {
            for (let i = 0, n = o.length; i < n; i++) {
                this.a(o[i]);
            }
            return null;
        } else if (this.isItem(o)) {
            this.add(o);
            return o;
        }
    };

    get length() {
        return this._items.length;
    }

    _getRefs() {
        return this._refs;
    }

    getByRef(ref) {
        return this._refs[ref];
    }

    clearRef(ref) {
        delete this._refs[ref];
    }

    setRef(ref, child) {
        this._refs[ref] = child;
    }

    patch(settings) {
        if (Utils.isObjectLiteral(settings)) {
            this._setByObject(settings);
        } else if (Array.isArray(settings)) {
            this._setByArray(settings);
        }
    }

    _setByObject(settings) {
        // Overrule settings of known referenced items.
        let refs = this._getRefs();
        let crefs = Object.keys(settings);
        for (let i = 0, n = crefs.length; i < n; i++) {
            let cref = crefs[i];
            let s = settings[cref];

            let c = refs[cref];
            if (!c) {
                if (this.isItem(s)) {
                    // Replace previous item;
                    s.ref = cref;
                    this.add(s);
                } else {
                    // Create new item.
                    c = this.createItem(s);
                    c.ref = cref;
                    c.patch(s);
                    this.add(c);
                }
            } else {
                if (this.isItem(s)) {
                    if (c !== s) {
                        // Replace previous item;
                        let idx = this.getIndex(c);
                        s.ref = cref;
                        this.setAt(s, idx);
                    }
                } else {
                    c.patch(s);
                }
            }
        }
    }

    _equalsArray(array) {
        let same = true;
        if (array.length === this._items.length) {
            for (let i = 0, n = this._items.length; (i < n) && same; i++) {
                same = same && (this._items[i] === array[i]);
            }
        } else {
            same = false;
        }
        return same;
    }

    _setByArray(array) {
        // For performance reasons, first check if the arrays match exactly and bail out if they do.
        if (this._equalsArray(array)) {
            return;
        }

        for (let i = 0, n = this._items.length; i < n; i++) {
            this._items[i].marker = true;
        }

        let refs;
        let newItems = [];
        for (let i = 0, n = array.length; i < n; i++) {
            let s = array[i];
            if (this.isItem(s)) {
                s.marker = false;
                newItems.push(s);
            } else {
                let cref = s.ref;
                let c;
                if (cref) {
                    if (!refs) refs = this._getRefs();
                    c = refs[cref];
                }

                if (!c) {
                    // Create new item.
                    c = this.createItem(s);
                } else {
                    c.marker = false;
                }

                if (Utils.isObjectLiteral(s)) {
                    c.patch(s);
                }

                newItems.push(c);
            }
        }

        this._setItems(newItems);
    }

    _setItems(newItems) {
        let prevItems = this._items;
        this._items = newItems;

        // Remove the items.
        let removed = prevItems.filter(item => {let m = item.marker; delete item.marker; return m});
        let added = newItems.filter(item => (prevItems.indexOf(item) === -1));

        if (removed.length || added.length) {
            // Recalculate refs.
            this._refs = {}
            for (let i = 0, n = this._items.length; i < n; i++) {
                let ref = this._items[i].ref;
                if (ref) {
                    this._refs[ref] = this._items[i];
                }
            }
        }

        this.onSync(removed, added, newItems);
    }

    sort(f) {
        const items = this._items.slice();
        items.sort(f);
        this._setByArray(items);
    }

    onAdd(item, index) {
    }

    onRemove(item, index) {
    }

    onSync(removed, added, order) {
    }

    onSet(item, index, prevItem) {
    }

    onMove(item, fromIndex, toIndex) {
    }

    createItem(object) {
        throw new Error("ObjectList.createItem must create and return a new object");
    }

    isItem(object) {
        return false;
    }

    forEach(f) {
        this.get().forEach(f);
    }

}

import Utils from "./Utils.mjs";


