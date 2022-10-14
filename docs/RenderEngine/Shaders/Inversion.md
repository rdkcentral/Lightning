# Inversion

With the Inversion shader, you can invert the colors of the texture to be rendered with a specific amount.

## Usage

If you want to use shaders that come with the Lightning framework you need to import Lightning first.

```js
import Lightning from '@lightningjs/core'
```

### Initialize

To use the Inversion shader you need to apply it to the shader property of an element:

```js
//in template
class MyApp extends Lightning.Application {
    static _template() {
        return {
            Picture: {w: 300, h: 300, src: 'MyImage.jpg', shader: {type: Lightning.shaders.Inversion, amount: 3}}
        }
    }
}

//in a component
this.tag('Picture').shader = {type: Lightning.shaders.Inversion, amount: 2}
```

You can customize the appearance of the Inversion shader with the following setters.


## Setters

### amount
You can set the inversion amount with a `float` value.

## Getters

### amount
returns the current inversion `amount` value.


## Examples

Visit the following site to see various examples of the Rounded Rectangle Shader.

<https://lightningjs.io/examples/#/shaders/inversion>
