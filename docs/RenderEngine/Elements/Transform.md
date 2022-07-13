# Transform


An element can be *scaled* or *rotated* along with all of its descendants.

> Lightning supports independent rotation and scaling on both axes.

## Transform properties

| Name | Type | Default | Description |
|---|---|---|---|
| `scale` | Float | 1 | Scale width and height (1 = 1:1) |
| `scaleX` | Float | 1 | Scale width (1 = 1:1) |
| `scaleY` | Float | 1 | Scale height (1 = 1:1) |
| `rotation` | Float | 0 | Rotation in radians |
| `pivot` | Float | 0.5 | Pivot position: 0 = top-left, 0.5 = center, 1 = bottom-right (see [Pivot](#Pivot) below) |
| `pivotX` | Float | 0.5 | Pivot position (horizontal axis) |
| `pivotY` | Float | 0.5 | Pivot position (vertical axis) |





## Pivot


The pivot point defines the point within the element (from 0 to 1) around which the rotation and / or scaling is performed.


```
class LiveDemo extends lng.Application {
    static _template() {
        return {     
            LilLightning:{
                x: 250, y: 250, w: 100, h: 200, pivotX: 1, pivotY: 1, src: '/Lightning/img/LngDocs_LilLightningIdle.png',
                ChildObject:{ x: 50, y: 0, mount: 0.5, w: 25, h: 25, rect: true }
            }
        }
    };
    
    _init(){
        this._lilLightningAnimation = this.tag('LilLightning').animation({
            duration: 6,
            repeat: -1,
            stopMethod: 'immediate',
            actions:[
                {p: 'rotation', v: { 0: 0, 1: 6.29 }},
                {t: 'ChildObject', p: 'rotation', v: {0: 0, 1: 6.29 }}
            ]
        });
        this._lilLightningAnimation.start();
    }
}

const App = new LiveDemo({stage: {w: window.innerWidth, h: window.innerHeight, useImageWorker: false}});
document.body.appendChild(App.stage.getCanvas());
```