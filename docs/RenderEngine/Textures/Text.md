# Text

The *text* texture enables the rendering of a piece of text within an element.

You can use various properties to control the way in which you want to render text.

## Properties

| Name | Type | Default | Description |
|---|---|---|---|
| `text` | String | '' | Text to display |
| `fontFace` | Integer | null | Font family used for current text |
| `fontSize` | Integer | 40 | Font size |
| `fontStyle` | String | 'normal' | Font style |
| `lineHeight` | Integer | null | Line height |
| `textAlign` | String | 'left' | Text alignment. Possible values: 'left', 'right', 'center' |
| `verticalAlign` | String | 'top' | If `lineHeight` is larger than `fontSize`, this value specifies how text should be aligned vertically inside each line. Possible values: 'top', 'middle', 'bottom' |
| `wordWrap` | Boolean | true | Allows long sentences to be broken into new lines |
| `maxLines` | Integer | 0 | Maximum number of lines to display before truncation |
| `maxLinesSuffix` | String | '..' | String to be displayed at the end of the line when truncation is used |
| `wordWrapWidth` | Integer | 0 | Width that is set for text wrapping to next line |
| `textOverflow` | String | null (disabled) | Truncates long blocks of text to the size specified in `wordWrapWidth`. Is active if `wordWrap` is set to `false`. Possible values: 'ellipsis': string ends with `maxLinesSuffix`, 'clip': no suffix, 'custom string': string ends with user-defined string |
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

## Code Example

```js
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