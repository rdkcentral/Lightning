import Stage from "../tree/Stage.mjs";
import Texture from "../tree/Texture.mjs";
import TextTextureRenderer from "./TextTextureRenderer.mjs";

declare namespace TextTexture {
  /**
   * ???
   */
  export type TextOverflow = 'ellipsis' | 'clip' | (string & Record<never, never>);

  /**
   * ???
   */
  export type TextAlign = 'left' | 'center' | 'right';

  /***
   * ???
   */
  export type TextBaseline =
    | 'alphabetic'
    | 'top'
    | 'hanging'
    | 'middle'
    | 'ideographic'
    | 'bottom';

  /**
   * ???
   */
  export type TextVerticalAlign = 'top' | 'middle' | 'bottom';

  /**
   * ???
   */
  export interface Literal {
    text?: string;
    w?: number;
    h?: number;
    fontStyle?: string;
    fontSize?: number;
    fontBaselineRatio?: number;
    fontFace?: string;
    wordWrap?: boolean;
    wordWrapWidth?: number;
    /**
     * Enables Word Breaking (Advanced Text Renderer only)
     *
     * @remarks
     * When enabled, words that overflow the set width of the texture will
     * be broken to another line.
     *
     * You MUST enable {@link advancedRenderer} in order to use this
     *
     * @defaultValue false
     */
    wordBreak?: boolean;
    textOverflow?: TextOverflow;
    lineHeight?: number;
    textBaseline?: TextBaseline;
    textAlign?: TextAlign;
    verticalAlign?: TextVerticalAlign;
    offsetY?: number | null;
    maxLines?: number;
    maxLinesSuffix?: string;
    precision?: number;
    textColor?: number;
    /**
     * @remarks
     * Using this will result in a larger texture.
     */
    paddingLeft?: number;
    /**
     * @remarks
     * Using this will result in a larger texture.
     */
    paddingRight?: number;
    shadow?: boolean;
    shadowColor?: number;
    shadowOffsetX?: number;
    shadowOffsetY?: number;
    shadowBlur?: number;
    highlight?: boolean;
    highlightHeight?: number;
    highlightColor?: number;
    highlightOffset?: number;
    highlightPaddingLeft?: number;
    highlightPaddingRight?: number;
    letterSpacing?: number;
    textIndent?: number;
    cutEx?: number;
    cutEy?: number;
    cutSx?: number;
    cutSy?: number;
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

declare class TextTexture extends Texture implements Required<TextTexture.Literal> {
  constructor(stage: Stage);

  protected static renderer(
    stage: Stage,
    canvas: HTMLCanvasElement,
    settings: TextTexture.Literal,
  ): TextTextureRenderer;

  protected _changed(): void;

  protected stage: Stage;

  cloneArgs(): Required<TextTexture.Literal>;

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
