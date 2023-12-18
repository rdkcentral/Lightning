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
import TextureSource from "../TextureSource.mjs";
import ElementCore from "./ElementCore.mjs";

export default class ElementTexturizer {
  constructor(elementCore: ElementCore);
  get enabled(): boolean;
  set enabled(v: boolean);

  get colorize(): boolean;
  set colorize(v: boolean);
  get lazy(): boolean;
  set lazy(v: boolean);
  get renderOffscreen(): boolean;
  set renderOffscreen(v: boolean);
  get renderTextureReused(): boolean;

  _getTextureSource(): TextureSource;

  hasResultTexture(): boolean;
  resultTextureInUse(): boolean;
  updateResultTexture(): void;
  mustRenderToTexture(): boolean;
  deactivate(): void;
  release(): void;
  releaseRenderTexture(): void;

  reuseTextureAsRenderTexture(nativeTexture: TextureSource.NativeTexture): void;
  hasRenderTexture(): boolean;
  getRenderTexture(): TextureSource.NativeTexture | null;
  getResultTexture(): TextureSource.NativeTexture | null;
}
