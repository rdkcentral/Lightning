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
 * Tests for loosely typed Components with TemplateSpecLoose
 */
import lng from '../../index.js';
import { TaggedElements } from '../../src/tree/Element.mjs';

// Should be able to create a loose Component with unknown properties
class MyLooseComponentA extends lng.Component {
  static override _template(): lng.Component.Template {
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
      myProperty: 'abc',
      THIS_DOESNT_EXIST_BUT_ITS_OK: 12345,
      Test: {}
    };
  }

  set myProperty(v: string) {}

  get myProperty(): string {
    return 'string';
  }
}

class MyLooseComponentB extends lng.Component<lng.Component.TemplateSpecLoose> {
  static override _template(): lng.Component.Template<lng.Component.TemplateSpecLoose> {
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
      MyLooseComponentA: {
        type: MyLooseComponentA,
        myProperty: 'abc',
        THIS_DOESNT_EXIST_BUT_ITS_OK: 12345
      },
      THIS_DOESNT_EXIST_BUT_ITS_OK: 12345
    };
  }

  override _init() {
    this.MyLooseComponentA.myProperty = '123';
    this.MyLooseComponentA.x = 100;
    this.MyLooseComponentA.patch({
      x: 123,
      y: 321,
      w: 123,
      h: 321
    });
    this.patch({
      MyLooseComponentA: {
        color: 0xffffffff,
        src: 'Test',
      }
    });
  }

  myPropertyB: string = '';

  get MyLooseComponentA(): MyLooseComponentA {
    // Get by Ref should still work
    return this.getByRef('MyLooseComponentA')!;
  }
}

export class MyLooseComponentC extends lng.Component<lng.Component.TemplateSpecLoose> {
  static override _template(): lng.Component.Template<lng.Component.TemplateSpecLoose> {
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
      MyLooseComponentB: {
        type: MyLooseComponentB,
        myPropertyB: 'abc',
        MyLooseComponentA: {
          type: MyLooseComponentA,
          color: 0xff00ff
        }
      },
    };
  }

  override _init() {
    // Ability to patch individual properties on components (inherent TypeScript behavior)
    this.MyLooseComponentB.myPropertyB = '123';
    this.MyLooseComponentB.x = 100;

    // Ability to patch directly into MyLooseComponentB ()
    this.MyLooseComponentB.patch({
      x: 123,
      y: 321,
      w: 123,
      h: 321,
      myPropertyB: '12321'
    });

    // Ability to patch deeply into object
    this.patch({
      MyLooseComponentB: {
        color: 0xffffffff,
        src: 'Test',
        MyLooseComponentA: {
          color: 0x0000ff,
          THIS_DOESNT_EXIST_BUT_ITS_OK: 12345
        },
        THIS_DOESNT_EXIST_BUT_ITS_OK: 12345
      },
      THIS_DOESNT_EXIST_BUT_ITS_OK: 12345
    });
  }

  propC: string = '';

  get MyLooseComponentB(): MyLooseComponentB {
    return this.tag('MyLooseComponentB') as MyLooseComponentB;
  }

  get MyLooseComponentA(): MyLooseComponentA {
    return this.tag('MyLooseComponentB.MyLooseComponentA') as MyLooseComponentA;
  }
}

/**
 * Components are implicitly loosely typed. Here's a simple test for that.
 */
class MyLooseComponentImplicit extends lng.Component {
  static override _template(): lng.Component.Template {
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
      myProperty: 'abc',
      THIS_DOESNT_EXIST_BUT_ITS_OK: 12345,
    };
  }

  set myProperty(v: string) {}

  get myProperty(): string {
    return 'string';
  }
}