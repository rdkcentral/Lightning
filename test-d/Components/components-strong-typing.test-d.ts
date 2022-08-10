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
 * Tests for strongly typed Components using defined TemplateSpec
 */

import { expectType } from 'tsd';
import { Lightning } from '../../index.typedoc.js';
import { TaggedElements, SpecToTagPaths } from '../../src/tree/Element.mjs';
import { MyLooseComponentC } from './components-loose.test-d.js';

namespace MyComponentA {
  export interface TemplateSpec extends Lightning.Component.TemplateSpec {
    myProperty: string;
  }
}

// Direct TemplateSpec properties should not be allowed to be set from the _template
const t100: Lightning.Component.Template<MyComponentA.TemplateSpec> = {
  // @ts-expect-error
  myProperty: 'abc'
};
// Direct properties should instead be of type `undefined`
// Though it would be better if the direct property key wasn't allowed at all
expectType<undefined>(t100['myProperty']);

// Unknown properties should not be allowed
const t200: Lightning.Component.Template<MyComponentA.TemplateSpec> = {
  // @ts-expect-error
  INVALID_PROP: 1234
};

declare module '../../index.typedoc.js' {
  namespace Lightning {
    namespace Component {
      interface FireAncestorsMap {
        $augmentedComponentsStrongTypingTest(a: number): string;
      }
    }
  }
}

// We should be able to create a component from the TemplateSpec
class MyComponentA extends Lightning.Component<MyComponentA.TemplateSpec> implements Lightning.Component.ImplementTemplateSpec<MyComponentA.TemplateSpec> {
  static override _template(): Lightning.Component.Template<MyComponentA.TemplateSpec> {
    return {
      x: (w) => w,
      y: (h) => h,
      w: (w) => w,
      h: (h) => h,
      color: 0xffffffff,
      rtt: true,
      mount: 0.0,
      mountX: 0.5,
      mountY: 1.0,
    };
  }

  override _init() {
    this.fireAncestors('$augmentedComponentsStrongTypingTest', 123);
  }

  set myProperty(v: string) {}

  get myProperty(): string {
    return 'string';
  }
}

namespace MyComponentB {
  export interface TemplateSpec extends Lightning.Component.TemplateSpec {
    myPropertyB: string;
    MyComponentA: typeof MyComponentA;
    MyComponentA_Error: typeof MyComponentA;
    MyComponentA_Error2: typeof MyComponentA;
    MyElement: {
      NestedElement: object,
    }
  }
}

class MyComponentB extends Lightning.Component<MyComponentB.TemplateSpec> implements Lightning.Component.ImplementTemplateSpec<MyComponentB.TemplateSpec> {
  static override _template(): Lightning.Component.Template<MyComponentB.TemplateSpec> {
    return {
      x: 0,
      y: 0,
      w: 0,
      h: 0,
      color: 0xffffffff,
      rtt: true,
      mount: 0.0,
      mountX: 0.5,
      mountY: 1.0,
      texture: {
        type: Lightning.textures.NoiseTexture,
        x: 10,
        y: 10,
        // Unknown props should be allowed (for now, because Texture.SettingsLoose)
        unknownProp1: 'abc'
      },
      shader: {
        type: Lightning.shaders.BoxBlur,
        // Unknown props should be allowed (for now, because Texture.SettingsLoose)
        unknownProp1: 'abc'
      },
      MyComponentA: {
        type: MyComponentA,
        myProperty: 'abc',
      },
      // @ts-expect-error 'type' is required to be specified in the child template
      MyComponentA_Error: {
        // type: MyComponentA,
        myProperty: 'abc',
      },
      MyComponentA_Error2: {
        // @ts-expect-error 'type' needs to match what is declared in the literal
        type: MyComponentB
      }
    };
  }

  readonly MyComponentA: MyComponentA = this.getByRef('MyComponentA')!;
  readonly MyComponentA_Error: MyComponentA = this.getByRef('MyComponentA_Error')!;
  readonly MyComponentA_Error2: MyComponentA = this.getByRef('MyComponentA_Error2')!;

