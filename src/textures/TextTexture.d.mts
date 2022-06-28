import Stage from "../tree/Stage.mjs";
import Texture from "../tree/Texture.mjs";
import TextTextureRenderer, { TextTextureSettingsLiteral } from "./TextTextureRenderer.mjs";

export type TextAlign = 'left' | 'center' | 'right';
export type TextBaseline =
  | 'alphabetic'
  | 'top'
  | 'hanging'
  | 'middle'
  | 'ideographic'
  | 'bottom';
export type TextVerticalAlign = 'top' | 'middle' | 'bottom';

declare namespace TextTexture {
  export interface Literal {
    fontFace?: string;
    fontSize?: number;
    fontStyle?: string;
    letterSpacing?: number;
    lineHeight?: number;
    /**
     * @deprecated !!!
     * Avoid using this, since it will create a larger texture
     */
    paddingLeft?: number;
    /**
     * @deprecated !!!
     * Avoid using this, since it will create a larger texture
     */
    paddingRight?: number;
    precision?: number;
    text?: string;
    textAlign?: TextAlign;
    textBaseline?: TextBaseline;
    textColor?: number;
    verticalAlign?: TextVerticalAlign;
    wordWrap?: boolean;
  }
}

declare class TextTexture extends Texture implements TextTexture.Literal {
  constructor(stage: Stage);

  protected static renderer(
    stage: Stage,
    canvas: HTMLCanvasElement,
    settings: TextTextureSettingsLiteral,
  ): TextTextureRenderer;

  protected _changed(): void;

  protected stage: Stage;

  text?: string;
  fontFace?: string;
  fontSize?: number;
  fontStyle?: string;
  lineHeight?: number;
  maxLines?: number;
  maxLinesSuffix?: string;
  /**
   * @deprecated
   * Avoid using this, since it will create a larger texture
   */
  paddingLeft?: number;
  /**
   * @deprecated
   * Avoid using this, since it will create a larger texture
   */
  paddingRight?: number;
  precision?: number;
  letterSpacing?: number;
  shadow?: boolean;
  shadowBlur?: number;
  textAlign?: TextAlign;
  textBaseline?: TextBaseline;
  textOverflow?: 'ellipsis' | 'clip' | string;
  textColor?: number;
  verticalAlign?: TextVerticalAlign;
  wordWrap?: boolean;
  wordWrapWidth?: number;

  cloneArgs(): TextTextureSettingsLiteral;
}

export default TextTexture;
