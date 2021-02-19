# Events


The following loading events can be fired by a texture:

| Name | Description |
|---|---|
| `txLoaded` | Fires when a texture is successfully loaded. |
| `txError` | Fires when an error occurs when loading a texture. |
| `txUnloaded` | Fires when a texture is unloaded. |


## Live Demo


The following example shows a placeholder image when the first one does not load.


```

class TextureEventsExample extends lng.Application {
    static _template() {
        return {
            Image: {
                x: 20,
                y: 20,
                alpha: 0.01,
                src: '/invalid/path.png'
            }
        }
    }

    _init() {
        this.tag('Image').on('txLoaded', () => {
            console.log('texture loaded: ' + this.tag('Image').src)
            this.tag('Image').setSmooth('alpha', 1)
        })

        this.tag('Image').on('txError', () => {
            console.error('texture failed to load: ' + this.tag('Image').src)
            this.showPlaceholder()
        })
    }

    showPlaceholder() {
        this.tag('Image').src = '/Lightning/img/LngDocs_LilLightningIdle.png'
    }
}

const options = {stage: {w: window.innerWidth, h: window.innerHeight, useImageWorker: false}};
const App = new TextureEventsExample(options);
document.body.appendChild(App.stage.getCanvas());
```