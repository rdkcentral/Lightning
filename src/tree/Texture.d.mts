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
import Stage from "./Stage.mjs";
import TextureSource from "./TextureSource.mjs";

declare namespace Texture {
  export interface ResizeMode {
    /**
     * Resize mode to use
     *
     * @remarks
     * Options
     * - `"cover"`
     *   - Ensure that the texture covers the entire rectangular area defined by {@link w} and {@link h}.
     *     - {@link clipX} and {@link clipY} can be used to adjust how the texture is clipped into the rectangle.
     * - `"contain"`
     *   - Fits an image into the rectangular area defined by {@link w} and {@link h}.
     *
     * See [Clipping - ResizeMode](https://lightningjs.io/docs/#/lightning-core-reference/Templates/Clipping?id=resizemode)
     * for more information.
     */
    type: 'cover' | 'contain';
    /**
     * Width of rectangular area (in pixels)
     *
     * @remarks
     * See [Clipping - ResizeMode](https://lightningjs.io/docs/#/lightning-core-reference/Templates/Clipping?id=resizemode)
     * for more information.
     */
    w: number;
    /**
     * Height of rectangular area (in pixels)
     *
     * @remarks
     * See [Clipping - ResizeMode](https://lightningjs.io/docs/#/lightning-core-reference/Templates/Clipping?id=resizemode)
     * for more information.
     */
    h: number;
    /**
     * X-Axis clip factor
     *
     * @remarks
     * This can be any floating point number between `0.0` and `1.0`.
     *
     * Examples
     * - `0.0` = Clips the left of the texture, showing the entire right.
     * - `0.5` (default) = Clips the left and right off equally.
     * - `1.0` = Clips the right of the texture, showing the entire left.
     *
     * Note: This property is only valid for the `"cover"` {@link type resize mode}.
     *
     * See [Clipping - ResizeMode](https://lightningjs.io/docs/#/lightning-core-reference/Templates/Clipping?id=resizemode)
     * for more information.
     *
     * @defaultValue `0.5`
     */
    clipX?: number;
    /**
     * Y-Axis clip factor
     *
     * @remarks
     * This can be any floating point number between `0.0` and `1.0`.
     *
     * Examples
     * - `0.0` = Clips the top of the texture, showing the entire bottom.
     * - `0.5` (default) = Clips the top and bottom off equally.
     * - `1.0` = Clips the bottom of the texture, showing the entire top.
     *
     * Note: This property is only valid for the `"cover"` {@link type resize mode}.
     *
     * See [Clipping - ResizeMode](https://lightningjs.io/docs/#/lightning-core-reference/Templates/Clipping?id=resizemode)
     * for more information.
     *
     * @defaultValue `0.5`
     */
    clipY?: number;
  }

  export interface Settings {
    type?: typeof Texture;
    /**
     * Texture clipping x-offset
     *
     * @remarks
     * This should not be set at the same time as {@link resizeMode}.
     *
     * See [Clipping](https://lightningjs.io/docs/#/lightning-core-reference/Templates/Clipping?id=clipping) for
     * more information.
     */
    x?: number;
    /**
     * Texture clipping x-offset
     *
     * @remarks
     * This should not be set at the same time as {@link resizeMode}.
     *
     * See [Clipping](https://lightningjs.io/docs/#/lightning-core-reference/Templates/Clipping?id=clipping) for
     * more information.
     */
    y?: number;
    /**
     * Texture clipping width
     *
     * @remarks
     * If `0` then shows full width.
     *
     * This should not be set at the same time as {@link resizeMode}.
     *
     * See [Clipping](https://lightningjs.io/docs/#/lightning-core-reference/Templates/Clipping?id=clipping) for
     * more information.
     */
    w?: number;
    /**
     * Texture clipping height
     *
     * @remarks
     * If `0` then shows full width.
     *
     * This should not be set at the same time as {@link resizeMode}.
     *
     * See [Clipping](https://lightningjs.io/docs/#/lightning-core-reference/Templates/Clipping?id=clipping) for
     * more information.
     */
    h?: number;
    /**
     * Texture render precision
     *
     * @see {Stage.Options.precision}
     */
    precision?: number;
    /**
     * Texture resize mode (Automatic resize + clipping)
     *
     * @remarks
     * When set, enables automatic clipping to a specific rectangular area.
     *
     * Note: `resizeMode` actually modifies the following texture clipping properties, so it should not be set at
     * the same time as them:
     * - {@link x}.
     * - {@link y}.
     * - {@link w}.
     * - {@link h}.
     *
     * See [Clipping - ResizeMode](https://lightningjs.io/docs/#/lightning-core-reference/Templates/Clipping?id=resizemode)
     * for more information.
     *
     * @defaultValue `null` (disabled)
     */
    resizeMode?: ResizeMode | null,
  }

  /**
   * Loose form of Texture {@link Settings}
   */
  export interface SettingsLoose extends Settings {
    [s: string]: any;
  }

  export type SourceLoaderCallback = (callback: TextureSource.LoaderCallback) => void;
}

declare class Texture {
  isTexture: true;

  // This is a hack that helps TypeScript to differentiate the Texture class and the `Texture.Settings` interface.
  type: undefined;

  constructor(stage: Stage);

  clipping: boolean;
  mh: number;
  mw: number;
  resizeMode: Texture.ResizeMode;
  enableClipping(x: number, y: number, w: number, h: number): void;
  disableClipping(): void;
  readonly stage: Stage;
  source: TextureSource | null;
  _source: TextureSource | null;

  get h(): number;
  set h(v: number);
  get w(): number;
  set w(v: number);

  get x(): number;
  set x(v: number);
  get y(): number;
  set y(v: number);

  get pw(): number;
  get ph(): number;

  get px(): number;
  get py(): number;

  get loadError(): Error;

  protected _getIsValid(): boolean;
  protected _getLookupId(): string | null;
  protected _getSourceLoader(): TextureSource.Loader;

  _changed(): void;
  addElement(el: Element): void;
  decActiveCount(): void;
  getRenderHeight(): number;
  getRenderWidth(): number;
  free(): void;
  incActiveCount(): void;
  isAutosizeTexture(): boolean;
  isError(): boolean;
  isLoaded(): boolean;
  isUsed(): boolean;
  load(): void;
  removeElement(el: Element): void;
}

export default Texture;
