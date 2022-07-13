# Canvas


You can draw something to a canvas and then render the result as a texture.

## Live Demo


```

class CanvasTextureExample extends lng.Application {
    static _template() {
        return {
            Example: {
                texture: lng.Tools.getCanvasTexture(CanvasTextureExample._createCanvas)
            }
        }
    }

    static _createCanvas(cb, stage) {
        let canvas = stage.platform.getDrawingCanvas();
        canvas.width = 100;
        canvas.height = 100;
        let ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        ctx.fillStyle = lng.StageUtils.getRgbaString(0xFFFF0000);
        ctx.fillRect(10, 10, 80, 80)
        cb(null, canvas);
    }
}

const options = {stage: {w: window.innerWidth, h: window.innerHeight, useImageWorker: false}};
const App = new CanvasTextureExample(options);
document.body.appendChild(App.stage.getCanvas());
```