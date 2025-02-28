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
import StaticCanvasTexture from "../textures/StaticCanvasTexture.mjs";
import Stage from "../tree/Stage.mjs";

declare namespace Tools {
  export type CornerRadius = number | [number, number, number, number];
}

/**
 * Useful functions for creating some commonly used textures.
 */
declare class Tools {
  /**
   * Constructs a Texture definition for an HTML Canvas Element based Texture
   *
   * @remarks
   * See implementations for createRoundRect(), createShadowRect(), and createSvg() in Lightning Core's Tools.mjs
   * for examples of the factory function.
   *
   * @param canvasFactory
   * @param lookupId
   */
  static getCanvasTexture(
    /**
     * @see {@link Lightning.textures.StaticCanvasTexture.Content.factory}
     */
    canvasFactory: StaticCanvasTexture.Factory,
    /**
     * @see {@link Lightning.textures.StaticCanvasTexture.Content.lookupId}
     */
    lookupId: string,
  ): StaticCanvasTexture.Settings;

  /**
   * Gets a Texture defintion for a Rounded Rectangle
   *
   * The Rounded Rectangle is drawn onto an HTML Canvas, and then rendered by Lightning via a {@link Lightning.textures.StaticCanvasTexture}
   *
   * @param w Width of rectangle
   * @param h Height of rectangle
   * @param radius Corner radius of rectangle
   * @param strokeWidth Stroke width of rectangle outline
   * @param strokeColor Color of rectangle outline
   * @param fill `true` - Fill rectangle with `fillColor`, `false` - don't fill rectangle
   * @param fillColor Color to fill the rectangle with (if `fill` === true)
   */
  static getRoundRect(
    w: number,
    h: number,
    radius: Tools.CornerRadius,
    strokeWidth?: number,
    strokeColor?: number,
    fill?: boolean,
    fillColor?: number,
  ): StaticCanvasTexture.Settings;

  // static createRoundRect(stage, w, h, radius, strokeWidth, strokeColor, fill, fillColor) {
  // - This returns an HTML Canvas element and is used privately by getRoundRect

  /**
   * Gets a Texture defintion for a Drop-Shadow Rectangle
   *
   * @remarks
   * The Shadow Rectangle is drawn onto an HTML Canvas, and then rendered by Lightning via a {@link Lightning.textures.StaticCanvasTexture}
   *
   * @param w Width of rectangle
   * @param h Height of rectangle
   * @param radius Corner radius of rectangle
   * @param blur [shadowBlur (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/shadowBlur#value)
   * @param margin Offset to shift shadow
   */
  static getShadowRect(
    w: number,
    h: number,
    radius?: Tools.CornerRadius,
    blur?: number,
    margin?: number
  ): StaticCanvasTexture.Settings;

  // static createShadowRect(stage, w, h, radius, blur, margin) {
  // - This returns an HTML Canvas element and is used privately by getShadowRect

  /**
   * Gets a Texture defintion for an SVG Texture
   *
   * @remarks
   * The SVG is downloaded, drawn onto an HTML Canvas, and then rendered by Lightning via a {@link Lightning.textures.StaticCanvasTexture}
   *
   * @param url URL to the SVG file
   * @param w Width to render the SVG at
   * @param h Height to render the SVG at
   */
  static getSvgTexture(
    url: string,
    w: number,
    h: number
  ): StaticCanvasTexture.Settings;

  /**
   * This returns an HTML Canvas element and is used privately by getSvgTexture
   * 
   * @param cb 
   * @param stage 
   * @param url 
   * @param w 
   * @param h 
   */
  static createSvg(cb: StaticCanvasTexture.FactoryCallback, stage: Stage, url: string, w: number, h: number): void;
}

export default Tools;
