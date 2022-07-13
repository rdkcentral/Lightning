# Image


An *image* texture accepts a `src` property (referring to the URI of an image) that is subsequently fetched, loaded and rendered.

## Events


You can listen to texture [events](../../Templates/Events.md) to see whether an image has successfully loaded or not.

## Live Demo


```

class BasicUsageExample extends lng.Application {
    
    static _template(){
        return {
            UsingShorthand:{ x: 250, y: 100, src: '/Lightning/img/LngDocs_LilLightningIdle.png' },
            UsingTexture:{ x: 250, y: 300, texture: {type: lng.textures.ImageTexture, src: '/Lightning/img/LngDocs_LilLightningIdle.png'}}
        };
    }
}

const options = {stage: {w: window.innerWidth, h: window.innerHeight, useImageWorker: false}};
const App = new BasicUsageExample(options);
document.body.appendChild(App.stage.getCanvas());
```