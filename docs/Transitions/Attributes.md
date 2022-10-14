# Attributes


You can use transition attributes to define the general behavior of a transition.

| Name | Type | Default | Description |
|---|---|---|---|
| `duration` | Float | 0 | Duration in seconds of the transition from start to end |
| `delay` | Float | 0 | Delay in seconds before transition starts |
| `timingFunction` | String | 'ease' | Timing function (see settings [below](#Timing-Function-Settings)) |


## Timing Function Settings


You can specify the following settings for the `timingFunction`, which behave identical to the CSS timing function:

| Name | Description |
|---|---|
| `linear` | Straight point-to-point animation |
| `ease` | Transition starts at a constant speed and ends slowing down |
| `ease-in` | Transition starts slow and continues in a constant speed |
| `ease-out` | Transition starts at a constant speed and ends slowing down |
| `ease-in-out` | Transition starts slow, continues at a constant speed, and ends slowing down |
| `step-start` | Transition steps to start position |
| `step-end` | Transition steps to end position |
| `cubic-bezier(a,b,c,d)` | Custom bezier curve |


> You can see all options in action at [cubic-bezier.com](http://cubic-bezier.com/).

## Live Demo


The example below demonstrates the various `timingFunction` states in action. By pressing **left** or **right**, you can see the differences between the `linear`, `ease`, `ease-in`, `ease-out`, `ease-in-out`, `step-start`, and `step-end` states.


```
class BasicUsageExample extends lng.Application {
    static _template() {
        return {
            ExamplanationText:{ x: 50, y: 28, text:{ text: 'Press left or right to swap transitions.', fontSize: 22, wordWrap: true, wordWrapWidth: 450, lineHeight: 30 }},
            LilLightning:{ x: 100, y: 50, src: '/Lightning/img/LngDocs_LilLightningIdle.png'}
        }
    }
    
    _handleLeft(){
        if(this._index &amp;gt; 0){
            this._index --;
            this._currentTransition = this._transitions[this._index];
            this.changeSmoothing();
        }
    }
    
    _handleRight(){
        if(this._index &amp;lt; 6){
            this._index ++;
            this._currentTransition = this._transitions[this._index];
            this.changeSmoothing();
        }
    }
    
    changeSmoothing(){
        this.tag('ExamplanationText').patch({ text:{ text: 'This is the "${this._currentTransition}" transition.' }});
        this.tag("LilLightning").patch({ x: 100 }); // Reset to start position;
        //Try to change the parameters of the line below, like duration and delay to see what they change.
        this.tag('LilLightning').patch({ smooth:{ x: [400, { duration: 2, delay: 0, timingFunction: this._currentTransition } ]}});
    }
    
    _init(){
        this._index = 0;
        this._transitions = ['linear','ease','ease-in','ease-out','ease-in-out','step-start','step-end'];
        this._currentTransition = 'linear';
    }
    
}

const options = {stage: {w: window.innerWidth, h: window.innerHeight, useImageWorker: false}};
const App = new BasicUsageExample(options);
document.body.appendChild(App.stage.getCanvas());
```