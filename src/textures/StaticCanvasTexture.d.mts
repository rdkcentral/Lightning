import Stage from "../tree/Stage.mjs";
import Texture from "../tree/Texture.mjs";

declare namespace StaticCanvasTexture {
  /**
   * Callback function that provides a ready HTML Canvas Element
   * back to a {@link StaticCanvasTexture}
   */
   export type FactoryCallback = (
    err: string | Event | Error | null,
    canvas?: HTMLCanvasElement,
  ) => void;

  /**
   * @see {@link Content.factory}
   */
  export type Factory = (cb: FactoryCallback, stage: Stage) => void;

  export interface Content {
    /**
     * Callback function that asyncronously creates an HTML Canvas Element
     * for use by a {@link StaticCanvasTexture}.
     *
     * @remarks
     * The finished canvas is passed via `cb` (See {@link FactoryCallback})
     */
    factory: Factory;
    /**
     * Unique identifier for this texture
     */
    lookupId?: string;
  }

  export interface Literal extends Texture.Literal {
    type: typeof StaticCanvasTexture;
    content: StaticCanvasTexture.Content;
  }
}

/**
 * Documentation
 */
declare class StaticCanvasTexture extends Texture {
  constructor(stage: Stage);

  set content(content: StaticCanvasTexture.Content);
}

export default StaticCanvasTexture;
