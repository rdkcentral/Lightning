import Stage from "../tree/Stage.mjs";
import Texture from "../tree/Texture.mjs";

declare namespace Tools {
  export type CanvasTextureFactoryCallback = (
    unk: string | Event | null,
    canvas?: HTMLCanvasElement,
  ) => void;
  export type CanvasTextureFactory = (cb: CanvasTextureFactoryCallback, stage: Stage) => void;
}

declare class Tools {
  static getSvgTexture: (url: string, w: number, h: number) => Texture;
  static getCanvasTexture: (
    canvasFactory: Tools.CanvasTextureFactory,
    lookupId: string,
  ) => Texture;
  static getRoundRect: (
    w: number,
    h: number,
    radius: number | [number, number, number, number],
    strokeWidth?: number,
    strokeColor?: number,
    fill?: boolean,
    fillColor?: number,
  ) => Texture;
}

export default Tools;
