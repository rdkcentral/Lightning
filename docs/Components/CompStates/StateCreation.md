# State Creation


You define component states by populating the `_state` definition with *states*, which are class objects.


For example:


```
static _states() {
    return [
        class MyFirstState extends this {
                              
        }
    ]
}
```


States can overwrite the default component behavior, as shown in the following example:


```
_handleEnter(){
    // I am triggered when you press Enter
}

static _states() {
    return [
        class MyFirstState extends this {
            _handleEnter() {
                // Overwrites root function when we are on this state
            }
        }
    ]
}
```