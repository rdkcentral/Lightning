# Perspective

With the Perspective shader, you can add a lighting & 3D effect to the texture to be rendered.

## Usage

If you want to use shaders that come with the Lightning framework you need to import Lightning first.

```js
import Lightning from '@lightningjs/core'
```

### Initialize

To use the Perspective shader you need to apply it to the shader property of an element:

```js
//in template
class MyApp extends Lightning.Application {
    static _template() {
        return {
            Picture: {w: 300, h: 300, src: 'MyImage.jpg', shader: {type: Lightning.shaders.Perspective, rx: 49 * Math.PI / 180}}
        }
    }
}

//in a component
this.tag('Picture').shader = {type: Lightning.shaders.Perspective, rx: 49 * Math.PI / 180}
```

### Calculating Rotation

Rotation in Lightning is done with radian values. You can use the following formula to calculate the correct value from degrees to radians;

```
degrees * Math.PI / 180
```

For example, to rotate a tag 33 degrees;

```
33 * Math.PI / 180
```

You can customize the appearance of the Perspective shader with the following setters.

## Setters

### rx
You can rotate the texture over the X-axis with a `float`. Expected input is the degrees in radians.

### ry
You can rotate the texture over the Y-axis with a `float`. Expected input is the degrees in radians.

### z
You can position the texture on the X-axis with a `float`. Expected input is the degrees in radians.

## Getters

### rx
returns the current `rx` value.

### ry
returns the current `ry` value.

### z
returns the current `z` value.

## Examples

Visit the following site to see various examples of the Rounded Rectangle Shader.

<https://lightningjs.io/examples/#/shaders/light-3d>
