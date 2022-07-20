# Light 3D

With the Light 3D shader you can add a lighting & 3D effect to the texture to be rendered.

## Usage

If you want to use shaders that come with the Lightning framework you need to import Lightning first.

```js
import Lightning from '@lightningjs/core'
```

### Initialize

To use the Light 3D shader you need to apply it to the shader property of an element:

```js
//in template
class MyApp extends Lightning.Application {
    static _template() {
        return {
            Picture: {w: 300, h: 300, src: 'MyImage.jpg', shader: {type: Lightning.shaders.Light3d, strength: 0.9, rx: 23 * Math.PI / 180}}
        }
    }
}

//in a component
this.tag('Picture').shader = {type: Lightning.shaders.Light3d, strength: 0.9, rx: 23 * Math.PI / 180}
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

You can customize the appearance of the Light 3D shader with the following setters.

## Setters

### strength
You can set the strength of the lighting effect with a `float`. Default is 0.5.

### ambient
You can set the ambient value of the lighting effect with a `float`. Default is 0.5.

### rx
You can rotate the texture over the X-axis with a `float`. Expected input is the degrees in radians.

### ry
You can rotate the texture over the Y-axis with a `float`. Expected input is the degrees in radians.

### z
You can position the texture on the Z-axis with a `float`. Expected input is the degrees in radians.

### pivotX
Sets from where to rotate the X-axis with a `float`. This value is generally inherited by the parent element but can be overwritten with this setter.

### pivotY
Sets from where to rotate the Y-axis with a `float`. This value is generally inherited by the parent element but can be overwritten with this setter.

### pivotZ
Sets from where to from the Z-axis position with a `float`. Default is 0.

### lightY
Sets the position of the lighting on the Y-axis with a `float`. Default is 0.

### lightZ
Sets the position of the lighting on the Z-axis with a `float`. Default is 0.

## Getters

### strength
returns the current lighting `strength` value.

### ambient
returns the current lighting `ambient` value.

### rx
returns the current `rx` value.

### ry
returns the current `ry` value.

### z
returns the current `z` value.

### pivotX
returns the current `pivotX` value.

### pivotY
returns the current `pivotY` value.

### pivotZ
returns the current `pivotZ` value.

### lightY
returns the current `lightY` value.

### lightZ
returns the current `lightZ` value.

## Examples

Visit the following site to see various examples of the Rounded Rectangle Shader.

<https://lightningjs.io/examples/#/shaders/light-3d>
