/*
 * If not stated otherwise in this file or this component's LICENSE file the
 * following copyright and licenses apply:
 *
 * Copyright 2020 Metrological
 *
 * Licensed under the Apache License, Version 2.0 (the License);
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Manages the list of children for an element.
 */

import ObjectList from "./ObjectList.mjs";

export default class ElementChildList extends ObjectList {

    constructor(element) {
        super();
        this._element = element;
    }

    _connectParent(item) {
        const prevParent = item.parent;
        if (prevParent && prevParent !== this._element) {
            // Cleanup in previous child list, without
            const prevChildList = item.parent.childList;
            const index = prevChildList.getIndex(item);

            if (item.ref) {
                prevChildList._refs[item.ref] = undefined;
            }
            prevChildList._items.splice(index, 1);

            // Also clean up element core.
            prevParent.core.removeChildAt(index);

        }

        item._setParent(this._element);

        // We are expecting the caller to sync it to the core.
    }

    onAdd(item, index) {
        this._connectParent(item);
        this._element.core.addChildAt(index, item.core);
    }

    onRemove(item, index) {
        item._setParent(null);
        this._element.core.removeChildAt(index);
    }

    onSync(removed, added, order) {
        for (let i = 0, n = removed.length; i < n; i++) {
            removed[i]._setParent(null);
        }
        for (let i = 0, n = added.length; i < n; i++) {
            this._connectParent(added[i]);
        }
        let gc = i => i.core;
        this._element.core.syncChildren(removed.map(gc), added.map(gc), order.map(gc));
    }

    onSet(item, index, prevItem) {
        prevItem._setParent(null);

        this._connectParent(item);
        this._element.core.setChildAt(index, item.core);
    }

    onMove(item, fromIndex, toIndex) {
        this._element.core.moveChild(fromIndex, toIndex);
    }

    createItem(object) {
        if (object.type) {
            return new object.type(this._element.stage);
        } else {
            return this._element.stage.createElement();
        }
    }

    isItem(object) {
        return object.isElement;
    }

}


