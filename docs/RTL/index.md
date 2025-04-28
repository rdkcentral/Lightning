# Right-to-left (RTL) support

Lightning applications may have to be localised for regions where the language is written from right to left, like Hebrew or Arabic. Users expect not only text to be correctly rendered, but also expect the whole application layout to be mirrored. For instance rails would be populated from right to left, and a side navigation on the left would appear on the right instead.

By opposition, the default application layout and text direction is called "left-to-right" (LTR).

RTL support encompasses 2 aspects:

- RTL layout support; which means mirroring the application layout,
- RTL text rendering support; which means accurately rendering (and wrapping) RTL text.

## How RTL layout works

To limit adaption effort for the application developer, Lightning has built-in and transparent support for RTL layout mirroring: leave `x` and flexbox directions as they are for LTR, and they will be interpreted automatically when RTL layout is enabled.

**There is however an important caveat:** in a LTR only application it is often possible to omit specifying a `w` for containers, but for automatic RTL mirroring to function, the widths need to be known, either through an explicit `w` or horizontal flexbox layout.

Here's a simplified diagram of the calculations:
![LTR vs RTL layout calculations](./ltr-rtl.png)

Lightning elements (and components) have a `rtl` property to hint whether the elements children layout should be mirrored.

In practice, setting the application's `rtl` flag will mirror the entire application, as the property is inherited. It is however possible to set some element's `rtl` to an explicit `false` to prevent mirroring of a sub-tree of the application.

The `rtl` flag will also mirror the text alignment: `left` and `right` alignment are automatically reversed. Note that this
alone doesn't mean RTL text is correctly rendered - see "Bidirectional text layout" below.

### How input works in RTL

A consequence of the choice of transparent mirroring is that the Left and Right key shoud be interpreted in accordance to the layout direction.

This is also automatic, and pressing a Left or Right key will result in the opposite Right or Left key event to be received by components when their layout is mirrored.

### How bidirectional text layout works

When working with RTL languages, we must support any combinations of LTR and RTL text: numbers and some words aren't translated; you may even have entire sentences untranslated.

Correctly rendering RTL text requires to support "bidirectional text layout", which is an advanced feature you must opt-in to.

```typescript
import { TextTexture, TextTokenizer } from '@lightningjs/core';
import { getBidiTokenizer } from '@lightningjs/core/bidiTokenizer';

// Initialize bidi text support
TextTokenizer.setCustomTokenizer(getBidiTokenizer());

// Only the "advanced renderer" supports bidi layout
TextTexture.forceAdvancedRenderer = true; 
```
