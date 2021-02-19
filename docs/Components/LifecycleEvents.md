# Lifecycle Events


You can add logic to your App by implementing *lifecycle events*. These events are methods that are called when certain preset conditions (properties) apply.


The following table contains an overview of the available lifecycle events.

| Name | Description |
|---|---|
| `_construct()` | Instance created, before spawning the template |
| `_build()` | Instance created, spawned the template |
| `_setup()` | Attached to the Render Tree, top-down (for the first time) |
| `_init()` | Attached (for the first time) |
| `_attach()` | Attached to the Render Tree, bottom-up |
| `_detach()` | Detached, bottom-up |
| `_firstEnable()` | Enabled (for the first time) |
| `_enable()` | Enabled (both attached and visible: *true* and *alpha > 0*) |
| `_disable()` | Disabled (either detached or invisible or both) |
| `_firstActive()` | Activated (for the first time) |
| `_active()` | Activated (both enabled and on-screen) |
| `_inactive()` | Inactive (either detached, invisible or off-screen) |



For example, you can construct the lifecycle event `_construct()` to initialize game settings:


```
_construct(){
    // current player tile index
        this._index = 0;
            // computer score
                this._aiScore = 0;
                // player score
                this._playerScore = 0;\
}
```