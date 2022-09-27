# Patching


Patching is a way to change the properties of existing elements in a template.


You can use the Element method


```
patch(object : Object, createMode : Boolean)
```


to patch part of the Render Tree.

> A `patch` object has the same structure as the associated template.


Patching allows you to set multiple properties for multiple views in a *single* statement. For example:


```
this.patch({
    Parent: {
        x: 150, alpha: 0.5,
        Child: {
            x: 100, y: 100
        }
    }
});
```


You can also call a patch *directly* on a sub element:


```
this.tag("Parent").patch({
    x: 150, alpha: 0.5,
    Child: {
        x: 100, y: 100
    }
});
```

## Adding New Elements


By default, only properties of *existing* elements can be changed with patching.


If an element reference is *unknown*, an error is generated. This is done to protect you from accidentally using the wrong references and creating new unnecessary elements.

> If you want to enable the creation of new elements in your patch, pass 'true' for the value of the `createMode` argument.

## Removing Elements


You can remove an element by specifying 'undefined' instead of the settings object:


```
this.tag("Parent").patch({
    x: 150, alpha: 0.5,
    Child: undefined
});
```

## Live Demo


See the example below of how to patch the x-position for an object. Use the **left** or **right** key to move the object to its new position.


```
class BasicUsageExample extends lng.Application {
    static _template() {
        return {
            LilLightning:{ x: 100, y: 100, src: '/Lightning/img/LngDocs_LilLightningIdle.png' }
        }
    }
    
    _handleLeft(){
        this.tag('LilLightning').patch({ x: 100 });
    }
     
    _handleRight(){
        this.tag('LilLightning').patch({ x: 400 });
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
