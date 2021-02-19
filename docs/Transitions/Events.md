# Events


A transition is an *EventEmitter* that can emit the following events:

| Name | Description |
|---|---|
| `start` | Transition starts |
| `delayEnd` | Delay has ended |
| `progress` | Transition has progressed (argument: progress value between 0 and 1) |
| `finish` | Transition has finished |
| `stop` | Transition is stopped |


## Live Demo


Press **left**, **right**, **up** or **down** to move LilLightning. See how the text changes
when the `start` and `finish` events are triggered after completion of each transition.


```
class BasicUsageExample extends lng.Application {
    static _template() {
        return {
            LilLightning: {
                x: 300, y: 300, src: '/Lightning/img/LngDocs_LilLightningFlying.png',
                transitions: {x: {duration: 1}, y: {duration: 1, timingFunction: 'linear'}}
            },
            Message: {
                x: 50, y: 50, text: {fontSize: 32}
            }
        };
    }

    _handleLeft(){
        const subject = this.tag("LilLightning");
        const targetX = subject.getSmooth('x') - 100;
        subject.setSmooth('x', targetX);
    }

    _handleRight(){
        const subject = this.tag("LilLightning");
        const targetX = subject.getSmooth('x') + 100;
        subject.setSmooth('x', targetX);
    }

    _handleUp(){
        const subject = this.tag("LilLightning");
        const targetY = subject.getSmooth('y') - 100;
        subject.setSmooth('y', targetY);
    }

    _handleDown(){
        const subject = this.tag("LilLightning");
        const targetY = subject.getSmooth('y') + 100;
        subject.setSmooth('y', targetY);
    }

    _init(){
        this.tag("LilLightning").transition('x').on('start', () => {
            this.tag("Message").text.text = "Started X transition to " + this.tag("LilLightning").getSmooth('x');
        });
        this.tag("LilLightning").transition('x').on('finish', () => {
            this.tag("Message").text.text = "Finished X transition";
        });
        this.tag("LilLightning").transition('y').on('start', () => {
            this.tag("Message").text.text = "Started Y transition to " + this.tag("LilLightning").getSmooth('y');
        });
        this.tag("LilLightning").transition('y').on('finish', () => {
            this.tag("Message").text.text = "Finished Y transition";
        });
    }

}

const options = {stage: {w: window.innerWidth, h: window.innerHeight, clearColor: 0x00000000, Canvas2D: false, useImageWorker: false}, debug: true}
options.keys = {
    38: "Up",
    40: "Down",
    37: "Left",
    39: "Right",
    13: "Enter",
    9: "Back",
    8: "Back",
    93: "Back",
    174: "Back",
    175: "Menu",
    83: "Search"
};
const App = new BasicUsageExample(options);
document.body.appendChild(App.stage.getCanvas());
```