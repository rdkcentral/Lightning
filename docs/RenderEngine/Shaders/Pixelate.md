# Pixelate

With the Pixelate shader, you can pixelate the texture to be rendered with a specific pixel size.

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
            Picture: {w: 300, h: 300, src: 'MyImage.jpg', shader: {type: Lightning.shaders.Pixelate, size: 20}}
        }
    }
}

//in a component
this.tag('Picture').shader = {type: Lightning.shaders.Pixelate, size: 20}
```

You can customize the appearance of the Pixelate shader with the following setters.


## Setters

### size
You can set the size of the pixels in the Pixelate shader with a `float` value.

### x
You can set the width of the pixel with a `float`.

### y
You can set the height of the pixel with a `float`.

## Getters

### size
returns a `float` with the value of the size.

### x
returns the current `width` of the pixel size.

### y
returns the current `height` of the pixel size.


## Examples

Visit the following site to see various examples of the Rounded Rectangle Shader.

<https://lightningjs.io/examples/#/shaders/pixelate>
