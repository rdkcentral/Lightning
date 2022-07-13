# Signal


The `signal()` method notifies a component's parent that an event happened on the component. It gives the parent the opportunity to route the event to a handler.


```
this.signal('signalName', arg1, arg2... argx)
```


You define the signals to be handled by a parent component by specifying the required `signals` property in the parent. The `signals` property contains a *literal object* that maps the signal name to a class method. If they are identical, the associated method name is used.


```
static _template() {
    return {
        Button: {
            type: ExampleButton,
            signals: {
                toggleText: "_toggleText"
            }
        }
    }
    
    _toggleText() {
        // Handle toggle here.
    }
}
```

## Pass Signals


If you would like to pass a signal to the parent, you could implement this by providing a *handler* that *re-signals* the signal. You can achieve this in a more convenient manner using the `passSignals` property:


```
static _template() {
    return {
        Button: {
            type: ExampleButton,
            passSignals: {
                toggleText: true, otherSignal: 'renamedOtherSignal'
            }
        }
    }
}
```

## Live Demo


The example below shows a button that signals its parent to show / hide a message and change the font color.


```
class SignalDemo extends lng.Application {
    static _template() {
        return {
            x: 20, y: 20,
            Button: {
                type: ExampleButton,
                buttonText: 'Toggle',
                //indicates the signals that your child component will send
                signals: {
                    toggleText: true,
                }
            },
            Message: {
                y: 80, alpha: 0, text: { text: 'Message' }
            }
        }
    }
    toggleText(alpha, color) {
        this.tag('Message').patch({color, smooth: { alpha }})
    }
    _getFocused() {
        return this.tag('Button')
    }
}

class ExampleButton extends lng.component {
    static _template() {
        return {
            color: 0xffffffff,
            texture: lng.Tools.getRoundRect(200, 40, 4),
            Label: {
                x: 100, y: 22, mount: .5, color: 0xff1f1f1f, text: { fontSize: 20 }
            }
        }
    }
    _init() {
        this.tag('Label').patch({ text: { text: this.buttonText }})
        this.toggle = false
        this.buttonColor = 0xffff00ff
    }
    _handleEnter() {
        this.toggle = !this.toggle
        if(this.toggle) {
            this.buttonColor = this.buttonColor === 0xffff00ff ? 0xff00ffff : 0xffff00ff
        }
        this.signal('toggleText', this.toggle, this.buttonColor)
    }
}

const App = new SignalDemo({stage: {w: window.innerWidth, h: window.innerHeight, useImageWorker: false}});
document.body.appendChild(App.stage.getCanvas());
```