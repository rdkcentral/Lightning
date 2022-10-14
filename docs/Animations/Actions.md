# Actions


The actions of an animation define what happens with the specified views and properties while the animation is executed.

## Attributes

| Name | Type | Default | Description | Values |
|---|---|---|---|---|
| `t` | String | none | Tag selector (see View.tag function) on which the animation must be applied | SomeTag,SomeTag.SomeSubTag |
| `p` | Property | none | Object property you want to animate | x, y, w, h, alpha, rotation, scale, texture.x, shader.someProp |
| `v` | Object | {} | Definition of time-value function | See description |
| `rv` | * | none | After stopping, the defined value `v` at progress 0 is used. If another value is desired, `rv` can be used. |  |


## Value Function


The `v` attribute defines the progress-to-value function over time.

## Live Demo


The example below contains some of the actions you can perform on an animation property, such as changing the `src`, `x` and `y` position, and the `scale`.


```

class BasicUsageExample extends lng.Application {
    static _template() {
        return {
            LilLightning:{
                x: 50, y: 250, src: '/Lightning/img/LngDocs_LilLightningIdle.png'
            }
        }
    }
        
    _init(){
        const lilLightningFlying = this.tag('LilLightning').animation({
            duration: 4, repeat: -1, stopMethod: 'immediate',
            actions: [
                { p: 'src', v: { 0: '/Lightning/img/LngDocs_LilLightningIdle.png', 0.2:  '/Lightning/img/LngDocs_LilLightningRun.png', 0.6:  '/Lightning/img/LngDocs_LilLightningFlying.png'} },
                { p: 'x', v: { 0: {v: 50, se: 0}, 0.2: {v: 50, s: 0}, 0.6: {v: 250, s: 0}, 1: 700 } },
                { p: 'y', v: { 0: {v: 250, se: 0}, 0.2: {v: 250, s: 0}, 0.6: {v: 250, s: 0}, 1: -150 } },
                { p: 'scale', v: { 0: {v: 1, se: 0}, 0.2: {v: 1, s: 0}, 0.6: {v: 1, s: 0}, 1: 0.2 } }
            ]
        });
        lilLightningFlying.start();
    }
}

const App = new BasicUsageExample({stage: {w: window.innerWidth, h: window.innerHeight, useImageWorker: false}});
document.body.appendChild(App.stage.getCanvas());
```