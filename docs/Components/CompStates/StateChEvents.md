# Change Events


Each component state change fires an `$enter` and an `$exit` event.


The following table contains a description of these events.

| Name | Type | Description |
|---|---|---|
| `$enter(event)` | Function | Triggers when entering a state. |
| `$exit(event)` | Function | Triggers when exiting a state. |



The `event` parameter contains information to help identifying the state changes, for example:


```
{
    newState: '',
    prevState: '',
    sharedState: ''
}
```

## Live Demo


```
class StateEventsExample extends lng.Application {
    static _template() {
        return {
            Enter: {
                x: 50,
                y: 50,
                text: {
                    fontSize: 20,
                    text: '$enter:',
                }
            },
            Exit: {
                x: 50,
                y: 180,
                text: {
                    fontSize: 20,
                    text: '$exit:'
                }
            }
        }
    }
    
    _init(){
        this._setState('FirstState')
    }
        
    static _states() {
        return [
            class FirstState extends this {
                $enter(event) {
                    this.setMessage('Enter', 'FirstState', event)
                    setTimeout(() =&amp;gt; {
                        this._setState('SecondState')
                    }, 3000)
                }
                $exit(event) {
                    this.setMessage('Exit', 'FirstState', event)
                }
            },
            class SecondState extends this {
                $enter(event) {
                    this.setMessage('Enter', 'SecondState', event)
                    setTimeout(() =&amp;gt; {
                        this._setState('FirstState')
                    }, 3000)
                }
                $exit(event) {
                    this.setMessage('Exit', 'SecondState', event)
                }
            },
        ]
    }

    setMessage(tag, source, event) {
        this.tag(tag).patch({
            text: {
                text: '$${tag.toLowerCase()} ${source}:\n \n'
                    + JSON.stringify(event)
                    .replace(/[,{}]/g, '\n')
                    .replace(/:/g, ': ')
                    .replace(/"/g, '')
            }
        })
    }
}

const App = new StateEventsExample({stage: {w: window.innerWidth, h: window.innerHeight, useImageWorker: false}});
document.body.appendChild(App.stage.getCanvas());
```