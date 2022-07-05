/**
 * Tests for strongly typed Components using defined TemplateSpec
 */

import { expectType } from 'tsd';
import lng from '../index.js';
import { MyLooseComponentC } from './components-loose.test-d.js';

namespace MyComponentA {
  export interface TemplateSpec extends lng.Component.TemplateSpecStrong {
    myProperty: string;
  }
}

// Direct TemplateSpec properties should not be allowed to be set from the _template
const t100: lng.Component.Template<MyComponentA.TemplateSpec> = {
  // @ts-expect-error
  myProperty: 'abc'
};
// Direct properties should instead be of type `undefined`
// Though it would be better if the direct property key wasn't allowed at all
expectType<undefined>(t100['myProperty']);

// Unknown properties should not be allowed
const t200: lng.Component.Template<MyComponentA.TemplateSpec> = {
  // @ts-expect-error
  INVALID_PROP: 1234
};

// We should be able to create a component from the TemplateSpec
class MyComponentA extends lng.Component<MyComponentA.TemplateSpec> implements lng.Component.ImplementTemplateSpec<MyComponentA.TemplateSpec> {
  static _template(): lng.Component.Template<MyComponentA.TemplateSpec> {
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

  set myProperty(v: string) {}

  get myProperty(): string {
    return 'string';
  }
}

namespace MyComponentB {
  export interface TemplateSpec extends lng.Component.TemplateSpecStrong {
    myPropertyB: string;
    MyComponentA: typeof MyComponentA;
    MyComponentA_Error: typeof MyComponentA;
    MyComponentA_Error2: typeof MyComponentA;
  }
}

class MyComponentB extends lng.Component<MyComponentB.TemplateSpec> implements lng.Component.ImplementTemplateSpec<MyComponentB.TemplateSpec> {
  static _template(): lng.Component.Template<MyComponentB.TemplateSpec> {
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

  _init() {
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
  export interface TemplateSpec extends lng.Component.TemplateSpecStrong {
    propC: string;
    MyComponentB: typeof MyComponentB;
    MyLooseComponentC: typeof MyLooseComponentC;
  }
}

class MyComponentC extends lng.Component<MyComponentC.TemplateSpec> implements lng.Component.ImplementTemplateSpec<MyComponentC.TemplateSpec> {
  static _template(): lng.Component.Template<MyComponentC.TemplateSpec> {
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
          type: MyComponentA, // !!! This shouldn't be necessary
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

  readonly MyComponentA: MyComponentA = this.tag('MyComponentB')!;
  readonly MyComponentB: MyComponentB;

  constructor(stage: lng.Stage) {
    super(stage);
    this.MyComponentB = this.tag('MyComponentB')!;
  }

  _init() {
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
          // @ts-expect-error Property should error since it doesn't exist !!! clean up
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
