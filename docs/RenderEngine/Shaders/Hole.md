# Hole

The Hole shader cuts a rectangle out of the texture. This can be used when you want to show something like live TV or a video in the background but still want a good looking background around it.

## Usage

If you want to use shaders that come with the Lightning framework you need to import Lightning first.

```js
import Lightning from '@lightningjs/core'
```

### Initialize

To use the Hole shader you need to apply it to the shader property of an element:

```js
//in template
class MyApp extends Lightning.Application {
    static _template() {
        return {
            Hole: {
                w: 300,
                h: 300,
                rect: true,
                shader: {
                    type: Lightning.shaders.Hole,
                    w: 150,
                    w: 120,
                    x: 40,
                    y: 20
                }
            }
        }
    }
}

//in a component
this.tag('Hole').shader = {type: Lightning.shaders.Hole, w: 150, w: 120, x: 40, y: 20}
```

**Important:** In most cases, the Element or Component that the shader is applied to must have an explicitly defined `w` and `h`. Image Elements do not require this as their `w` and `h` are automatically set to the dimensions of the loaded image.

You can customize the appearance of the Hole shader with the following setters.


## Setters

### w
You can set the width of the Hole shader with a `float`,

### h
You can set the height of the Hole shader with a `float`,

### x
You can set the x position where Hole shader should start the cutout with a `float`,

### y
You can set the y position where Hole shader should start the cutout with a `float`,

### radius
You can set the radius of the cutout with a `float`. This shader only supports an even radius for each corner.


## Getters

### w
returns a `float` with the value of the width of the cutout.

### h
returns a `float` with the value of the height of the cutout.

### x
returns a `float` with the value of the x position of the cutout.

### y
returns a `float` with the value of the y position of the cutout.

### radius
returns a `float` with the value of the radius of the corners of the cutout.

## Examples

Visit the following site to see various examples of the Rounded Rectangle Shader.

<https://lightningjs.io/examples/#/shaders/hole-punch>
