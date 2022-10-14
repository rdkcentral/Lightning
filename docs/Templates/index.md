# Templates


A Lightning (static) *template* defines the [Render Tree](../RenderEngine/RenderTree.md) for a Lightning app. It uses nested JavaScript objects. If you create a Lightning App, a basic Render Tree is automatically set up from the static template.


If a new instance of an App is created, the associated Render Tree [elements](../RenderEngine/Elements/index.md) are automatically created and the necessary properties are set.


In the (simple) example below, two elements are defined: one element for holding the header and one for holding the content. The header itself has a solid color background (`rect: true` and `color: 0xff005500`) and certain dimensions. It also has a child element that contains the title (specified using the text property).

## Live Demo


```
class LiveDemo extends lng.Application {
    static _template() {
        return {
            Header: {
                rect: true, w: 1920, h: 50, color: 0xff005500,
                Title: {
                    x: 50, y: 30, mountY: 0.5, text: { text: 'Header' }
                }
            },
            Content: {
                y: 60,
                MyImage: {
                    x: 100,
                    y: 100,
                    src: "/Lightning/img/LngDocs_LilLightningIdle.png" 
                }
            }
        }
    };
}

const App = new LiveDemo({stage: {w: window.innerWidth, h: window.innerHeight, useImageWorker: false}});
document.body.appendChild(App.stage.getCanvas());
```