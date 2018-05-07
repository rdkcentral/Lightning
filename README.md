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

### Node.js:
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


