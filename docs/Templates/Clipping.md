# Clipping


It's possible to use only a selected *part* of the currently set texture. Because the dimensions might also change, the element behaves as if the texture was only the selected part.

> Texture clipping provides a high-performance way of implementing *spritemaps* and rendering only part of a texture.

## Enable / Disable Clipping


You can *enable* texture clipping using the `enableClipping()` method, which uses `x`, `y`, `w` and `h` as parameters.

| Parameter | Type | Default | Description |
|---|---|---|---|
| `x` | Integer | 0 | The x-position of the texture object (in pixels) |
| `y` | Integer | 0 | The y-position of the texture object (in pixels) |
| `w` | Integer | 0 | The width of the texture object (in pixels) |
| `h` | Integer | 0 | The height of the texture object (in pixels_) |






To *disable* the active texture clipping, you can use the `disableClipping()` method.

## ResizeMode


You can use `resizeMode` to determine the clipping automatically from the width and
height of the source texture. This can be convenient if you are unsure about the exact image sizes but want the image to cover a specific area.


The resize modes `cover` and `contain` are supported (see [below](#cover)).


When the texture is loaded, the clipping is automatically
defined. If the `resizeMode` value of the already loaded texture changes, it is immediately applied.

> Because `resizeMode` actually changes the clipping attributes, you should either set the clipping attributes manually or specify the resizeMode (but not both).

### Cover


Using the `cover` resize mode, you can ensure that a texture covers a specific rectangular area.


You can clip part of
a texture. To control which part is clipped, you can set the `clipX` and `clipY` properties, which are
values from 0 to 1.


To clip the top, set `clipY` to 0. To clip the bottom, set `clipY` to 1.


By default, (`clipX`, `clipY`)
is set to (0.5, 0.5). This causes an equal amount to be clipped away from left / right or top / bottom.


For example:


```
Cover: {
    texture: {resizeMode: {type: 'cover', w: 200, h: 200, clipY: 0},
      type: lng.textures.ImageTexture, src: 'image.png'}
}
```

### Contain


Using the `contain` resize mode, you can fit an image in a specific rectangular area.


One axis will fit to the specified size, while the other will be less than specified. To properly align the texture within the area, use a *wrapper* element as follows:


```
Wrapper: {
    rect: true, w: 200, h: 200, color: 0xFFAAAAAA,
    Contain: {
        x: w=>w/2, y: h=>h/2, mount: 0.5,
        texture: {type: lng.textures.ImageTexture, src: 'image.png',
          resizeMode: {type: 'contain', w: 200, h: 200}}
    }
}
```

## Live Demo


```
class TextureDemo extends lng.Application {
    static _template() {
        return {
            MyTexture: {
                x: 200,
                y: 250,
                texture: {type: lng.textures.ImageTexture, src: '/Lightning/img/LngDocs_LilLightningIdle.png'},
                transitions: {
                    'texture.x': {duration: 4}
                }
            },
            Wrapper: {
                rect: true, w: 200, h: 200, color: 0xFFAAAAAA,
                Contain: {
                    x: w=>w/2, y: h=>h/2, mount: 0.5,
                    texture: {type: lng.textures.ImageTexture, src: '/Lightning/img/LngDocs_LilLightningIdle.png', resizeMode: {type: 'contain', w: 200, h: 200}}
                }
            },
            Cover: {
                x: 200, y: 0,
                texture: {type: lng.textures.ImageTexture, src: '/Lightning/img/LngDocs_LilLightningIdle.png', resizeMode: {type: 'cover', w: 200, h: 200, clipY: 0}}
            }
        }
    };
    
    _init() {
        const myTexture = this.tag("MyTexture");
        myTexture.transition('texture.x').on('finish', () => {
            const current = myTexture.getSmooth('texture.x');
            myTexture.setSmooth('texture.x', current ? 0 : 50);
        })
        myTexture.setSmooth('texture.x', 50); 
    }
}

const options = {stage: {w: window.innerWidth, h: window.innerHeight, useImageWorker: false}};
const App = new TextureDemo(options);
document.body.appendChild(App.stage.getCanvas());
```