# WPE UI Framework

UI Framework is a javascript 2d graphics rendering and animation library using (Web)GL. It's geared towards developing animated User Interfaces that run nicely on low-performance (embedded) devices. The framework has been optimized for high performance and low CPU/memory usage, and has been carefully tested for memory leaks.

The framework offers a **rendering tree** that can be modified using a very *simple* and *usable* API. The rendering tree consists of **components** that have several properties (x, y, rotation, alpha, etc). An image or rendered text can be attached to a component, which is then rendered immediately on the screens. It is a bit like the HTML DOM tree but has a simplified set of features, renders much faster and is easier to manage in a dynamical way.

UI Framework runs in a any modern web browser using **WebGL** and in **Node.js** (version 4 or higher). For Node.js, this module depends on node-canvas for text creation, and node-wpe-webgl for providing a WebGL interface to the native hardware. Out of the box, supported targets include (desktop) Linux, OSX, Windows and the Raspberry PI!

# Installation instructions

## Browser
Include the script dist/wpe.js or dist/wpe.min.js.
These files can be re-generated from source using the command:

    grunt wpe-browser

## Node.js:
Install the dependencies and follow the installation instructions of node-canvas (https://github.com/Automattic/node-canvas) and node-wpe-webgl (https://github.com/WebPlatformForEmbedded/node-wpe-webgl).

# Basic usage

This section describes how to initialize and use the framework step-by-step.

## Initialisation

For a web browser:

```javascript
var options = {w: 600, h: 600, glClearColor: 0xFF000000};
var stage = new Stage(options);

document.body.appendChild(stage.getCanvas());
```

This initializes a new stage. The stage creates a canvas of the specified width and height for drawing, and uses the specified background color (in ARGB hexadecimal format). You should then get it using stage.getCanvas() add it to the DOM tree. You can also supply your own canvas object ny using the reuseCanvas option

For Node.js:

```javascript
var Stage = require('../../wpe');

var options = {w: 600, h: 600, glClearColor: 0xFF000000, window: {title: "Example", fullscreen: false}};
var stage = new Stage(options);
```

This is similar as for the web browser, but node-wpe-webgl is used as OpenGL rendering target. This module allows some options for initialization that can be set in the window property. See https://github.com/WebPlatformForEmbedded/node-wpe-webgl#options.

Check the API for a list of all [initialisation options](#initialisation-options).

## Rendering tree

The `stage.root` property is the root of the rendering tree. It is an object of type `Component`, to which you can add other new components to it to define what should be rendered within the stage. The tree consists **only** out of objects of the Component type. Components are monolithical objects: they can be images, rectangles, texts or just containers, based on how the properties are set (mostly for performance reasons).

Example:

```javascript
// Determine base path to be used for images.
var isNode = !!(((typeof module !== "undefined") && module.exports));
var basePath = (isNode ? __dirname + '/' : './');

stage.root.add([
    {tag: 'bg', rect: true, x: 20, y: 20, w: 560, h: 560, colorTop: 0xFFFF0000, colorBottom: 0xFFFF6666, children: [
        {tag: 'hello', text: {text: "hello world", fontSize: 100}, x: 280, y: 170, mountX: 0.5, mountY: 0.5, alpha: 0.5},
        {tag: 'bunnies', x: 30, y: 30, w: 500, h: 500, clipping: true, borderWidth: 10, borderColor: 0xFF000000, children: [
            {src: basePath + 'bunny.png', x: 20, y: 400, scale: 8, rotation: 0.3},
            {src: basePath + 'bunny.png', x: 480, y: 400, scale: 8, rotation: -0.3}
        ]}
    ]}
]);
```
https://jsfiddle.net/basvanmeurs/4qy5j7am/

## Stopping
When you want to gracefully stop your Node.js application (or want to completely remove the stage from your webpage), you *must* call `stage.destroy()`. This will make sure that all resources are freed, and will stop the render loop, allowing Node.js to quit.

# API

## Stage

### <a name="initialisation-options"></a>Initialisation options
Usage: `new Stage({w: 600, h: 600, ...})`.

| Name            |Default value| Description                                                                                          |
| --------------- |-------------|------------------------------------------------------------------------------------------------------|
| w               |         1280| stage width in px                                                                                    |
| h               |          720| stage height in px                                                                                   |
| reuseCanvas     |         null| canvas object to use instead of creating a new one (web only)                                        |
| rw              |         1280| the px which corresponds the right edge of the stage                                                 |
| rh              |          720| the px which corresponds the bottom edge of the stage                                                |
| textureMemory   |         12e6| the amount of squared pixels that may be stored in GPU memory for texture storage / caching          |
| glClearColor    |   0xFF000000| the background color (ARGB)                                                                          |
| <a name="initialisation-options-default-font-face"></a>defaultFontFace |        Arial| the font face to use for rendering if none is explicitly specified                                   |
| fixedDt         |            0| if specified, the ms to progress in each is fixed instead of dynamic                                 |
| window          |             | node-wpe-webgl specific options, see https://github.com/WebPlatformForEmbedded/node-wpe-webgl#options |

### Methods
Todo.

### Events
Todo.

## Component

### Properties

| Name                              |Default value| Description |
| --------------------------------- |-------------|-------------|
| x, y                              |            0| Relative offset to the parent component in px |
| w, h                              |            0| Width/height of the component in px (if applicable) |
| scale(X,Y)                        |            1| Scales this component (and all descendants), relative to the pivot position |
| rotation                          |            0| Rotation around the pivot point in radians |
| pivot(X,Y)                        |          0.5| Specifies the pivot point for scale and rotation (0 = left/top, 1 = bottom/right) |
| mount(X,Y)                        |            0| Specifies the alignment for the x, y offset (0 = left/top, 1 = bottom/right) |
| alpha                             |            1| Opacity of this component (and all descendants) |
| borderWidth(Top,Left,Right,Bottom)|            1| Border width |
| borderColor(Top,Left,Right,Bottom)|   0xFFFFFFFF| Border color (ARGB integer) |
| color(Top,Bottom)(Left,Right)     |   0xFFFFFFFF| Color/tinting/gradients of the drawn texture |
| visible                           |         true| Toggles visibility for this component (and all descendants) |
| zIndex                            |            0| Specifies drawing order (just as in HTML) |
| forceZIndexContext                |        false| Creates a z-index stacking context without changing the drawing order of this component itself |
| clipping                          |        false| Do not draw descendant component parts that are outside of this component (overflow:hidden) |
| rect                              |        false| When set to true, this component becomes a colored rectangle |
| src                               |         null| When set, this component will render the image; URL (Node.js / web) or file (Node.js) |
| text                              |         null| When set, this component will render the text as specified (an object with the options specified below) |
| texture                           |         null| When set, this component will render the custom texture (see Stage.getTexture(..)). By specifying a plain object with x,y,w,h properties you can affect the clipping |

#### Text object properties
| Name                              |Default value| Description |
| --------------------------------- |-------------|-------------|
| text                              |           ""| the text to be shown |
| fontSize                          |           40| text font size |
| fontFace                          |      "Arial"| the font face (as used in CSS); may be an array to use (multiple) fallbacks. If nothing is specified, the [defaultFontFace](#initialisation-options-default-font-face) |

### Methods
Todo.
