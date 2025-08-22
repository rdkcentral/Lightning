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

### Text direction detection, control and isolation

#### Direction detection

By default the text renderer behaves as HTML `dir=auto`, which means it will detect the primary text direction to render text from the left or the right, while the text can be a combination of different directions. 

This detection will consider strongly directional characters, which means that text starting with numbers (weak LTR) followed by RTL letters will be considered all RTL (numbers will still be rendered LTR themselves).

#### Isolation

Sometimes a text is a concatenation of multiple labels or sentences, like `{title} {description}` or `{tag 1} {tag 2} {tag 3}`, where each part could be either LTR or RTL text.

Problems which can happen:

- By default, the primary text direction will be detected and will determine how the whole will be rendered; if the 1st part is detected LTR, the text will look incorrectly rendered in a RTL app layout,
- Parts can interact between each other: `90 {minutes} 90 {minutes in Hebrew}` would consider the 2nd `90` to be part of the initial LTR text.

The solution is to use:

- A strong direction isolate, to ensure the text is generally layed out in the UI direction, 
- An auto-detection isolate wrapping each part, to ensure each part is individually detected and rendered correctly.

Sample code:

```typescript
/** Left-to-Right Isolate ('ltr') */
export const LRI = '\u2066';
/** Right-to-Left Isolate ('rtl') */
export const RLI = '\u2067';
/** First Strong Isolate ('auto') */
export const FSI = '\u2068';
/** Pop Directional Isolate */
export const PDI = '\u2069';

/**
 * Isolate text to avoid interactions with surrounding
 * @param rtl - App direction
 * @param text - label to isolate
 */
export function isolateText(rtl: boolean, text: string): string {
  if (rtl) {
    return `${FSI}${text}${PDI}`;
  }
  return text;
}

/**
 * Concatenate isolated bidirectional text parts, while enforcing a general layout direction
 * @param rtl - App direction
 * @param parts - labels to isolate and concatenate
 */
export function concatenateIsolates(rtl: boolean, parts: (string | undefined)[]): string {
  if (rtl) {
    return RLI + FSI + parts.filter(Boolean).join(PDI + ' ' + FSI) + PDI + PDI;
  }
  // When app is LTR we don't load the bidi-tokenizer and don't expect RTL sentences,
  // otherwise, follow the code above with a LRI isolate
  return parts.filter(Boolean).join(' ');
}
```
