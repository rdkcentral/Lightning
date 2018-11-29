export default class FlexContainer {


    constructor(viewCore) {
        this._v = viewCore;
        this._horizontal = true;
        this._reverse = false;
        this._alignItems = 'flex-start';
        this._justifyContent = 'flex-start';
        this._alignContent = 'flex-start';

        // 'own' calculated main axis size, without any stretch/grow/shrink.
        this._baseMainAxisSize = 0;
    }

    get direction() {
        return (this._horizontal ? "row" : "column") + (this._reverse ? "-reverse" : "");
    }

    set direction(f) {
        if (this.direction === f) return;

        this._horizontal = (f === 'row' || f === 'row-reverse');
        this._reverse = (f === 'row-reverse' || f === 'column-reverse');

        this._v._setHasFlexLayoutUpdates();
    }

    get alignItems() {
        return this._alignItems;
    }

    set alignItems(v) {
        if (this._alignItems === v) return;
        if (FlexContainer.ALIGN_ITEMS.indexOf(v) === -1) {
            throw new Error("Unknown alignItems, options: " + FlexContainer.ALIGN_ITEMS.join(","));
        }
        this._alignItems = v;

        this._v._setHasFlexLayoutUpdates();
    }

    get alignContent() {
        return this._alignContent;
    }

    set alignContent(v) {
        if (this._alignContent === v) return;
        if (FlexContainer.ALIGN_CONTENT.indexOf(v) === -1) {
            throw new Error("Unknown alignContent, options: " + FlexContainer.ALIGN_CONTENT.join(","));
        }
        this._alignContent = v;

        this._v._setHasFlexLayoutUpdates();
    }

    get justifyContent() {
        return this._justifyContent;
    }

    set justifyContent(v) {
        if (this._justifyContent === v) return;

        if (FlexContainer.JUSTIFY_CONTENT.indexOf(v) === -1) {
            throw new Error("Unknown justifyContent, options: " + FlexContainer.JUSTIFY_CONTENT.join(","));
        }
        this._justifyContent = v;

        this._v._setHasFlexLayoutUpdates();
    }

    get _fitSingleLine() {
        return (this._horizontal ? this._v._w : this._v._h) === 0;
    }

    /**
     * Sets lx,ly,lw,lh correctly for this flex container and all connected descendant flex containers.
     */
    layout() {

    }

    /**
     * Determines which items 'fit' on the main axis, and distribute them over it, setting their position and sizes on it.
     * @param {FlexItem[]} items
     * @return number
     *   The number of items (from the beginning of the items array) that fit on the line.
     */
    _distributeItemsOnMainAxis() {
    }

    /**
     * Applies growing/shrinking to items on the specified line.
     * This may force the main axis of the items to be set.
     * @param {FlexItem[]} items
     */
    _resizeLine(items) {

    }

    /**
     * Aligns all layout lines on the cross axis, one by one.
     * @return {boolean} redistribute
     *  Return true iff any of the (flex container) children's main axis size has changed due to cross-axis stretching.
     *  This requires the items to be re-distributed according to the new layout dimensions, possibly triggering layouts.
     */
    _alignLines() {

    }

    /**
     * Applies cross-axis alignment for items on the same layout line.
     * @param {FlexItem[]} items
     * @param {number} base
     *  The base position for the line.
     * @param {number} extra
     *  Additional amount of pixels to add to maxCrossSize.
     *  Used to distribute remaining size when align-content:stretch is set.
     * @return {boolean} redistribute
     *  Return true iff any of the (flex container) children's main axis size has changed due to cross-axis stretching.
     */
    _alignLayoutLine(items, base, additionalPixels) {

    }

    /**
     * Called when the main axis of this flex container is resized by the parent flex container.
     * @param {number} size
     */
    _resizeMainAxis(size) {

    }

    /**
     * Called when the cross axis of this flex container is resized by the parent flex container.
     * @param {number} size
     */
    _resizeCrossAxis(size) {

    }

    /**
     * Returns the currently set size of the flex item on this flex main axis.
     * @param {FlexItem} flexItem
     * @return {number}
     */
    _getMainAxisSize(flexItem) {
        return this._horizontal ? flexItem._lw : flexItem._lh
    }

    /**
     * Returns the maximum size of the cross axis for the specified items.
     * @param {View[]} items
     * @return number
     */
    _maxCrossAxisSize(items) {

    }

    /**
     * Returns the currently set size of the flex item on this flex cross axis.
     * @param {FlexItem} flexItem
     * @return {number}
     */
    _getCrossAxisSize(flexItem) {

    }

    /**
     * Resizes the item's cross axis, possibly triggering updates.
     * @param {FlexItem} flexItem
     * @param {number} size
     * @private
     */
    _setCrossAxisSize(flexItem, size) {

    }

    get _items() {
        return this._v.children;
    }

    get _stage() {
        return this._v.view.stage;
    }

    patch(settings) {
        this._stage.patchObject(this, settings);
    }

}

FlexContainer.ALIGN_ITEMS = ['flex-start', 'flex-end', 'center', 'stretch'];
FlexContainer.ALIGN_CONTENT = ['flex-start', 'flex-end', 'center', 'space-between', 'space-around', 'space-evenly', 'stretch'];
FlexContainer.JUSTIFY_CONTENT = ['flex-start', 'flex-end', 'center', 'space-between', 'space-around', 'space-evenly'];