  override _init() {
    this.MyComponentA.myProperty = '123';
    this.MyComponentA.x = 100;
    this.MyComponentA.patch({
      x: 123,
      y: 321,
      w: 123,
      h: 321
    });

    // Patch should not require 'type' in a child component
    this.patch({
      MyComponentA: {
        color: 0xffffffff,
        src: 'Test'
      }
    });

    // But a type is OK
    this.patch({
      MyComponentA: {
        type: MyComponentA,
        color: 0xffffffff,
        src: 'Test'
      }
    });

    // But the type must be the right one
    this.patch({
      MyComponentA: {
        // @ts-expect-error Must be MyComponentA
        type: MyComponentB,
        color: 0xffffffff,
        src: 'Test'
      }
    });

    // Support patching out a ref via `undefined`
    this.patch({
      MyComponentA: undefined,
    });

    // Get component by ref should work
    expectType<MyComponentA | undefined>(this.getByRef('MyComponentA'));
  }

  myPropertyB: string = '';


}

namespace MyComponentC {
  export interface TemplateSpec extends Lightning.Component.TemplateSpec {
    propC: string;
    MyComponentB: typeof MyComponentB;
    MyLooseComponentC: typeof MyLooseComponentC;
  }
}

class MyComponentC extends Lightning.Component<MyComponentC.TemplateSpec> implements Lightning.Component.ImplementTemplateSpec<MyComponentC.TemplateSpec> {
  static override _template(): Lightning.Component.Template<MyComponentC.TemplateSpec> {
    return {
      x: 0,
      y: 0,
      w: 0,
      h: 0,
      color: 0xffffffff,
      rtt: true,
      mount: 0.0,
      mountX: 0.5,
      mountY: 1.0,
      MyComponentB: {
        type: MyComponentB,
        myPropertyB: 'abc',
        MyComponentA: {
          type: MyComponentA,
          color: 0xff00ff
        }
      },
      // Test that loosely typed components can also be included
      MyLooseComponentC: {
        type: MyLooseComponentC,
        MyAnyComponentB: {
          someProperty: '123'
        }
      }
    };
  }

  readonly MyComponentA = this.tag('MyComponentA' as any)!;
  readonly MyComponentB: MyComponentB;

  constructor(stage: Lightning.Stage) {
    super(stage);
    this.MyComponentB = this.tag('MyComponentB')!;
  }

  override _init() {
    // Ability to patch individual properties on components (inherent TypeScript behavior)
    this.MyComponentB.myPropertyB = '123';
    this.MyComponentB.x = 100;
    this.MyLooseComponentC.propC = '123';

    // Ability to patch directly into child component
    this.MyComponentB.patch({
      x: 123,
      y: 321,
      w: 123,
      h: 321,
      myPropertyB: '12321'
    });

    // Ability to patch direclty into child loosely typed component
    this.MyLooseComponentC.patch({
      anythingGoes: 123,
    });

    // Patch should not require 'type' in a child component
    this.patch({
      MyComponentB: {
        color: 0xffffffff,
        src: 'Test'
      }
    });

    // But a type is OK
    this.patch({
      MyComponentB: {
        type: MyComponentB,
        color: 0xffffffff,
        src: 'Test'
      }
    });

    // But the type must be the right one
    this.patch({
      MyComponentB: {
        // @ts-expect-error Must be MyComponentB
        type: MyComponentA,
        color: 0xffffffff,
        src: 'Test'
      }
    });

    // Ability to patch deeply into object
    this.patch({
      MyComponentB: {
        color: 0xffffffff,
        src: 'Test',
        MyComponentA: {
          color: 0x0000ff,
          myProperty: '123',
        },
      },
    });

    // Unknown properties should error at all levels
    this.patch({
      MyComponentB: {
        color: 0xffffffff
      },
      // @ts-expect-error Property should error since it doesn't exist
      INVALID_PROP: 12345
    });
    this.patch({
      MyComponentB: {
        src: 'Test',
        // @ts-expect-error Property should error since it doesn't exist
        INVALID_PROP: 12345
      },
    });
    this.patch({
      MyComponentB: {
        color: 0xffffffff,
        src: 'Test',
        MyComponentA: {
          color: 0x0000ff,
          myProperty: '123',
          // @ts-expect-error Property should error since it doesn't exist
          INVALID_PROP: 12345
        },
      },
    });
  }

  propC: string = '';

  get MyLooseComponentC(): MyLooseComponentC {
    return this.getByRef('MyLooseComponentC')!;
  }
}
