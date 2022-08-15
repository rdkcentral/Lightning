# Rounded Rectangle

The Rounded Rectangle shader clips a texture from a rectangle with sharp points into a rectangle with corners that are curved into an arc.

## Usage

If you want to use shaders that come with the Lightning framework you need to import Lightning first.

```js
import Lightning from '@lightningjs/core'
```

### Initialize

To use the Rounded Rectangle shader you need to apply it to the shader property of an element:

```js
//in template
class MyApp extends Lightning.Application {
    static _template() {
        return {
            RoundedRectangle: {w: 300, h: 300, rect: true, shader: {type: Lightning.shaders.RoundedRectangle, radius: 20}}
        }
    }
}

//in a component
this.tag('RoundedRectangle').shader = {type: Lightning.shaders.RoundedRectangle, radius: 20}
```

You can customize the appearance of the Rounded Rectangle shader with the following setters.


## Setters

### radius
You can set the radius of the Rounded Rectangle shader with a `float` or an `array`.

When a `float` value is given the shader will appoint that value to each corner of the rectangle. When an `array` is given the shader checks the length of the given array in order to appoint the correct value to each corner.

When the `array` length is two:

```js
const radius = [50, 90];

//expected output
const corners = {
  topLeft: 50,
  topRight: 90,
  bottomRight: 50,
  bottomLeft: 90
}
```

When the `array` length is three:

```js
const radius = [50, 90, 40];

//expected output
const corners = {
  topLeft: 50,
  topRight: 90,
  bottomRight: 40,
  bottomLeft: 1
}
```

When the `array` length is four it will copy it as is:

```js
const radius = [20, 30, 40, 50];

//expected output
const corners = {
  topLeft: 20,
  topRight: 30,
  bottomRight: 40,
  bottomLeft: 50
}
```

When the `array` length is something different than the first three examples:

```js
const radius = [20, 30, 40, 50];

//expected output
const corners = {
  topLeft: 20,
  topRight: 30,
  bottomRight: 40,
  bottomLeft: 50
}
```

### topLeft
You can set the radius of the topLeft corner with a `float`.

### topRight
You can set the radius of the topRight corner with a `float`.

### bottomRight
You can set the radius of the bottomRight corner with a `float`.

### bottomLeft
You can set the radius of the bottomLeft corner with a `float`.

### stroke
You can add a stroke to the Rounded Rectangle shader by setting a `float` bigger than 0.

### strokeColor
You can set the strokeColor with an `argb` value typically used in Lightning. Default is `0x00ffffff`

### fillColor
You can set the fillColor of the RoundedRectangle with an `argb` value typically used in Lightning. Default is `0xffffffff`.

### blend
The blend property allows you to use the Rounded Rectangle to blend with the texture. The expected value is a `float` that ranges from 0 - 1;


## Getters

### radius
returns the current `radius` values per corner.

### topLeft
returns the current value of the `topLeft` corner.

### topRight
returns the current value of the `topLeft` corner.

### bottomRight
returns the current value of the `topLeft` corner.

### bottomLeft
returns the current value of the `topLeft` corner.

### stroke
returns the current `stroke` value.

### strokeColor
returns the current `strokeColor` of the stroke.

### fillColor
returns the current `fillColor` of the Rounded Rectangle.

### blend
returns the current `blend` value.

## Examples

Visit the following site to see various examples of the Rounded Rectangle Shader.

<https://lightningjs.io/examples/#/shaders/rounded-rectangle>
