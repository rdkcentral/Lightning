# WPE UI Framework

WPE UI Framework is a javascript 2d graphics rendering and animation library using (Web)GL. It's geared towards developing animated User Interfaces that run nicely on low-performance (embedded) devices. The framework has been optimized for high performance and low CPU/memory usage, and has been carefully tested for memory leaks.

WPE UI Framework offers a **rendering tree** that can be modified using a very *simple* and *usable* API. The rendering tree consists of **components** that have several properties (x, y, rotation, alpha, etc). An image or rendered text can be attached to a component, which is then rendered immediately on the screen, in the right way as specified by the properties. This rendering tree is comparable to the HTML DOM but has a simplified set of features, renders much faster and is easier to manage in a dynamical way.

WPE UI Framework runs in a any modern web browser using **WebGL** and in **Node.js** (version 4 or higher). For Node.js, this module depends on node-canvas for text creation, and node-wpe-webgl for providing a WebGL interface to the native hardware. Out of the box, supported targets include (desktop) Linux, OSX, Windows and the Raspberry PI!

# Installation instructions

## Browser
Include the script dist/wpe.js or dist/wpe.min.js.

## Node.js:
Install the dependencies and follow the installation instructions of node-canvas (https://github.com/Automattic/node-canvas) and node-wpe-webgl (https://github.com/WebPlatformForEmbedded/node-wpe-webgl).

# Basic usage


