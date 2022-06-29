import Stage from "../tree/Stage.mjs";
import TextureSource from "../tree/TextureSource.mjs";
import TextTexture from "./TextTexture.mjs";

declare namespace TextTextureRenderer {
  export interface LineInfo {
    /**
     * allLines - lines after wrapping
     */
    l: Array<string>;
    /**
     * realNewLines - length of each resulting line
     */
    n: Array<number>;
  }
}

declare class TextTextureRenderer {
  constructor(
    stage: Stage,
    canvas: HTMLCanvasElement,
    settings: Required<TextTexture.Literal>,
  );

  private _settings: Required<TextTexture.Literal>;
  renderInfo?: TextureSource.RenderInfo;

  _calculateRenderInfo(): TextureSource.RenderInfo;
  draw(): Promise<void> | void;
  getPrecision(): number;
  measureText(word: string, space?: number): number;
  setFontProperties(): void;
  wrapText(
    text: string,
    wordWrapWidth: number,
    letterSpacing: number,
    indent: number,
  ): TextTextureRenderer.LineInfo;
  wrapWord(text: string, wordWrapWidth: number, suffix?: string): string;
}

export default TextTextureRenderer;
