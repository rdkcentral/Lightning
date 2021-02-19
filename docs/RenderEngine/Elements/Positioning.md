# Positioning


The following properties apply to the *position* of an element:

| Name | Type | Default | Description |
|---|---|---|---|
| `x` | Float | 0 | x coordinate relative to the parent |
| `y` | Float | 0 | y coordinate relative to the parent |
| `w` | Float | 0 | Width dimension. If not set: inherited from the active texture |
| `h` | Float | 0 | Height dimension. If not set: inherited from the active texture |
| `mount` | Float | 0 | Texture alignment (mountpoint) relative to the coordinates, with equal x and y |
| `mountX` | Float | 0 | Texture mountpoint at horizontal axis |
| `mountY` | Float | 0 | Texture mountpoint at vertical axis |





## Mountpoints


You can define texture mountpoints by defining separate values for `mountX` and `mountY`, or by using the `mount` property which has identical  `mountX` and `mountY` values.


Consider the following  example values for the `mount` property:

* 0 (default): the *top-left corner* of the element is positioned at the  (x,y) coordinates.
* 0.5: the *center* of the element  is positioned at the (x,y) coordinates.
* 1: the *bottom-right corner* of the element is positioned at the (x,y) coordinates.

## Dynamic Calculations


Besides using numeric values (in pixels), you can also specify a *function* that returns a value based on the width (x, w) or height (y, w) dimensions of the parent. The function is called again as soon as the parent's dimensions change.


For example:


```
class LiveDemo extends lng.Application {
    static _template() {
        return {
            Header: {
                rect: true, w: window.innerWidth, h: 50, color: 0xff005500,
                Title: {
                    x: (w => w - 50), mountX: 1, mountY: 0.5, y: 30,
                    text: { text: 'Header' },
                    OverlayGradient: {
                        w: (w => 0.25 * w),
                        rect: true,
                        colorLeft: 0xFF000000,
                        colorRight: 0x00000000
                    }
                }
            }
        }
    };
}

const App = new LiveDemo({stage: {w: window.innerWidth, h: window.innerHeight, useImageWorker: false}});
document.body.appendChild(App.stage.getCanvas());
```

> Lightning also provides a more *advanced* form of positioning: see [Flexbox](../../Templates/Flexbox.md) for more information.