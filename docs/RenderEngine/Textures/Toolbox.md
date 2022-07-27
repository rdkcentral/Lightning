# Toolbox


The `lng.Tools` Class contains useful functions for creating some commonly used textures.

## Textures and Functions

| Texture | Function |
|---|---|
| Rounded rectangle | `lng.Tools.getRoundRect(w, h, radius, strokeWidth, strokeColor, fill, fillColor)` |
| Drop-shadow rectangle | `lng.Tools.getShadowRect(w, h, radius = 0, blur = 5, margin = blur * 2)` |
| SVG rendering | `lng.Tools.getSvgTexture(url, w, h)` |


## Live Demo


```
class TextureDemo extends lng.Application {
    static _template() {
        return {
            x: 50,
            y: 50,
            RoundRectangle: {
                zIndex: 2,
                texture: lng.Tools.getRoundRect(150, 40, 4, 3, 0xffff00ff, true, 0xff00ffff),
            },
            Shadow: {
                x: 10,
                y: 10,
                zIndex: 1,
                color: 0x66000000,
                texture: lng.Tools.getShadowRect(150, 40, 4, 10, 15),
            },
            Svg: {
                x: 10,
                y: 50,
                zIndex: 0,
                texture: lng.Tools.getSvgTexture(Utils.asset('images/image.svg'), 50, 50),
            }
        }
    }
}

const options = {stage: {w: window.innerWidth, h: window.innerHeight, useImageWorker: false}};
const App = new TextureDemo(options);
document.body.appendChild(App.stage.getCanvas());
```
