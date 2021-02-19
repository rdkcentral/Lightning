# Events


An animation is an *EventEmitter* that can emit the following events:

| Name | Description |
|---|---|
| `start` | Animation starts |
| `delayEnd` | Delay has ended |
| `progress` | Animation has progressed (argument: progress value between 0 and 1 (or 0 and 2 in case of stopMethod `onetotwo`) ) |
| `repeat` | Animation repeats (argument: number of repeats) |
| `pause` | Animation is paused |
| `resume` | Paused animation is resumed |
| `finish` | Animation has finished |
| `stop` | Animation is stopped |
| `stopDelayEnd` | Stop delay has ended |
| `stopContinue` | Paused animation that was stopping, is resumed |
| `stopFinish` | Animation finished stopping |


## Live Demo


```

class BasicUsageExample extends lng.Application {
    static _template() {
        return {
            Progress: {
                x: 50, y: 50, text: {fontSize: 32}
            },
            LilLightning:{
                x: 0, y: 200, src: '/Lightning/img/LngDocs_LilLightningIdle.png'
            }
        }
    }
        
    _init(){
        const lilLightningAnimation = this.tag('LilLightning').animation({
            duration: 2, 
            repeat: -1, 
            repeatDelay: 0.5, 
            actions: [
                { p: 'x', v: { 0: 100, 0.5: 450, 1: 100 } }
            ]
        });
        lilLightningAnimation.on('progress', (p)=>{
            this.tag("Progress").text = "Progress: " + p;
        });
        lilLightningAnimation.start();
    }
}

const App = new BasicUsageExample({stage: {w: window.innerWidth, h: window.innerHeight, useImageWorker: false}});
document.body.appendChild(App.stage.getCanvas());
```