# Mouse Input

If you have a device that allows a Mouse or Pointer device, Lightning can listen for Mouse events in the browser and translate them to the canvas element.

To enable Mouse input, set `enablePointer: true` in your application options.

In your component, you can add the following methods to handle Hover, UnHover, and click events. All methods will have the target element available as the first parameter to the function. 

```
_handleClick(target, localCoords) {
}

_handleHover(target) {
}

_handleUnhover(target) {
}
```

## _handleClick(target, localCoordinates)

The `_handleClick()` method is a handler function that can be used in your application to respond to user click events on a specific element (target). It plays a crucial role in capturing and processing user interactions efficiently.

### Parameters 

`target` (Lightning Component): This parameter represents the element on which the user has clicked. It is an instance of the HTMLElement class and provides access to various properties and methods related to the clicked element.

`localCoordinates` (Object): This parameter is an object representing the local coordinates of the exact position where the user has clicked inside the target element. It provides essential information to understand the precise location of the click relative to the target element's coordinate system.

The localCoordinates object typically has the following properties:

`x` (number): The X-coordinate of the click position inside the target element.
`y` (number): The Y-coordinate of the click position inside the target element.

## Event bubbling

Event bubbling is a crucial aspect of handling events in JavaScript. When an event is triggered on a specific element, it can also affect its parent elements in the WebGL Render Tree. By returning `false` explicitly from the event handler, you can control the event's propagation and enable a parent component to capture the event.

In the context of the `_handleClick()` method, if you return false explicitly at the end of the function, the click event will bubble up to the parent components after executing the necessary logic inside the `_handleClick()` method. This allows parent components to be aware of the click event and perform additional actions based on it.

For a full example - https://github.com/rdkcentral/Lightning/tree/master/examples/mouse-pointer
