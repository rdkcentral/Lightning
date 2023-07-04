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
import Stage from "../Stage.mjs";
import Texture from "../Texture.mjs";
import CoreRenderState from "./CoreRenderState.mjs";
import ElementCore from "./ElementCore.mjs";

export default class CoreContext {
  stage: Stage;

  renderToTextureCount: number;

  constructor(stage: Stage);

  get renderState(): CoreRenderState;
  get usedMemory(): number;

  destroy(): void;
  hasRenderUpdates(): boolean;
  render(): void;

  /**
   * @see {@link Stage.update}
   */
  update(): void;

  protected _performForcedZSorts(): void;
  protected _update(): void;
  protected _render(): void;
  protected _fillRenderState(): void;
  protected _performRender(): void;
  protected _addMemoryUsage(delta: number): void;

  allocateRenderTexture(w: number, h: number): Texture;
  releaseRenderTexture(texture: Texture): void;

  freeUnusedRenderTextures(maxAge: number): void;

  protected _createRenderTexture(w: number, h: number, pw: number, ph: number): Texture;
  protected _freeRenderTexture(nativeTexture: unknown): void;

  copyRenderTexture(renderTexture: Texture, nativeTexture: unknown, options: unknown): void;

  forceZSort(elementCore: ElementCore): void;
}
