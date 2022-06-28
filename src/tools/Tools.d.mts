import Stage from "../tree/Stage.mjs";
import Texture from "../tree/Texture.mjs";

type CanvasTextureFactoryCallback = (
  unk: string | Event | null,
  canvas?: HTMLCanvasElement,
) => void;
export type CanvasTextureFactory = (cb: CanvasTextureFactoryCallback, stage: Stage) => void;

export default class Tools {
  static getSvgTexture: (url: string, w: number, h: number) => Texture;
  static getCanvasTexture: (
    canvasFactory: CanvasTextureFactory,
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
