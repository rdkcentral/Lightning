const Texture = require('../tree/Texture');

class HtmlTexture extends Texture {

    set htmlElement(v) {
        this._htmlElement = v
        this._changed()
    }

    get htmlElement() {
        return this._htmlElement
    }

    set html(v) {
        const d = document.createElement('div')
        d.innerHTML = v
        this.htmlElement = d.firstElementChild
    }

    get html() {
        return this._htmlElement.innerHTML
    }

    set lookupId(v) {
        this._lookupId = v
    }

    _getLookupId() {
        return this._lookupId
    }

    _getSourceLoader() {
        const htmlElement = this._htmlElement
        return function(cb) {
            if (!html2canvas) {
                cb(new Error("Please include html2canvas (https://html2canvas.hertzen.com/)"))
            }

            const area = HtmlTexture.getPreloadArea()
            area.appendChild(htmlElement)

            html2canvas(htmlElement, {backgroundColor: null, scale: 1}).then(function(canvas) {
                area.removeChild(htmlElement)
                cb(null, {source: canvas, width: canvas.width, height: canvas.height})
            }).catch(e => {
                console.error(e)
            });
        }
    }

    static getPreloadArea() {
        if (!this._preloadArea) {
            // Preload area must be included in document body and must be visible to trigger html element rendering.
            this._preloadArea = document.createElement('div')
            this._preloadArea.style.opacity = 0
            this._preloadArea.style.pointerEvents = 'none'
            this._preloadArea.style.position = 'fixed'
            this._preloadArea.style.display = 'block'
            this._preloadArea.style.top = '100vh'
            this._preloadArea.style.overflow = 'hidden'
            document.body.appendChild(this._preloadArea)
        }
        return this._preloadArea
    }
}

module.exports = HtmlTexture