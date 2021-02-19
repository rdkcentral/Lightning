# Texture Types


An element will only render something when a *texture* is defined. A texture is rendered as a background, and the children are rendered in front of it.


The easiest way to define a texture is by specifying one of the following shorthand properties:

| Name | Type | Default | Description |
|---|---|---|---|
| `rect` | Boolean | false | Solid color or gradient |
| `src` | String | '' | Image texture |
| `text` | Object | {} | Text texture |






You can also specify a texture object *directly*, using one of the following texture types:

* [Rectangle](Rectangle.md)
* [Image](Image.md)
* [Text](Text.md)
* [Toolbox](Toolbox.md)
* [Canvas](Canvas.md)
* [Custom](Custom.md)

## Live Demo


```
class BasicUsageExample extends lng.Application {
    static _template() {
        return {
            GradientTexture:{
                x: 50, y: 50, w: 150, h: 150, rect: true, colorUl: 0xFFD67210, colorBr: 0xFF144B83,
                Desc:{ x: 0, y: 160, text:{ text: 'I am a "gradient" texture', fontSize: 22, wordWrap: true, wordWrapWidth: 450, lineHeight: 30 }},
            },
            ImageTexture:{
                x: 350, y: 150, src: '/Lightning/img/LngDocs_LilLightningIdle.png',
                Desc:{ x: 0, y: 190, text:{ text: 'I am a "image" texture', fontSize: 22, wordWrap: true, wordWrapWidth: 450, lineHeight: 30 }},
            },
            TextTexture:{
                x: 50, y: 400, colorTop: 0xFFF1F1F1, colorBottom: 0xFF144B83, text:{ text: 'TEXT', fontSize: 40, wordWrap: true, wordWrapWidth: 450, lineHeight: 30 },
                Desc:{ x: 0, y: 50, text:{ text: 'I am a "text" texture', fontSize: 22, wordWrap: true, wordWrapWidth: 450, lineHeight: 30 }},
            },
            SolidColorTexture:{
                x: 350, y: 450, w: 150, h: 150, rect: true, color: 0xFF144B83,
                Desc:{ x: 0, y: 160, text:{ text: 'I am a "solid color" texture', fontSize: 22, wordWrap: true, wordWrapWidth: 450, lineHeight: 30 }},
            }
        }
    }
}

const App = new BasicUsageExample({stage: {w: window.innerWidth, h: window.innerHeight, useImageWorker: false}});
document.body.appendChild(App.stage.getCanvas());
```