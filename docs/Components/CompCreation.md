# Component Creation


You create a *new* component (e.g., MyComponent) as follows:


```
class MyComponent extends lng.component {
    static _template() {
        return {
            //component template
        }
    }

    _init() {
        // Fires when a component is instantiated.
    }
  
    //... more code, methods, events... 
    // active, attach, detach etc........
}
```


You create an *instance* of the component by adding the `type` attribute to the template:


```
class MyApp extends lng.Application {
    static _template() {
        return {
            MyComponentInstance: {
                type: MyComponent
            }
        }
    }
}
```


You can pass additional *parameters* (e.g., someData) to your component.


```
MyComponentInstance: {
    type: MyComponent,
    someData,
}
```


They become accessible when the component instance is initialized:


```
_init() {
    console.log(this.someData) //logs the content of someData
}
```