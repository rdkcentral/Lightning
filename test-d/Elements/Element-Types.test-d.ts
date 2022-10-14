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
 * Unit tests for the Element types / type utilities
 *
 * @module
 */
import { expectAssignable, expectType } from 'tsd';
import lng from '../../index.js';
import { CompileComponentTemplateSpecType } from '../../src/application/Component.mjs';
import { SignalMapType } from '../../src/internalTypes.mjs';
import { InlineElement, IsLooseTemplateSpec, SmoothTemplate, TaggedElements, TemplateSpecRefs, TransformPossibleElement, TransitionsTemplate } from '../../src/tree/Element.mjs';

export interface TestTemplateSpec extends lng.Component.TemplateSpec {
  prop1: string;
  prop2: number;
  prop3: boolean;
  MyStrongElement_InlineEmpty: {};
  MyStrongElement_InlineEmpty2: object;
  MyStrongElement_ExplicitType: typeof lng.Element<lng.Element.TemplateSpec>;
  MyLooseElement: typeof lng.Element;
  MyListComponent: typeof lng.components.ListComponent;
  MyStrongElement_InlineChildren: {
    Child1: {},
    Child2: object,
    Child3: typeof lng.Element<lng.Element.TemplateSpec>,
    Child4: typeof lng.components.ListComponent,
    Child5: {
      GrandChild1: object
    }
  }
}

//
// InlineElement (private)
//
function InlineElement_Test() {
  // Should filter out all keys that do not begin with a capital letter (aka. valid ref strings)
  type T100 = InlineElement<{
    ValidRef: string,
    invalidRef: string,
    AnotherValidRef: number,
    anotherInvalidRef: number,
    SomeOtherValidRef: {
      ChildValidRef: string,
      childInvalidRef: string
    },
    someOtherInvalidRef: {
      ChildValidRef: string,
      childInvalidRef: string
    }
  }>
  expectType<{
        ValidRef: string;
        AnotherValidRef: number;
        SomeOtherValidRef: {
            ChildValidRef: string;
            childInvalidRef: string; // This is OK because InlineElement is not recursive
        };
    } & lng.Element.TemplateSpec & {
        smooth: SmoothTemplate<lng.Element.TemplateSpec>;
        transitions: TransitionsTemplate<lng.Element.TemplateSpec>;
    }
  >({} as T100);
}

//
// TransformPossibleElement
//
function TransformPossibleElement_Test() {
  /// If `Key` is a valid ref string (i.e. begins with a capital letter) then transform it to an Element/Component instance type
  // Strong Element (implicit inline, empty)
  type T100 = TransformPossibleElement<'ValidRef', TestTemplateSpec['MyStrongElement_InlineEmpty']>;
  expectType<
    lng.Element<InlineElement<{}>>
  >({} as T100);
  // Strong Element (explicit type)
  type T200 = TransformPossibleElement<'ValidRef', TestTemplateSpec['MyStrongElement_ExplicitType']>;
  expectType<
    lng.Element<lng.Element.TemplateSpec>
  >({} as T200);
  // Loose Element
  type T300 = TransformPossibleElement<'ValidRef', TestTemplateSpec['MyLooseElement']>;
  expectType<
    lng.Element<lng.Element.TemplateSpecLoose>
  >({} as T300);
  // Component
  type T400 = TransformPossibleElement<'ValidRef', TestTemplateSpec['MyListComponent']>;
  expectType<lng.components.ListComponent>({} as T400);
  // Strong Element (implicit inline, children)
  type T550 = TransformPossibleElement<'ValidRef', TestTemplateSpec['MyStrongElement_InlineChildren']>;
  expectType<
    lng.Element<
      InlineElement<{
        Child1: {};
        Child2: object;
        Child3: typeof lng.Element<lng.Element.TemplateSpec>;
        Child4: typeof lng.components.ListComponent;
        Child5: { GrandChild1: object };
      }>
    >
  >({} as T550);

  /// If the `Key` is not a valid ref (i.e. doesn't begin with a capital letter) then it shouldn't be transformed
  type T500 = TransformPossibleElement<'invalidRef', TestTemplateSpec['MyStrongElement_InlineEmpty']>;
  expectType<TestTemplateSpec['MyStrongElement_InlineEmpty']>({} as T500);
  type T600 = TransformPossibleElement<'invalidRef', TestTemplateSpec['MyStrongElement_ExplicitType']>;
  expectType<TestTemplateSpec['MyStrongElement_ExplicitType']>({} as T600);
  type T700 = TransformPossibleElement<'invalidRef', TestTemplateSpec['MyLooseElement']>;
  expectType<TestTemplateSpec['MyLooseElement']>({} as T700);
  type T800 = TransformPossibleElement<'invalidRef', TestTemplateSpec['MyListComponent']>;
  expectType<TestTemplateSpec['MyListComponent']>({} as T800);
  type T900 = TransformPossibleElement<'invalidRef', TestTemplateSpec['MyStrongElement_InlineEmpty']>;
  expectType<TestTemplateSpec['MyStrongElement_InlineEmpty']>({} as T900);

  /// If `Key` is any `string` then we should return anything
  type T1000 = TransformPossibleElement<string, TestTemplateSpec['MyStrongElement_InlineEmpty']>;
  expectType<any>({} as T1000);
  type T1100 = TransformPossibleElement<string, TestTemplateSpec['MyStrongElement_ExplicitType']>;
  expectType<any>({} as T1100);
  type T1200 = TransformPossibleElement<string, TestTemplateSpec['MyLooseElement']>;
  expectType<any>({} as T1200);
  type T1300 = TransformPossibleElement<string, TestTemplateSpec['MyListComponent']>;
  expectType<any>({} as T1300);
  type T1400 = TransformPossibleElement<string, TestTemplateSpec['MyStrongElement_InlineEmpty']>;
  expectType<any>({} as T1400);

  /// The Default for standard prop keys (non-ref keys) is the actual value type
  type T1500 = TransformPossibleElement<'x', number>;
  expectType<number>({} as T1500);

  /// The Default for standard prop keys (non-ref keys) can be changed
  type T1600 = TransformPossibleElement<'x', number, string>;
  expectType<string>({} as T1600);
}



