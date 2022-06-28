import { Flex, FlexItem, HeightFunc, WidthFunc } from "../Element.mjs";
import Shader from "../Shader.mjs";
import TextureSource from "../TextureSource.mjs";
import ElementTexturizer from "./ElementTexturizer.mjs";

export type OnAfterCalcsCallback = (el: Element) => void;
export type OnAfterUpdateCallback = (el: Element) => void;
export type OnUpdateCallback = (el: Element, core: ElementCore) => void; // eslint-disable-line no-use-before-define

export interface RenderContext {
  alpha: number;
  isIdentity(): boolean;
  isSquare(): boolean;
  px: number;
  py: number;
  ta: number;
  tb: number;
  tc: number;
  td: number;
}

export default class ElementCore {
  constructor(element: Element);

  static sortZIndexedChildren(a: ElementCore, b: ElementCore): number;
  _w: number;
  _h: number;
  _brx: number;
  _bry: number;
  _ulx: number;
  _uly: number;
  _texturizer: ElementTexturizer;
  _withinBoundsMargin: boolean;

  get x(): number;
  get y(): number;
  get w(): number;
  get h(): number;

  get alpha(): number;
  set alpha(v: number);
  get boundsMargin(): [number, number, number, number] | null;
  set boundsMargin(v: [number, number, number, number] | null);
  get clipbox(): boolean;
  set clipbox(v: boolean);
  get clipping(): boolean;
  set clipping(v: boolean);
  get colorUl(): number;
  set colorUl(v: number);
  get colorUr(): number;
  set colorUr(v: number);
  get colorBl(): number;
  set colorBl(v: number);
  get colorBr(): number;
  set colorBr(v: number);
  get displayedTextureSource(): TextureSource;
  get element(): Element;
  get flex(): Flex;
  set flex(v: Flex);
  get flexItem(): FlexItem;
  set flexItem(flexItem: FlexItem);
  get forceZIndexContext(): boolean;
  set forceZIndexContext(v: boolean);
  get funcH(): HeightFunc | undefined;
  set funcH(v: HeightFunc | undefined);
  get funcW(): WidthFunc | undefined;
  set funcW(v: WidthFunc | undefined);
  get isRoot(): boolean;
  get mount(): number;
  set mount(v: number);
  get mountX(): number;
  set mountX(v: number);
  get mountY(): number;
  set mountY(v: number);
  get offsetX(): number | WidthFunc;
  set offsetX(v: number | WidthFunc);
  get offsetY(): number | HeightFunc;
  set offsetY(v: number | HeightFunc);
  set onAfterCalcs(f: OnAfterCalcsCallback | undefined);
  set onAfterUpdate(f: OnAfterUpdateCallback | undefined);
  set onUpdate(f: OnUpdateCallback | undefined);
  get pivot(): number;
  set pivot(v: number);
  get pivotX(): number;
  set pivotX(v: number);
  get pivotY(): number;
  set pivotY(v: number);
  get renderContext(): RenderContext;
  get rotation(): number;
  set rotation(v: number);
  get scale(): number;
  set scale(v: number);
  get scaleX(): number;
  set scaleX(v: number);
  get scaleY(): number;
  set scaleY(v: number);
  get shader(): Shader | undefined;
  set shader(v: Shader | undefined);
  get texturizer(): ElementTexturizer;
  get visible(): boolean;
  set visible(v: boolean);
  get zIndex(): number;
  set zIndex(v: number);

  collectAtCoord(x: number, y: number, children: ElementCore[]): void;
  disableFuncH(): void;
  disableFuncW(): void;
  getCornerPoints(): [number, number, number, number, number, number, number, number];
  getRenderHeight(): number;
  getRenderWidth(): number;
  inBound(tx: number, ty: number): boolean;
  inScissor(): boolean;
  setAsRoot(): void;
  setDimensions(w: number, h: number, isEstimate?: boolean): boolean;
  setDisplayedTextureSource(textureSource?: TextureSource): void;
  setHasRenderUpdates(type: number): void;
  setTextureCoords(ulx: number, uly: number, brx: number, bry: number): void;

  update(): void;

  public _children: ElementCore[]; // TODO This should be protected but it's useful for getElementsAt method
  protected _renderContext: RenderContext;
  protected _scissor?: [number, number, number, number];

  protected _setHasUpdates(): void;
}
