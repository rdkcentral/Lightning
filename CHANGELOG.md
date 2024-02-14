# Changelog

## v2.12.1
*07 feb 2024*

- Fixed examples that were not working due to incorrect imports.
- Fixed build issues on non-*nix systems.
- Fixed some typos in the documentation.
- Fixed an issue in RoundedRectangleShader where setting a stroke value resulted in incorrect clipping, especially noticeable when the radius is half the height.

## v2.12.0
*26 oct 2023*

- Introduced a named export for Lightning in the ESM build to support direct module augmentation with `@lightningjs/core`, resolving issues with default export augmentation. (#480)
- Modified the export structure to support tree-shaking. Lightning's ES modules can now be selectively imported /tree-shaken. (#490)
- Enabled development in both TypeScript and JavaScript. Migrated specific files and ensured all source module files are appropriately managed in the `dist` directory.
- Separated the Lightning Inspector with types as its own export.
- Resolved an inconsistency in the zSorting algorithm where elements with the same zIndex were not correctly sorted by updateTreeOrder. (#443)
- Addressed an exception causing infinite loops when accessing the texture.source property after text updates. This fix streamlines access to the renderInfo property without triggering a maximum call stack exception. (#447 and #348)
- Resolved an issue where adding an already existing element to childList would throw an error. (#311 and #509)
- Fixed an issue where SVG `txError` events were not being triggered due to missed error captures.
- Fixed an issue where `txLoaded` event in elements over-fired due to incorrect texture change identification.


## v2.11.0
*31 july 2023*

- Updated typings of Element so `flexItem` can be `false` as referred to in the documentation.
- Fixed an issue related to applying vertex-specific color to the hole punch fragment.
- Fixed the regression related to TextTextureRenderer word wrapping. (#488)
- An unnecessary conditional in the default shader code was removed.
- Fixed alpha channel detection when using in-process image handling. (#493)
- Fixed a typo referencing the `renderOffscreen` method of `Element`.
- Added `webgl2` as the fallback context option if `webgl` or `experimental-webgl` is unavailable. (#496)
- Added event bubbling support for pointer events. (#485)
- Added support for getting local coordinates with pointer events (#484)

## v2.10.0
*24 apr 2023*

- Integrated `Vite` to replace `rollup` bundler and integrated `Vitest` for unit testing
- Implemented word wrapping support on zero-width breaking spaces (#450) (docs: [Word Wrap in Non-Latin Based Languages](https://lightningjs.io/docs/#/lightning-core-reference/RenderEngine/Textures/Text?id=word-wrap-in-non-latin-based-languages) ) 
- Added support for device pixel ratio with an option `devicePixelRatio` (docs: [Global Stage Scaling](https://lightningjs.io/docs/#/lightning-core-reference/RuntimeConfig/index?id=#global-stage-scaling), [Handling high pixel density](https://lightningjs.io/docs/#/lightning-core-reference/RuntimeConfig/index?id=#handling-high-pixel-density-high-dpi) ) 
- Fixed issue with text rendering at high precision levels causing incorrect word wrapping (#470)
- Fixed issue with inability to override the id accessor of a Component with string accessor (#456)
- Added first/last getters to TypeScript definitions for ObjectList
- Fixed documentation and TypeScript definitions for TextTexture `fontFace`
- Fixed TypeScript error with getByRef() when using generic type param as Ref value (#444)
- Implemented default loose type configs for TypeScript.

## v2.9.1

*21 apr 2023*

- 🔥 Hotfix for memory leak when `pauseRafLoopOnIdle` is enabled (introduced in v2.7.0)
- Implemented additional cleanup of Lightning code that gets stuck on the heap after calling `destroy`

## v2.9.0
*16 feb 2023*

- Fixed issues related to package.json exports (#434)
- Added a warning about `strictNullChecks` option to the TypeScript docs (#433)
- Fixed an issue occurring while using `maxLinesSuffix` when `advancedRender` is set to `true` (#429)
- Fixed an alignment issue occurring when the advanced text renderer is used (#428)
- Added an example of basic subclassing to the TypeScript docs (#446)
- Fixed an issue related to an inconsistency in the handling of default fonts
- Added instant freeing up of text textures to prevent memory building up when text is being changed
- Updated docs to add `letterSpacing` property to `Text` texture

## v2.8.1

*31 oct 2022*

- Fixed Lightning inspector (#427)

## v2.8.0

*20 oct 2022*

- Updated patching.md file (#422)
- Minor documentation updates (#405)
- Added support to track vram usage (#395)
- Added texture compression support (#391)

## v2.7.1

*19 sep 2022*

- Added support for smart read pixels after draw (#417)
- Fixed "handling input" section of docs index (#416)
- Added missing 'pauseRafLoopOnIdle' stage option type def and small doc updates (#415)
- Reverted original functionality of drawFrame() (#414)
- Fixed fatal exception when attempting to render 0x0 canvas texture without forceTxCanvasSource option (#413)
- Added typescript docs (#409)

## v2.7.0

*15 aug 2022*

- Added TypeScript Support (#407)
- Enabled RAF idle usage with stage option 'pauseRafLoopOnIdle'(#402)
- Fixed regression on Ziggo platforms (#364)
- Added glReadPixels support after rendering (#388)
- Updated Readme file with correct LightningJs Documentation URL.(#383)
- Improved support for vertical alignment on advanced text renderer. (#378)
- Removed regex named capture groups from text parser (#394)
- Added listener for visibility change to redraw when visible(#396)
- Added revised Documentation related to Lightning Core
- Added option to force canvas element as tx source(#393)

## v2.6.0

*28 dec 2021*

### Features
- `textRenderSharpFontSize` and `textRenderSharpPrecision` options were replaced by `fontSharp` option and their default values adjusted (#354, #359)
- Added CSS cursor support (https://developer.mozilla.org/en-US/docs/Web/CSS/cursor). Check out the example: `examples/mouse-pointer/cursor.html` (#319)

### Fixes
- Fixed issue where `canvas` would not fully initialize before the inspector, resulting in invalid `width` and `height` of the root inspector element (#355)


## v2.5.1

*04 nov 2021*

### Fixes
- Mouse hover/unhover properly affects entire branch instead of single component. See `examples/mouse-pointer/hover-tree.html`. (#334)
- Fixed text rendering problems present on some versions of Tizen platforms (#344)
- Fixed issue where inspector would not show falsy text values e.g. `0` in element's attributes (#341)
- Fixed issue in `advancedTextRenderer`, where `maxLines` would break for one word lines (#350)



## v2.5.0

*13 sep 2021*

### Features
- Added new text renderer that enables i.a. bold, italics and color using html-like tags. Check `examples/text/advanced-renderer.html` for more information (#318)
- Introduced options `textRenderSharpFontSize` and `textRenderSharpPrecision` stage options for text texture scaling. Those options are useful for reducing blur effect on only selected text textures (#321, #320)

### Fixes
- Fixed ChildList's `setAt` boundary check (#314)
- Fixed inaccurate collision check for mouse pointer when precision is different than 1 (#329)


## 2.4.0

*07 jul 2021*

### Features
- Added support for mouse (check out `examples/mouse-pointer`)(#68, #300, #302)
- `childList` insert methods now accept patch objects (#294)
- Added `focus` attribute to currently focused element when viewed using inspector (#266, #304)

### Fixes
- Fixed issue with inspector in bundled Lightning (#308)
- Fixed issue where ObjectList's `removeAt` method would not guard against errors (#306)
- Reduced blur effect on text texture when its font size is small (#299, #305)
- Updated license field in package.json file  to match SPDX (#307)
- Relicense Lightning to Metrological Apache (#285)

## v2.3.0

*05 jul 2021*

### Features
- Multiple property bindings are now accepted by `bindProp` method (#275)
- Added Magnifier shader (check out `examples/shaders/magnifier`) (#274)
- Added customisable `data-testId` property in inspector that can be used by automated tests (#288)

### Fixes
- Property bindings now work with shaders (#278)
- Property bindings now work with text objects (#283)
- Text texture's height will now match exactly line height if its `textBaseline` property is set to `bottom` (#286)

## v2.2.0

### Features
- Added FadeOut, Spinner2 shaders, updated RoundRectangle, RadialGradient, Vignette (see `examples/shaders`) (#255)
- Event emitter now supports `once` method (#271)
- Component's `signals` method will now accept functions (see `examples/signals`) (#264)

### Fixes
- Fixed issue where calling Event emitter's `off` method inside callback it was registered with would not work (#271)
- Multiple `\n` text line breaks are now rendered correctly (#277)


## v2.1.2

### Fixes
- Fixed image path construction problem for URLS containing hash (#257)
- Fixed letter-spacing on text texture to be properly applied on different resolutions (#256)

## v2.1.1

### Features
- <details><summary>Component instance is now accessible in template method (#253)</summary>

  ```javascript
  static _template(instance) {
    return { w: instance.size, h: instance.size };
  }

  _construct() {
    this.size = 50;
  }
  ```
  </details>

### Fixes
- Fixed possible ES5 compatibility issues with code not subject to transpilation (#242)


## v2.0.0 (Carbon)

### Features
- `wpe-lightning` package migrates to `@lightningjs/core`
- Logs from Lightning have now `[Lightning]` prefix (#245)
- Added property bindings for Lightning templates via `bindProp` method (see `examples/property-bindings`) (#251)
- <details><summary>Added <code>textIndent</code> option for text texture (#250)</summary>

  ```javascript
  {text: {text: 'hello', textIndent: 200}}
  ```
  </details>

### Fixes
- Fixed improperly handled GC case for `c2d` renderer (#246)


### v1.11.0

#### Features
 * [experimental] Added touch support (see `examples/touch`) (#239)

#### Fixes
 * Shaders will now use `precision highp float` if the platform supports it (#232)
 * Fixed RoundedRectangle shader unconverted uniforms that would cause errors on some of the platforms (#234)
 * Fixed Hole shader to work with different resolutions (#233)
 * Fixed CORS issues on images specific to PS4 platform (#226)


## v1.10.0

*04 sep 2020*

### Features
- New shaders:`Vignette`, `Perspective`, `Spinner` and `Hole` ([example](https://jsfiddle.net/s8wvckL5/10/))

- <details><summary><code>RoundedRectangle</code> shader can now be applied to each corner separately (<a href="https://jsfiddle.net/sLk5gzoh/2/">example</a>)</summary>

  ```javascript
  shader: {type: lng.shaders.RoundedRectangle, radius: 50} // apply round corners to whole rectangle
  ```
  ```javascript
  shader: {type: lng.shaders.RoundedRectangle, radius: [50, 0, 25, 0]} // apply round corners separately
  ```
  </details>

- <details><summary>Binding multiple methods to same keycode is now possible</summary>

  ```javascript
  const keys = {
    ...
    8: 'Back',
    13: 'Enter',
    219: ['Rewind', 'PreviousPage'],
    221: ['FastForward', 'NextPage'],
    ...
  };
  ```
</details>

- <details><summary>Added support for base64 encoded images. This may have worked or not depending on image format and Image Worker configuration, but after the change it should work in all configurations</summary>

  ```javascript
  Image: {
    x: 15, y: 15,
    src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAA...'
  }

  ```
</details>

### Fixes
- Animation's `progress` event is called right before `finish` (#196)
- No text on PS4 (#16)
- Broken `Dithering`, `Outline` and `Pixelate` shaders (#199, #203)


## v1.9.0

### Features
- <details><summary><code>RoundedRectangle</code> shader now has <code>fillColor</code>, <code>stroke</code> and <code>strokeColor</code> properties (<a href="https://jsfiddle.net/sLk5gzoh/4/">example</a>)</summary>

  ```javascript
  shader: {
    type: lng.shaders.RoundedRectangle,
    fillColor: 0xffff0000, // fill color
    strokeColor: 0xff00ffff, // stroke color
    stroke: 30, // stroke thickness
  }
  ```
  </details>

- <details><summary>Added <code>verticalAlign</code> option for <code>TextTexture</code>, which defines how text should be positioned if line height is greater than size of the font (<a href="https://jsfiddle.net/sLk5gzoh/5/">example</a>)</summary>

  ```javascript
  text: {
    text: 'Hello',
    fontSize: 24,
    lineHeight: 40,
    verticalAlign: 'middle'
  }
  ```
  </details>

### Fixes
- Reverted #192 (#164) to preserve compatibility with existing applications

## v1.8.1

### Fixes
- Vertical centering of text when line height is larger than font size (#164)
- Relative protocol urls for Image Worker (#143)

## v1.8.0

### General
- Migration to rdkcentral

### Fixes
- SVG images from foreign origins throwing errors (#185)

## v1.7.0

### Features
- <details><summary>Added <code>letterSpacing</code> option for <code>TextTexture</code>, which lets increase or decrease space between letters (<a href="https://jsfiddle.net/oazxmp30/">example</a>)</summary>

  ```javascript
  text: {
    text: 'Hello',
    letterSpacing: 5
  }
  ```
  </details>

## v1.6.1

### Fixes
- `getNonDefaults()` of `Element` class (9096717)

## v1.6.0

### Features
- Jest snapshot for Lightning template (1790cb3)

## v1.5.1

### General
- Spark shader updates (#108)

## v1.5.0

### General
- Integration with Spark platform (#108)

### Fixes
- `resizeMode` is not applied when texture uses source that is already loaded (#103)

## v1.4.1

### General
- Rollup update (#102)

## v1.4.0

### Features
- Lightning now contains ES5 compatible bundles (#97)

## v1.3.2

### Fixes
- Fixed Image Worker to be ES5 compatible (aaed13282b98448eaf0c5a14106a0251a0ddd012)

## v1.3.1

*08 jan 2020*

### Fixes
- Fixed text highlight not rendering properly (#86)

## v1.3.0

*19 nov 2019*

### Features
- Since 1.2.1, Lightning is available on npm registry under `wpe-lightning` ([check here](https://www.npmjs.com/package/wpe-lightning))
- Added `RoundRectangle` shader (#70). It allows to easily make round corners around the texture ([example](https://jsfiddle.net/b02e34td/3/))

## v1.2.0

*21 oct 2019*

### Features
* Added `textOverflow` option (#26). This enables various text clipping options for single line words or sentences. More information [here](https://webplatformforembedded.github.io/Lightning/docs/renderEngine/textures/text).
* Added longPress feature (#48). This adds support for key releases and handlers for long key presses.

## v1.0.9

*21 oct 2019*

### Fixes
* Fixed text rendering artifacts sometimes appearing on RPI platform (#41)


