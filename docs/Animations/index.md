# Animations


You can use animations to describe a fixed change of property values over time.

## Defining an Animation


You attach an animation to a *view* (i.e., the subject of the animation). For example:


```
const myAnimation = this.tag('MyAnimationObject').animation({
    duration: 1,                //duration of 1 second
    repeat: 0,                  //Plays only once
    stopMethod: 'immediate',    //Stops the animation immediately
    actions: [
        {p: 'alpha', v: {0: 0, 1: 1}},
        {p: 'y', v: {0: 0, 0.25: 50, 0.75: -50, 1: 0}}
    ]
});
```

## Starting an Animation


You start an animation with the `start` method:


```
myAnimation.start();
```

## Live Demo


```

class BasicUsageExample extends lng.Application {
    static _template() {
        return {
            LilLightning:{
                x: 275, y: 275, src: '/Lightning/img/LngDocs_LilLightningFlying.png'
            }
        }
    }
        
    _init(){
        this._lilLightningAnimation = this.tag('LilLightning').animation({
            duration: 6,
            repeat: -1,
            stopMethod: 'immediate',
            actions:[
                {p: 'scaleX', v: { 0: {v: 1, s: 1}, 0.5: {v: -1, s: 1}, 1: {v: 1, s: 1}}},
                {p: 'x', v: {0: 50, 0.25: 250, 0.5: 500, 0.75: 450, 1: 50}},
                {p: 'y', v: {0: 50, 0.25: 250, 0.5: 50, 0.75: 100, 1: 50 }}
            ]
        });
        this._lilLightningAnimation.start();
    }
}

const App = new BasicUsageExample({stage: {w: window.innerWidth, h: window.innerHeight, useImageWorker: false}});
document.body.appendChild(App.stage.getCanvas());
```