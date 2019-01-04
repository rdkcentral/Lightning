# Lightning

[![npm version](https://badge.fury.io/js/wpe-uiframework.svg)](https://badge.fury.io/js/wpe-uiframework)
[![Donate](https://img.shields.io/badge/Donate-PayPal-green.svg)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=55UJZHTXW8VTE)

Lightning (WPE UI Framework) enables you to build WebGL-rendered UIs, apps and games. It contains a feature-rich and highly optimized 2D **render tree**, a flexible **animation/transition toolkit** and a framework to compose your UI based on **UML state charts** defined in-code.

## Features

**High performance**

The framework is highly optimized, both in terms of CPU and GPU performance.

**WebGL effects**

Create cool pixel/lighting/3d/displacement/etc effects with our set of shaders, or implement your own custom shaders.

**Memory Management**

No memory leaks. Smart GPU memory management.

## Installation

### Browser
You can download the latest version of lightning-web.js from the repository here: https://github.com/WebPlatformForEmbedded/Lightning (dist/lightning-web.js).

### Node.js
For Node.js, this module depends on node-canvas for image loading and text creation, and node-wpe-webgl for providing a WebGL interface to the native hardware. Install the dependencies and follow the installation instructions of node-canvas (https://github.com/Automattic/node-canvas) and node-wpe-webgl (https://github.com/WebPlatformForEmbedded/node-wpe-webgl).

The module uses ESM module imports, but provides a rollup export. When require-ing this module, the rollup is included. To use the ESM mechanism, use `import lng from 'wpe-lightning/src/lightning-node'`.

## Basic usage

### Browser
`index.html` contents:

```javascript
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <script src="dist/lightning-web.js"></script>
</head>
<body>
    <script>
        window.onload = function() {
            class YourApp extends lng.Application {
                  static _template() {
			return {texture: {type: lng.textures.TextTexture, text: “hello world”}}
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

{PROVIDE EXAMPLE}

### NodeJS
`start.js` contents:
```javascript
const lng = require('wpe-lightning')

class YourApp extends lng.Application {
    static _template() {
        return {texture: {type: lng.textures.TextTexture, text: “hello world”}}
    }
}

const options = {stage: {w: 900, h: 900, glClearColor: 0xFF000000}}
options.stage.window = {title: "Border example", fullscreen: false};

const app = new YourApp(options);
```

Our test application `YourApp` extends the `lng.Application` class. The full framework is bootstrapped by simply creating a new instance of your app. It is possible to run multiple apps in the same browser tab. Every app has it's own WebGL canvas and rendering context.

You can pass several options to an app. In this case, we specify the canvas width and height, and a background color in ARGB format (the `clearColor`). Check the API for a list of all [initialisation options](#initialisation-options).

`YourApp` has a template that allows you to define the layout of your application. In this case, it consists of a single *view* (a render tree element) that contains a text.

## Render Tree
The render tree defines what is being rendered on the screen. It consists out of a tree containing exclusively `View` (+ subtypes) instances. You can add, remove and change the views in this render tree as you wish, and those changes will be reflected on the screen during the next frame. The `Stage` manages the render tree and is responsible for texture loading, performing coordinate calculations and performing the required WebGL calls.

### Drawing loop
On every requestAnimationFrame call, ideally at 60fps, the render tree is checked for changes, and those changes are rendered to the screen:
* Load on-screen textures (images, text, etc)
* Check the render tree for updates and recalculate the updated branches
* Gather the textures of the views, together with the calculated coordinates
* Render everything to screen using WebGL calls

### Layouting / Positioning
Lightning contains an advanced layout engine under the hood. It supports:
* Absolute positioning
* Relative positioning
* Flexbox

#### Absolute positioning
In Lightning, everything is positioned absolutely, just like `position:absolute` does for CSS. You define the xy-coordinates relative to the parent. Any scaling, rotation, etc. from the parent is applied to everything in the subtree.

A view can have a width and height associated with it. They can be set by specifying the `w`, `h` properties. If w, h are not set, the renderWidth corresponds to the (displayed) texture width. By default, both w and h are 0. The view dimensions are used for both positioning (mount, pivot) as well as for rendering the texture.

The `mount` specifies the point within the view dimensions that is specified by the `x`, `y` coordinates. Mount 0 corresponds the upper-left corner, 1 to the bottom-right corner. `mountX` and `mountY` can also be set separately, so (1,0) corresponds to the upper-right corner and (0,1) to the bottom-left corner.

The `pivot` (`pivotX`,`pivotY`), also with a value between 0 and 1, specifies the point within the view dimensions that is the origin for `rotation` and `scale` transformations.

#### Relative positioning
For the `x`, `y`, `w` and `h` properties can be set to a Function, that calculates it relative to the width or height of the parent view:
`{x: (w=>w*0.3), y: (h=>0.3*h), w: (w=>w*0.4), h: (h=>h*0.4), ...}`

This gives you the power to align items relative to the parent, purely based on the dimensions of the parent.

#### Flexbox
Lightning contains a layout engine based on the HTML Flexbox specification. If you are not familiar with it, MDN contains an [excellent introduction](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Flexible_Box_Layout/Basic_Concepts_of_Flexbox).

Flexbox can be turned on on a View by setting the flex property: `{flex: {}}`.
This turns all immediate children to flex items.

{PROVIDE EXAMPLE} 

Lightning flexbox behaves almost identical to CSS Flexbox, but without the quirks:
* When on a flex container, no width or height has been set (set to 0), it always takes the contents size (in contrast to CSS which differs per axis).
* That makes behavior of columns/rows symmetrical.
* We don't support the flex-basis property.
* In Lightning, a child of a flex container (a flex item) can be made to behave as an absolutely positioned item by setting `flexItem:false`.

A complete list of support flexbox properties.

FlexContainer
`alignItems`
    By default flex items that have width or height are set to 'flex-start' (flexItem.alignSelf can be set to overrule this behavior).

FlexItem
`shrink`
    By default flex items that are not flex containers are not shrunk (flexItem.shrink can be set to overrule this behavior).


{PROVIDE EXAMPLE}

### View properties
Many different propreties can be used to control the positioning, rendering and behavior of views. Some were just mentioned, but please check the API for a complete list of [view properties](#view-properties).

### Children
Views are part of the render tree, and may contain view 'children'. These can be accessed using the `childList` property.
TODO

### Accessing the view tree
{PROVIDE EXAMPLE}

### Textures
A view may or may not have a texture to be rendered.
TODO

### Shaders

### RenderToTexture

### Filters

### Memory management
We can distinguish between **CPU memory** and **GPU memory**.

#### CPU memory
We have tried to set up the framework in such a way that CPU memory memory leaks are avoided. When you remove a branch of views, it will be dereferenced by the framework (including the animation/transition system), so it's up to your own code to also stop referencing it and then it can be cleaned up.

If you are running into memory problems on embedded devices, you could reduce the cpu-to-gpu coordinate buffers (configuration parameter `bufferMemory`, defaults to 8M). Usually, 1M is already more than enough because that allows you to draw 15K quads per frame.

#### GPU memory
In terms of GPU memory: a certain amount of reserved GPU memory (in pixels) can pre-specified in the Application configuration parameter `textureMemory` (defaults to 18M pixels). All textures are uploaded to the GPU only when they are used, and there they take up space. Previously used textures will remain in the GPU memory until the reserved amount is full; then, the textures that are not required for rendering at that moment are all garbage collected from the GPU memory. When they appear on the screen again, they must be reloaded and uploaded to GPU memory again. 

If you are using `renderToTexture` or `filters`, the created textures are also cached, even when they are no longer used. This cache has a positive impact on the performance because it is expensive to recreate them, and often they can be reused. Again, a configuration parameter controls the reserved amount of pixels in memory: `renderTextureMemory` (defaults to 12M pixels).

Garbage collection for both caches can be forced using `Stage.gcTextureMemory()` and `Stage.gcRenderTextureMemory()`. This is handy on embedded devices where GPU memory is a limited resource, and another application may be brought up in front the UI.

### Performance
This chapter describes how the framework tries to improve performance of your application, and what you can do to best utilize these optimizations. 

#### Basic optimizations
Many optimizations have been performed to minimize the work, power consumption and improve performance, both for the CPU and GPU. The most important optimisations are:

* If no updates at all were done to a certain part of the render tree since the last frame, it can be completely skipped. 
* If no changes have been performed to the full render tree since the last frame (static output), no rendering is performed at all.
* When renderToTexture is turned on, that branch is cached: if nothing has been changed, the previous renderToTexture result is reused.
* Invisible parts of the render tree are not calculated or rendered at all until they become visible again. 
* Parts of the render tree that are out of the screen are not calculated or rendered.

To be able to perform these optimizations when possible, the framework keeps a couple of flags per view:

|Mode | Description|
|---|---|
|**Attached** | True iff the view is attached of the render tree|
|**Enabled** | True iff attached *and* visible *and* alpha > 0|
|**Active** | True iff enabled *and* withinBounds|
|**WithinBounds** | True iff the (x,y,x+renderWidth,y+renderHeight) area is within visible bounds (viewport and/or clipping area)|

#### Calculation loop
During the calculations loop, when a view is found to be **not** withinBounds (*out of bounds*), and it can be assumed that no other descendant view can possibly be within bounds, the complete branch can be skipped (both for calculations and for rendering), improving performance. This can have a big effect when there are a lot of enabled views in the render tree (such as in an EPG or a side scroller game). The framework is able to optimize it when any of the following properties is enabled:
* `renderToTexture`
* `clipping`
* `clipbox`

Clipbox tells the framework that no descendant of this view will extend the view dimensions, without actually clipping it (which, in itself, costs performance). *This is the cheapest way to improve performance. You should use it when a view contains a lot of non-protruding descendands and can go out of bounds.*

#### Rendering
Views that have a texture will only be rendered when they are both **active** *and* **withinBounds**.

#### Texture loading
When a view has an associated texture, that texture will not be loaded until the view is **active** *and* **withinBounds**. 

Often, you'd like textures (images etc) to be loaded before they enter a screen to avoid the 'pop in' effect. The `boundsMargin` view property allows a certain additional margin (can be specified separately for all sides) to be set for a branch of the render tree. This may force additional textures to be loaded (those within the bounds margin) before they enter the screen when scrolling. It does **not** force them to be rendered though. Setting a boundsMargin activates it for the full branch, and overrides the parent setting. By default, the root is set to a 100px margin on all sides (top, right, bottom, left).

One thing to watch out for is that it the framework usually doesn't know in advance what the dimensions of a texture will be until that texture is loaded. Sometimes these dimensions do affect when the view is considered to be `withinBounds`. For example, when it is positioned somewhere on the left side of the viewport, it could be either `withinBounds` (if the texture is wide) or not (if the texture is narrow). Therefor the framework assumes, if dimensions are unknown and unspecified, a maximum 2048x2048 texture size. In some cases, especially when having a lot of stuff on the left or top side of the screen or when using an alternative mount position, this may cause textures to be loaded unnecessarily. There are two ways to fix this:
* when known, specify the `w`, `h` properties on the view containing the texture in advance
* in the texture object, set `mw`, `mh` properties to specify a max size other than 2048x2048 to be used as a fallback

#### Batching drawElements calls
Every frame the framework converts the complete render tree into a series of WebGL commands that are pushed to the video card. A video card likes to receive things in a 'batched' form: a single drawElements call that draws many *quads* (2 polygons) in a single command has much better performance than one individual drawElements call per quad. The difference is not so noticable when you only have a couple of things to draw, but when you need to draw a lot of quads (100+) the difference can be huge for both CPU and GPU (up to more than 10x). Of course the framework tries to batch calls where it can, but certain things may force it to separate the calls, such as:
* using a different texture source (different textures referencing the same source can be batched)
* switching to another clipping area
* generating a new texture when using renderToTexture (when the previous one is cached it can be batched)
* using another shader program

In practice, the first one (different texture sources) is by far the most likely to cause many batch breaks. You should understand that the render order of the views/texturizes is fully determined by the position in the render tree (top-down first-last) and the z-index, if specified. As an example: you may be able to create a draw batch by z-indexing all views that share the same texture (good candidates are those that have `rect` enabled). You may want to use the forceZIndexContext on an ancestor to make sure that the batch doesn't interfere with other parts of the render tree. 

## Code composition
An application can be composed into components. A component extends the `lng.Component` class, which itself extends the `lng.View` class. In fact, `lng.Application` extends `lng.Component`, so it *is* the render tree root. Composition is achieved by simply including them as Views somewhere in the render tree.

## Tools

### View types
The View class may be subclassed to add additional functionality (`BorderView`, `FastBlurView`, `SmoothScaleView`)
