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
import Stage from "./Stage.mjs";
import TextureSource from "./TextureSource.mjs";

type UploadTextureSourceOptions = unknown;

interface TextureParams {
  [key: number]: GLenum;
}

interface TextureOptions {
  format: GLenum;
  type: GLenum;
}

export default class TextureManager {
  constructor(stage: Stage);

  textureSourceHashmap: Map<string, TextureSource>;

  get usedMemory(): number;

  addToLookupMap(textureSource: TextureSource): void;

  destroy(): void;

  freeTextureSource(textureSource: TextureSource): void;
  freeUnusedTextureSources(): void;

  /**
   * Do not call this method directly! Use `Stage.gc()` instead.
   */
  gc(): void;
  getReusableTextureSource(id: string): TextureSource;
  getTextureSource(func: TextureSource.Loader, id: string): TextureSource;

  uploadTextureSource(
    textureSource: TextureSource,
    options: UploadTextureSourceOptions,
  ): void;
}
