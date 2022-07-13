# Attributes


You can use animation attributes to define the general behavior of an animation.

| Name | Type | Default | Description | Values |
|---|---|---|---|---|
| `duration` | Float | 0 | Duration in seconds of the animation, from start to end |  |
| `delay` | Float | 0 | Delay in seconds before animation starts |  |
| `repeat` | Float | 0 | -1 means infinite, 0 no repeat, > 0 the number of repeats | -1, 0, 1, 2, ... |
| `repeatDelay` | Float | 0 | Delay in seconds before next repetition | 0, 1, 1.5, 2, ... |
| `repeatOffset` | Float | 0 | Offset to repeat from | 0..1 |
| `actions` | Array&amp;ltAction&amp;gt | [] | Actions the animation has to follow |  |
| `stopMethod` | String | fade | Method that defines the behavior of the animation when it is *stopped* | 'fade', 'reverse', 'forward', 'immediate', 'onetotwo' (see note [below](#onetotwo)) |
| `stopDuration` | Float | 0 | Duration in seconds of stopping |  |
| `stopDelay` | Float | 0 | Delay in seconds before stopping |  |
| `autostop` | Boolean | false | After the animation is finished, it is automatically stopped | 'true', 'false' |


> The stop method `onetotwo` is a special stop method. Its action ranges are defined from progress 0 to 2, instead of 0 to 1. When stopping, the current
animation is continued normally (up to progress 1), and then the progress is continued up to value 2.

## Live Demo


Press **right** to start the animation, and press **left** to stop the animation and reverse it.


```

class BasicUsageExample extends lng.Application {
    static _template() {
        return {
            LilLightning:{
                x: 50, y: 50, src: '/Lightning/img/LngDocs_LilLightningFlying.png'
            }
        }
    }
        
    _init(){
        this._lilLightningAnimation = this.tag('LilLightning').animation({
            duration: 2,
            delay: 1,
            repeat: 3,
            repeatDelay: 0,
            repeatOffset: 0,
            stopMethod: 'reverse',
            stopDuration: 1,
            stopDelay: 0.2,
            autostop: false,
            actions:[
                {p: 'x', v: {0: 50, 0.25: 250, 0.5: 250, 0.75: 500, 1: 50 }},
                {p: 'y', v: {0: 50, 0.25: 250, 0.5: 500, 0.75: 500, 1: 50 }}
            ]
        }); 
    }
    
    _handleLeft(){
        this._lilLightningAnimation.stop();
    }
    
    _handleRight(){
        this._lilLightningAnimation.start();
    }
    
}

const App = new BasicUsageExample({stage: {w: window.innerWidth, h: window.innerHeight, useImageWorker: false}});
document.body.appendChild(App.stage.getCanvas());
```