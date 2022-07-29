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
import Element from "../Element.mjs";
import Shader from "../Shader.mjs";
import TextureSource from "../TextureSource.mjs";
import ElementTexturizer from "./ElementTexturizer.mjs";

declare namespace ElementCore {
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
}

declare class ElementCore {
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
  get flex(): Element.Flex;
  set flex(v: Element.Flex);
  get flexItem(): Element.FlexItem;
  set flexItem(flexItem: Element.FlexItem);
  get forceZIndexContext(): boolean;
  set forceZIndexContext(v: boolean);
  get funcH(): ((parentHeight: number) => number) | undefined;
  set funcH(v: ((parentHeight: number) => number) | undefined);
  get funcW(): ((parentWidth: number) => number) | undefined;
  set funcW(v: ((parentWidth: number) => number) | undefined);
  get isRoot(): boolean;
  get mount(): number;
  set mount(v: number);
  get mountX(): number;
  set mountX(v: number);
  get mountY(): number;
  set mountY(v: number);
  get offsetX(): number | ((parentWidth: number) => number);
  set offsetX(v: number | ((parentWidth: number) => number));
  get offsetY(): number | ((parentHeight: number) => number);
  set offsetY(v: number | ((parentHeight: number) => number));
  set onAfterCalcs(f: Element.OnAfterCalcsCallback | undefined);
  set onAfterUpdate(f: Element.OnAfterUpdateCallback | undefined);
  set onUpdate(f: Element.OnUpdateCallback | undefined);
  get pivot(): number;
  set pivot(v: number);
  get pivotX(): number;
  set pivotX(v: number);
  get pivotY(): number;
  set pivotY(v: number);
  get renderContext(): ElementCore.RenderContext;
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

  /**
   * Fill the array `children` with all the ElementCore instances (including itself and
   * its children) that intersect the point (`x`, `y`)
   *
   * @param x
   * @param y
   * @param children
   */
  collectAtCoord(x: number, y: number, children: ElementCore[]): void;
  disableFuncH(): void;
  disableFuncW(): void;
  getCornerPoints(): [number, number, number, number, number, number, number, number];
  getRenderTextureCoords(relX: number, relY: number): [number, number];
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

  protected _children: ElementCore[];
  protected _renderContext: ElementCore.RenderContext;
  protected _scissor?: [number, number, number, number];

  protected _setHasUpdates(): void;
}

export default ElementCore;
