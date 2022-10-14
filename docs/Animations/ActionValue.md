# Action Value


Every action should have a `v` property specified, which defines the *value* that is applied to the action property during the animation.


You can specify:

* a fixed value (`{p: 'visible', v: true, rv: false}`);
* a function  (`{p: 'alpha', v: (p => Math.sqrt(p)}`);
* a literal *value object* (see [below](#value-object)) which defines the value of several progress control points.

## Value Object


In the example  below, the subject is moved vertically to 50 px at 25% of the animation. Then, it is moved to -50 px at 75% and back to 0, respectively:


```
    {p: 'y', v: {0: 0, 0.25: 50, 0.75: -50, 1: 0}}
```


You can also use a value object on non-numeric values, though they are not interpolated:


```
{p: 'text.text', v: {0: "hello", 0.25: "world", 0.75: "bye!"}}
```

> Any property name that contains the string `color` (case insensitive), has values that are interpolated as ARGB values. This means
that you can specify a color animation as follows: `{p: 'color', v: {0: 0xFFFF0000, 1: 0xFF0000FF}}`.

## Smoothing


By default, all numeric values are *smoothened*. You can get a linear animation by specifying the `sm` property:


```
{p: 'rotation', v: {sm: 0, 0: 0, 1: 2*Math.PI}}
```

> By default, the value of `sm` is 0.5, but it can also be increased to create a more smoothened value curve. The smoothness
value is a value between 0 and 0.95 (setting it above 0.95 may lead to unexpected behavior).

## Live Demo


In the following example, smoothing is applied to the left cube, and no smoothing is applied to the right cube:


```

class BasicUsageExample extends lng.Application {
    static _template() {
        return {
            LilLightningEase:{
                x: 150, y: 200, scaleX: -1, src: '/Lightning/img/LngDocs_LilLightningIdle.png'
            },
            LilLightningNoEase:{
                x: 400, y: 200, src: '/Lightning/img/LngDocs_LilLightningIdle.png'
            }
        }
    }
        
    _init(){
        this._myEasingAnimation = this.tag('LilLightningEase').animation({
            duration: 3, repeat: -1, stopMethod: 'immediate',
            actions: [{ p: 'y', v: { 0: { v: 400, sm: 0 }, 0.5: { v: 50, sm: 1 }, 1: { v: 400, sm: 0 } } }]
        });
        
        this._myNonEasingAnimation = this.tag('LilLightningNoEase').animation({
            duration: 3, repeat: -1, stopMethod: 'immediate',
            actions: [{ p: 'y', v: { 0: { v: 400, sm: 0 }, 0.5: { v: 50, sm: 0 }, 1: { v: 400, sm: 0 } } }]
        });
        
        this._myEasingAnimation.start();
        this._myNonEasingAnimation.start();
    }
}

const App = new BasicUsageExample({stage: {w: window.innerWidth, h: window.innerHeight, useImageWorker: false}});
document.body.appendChild(App.stage.getCanvas());
```