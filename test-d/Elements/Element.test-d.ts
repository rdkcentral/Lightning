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
import lng from '../../index.js';
import ListComponent from '../../src/components/ListComponent.mjs';
import { InlineElement, SmoothTemplate } from '../../src/tree/Element.mjs';

namespace MyElementTest {
  export interface TemplateSpec extends lng.Component.TemplateSpec {
    MyStrongElement: {
      ChildElement: {},
      ChildComponent: typeof ListComponent
    };
    MyLooseElement: typeof lng.Element<{
      ChildElement: {},
      ChildComponent: typeof ListComponent
    } & lng.Element.TemplateSpecLoose>;
    TestComponent: typeof ListComponent;
  }
}

/**
 * Component that tests all the properties that should be on an Element
 */
class MyElementTest extends lng.Component<MyElementTest.TemplateSpec> implements lng.Component.ImplementTemplateSpec<MyElementTest.TemplateSpec> {
  static override _template(): lng.Component.Template<MyElementTest.TemplateSpec> {
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
        visible: false,
        text: 'abc',
        // @ts-expect-error Type must match type of property
        rtt: 123, // rtt is a boolean
        // @ts-expect-error Type must match type of property
        renderToTexture: [123, { delay: 0, duration: 10, timingFunction: 'ease-in' }], // renderToTexture is a boolean
        // @ts-expect-error Should not be able to set non-animatable properties
        smooth: {},
      },
      MyStrongElement: {
        x: 123,
        y: 123,
        w: 123,
        h: 123,
        tagRoot: true,
        /// Test all the TextTexture properties
        text: {
          text: 'abc',
          fontFace: ['Roboto', 'Arial'],
          fontSize: 12,
          fontStyle: 'normal',
          textColor: 0xff0000ff,
          textAlign: 'center',
          fontBaselineRatio: 1,
          wordWrap: true,
          wordBreak: true,
          wordWrapWidth: 100,
          lineHeight: 20,
          textBaseline: 'alphabetic',
          verticalAlign: 'top',
          offsetY: 1,
          maxLines: 1,
          maxLinesSuffix: '...',
          precision: 1,
          paddingLeft: 1,
          paddingRight: 1,
          shadow: true,
          shadowColor: 0xff0000ff,
          shadowOffsetX: 1,
          shadowOffsetY: 1,
          shadowBlur: 1,
          highlight: true,
          highlightColor: 0xff0000ff,
          highlightOffset: 1,
          highlightPaddingLeft: 1,
          highlightPaddingRight: 1,
          letterSpacing: 1,
          textIndent: 1,
          cutSx: 1,
          cutEx: 1,
          cutSy: 1,
          cutEy: 1,
          advancedRenderer: false,
        },
        smooth: {
          x: [100, { delay: 0, duration: 10, timingFunction: 'ease-in' }],
          y: 200,
          alpha: 1.0,
          rotation: [3.14, { delay: 0, duration: 10, timingFunction: 'ease-in' }],
          visible: false,
          text: 'abc',
          // @ts-expect-error Type must match type of property
          rtt: 123, // rtt is a boolean
          // @ts-expect-error Type must match type of property
          renderToTexture: [123, { delay: 0, duration: 10, timingFunction: 'ease-in' }], // renderToTexture is a boolean
          // @ts-expect-error Should not be able to set non-animatable properties
          smooth: {},
        }
      }
    };
  }

  MyStrongElement = this.getByRef('MyStrongElement')!;
  MyLooseElement = this.getByRef('MyLooseElement')!;
  TestComponent = this.getByRef('TestComponent')!;

  override _init() {
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
    expectType<
      lng.Element<{
        ChildElement: {};
        ChildComponent: typeof ListComponent;
      } & lng.Element.TemplateSpecLoose> | undefined
    >(this.getByRef('MyLooseElement'));
    expectType<
      lng.Element<InlineElement<{
        ChildElement: {};
        ChildComponent: typeof ListComponent;
      }>> | undefined
    >(this.getByRef('MyStrongElement'));
    // @ts-expect-error Don't allow anything in a strongly typed Element
    this.getByRef('Anything');
    // # LOOSE #
    expectType<any>(this.MyLooseElement.getByRef('Anything'));
    expectType<any>(this.MyLooseElement.getByRef('Anything'));

    //
    // tag
    //
    // # STRONG #
    // Should be able to do what getByRef can do...
    expectType<
      lng.Element<{
        ChildElement: {};
        ChildComponent: typeof ListComponent;
      } & lng.Element.TemplateSpecLoose> | undefined
    >(this.tag('MyLooseElement'));
    expectType<
      lng.Element<InlineElement<{
        ChildElement: {};
        ChildComponent: typeof ListComponent;
      }>> | undefined
    >(this.tag('MyStrongElement'));
    // @ts-expect-error Don't allow anything in a strongly typed Element
    this.tag('Anything');
    // Unless you use `as any`
    expectType<any>(this.tag('Anything' as any));

    // Should be able to access elements deeply
    expectType<
      lng.components.ListComponent | undefined
    >(this.tag('MyStrongElement.ChildComponent'));

    expectType<
      lng.Element<InlineElement<{}>, lng.Element.TypeConfig> | undefined
    >(this.tag('MyStrongElement.ChildElement'));

    // # LOOSE #
    expectType<any>(this.MyLooseElement.tag('Anything'));
    expectType<any>(this.MyLooseElement.tag('Anything'));

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
    // patch()
    //
    // # STRONG #
    /// Patching nothing
    expectType<void>(this.MyStrongElement.patch({}))
    /// Supports patching own properties
    expectType<void>(
      this.MyStrongElement.patch({
        alpha: 1.0,
        color: 0xffffffff,
        scale: 2
      })
    );
    /// Supports deleting child Elements
    expectType<void>(
      this.MyStrongElement.patch({
        ChildElement: undefined,
        ChildComponent: undefined
      })
    );
    /// Supports patching child Elements
    expectType<void>(
      this.MyStrongElement.patch({
        ChildElement: {
          alpha: 1.0
        },
        ChildComponent: {
          x: 123,
          y: 123
        }
      })
    );
    /// Supports patching child Components with component specific properties
    expectType<void>(
      this.MyStrongElement.patch({
        ChildComponent: {
          itemSize: 123 // Specific to ListComponent
        }
      })
    );
    /// Supports patching in new child Component by type
    expectType<void>(
      this.MyStrongElement.patch({
        ChildComponent: {
          type: lng.components.ListComponent,
          x: 123,
          y: 123
        }
      })
    );
    /// Errors when patching unknown properties
    this.MyStrongElement.patch({
      // @ts-expect-error
      unknownProp: 1.0,
    });
    /// Errors when patching unknown child Elements
    this.MyStrongElement.patch({
      // @ts-expect-error
      UnknownChild1: undefined,
    });
    this.MyStrongElement.patch({
      // @ts-expect-error
      UnknownChild2: {},
    });
    this.MyStrongElement.patch({
      // @ts-expect-error
      UnknownChild3: {
        x: 123,
        y: 123
      },
    });

    // # LOOSE #
    /// Patching nothing
    expectType<void>(this.MyLooseElement.patch({}))
    /// Supports patching own properties
    expectType<void>(
      this.MyLooseElement.patch({
        alpha: 1.0,
        color: 0xffffffff,
        scale: 2
      })
    );
    /// Supports deleting child Elements
    expectType<void>(
      this.MyLooseElement.patch({
        ChildElement: undefined,
        ChildComponent: undefined
      })
    );
    /// Supports patching child Elements
    expectType<void>(
      this.MyLooseElement.patch({
        ChildElement: {
          alpha: 1.0
        },
        ChildComponent: {
          x: 123,
          y: 123
        }
      })
    );
    /// Supports patching child Components with component specific properties
    expectType<void>(
      this.MyLooseElement.patch({
        ChildComponent: {
          itemSize: 123 // Specific to ListComponent
        }
      })
    );
    /// Supports patching in new child Component by type
    expectType<void>(
      this.MyLooseElement.patch({
        ChildComponent: {
          type: lng.components.ListComponent,
          x: 123,
          y: 123
        }
      })
    );
    /// Support patching unknown properties in Loose Elements
    this.MyLooseElement.patch({
      unknownProp: 1.0,
    });
    /// Support patching unknown child Elements in Loose Elements
    this.MyLooseElement.patch({
      UnknownChild1: undefined,
    });
    this.MyLooseElement.patch({
      UnknownChild2: {},
    });
    this.MyLooseElement.patch({
      UnknownChild3: {
        x: 123,
        y: 123
      },
    });
    // Support patching unkonwn child Elements deeply in Loose Elements
    this.MyLooseElement.patch({
      UnknownChild3: {
        UnknownGrandchild: {
          x: 123,
        }
      },
    });

    //
    // animation()
    //
    // # STRONG & LOOSE #
    /// Accepts types of known props with the correct types (value, point map, callback)
    expectType<lng.types.Animation>(this.MyStrongElement.animation({
      duration: 10,
      actions: [
        { p: 'x', v: 123 },
        { p: 'x', v: { 0: 123, 0.25: { v: 123 }, 0.75: { v: 123 }, 1: 321 } },
        { p: 'x', v: (p) => p },
        { p: 'text', v: 'abc' },
        { p: 'text', v: { 0: 'abc', 0.25: { v: 'abc' }, 0.75: { v: 'cba' }, 1: 'cba' } },
        { p: 'text', v: (p) => 'abc' },
        { p: 'rtt', v: false },
        { p: 'rtt', v: { 0: false, 0.25: { v: true }, 0.75: { v: false }, 1: true, sm: 123 } },
        { p: 'rtt', v: (p) => true },
        // Force assertions
        { p: 'texture.x' as '$$number', v: 123 },
        { p: 'texture.x' as '$$number', v: { 0: 123, 0.25: { v: 123 }, 0.75: { v: 123 }, 1: 321 } },
        { p: 'texture.x' as '$$number', v: (p) => p },
        { p: 'text.wordWrap' as '$$boolean', v: true },
        { p: 'text.wordWrap' as '$$boolean', v: true },
        { p: 'text.wordWrap' as '$$boolean', v: true },
        { p: 'text.text' as '$$string', v: 'abc' },
        { p: 'text.text' as '$$string', v: { 0: 'abc', 0.25: { v: 'abc' }, 0.75: { v: 'cba' }, 1: 'cba' } },
        { p: 'text.text' as '$$string', v: (p) => 'abc'}
      ]
    }));
    expectType<lng.types.Animation>(this.MyLooseElement.animation({
      duration: 10,
      actions: [
        { p: 'x', v: 123 },
        { p: 'x', v: { 0: 123, 0.25: { v: 123 }, 0.75: { v: 123 }, 1: 321 } },
        { p: 'x', v: (p) => p },
        { p: 'text', v: 'abc' },
        { p: 'text', v: { 0: 'abc', 0.25: { v: 'abc' }, 0.75: { v: 'cba' }, 1: 'cba' } },
        { p: 'text', v: (p) => 'abc' },
        { p: 'rtt', v: false },
        { p: 'rtt', v: { 0: false, 0.25: { v: true }, 0.75: { v: false }, 1: true, sm: 123 } },
        { p: 'rtt', v: (p) => true },
        // Force assertions
        { p: 'texture.x' as '$$number', v: 123 },
        { p: 'texture.x' as '$$number', v: { 0: 123, 0.25: { v: 123 }, 0.75: { v: 123 }, 1: 321 } },
        { p: 'texture.x' as '$$number', v: (p) => p },
        { p: 'text.wordWrap' as '$$boolean', v: true },
        { p: 'text.wordWrap' as '$$boolean', v: true },
        { p: 'text.wordWrap' as '$$boolean', v: true },
        { p: 'text.text' as '$$string', v: 'abc' },
        { p: 'text.text' as '$$string', v: { 0: 'abc', 0.25: { v: 'abc' }, 0.75: { v: 'cba' }, 1: 'cba' } },
        { p: 'text.text' as '$$string', v: (p) => 'abc'}
      ]
    }));

    /// Properties animated with varying boolean values work properly (special case required due to former bug)
    this.MyStrongElement.animation({
      duration: 10,
      actions: [
        { p: 'rtt', v: { 0: false, 0.25: { v: true }, 0.75: { v: false }, 1: true, sm: 123 } },
      ]
    });
    this.MyLooseElement.animation({
      duration: 10,
      actions: [
        { p: 'rtt', v: { 0: false, 0.25: { v: true }, 0.75: { v: false }, 1: true, sm: 123 } },
      ]
    });

    /// Types of known props in Loose Elements must still be the correct type
    this.MyStrongElement.animation({
      duration: 10,
      actions: [
        // @ts-expect-error x should be a number not a string
        { p: 'x', v: 'abc' },
        // @ts-expect-error
        { p: 'x', v: { 0: 'abc', 1: 'abc' } },
        // @ts-expect-error
        { p: 'x', v: { 0: { v: 'abc' }, 1: { v: 'abc' } } },
        // @ts-expect-error
        { p: 'x', v: (p) => 'abc' },
        // @ts-expect-error text should be a string and not a boolean
        { p: 'text', v: true },
        // @ts-expect-error
        { p: 'text', v: { 0: true, 1: true } },
        // @ts-expect-error
        { p: 'text', v: { 0: { v: true }, 1: { v: true } } },
        // @ts-expect-error
        { p: 'text', v: (p) => false },
        // @ts-expect-error rtt should be a boolean not a number
        { p: 'rtt', v: 123 },
        // @ts-expect-error
        { p: 'rtt', v: { 0: 123, 1: 123 } },
        // @ts-expect-error
        { p: 'rtt', v: { 0: { v: 123 }, 1: { v: 123 } } },
        // @ts-expect-error
        { p: 'rtt', v: (p) => 123 },
        // Force assertions
        // @ts-expect-error
        { p: 'texture.x' as '$$number', v: true },
        // @ts-expect-error
        { p: 'texture.x' as '$$number', v: { 0: true, 0.25: { v: true }, 0.75: { v: true }, 1: false } },
        // @ts-expect-error
        { p: 'texture.x' as '$$number', v: (p) => false },
        // @ts-expect-error
        { p: 'text.wordWrap' as '$$boolean', v: 'abc' },
        // @ts-expect-error
        { p: 'text.wordWrap' as '$$boolean', v: 'abc' },
        // @ts-expect-error
        { p: 'text.wordWrap' as '$$boolean', v: 'abc' },
        // @ts-expect-error
        { p: 'text.text' as '$$string', v: 123 },
        // @ts-expect-error
        { p: 'text.text' as '$$string', v: { 0: 123, 0.25: { v: 123 }, 0.75: { v: 123 }, 1: 123 } },
        // @ts-expect-error
        { p: 'text.text' as '$$string', v: (p) => 123}
      ]
    });
    this.MyLooseElement.animation({
      duration: 10,
      actions: [
        // @ts-expect-error x should be a number not a string
        { p: 'x', v: 'abc' },
        // @ts-expect-error
        { p: 'x', v: { 0: 'abc', 1: 'abc' } },
        // @ts-expect-error
        { p: 'x', v: { 0: { v: 'abc' }, 1: { v: 'abc' } } },
        // @ts-expect-error
        { p: 'x', v: (p) => 'abc' },
        // @ts-expect-error text should be a string and not a boolean
        { p: 'text', v: true },
        // @ts-expect-error
        { p: 'text', v: { 0: true, 1: true } },
        // @ts-expect-error
        { p: 'text', v: { 0: { v: true }, 1: { v: true } } },
        // @ts-expect-error
        { p: 'text', v: (p) => false },
        // @ts-expect-error rtt should be a boolean not a number
        { p: 'rtt', v: 123 },
        // @ts-expect-error
        { p: 'rtt', v: { 0: 123, 1: 123 } },
        // @ts-expect-error
        { p: 'rtt', v: { 0: { v: 123 }, 1: { v: 123 } } },
        // @ts-expect-error
        { p: 'rtt', v: (p) => 123 },
        // @ts-expect-error
        { p: 'texture.x' as '$$number', v: true },
        // @ts-expect-error
        { p: 'texture.x' as '$$number', v: { 0: true, 0.25: { v: true }, 0.75: { v: true }, 1: false } },
        // @ts-expect-error
        { p: 'texture.x' as '$$number', v: (p) => false },
        // @ts-expect-error
        { p: 'text.wordWrap' as '$$boolean', v: 'abc' },
        // @ts-expect-error
        { p: 'text.wordWrap' as '$$boolean', v: 'abc' },
        // @ts-expect-error
        { p: 'text.wordWrap' as '$$boolean', v: 'abc' },
        // @ts-expect-error
        { p: 'text.text' as '$$string', v: 123 },
        // @ts-expect-error
        { p: 'text.text' as '$$string', v: { 0: 123, 0.25: { v: 123 }, 0.75: { v: 123 }, 1: 123 } },
        // @ts-expect-error
        { p: 'text.text' as '$$string', v: (p) => 123}
      ]
    });

    /// Types of non-animatable props should error
    this.MyStrongElement.animation({
      duration: 10,
      actions: [
        // @ts-expect-error Non-animatable prop types are not allowed
        { p: 'smooth', v: {} },
        // @ts-expect-error Non-animatable prop types are not allowed
        { p: 'transitions', v: {} },
      ]
    });
    this.MyLooseElement.animation({
      duration: 10,
      actions: [
        // @ts-expect-error Non-animatable prop types are not allowed
        { p: 'smooth', v: {} },
        // @ts-expect-error Non-animatable prop types are not allowed
        { p: 'transitions', v: {} },
      ]
    });

    /// Component specific props are checked
    this.TestComponent.animation({
      duration: 10,
      actions: [
        { p: 'itemSize', v: 123 }, // 'itemSize' is specific to TestComponent
        // @ts-expect-error 'itemSize' needs to be number
        { p: 'itemSize', v: 'abc' }
      ]
    });


    // # LOOSE ONLY #
    /// Loose Elements allow any unknown props to be any value
    this.MyLooseElement.animation({
      duration: 10,
      actions: [
        { p: 'unknown1', v: 123 },
        { p: 'unknown2', v: 'abc' },
        { p: 'unknown3', v: true },
        { p: 'unknown1', v: { 0: 'abc', 0.25: { v: 'abc' }, 0.75: 'cba', 1.0: 'cba', sm: 5 } },
        { p: 'unknown2', v: { 0: true, 0.25: { v: true }, 0.75: { v: false }, 1.0: false, sm: 5 } },
        { p: 'unknown3', v: { 0: 123, 0.25: { v: 123 }, 0.75: { v: 321 }, 1.0: 321, sm: 5 } },
        { p: 'unknown1', v: (p: number) => 123 },
        { p: 'unknown2', v: (p: number) => true },
        { p: 'unknown3', v: (p: number) => 'abc' },
      ]
    });

    //
    // transition()
    //
    // # STRONG #
    expectType<lng.types.Transition>(this.MyStrongElement.transition('x'));
    expectType<lng.types.Transition>(this.MyStrongElement.transition('alpha'));
    expectType<null>(this.MyStrongElement.transition('x', { delay: 0, duration: 10 }));
    expectType<null>(this.MyStrongElement.transition('alpha', { delay: 0, timingFunction: 'ease-in' }));
    // Should be able to get / set transitions for non-numeric properties
    expectType<lng.types.Transition>(this.MyStrongElement.transition('rtt'));
    expectType<lng.types.Transition>(this.MyStrongElement.transition('text'));
    expectType<null>(this.MyStrongElement.transition('rtt', { duration: 10 }));
    expectType<null>(this.MyStrongElement.transition('text', { duration: 10 }));
    // @ts-expect-error But not non-animatable properties
    this.MyStrongElement.transition('smooth');
    // @ts-expect-error
    this.MyStrongElement.transition('smooth', { duration: 10 });
    // @ts-expect-error Should not be able to get / set transition unknown properties
    this.MyStrongElement.transition('INVALID_PROP');
    // @ts-expect-error
    this.MyStrongElement.transition('INVALID_PROP', { duration: 10 });
    // Strongly typed property paths are not supported (due to typescript limitations). The following should error:
    // @ts-expect-error
    this.MyStrongElement.transition('texture.x');
    // @ts-expect-error
    this.MyStrongElement.transition('texture.x', { duration: 10 });
    // @ts-expect-error
    this.MyStrongElement.transition('texture.INVALID_PROP.INVALID_PROP');
    // @ts-expect-error
    this.MyStrongElement.transition('texture.INVALID_PROP.INVALID_PROP', { duration: 10 });
    // If the developer wants to use property paths, they can opt-in via `as any`
    expectType<lng.types.Transition>(this.MyStrongElement.transition('texture.x' as any));
    expectType<lng.types.Transition>(this.MyStrongElement.transition('texture.INVALID_PROP.INVALID_PROP' as any));
    expectType<null>(this.MyStrongElement.transition('texture.x' as any, { timingFunction: 'ease-in' }));
    expectType<null>(this.MyStrongElement.transition('texture.INVALID_PROP.INVALID_PROP' as any, { timingFunction: 'ease-in' }));

    // # LOOSE #
    expectType<lng.types.Transition>(this.MyLooseElement.transition('x'));
    expectType<lng.types.Transition>(this.MyLooseElement.transition('alpha'));
    expectType<null>(this.MyLooseElement.transition('x', { delay: 0, duration: 10 }));
    expectType<null>(this.MyLooseElement.transition('alpha', { delay: 0, timingFunction: 'ease-in' }));
    // Loose elements will allow any unknown prop to be set / gotten
    expectType<lng.types.Transition>(this.MyLooseElement.transition('INVALID_PROP'));
    expectType<null>(this.MyLooseElement.transition('INVALID_PROP', { duration: 10 }));
    // Even props that aren't numeric....
    expectType<lng.types.Transition>(this.MyLooseElement.transition('rtt'));
    expectType<lng.types.Transition>(this.MyLooseElement.transition('text'));
    expectType<null>(this.MyLooseElement.transition('rtt', { delay: 10 }));
    expectType<null>(this.MyLooseElement.transition('text', { timingFunction: 'ease-out' }));
    // @ts-expect-error Cannot get / set non-animatable properties
    this.MyLooseElement.transition('smooth');
    // @ts-expect-error
    this.MyLooseElement.transition('smooth', { duration: 10 });
    // Property paths are implicitly supported by loose Elements.
    expectType<lng.types.Transition>(this.MyLooseElement.transition('texture.x'));
    expectType<lng.types.Transition>(this.MyLooseElement.transition('texture.INVALID_PROP.INVALID_PROP'));
    expectType<null>(this.MyLooseElement.transition('texture.x', { duration: 10 }));
    expectType<null>(this.MyLooseElement.transition('texture.INVALID_PROP.INVALID_PROP', { timingFunction: 'step-start' }));
    // The `as any` case should still work for loose Elements
    expectType<lng.types.Transition>(this.MyLooseElement.transition('texture.x' as any));
    expectType<lng.types.Transition>(this.MyLooseElement.transition('texture.INVALID_PROP.INVALID_PROP' as any));
    expectType<null>(this.MyLooseElement.transition('texture.x' as any, { duration: 10 }));
    expectType<null>(this.MyLooseElement.transition('texture.INVALID_PROP.INVALID_PROP' as any, { timingFunction: 'step-start' }));
    //
    // fastForward()
    //
    // # STRONG #
    expectType<void>(this.MyStrongElement.fastForward('x'));
    expectType<void>(this.MyStrongElement.fastForward('alpha'));
    // Should be able to fastForward non-numeric properties
    this.MyStrongElement.fastForward('rtt');
    this.MyStrongElement.fastForward('visible');
    // @ts-expect-error But not non-animatable properties
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
    // Even props that aren't numeric....
    expectType<void>(this.MyLooseElement.fastForward('rtt'));
    expectType<void>(this.MyLooseElement.fastForward('text'));
    // @ts-expect-error Cannot get non-animatable proprties
    this.MyLooseElement.fastForward('smooth');
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
    // Can set non-numeric properties (AnimatableValueTypes)
    this.MyStrongElement.transitions = {
      rtt: {
        delay: 123,
        duration: 123,
        timingFunction: 'ease-out'
      },
      text: {
        delay: 123,
        duration: 123,
        timingFunction: 'ease-out'
      },
    };
    // Can't set non-animatable properties
    this.MyStrongElement.transitions = {
      // @ts-expect-error
      smooth: {
        delay: 123,
        duration: 123,
        timingFunction: 'ease-out'
      },
      // @ts-expect-error
      transitions: {
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
    // Can set non-numeric properties (AnimatableValueTypes)
    this.MyLooseElement.transitions = {
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
    expectType<
      SmoothTemplate<
        InlineElement<{ ChildElement: {}; ChildComponent: typeof ListComponent; }>
      > | undefined
    >(this.MyStrongElement.smooth);
    this.MyStrongElement.smooth = {
      alpha: 1.0,
      x: 123,
      w: 123,
      visible: false,
      text: 'abc',
      // @ts-expect-error Type must match type of property
      rtt: 123, // rtt is a boolean
      // @ts-expect-error Type must match type of property
      renderToTexture: [123, { delay: 0, duration: 10, timingFunction: 'ease-in' }], // renderToTexture is a boolean
      // @ts-expect-error Should not be able to set non-animatable properties
      smooth: {},
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
          visible: false,
          text: 'abc',
          // @ts-expect-error Type must match type of property
          rtt: 123, // rtt is a boolean
          // @ts-expect-error Type must match type of property
          renderToTexture: [123, { delay: 0, duration: 10, timingFunction: 'ease-in' }], // renderToTexture is a boolean
          // @ts-expect-error Should not be able to set non-animatable properties
          smooth: {},
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
      visible: false,
      text: 'abc',
      // @ts-expect-error Type must match type of property
      rtt: 123, // rtt is a boolean
      // @ts-expect-error Type must match type of property
      renderToTexture: [123, { delay: 0, duration: 10, timingFunction: 'ease-in' }], // renderToTexture is a boolean
      // @ts-expect-error Should not be able to set non-animatable properties
      smooth: {},
      // Smooth can set unknown properties as a non-number/tuple
      INVALID_PROP1: 'this cannot be a string',
      // And it can set them as numbers / tuples
      INVALID_PROP2: 123,
      // Smooth can set unknown properties to a string
      INVALID_PROP3: ['abc', { delay: 0, duration: 10, timingFunction: 'ease-in' }],
    };

    this.patch({
      MyLooseElement: {
        smooth: {
          alpha: 1.0,
          x: 123,
          w: 123,
          visible: false,
          text: ['abc', { delay: 0 }],
          // @ts-expect-error Type must match type of property
          rtt: 123, // rtt is a boolean
          // @ts-expect-error Type must match type of property
          renderToTexture: [123, { delay: 0, duration: 10, timingFunction: 'ease-in' }], // renderToTexture is a boolean
          // @ts-expect-error Should not be able to set non-animatable properties
          smooth: {},
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
    // Should be able to getSmooth on non-numeric properties (AnimatableValueTypes)
    expectType<boolean | undefined>(this.MyStrongElement.getSmooth('rtt'));
    expectType<string | undefined>(this.MyStrongElement.getSmooth('text'));

    // @ts-expect-error But second parameter's type needs to match
    this.MyStrongElement.getSmooth('rtt', 123); // rtt is a boolean, 123 isn't compatible
    // @ts-expect-error
    this.MyStrongElement.getSmooth('visible', 123);
    // @ts-expect-error Cannot get non-animatable properties
    this.MyStrongElement.getSmooth('smooth');
    // @ts-expect-error
    this.MyStrongElement.getSmooth('smooth', {});
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
    expectType<any>(this.MyStrongElement.getSmooth('texture.x' as any));
    expectType<number>(this.MyStrongElement.getSmooth('texture.x' as any, 123));
    expectType<boolean>(this.MyStrongElement.getSmooth('texture.INVALID_PROP.INVALID_PROP' as any, true));
    expectType<string>(this.MyStrongElement.getSmooth('texture.INVALID_PROP.INVALID_PROP' as any, 'abc'));

    // # LOOSE #
    expectType<number| undefined>(this.MyLooseElement.getSmooth('x'));
    expectType<number>(this.MyLooseElement.getSmooth('alpha', 123));
    // Loose elements will allow any unknown prop to be gotten
    expectType<any>(this.MyLooseElement.getSmooth('INVALID_PROP'));
    expectType<number>(this.MyLooseElement.getSmooth('INVALID_PROP', 123));
    // @ts-expect-error But for known props the second parameter type must match the type of the property
    this.MyLooseElement.getSmooth('rtt', 123); // Should be boolean
    // @ts-expect-error
    this.MyLooseElement.getSmooth('visible', 123); // Should be boolean
    // @ts-expect-error
    this.MyLooseElement.getSmooth('text', 123); // Should be String
    // Non-animatable properties are not gettable:
    // @ts-expect-error
    this.MyLooseElement.getSmooth('smooth', {});
    // @ts-expect-error
    this.MyLooseElement.getSmooth('smooth');
    // Known props that are strings / boolean are supported (AnimatableValueTypes)
    this.MyLooseElement.getSmooth('rtt', true);
    this.MyLooseElement.getSmooth('visible', false);
    this.MyLooseElement.getSmooth('text', 'abc');
    // Property paths are implicitly supported by loose Elements.
    expectType<any>(this.MyLooseElement.getSmooth('texture.x'));
    expectType<number>(this.MyLooseElement.getSmooth('texture.INVALID_PROP.INVALID_PROP', 123));
    // Unknown props can be set with a string
    this.MyLooseElement.getSmooth('INVALID_PROP', 'strings are allowed');
    // The `as any` case should still work for loose Elements
    expectType<any>(this.MyLooseElement.getSmooth('texture.x' as any));
    expectType<number>(this.MyLooseElement.getSmooth('texture.INVALID_PROP.INVALID_PROP' as any, 123));

    //
    // add()
    //
    /// Infers component type from `type`
    expectType<ListComponent>(this.MyStrongElement.add({
      type: ListComponent,
      itemSize: 123
    }));
    /// If `type` isn't provided, it infers Element
    expectType<lng.Element>(this.MyStrongElement.add({
      x: 123,
      y: 123
    }));
    /// If you pass an Element directly you get that element back
    expectType<typeof this.MyLooseElement>(this.MyStrongElement.add(this.MyLooseElement));
    expectType<typeof this.TestComponent>(this.MyStrongElement.add(this.TestComponent));
    /// If you pass an array, you get `null` back
    expectType<null>(this.MyStrongElement.add([this.MyLooseElement, this.TestComponent]));
  }
}

const element: lng.Element<lng.Element.TemplateSpec> = {} as any;

element.setSmooth('x', 12);
element.setSmooth('y', 12);