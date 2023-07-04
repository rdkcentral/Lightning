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
    settings: Required<TextTexture.Settings>,
  );

  private _settings: Required<TextTexture.Settings>;
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
