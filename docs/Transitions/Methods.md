# Methods


You can use the various methods to get control over transitions, such as starting, stopping or resetting them.


For example:


```
static _template(){
    return {
        MyObject:{ 
        	x: 50, y: 50, w: 100, h: 100, rect: true,
        	transitions:{ 'x': { duration: 5 } }
        }
    }
}
```

## How to Call


To call a transition method, you have to get the correct transition `property` first, with `.transition(<property>)`. The following example calls the `start()` method of the `x` transition:


```
_init(){
   this.tag('MyObject').transition('x').start(100);
}
```

## Overview

| Name | Description |
|---|---|
| `start(targetValue : number)` | Start a new transition (similar to calling `setSmooth()`) |
| `stop()` | Stop the transition (at the current value) |
| `pause()` | Alias for `stop()` |
| `play()` | Resume the paused transition |
| `finish()` | Fast-forward the transition (to the target value) |
| `reset(targetValue : number, p : number)` | Set the transition at a specific point in time (where p is a value between 0 and 1) |
| `updateTargetValue(targetValue : number)` | Update the target value while keeping the current progress and value |


## Live Demo


The example below shows various methods that can be called on transitions. Press **left** or **right** to swap between the transitions.


```
class BasicUsageExample extends lng.Application {
    static _template() {
        return {
            Description:{ x: 50, y: 28, text:{ text: 'Press left or right to swap transitions.', fontSize: 22, wordWrap: true, wordWrapWidth: 450, lineHeight: 30 }},
            LilLightning:{ x: 50, y: 100, src: '/Lightning/img/LngDocs_LilLightningRun.png', transitions:{'x': {duration: 5}}}
        }
    }
    
    _init(){
       this._index = 0;
       this._animationTypes = ['start','stop','pause','play','finish','startTargetValue','resetTargetValue','updateTargetValue'];
       this._myTransition = this.tag('LilLightning').transition('x');
    }
    
    _handleLeft(){
        if(this._index &amp;gt; 0){
            this._index --;
            this.setTransitionMethod(this._animationTypes[this._index]);
        }
        console.log('left', this._animationTypes[this._index]);
    }
    
    _handleRight(){
        if(this._index &amp;lt; this._animationTypes.length -1){
           this._index ++;
           this.setTransitionMethod(this._animationTypes[this._index]);
        }
    }
    
    setDescription(v){
        this.tag('Description').patch({text:{ text: 'Current Method(): ${v}'}});
    }
    
    //Set transition type
    setTransitionMethod(v){
        this.setDescription(v);
        switch(v){
            case 'start':
                if(this.tag('LilLightning').x &amp;gt;= 500){
                    this._myTransition.start(50);
                }else{
                    this._myTransition.start(500);
                }
            break;
            case 'stop':
                this._myTransition.stop();
            break;
            case 'pause':
                this._myTransition.pause();
            break;
            case 'play':
                this._myTransition.play();
            break;
            case 'finish':
                this._myTransition.finish();
            break;
            case 'startTargetValue':
                this._myTransition.start(50);
            break;
            case 'resetTargetValue':
                this._myTransition.reset(50, 1);
            break;
            case 'updateTargetValue':
                this._myTransition.updateTargetValue(250);
            break;
        }
    }
       
}

const options = {stage: {w: window.innerWidth, h: window.innerHeight, useImageWorker: false}};
const App = new BasicUsageExample(options);
document.body.appendChild(App.stage.getCanvas());
```
