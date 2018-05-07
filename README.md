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
The render tree defines what is being rendered on the screen. It consists out of a tree containing `View` instances. The `View` has the same goal as `HTMLElement` has for HTML.

### Layout Positioning
All views are positioned absolutely, relative to the parent view. The framework was designed for fixed width/height viewports, but if you need more complex positioning such as floating or relative widths/heights, have a look at the calculation cycle hooks `onUpdate`, and `onAfterUpdate`.

A view has dimensions, gettable by the renderWidth and renderHeight properties. They can be set by specifying the w, h properties. If w, h are not set, the renderWidth corresponds to the (displayed) texture width. By default, both w and h are 0. The view dimensions are used for both positioning (mount, pivot) as well as for rendering the texture. 

The `mount` specifies the point within the view dimensions that is specified by the x, y coordinates. Mount 0 corresponds the upper-left corner, 1 to the bottom-right corner. `mountX` and `mountY` can also be set separately, so (1,0) corresponds to the upper-right corner and (0,1) to the bottom-right corner.

The `pivot` (pivot,pivotX,pivotY) specifies the point within the view dimensions that is the origin for `rotation` and `scale` transformations.

### View properties
Below is a complete list of the properties that are available for any view.
TODO

### View structure
Some basic characteristics of a view:
* A view has many properties dealing with positioning and rendering
* A view may have a texture (that is rendered) or not
* A view may have 0, 1 or more child views
* The render tree has a single root view
* The View class may be subclassed to add additional functionality (`BorderView`, `FastBlurView`, `SmoothScaleView`)

### Textures

### Advanced features

#### RenderToTexture
#### Shaders

#### Filters

### Performance considerations
This chapter describes how the framework tries to improve performance of your application, and what you can do to best utilize these optimizations. 

#### Render cycle
During every requestAnimationFrame call, ideally at 60fps, the render tree is checked for changes, and those changes are rendered to the screen:
* Newly used textures are loaded (images, text, etc)
* Check the render tree for updates and recalculate the updated branches
* Gather the textures of the views, together with the calculated coordinates
* Render everything to screen using WebGL calls

#### Basic optimizations
Many optimizations have been performed to minimize the work, power consumption and improve performance.
There are some basic optimizations that you should be aware of:
* If no updates at all were done to a certain part of the render tree since the last frame, it can be completely skipped. 
* Invisible parts of the render tree are not calculated or rendered at all until they become visible again. 
* If no changes have been performed to the full render tree since the last frame (static output), no rendering is performed at all.
* When renderToTexture is turned on, that branch is cached: if nothing has been changed, the previous renderToTexture result is reused.

#### Calculation loop
Before understanding the optimization below, note that a view can be in several modes:
Mode | Description
---|---
**Attached** | True iff the view is attached of the render tree
**Enabled** | True iff attached *and* visible *and* alpha > 0
**Active** | True iff enabled *and* withinBounds
**WithinBounds** | True iff the (x,y,x+renderWidth,y+renderHeight) area is within visible bounds (on screen)

During the calculations loop, when a view is found to be *out of bounds* (not withinBounds), and it can be assumed that no other descendant view can possibly be within bounds, the complete branch can be skipped (both for calculations and for rendering), improving performance. This can have a big effect when there are a lot of enabled views in the render tree (such as in an EPG or a side scroller game). The framework is able to optimize it when any of the following properties is enabled:
* `renderToTexture`
* `clipping`
* `clipbox`

Clipbox tells the framework that no descendant of this view will extend the view dimensions, without actually clipping it (which, in itself, costs performance). *This is the cheapest way to improve performance. You should use it when a view contains a lot of non-protruding descendands and can go out of bounds.*

#### Rendering
Views that have a texture will only be rendered when they are both **active** *and* **within bounds**.

#### Texture loading
When a view has an associated texture, that texture will not be loaded until the view is **active** *and* **within bounds**. 

Settings `boundsMargin` property allows a certain additional margin (can be specified separately for all directions) to be set for a branch of the render tree. This may force additional textures to be loaded (those within the bounds margin) before they enter the screen when scrolling. It does **not** force them to be rendered though.

One thing to watch out for is that it the framework does normally not know in advance what the dimensions of a texture are. Sometimes these dimensions do affect when the view is within bounds. For example, when it is positioned somewhere on the left side of the viewport, it could be either withinBounds (if the texture is wide) or not (if the texture is narrow). Therefor the framework assumes, if all else is not known, a maximum 2048x2048 texture size. In some cases, especially when having a lot of stuff on the left or top side of the screen or when using an alternative mount position, this may cause textures to be loaded unnecessarily. There are two ways to fix this:
* when known, specify the `w`, `h` properties on the view in advance
* in the texture object, set `mw`, `mh` properties to specify a max size other than 2048x2048 to be used as a fallback for determining the 'with bounds' mode.

#### Batching drawElements calls
Every frame the framework converts the complete render tree into a series of WebGL commands that are pushed to the video card. A video card likes to receive things in a 'batched' form: a single drawElements call that draws many *quads* (2 polygons) in a single command has much better performance than one individual drawElements call per quad. The difference is not so noticable when you only have a couple of things to draw, but when you need to draw a lot of quads (100+) the difference can be huge for both CPU and GPU (up to more than 10x). Of course the framework tries to batch calls where it can, but certain things may force it to separate the calls, such as:
* using a different texture source (different textures referencing the same source can be batched)
* switching to another clipping area
* generating a new texture when using renderToTexture (when the previous one is cached it can be batched)
* using another shader program

In practice, the first one (different texture sources) is by far the most likely to cause many batch breaks. You should understand that the render order of the views/texturizes is fully determined by the position in the render tree (top-down first-last) and the z-index, if specified. As an example: you may be able to create a draw batch by z-indexing all views that share the same texture (good candidates are those that have `rect` enabled). You may want to use the forceZIndexContext on an ancestor to make sure that the batch doesn't interfere with other parts of the render tree. 

## Code composition
An application can be composed into components. A component extends the `wuf.Component` class, which itself extends the `wuf.View` class. In fact, `wuf.Application` extends `wuf.Component`, so it *is* the render tree root. Composition is achieved by simply including them as Views somewhere in the render tree.

Example:
