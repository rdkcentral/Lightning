# WPE UI Framework

WPE UI Framework is a javascript 2d graphics rendering and animation library using (Web)GL. It's geared towards developing animated User Interfaces that run nicely on low-performance (embedded) devices. The framework has been optimized for high performance and low CPU/memory usage, and has been carefully tested for memory leaks.

The framework provides a **rendering tree** that can be modified using a very *simple* API. The rendering tree consists of **components** that have properties that define where and how it is rendered (x, y, rotation, alpha, etc). An image or rendered text can be attached to a component, which is then rendered immediately on the screen.

UI Framework runs in a any modern web browser using **WebGL** and in **Node.js** (version 4 or higher) on several targets including (desktop) Linux, OSX, Windows and the Raspberry PI.

# Installation instructions

## Browser
Include the script dist/wpe.js or dist/wpe.min.js.
These files can be re-generated from source using the command:

    grunt wpe-browser

## Node.js:
For Node.js, this module depends on node-canvas for image loading and text creation, and node-wpe-webgl for providing a WebGL interface to the native hardware. Install the dependencies and follow the installation instructions of node-canvas (https://github.com/Automattic/node-canvas) and node-wpe-webgl (https://github.com/WebPlatformForEmbedded/node-wpe-webgl).

# Basic usage

This section describes how to initialize and use the framework step-by-step.

## Initialization

For a web browser:

```javascript
var options = {w: 600, h: 600, glClearColor: 0xFF000000};
var stage = new Stage(options);

document.body.appendChild(stage.getCanvas());
```

This initializes a new stage. The stage creates a canvas of the specified width and height for drawing, and uses the specified background color (in ARGB hexadecimal format). You should then get it using `stage.getCanvas(`) add it to the DOM tree. You can also supply your own canvas object by using the reuseCanvas option.

For Node.js:

```javascript
var Stage = require('../../wpe');

var options = {w: 600, h: 600, glClearColor: 0xFF000000, window: {title: "Example", fullscreen: false}};
var stage = new Stage(options);
```

This is similar as for the web browser, but node-wpe-webgl is used as OpenGL rendering target. This module allows some options for initialization that can be set in the window property. See https://github.com/WebPlatformForEmbedded/node-wpe-webgl#options.

Check the API for a list of all [initialisation options](#initialisation-options).

## Rendering tree

The `stage.root` property is the root of the rendering tree. It is an object of type `Component`, to which you can add other new components to it to define what should be rendered within the stage. The tree consists **only** out of objects of the Component type. Components are monolithical objects: they can be images, rectangles, texts or containers, based on how the properties are set (mostly for performance reasons).

Example:

```javascript
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

Check the API for a list of all [component properties](#component).

## Dynamic changes

You can dynamically change the rendering tree by accessing components using their tags:

```javascript
// Get a single component by tag, and modify properties.
var bunniesCtr = stage.root.tag('bunnies');
bunniesCtr.borderWidth -= 5;

// You can access the component's children directly.
var bunnies = bunniesCtr.children;
bunnies.forEach(function(b) {
  // Set properties using a JSON object.
  b.set({alpha: 0.5, scale:8});

  // Add tag for later use.
  b.addTag('bunny');
});

// Use the just added tags, and clear the tags using a setting.
bunniesCtr.stag('bunny', {borderWidth: 1, tags: []});

// Because tags were just removed, this does nothing.
bunniesCtr.stag('bunny', {borderWidth: 0});

// Set by complex tag (set components tagged 'hello' that have an ancestor tagged 'bg').
stage.root.stag('bg.hello', {text: {text: "Hello World"}, alpha: 1});
```
https://jsfiddle.net/basvanmeurs/m2z8ctu7/

You can also create, add and remove components dynamically:

```javascript
// Add new branch.
stage.root.tag('bunnies').add({tag: 'stuff', w: 400, h: 60, x: 50, y: 10, rect: true, color: 0xAAFFFFFF, borderWidth: 2, borderColor: 0xFF000000, children: [
	{src: basePath + 'bunny.png', x: 10, y: 30, mountY: 0.5},
  {text: {text: "this is a demo showing you how to define a branch of components via json and how to add that to the render branch.", fontSize: 12, lineHeight: 14, fontFace: ["Verdana", "Sans-Serif"], wordWrapWidth: 330}, x: 50, y:10, color: 0xFF000000}
]});

var c;
setTimeout(function() {
  // Remove the bunny.
  c = stage.root.tag('stuff').children[0];
	stage.root.tag('stuff').removeChild(c);

  setTimeout(function() {
    // Re-add the bunny, this time to the stage root.
    stage.root.addChild(c);
  }, 1000);
}, 1000);
```
https://jsfiddle.net/basvanmeurs/r0hkamd7/

You can also hook into the frame loop, which runs at 60fps:
```javascript
stage.on('frameStart', function(dt) {
	stage.root.tag('left').scaleX += stage.dt * 10;
	stage.root.tag('right').rotation += stage.dt * 1;
	stage.root.tag('hello').x += 30 * stage.dt;
});
```
https://jsfiddle.net/basvanmeurs/c4f7kh70/

## Transitions
In a UI, in most situations a gradual transition looks nicer than setting a property directly. That's why this framework provides transitions in a very simple API:

```javascript

var t = stage.root.tag('bunnies').transition('rotation', {delay: 2, duration: 8, timingFunction: 'ease'});
t.on('finish', function() {
	stage.root.tag('bunnies').x = 400;
});
stage.root.tag('bunnies').transition('x', {delay: 2, duration: 5, timingFunction: 'linear'});
stage.root.tag('bunnies').rotation = 2 * Math.PI * 8;

```
Check the API for a list of all [transition properties and events](#transition).

https://jsfiddle.net/basvanmeurs/3eakcyrh/

Todo: fast forward.

## Animations

## Stopping
When you want to gracefully stop your Node.js application (or want to completely remove the stage from your webpage), you *must* call `stage.destroy()`. This will make sure that all resources are freed, and will stop the render loop, allowing Node.js to quit.

# API

## Stage

### <a name="initialisation-options"></a>Initialisation options
Usage: `new Stage({w: 600, h: 600, ...})`.

| Name |Default value| Description |
| --------------- |-------------|------------------------------------------------------------------------------------------------------|
| `w` | `1280`| Stage width in px. |
| `h` | `720`| Stage height in px |
| `reuseCanvas` | `null`| Canvas object to use instead of creating a new one (browser only). |
| `rw` | `1280`| The px which corresponds the right edge of the stage. |
| `rh` | `720`| The px which corresponds the bottom edge of the stage. |
| `textureMemory` | `12e6`| The amount of squared pixels that may be stored in GPU memory for texture storage / caching. |
| `glClearColor` | `0xFF000000`| The background color (ARGB). |
| <a name="initialisation-options-default-font-face"></a>`defaultFontFace` | Arial| The font face to use for rendering if none is explicitly specified. |
| `fixedDt` | `0`| If specified, the ms to progress in each is fixed instead of dynamic. |
| `window` | | Specific node-wpe-webgl options, see https://github.com/WebPlatformForEmbedded/node-wpe-webgl#options. |
| `useTextureAtlas` | true | This allocates a 2048x2048px texture to which small textures that are currently visible are being cached. This makes rendering a lot faster but takes memory.

### Methods

| Method | Description |
| --------------------------------- |-------------|
| `destroy()` | Destroys this stage and release all resources. It is no longer usable after calling this method. |
| `setGlClearColor(color)` | Sets the background color (example: 0xFF000000). |
| `getCanvas()` | Returns the canvas. |
| `stops()` | Temporarily stops the stage rendering loop. |
| `resume()` | Resumes the stage rendering loop. |
| `texture(source, options)` | Creates a new texture. Source can be either a string (URL/file path), a TextureSource object, or a function which has a callback argument, which it invokes with an actual source (Canvas, Image or Uint8Array with RGBA data) and as second argument an object with properties w, h which should be specified in case of Uint8Array. Options are id (texture sources with the same id are reused), and x, y, w, h for clipping. |
| `component(settings)` | Creates an returns a new component object. |
| `c(settings)` | See component(). |
| `animation(settings)` | Creates and returns a new animation (without a subject). |
| `a(settings)` | See animation(). |

### Events

| Name | Arguments | Description |
| --------------------------------- |---------|-------------|
| `frameStart` | | Emitted on every frame. |
| `update` | | Emitted on every frame, after applying transitions and animations. |
| `frameEnd` | | Emitted on every frame, after rendering. |

## <a name="component"></a>Component

### Properties

| Name | Default value | Description |
| --------------------------------- |-------------|-------------|
| `x`, `y` | `0`| Relative offset to the parent component in px. |
| `w`, `h` | `0`| Width/height of the component in px (if applicable). |
| `scale`(`X`,`Y`) | `1`| Scales this component (and all descendants), relative to the pivot position. |
| `rotation` | `0`| Rotation around the pivot point in radian.s |
| `pivot`(`X`,`Y`) | `0.5`| Specifies the pivot point for scale and rotation (0 = left/top, 1 = bottom/right). |
| `mount`(`X`,`Y`) | `0`| Specifies the alignment for the x, y offset (0 = left/top, 1 = bottom/right). |
| `alpha` | `1`| Opacity of this component (and all descendants). |
| `borderWidth`(`Top`,`Left`,`Right`,`Bottom`)| `1`| Border width. |
| `borderColor`(`Top`,`Left`,`Right`,`Bottom`)| `0xFFFFFFFF`| Border color (ARGB integer). |
| `color`(`Top`,`Bottom`)(`Left`,`Right`) | `0xFFFFFFFF`| Color/tinting/gradients of the drawn texture. *Note: gradients do not work on textures that are being clipped due to technical limitations.* |
| `visible` | `true`| Toggles visibility for this component (and all descendants). |
| `zIndex` | `0`| Specifies drawing order (just as in HTML). |
| `forceZIndexContext` | `false`| Creates a z-index stacking context without changing the drawing order of this component itself. |
| `clipping` | `false`| Do not draw descendant component parts that are outside of this component (overflow:hidden). |
| `rect` | `false`| When set to true, this component becomes a colored rectangle. |
| `src` | `null`| When set, this component will render the image; URL (Node.js / web) or file (Node.js). |
| `text` | `null`| When set, this component will render the text as specified (an object with the options specified below). |
| `texture` | `null`| When set, this component will render the custom texture (see `Stage.getTexture(..)`). By specifying a plain object with x,y,w,h properties you can select a specific area of the texture. |
| `tags` | `[]`| Replaces the tags of this component (`this.setTags(..)`). Can be a string or an array of strings. |
| `children` | `[]`| Replaces the children of this component (`this.setChildren(..)`). |
| `transitions` | `{}`| Adds transitions (for every key-value: `this.transition(key,value)`). It does not remove the existing transitions. |

Text object properties:

| Name | Default value | Description |
| --------------------------------- |-------------|-------------|
| `text` | `""`| The text to be shown. |
| `fontSize` | `40`| Text font size, in px. |
| `fontFace` | `"Arial"`| the font face (as used in CSS); may be an array to use (multiple) fallbacks. If nothing is specified, the [defaultFontFace](#initialisation-options-default-font-face) is used. |
| `fontStyle` | `"normal"`| Font-style property (https://developer.mozilla.org/en-US/docs/Web/CSS/font-style). |
| `wordWrap` | `true`| Should words wrap be enabled? |
| `wordWrapWidth` | `0`| The word wrap max line width in px. If not set, w property is used. |###
| `lineHeight` | `null`| The line height; if not set the font size is used. |
| `textBaseline` | `alphabetic`| https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/textBaseline |
| `textAlign` | `left`| Text alignment: left, center or right. |
| `textAlign` | `left`| Text alignment: left, center or right. |
| `offsetY` | `0`| Additional offset to start drawing text from the top. |
| `maxLines` | `0`| Limits the number of lines to be drawn. |
| `maxLinesSuffix` | `".."`| If there were more text lines that have been drawn, append this to the final line. |
| `textColor` | `0xFFFFFFFF`| Normally, you will use the color property of the component to specify the color. But when using highlighting or text shadows, this will also affect those. You will then have to set this text drawing color. |
| `padding`(`Left`,`Right`) | `0`| Additional padding on the sides of the text. |
| `shadow` | `false`| Enable text shadows. |
| `shadowColor` | `0xFF000000`| https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/shadowColor |
| `shadowOffset`(`X`,`Y`) | `0`| https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/shadowOffsetX |
| `shadowBlur` | `5`| https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/shadowBlur |

### Methods
| Method | Description |
| --------------------------------- |-------------|
| `add(children)` | Appends one or more children. Argument can be either a Component object, a plain object with component properties, or an array of either. |
| `addChild(component)` | Appends a single component to the children. |
| `addChildAt(component, index)` | Appends a single component at the specified position in the children array. |
| `removeChild(component)` | Removes the specified child component. |
| `removeChildAt(index)` | Removes the child at the specified index. |
| `removeChildren(components)` | Removes the specified child components. |
| `addChildren(components)` | appends multiple components to the children. |
| `setChildren(components)` | Replaces the current children with the array of components. |
| `getChildIndex(component)` | Returns the child index of the specified component (-1 if not a child of this component). |
| `getDepth()` | Returns the tree depth (root = 0). |
| `getAncestor(l)` | Returns the ancestor, `l` levels above this one (if `l` too high, root is returned). |
| `getAncestorAtDepth(l)` | Returns the ancestor at the specified level. |
| `isAncestorOf(component)` | Returns true iff this component is an ancestor of the specified component. |
| `getSharedAncestor(component)` | Returns the shared ancestor between this and the specified component (`null` if not in the same tree). |
| `isAttached()` | Returns true iff this component is attached to the stage rendering tree. |
| `isActive()` | Returns true iff this component is attached to the stage rendering tree and is visible. |
| `animation(settings)` | Creates and returns an animation that has this component as subject. |
| `a(settings)` | See animation(). |
| `transition(property, settings)` | If settings is a plain object, it enables the transition on the specified property. If settings is `null`, it removes the animation on the specified property. The following properties can be transitioned: `x y w h scale(X,Y) pivot(X,Y) mount(X,Y) alpha rotation borderWidth(Top,Bottom,Left,Right) borderColor(Top,Bottom,Left,Right) color(Top,Bottom)(Left,Right)` |
| `t(property, settings)` | See transition(). |
| `fastForward(property)` | Fast-forwards the specified transition. |
| `getRenderWidth()` | Returns the render width of this component (either the set w property, or the width of the texture actually being shown). |
| `getRenderHeight()` | Returns the render height of this component. |
| `getCornerPoints()` | Returns the [x1,y1,x2,y2,x3,y3,x4,y4] coordinates of the component's corner points in world coordinates. |
| `getLocationString()` | Returns a nicely formatted string describing the tree location of this component. |
todo: tags and other methods

## <a name="transition"></a>Transition

### Properties

| Name |Default value| Description |
| --------------------------------- |-------------|-------------|
| `delay` | `0`| Delay in s before starting the transition after updating the value. |
| `duration` | `1`| Defines how long the transition takes from start to finish. |
| `timingFunction` | `ease`| The timing function. Supported are: `linear ease ease-in ease-out ease-in-out step-start step-end cubic-bezier(n,n,n,n)`|

### Events

| Name |Arguments| Description |
| --------------------------------- |---------|-------------|
| `start` | | Emitted when a transition starts. |
| `delayEnd` | | Emitted when a delay ends. |
| `progress` | p (value between 0 and 1) | Emitted on every transition step. |
| `finish` | | Emitted when a delay finishes. |

## <a name="animation"></a>Animation

Todo.
