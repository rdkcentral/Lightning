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
 * Allows throttling of loading texture sources, keeping the app responsive.
 */
export default class TextureThrottler {

    constructor(stage) {
        this.stage = stage;

        this.genericCancelCb = (textureSource) => {
            this._remove(textureSource);
        };

        this._sources = [];
        this._data = [];
    }

    destroy() {
        this._sources = [];
        this._data = [];
        this.stage = null;

        delete this._sources;
        delete this._data;
        delete this.stage;
    }

    /**
     * Drops all queued uploads and returns the dropped sources so the
     * texture manager can requeue them for post-restore reload.
     */
    clear() {
        const sources = this._sources;
        this._sources = [];
        this._data = [];
        return sources;
    }

    processSome() {
        const stage = this.stage;
        const manager = stage ? stage.textureManager : null;
        const hasRestores = !!(manager && manager.hasRestores && manager.hasRestores());
        if (this._sources.length || hasRestores) {
            const start = Date.now();
            // Drain queued context restores first within the same budget:
            // cheap sources complete inline, image sources kick off async
            // decodes whose uploads still flow through the queue below.
            while (hasRestores && manager.hasRestores() &&
                (Date.now() - start < TextureThrottler.MAX_UPLOAD_TIME_PER_FRAME)) {
                if (manager.processNextRestore() === false) {
                    return;
                }
            }
            const suspended = () => {
                const s = this.stage;
                return !!(s && s.contextState !== undefined && s.contextState !== 'running');
            };
            while (!suspended() && this._sources.length &&
                (Date.now() - start < TextureThrottler.MAX_UPLOAD_TIME_PER_FRAME)) {
                this._processItem();
            }
        }
    }

    _processItem() {
        const source = this._sources.pop();
        const data = this._data.pop();
        if (source.isLoading()) {
            source.processLoadedSource(data);
        }
    }

    add(textureSource, data) {
        this._sources.push(textureSource);
        this._data.push(data);
    }

    _remove(textureSource) {
        const index = this._sources.indexOf(textureSource);
        if (index >= 0) {
            this._sources.splice(index, 1);
            this._data.splice(index, 1);
        }
    }

}

TextureThrottler.MAX_UPLOAD_TIME_PER_FRAME = 10;
