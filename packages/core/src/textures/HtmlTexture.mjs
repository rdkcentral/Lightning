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

import Texture from "../tree/Texture.mjs";

export default class HtmlTexture extends Texture {

    constructor(stage) {
        super(stage);
        this._htmlElement = undefined;
        this._scale = 1;
    }

    set htmlElement(v) {
        this._htmlElement = v;
        this._changed();
    }

    get htmlElement() {
        return this._htmlElement;
    }

    set scale(v) {
        this._scale = v;
        this._changed();
    }

    get scale() {
        return this._scale;
    }

    set html(v) {
        if (!v) {
            this.htmlElement = undefined;
        } else {
            const d = document.createElement('div');
            d.innerHTML = "<div>" + v + "</div>";
            this.htmlElement = d.firstElementChild;
        }
    }

    get html() {
        return this._htmlElement.innerHTML;
    }

    _getIsValid() {
        return this.htmlElement;
    }

    _getLookupId() {
        return this._scale + ":" + this._htmlElement.innerHTML;
    }

    _getSourceLoader() {
        const htmlElement = this._htmlElement;
        const scale = this._scale;
        return function(cb) {
            if (!window.html2canvas) {
                return cb(new Error("Please include html2canvas (https://html2canvas.hertzen.com/)"));
            }

            const area = HtmlTexture.getPreloadArea();
            area.appendChild(htmlElement);

            html2canvas(htmlElement, {backgroundColor: null, scale: scale}).then(function(canvas) {
                area.removeChild(htmlElement);
                if (canvas.height === 0) {
                    return cb(new Error("Canvas height is 0"));
                }
                cb(null, {source: canvas, width: canvas.width, height: canvas.height});
            }).catch(e => {
                console.error('[Lightning]', e);
            });
        }
    }

    static getPreloadArea() {
        if (!this._preloadArea) {
            // Preload area must be included in document body and must be visible to trigger html element rendering.
            this._preloadArea = document.createElement('div');
            if (this._preloadArea.attachShadow) {
                // Use a shadow DOM if possible to prevent styling from interfering.
                this._preloadArea.attachShadow({mode: 'closed'});
            }
            this._preloadArea.style.opacity = 0;
            this._preloadArea.style.pointerEvents = 'none';
            this._preloadArea.style.position = 'fixed';
            this._preloadArea.style.display = 'block';
            this._preloadArea.style.top = '100vh';
            this._preloadArea.style.overflow = 'hidden';
            document.body.appendChild(this._preloadArea);
        }
        return this._preloadArea;
    }
}

