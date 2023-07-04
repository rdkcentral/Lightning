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
