# Mouse Input

If you have a device that allows a Mouse or Pointer device, Lightning can listen for Mouse events in the browser and translate them to the canvas element.

To enable Mouse input, set `enablePointer: true` in your application options.

In your component you can add the following methods to handle Hover, UnHover, and click events.

```
_handleClick() {
}

_handleHover() {
}

_handleUnhover() {
}
```

For a full example - https://github.com/rdkcentral/Lightning/tree/master/examples/mouse-pointer
