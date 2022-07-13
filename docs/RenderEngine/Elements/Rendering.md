# Rendering


The following properties determine how the active texture and / or descendant textures are rendered:

| Name | Type | Default | Description |
|---|---|---|---|
| `alpha` | Float | 1 | Opacity: 0 = transparent, 1 = opaque |
| `visible` | Boolean | true | Enable / disable rendering (visibility) |
| `color` | Hex | 0xFFFFFFFF | Color (ARGB) |
| `colorTop` | Hex | 0xFFFFFFFF | Top color of a color gradient |
| `colorBottom` | Hex | 0xFFFFFFFF | Bottom color of a color gradient |
| `colorLeft` | Hex | 0xFFFFFFFF | Left color of a color gradient (overwrites colorUl, colorBl) |
| `colorRight` | Hex | 0xFFFFFFFF | Right color of a color gradient (overwrites colorUr, colorBr) |
| `colorUl` | Hex | 0xFFFFFFFF | Top-left color of a color gradient |
| `colorUr` | Hex | 0xFFFFFFFF | Top-right color of a color gradient |
| `colorBl` | Hex | 0xFFFFFFFF | Bottom-left color of a color gradient |
| `colorBr` | Hex | 0xFFFFFFFF | Bottom-right color of a color gradient |
| `clipping` | Boolean | false | Enables clipping (only for rectangular) |
| `zIndex` | Integer | 0 | z-Index sets render priority |
| `forceZIndexContext` | Boolean | false | Enables a z-index context |
| `shader` | Object | {} | Sets a default shader |
 Sets a non-default shader




## Visibility


You can set the visibility of an element in the following ways:

* Using the `visible` property. If  the value of this property is set to 'false',  the element is not rendered (which saves performance). If an element is invisible, the off-screen elements are invisible as well, so you do not have to hide those manually to maintain a good performance.
* Using the `alpha` property, which defines the opacity of an element and its descendants. If the value of this property is set to 0 (zero), the element is not rendered.

## Color


You can use the `color` property to colorize the currently active texture. You can specify different *directions* and /or *corner points* to create a gradient. See the [Rectangle](../Textures/Rectangle.md) texture to see colorization in action.

## Clipping


If the `clipping` property is set to 'true', everything outside the dimensions of the clipping area is *not* rendered. (The effect is similar to `overflow:hidden` in CSS.)


Setting this property might increase the performance, as descendants outside the clipping region are detected and not rendered.


[Clipping](../../Templates/Clipping.md) is implemented using the high-performance WebGL operation `scissor`. As a consequence, clipping  does *not* work for non-rectangular areas. So, if the element is rotated (by itself or by any of its ancestors), clipping is *not* applied.

> In such situations, you can use the advanced `renderToTexture` which applies clipping as a side effect.

## Z-indexing


Similar to CSS, Lightning supports *z-indexing*, which alters the expected order in which textures are rendered.
In Lightning, a *z-index context* is created by setting:

* a non-zero `zIndex`;
* `forceZIndexContext` (often useful in combination with `zIndex `= 0);
* `renderToTexture`.

## Shader


The `shader` property affects the way in which element textures and their descendants are rendered. For example:


```
class LiveDemo extends lng.Application {
    static _template() {
        return {
            shader: {type: lng.shaders.Grayscale, amount: 0.9},
            LilLightning:{ x: 100, y: 50, src: '/Lightning/img/LngDocs_LilLightningIdle.png'},
            Header: {
                rect: true, w: window.innerWidth, h: 50, color: 0xff005500
            },
            SubLilLightning: {
                x: 400, y: 50, src: '/Lightning/img/LngDocs_LilLightningIdle.png',
                shader: null // Reset shader to default.
            },
            SubLilLightning2: {
                x: 400, y: 250, src: '/Lightning/img/LngDocs_LilLightningIdle.png',
                shader: {type: lng.shaders.Inversion} // Reset shader to other.
            }
        }
    };
}

const App = new LiveDemo({stage: {w: window.innerWidth, h: window.innerHeight, useImageWorker: false}});
document.body.appendChild(App.stage.getCanvas());
```