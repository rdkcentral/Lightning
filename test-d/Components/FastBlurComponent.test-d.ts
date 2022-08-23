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
import { expectType } from 'tsd';
import lng from '../../index';

namespace Container {
  export interface TemplateSpec extends lng.Component.TemplateSpec {
    FastBlurComponent: typeof lng.components.FastBlurComponent;
    FastBlurComponent_SpecificType: typeof lng.components.FastBlurComponent<lng.components.ListComponent>;
  }
}

class Container extends lng.Component<Container.TemplateSpec> implements lng.Component.ImplementTemplateSpec<Container.TemplateSpec> {
  static override _template(): lng.Component.Template<Container.TemplateSpec> {
    // Template validity
    return {
      FastBlurComponent: {
        type: lng.components.FastBlurComponent,
        amount: 2,
        paddingX: 10,
        paddingY: 10,
        content: {
          text: {
            text: 'Hello World'
          }
        }
      },
      FastBlurComponent_SpecificType: {
        type: lng.components.FastBlurComponent,
        content: {
          alpha: 123,
          items: [
            { text: 'abc' }
          ],
          // @ts-expect-error Sanity check: horizontal must be a boolean
          horizontal: 123
        },
        smoothScale: 123
      }
    };
  }

  override _init() {
    // Direct property setting
    this.FastBlurComponent.amount = 3;
    // @ts-expect-error Shouldn't allow a string
    this.FastBlurComponent.amount = '3';
    this.FastBlurComponent.paddingX = 20;
    // @ts-expect-error Shouldn't allow a string
    this.FastBlurComponent.paddingX = '33';

    this.FastBlurComponent.content = {
      src: 'image'
    };

    // Indirect patch
    this.patch({
      FastBlurComponent: {
        amount: 4,
        paddingX: 10,
        paddingY: 10,
        content: {
          text: {
            text: 'Hello World',
            // @ts-expect-error Prop not expected
            INVALID_PROP: 123
          }
        }
      }
    });

    // Direct patch
    this.FastBlurComponent.patch({
      amount: 4,
      paddingX: 10,
      paddingY: 10,
      content: {
        text: {
          text: 'Hello World',
          // @ts-expect-error Prop not expected
          INVALID_PROP: 123
        }
      }
    });

    // Specific type tests
    this.FastBlurComponent_SpecificType.content = {
      alpha: 123,
      items: [
        { text: 'abc' }
      ],
      // @ts-expect-error Sanity check: horizontal must be a boolean
      horizontal: 123
    };

    expectType<lng.components.ListComponent>(this.FastBlurComponent_SpecificType.content);

    this.patch({
      FastBlurComponent_SpecificType: {
        content: {
          alpha: 123,
          items: [
            { text: 'abc' }
          ],
          // @ts-expect-error Sanity check: horizontal must be a boolean
          horizontal: 123
        },
        smoothScale: 123
      }
    });

    this.FastBlurComponent_SpecificType.patch({
      content: {
        alpha: 123,
        items: [
          { text: 'abc' }
        ],
        // @ts-expect-error Sanity check: horizontal must be a boolean
        horizontal: 123
      },
      smoothScale: 123
    });
  }

  get FastBlurComponent(): lng.components.FastBlurComponent {
    return this.tag('FastBlurComponent')!;
  }

  readonly FastBlurComponent_SpecificType = this.getByRef('FastBlurComponent_SpecificType')!;
}