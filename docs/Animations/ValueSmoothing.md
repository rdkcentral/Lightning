# Value Smoothing


For each control point, you can specify how the value curve around it  should behave.
The following example produces a 'bouncing ball' effect:


```
{ p: 'y', 
    v: { 
        0: { v: -100, sm: 1, s:0 }, 
        0.33 : { v: 0, sm: 0.1, s: 0}, 
        0.67 : {v: -40, sm: 1, s: 0},
        1: { v: 0, sm: 0.1 } 
    }
}
```

## Attributes

| Name | Type | Default | Description | Values |
|---|---|---|---|---|
| `v` | Float | 0 | Value | Exact value at control point |
| `sm` | Float | 0.5 | Smoothness | Smoothness of the curve around the point |
| `s` | Float | 0 | Slope | The slope (value per progress unit, 0 means flat, positive means 'curving upwards', negative means 'curving downwards' ) |
| `sme` | Float | 0.5 | Smooth end | Outgoing curve smoothness, if different from (incoming) smoothness (`sm`) |
| `se` | Float | 0 | Slope end | Outgoing curve sloop, if different from (incoming) slope (`s`) |


## Live Demo


```
class BasicUsageExample extends lng.Application {
    static _template() {
        return {
            Wrapper: {
                x: 300, y: 300,
                LilLightning:{
                    src: '/Lightning/img/LngDocs_LilLightningIdle.png'
                }
            }
        }
    }
    
    _init() {
        const myAnimation = this.tag('LilLightning').animation({
            duration: 2,
            repeat: -1,
            actions: [
                { 
                    p: 'y', 
                    v: { 
                        0: { v: -200, sm: 0.8, s:0 }, 
                        0.1 : {v: 0, sm: 0.1, s: 0}, 
                        0.2 : {v: -120, sm: 0.8, s: 0},
                        0.3 : {v: 0, sm: 0.1, s: 0}, 
                        0.4 : {v: -60, sm: 0.8, s: 0},
                        0.5 : {v: 0, sm: 0.1, s: 0}, 
                        0.6 : {v: -30, sm: 0.8, s: 0},
                        0.7 : {v: 0, sm: 0.1, s: 0},
                        0.8 : {v: -10, sm: 0.8, s: 0},
                        0.9 : {v: 0, sm: 0.1, s: 0},
                        1: { v: 0, sm: 0.8 } 
                    }
                }
            ]
        });
        myAnimation.start();
    }
}


const App = new BasicUsageExample({stage: {w: window.innerWidth, h: window.innerHeight, useImageWorker: false}});
document.body.appendChild(App.stage.getCanvas());
```