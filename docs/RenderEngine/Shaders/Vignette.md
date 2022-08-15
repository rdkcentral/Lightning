# Vignette

The Vignette shader allows you to apply a vignette effect to a texture.

## Usage

If you want to use shaders that come with the Lightning framework you need to import Lightning first.

```js
import Lightning from '@lightningjs/core'
```

### Initialize

To use the Vignette shader you need to apply it to the shader property of an element:

```js
//in template
class MyApp extends Lightning.Application {
    static _template() {
        return {
            Picture: {w: 300, h: 300, src: 'MyImage.jpg', shader: {type: Lightning.shaders.Vignette, magnitude: 3, intensity: 0.3}}
        }
    }
}

//in a component
this.tag('Vignette').shader = {type: Lightning.shaders.Vignette, magnitude: 3, intensity: 0.3}
```

You can customize the appearance of the Vignette shader with the following setters.


## Setters

### magnitude
You can set the magnitude of the Vignette shader with a `float`. The value of magnitude determines the degrees of fading around the light source.

### intensity
You can set the intensity of the Vignette shader with a `float`. The value of intensity determines the strength of the light source.

### pivot
You can set the pivot of the Vignette with either an `array` or `float`. The pivot is the center of where the Vignette is drawn. To let the pivot fall within the texture the value should range from 0 - 1. The value can also range outside that if you wish so.

When a `float` value is given the shader will appoint that value to each pivot position of the Vignette. When an `array` is given the shader checks the length of the given array in order to appoint the correct value to each pivot position.

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

## Getters

### magnitude
returns the current `magnitude` value.

### intensity
returns the current `intensity` value.

### pivot
return the current `pivot` values.

### pivotX
return the current `pivotX` values.

### pivotY
return the current `pivotY` values.

## Examples

Visit the following site to see various examples of the Rounded Rectangle Shader.

<https://lightningjs.io/examples/#/shaders/vignette>
