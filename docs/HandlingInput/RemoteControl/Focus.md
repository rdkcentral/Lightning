# Focus


To handle key events, Lightning needs to know which component is the *active* component. This component and its descendants (including the App itself) are called the *focus path*.


The focus path is determined by calling the `_getFocused()` method of the App object.

## Using the `getFocused()` Method


By default, or if the `_getFocused()` method returns 'undefined', the focus path stops here and the App is the active component (and the focus path only contains the App itself).


However, if `_getFocused()` returns a child component, that child component is also added to the focus path and the associated `_getFocused()` method is also invoked. To put it another way: the components may *delegate* focus to their descendants (see [below](#delegating-focus)).

> This process is repeated *recursively* until the active component is found.


The focus path is only *recalculated* at the following specific events:

* A component's state is changed.
* A key is pressed.
* The `_refocus()` has been called on any component.

## Delegating Focus


A common way to delegate focus is to use [states](../Components/CompStates/index.md), which overrides the `_getFocused()` method within each state class:


```
static _states() {
    return [
        class Buttons extends this {
            _getFocused() {
                return this.tag('Buttons')
            }
        },
        class List extends this {
            _getFocused() {
                return this.tag('List')
            }
        }
    ]
}
```


If the name of a `state` is based on your components, you can also use a *generic* method to control it:


```
_getFocused() {
    return this.tag(this.state)
}
```


For components that are generated dynamically (like a `list` with items served by an API), it is recommended that you create an `index` variable to delegate your focus. After that, you can bind some keys for the user to change the focus to a different component:


```
_init() {
    this.index = 0
}

_handleLeft() {
    if(this.index > 0) {
        this.index--;
    }
}

_handleRight() {
    if(this.index < this.children.length - 1) {
        this.index++;
    }
}

reset() {
    this.index = 0;
    this._refocus(); // We need to force focus recalc.
}

_getFocused() {
    return this.children[this.index]
}
```

## Using the `focus()` and `unfocus()` Methods


Lightning fires `_focus()` and `_unfocus()` events on [components](../Components/index.md) when the focus changes. These methods can be used to change the appearance or state of the component:


```
_focus() {
    //add code to do something when your component receives focus
}

_unfocus() {
    //add code to do something when your component loses focus
}
```

## Live Demo


```
class FocusDemo extends lng.Application {
    static _template() {
        return {
            x: 20, y: 20,
            Buttons: {
                LeftButton: { type: ExampleButton, buttonText: 'Left' },
                RightButton: { x: 200, type: ExampleButton, buttonText: 'Right' }
            },
            List: { y: 100, type: ExampleList }
        }
    }
    _init() {
        this.buttonIndex = 0
        this.tag('List').items = [1,2,3,4].map((i) => ({label: i }))
        this._setState('Buttons')
    }
    _handleUp() {
        this._setState('Buttons')
    }
    _handleDown() {
        this._setState('List')
    }
    static _states() {
        return [
            class Buttons extends this {
                _handleLeft() {
                    this.buttonIndex = 0
                }
                _handleRight() {
                    this.buttonIndex = 1
                }
                _getFocused() {
                    return this.tag('Buttons').children[this.buttonIndex]
                }
            },
            class List extends this {
                _getFocused() {
                    return this.tag('List')
                }
            }
        ]
    }
}

class ExampleButton extends lng.component {
    static _template() {
        return {
            color: 0xff1f1f1f,
            texture: lng.Tools.getRoundRect(150, 40, 4),
            Label: {
                x: 75, y: 22, mount: .5, color: 0xffffffff, text: { fontSize: 20 }
            }
        }
    }
    _init() {
        this.tag('Label').patch({ text: { text: this.buttonText }})
    }
    _focus() {
        this.color = 0xffffffff
        this.tag('Label').color = 0xff1f1f1f
    }
    _unfocus() {
        this.color = 0xff1f1f1f
        this.tag('Label').color = 0xffffffff
    }
}

class ExampleList extends lng.component {
    static _template() {
        return {}
    }
    _init() {
        this.index = 0
    }
    set items(items) {
        this.children = items.map((item, index) => {
            return {
                ref: 'ListItem-' + index, //optional, for debug purposes
                type: ExampleListItem,
                x: index * 70, //item width + 20px margin
                item //passing the item as an attribute
            }
        })
    }
    _getFocused() {
        return this.children[this.index]
    }
    _handleLeft() {
        if(this.index > 0) {
            this.index--
        }
    }
    _handleRight() {
        // we don't know exactly how many items the list can have
        // so we test it based on this component's child list
        if(this.index < this.children.length - 1) {
            this.index++
        }
    }
}

class ExampleListItem extends lng.component {
    static _template() {
        return {
            rect: true, w: 50, h: 50, color: 0xffff00ff, alpha: 0.8,
            Label: {
                x: 25, y: 30, mount: .5
            }
        }
    }
    _init() {
        this.patch({ Label: { text: { text: this.item.label }}})
    }
    _focus() {
        this.patch({ smooth: { alpha: 1, scale: 1.2 }})
    }
    _unfocus() {
        this.patch({ smooth: { alpha: 0.8, scale: 1 }})
    }
}

const App = new FocusDemo({stage: {w: window.innerWidth, h: window.innerHeight, useImageWorker: false}});
document.body.appendChild(App.stage.getCanvas());
```