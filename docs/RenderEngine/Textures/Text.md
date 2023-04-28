# Text


The *text* texture enables the rendering of a piece of text within an element.


You can use various properties to control the way in which you want to render text.

## Properties

| Name | Type | Default | Description |
|---|---|---|---|
| `text` | String | '' | Text to display |
| `fontFace` | String or String[] | `null` | Font family used for current text. If an array is provided, font families that appear later in the array are used as fallbacks. If the (default) `null` value is specified, the font family value specified in the `defaultFontFace` [Stage Option](../../RuntimeConfig/index.md#stage-configuration-options) is used. If the resolved font family (or families) is unavailable to the browser, a fallback is chosen by the browser. The special [CSS defined font family values](https://developer.mozilla.org/en-US/docs/Web/CSS/font-family#values) of "serif" and "sans-serif" may be used as well. |
| `fontSize` | Integer | 40 | Font size |
| `fontStyle` | String | 'normal' | Font style |
| `lineHeight` | Integer | null | Line height |
| `textAlign` | String | 'left' | Text alignment. Possible values: 'left', 'right', 'center' |
| `verticalAlign` | String | 'top' | If `lineHeight` is larger than `fontSize`, this value specifies how text should be aligned vertically inside each line. Possible values: 'top', 'middle', 'bottom' |
| `wordWrap` | Boolean | true | Allows long sentences to be broken into new lines |
| `maxLines` | Integer | 0 | Maximum number of lines to display before truncation |
| `maxLinesSuffix` | String | '..' | String to be displayed at the end of the line when truncation is used |
| `wordWrapWidth` | Integer | 0 | Width that is set for text wrapping to next line |
| `textOverflow` | String | null (disabled) | Truncates long blocks of text to the size specified in `wordWrapWidth`. Is active if `wordWrap` is set to 'false'. Possible values: 'ellipsis': string ends with `maxLinesSuffix`, 'clip': no suffix, 'custom string': string ends with user-defined string |
| `textBaseline` | String | 'alphabetic' | Desired text baseline |
| `textColor` | Hex | 0xFFFFFFFF | Desired text color |
| `paddingLeft` | Integer | 0 | Padding left |
| `paddingRight` | Integer | 0 | Padding right |
| `highlight` | Boolean | false | Enables highlight |
| `highlightColor` | Hex | 0xFF000000 | Highlight color |
| `highlightOffset` | Integer | 0 | Highlight offset |
| `highlightPaddingLeft` | Integer | 0 | Highlight padding left |
| `highlightPaddingRight` | Integer | 0 | Highlight padding right |
| `offsetX` | Integer | 0 | Text offset on x-axis |
| `offsetY` | Integer | 0 | Text offset on y-axis |
| `shadow` | Boolean | false | Enables text shadow |
| `shadowColor` | Hex | 0xFF000000 | Text shadow color |
| `shadowOffsetX` | Integer | 0 | Text shadow offset x |
| `shadowOffsetY` | Integer | 0 | Text shadow offset y |
| `shadowBlur` | Integer | 5 | Text shadow blur iterations |
| `cutSx` | Integer | 0 | x coordinate of text cutting starting position |
| `cutEx` | Integer | 0 | x coordinate of text cutting ending position |
| `cutSy` | Integer | 0 | y coordinate of text cutting starting position |
| `cutEy` | Integer | 0 | y coordinate of text cutting ending position |
| `letterSpacing` | Integer | 0 | Letter spacing of characters |


## Word Wrap in Non-Latin Based Languages

Enabling the `wordWrap` option causes lines of text that are too long for the
specified `wordWrapWidth` to be broken into multiple lines. Lines are broken
only at word boundaries. In most latin script based languages (i.e. English,
Dutch, French, etc) the space " " character is the primary separator of word
boundaries.

Many non-latin based languages (i.e. Chinese, Japanese, Thai and more) do not use spaces
to separate words. Instead there is an assortment of rules that determine where
word boundaries, for the purpose of line breaking, are allowed. Lightning
currently does not implement these rules as there are many languages and writing
systems to consider when implementing them. However, we do offer a work around
that can be employed in your application as needed.

### Zero-Width Spaces

Lightning supports line breaking at [Zero-Width Space](https://en.wikipedia.org/wiki/Zero-width_space)
(Unicode: `\u200B`) word boundaries. These characters are like normal spaces but
take up no actual space between visible characers. You can use them in
your text strings and Lightning will line break on them when it needs to.

You may want to write a function that you funnel all of your application's
text strings into:

```js
function addZeroWidthSpaces(text) {
    // Code that inserts Zero-Width Spaces into text and returns the new text
}

class ZeroWidthSpaceTextDemo extends lng.Application {
    static _template() {
        return {
            Text: {
                text: {
                    text: addZeroWidthSpaces('こんにちは。初めまして!')
                }
            }
        }
    }
}
```

See [this GitHub issue](https://github.com/rdkcentral/Lightning/issues/450) for
more information.

## Live Demo


```
class TextDemo extends lng.Application {
    static _template() {
        return {
            x: 50,
            y: 50,
            Text: {
                text: {
                    fontSize: 36,
                    textAlign: 'center',
                    maxLines: 2,
                    text: 'Text a little too long so this part won\'t be visible',
                    wordWrapWidth: 180,
                    textColor: 0xffff00ff,
                }
            },
            Text2: {
                x: 150,
                y: 100,
                text: {
                    fontSize: 60,
                    text: 'STYLE IT UP! ',
                    fontStyle: 'italic bold',
                    textColor: 0xff00ffff,
                    shadow: true,
                    shadowColor: 0xffff00ff,
                    shadowOffsetX: 2,
                    shadowOffsetY: 2,
                    shadowBlur: 2,
                }
            },
            Text3: {
                mountX: 1,
                x: 530,
                y: 230,
                text: {
                    fontSize: 48,
                    textAlign: 'right',
                    text: 'you can also add\nline breaks\nusing\n\\n!',
                    lineHeight: 80,
                }
            },
        }
    }
}

const options = {stage: {w: window.innerWidth, h: window.innerHeight, useImageWorker: false}};
const App = new TextDemo(options);
document.body.appendChild(App.stage.getCanvas());
```
