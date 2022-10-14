# Dithering

With the Dithering shader, you can add a graining effect to the texture to be rendered.

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
            Picture: {w: 300, h: 300, src: 'MyImage.jpg', shader: {type: Lightning.shaders.Dithering, graining: 0.3}}
        }
    }
}

//in a component
this.tag('Picture').shader = {type: Lightning.shaders.Dithering, graining: 0.2}
```

You can customize the appearance of the Dithering shader with the following setters.

## Setters

### graining
You can set the graining value with a `float`.

### random
You can set if the graining should be random every time the shader is generated with a `boolean`.

## Getters

### graining
returns the current `graining` value.

### random
returns the current `random` value.

## Examples

Visit the following site to see various examples of the Rounded Rectangle Shader.

<https://lightningjs.io/examples/#/shaders/dithering>
