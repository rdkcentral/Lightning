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

