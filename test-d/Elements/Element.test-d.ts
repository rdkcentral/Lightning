import { expectType } from 'tsd';
import lng from '../../index.js';
import ListComponent from '../../src/components/ListComponent.mjs';

namespace MyElementTest {
  export interface TemplateSpec extends lng.Component.TemplateSpecStrong {
    MyStrongElement: typeof lng.Element<lng.Element.TemplateSpecStrong>;
    MyLooseElement: typeof lng.Element;
    TestComponent: typeof ListComponent;
  }
}

/**
 * Component that tests all the properties that should be on an Element
 */
class MyElementTest extends lng.Component<MyElementTest.TemplateSpec> implements lng.Component.ImplementTemplateSpec<MyElementTest.TemplateSpec> {
  static _template(): lng.Component.Template<MyElementTest.TemplateSpec> {
    // !!! Finish this test
    return {
      // You should NOT be required to provide explicit parameter type `number` for these!
      x: (w) => w,
      y: (h: number) => h,
      w: (w) => w,
      h: (h: number) => h,
      smooth: {
        x: [100, { delay: 0, duration: 10, timingFunction: 'ease-in' }],
        y: 200,
        alpha: 1.0,
        rotation: [3.14, { delay: 0, duration: 10, timingFunction: 'ease-in' }],
        // @ts-expect-error Should not be able to set non-numeric properties
        visible: false,
        // @ts-expect-error Should not be able to set non-numeric properties
        rtt: 123,
        // @ts-expect-error Should not be able to set non-numeric properties
        renderToTexture: [123, { delay: 0, duration: 10, timingFunction: 'ease-in' }],
      },
      MyStrongElement: {
        x: 123,
        y: 123,
        w: 123,
        h: 123,
        tagRoot: true,
        smooth: {
          x: [100, { delay: 0, duration: 10, timingFunction: 'ease-in' }],
          y: 200,
          alpha: 1.0,
          rotation: [3.14, { delay: 0, duration: 10, timingFunction: 'ease-in' }],
          // @ts-expect-error Should not be able to set non-numeric properties
          visible: false,
          // @ts-expect-error Should not be able to set non-numeric properties
          rtt: 123,
          // @ts-expect-error Should not be able to set non-numeric properties
          renderToTexture: [123, { delay: 0, duration: 10, timingFunction: 'ease-in' }],
        }
      }
    };
  }

  MyStrongElement = this.getByRef('MyStrongElement')!;
  MyLooseElement = this.getByRef('MyLooseElement')!;
  TestComponent = this.getByRef('TestComponent')!;

