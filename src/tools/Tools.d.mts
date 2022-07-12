import StaticCanvasTexture from "../textures/StaticCanvasTexture.mjs";

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
     * @see {@link StaticCanvasTexture.Content.factory}
     */
    canvasFactory: StaticCanvasTexture.Factory,
    /**
     * @see {@link StaticCanvasTexture.Content.lookupId}
     */
    lookupId: string,
  ): StaticCanvasTexture.Literal;

  /**
   * Gets a Texture defintion for a Rounded Rectangle
   *
   * The Rounded Rectangle is drawn onto an HTML Canvas, and then rendered by Lightning via a {@link StaticCanvasTexture}
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
  ): StaticCanvasTexture.Literal;

  // static createRoundRect(stage, w, h, radius, strokeWidth, strokeColor, fill, fillColor) {
  // - This returns an HTML Canvas element and is used privately by getRoundRect

  /**
   * Gets a Texture defintion for a Drop-Shadow Rectangle
   *
   * @remarks
   * The Shadow Rectangle is drawn onto an HTML Canvas, and then rendered by Lightning via a {@link StaticCanvasTexture}
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
  ): StaticCanvasTexture.Literal;

  // static createShadowRect(stage, w, h, radius, blur, margin) {
  // - This returns an HTML Canvas element and is used privately by getShadowRect

  /**
   * Gets a Texture defintion for an SVG Texture
   *
   * @remarks
   * The SVG is downloaded, drawn onto an HTML Canvas, and then rendered by Lightning via a {@link StaticCanvasTexture}
   *
   * @param url URL to the SVG file
   * @param w Width to render the SVG at
   * @param h Height to render the SVG at
   */
  static getSvgTexture(
    url: string,
    w: number,
    h: number
  ): StaticCanvasTexture.Literal;

  // static createSvg(cb, stage, url, w, h) {
  // - This returns an HTML Canvas element and is used privately by getSvgTexture
}

export default Tools;
