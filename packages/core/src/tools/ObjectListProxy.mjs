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

import ObjectList from "../tree/ObjectList.mjs";

export default class ObjectListProxy extends ObjectList {

    constructor(target) {
        super();
        this._target = target;
    }

    onAdd(item, index) {
        this._target.addAt(item, index);
    }

    onRemove(item, index) {
        this._target.removeAt(index);
    }

    onSync(removed, added, order) {
        this._target._setByArray(order);
    }

    onSet(item, index) {
        this._target.setAt(item, index);
    }

    onMove(item, fromIndex, toIndex) {
        this._target.setAt(item, toIndex);
    }

    createItem(object) {
        return this._target.createItem(object);
    }

    isItem(object) {
        return this._target.isItem(object);
    }

}


