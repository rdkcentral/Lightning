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
import Stage from "../tree/Stage.mjs";
import Texture from "../tree/Texture.mjs";

declare namespace StaticCanvasTexture {
  /**
   * Callback function that provides a ready HTML Canvas Element
   * back to a {@link StaticCanvasTexture}
   */
   export type FactoryCallback = (
    err: string | Event | Error | null,
    canvas?: HTMLCanvasElement,
  ) => void;

  /**
   * @see {@link Content.factory}
   */
  export type Factory = (cb: FactoryCallback, stage: Stage) => void;

  export interface Content {
    /**
     * Callback function that asyncronously creates an HTML Canvas Element
     * for use by a {@link StaticCanvasTexture}.
     *
     * @remarks
     * The finished canvas is passed via `cb` (See {@link FactoryCallback})
     */
    factory: Factory;
    /**
     * Unique identifier for this texture
     */
    lookupId?: string;
  }

  export interface Settings extends Texture.Settings {
    type?: typeof StaticCanvasTexture;
    content?: StaticCanvasTexture.Content;
  }
}

/**
 * Documentation
 */
declare class StaticCanvasTexture extends Texture {
  constructor(stage: Stage);

  set content(content: StaticCanvasTexture.Content);
}

export default StaticCanvasTexture;
