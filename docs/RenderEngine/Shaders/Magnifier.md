# Magnifier

The Magnifier shader magnifies a section of the to be rendered of the texture to be rendered.

## Usage

If you want to use shaders that come with the Lightning framework you need to import Lightning first.

```js
import Lightning from '@lightningjs/core'
```

### Initialize

To use the Magnifier shader you need to apply it to the shader property of an element:

```js
//in template
class MyApp extends Lightning.Application {
    static _template() {
        return {
            Picture: {w: 300, h: 300, src: 'MyImage.jpg', shader: {type: Lightning.shaders.Magnifier, w: 150, w: 120, x: 40, y: 20}}
        }
    }
}

//in a component
this.tag('Picture').shader = {type: Lightning.shaders.Magnifier, w: 150, w: 120, x: 40, y: 20}
```

You can customize the appearance of the Magnifier shader with the following setters.


## Setters

### w
You can set the width of the magnified section with a `float`,

### h
You can set the height of the magnified section with a `float`,

### x
You can set the x position where the magnified section should start with a `float`,

### y
You can set the y position where the magnified section should start with a `float`,

### radius
You can set the radius of the magnified section with a `float`. This shader only supports an even radius for each corner.


## Getters

### w
returns a `float` with the value of the width of the magnified section.

### h
returns a `float` with the value of the height of the magnified section.

### x
returns a `float` with the value of the x position of the magnified section.

### y
returns a `float` with the value of the y position of the magnified section.

### radius
returns a `float` with the value of the radius of the corners of the magnified section.

## Examples

Visit the following site to see various examples of the Rounded Rectangle Shader.

<https://lightningjs.io/examples/#/shaders/Magnifier>
