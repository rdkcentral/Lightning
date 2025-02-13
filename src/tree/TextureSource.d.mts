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
import TextureManager from "./TextureManager.mjs";

declare namespace TextureSource {
  export type LoadCancelCallback = (source: TextureSource) => void;

  export type NativeTexture =
    | ArrayBuffer
    | WebGLTexture
    | ImageData
    | HTMLImageElement
    | HTMLCanvasElement
    | HTMLVideoElement
    | ImageBitmap;

  export interface LoadOptions {
    flipBlueRed: boolean;
    h: number;
    hasAlpha: boolean;
    permanent: boolean;
    premultiplyAlpha: boolean;
    renderInfo: RenderInfo;
    source: NativeTexture;
    throttle: boolean;
    w: number;
  }

  export type LoaderCallback = (
    err: Error | null,
    options?: LoadOptions,
  ) => void;

  export type Loader = (
    callback: LoaderCallback,
    source: TextureSource,
  ) => LoadCancelCallback | void;

  export interface RenderInfo<T = string[]> {
    cutEx: number;
    cutEy: number;
    cutSx: number;
    cutSy: number;
    fontSize: number;
    h: number;
    height: number;
    innerWidth: number;
    letterSpacing: number;
    lineHeight: number;
    lines: T;
    lineWidths: number[];
    moreTextLines: boolean;
    offsetY: number;
    paddingLeft: number;
    paddingRight: number;
    precision: number;
    remainingText: string;
    textIndent: number;
    w: number;
    width: number;
  }
}



declare class TextureSource {
  constructor(manager: TextureManager, loader?: TextureSource.Loader);

  _flipTextureY: boolean;
  _loadError: unknown;
  loadingSince: number | null;
  permanent: boolean;
  renderInfo: TextureSource.RenderInfo;

  get lookupId(): string | undefined;

  cancel(): void;
  forEachActiveElement(callback: (element: Element) => void): void;
  getRenderWidth(): number;
  getRenderHeight(): number;
  isError(): boolean;
  isLoaded(): boolean;
  isLoading(): boolean;
  isUsed(): boolean;
  onError(e: unknown): void;

  get nativeTexture(): TextureSource.NativeTexture | null;
}

export default TextureSource;