/*
 * If not stated otherwise in this file or this component's LICENSE file the
 * following copyright and licenses apply:
 *
 * Copyright 2023 Metrological
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
import type {
  Application,
  Component,
  Element,
  ElementCore,
  ElementTexturizer,
  Stage,
  Texture,
} from "../dist/src";

declare interface ILng {
  Application?: typeof Application;
  Component?: typeof Component;
  Element: typeof Element;
  ElementCore: typeof ElementCore;
  ElementTexturizer: typeof ElementTexturizer;
  Stage: typeof Stage;
  Texture: typeof Texture;
}

declare global {
  interface Window {
    attachInspector(lng: ILng): void;
  }
}
