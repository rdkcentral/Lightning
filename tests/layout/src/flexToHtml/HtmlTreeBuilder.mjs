export default class HtmlTreeBuilder {

    constructor(item) {
        this._item = item;
        this._colorIndex = 0;
    }

    getHtmlTree() {
        this._colorIndex = 0;
        return this._transformItemToHtmlRecursive(this._item);
    }

    _transformItemToHtmlRecursive(item) {
        let div = document.createElement('div');

        this._applyItemHtml(item, div);

        if (item.hasFlexLayout()) {
            const layout = item.layout;
            if (layout.isFlexItemEnabled()) {
                this._applyFlexItemHtml(layout.flexItem, div)
            }

            if (layout.isFlexEnabled()) {
                this._applyFlexContainerHtml(layout.flex, div)
            }
        }

        if (!item.visible) {
            div.style.display = 'none';
        }

        return div;
    }

    _applyItemHtml(item, div) {
        div.style.display = 'block';
        div.style.position = 'relative';

        div.style.backgroundColor = this._getColor();

        if (item.hasFlexLayout()) {
            if (item.layout.originalWidth || (item.isFlexContainer() && !item.layout.flexParent)) {
                // If root-level, then set width explicitly.
                div.style.width = item.layout.originalWidth + 'px';
            }

            if (item.layout.originalHeight) {
                div.style.height = item.layout.originalHeight + 'px';
            }
        } else {
            // Absolute positioning.
            div.style.width = item.w + 'px';
            div.style.height = item.h + 'px';
            div.style.position = 'absolute';
        }
        div.style.left = item.offsetX + 'px';
        div.style.top = item.offsetY + 'px';

        while (div.firstChild) {
            div.removeChild(div.firstChild);
        }

        const children = item.children;
        children.forEach(childItem => {
            div.appendChild(this._transformItemToHtmlRecursive(childItem));
        });
    }

    _getColor() {
        return HtmlTreeBuilder._colors[this._colorIndex++ % HtmlTreeBuilder._colors.length];
    }

    _applyFlexContainerHtml(flex, div) {
        div.style.display = 'flex';
        div.style.position = 'relative';
        div.style.flexDirection = flex.direction;
        div.style.flexWrap = flex.wrap ? 'wrap' : 'nowrap';
        div.style.alignItems = flex.alignItems;
        div.style.alignContent = flex.alignContent;
        div.style.justifyContent = flex.justifyContent;

        div.style.paddingLeft = flex.paddingLeft + 'px';
        div.style.paddingTop = flex.paddingTop + 'px';
        div.style.paddingRight = flex.paddingRight + 'px';
        div.style.paddingBottom = flex.paddingBottom + 'px';
    }

    _applyFlexItemHtml(flexItem, div) {
        div.style.flexGrow = flexItem.grow;
        div.style.flexShrink = flexItem.shrink;
        div.style.alignSelf = flexItem.alignSelf;

        if (flexItem.minWidth && flexItem.item.flexParent) {
            div.style.minWidth = flexItem.minWidth;
        }

        if (flexItem.minHeight && flexItem.item.flexParent) {
            div.style.minHeight = flexItem.minHeight;
        }
    }

}

HtmlTreeBuilder._colors = [
    '#e6194b', '#3cb44b', '#ffe119', '#4363d8', '#f58231', '#911eb4', '#46f0f0', '#f032e6', '#bcf60c', '#fabebe', '#008080', '#e6beff', '#9a6324', '#fffac8', '#800000', '#aaffc3', '#808000', '#ffd8b1', '#000075', '#808080', '#ffffff', '#000000'
];