  _init() {
    //
    // finalX (readonly)
    //
    expectType<number>(this.MyStrongElement.finalX);
    // @ts-expect-error Cannot set this
    this.MyStrongElement.finalX = 0;

    //
    // finalY (readonly)
    //
    expectType<number>(this.MyStrongElement.finalY);
    // @ts-expect-error Cannot set this
    this.MyStrongElement.finalY = 0;

    //
    // finalW (readonly)
    //
    expectType<number>(this.MyStrongElement.finalW);
    // @ts-expect-error Cannot set this
    this.MyStrongElement.finalW = 0;

    //
    // finalH (readonly)
    //
    expectType<number>(this.MyStrongElement.finalH);
    // @ts-expect-error Cannot set this
    this.MyStrongElement.finalH = 0;

    //
    // tagRoot
    //
    expectType<boolean>(this.MyStrongElement.tagRoot);
    this.MyStrongElement.tagRoot = true;

    //
    // getByRef
    //
    // # STRONG #
    expectType<lng.Element<lng.Element.TemplateSpecLoose, lng.Texture> | undefined>(this.getByRef('MyLooseElement'));
    expectType<lng.Element<lng.Element.TemplateSpecStrong, lng.Texture> | undefined>(this.getByRef('MyStrongElement'));
    // @ts-expect-error Don't allow anything in a strongly typed Element
    this.getByRef('Anything');
    // # LOOSE #
    expectType<any>(this.MyLooseElement.getByRef('Anything'));
    expectType<any>(this.MyLooseElement.getByRef('Anything'));

    //
    // mw
    //
    this.MyStrongElement.mw = 123;
    // @ts-expect-error This cannot be a non-number
    this.MyStrongElement.mw = 'abc';
    // This property is WRITE-ONLY however we must say that it can also
    // be read as a number
    expectType<number>(this.MyStrongElement.mw);

    //
    // fastForward()
    //
    // # STRONG #
    expectType<void>(this.MyStrongElement.fastForward('x'));
    expectType<void>(this.MyStrongElement.fastForward('alpha'));
    // @ts-expect-error Should not be able to fastForward on non-numeric properties
    this.MyStrongElement.fastForward('rtt');
    // @ts-expect-error
    this.MyStrongElement.fastForward('visible');
    // @ts-expect-error
    this.MyStrongElement.fastForward('smooth');
    // @ts-expect-error Should not be able to fastForward unknown properties
    this.MyStrongElement.fastForward('INVALID_PROP');
    // Strongly typed property paths are not supported (due to typescript limitations). The following should error:
    // @ts-expect-error
    this.MyStrongElement.fastForward('texture.x');
    // @ts-expect-error
    this.MyStrongElement.fastForward('texture.INVALID_PROP.INVALID_PROP');
    // If the developer wants to use property paths, they can opt-in via `as any`
    expectType<void>(this.MyStrongElement.fastForward('texture.x' as any));
    expectType<void>(this.MyStrongElement.fastForward('texture.INVALID_PROP.INVALID_PROP' as any));

    // # LOOSE #
    expectType<void>(this.MyLooseElement.fastForward('x'));
    expectType<void>(this.MyLooseElement.fastForward('alpha'));
    // Loose elements will allow any unknown prop to be gotten
    expectType<void>(this.MyLooseElement.fastForward('INVALID_PROP'));
    // @ts-expect-error But not known props that aren't numeric....
    this.MyLooseElement.fastForward('rtt');
    // @ts-expect-error
    this.MyLooseElement.fastForward('visible', 123);
    // @ts-expect-error
    this.MyLooseElement.fastForward('smooth', 123);
    // @ts-expect-error
    this.MyLooseElement.fastForward('text', 123);
    // @ts-expect-error Unknown props still must be set with a number / tuple
    this.MyLooseElement.fastForward('INVALID_PROP', 'strings are not allowed');
    // Property paths are implicitly supported by loose Elements.
    expectType<void>(this.MyLooseElement.fastForward('texture.x'));
    expectType<void>(this.MyLooseElement.fastForward('texture.INVALID_PROP.INVALID_PROP'));
    // The `as any` case should still work for loose Elements
    expectType<void>(this.MyLooseElement.fastForward('texture.x' as any));
    expectType<void>(this.MyLooseElement.fastForward('texture.INVALID_PROP.INVALID_PROP' as any));

    //
    // set transitions()
    //
    // # STRONG #
    // Can set transitions
    this.MyStrongElement.transitions = {
      x: {
        delay: 123,
        duration: 123,
        timingFunction: 'ease-out'
      },
      mh: {
        delay: 123
      },
    };
    // Can't set transitions for invalid props
    this.MyStrongElement.transitions = {
      // @ts-expect-error
      itemSize: { // itemSize is only on ListComponent (see test below)
        delay: 123,
        duration: 123,
        timingFunction: 'ease-out'
      },
    };
    // Can set empty object
    this.MyStrongElement.transitions = {};
    // Can't set non-numeric properties
    this.MyStrongElement.transitions = {
      // @ts-expect-error
      rtt: {
        delay: 123,
        duration: 123,
        timingFunction: 'ease-out'
      },
    };
    // Can't set anything else (protection from accidental any)
    // @ts-expect-error
    this.MyStrongElement.transitions = 123;
    // @ts-expect-error
    this.MyStrongElement.transitions = 'abc';
    // Test for Component props
    this.TestComponent.transitions = {
      itemSize: {
        delay: 123
      }
    };
    // Still unknown props aren't allowed
    this.TestComponent.transitions = {
      // @ts-expect-error
      INVALID_PROP: {
        delay: 123
      }
    }


    // # LOOSE #
    // Can set transitions on an unknown prop
    this.MyLooseElement.transitions = {
      x: {
        delay: 123,
        duration: 123,
        timingFunction: 'ease-out'
      },
      INVALID_PROP: {
        delay: 123,
        duration: 123,
        timingFunction: 'ease-in-out'
      }
    };
    // Can set empty object
    this.MyLooseElement.transitions = {};
    // Can't set non-numeric properties
    this.MyLooseElement.transitions = {
      // @ts-expect-error
      rtt: {
        delay: 123,
        duration: 123,
        timingFunction: 'ease-out'
      },
    };
    // Can't set anything else (protection from accidental any)
    // @ts-expect-error
    this.MyLooseElement.transitions = 123;
    // @ts-expect-error
    this.MyLooseElement.transitions = 'abc';

    //
    // set smooth()
    //
    // # STRONG #
    // Quick check that `get smooth` also has `undefined` in its type
    expectType<lng.Element.SmoothTemplate<lng.Element.TemplateSpecStrong> | undefined>(this.MyStrongElement.smooth);
    this.MyStrongElement.smooth = {
      alpha: 1.0,
      x: 123,
      w: 123,
      // @ts-expect-error Should not be able to set non-numeric properties
      visible: false,
      // @ts-expect-error Should not be able to set non-numeric properties
      rtt: 123,
      // @ts-expect-error Should not be able to set non-numeric properties
      renderToTexture: [123, { delay: 0, duration: 10, timingFunction: 'ease-in' }],
    };
    // Unknown properties should error
    this.MyStrongElement.smooth = {
      // @ts-expect-error
      INVALID_PROP: 'INVALID_PROP',
    };
    this.patch({
      MyStrongElement: {
        smooth: {
          alpha: 1.0,
          x: 123,
          w: 123,
          // @ts-expect-error Should not be able to set non-numeric properties
          visible: false,
          // @ts-expect-error Should not be able to set non-numeric properties
          rtt: 123,
          // @ts-expect-error Should not be able to set non-numeric properties
          renderToTexture: [123, { delay: 0, duration: 10, timingFunction: 'ease-in' }],
        }
      }
    });
    // Unknown properties should error
    this.patch({
      MyStrongElement: {
        smooth: {
          x: 123,
          // @ts-expect-error
          INVALID_PROP: 'this cannot be a string'
        }
      }
    });
    // # LOOSE #
    this.MyLooseElement.smooth = {
      alpha: 1.0,
      x: 123,
      w: 123,
      // @ts-expect-error Should not be able to set non-numeric properties
      visible: false,
      // @ts-expect-error Should not be able to set non-numeric properties
      rtt: 123,
      // @ts-expect-error Should not be able to set non-numeric properties
      renderToTexture: [123, { delay: 0, duration: 10, timingFunction: 'ease-in' }],
      // @ts-expect-error Smooth cannot set unknown properties as a non-number/tuple
      INVALID_PROP1: 'this cannot be a string',
      // But it can set them as numbers / tuples
      INVALID_PROP2: 123,
      // Smooth cannot set unknown properties to a string
      INVALID_PROP3: [123, { delay: 0, duration: 10, timingFunction: 'ease-in' }],
    };
    this.patch({
      MyLooseElement: {
        smooth: {
          alpha: 1.0,
          x: 123,
          w: 123,
          // @ts-expect-error Should not be able to set non-numeric properties
          visible: false,
          // @ts-expect-error Should not be able to set non-numeric properties
          rtt: 123,
          // @ts-expect-error Should not be able to set non-numeric properties
          renderToTexture: [123, { delay: 0, duration: 10, timingFunction: 'ease-in' }],
        }
      }
    });

    //
    // setSmooth()
    //

    // # STRONG #
    // Expect it to return void
    expectType<void>(this.MyStrongElement.setSmooth('x', 123));
    expectType<void>(this.MyStrongElement.setSmooth('alpha', 1.0, { delay: 1, duration: 1, timingFunction: 'linear' }));
    // @ts-expect-error Requires at least two parameters
    this.MyStrongElement.setSmooth('x');
    // @ts-expect-error Should not be able to setSmooth on non-numeric properties
    this.MyStrongElement.setSmooth('rtt', 123);
    // @ts-expect-error Should not be able to setSmooth on non-numeric properties
    this.MyStrongElement.setSmooth('texture', 'abc');
    // @ts-expect-error Should not be able to set an 2-value tuple as the target value
    this.MyStrongElement.setSmooth('y', [123, { delay: 1, duration: 1, timingFunction: 'linear' }]);
    // Strongly typed property paths are not supported (due to typescript limitations). The following should error:
    // @ts-expect-error
    this.MyStrongElement.setSmooth('texture.x', 123);
    // @ts-expect-error
    this.MyStrongElement.setSmooth('texture.INVALID_PROP.INVALID_PROP', 123, { delay: 1, duration: 1, timingFunction: 'linear' });
    // If the developer wants to use property paths, they can opt-in via `as any`
    expectType<void>(this.MyStrongElement.setSmooth('texture.x' as any, 123));
    expectType<void>(this.MyStrongElement.setSmooth('texture.INVALID_PROP.INVALID_PROP' as any, 123, { delay: 1, duration: 1, timingFunction: 'linear' }));
    // @ts-expect-error Unknown props cannot be used
    this.MyStrongElement.setSmooth('INVALID_PROP', 123);
    // @ts-expect-error Known number props cannot be set to non-numeric values
    this.MyStrongElement.setSmooth('mh', 'abc');

    // # LOOSE #
    // Expect it to return void
    expectType<void>(this.MyLooseElement.setSmooth('x', 123));
    expectType<void>(this.MyLooseElement.setSmooth('alpha', 123, { delay: 1, duration: 1, timingFunction: 'linear' }));
    // @ts-expect-error Requires at least two parameters
    this.MyLooseElement.setSmooth('x');
    // @ts-expect-error Should not be able to setSmooth on non-numeric properties
    this.MyLooseElement.setSmooth('rtt', 123);
    // @ts-expect-error
    this.MyLooseElement.setSmooth('smooth', 123);
    // @ts-expect-error
    this.MyLooseElement.setSmooth('texture', 'abc');
    // @ts-expect-error Should not be able to set an 2-value tuple as the target value
    this.MyLooseElement.setSmooth('y', [123, { delay: 1, duration: 1, timingFunction: 'linear' }]);
    // Property paths are implicitly supported by loose Elements.
    expectType<void>(this.MyLooseElement.setSmooth('texture.x', 123));
    expectType<void>(this.MyLooseElement.setSmooth('texture.INVALID_PROP.INVALID_PROP', 123, { delay: 1, duration: 1, timingFunction: 'linear' }));
    // The `as any` case should still work for loose Elements
    expectType<void>(this.MyLooseElement.setSmooth('texture.x' as any, 123));
    expectType<void>(this.MyLooseElement.setSmooth('texture.INVALID_PROP.INVALID_PROP' as any, 123, { delay: 1, duration: 1, timingFunction: 'linear' }));
    // Unknown props may be used
    expectType<void>(this.MyLooseElement.setSmooth('INVALID_PROP', 123));
    // @ts-expect-error Known number props cannot be set to non-numeric values
    this.MyLooseElement.setSmooth('mh', 'abc');


    //
    // getSmooth
    //
    // # STRONG #
    expectType<number| undefined>(this.MyStrongElement.getSmooth('x'));
    expectType<number>(this.MyStrongElement.getSmooth('alpha', 123));
    // @ts-expect-error Should not be able to getSmooth on non-numeric properties
    this.MyStrongElement.getSmooth('rtt');
    // @ts-expect-error
    this.MyStrongElement.getSmooth('rtt', 123);
    // @ts-expect-error
    this.MyStrongElement.getSmooth('visible');
    // @ts-expect-error
    this.MyStrongElement.getSmooth('visible', 123);
    // @ts-expect-error
    this.MyStrongElement.getSmooth('smooth');
    // @ts-expect-error
    this.MyStrongElement.getSmooth('smooth', 123);
    // @ts-expect-error Should not be able to getSmooth unknown properties
    this.MyStrongElement.getSmooth('INVALID_PROP', 123);
    // Strongly typed property paths are not supported (due to typescript limitations). The following should error:
    // @ts-expect-error
    this.MyStrongElement.getSmooth('texture.x');
    // @ts-expect-error
    this.MyStrongElement.getSmooth('texture.x', 123);
    // @ts-expect-error
    this.MyStrongElement.getSmooth('texture.INVALID_PROP.INVALID_PROP');
    // @ts-expect-error
    this.MyStrongElement.getSmooth('texture.INVALID_PROP.INVALID_PROP', 123);
    // If the developer wants to use property paths, they can opt-in via `as any`
    expectType<number | undefined>(this.MyStrongElement.getSmooth('texture.x' as any));
    expectType<number>(this.MyStrongElement.getSmooth('texture.x' as any, 123));
    expectType<number>(this.MyStrongElement.getSmooth('texture.INVALID_PROP.INVALID_PROP' as any, 123));
    expectType<number>(this.MyStrongElement.getSmooth('texture.INVALID_PROP.INVALID_PROP' as any, 123));

    // # LOOSE #
    expectType<number| undefined>(this.MyLooseElement.getSmooth('x'));
    expectType<number>(this.MyLooseElement.getSmooth('alpha', 123));
    // Loose elements will allow any unknown prop to be gotten
    expectType<number | undefined>(this.MyLooseElement.getSmooth('INVALID_PROP'));
    expectType<number>(this.MyLooseElement.getSmooth('INVALID_PROP', 123));
    // @ts-expect-error But not known props that aren't numeric....
    this.MyLooseElement.getSmooth('rtt', 123);
    // @ts-expect-error
    this.MyLooseElement.getSmooth('visible', 123);
    // @ts-expect-error
    this.MyLooseElement.getSmooth('smooth', 123);
    // @ts-expect-error
    this.MyLooseElement.getSmooth('text', 123);
    // @ts-expect-error Unknown props still must be set with a number / tuple
    this.MyLooseElement.getSmooth('INVALID_PROP', 'strings are not allowed');
    // Property paths are implicitly supported by loose Elements.
    expectType<number | undefined>(this.MyLooseElement.getSmooth('texture.x'));
    expectType<number>(this.MyLooseElement.getSmooth('texture.INVALID_PROP.INVALID_PROP', 123));
    // The `as any` case should still work for loose Elements
    expectType<number | undefined>(this.MyLooseElement.getSmooth('texture.x' as any));
    expectType<number>(this.MyLooseElement.getSmooth('texture.INVALID_PROP.INVALID_PROP' as any, 123));
  }
}

const element: lng.Element<lng.Element.TemplateSpecStrong> = {} as any;

element.setSmooth('x', 12);
element.setSmooth('y', 12);