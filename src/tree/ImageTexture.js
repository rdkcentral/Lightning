class ImageTexture extends Texture {

    constructor(stage) {
        super(stage)

        this._src = undefined
    }

    set src(v) {
        this._src = v
        this._changed()
    }

    _getLookupId() {
        return this._src
    }

    _getSourceLoader() {
        let src = this._src
        if (this.stage.getOption('srcBasePath')) {
            var fc = src.charCodeAt(0)
            if ((src.indexOf("//") === -1) && ((fc >= 65 && fc <= 90) || (fc >= 97 && fc <= 122) || fc == 46)) {
                // Alphabetical or dot: prepend base path.
                src = this.stage.getOption('srcBasePath') + src
            }
        }

        const adapter = this.stage.adapter
        return function(cb) {
            return adapter.loadSrcTexture(src, cb)
        }
    }

    getNonDefaults() {
        const obj = super.getNonDefaults()
        if (this._src) {
            obj.src = this._src
        }
    }

}