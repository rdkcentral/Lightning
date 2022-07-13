# Shaders

Shaders in Lightning allow you to alter textures, or draw various effects over the GPU. By default, the Lightning Core provides shaders that apply some of the most commonly used effects for you to use.

## Usage

If you want to use shaders that come with the Lightning framework you need to import Lightning first.

```js
import Lightning from '@lightningjs/core'
```

### Initialize

To use a shader you need to apply a type to the shader property of an element:

```js
//in template
class MyApp extends Lightning.Application {
    static _template() {
        return {
            Box: {w: 300, h: 300, rect: true, shader: {type: Lightning.shaders.RoundedRectangle, radius: 20}}
        }
    }
}

//in a component
this.tag('Box').shader = {type: Lightning.shaders.RoundedRectangle, radius: 20}
```

Most of the shaders we provide have a selection of setters for you to customize the effect with, visit the available documentation for more information.

### Animating

You can animate shaders by addressing the shader property of an element. For example, if you want to change the radius of a Rounded Rectangle:

```js
const myAnimation = this.tag('Box').animation({
  actions: [
      {p: 'shader.radius', v: {0: 0, 1: 20}},
  ]
});
```
