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
import CoreContext from "./core/CoreContext.mjs";
import ElementCore from "./core/ElementCore.mjs";

declare namespace Shader {
  export interface Settings {
    type?: typeof Shader;
  }

  /**
   * Loose form of Shader {@link Settings}
   */
  export interface SettingsLoose extends Settings {
    [key: string]: any;
  }
}

declare class Shader {
  isShader: true;

  // This is a hack that helps TypeScript to differentiate the Shader class and the `Shader.Settings` interface.
  type: undefined;

  ctx: CoreContext;

  constructor(coreContext: CoreContext);

  addElement(core: ElementCore): void;
  patch(settings: unknown): void;
  protected redraw(): void;
  removeElement(core: ElementCore): void;

  protected useDefault(): boolean;

  // This is a simplification, for now, to make it easier to interact with shader properties
  [x: string]: unknown;
}

export default Shader;