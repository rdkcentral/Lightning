/*
 * If not stated otherwise in this file or this component's LICENSE file the
 * following copyright and licenses apply:
 *
 * Copyright 2022 Metrological
 *
 * Licensed under the Apache License, Version 2.0 (the License);
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import Stage from "../tree/Stage.mjs";
import Texture from "../tree/Texture.mjs";
import TextTextureRenderer from "./TextTextureRenderer.mjs";
import TextTextureRendererAdvanced from "./TextTextureRendererAdvanced.mjs";

declare namespace TextTexture {
  /**
   * Text Overflow Values
   */
  export type TextOverflow = 'ellipsis' | 'clip' | (string & Record<never, never>);

  /***
   * Text Horizontal Align Values
   */
  export type TextAlign = 'left' | 'center' | 'right';

  /***
   * Text Baseline Values
   */
  export type TextBaseline =
    | 'alphabetic'
    | 'top'
    | 'hanging'
    | 'middle'
    | 'ideographic'
    | 'bottom';

  /***
   * Text Vertical Align Values
   */
  export type TextVerticalAlign = 'top' | 'middle' | 'bottom';

  /**
   * Text Texture Settings
   */
  export interface Settings extends Texture.Settings {
    type?: typeof TextTexture,
    /**
     * Text to display
     *
     * @defaultValue `""`
     */
    text?: string;
    /**
     * Font style
     *
     * @defaultValue `"normal"`
     */
    fontStyle?: string;
    /**
     * Font size (in pixels)
     *
     * @defaultValue `40`
     */
    fontSize?: number;
    /**
     * Font baseline ratio (Advanced Text Renderer only)
     *
     * @remarks
     * This can be used to improve vertical text alignment when using the Advanced Text Renderer.
     *
     * You MUST enable {@link advancedRenderer} in order to use this.
     *
     * See [PR #378](https://github.com/rdkcentral/Lightning/pull/378) for more information
     * about this feature.
     *
     * To calculate the ratio for a particular font face, you can do this calculation from font metadata:
     * ```
     *     (head.unitsPerEm − hhea.Ascender − hhea.Descender) / (2 × head.unitsPerEm)
     * ```
     *
     * This give you the ratio for the baseline, which is then used to figure out
     * where the baseline is relative to the bottom of the text bounding box.
     *
     * The input values can be retrieved using the [opentype.js Font Inspector](https://opentype.js.org/font-inspector.html).
     *
     * @defaultValue `0`
     */
    fontBaselineRatio?: number;
    /**
     * Font family
     *
     * @remarks
     * If an array is provided, font families that appear later in the array are used as fallbacks. If the
     * (default) `null` value is specified, the font family value specified in the `defaultFontFace`
     * {@link Stage.Options.defaultFontFace Stage Option} is used. If the resolved font
     * family (or families) is unavailable to the browser, a fallback is chosen by the browser. The special
     * [CSS defined font family values](https://developer.mozilla.org/en-US/docs/Web/CSS/font-family#values)
     * of "serif" and "sans-serif" may be used as well.
     *
     * @defaultValue `null` (uses {@link Stage.Options.defaultFontFace})
     */
    fontFace?: string | string[] | null;
    /**
     * Word wrap mode
     *
     * @remarks
     * When enabled (default), long lines that exceed {@link wordWrapWidth} will be be broken into new lines.
     *
     * @defaultValue `true`
     */
    wordWrap?: boolean;
    /**
     * Word wrap width (in pixels)
     *
     * @remarks
     * - When {@link wordWrap} is enabled:
     *   - Long lines that exceed this width will be broken into new lines.
     * - When {@link wordWrap} is disabled AND when {@link textOverflow} is enabled:
     *   - Text that exceeds this width will be truncated.
     *
     * @defaultValue `0`
     */
    wordWrapWidth?: number;
    /**
     * Word Breaking mode (Advanced Text Renderer only)
     *
     * @remarks
     * When enabled, words that overflow the set width of the texture will
     * be broken to another line.
     *
     * You MUST enable {@link advancedRenderer} in order to use this.
     *
     * @defaultValue `false`
     */
    wordBreak?: boolean;
    /**
     * Text overflow mode
     *
     * @remarks
     * When enabled, truncates long blocks of text with a suffix (like "..") to the size specified in
     * {@link wordWrapWidth}. {@link wordWrap} must be *disabled* for this to work.
     *
     * Values
     * - `"ellipsis"`: Truncated text will end in {@link maxLinesSuffix}.
     * - `"clip"`: Truncated text will not end in a suffix.
     * - any `string`: Truncated text will end in this user-defined suffix.
     *
     * @defaultValue `null` (disabled)
     */
    textOverflow?: TextOverflow | null;
    /**
     * Line height (in pixels)
     *
     * @defaultValue `null`
     */
    lineHeight?: number | null;
    /**
     * Text baseline
     *
     * @remarks
     * See [`CanvasRenderingContext2D.textBaseline` (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/textBaseline)
     * for the available options.
     *
     * @defaultValue `"alphabetic"`
     */
    textBaseline?: TextBaseline;
    /**
     * Horizontal text alignment
     *
     * @defaultValue `"left"`
     */
    textAlign?: TextAlign;
    /**
     * Vertical text aligment
     *
     * @remarks
     * If lineHeight is larger than fontSize, this value specifies how text should be aligned vertically
     * inside each line.
     *
     * @defaultValue `"top"`
     */
    verticalAlign?: TextVerticalAlign;
    /**
     * Text Y offset (in pixels)
     *
     * @remarks
     * Translates the position of rendered text along the Y-axis.
     *
     * This value must be equal to at least the {@link fontSize} (which is the default) for the first line of
     * text to be completely visible in the texture. If set to `0`, the first line of text will be completely
     * clipped.
     *
     * @defaultValue `null` (fontSize)
     */
    offsetY?: number | null;
    /**
     * Maximum number of lines to display before truncation
     *
     * @remarks
     * If this is set to a value greater than 0, multiline text will be truncated
     * at this number of lines. The {@link maxLinesSuffix} will be inserted at the
     * end of the last rendered line of text.
     *
     * @defaultValue `0` (line truncation disabled)
     */
    maxLines?: number;
    /**
     * String rendered at the end of a truncated line of text
     *
     * @remarks
     * This suffix is used in the following situations:
     * - {@link maxLines} is enabled and is exceeded.
     * - {@link wordWrap} is disabled, {@link textOverflow} is set to `"ellipsis"`,
     *   and {@link wordWrapWidth} is exceeded.
     *
     * @defaultValue `".."`
     */
    maxLinesSuffix?: string;
    /**
     * Render precision of text
     *
     * @see {@link Stage.Options.precision}
     *
     * @defaultValue {@link Stage.Options.precision} stage option
     */
    precision?: number;
    /**
     * Text color
     *
     * @defaultValue `0xFFFFFFFF` (white)
     */
    textColor?: number;
    /**
     * Padding left (in pixels)
     *
     * @remarks
     * Using this will result in a larger texture size allocation.
     */
    paddingLeft?: number;
    /**
     * Padding right (in pixels)
     *
     * @remarks
     * Using this will result in a larger texture size allocation.
     */
    paddingRight?: number;
    /**
     * Text shadow mode
     *
     * @remarks
     * If set, enables a text shadow behind the rendered text controlled by these properties:
     * - {@link shadowColor}.
     * - {@link shadowOffsetX}.
     * - {@link shadowOffsetY}.
     * - {@link shadowBlur}.
     *
     * See [CanvasRenderingContext2D - Shadows (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D#shadows)
     * for more information on the properties that determine shadows.
     *
     * @defaultValue `false`
     */
    shadow?: boolean;
    /**
     * Text shadow color
     *
     * @remarks
     * {@link shadow} must be enabled for this property to have any affect.
     *
     * See [`CanvasRenderingContext2D.shadowColor` (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/shadowColor)
     * for more information on this property.
     *
     * @defaultValue `0xFF000000` (black)
     */
    shadowColor?: number;
    /**
     * Text shadow X offset (in pixels)
     *
     * @remarks
     * {@link shadow} must be enabled for this property to have any affect.
     *
     * See [`CanvasRenderingContext2D.shadowOffsetX` (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/shadowOffsetX)
     * for more information on this property.
     *
     * @defaultValue `0`
     */
    shadowOffsetX?: number;
    /**
     * Text shadow Y offset
     *
     * @remarks
     * {@link shadow} must be enabled for this property to have any affect.
     *
     * See [`CanvasRenderingContext2D.shadowOffsetY` (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/shadowOffsetY)
     * for more information on this property.
     *
     * @defaultValue `0`
     */
    shadowOffsetY?: number;
    /**
     * Text shadow blur iterations
     *
     * @remarks
     * {@link shadow} must be enabled for this property to have any affect.
     *
     * See [`CanvasRenderingContext2D.shadowBlur` (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/shadowBlur)
     * for more information on this property.
     *
     * @defaultValue `5`
     */
    shadowBlur?: number;
    /**
     * Highlight mode
     *
     * @remarks
     * If set, enables a solid color highlight behind the rendered text controlled by these properties:
     * - {@link highlightColor}.
     * - {@link highlightHeight}.
     * - {@link highlightOffset}.
     * - {@link highlightPaddingLeft}.
     * - {@link highlightPaddingRight}.
     *
     * @defaultValue `false`
     */
    highlight?: boolean;
    /**
     * Highlight height (in pixels)
     *
     * @remarks
     * {@link highlight} must be enabled for this property to have any affect.
     *
     * @defaultValue `0` ({@link fontSize} multiplied by 1.5)
     */
    highlightHeight?: number;
    /**
     * Highlight color
     *
     * @remarks
     * {@link highlight} must be enabled for this property to have any affect.
     *
     * @defaultValue `0xFF000000` (black)
     */
    highlightColor?: number;
    /**
     * Highlight Y offset (in pixels)
     *
     * @remarks
     * Shifts the rendered highlight blocks down the Y-axis.
     *
     * {@link highlight} must be enabled for this property to have any affect.
     *
     * @defaultValue `0`
     */
    highlightOffset?: number;
    /**
     * Highlight left padding (in pixels)
     *
     * @remarks
     * - If `> 0`:
     *   - Adds additional highlight to the left of each highlighted line.
     * - If `< 0`:
     *   - Removes highlight from the left side of each highlighted line.
     *
     * {@link highlight} must be enabled for this property to have any affect.
     *
     * @defaultValue `0`
     */
    highlightPaddingLeft?: number;
    /**
     * Highlight right padding (in pixels)
     *
     * @remarks
     * - If `> 0`:
     *   - Adds additional highlight to the right of each highlighted line.
     * - If `< 0`:
     *   - Removes highlight from the right side of each highlighted line.
     *
     * {@link highlight} must be enabled for this property to have any affect.
     *
     * @defaultValue `0`
     */
    highlightPaddingRight?: number;
    /**
     * Spacing between letters
     *
     * @remarks
     * Adds or removes spacing between letters. Negative values are allowed.
     *
     * Warning: Setting this to anything but `0` can slow down the rendering of text.
     *
     * @defaultValue `0` (disabled)
     */
    letterSpacing?: number;
    /**
     * Indent of the first line of text (in pixels)
     *
     * @defaultValue `0`
     */
    textIndent?: number;
    /**
     * X coordinate of text cutting start position (in pixels)
     *
     * @defaultValue `0`
     */
    cutSx?: number;
     /**
      * Y coordinate of text cutting start position (in pixels)
      *
      * @defaultValue `0`
      */
    cutSy?: number;
    /**
     * X coordinate of text cutting end position (in pixels)
     *
     * @defaultValue `0`
     */
    cutEx?: number;
    /**
     * Y coordinate of text cutting end position (in pixels)
     *
     * @defaultValue `0`
     */
    cutEy?: number;
    /**
     * Enables the Advanced Text Renderer
     *
     * @remarks
     * The Advanced Text Renderer adds support for:
     * - `<b>` tag for bold text
     *   - Example: `<b>This is bold</b>`
     * - `<i>` tag for italics text
     *   - Example: `<i>This is italics</i>`
     * - `<color=$ARGB>` tag for colored text
     *   - Example: `<color=0xff00ff00>This is green</color>`
     * - Enables the use of {@link wordBreak}
     *
     * See: https://github.com/rdkcentral/Lightning/pull/318 for more details
     *
     * @defaultValue false
     * @see
     */
    advancedRenderer?: boolean;
  }
}

