/*
 * If not stated otherwise in this file or this component's LICENSE file the
 * following copyright and licenses apply:
 *
 * Copyright 2020 RDK Management
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

import HtmlTreeBuilder from "./HtmlTreeBuilder.mjs";
import MismatchCollector from "./MismatchCollector.mjs";

export default class Comparer {

    constructor() {
        this._createContainer();
    }

    _createContainer() {
        this._container = document.createElement('div');
        this._container.style.display = 'block';
        this._container.style.position = 'absolute';
        this._container.style.top = '0';
        this._container.style.left = '0';
        this._container.style.visibility = 'hidden';
        document.body.appendChild(this._container);
    }

    getLayoutMismatchesBetweenItemAndHtml(item) {
        const div = this._transformItemToHtml(item);
        return this._addHtmlToContainer(div).then(() => {
            const mismatches = this._getLayoutMismatches(item, div);
            this._removeHtmlFromContainer(div);
            return mismatches;
        });
    }

    _addHtmlToContainer(div) {
        return new Promise((resolve, reject) => {
            this._container.appendChild(div);
            requestAnimationFrame(() => {
                resolve();
            });
        });
    }

    _removeHtmlFromContainer(div) {
        this._container.removeChild(div);
    }

    _transformItemToHtml(item) {
        const htmlTreeBuilder = new HtmlTreeBuilder(item);
        return htmlTreeBuilder.getHtmlTree();
    }

    transformItemToHtmlWithMismatchInfo(item) {
        const div = this._transformItemToHtml(item);
        return this._addHtmlToContainer(div).then(() => {
            const collector = new MismatchCollector(item, div);
            collector.setLayoutInfoInHtmlAttribs();
            this._removeHtmlFromContainer(div);
            return div;
        })
    }

    _getLayoutMismatches(item, div) {
        const collector = new MismatchCollector(item, div);
        return collector.getMismatches();
    }

}