//
// PatchTemplateArray
//
function PatchTemplateArray_Test() {
  // Plain PatchTemplateArray is an array of PatchTemplates for lng.Element
  let t100: lng.Element.PatchTemplateArray = [];
  expectType<
    Array<
      lng.Element.PatchTemplate<InstanceType<typeof lng.Element>['__$type_TemplateSpec']>
    >
  >(t100);

  // Specific PatchTemplateArray for a Component requires a `type`
  let t200: lng.Element.PatchTemplateArray<typeof lng.components.BloomComponent> = [
    { type: lng.components.BloomComponent }
  ];
  expectAssignable<Array<lng.Element.PatchTemplate>>(t200);
  expectType<
    Array<
      { type: typeof lng.components.BloomComponent } &
      lng.Element.PatchTemplate<lng.components.BloomComponent['__$type_TemplateSpec']>
    >
  >(t200);
  t200 = [
    // @ts-expect-error `type` is required
    {}
  ];
  t200 = [
    // @ts-expect-error The correct `type` is required
    { type: lng.Component }
  ]

  // Break free of any limitations with `any`
  let t300: lng.Element.PatchTemplateArray<any> = [
    { type: lng.components.BloomComponent },
  ];
}

//
// PatchTemplate
//
function PatchTemplate_Test() {
  /// Should be settable as expected
  type T100 = lng.Element.PatchTemplate<TestTemplateSpec>;
  const t100: T100 = {
    alpha: 123,
    text: 'abc',
    MyStrongElement_ExplicitType: {
      color: 123,
      mount: 123,
      smooth: {
        h: 123
      }
    },
    MyStrongElement_InlineEmpty: {
      color: 123,
      mount: 123,
      smooth: {
        h: 123
      }
    },
    MyLooseElement: {
      h: 123,
      ANYTHING: 123
    },
    MyListComponent: {
      itemSize: 123,
    },
    MyStrongElement_InlineChildren: {
      alpha: 123,
      Child1: {
        color: 123,
      },
      Child3: {
        text: 'abc',
      },
      Child4: {
        itemSize: 123
      }
    }
  };
  /// Each ref key of the TemplateSpec should matched the appropriate recursed PatchTemplate
  // Strong Element (inline empty)
  type T200 = T100['MyStrongElement_InlineEmpty'];
  expectType<
    lng.Element.PatchTemplate<InlineElement<{}>> | undefined
  >({} as T200);
  // Strong Element (explicity type)
  type T300 = T100['MyStrongElement_ExplicitType'];
  expectType<
    lng.Element.PatchTemplate<lng.Element.TemplateSpec & {
        smooth: SmoothTemplate<lng.Element.TemplateSpec>;
    }> | undefined
  >({} as T300);
  // Loose element
  type T400 = T100['MyLooseElement'];
  expectType<
    lng.Element.PatchTemplate<lng.Element.TemplateSpecLoose & {
        smooth: SmoothTemplate<lng.Element.TemplateSpecLoose>;
        transitions: TransitionsTemplate<lng.Element.TemplateSpecLoose>;
    }> | undefined
  >({} as T400);
  // Component
  type T500 = T100['MyListComponent'];
  expectType<
    {
      type?: typeof lng.components.ListComponent | undefined;
    } &
    lng.Element.PatchTemplate<
      CompileComponentTemplateSpecType<
        lng.components.ListComponent.TemplateSpec,
        lng.Component.TypeConfig
      >
    >
    | undefined
  >({} as T500);
  // Strong Element (inline w/ child elements/components)
  type T600 = T100['MyStrongElement_InlineChildren'];
  expectType<
    lng.Element.PatchTemplate<
      InlineElement<{
        Child1: {};
        Child2: object,
        Child3: typeof lng.Element<lng.Element.TemplateSpec>,
        Child4: typeof lng.components.ListComponent,
        Child5: {
          GrandChild1: object
        }
      }>
    > | undefined
  >({} as T600);
}

