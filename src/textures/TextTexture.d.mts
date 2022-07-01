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

declare class TextTexture extends Texture implements TextTexture.Literal {
  constructor(stage: Stage);

  protected static renderer(
    stage: Stage,
    canvas: HTMLCanvasElement,
    settings: TextTexture.Literal,
  ): TextTextureRenderer;

  protected _changed(): void;

  protected stage: Stage;

  cloneArgs(): Required<TextTexture.Literal>;
}

export default TextTexture;
