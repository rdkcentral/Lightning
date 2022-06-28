import Texture from "../Texture.mjs";
import CoreContext from "./CoreContext.mjs";
import ElementCore from "./ElementCore.mjs";

export default class CoreQuadList {
  constructor(ctx: CoreContext);

  get length(): number;

  public reset(): void;
  public getElement(index: number): Element;
  public getElementCore(index: number): ElementCore | undefined;
  public getTexture(index: number): Texture;
  public getTextureWidth(index: number): number;
  public getTextureHeight(index: number): number;
}
