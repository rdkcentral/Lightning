# Fade Out

The Fade Out shader fades out the edges of a texture by a specific amount.

## Usage

If you want to use shaders that come with the Lightning framework you need to import Lightning first.

```js
import Lightning from '@lightningjs/core'
```

### Initialize

To use the Fade Out shader you need to apply it to the shader property of an element:

```js
//in template
class MyApp extends Lightning.Application {
    static _template() {
        return {
            FadeOut: {w: 300, h: 300, rect: true, shader: {type: Lightning.shaders.FadeOut, fade: 20}}
        }
    }
}

//in a component
this.tag('FadeOut').shader = {type: Lightning.shaders.FadeOut, fade: 20}
```

You can customize the appearance of the Fade Out shader with the following setters.


## Setters

### fade
You can set the fade of the Fade Out shader with a `float` or an `array`.

When a `float` value is given the shader will appoint that value to each corner of the rectangle. When an `array` is given the shader checks the length of the given array in order to appoint the correct value to each corner.

When the `array` length is two:

```js
const fade = [50, 90];

//expected output
const edges = {
  top: 50,
  right: 90,
  bottom: 50,
  left: 90
}
```

When the `array` length is three:

```js
const fade = [50, 90, 40];

//expected output
const edges = {
  top: 50,
  right: 90,
  bottom: 40,
  left: 0
}
```

When the `array` length is four it will copy it as is:

```js
const fade = [20, 30, 40, 50];

//expected output
const edge = {
  top: 20,
  right: 30,
  bottom: 40,
  left: 50
}
```

When the `array` length is something different then the first three examples:

```js
const fade = [20, 30, 40, 50];

//expected output
const corners = {
  top: 20,
  right: 30,
  bottom: 40,
  left: 50
}
```

### top
You can set the fade value of the top edge a `float`.

### right
You can set the fade value of the right edge a `float`.

### bottom
You can set the fade value of the bottom edge a `float`.

### right
You can set the fade value of the right edge a `float`.


## Getters

### fade
returns the current `fade` values of the edges.

### top
returns the current fade value of the `top` edge.

### right
returns the current fade value of the `right` edge.

### bottom
returns the current fade value of the `bottom` edge.

### right
returns the current fade value of the `right` edge.

## Examples

Visit the following site to see various examples of the Fade Out Shader.

<https://lightningjs.io/examples/#/shaders/fade-out>
