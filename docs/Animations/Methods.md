# Methods


You can use the following methods on an animation:

| Name | Description |
|---|---|
| `start()` | Start (or restart if already running) the animation |
| `play()` | If playing (or stopped) then start.  If paused, continue. If playing or finished, ignored |
| `pause()` | If playing, then stop at the current position (can be resumed by calling `play`) |
| `replay()` | Same as `play`, but if currently finished, then restart |
| `skipDelay()` | If currently waiting for the (stop) delay, skip it and continue |
| `finish()` | If currently playing, fast-forward the animation to the end. If stopping, fast forward it to the end of the stop animation |
| `stop()` | Stop the animation (effect depends on the `stop `method and properties) |
| `stopNow()` | Stop the animation immediately (as if  the `stop` method 'immediate' was set) |
| `isPaused() : Boolean` | Return 'true' if the current state is 'paused' |
| `isPlaying() : Boolean` | Return 'true' if the current state is 'playing' |
| `isStopping() : Boolean` | Return 'true' if the current state is 'stopping' |
| `isActive() : Boolean` | Return 'true' if currently progressing (playing or stopping) |
| `progress(dt : Float)` | Manually progress the animation forward by `dt` seconds |


## States


It is important to remember that an animation can be in one of the following **states**:

* `idle`
* `playing`
* `stopping`
* `stopped`
* `finished`
* `paused`

## Live Demo


```

class BasicUsageExample extends lng.Application {
    static _template() {
        return {
            CommandText:{ x: 50, y: 28, text:{ text: '', fontSize: 22 }},
            LilLightning:{
                x: 250, y: 200, src: '/Lightning/img/LngDocs_LilLightningIdle.png'
            }
        }
    }
        
    set commandText(v){
        this.tag('CommandText').patch({ text:{text: 'Animation Command: ${v}'} });
    }
        
    _init(){
        this._myAnimation = this.tag('LilLightning').animation({
            duration: 3, repeat: -1, stopMethod: 'immediate',
            actions: [{ p: 'y', v: { 0: { v: 450, sm: 0 }, 0.5: { v: 100, sm: 1 }, 1: { v: 450, sm: 0 } } }]
        });
        this._myAnimation.start();
        this.commandText = 'start';
    }
    
    _handleLeft(){
        this._myAnimation.start();
        this.commandText = 'start';
    }
    
    _handleRight(){
        this._myAnimation.stop();
        this.commandText = 'stop';
    }
    
    _handleUp(){
        this._myAnimation.pause();
        this.commandText = 'pause';
    }
    
    _handleDown(){
        this._myAnimation.play();
        this.commandText = 'play';
    }
}

const App = new BasicUsageExample({stage: {w: window.innerWidth, h: window.innerHeight, useImageWorker: false}});
document.body.appendChild(App.stage.getCanvas());
```