//
// TemplateSpecRefs
//
function TemplateSpecRefs_Test() {
  /// Should remove all prop keys and resolve Element / Component types
  type T1000 = TemplateSpecRefs<TestTemplateSpec>;
  expectType<{
    MyStrongElement_InlineEmpty: lng.Element<InlineElement<{}>>;
    MyStrongElement_InlineEmpty2: lng.Element<InlineElement<object>>;
    MyStrongElement_ExplicitType: lng.Element<lng.Element.TemplateSpec>;
    MyLooseElement: lng.Element;
    MyListComponent:lng.components.ListComponent;
    MyStrongElement_InlineChildren: lng.Element<InlineElement<TestTemplateSpec['MyStrongElement_InlineChildren']>>;
  }>({} as T1000);
}

//
// TaggedElements
//
function TaggedElements_Test() {
  /// Strong template specs returns flat tag path map
  type T1000 = TaggedElements<TestTemplateSpec>;
  expectType<{
    'MyStrongElement_InlineEmpty': lng.Element<InlineElement<{}>>;
    'MyStrongElement_InlineEmpty2': lng.Element<InlineElement<object>>;
    'MyStrongElement_ExplicitType': lng.Element<lng.Element.TemplateSpec>;
    'MyLooseElement': lng.Element;
    'MyListComponent': lng.components.ListComponent;
    'MyStrongElement_InlineChildren': lng.Element<InlineElement<TestTemplateSpec['MyStrongElement_InlineChildren']>>;
    'MyStrongElement_InlineChildren.Child1': lng.Element<InlineElement<{}>>;
    'MyStrongElement_InlineChildren.Child2': lng.Element<InlineElement<object>>;
    'MyStrongElement_InlineChildren.Child3': lng.Element<lng.Element.TemplateSpec>;
    'MyStrongElement_InlineChildren.Child4': lng.components.ListComponent;
    'MyStrongElement_InlineChildren.Child5': lng.Element<InlineElement<TestTemplateSpec['MyStrongElement_InlineChildren']['Child5']>>;
    'MyStrongElement_InlineChildren.Child5.GrandChild1': lng.Element<InlineElement<object>>;
  }>({} as T1000);

  /// Loose template specs return empty object type
  type T2000 = TaggedElements<TestTemplateSpec & lng.Component.TemplateSpecLoose>;
  expectType<{}>({} as T2000);
}

//
// IsLooseTemplateSpec
//
function IsLooseTemplateSpec_Test() {
  /// Strong template specs return `false`
  expectType<false>({} as IsLooseTemplateSpec<lng.Element.TemplateSpec>);
  expectType<false>({} as IsLooseTemplateSpec<lng.Component.TemplateSpec>);
  expectType<false>({} as IsLooseTemplateSpec<TestTemplateSpec>);

  /// Strong template specs return `true`
  expectType<true>({} as IsLooseTemplateSpec<lng.Element.TemplateSpecLoose>);
  expectType<true>({} as IsLooseTemplateSpec<lng.Component.TemplateSpecLoose>);
  expectType<true>({} as IsLooseTemplateSpec<TestTemplateSpec & lng.Component.TemplateSpecLoose>);
}