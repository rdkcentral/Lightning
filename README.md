# WPE UI Framework

[![npm version](https://badge.fury.io/js/wpe-uiframework.svg)](https://badge.fury.io/js/wpe-uiframework)
[![npm](https://img.shields.io/npm/dt/wpe-uiframework.svg)]()
[![Donate](https://img.shields.io/badge/Donate-PayPal-green.svg)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=55UJZHTXW8VTE)

The WPE UI Framework (WUF) enables you to build WebGL-rendered UIs, apps and games. It contains a feature-rich and highly optimized 2D render tree, a flexible animation/transition toolkit and a framework to compose your UI in a handy way. Some characteristics of the framework:

**High performance**

A highly optimized update loop for coordinate calculations. You will be able to get much better performance than when using HTML5. It has been carefully tested for memory leaks.

**WebGL features**

Specify your own vertex and fragment shaders on a branch of the render tree, to create cool pixel/lighting/3d/displacement/etc effects.

**Concise syntax**

We use javascript object notation to set and 'patch' multiple properties at once, improving readability and reducing the amount of LOCs.

**Browser and NodeJS support**

The framework comes with modern browser support (requires WebGL and ES6) and NodeJS support (WebGL is proxied to a OpenGL ES2 context).

## Installation

### Browser
You can download the latest version of wuf.js from the repository here: https://github.com/WebPlatformForEmbedded/WPEUIFramework (dist/wuf.js).

### Node.js
For Node.js, this module depends on node-canvas for image loading and text creation, and node-wpe-webgl for providing a WebGL interface to the native hardware. Install the dependencies and follow the installation instructions of node-canvas (https://github.com/Automattic/node-canvas) and node-wpe-webgl (https://github.com/WebPlatformForEmbedded/node-wpe-webgl).

## Basic usage

### Browser
`index.html` contents:

```javascript
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <script src="wuf.js"></script>
</head>
<body>
    <script>
        window.onload = function() {
            class YourApp extends wuf.Application {
                  static _template() {
			return {texture: {type: wuf.textures.TextTexture, text: “hello world”}}
                }
            }

            const options = {stage: {w: 900, h: 900, glClearColor: 0xFF000000}}
            const app = new YourApp(options);
            document.body.appendChild(app.stage.getCanvas());
        }
    </script>
</body>
</html>
```

### NodeJS
`start.js` contents:
```javascript
const Application = require('wpe-uiframework').Application

class YourApp extends Application {
    static _template() {
        return {texture: {type: wuf.textures.TextTexture, text: “hello world”}}
    }
}

const options = {stage: {w: 900, h: 900, glClearColor: 0xFF000000}}
options.stage.window = {title: "Border example", fullscreen: false};

const app = new YourApp(options);
```

Our test application `YourApp` should simply extend the `wuf.Application` class. The full framework is bootstrapped by simply creating a new instance of your app. It is possible to run multiple apps in the same browser tab. You can pass several options to an app. In this case, we specify the canvas width and height, and a background color in ARGB format (the `glClearColor`). Check the API for a list of all [initialisation options](#initialisation-options).

`YourApp` has a template that allows you to define the layout of your application. In this case, it consists of a single *view* (a wuf render tree element) that contains a text.

## Render Tree
The render tree defines what is being rendered on the screen. It consists out of a tree containing `View` instances. The `View` has the same goal as `HTMLElement`, but then for WUF. Some basic characteristics of a view:
* A view has many properties dealing with positioning and rendering
* A view may have a texture (that is rendered) or not
* A view may have 0, 1 or more child views
* The render tree has a single root view
* The View class may be subclassed to add additional functionality (`BorderView`, `FastBlurView`, `SmoothScaleView`)

### Render cycle
During every requestAnimationFrame call, ideally at 60fps, the render tree is checked for changes, and those changes are rendered to the screen:
* Newly used textures are loaded (images, text, etc)
* Check the render tree for updates and recalculate only the updated branches
* Gather the textures of the views, together with the calculated coordinates
* Render everything to screen

### View properties
Below is a complete list of the properties that are available for any view.

### View positioning

### Advanced render tree

## Performance considerations
Many optimizations have been performed to minimize the work, power consumption and improve performance. Most importantly, if no updates at all were done to a certain part of the render tree since the last frame, it can be completely skipped. Also, invisible parts of the render tree are not recalculated until they become visible again. And last but not least: if no changes have been performed since the last frame (static output), the last frame is reused and no rendering is performed at all.

### View modes
Before understanding the optimization below, note that a view can be in several modes:
Mode | Description
---|---
Attached | True iff the view is attached of the render tree
Enabled | True iff attached *and* visible *and* alpha > 0
Active | True iff enabled *and* withinBounds
WithinBounds | True iff the (x,y,x+renderWidth,y+renderHeight) area is within visible bounds (on screen)

### Calculation loop
During the calculations loop, when a view is found to be *out of bounds* (not withinBounds), and it can be assumed that no other descendant view can possibly be within bounds, the complete branch can be skipped (both for calculations and for rendering), improving performance. This can have a big effect when there are a lot of enabled views in the render tree (such as in an EPG or a side scroller game). The framework is able to optimize it when any of the following properties is enabled:
* `renderToTexture`
* `clipping`
* `clipbox`

Clipbox tells the framework that no descendant of this view will extend the view dimensions, without actually clipping it (which, in itself, costs performance).

### Rendering
Views that have a texture will only be rendered when they are both **active** *and* **within bounds**. 

### Texture loading
When a view has an associated texture, that texture will not be loaded until the view is **active** *and* **within bounds**. 

Settings `boundsMargin` property allows a certain additional margin (can be specified separately for all directions) to be set for a branch of the render tree. This may force additional textures to be loaded (those within the bounds margin) before they enter the screen when scrolling. It does **not** force them to be rendered though.

One thing to watch out for is that it the framework does normally not know in advance what the dimensions of a texture are. Sometimes these dimensions do affect when the view is within bounds. For example, when it is positioned somewhere on the left side of the viewport, it could be either withinBounds (if the texture is wide) or not (if the texture is narrow). Therefor the framework assumes, if all else is not known, a maximum 2048x2048 texture size. In some cases, especially when having a lot of stuff on the left or top side of the screen or when using an alternative mount position, this may cause textures to be loaded unnecessarily. There are two ways to fix this:
* when known, specify the w,h properties on the view in advance
* in the texture object, set mw, mh properties to specify a max size other than 2048x2048 to be used as a fallback for determining the 'with bounds' mode.

## Code composition
An application can be composed into components. A component extends the `wuf.Component` class, which itself extends the `wuf.View` class. In fact, `wuf.Application` extends `wuf.Component`, so it *is* the render tree root. Composition is achieved by simply including them as Views somewhere in the render tree.

Example:
