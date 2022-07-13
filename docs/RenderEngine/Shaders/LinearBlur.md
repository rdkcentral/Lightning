# Linear Blur

With the Linear Blur shader, you can add a linear blur effect to the texture to be rendered.

## Usage

If you want to use shaders that come with the Lightning framework you need to import Lightning first.

```js
import Lightning from '@lightningjs/core'
```

### Initialize

To use the Pixelate shader you need to apply it to the shader property of an element:

```js
//in template
class MyApp extends Lightning.Application {
    static _template() {
        return {
            Picture: {w: 300, h: 300, src: 'MyImage.jpg', shader: {type: Lightning.shaders.LinearBlur, x: 20}}
        }
    }
}

//in a component
this.tag('Picture').shader = {type: Lightning.shaders.LinearBlur, x: 20}
```

You can customize the appearance of the Linear Blur shader with the following setters.


## Setters

### x
You can the blur steps over the X-axis with a `float`

### y
You can the blur steps over the Y-axis with a `float`

## Getters

### x
returns the current `x` of blur steps over the X-axis.

### y
returns the current `y` of blur steps over the Y-axis.


## Examples

Visit the following site to see various examples of the Rounded Rectangle Shader.

<https://lightningjs.io/examples/#/shaders/linear-blur>
