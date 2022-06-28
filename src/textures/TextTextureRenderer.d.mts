import Stage from "../tree/Stage.mjs";
import { RenderInfo } from "../tree/TextureSource.mjs";
import { TextAlign, TextBaseline, TextVerticalAlign } from "./TextTexture.mjs";

export interface LineInfo {
  // allLines - lines after wrapping
  l: Array<string>;
  // realNewLines - length of each resulting line
  n: Array<number>;
}

export interface TextTextureSettingsLiteral {
  cutEx: number;
  cutEy: number;
  cutSx: number;
  cutSy: number;
  fontFace: string | null;
  fontSize: number;
  fontStyle: string;
  h: number;
  highlight: boolean;
  highlightColor: number;
  highlightHeight: number;
  highlightOffset: number;
  highlightPaddingLeft: number;
  highlightPaddingRight: number;
  letterSpacing: number;
  lineHeight: number | null;
  maxLines: number;
  maxLinesSuffix: string;
  offsetY: number | null;
  /**
   * @deprecated
   * Avoid using this, since it will create a larger texture
   */
  paddingLeft: number;
  /**
   * @deprecated
   * Avoid using this, since it will create a larger texture
   */
  paddingRight: number;
  precision?: number;
  shadow: string;
  shadowBlur: number;
  shadowColor: number;
  shadowOffsetX: number;
  shadowOffsetY: number;
  text: string;
  textAlign: TextAlign;
  textBaseline: TextBaseline;
  textColor: number;
  textIndent: number;
  textOverflow: string;
  verticalAlign: TextVerticalAlign;
  w: number;
  wordBreak: boolean;
  wordWrap: boolean;
  wordWrapWidth: number;
}

export default class TextTextureRenderer {
  constructor(
    stage: Stage,
    canvas: HTMLCanvasElement,
    settings: TextTextureSettingsLiteral,
  );

  private _settings: TextTextureSettingsLiteral;
  renderInfo?: RenderInfo;

  _calculateRenderInfo(): RenderInfo;
  draw(): Promise<void> | void;
  getPrecision(): number;
  measureText(word: string, space?: number): number;
  setFontProperties(): void;
  wrapText(
    text: string,
    wordWrapWidth: number,
    letterSpacing: number,
    indent: number,
  ): LineInfo;
  wrapWord(text: string, wordWrapWidth: number, suffix?: string): string;
}
