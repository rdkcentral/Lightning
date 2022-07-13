# Radial Gradient

The Radial Gradient shader allows you to draw a radial gradient over a texture.

## Usage

If you want to use shaders that come with the Lightning framework you need to import Lightning first.

```js
import Lightning from '@lightningjs/core'
```

### Initialize

To use the Radial Gradient shader you need to apply it to the shader property of an element:

```js
//in template
class MyApp extends Lightning.Application {
    static _template() {
        return {
            RadialGradient: {w: 300, h: 300, rect: true, shader: {type: Lightning.shaders.RadialGradient, outerColor: 0xffff0000, innerColor: 0xff0000ff}}
        }
    }
}

//in a component
this.tag('RadialGradient').shader = {type: Lightning.shaders.RadialGradient, outerColor: 0xffff0000, innerColor: 0xff0000ff}
```

You can customize the appearance of the Radial Gradient shader with the following setters.


## Setters

### radius
You can set the radius of the Radial Gradient shader with a `float`.

### radiusX
You can set the width of the Radial Gradient with a `float`. Default is the value of `radius`.

### radiusY
You can set the height of the Radial Gradient with a `float`. Default is the value of `radius`.

### pivot
You can set the pivot of the Radial Gradient with either an `array` or `float`. The pivot is the center of where the Radial Gradient is drawn. To let the pivot fall within the texture the value should range from 0 - 1. The value can also range outside that if you wish so.

When a `float` value is given the shader will appoint that value to each pivot position of the Radial Gradient. When an `array` is given the shader checks the length of the given array in order to appoint the correct value to each pivot position.

When the `array` length is bigger than two:

```js
const pivot = [0.3, 0.2, 0.6, 0.4];

//expected output
const positions = {
  pivotX: 0.3,
  pivotY: 0.2,
}
```

When the `array` length is two it will copy it as is:

```js
const pivot = [0.3, 0.6];

//expected output
const positions = {
  pivotX: 0.3,
  pivotY: 0.6,
}
```

When the `array` length is one it will act the same as setting a `float`.

### pivotX
You can set the x position of the pivot with a `float`.

### pivotY
You can set the y position of the pivot with a `float`.

### innerColor
You can set the inner color with an `argb` value typically used in Lightning. Default is `0xffffffff`

### outerColor
You can set the outer color with an `argb` value typically used in Lightning. Default is `0x00ffffff`.

## Getters

### radius
returns the current `radius` value.

### radiusX
returns the current `radiusX` value.

### radiusY
returns the current `radiusY` value.

### pivot
return the current `pivot` values.

### pivotX
return the current `pivotX` values.

### pivotY
return the current `pivotY` values.

### innerColor
returns the current `innerColor` of the stroke.

### outerColor
returns the current `outerColor` of the stroke.

## Examples

Visit the following site to see various examples of the Rounded Rectangle Shader.

<https://lightningjs.io/examples/#/shaders/radial-gradient>
