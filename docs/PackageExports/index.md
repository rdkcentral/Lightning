# Package Exports / Tree Shaking

The Lightning Core NPM package exports both the Lightning Core library (the default package export: "@lightningjs/core") as well as the Lightning Inspector ("@lightningjs/core/inspector"). Both the [ES](https://nodejs.org/api/esm.html#modules-ecmascript-modules) and [CommonJS](https://nodejs.org/api/modules.html#modules-commonjs-modules) module styles are supported by both package exports.

> CommonJS is currently provided mainly to support older build tooling that may still be in use by applications. It is recommended that you upgrade/configure your build tools/bundler to utilize the ES modules when possible.

## Lightning Core (Tree Shakable ESM Exports)

```js
// ESM (tree shakable named exports)
import { Application, Component } from "@lightningjs/core";
```

Lightning Core has historically always been available as a single default exported object from which you can access all of the various Lightning classes. As of v2.12, when using the ESM style, each Lightning class is now also available as a seperate tree shakable named export.

Exclusively using the named ESM exports in your application enables the potential for your chosen bundler to [tree shake](https://developer.mozilla.org/en-US/docs/Glossary/Tree_shaking) Lightning's code so that the parts of Lightning that are not utilized by your application are left out of your bundle, reducing its size.

> Important: In order for tree shaking to be successful, your entire application, including any dependencies that are also dependent on Lightning must also utilize the named ESM exports. At the time of this writing, no published Lightning-based NPM packages utilize the tree shakable exports. So if your application is dependent on any, your bundler will be unable to tree shake Lightning.

## Lightning Core (Default Export)

```js
// ESM (default export)
import Lightning from "@lightningjs/core";

// CommonJS
const Lightning = require("@lightningjs/core");
```

The default export, as mentioned above, has historically been the main way users import Lightning Core. All of Lightning Core is available from this single exported object and as such, if imported, will prevent your chosen bundler from being able to tree shake Lightning.

## Lightning Inspector

```js
// ESM
import "@lightningjs/core/inspector";

// ESM (Dynamic)
await import("@lightningjs/core/inspector");

// CommonJS
require("@lightningjs/core/inspector");
```

Outside of including the Lightning Inspector via a seperate `<script>` tag in your application's HTML, you can import/require it as of v2.12:

The Inspector itself does not export any functions/classes/etc via either module style, but it does execute when included and places an `attachInspector()` method onto the browser's `window` object.

> If you choose this method, care should be taken to make sure the Inspector is not bundled with production code.
