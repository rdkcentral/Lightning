import Base from "../tree/Base.mjs";
import Layout from "./layout/FlexLayout.mjs";

export default class FlexContainer {


    constructor(item) {
        this._item = item;

        this._layout = new Layout(this);
        this._horizontal = true;
        this._reverse = false;
        this._wrap = false;
        this._alignItems = 'stretch';
        this._justifyContent = 'flex-start';
        this._alignContent = 'flex-start';

        this._paddingLeft = 0;
        this._paddingTop = 0;
        this._paddingRight = 0;
        this._paddingBottom = 0;
    }

    get item() {
        return this._item;
    }

    _changedDimensions() {
        this._item.changedDimensions();
    }

    _changedContents() {
        this._item.changedContents();
    }

    get direction() {
        return (this._horizontal ? "row" : "column") + (this._reverse ? "-reverse" : "");
    }

    set direction(f) {
        if (this.direction === f) return;

        this._horizontal = (f === 'row' || f === 'row-reverse');
        this._reverse = (f === 'row-reverse' || f === 'column-reverse');

        this._changedContents();
    }

    set wrap(v) {
        this._wrap = v;
        this._changedContents();
    }

    get wrap() {
        return this._wrap;
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

        this._changedContents();
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

        this._changedContents();
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

        this._changedContents();
    }

    set padding(v) {
        this.paddingLeft = v;
        this.paddingTop = v;
        this.paddingRight = v;
        this.paddingBottom = v;
    }

    get padding() {
        return this.paddingLeft;
    }
    
    set paddingLeft(v) {
        this._paddingLeft = v;
        this._changedDimensions();
    }
    
    get paddingLeft() {
        return this._paddingLeft;
    }

    set paddingTop(v) {
        this._paddingTop = v;
        this._changedDimensions();
    }

    get paddingTop() {
        return this._paddingTop;
    }

    set paddingRight(v) {
        this._paddingRight = v;
        this._changedDimensions();
    }

    get paddingRight() {
        return this._paddingRight;
    }

    set paddingBottom(v) {
        this._paddingBottom = v;
        this._changedDimensions();
    }

    get paddingBottom() {
        return this._paddingBottom;
    }

    patch(settings) {
        Base.patchObject(this, settings);
    }

}

FlexContainer.ALIGN_ITEMS = ["flex-start", "flex-end", "center", "stretch"];
FlexContainer.ALIGN_CONTENT = ["flex-start", "flex-end", "center", "space-between", "space-around", "space-evenly", "stretch"];
FlexContainer.JUSTIFY_CONTENT = ["flex-start", "flex-end", "center", "space-between", "space-around", "space-evenly"];