declare class TextTexture extends Texture implements Required<Omit<TextTexture.Settings, 'type'>> {
  constructor(stage: Stage);

  protected static renderer(
    stage: Stage,
    canvas: HTMLCanvasElement,
    settings: TextTexture.Settings
  ): TextTextureRenderer | TextTextureRendererAdvanced;

  // protected _changed(): void;
  // protected stage: Stage;
  // cloneArgs(): Required<TextTexture.Settings>;
  // - Internal Types


  get text(): string;
  set text(text: string);

  get fontStyle(): string;
  set fontStyle(fontStyle: string);

  get fontSize(): number;
  set fontSize(fontSize: number);

  get fontBaselineRatio(): number;
  set fontBaselineRatio(fontBaselineRatio: number);

  get fontFace(): string;
  set fontFace(fontFace: string);

  get wordWrap(): boolean;
  set wordWrap(wordWrap: boolean);

  get wordWrapWidth(): number;
  set wordWrapWidth(wordWrapWidth: number);

  get wordBreak(): boolean;
  set wordBreak(wordBreak: boolean);

  get textOverflow(): TextTexture.TextOverflow;
  set textOverflow(textOverflow: TextTexture.TextOverflow);

  get lineHeight(): number;
  set lineHeight(lineHeight: number);

  get textBaseline(): TextTexture.TextBaseline;
  set textBaseline(textBaseline: TextTexture.TextBaseline);

