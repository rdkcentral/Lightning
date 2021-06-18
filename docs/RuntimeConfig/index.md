# Runtime Configuration

When you initialize your application, you configure the behavior of Lightning at runtime. For example, you can define the use of WebWorkers or set the size of the canvas.

For that purpose, you use *Lightning configuration options* at Application and / or Render Tree level, where you define the configuration options for the Render Tree in the `stage` sub object.

For example, you might specify the following configuration options:

```js
const options = {debug: true, stage: {w: 1920, h: 1080, clearColor: 0xFF000000}}
const App = new MyApp(options);
```

## Application Configuration Options

| Name | Type | Default | Description |
|---|---|---|---|
| `debug` | Boolean | false | Shows changes to the focus path for debug purposes |
| `keys` | Object | Object | A custom [key map](../RemoteControl/KeyHandling.md#key-mapping) |


## Stage Configuration Options

| Name | Type | Default | Description |
|---|---|---|---|
| `canvas` | HTMLCanvasElement | null | If specified, the canvas to be reused (default: create a new canvas) |
| `context` | Object | null | If specified, the WebGL / Canvas2D context to be used |
| `w` | Number | 1920 | Stage width in pixels |
| `h` | Number | 1080 | Stage height in pixels |
| `precision` | Float | 1 | Global stage scaling (see details below) |
| `memoryPressure` | Number | 24e6 | Maximum GPU memory usage in pixels (see details below) |
| `clearColor` | Float[] | [0,0,0,0] | Background color in ARGB values (0 to 1) |
| `defaultFontFace` | String | sans-serif | Font face for text rendering |
| `fixedDt` | Number | 0 (auto) | Fixed time step per frame (in ms) |
| `useImageWorker` | Boolean | true | By default, use a Web Worker that parses images off-thread (web only) |
| `autostart` | Boolean | true | If set to *false*, no automatic binding to  `requestAnimationFrame` |
| `canvas2D` | Boolean | false | If set tot *true*, the Render Engine uses Canvas2D instead of WebGL (limitations apply, see details below) |


## Downscaling

> We advise you to always develop your TV App in a **1080p** coordinate system (the Lightning default).

Assume that you have created an App for 1080p quality, so you have used a 1920x1080 coordinate system to position all of the content. However, you have found out that the App needs to be displayed in a 1280x720 resolution.

You can use the `precision` property to perform a  *global rescale* of the coordinate system. For example, if you specify `precision: 2/3`, the 1920 x-position will be mapped to the 1280-output pixel coordinate.

As a result, the text and off-screen textures are rendered at a *lower resolution* by the [Render Engine](../RenderEngine/index.md), which increases quality (less pixel interpolation) and reduces memory usage.

Downscaling with the `precision` option generally works well. But keep in mind that WebGL rasterizes as *pixel boundaries*, so when it uses a line width of 2 in 1080p quality, it may render at either 2px or 3px in 720p (depending on the rendered pixel offset). If you encounter such problems, you have to set the sizing at a multiple of 3.

## GPU Memory Tweak

This defines the total number of pixels that may be allocated in GPU memory, which allows you to tweak the amount of GPU memory that your Lightning App can use.

If this amount is reached, Lightning only performs an *unused texture cleanup*. Ideally, this situation does not occur often.

> A single pixel uses between 4 and 6 bytes of GPU memory.

## Limitations of `canvas2D`

If WebGL is not available or if `canvas2D` is set to *false*, Lightning uses *Canvas2D* for rendering output.

Note that some functionality (such as WebGL-only shaders) will not work (the default shader will be used instead).

Another limitation applies to  *colorizing textures*. You can safely colorize rectangle textures and even provide (linear-only) gradients. However, other textures such as text and images require the engine to create an *offscreen* colorized texture, where gradients are not supported. This is expensive in terms of CPU and memory, but if used sparingly to color text or tint images one time, it works fine in practice.