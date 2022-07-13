# Elements


The Lightning Render Tree consists of several *elements*. Elements are render primitives of the `lng.Element` type that determines the display of a [texture](../Textures/index.md). A texture can be anything, such as a piece of text or an image, in a solid color or a gradient.

> An element will only show something when you have a texture attached to it.


You use element *properties* to set an element's position and appearance in the following ways:

* Define the [positioning](Positioning.md) of an element using coordinates, dimensions and mountpoints, *relative to its parent*
* Use [transform](Transform.md) properties to scale or rotate an element
* Use [rendering](Rendering.md) properties to define *if* and *how* the element is rendered.
* Use [children](Children.md) properties to change the current configuration of child nodes.