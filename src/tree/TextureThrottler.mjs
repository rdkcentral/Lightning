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
    }

    processSome() {
        if (this._sources.length) {
            const start = Date.now();
            do {
                this._processItem();
            } while(this._sources.length && (Date.now() - start < TextureThrottler.MAX_UPLOAD_TIME_PER_FRAME));
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