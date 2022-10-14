# Spinner2

The Spinner2 shader allows you to draw a loading / spinner icon on the screen. The Spinner2 shader is a successor to the Spinner shader which we do not recommend you use, its namespace however remains for backward compatibility.

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
            RoundedRectangle: {w: 300, h: 300, rect: true, shader: {type: Lightning.shaders.Spinner2, stroke: 20}}
        }
    }
}

//in a component
this.tag('RoundedRectangle').shader = {type: Lightning.shaders.Spinner2, stroke: 20}
```

You can customize the appearance of the Spinner shader with the following setters.

## Setters

### radius
You can set the radius of the Spinner shader with a `float`. By default, this is calculated by dividing the current width by 2.

### stroke
You can set the width of the spinner with the stroke property setting a `float`.

### color
You can set the color with an `argb` value typically used in Lightning. Default is `0xffffffff`

### backgroundColor
You can set the backgroundColor of the spinner with an `argb` value typically used in Lightning. Default is `0xff000000`.

### showDot
You can show a dot where the shader starts to draw by setting a `boolean`.

### clockwise
You can set if the spinner should spin clockwise or counter-clockwise by setting a `boolean`.

### period
You can set the speed at which the spinner spins by setting a `float`.

## Getters

### radius
returns the current `radius` value.

### stroke
returns the current `stroke` value.

### color
returns the current `color` of the spinner.

### backgroundColor
returns the current `backgroundColor` of the spinner.

### showDot
returns the current `showDot` value.

### clockwise
returns the current `clockwise` value.

### period
returns the current `period` value.

## Examples

Visit the following site to see various examples of the Spinner2 Shader.

<https://lightningjs.io/examples/#/shaders/spinner>
