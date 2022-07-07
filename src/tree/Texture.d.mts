import Stage from "./Stage.mjs";
import TextureSource from "./TextureSource.mjs";

declare namespace Texture {
  export interface ResizeMode {
    clipX?: number;
    clipY?: number;
    h: number;
    type: string;
    w: number;
  }

  export interface Literal {
    type: typeof Texture;
    [s: string]: any; // Anything goes for now !!!
  }
}

declare class Texture {
  constructor(stage: Stage);

  clipping: boolean;
  mh: number;
  mw: number;
  resizeMode: Texture.ResizeMode;
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
  protected _getSourceLoader(): (callback: TextureSource.LoaderCallback) => void;

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
