# Key Handling


TV remotes usually generate key events in the browser. Lightning attaches a *key event listener* to the canvas element, and provides a way to handle *key-based input*.


The [focus path](Focus.md) is responsible for key handling. When a key is received, it is handled as follows:

1. Search the focus path *top-down* for a component that contains a `_capture{Keyname}()` or `_captureKey()` method..
2. If no capture handler was found, search *bottom-up* for a component that contains a `_handle{Keyname}()` or `_handleKey()` method.


If a key handler returns 'false', propagation is not stopped and the next component is allowed to handle the key event.

## Key Mapping


Lightning can be configured to *map* a specific key to a specific handler method.


The default key mapping supports **Left**, **Right**, **Up**, **Down**, **Enter**, **Back** (or **Backspace**) and **Exit** (or **Escape**).


If the key is *not* specified in the mapping, it can still be handled by the *catchall* method `_handleKey()`.


The key mapping can be customized as follows:


```
class BasicUsageExample extends lng.Application {
    static _template() {
        return {
            Message: {text: {text: "Press 's' key to show Search"}}
        }
    }
    
    _handleSearch(){
        this.tag("Message").text.text = "Search";
    }    
}


const options = {stage: {w: window.innerWidth, h: window.innerHeight, useImageWorker: false}}
options.keys = {
    38: "Up",
    40: "Down",
    37: "Left",
    39: "Right",
    13: "Enter",
    83: "Search" // Map s to search
};
const App = new BasicUsageExample(options);
document.body.appendChild(App.stage.getCanvas());
```