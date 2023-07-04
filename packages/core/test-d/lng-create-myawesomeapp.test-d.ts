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
/**
 * This is an example of the `lng create` app. There should be no errors or regular tests here.
 */
// @ts-expect-error
import { Utils } from '@lightningjs/sdk'
import lng from '../index.js';

export declare namespace App {
  export interface TemplateSpec extends lng.Component.TemplateSpec {
    /**
     * Lightning Logo that appears on the background
     */
    Logo: typeof lng.Element;
  }
}

export class App extends lng.Component<App.TemplateSpec> implements lng.Component.ImplementTemplateSpec<App.TemplateSpec> {
  readonly Logo = this.getByRef('Logo')!;

  static override _template(): lng.Component.Template<App.TemplateSpec> {
    return {
      Logo: {
        x: 960,
        y: 600,
        src: Utils.asset('images/logo.png') as string,
      },
    }
  }
}
