/**
 * Tests for strongly typed Components using defined Literal
 */

import lng from '../index.js';
import { MyLooseComponentC } from './components-loose.test-d.js';

namespace MyComponentA {
  export interface Literal extends lng.Component.Literal {
    type: typeof MyComponentA;
    myProperty: string;
  }
}

class MyComponentA extends lng.Component<MyComponentA.Literal> implements lng.Component.ImplementLiteral<MyComponentA.Literal> {
  static _template(): lng.Component.Template<MyComponentA> {
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
      // @ts-expect-error Property should error since it doesn't exist
      INVALID_PROP: 12345
    };
  }

  set myProperty(v: string) {}

  get myProperty(): string {
    return 'string';
  }
}

namespace MyComponentB {
  export interface Literal extends lng.Component.Literal {
    type: typeof MyComponentB;
    myPropertyB: string;
    MyComponentA: lng.Component.ExtractLiteral<MyComponentA>;
    MyComponentA_Error: lng.Component.ExtractLiteral<MyComponentA>;
    MyComponentA_Error2: lng.Component.ExtractLiteral<MyComponentA>;
  }
}

class MyComponentB extends lng.Component<MyComponentB.Literal> implements lng.Component.ImplementLiteral<MyComponentB.Literal> {
  static _template(): lng.Component.Template<MyComponentB> {
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
    this.patch({
      MyComponentA: {
        color: 0xffffffff,
        src: 'Test'
      }
    });
  }

  myPropertyB: string = '';
}

namespace MyComponentC {
  export interface Literal extends lng.Component.Literal {
    type: typeof MyComponentC;
    propC: string;
    MyComponentB: lng.Component.ExtractLiteral<MyComponentB>;
    MyLooseComponentC: lng.Component.ExtractLiteral<MyLooseComponentC>;
  }
}

class MyComponentC extends lng.Component<MyComponentC.Literal> implements lng.Component.ImplementLiteral<MyComponentC.Literal> {
  static _template(): lng.Component.Template<MyComponentC> {
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

    // Ability to patch deeply into object
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
        // Not sure why this property isn't erroring!!!
        // @ts-expect-error Property should error since it doesn't exist
        INVALID_PROP: 12345
      },
      // Not sure why this property isn't erroring!!!
      // @ts-expect-error Property should error since it doesn't exist
      INVALID_PROP: 12345
    });
  }

  propC: string = '';

  get MyLooseComponentC(): MyLooseComponentC {
    return this.getByRef('MyLooseComponentC')!; // !!! Look into solving this by automatically injecting this into Literal type
  }
}