  get textAlign(): TextTexture.TextAlign;
  set textAlign(textAlign: TextTexture.TextAlign);

  get verticalAlign(): TextTexture.TextVerticalAlign;
  set verticalAlign(verticalAlign: TextTexture.TextVerticalAlign);

  get offsetY(): number | null;
  set offsetY(offsetY: number | null);

  get maxLines(): number;
  set maxLines(maxLines: number);

  get maxLinesSuffix(): string;
  set maxLinesSuffix(maxLinesSuffix: string);

  get precision(): number;
  set precision(precision: number);

  get textColor(): number;
  set textColor(textColor: number);

  get paddingLeft(): number;
  set paddingLeft(paddingLeft: number);

  get paddingRight(): number;
  set paddingRight(paddingRight: number);

  get shadow(): boolean;
  set shadow(shadow: boolean);

  get shadowColor(): number;
  set shadowColor(shadowColor: number);

  get shadowOffsetX(): number;
  set shadowOffsetX(shadowOffsetX: number);

  get shadowOffsetY(): number;
  set shadowOffsetY(shadowOffsetY: number);

  get shadowBlur(): number;
  set shadowBlur(shadowBlur: number);

  get highlight(): boolean;
  set highlight(highlight: boolean);

  get highlightHeight(): number;
  set highlightHeight(highlightHeight: number);

  get highlightColor(): number;
  set highlightColor(highlightColor: number);

  get highlightOffset(): number;
  set highlightOffset(highlightOffset: number);

  get highlightPaddingLeft(): number;
  set highlightPaddingLeft(highlightPaddingLeft: number);

  get highlightPaddingRight(): number;
  set highlightPaddingRight(highlightPaddingRight: number);

  get letterSpacing(): number;
  set letterSpacing(letterSpacing: number);

  get textIndent(): number;
  set textIndent(textIndent: number);

  get cutEx(): number;
  set cutEx(cutEx: number);

  get cutEy(): number;
  set cutEy(cutEy: number);

  get cutSx(): number;
  set cutSx(cutSx: number);

  get cutSy(): number;
  set cutSy(cutSy: number);

  get advancedRenderer(): boolean;
  set advancedRenderer(advancedRenderer: boolean);
}

export default TextTexture;
