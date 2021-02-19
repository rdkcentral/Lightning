# Transitions


A transition is a *gradual* change of a property value. Transitions are able to accept *dynamic* values, as opposed to [animations](../Animations/index.md), which use *fixed* values.

## Defining a Transition


You define a transition within the template:


```
static _template() {
    return {
        MyTarget:{ transitions: {x: {duration: 2, timingFunction: 'ease'},
          color: {duration: 1} }}
    }
}
```

## Starting a Transition


You can start a transition from within a patch:


```
this.tag('MyObject').patch({ smooth:{ x: 10, color: 0xFFFF0000 }});
```


or using the `setSmooth` function:


```
this.tag('MyObject').setSmooth('x', 10);
```


If required, you can also modify the transition settings as follows:


```
this.tag('MyObject').setSmooth('x', 10, {duration: 1});
```


or from within a patch:


```
this.tag('MyObject').patch({ smooth:{ x: [10, 
   {duration: 4, delay: 4, timingFunction: 'linear' }
 ]}});
```

> A property name that contains the string `color` (case insensitive), has values that are interpolated as ARGB values. This means,
that you can specify a color animation as follows:
`{p: 'color', v: {0: 0xFFFF0000, 1: 0xFF0000FF}}`.

## Removing a Transition


You can remove a transition by setting 'undefined' (using `null`):


```
this.tag('MyObject').patch({ transitions:{ x: null }});
```


or using the `setSmooth` function:


```
this.tag('MyObject').setSmooth('x', undefined);
```

## Transition Target Value


A transition changes the property itself. If you set a value to the same property while a transition is
running, the value is immediately *overwritten* by the transition before the next frame is drawn. Also, getting the
property value returns the *current* property value instead of the property transition target value.


You can get the transition target value as follows:


```
const targetX = this.tag('MyObject').getSmooth('x');
```

## Fast Forward


You can fast-forward the transition to the target value as follows:


```
this.tag('MyObject').fastForward('x');
```

## Live Demo


In this demo, we let *LilLightning* compete with itself by using *three* different ways of transitioning.
Press **right** to start the transitions, or **left** to reset.


```
class BasicUsageExample extends lng.Application {
    static _template() {
        return {
            FinishLine:{ w: 5, h: 300, colorTop: 0xFFABABAB, colorBottom: 0xFFFFFFFF, rect: true, x: 500, y: 200 },
            LilLightningA:{ x: 50, y: 100, src: '/Lightning/img/LngDocs_LilLightningRun.png'},
            LilLightningB:{ x: 50, y: 200, src: '/Lightning/img/LngDocs_LilLightningRun.png'},
            LilLightningC:{ x: 50, y: 300, src: '/Lightning/img/LngDocs_LilLightningRun.png'}
        }
    }
    
    _handleLeft(){
        this.resetTransitions();
    }
    
    _handleRight(){
        this.startTransitions();
    }
        
    startTransitions(){
        //Face candidates to the right
        this.setCandidatesDirection('right');
        
        //Start transitions
        this.tag('LilLightningA').setSmooth('x', 500);
        this.tag('LilLightningB').setSmooth('x', 500, {duration: 2});
        this.tag('LilLightningC').patch({ smooth:{ x: [500, { duration: 2.5, delay: 1, timingFunction: 'ease-out' } ]}});
    }
    
    resetTransitions(){
        //Face candidates to the left
        this.setCandidatesDirection('left');
        
        //Start transitions
        this.tag('LilLightningA').patch({ smooth:{ x: [50, { duration: 0.5, delay: 0.2, timingFunction: 'ease-in' } ]}});
        this.tag('LilLightningB').patch({ smooth:{ x: [50, { duration: 0.5, delay: 0.4, timingFunction: 'ease-in' } ]}});
        this.tag('LilLightningC').patch({ smooth:{ x: [50, { duration: 0.5, delay: 0.6, timingFunction: 'ease-in' } ]}});
    }
    
    setCandidatesDirection(direction){
        let dir = (direction === 'left')?-1:1;
        this.tag('LilLightningA').scaleX = dir;
        this.tag('LilLightningB').scaleX = dir;
        this.tag('LilLightningC').scaleX = dir;
    }
       
}

const options = {stage: {w: window.innerWidth, h: window.innerHeight, useImageWorker: false}};
const App = new BasicUsageExample(options);
document.body.appendChild(App.stage.getCanvas());
```