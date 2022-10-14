# Flexbox


Sometimes, absolute positioning is not enough. You may want to position elements stacked horizontally or vertically, or wrap items when there is too much to fit in an area. This process is called *layouting* and Lightning has a simple solution for it, which is called *Flexbox*.


Flexbox allows you to dynamically stack items of rows and columns. In Lightning, the `flex` and `flexItem` properties define the flex layout settings.


Instead of using the HTML CSS toolbox, Lightning only applies the Flexbox layout methodology.

> Although the Lightning layout engine provides some smart performance optimizations, it is still rather CPU-intensive. It is best used for situations in which the flex items do *not* change dimensions on a regular basis.


Using Flexbox, you can also nest flex containers, making them both flex containers *and* flex items. For example:


```
    MyFlexBox:{ x: 50, y: 50, w: 250, flex:{ direction: 'row', padding: 20, wrap: true }, rect: true,
        MyFlexItem: { w: 50, h: 100, flexItem:{ margin: 10 }, rect: true, color: 0xFF797979 },
        MyFlexBoxItemWithFlexItemChildren:{flex: {direction: 'column', padding: 20 }, flexItem: { margin: 10 }, rect: true,
            children: [
                { text: {text: "line 1"} },
                { text: {text: "line 2"} }
            ]
        }
    }
```

> See the  [Flexbox Guide](https://css-tricks.com/snippets/css/a-guide-to-flexbox/) for more information about Flexbox layouting.

## Differences with CSS Flexbox


Lightning's Flexbox feature is almost identical to the one that is provided by Chrome and Firefox. However, we have implemented a few *differences* for the sake of improving consistency and usability.


The tables below describe the major differences between the Flexbox feature in Lightning and the one in Chrome / Firefox, respectively.

### Flex Container


Specified in the element property: `flex: {}`.

| Lightning | Type | CSS | Difference (if any) |
|---|---|---|---|
| `direction` | String | flex-direction |  |
| `wrap` | Boolean | flex-wrap | Only wrap ('true') and no wrap ('false') are supported |
| `alignItems` | String | align-items | Baseline is not supported |
| `alignContent` | String | align-items |  |
| `justifyContent` | String | justify-content |  |
| `padding` | Number (px) | padding |  |
| `paddingLeft` | Number | padding-left |  |
| `paddingTop` | Number | padding-top |  |
| `paddingRight` | Number | padding-right |  |
| `paddingBottom` | Number | padding-bottom |  |


### Flex Item


Specified in the element property: `flexItem: {}`.

| Lightning | Type | CSS | Difference (if any) |
|---|---|---|---|
| `grow` | Number | flex-grow |  |
| `shrink` | Number | flex-shrink | Non-containers are not shrinkable by default |
| `alignSelf` | String | align-self |  |
| order |  | Not supported |
| flex-basis |  | Not supported (behaves as set to 'auto') |
| `minWidth` | Number (px) | min-width |  |
| `minHeight` | Number | min-height |  |
| `maxWidth` | Number | max-width |  |
| `maxHeight` | Number | max-height |  |
| `margin` | Number | margin |  |
| `marginLeft` | Number | margin-left |  |
| `marginTop` | Number | margin-top |  |
| `marginRight` | Number | margin-right |  |
| `marginBottom` | Number | margin-bottom |  |


## Disable Flex Item


All children of a flex container are by default flex items. However, it is possible to make one of the children behave as an *absolutely positioned element* by specifying `flexItem: false`. In this case, the item does not affect the flex layout and is positioned absolutely.

## Invisible Elements


When an element is invisible (`visible: false`) it is *ignored* in the flex layout. In contrast, when an element is fully transparent (`alpha: 0`) it takes up space in the layout as normal.

## Auto Sizing


A flex container can have a *fixed* or *specified* `w` and / `h`. This may affect the positioning of the items within it.


It is also possible to *not* specify it (or set it to 0). In that case, the flex container will always *fit to the contents* on those axes. This is deliberately inconsistent with HTML CSS, where the fitting on the flex container depends on the axis (the horizontal axis usually falls back to the parent width), which feels as a rather odd behavior.

## Offsets


When enabling flexbox, the `x` and `y` properties act as relative positions to the positions calculated by the layout engine.

## Final Coordinates


After the layout has been done, you can find the element's coordinates and size by using the `finalX`, `finalY`, `finalW`, `finalH` element properties.


To ensure a full stage layout (without rendering), you can use `this.stage.update()`. After that, the `finalX` etc. properties will contain the correct value.

## Live Demo


The example below shows how flexbox works when you change the width of the `flex` wrapper.


```
class FlexExample extends lng.Application {
    static _template() {
        return {
            Wrapper:{ x: 50, y: 50, w: 250,  flex:{ direction: 'row', padding: 20, wrap: true }, rect: true, color: 0xFF2D2D2D, paddingLeft: 200,
                Item1: { w: 50, h: 100, flexItem:{ margin: 10 }, rect: true, color: 0xFF797979 },
                Item2: { w: 50, h: 100, flexItem:{ margin: 10 }, rect: true, color: 0xFFA7A7A7 },
                Item3: { w: 50, h: 100, flexItem:{ margin: 10, alignSelf: 'stretch', grow: 1, maxWidth: 190, maxHeight: 100 }, rect: true, color: 0xFFD3D3D3 },
                Item4: { w: 90, h: 50, flexItem:{ margin: 10, alignSelf: 'stretch', grow: 1, maxWidth: 230, maxHeight: 100 }, rect: true, color: 0xFF74B4A7 },
               
                Sub: {flex: {direction: 'column', padding: 20}, flexItem: { margin: 10, alignSelf: 'stretch', grow: 1, maxWidth: 380 }, rect: true, color: 0xFF486f67,
                    children: [
                        { text: {text: "line 1"} },
                        { text: {text: "line 2"} },
                        { text: {text: "line 3"} },
                        { text: {text: "line 4"} }
                    ]
                }
            }
        }
     }
     _init(){
         this._myFlexAnimation = this.tag('Wrapper').animation({
             duration: 4, repeat: -1, stopMethod: 'immediate',
             actions: [{ p: 'w', v: { 0: 250, 0.5: 430, 1: 250 } }]
         });
         this._myFlexAnimation.start();
     }
}


const options = {stage: {w: window.innerWidth, h: window.innerHeight, useImageWorker: false}};
const App = new FlexExample(options);
document.body.appendChild(App.stage.getCanvas());
```