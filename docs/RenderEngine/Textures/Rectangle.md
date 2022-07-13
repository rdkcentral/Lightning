# Rectangle


The rectangle texture is a single-pixel texture that is stretched based on the dimensions of the element.


You can use several `color` properties to give an element a solid background. If you set different colors for different edges, you can create linear gradients.

> See [Rendering](../Elements/Rendering.md) for details about the available properties that are associated with texture colors.

## Live Demo


```
class TextureDemo extends lng.Application {
    static _template() {
        return {
            RectangleDefault: {
                x: 100, y: 100, w: 200, h: 100, rect: true
            },
            RectangleWithColor: {
                x: 400, y: 100, w: 200, h: 100, rect: true, color: 0xFF1C27bC
            },
            RectangleWithGradientTopBottom: {
                x: 100, y: 300, w: 200, h: 100, rect: true, colorTop: 0xFF636EFB, colorBottom: 0xFF1C27bC
            },
            RectangleWithGradientLeftRight: {
                x: 400, y: 300, w: 200, h: 100, rect: true, colorLeft: 0xFF636EFB, colorRight: 0xFF1C27bC
            },
            RectangleWithGradientDiagonal: {
                x: 100, y: 500, w: 200, h: 100, rect: true, colorUl: 0xFF636EFB, colorUr: 0xFF00FF00, colorBr: 0xFF1C27bC, colorBl: 0xFF00FF00,
            },
            RectangleWithGradientDiagonalMixed: {
                x: 400, y: 500, w: 200, h: 100, rect: true, colorLeft: 0xFF00FF00, colorBr: 0xFF1C27bC, colorUr: 0xFFFF0000
            }
        }
    };
}

const options = {stage: {w: window.innerWidth, h: window.innerHeight, useImageWorker: false}};
const App = new TextureDemo(options);
document.body.appendChild(App.stage.getCanvas());
```