export default class MismatchCollector {

    constructor(item, div) {
        this._item = item;
        this._div = div;
        this._results = null;
    }

    getMismatches() {
        this.setLayoutInfoInHtmlAttribs();
        return this._collectMismatches();
    }

    setLayoutInfoInHtmlAttribs() {
        this._setLayoutInfoInHtmlAttribsRecursive(this._item, this._div);
    }

    _setLayoutInfoInHtmlAttribsRecursive(target, div) {

        const targetLayout = this._getTargetLayout(target);
        const htmlLayout = this._getHtmlLayout(div);

        const htmlIsVisible = (div.offsetParent !== null);

        const same = this._checkLayoutsEqual(htmlLayout, targetLayout);

        const parentIsVisible = !div.parentNode || (div.parentNode.getAttribute('data-visible') !== "false");
        const htmlIsWorldVisible = htmlIsVisible && parentIsVisible;
        const equal = !htmlIsWorldVisible || same;
        div.setAttribute('data-equal', equal ? "true" : "false");
        div.setAttribute('data-visible', htmlIsVisible ? "true" : "false");

        div.setAttribute('data-flex-layout', this._getLayoutString(targetLayout));
        div.setAttribute('data-html-layout', this._getLayoutString(htmlLayout));

        target.children.forEach((subItem, index) => {
            const subDiv = div.childNodes[index];
            this._setLayoutInfoInHtmlAttribsRecursive(subItem, subDiv);
        });
    }

    _getLayoutString(layout) {
        return [layout.x, layout.y, layout.w, layout.h].map(f => f.toFixed(2)).join(" ");
    }

    _getTargetLayout(target) {
        return {x: target.x, y: target.y, w: target.w, h: target.h};
    }

    _getHtmlLayout(div) {
        const rect = div.getBoundingClientRect();
        const parentRect = div.parentNode.getBoundingClientRect();
        const x = rect.left - parentRect.left;
        const y = rect.top - parentRect.top;
        const w = rect.width;
        const h = rect.height;
        return {x, y, w, h};
    }

    _checkLayoutsEqual(layout, otherLayout) {
        const equal = this._compareFloats(layout.x, otherLayout.x) &&
            this._compareFloats(layout.y, otherLayout.y) &&
            this._compareFloats(layout.w, otherLayout.w) &&
            this._compareFloats(layout.h, otherLayout.h);
        return equal;
    }

    _compareFloats(f1, f2) {
        // Account for rounding errors.
        const delta = Math.abs(f1 - f2);
        return (delta < 0.1);
    }

    _collectMismatches() {
        this._results = [];
        this._collectRecursive(this._div, []);
        const results = this._results;
        this._results = null;
        return results.map(path => `[${path}]`);
    }

    _collectRecursive(div, location) {
        if (div.getAttribute('data-equal') === "false") {
            this._results.push(location.join("."));
        }
        div.childNodes.forEach((subDiv, index) => {
            const subLocation = location.concat([index]);
            this._collectRecursive(subDiv, subLocation);
        });
    }

}
