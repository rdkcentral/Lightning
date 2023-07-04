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
import { expectAssignable, expectError, expectNotAssignable, expectType } from "tsd";
import { CombineTagPaths, CombineTagPathsSingleLevel, EventMapType, IsTerminus, Join, ReduceSpecificity, SignalMapType, SpecToTagPaths, TextureType, ValidRef } from "../src/internalTypes.mjs";
import Application from '../src/application/Application.mjs';
import Component from '../src/application/Component.mjs';
import Element from '../src/application/Component.mjs';
import Texture from "../src/tree/Texture.mjs";

function ReduceSpecificity_Tests() {
  /// Should work for a single type passed to param U
  function IndividualTypes() {
    /// string
    expectType<string>({} as ReduceSpecificity<'string literal', string>);
    expectType<string>({} as ReduceSpecificity<'another string literal', string>);
    expectType<never>({} as ReduceSpecificity<32472398, string>);
    expectType<never>({} as ReduceSpecificity<true, string>);
    expectType<never>({} as ReduceSpecificity<false, string>);
    /// boolean (special case)
    expectType<boolean>({} as ReduceSpecificity<true, boolean>);
    expectType<boolean>({} as ReduceSpecificity<false, boolean>);
    expectType<never>({} as ReduceSpecificity<'not a boolean', boolean>);
    /// number
    expectType<number>({} as ReduceSpecificity<1234, number>);
    expectType<number>({} as ReduceSpecificity<4321, number>);
    expectType<never>({} as ReduceSpecificity<true, number>);
    expectType<never>({} as ReduceSpecificity<false, number>);

    /// Should be able to reflect already non-specific in param T types back
    function Identity() {
      expectType<number>({} as ReduceSpecificity<number, number>);
      expectType<boolean>({} as ReduceSpecificity<boolean, boolean>);
      expectType<string>({} as ReduceSpecificity<string, string>);
    }
  }

  /// Should work for a union of types in param U
  function MultipleTypes() {
    expectType<string>({} as ReduceSpecificity<'string literal', string | boolean | number>);
    expectType<string>({} as ReduceSpecificity<'another string literal', string | boolean | number>);
    expectType<number>({} as ReduceSpecificity<1234, string | boolean | number>);
    expectType<number>({} as ReduceSpecificity<4321, string | boolean | number>);
    expectType<boolean>({} as ReduceSpecificity<true, string | boolean | number>);
    expectType<boolean>({} as ReduceSpecificity<false, string | boolean | number>);

    /// Should be able to reflect already non-specific in param T types back
    function Identity() {
      expectType<number>({} as ReduceSpecificity<number, string | boolean | number>);
      expectType<boolean>({} as ReduceSpecificity<boolean, string | boolean | number>);
      expectType<string>({} as ReduceSpecificity<string, string | boolean | number>);
    }
  }

}


function EventMapType_Tests() {
  expectType<Element.EventMap>({} as EventMapType<Element.TypeConfig>);
  expectType<Component.EventMap>({} as EventMapType<Component.TypeConfig>);
  expectType<Application.EventMap>({} as EventMapType<Application.TypeConfig>);

  interface MyComponentEventMap extends Component.EventMap {
    myEvent(): void;
  }
  interface MyComponentTypeConfig extends Component.TypeConfig {
    EventMapType: MyComponentEventMap
  }
  expectType<MyComponentEventMap>({} as EventMapType<MyComponentTypeConfig>);

  // @ts-expect-error Providing an empty object type is not supported
  type T1000 = EventMapType<{}>;
}

function TextureType_Tests() {
  expectType<Texture>({} as TextureType<Element.TypeConfig>);
  expectType<Texture>({} as TextureType<Component.TypeConfig>);
  expectType<Texture>({} as TextureType<Application.TypeConfig>);

  // @ts-expect-error Providing an empty object type is not supported
  type T1000 = TextureType<{}>;
}

function SignalMapType_Tests() {
  expectType<Component.SignalMap>({} as SignalMapType<Component.TypeConfig>);

  interface MyComponentSignalMap extends Component.SignalMap {
    myEvent(): void;
  }
  interface MyComponentTypeConfig extends Component.TypeConfig {
    SignalMapType: MyComponentSignalMap
  }
  expectType<MyComponentSignalMap>({} as SignalMapType<MyComponentTypeConfig>);

  // @ts-expect-error Providing an empty object type is not supported
  type T1000 = SignalMapType<{}>;
}

function ValidRef_Tests() {
  /// Should allow all strings that begin with a capital letter to be assigned
  expectAssignable<ValidRef>('Apple');
  expectAssignable<ValidRef>('Blueberry');
  expectAssignable<ValidRef>('Cat');
  expectAssignable<ValidRef>('Dog');
  expectAssignable<ValidRef>('Earth');
  expectAssignable<ValidRef>('Farm');
  expectAssignable<ValidRef>('Gorge');
  expectAssignable<ValidRef>('Horse');
  expectAssignable<ValidRef>('Ice');
  expectAssignable<ValidRef>('Jelly');
  expectAssignable<ValidRef>('Kite');
  expectAssignable<ValidRef>('Lemon');
  expectAssignable<ValidRef>('Mango');
  expectAssignable<ValidRef>('Nest');
  expectAssignable<ValidRef>('Orange');
  expectAssignable<ValidRef>('Pineapple');
  expectAssignable<ValidRef>('Quail');
  expectAssignable<ValidRef>('Rabbit');
  expectAssignable<ValidRef>('Squirrel');
  expectAssignable<ValidRef>('Testing123');
  expectAssignable<ValidRef>('Umbrella');
  expectAssignable<ValidRef>('Vine');
  expectAssignable<ValidRef>('WaterBuffalo');
  expectAssignable<ValidRef>('Xylophone');
  expectAssignable<ValidRef>('Yak');
  expectAssignable<ValidRef>('Zebra');

  /// Should not allow any strings that begin with a lowercase letter to be assigned
  expectNotAssignable<ValidRef>('apple');
  expectNotAssignable<ValidRef>('blueberry');
  expectNotAssignable<ValidRef>('cat');
  expectNotAssignable<ValidRef>('dog');
  expectNotAssignable<ValidRef>('earth');
  expectNotAssignable<ValidRef>('farm');
  expectNotAssignable<ValidRef>('gorge');
  expectNotAssignable<ValidRef>('horse');
  expectNotAssignable<ValidRef>('ice');
  expectNotAssignable<ValidRef>('jelly');
  expectNotAssignable<ValidRef>('kite');
  expectNotAssignable<ValidRef>('lemon');
  expectNotAssignable<ValidRef>('mango');
  expectNotAssignable<ValidRef>('nest');
  expectNotAssignable<ValidRef>('orange');
  expectNotAssignable<ValidRef>('pineapple');
  expectNotAssignable<ValidRef>('quail');
  expectNotAssignable<ValidRef>('rabbit');
  expectNotAssignable<ValidRef>('squirrel');
  expectNotAssignable<ValidRef>('testing123');
  expectNotAssignable<ValidRef>('umbrella');
  expectNotAssignable<ValidRef>('vine');
  expectNotAssignable<ValidRef>('waterBuffalo');
  expectNotAssignable<ValidRef>('xylophone');
  expectNotAssignable<ValidRef>('yak');
  expectNotAssignable<ValidRef>('zebra');

  /// Should not allow any strings that begin with other characters to be assigned
  expectNotAssignable<ValidRef>('1apple');
  expectNotAssignable<ValidRef>('2blueberry');
  expectNotAssignable<ValidRef>('3cat');
  expectNotAssignable<ValidRef>('4dog');
  expectNotAssignable<ValidRef>('5earth');
  expectNotAssignable<ValidRef>('6farm');
  expectNotAssignable<ValidRef>('7gorge');
  expectNotAssignable<ValidRef>('8horse');
  expectNotAssignable<ValidRef>('9ice');
  expectNotAssignable<ValidRef>('_jelly');
  expectNotAssignable<ValidRef>('!kite');
  expectNotAssignable<ValidRef>('@lemon');
  expectNotAssignable<ValidRef>('#mango');
  expectNotAssignable<ValidRef>('$nest');
  expectNotAssignable<ValidRef>('%orange');
  expectNotAssignable<ValidRef>('^pineapple');
  expectNotAssignable<ValidRef>('&quail');
  expectNotAssignable<ValidRef>('*rabbit');
  expectNotAssignable<ValidRef>('(squirrel)');
  expectNotAssignable<ValidRef>(')testing123');
  expectNotAssignable<ValidRef>('-umbrella');
  expectNotAssignable<ValidRef>('+vine');
  expectNotAssignable<ValidRef>('=waterBuffalo');
  expectNotAssignable<ValidRef>('[xylophone]');
  expectNotAssignable<ValidRef>('{yak}');
  expectNotAssignable<ValidRef>('}zebra{');
}

function IsTerminus_Tests() {
  /// The following should be considered terminus types
  // Empty objects
  expectType<true>({} as IsTerminus<{}>);
  // Strings
  expectType<true>({} as IsTerminus<'abc'>);
  expectType<true>({} as IsTerminus<'CBA'>);
  // Numbers
  expectType<true>({} as IsTerminus<123>);
  expectType<true>({} as IsTerminus<321>);
  // Booleans
  expectType<true>({} as IsTerminus<true>);
  expectType<true>({} as IsTerminus<false>);
  // Any array
  expectType<true>({} as IsTerminus<[]>);
  expectType<true>({} as IsTerminus<['abc', 123]>);
  expectType<true>({} as IsTerminus<[true, false]>);
  expectType<true>({} as IsTerminus<[Element, typeof Element]>);
  // Element / Component Constructor
  expectType<true>({} as IsTerminus<typeof Element>);
  expectType<true>({} as IsTerminus<typeof Component>);
  // Element / Component Instance
  expectType<true>({} as IsTerminus<Element>);
  expectType<true>({} as IsTerminus<Component>);

  /// The following should NOT be considered terminus types
  // Objects with properties
  expectType<false>({} as IsTerminus<{ a: number }>);
  expectType<false>({} as IsTerminus<{ B: typeof Element }>);
  expectType<false>({} as IsTerminus<{ c: Element }>);
  expectType<false>({} as IsTerminus<{
    a: number;
    B: typeof Element;
    c: Element
  }>);
}

function SpecToTagPaths_Tests() {
  /// Direct Terminus Types
  function TerminusTypes() {
    /// Empty Object
    expectType<[[object]]>({} as SpecToTagPaths<object>);

    /// Empty Object (bracket form)
    expectType<[[{}]]>({} as SpecToTagPaths<{}>);

    /// String
    expectType<[[string]]>({} as SpecToTagPaths<string>);
    expectType<[['abc']]>({} as SpecToTagPaths<'abc'>);

    /// Number
    expectType<[[number]]>({} as SpecToTagPaths<number>);
    expectType<[[123]]>({} as SpecToTagPaths<123>);

    /// Boolean
    expectType<[[boolean]]>({} as SpecToTagPaths<boolean>);
    expectType<[[false]]>({} as SpecToTagPaths<false>);

    /// Array
    expectType<[[[]]]>({} as SpecToTagPaths<[]>);
    expectType<[[[true, 'abc']]]>({} as SpecToTagPaths<[true, 'abc']>);
    expectType<[[[Element, typeof Element]]]>({} as SpecToTagPaths<[Element, typeof Element]>);

    /// Element / Component Constructor
    expectType<[[typeof Element]]>({} as SpecToTagPaths<typeof Element>);
    expectType<[[typeof Component]]>({} as SpecToTagPaths<typeof Component>);

    /// Element Instance
    expectType<[[Element]]>({} as SpecToTagPaths<Element>);
    expectType<[[Component]]>({} as SpecToTagPaths<Component>);
  }

  /// Single Level All Terminus Types
  type T2000 = SpecToTagPaths<{
    EmptyObject: object
    EmptyObject_BracketForm: {}
    String: 'abc'
    Number: 123
    Boolean: true
    Array: []
    ElementConstructor: typeof Element
    ElementInstance: Element
  }>
  expectType<
    ["EmptyObject", [object]] |
    ["EmptyObject_BracketForm", [{}]] |
    ["String", ['abc']] |
    ["Number", [123]] |
    ["Boolean", [true]] |
    ["Array", [[]]] |
    ["ElementConstructor", [typeof Element]] |
    ["ElementInstance", [Element]]
  >({} as T2000);

  /// Non-Ref Props (Lower case props) should be ignored and result in `never`
  type T3000 = SpecToTagPaths<{
    prop1: number,
    prop2: string,
    prop3: boolean,
    prop4: typeof Element,
    prop5: Element,
    prop6: object,
    prop7: {},
    prop8: [],
  }>
  expectType<never>({} as T3000);

  /// Complex nested structure
  type T5000 = SpecToTagPaths<{
    prop1: number,
    MyElement: object
    MyParentElement: {
      nestedProp: string,
      MyChildComponent: typeof Component
      MyChildElement: {
        evenMoreNestedProp: boolean,
        MyGrandChildElement: object
      }
    }
  }>
  expectType<
    ['MyElement', [object]] |
    ['MyParentElement', [{
      nestedProp: string,
      MyChildComponent: typeof Component
      MyChildElement: {
        evenMoreNestedProp: boolean,
        MyGrandChildElement: object
      }
    }]] |
    ['MyParentElement', 'MyChildComponent', [typeof Component]] |
    ['MyParentElement', 'MyChildElement', [{
      evenMoreNestedProp: boolean,
      MyGrandChildElement: object
    }]] |
    ['MyParentElement', 'MyChildElement', 'MyGrandChildElement', [object]]
  >({} as T5000);
}

function Join_Tests() {
  /// Empty Array should result in never
  expectType<never>({} as Join<[]>);

  /// Single item array should result in that item
  expectType<''>({} as Join<['']>);
  expectType<'abc'>({} as Join<['abc']>);

  /// Multiple item array should result in a string with the items joined by a dot
  expectType<'a.b'>({} as Join<['a', 'b']>);
  expectType<'1.2.3'>({} as Join<['1', '2', '3']>);
  expectType<'a.Very.Long.joined.String.123'>({} as Join<[
    'a', 'Very', 'Long', 'joined', 'String', '123'
  ]>);
}

function CombineTagPaths_Tests() {
  /// Never should result in an empty object
  type T1000 = CombineTagPaths<never>;
  expectType<{}>({} as T1000);

  /// Should transform a single tag path into a flat object
  type T2000 = CombineTagPaths<
    ['prop', [object]]
  >
  expectType<{
    prop: object
  }>({} as T2000);

  /// Should transform a many tag paths into a flat object
  type T3000 = CombineTagPaths<
    | ['A', ['abc']]
    | ['a', 'B',  [123]]
    | ['C', 'd', '1', '2', [true]]
    | ['MyChild', 'MyGrandChild', 'MyGreatGrandChild_Element', [typeof Element]]
    | ['MyChild', 'MyGrandChild', 'MyGreatGrandChild_Component', [typeof Component]]
  >
  expectType<{
    A: "abc";
    "a.B": 123;
    "C.d.1.2": true;
    "MyChild.MyGrandChild.MyGreatGrandChild_Element": typeof Element;
    "MyChild.MyGrandChild.MyGreatGrandChild_Component": typeof Component;
  }>({} as T3000);

  /// The documented example should work
  type T4000 = CombineTagPaths<
    | ['MyElement', [object]]
    | ['MyParentElement', [{
        MyChildComponent: typeof Component
        MyChildElement: {
          MyGrandChildElement: object
        }
      }]]
    | ['MyParentElement', 'MyChildComponent', [typeof Component]]
    | ['MyParentElement', 'MyChildElement', [{ MyGrandChildElement: object }]]
    | ['MyParentElement', 'MyChildElement', 'MyGrandChildElement', [object]]
  >
  expectType<{
    'MyElement': object;
    'MyParentElement': {
       MyChildComponent: typeof Component
       MyChildElement: {
         MyGrandChildElement: object
       }
    };
    'MyParentElement.MyChildComponent': typeof Component;
    'MyParentElement.MyChildElement': { MyGrandChildElement: object };
    'MyParentElement.MyChildElement.MyGrandChildElement': object
  }>({} as T4000);
}

function CombineTagPathsSingleLevel_Tests() {
  /// Never should result in an empty object
  type T1000 = CombineTagPathsSingleLevel<never>;
  expectType<{}>({} as T1000);

  /// Should transform a single tag path into a flat object (Only if the tag path is a single level)
  type T2000 = CombineTagPathsSingleLevel<
    ['prop', [object]]
  >
  expectType<{
    prop: object
  }>({} as T2000);

  /// Should transform a many tag paths into a flat object (Only if the tag path is a single level)
  type T3000 = CombineTagPathsSingleLevel<
    | ['A', ['abc']]
    | ['a', [123]]
    | ['C', [true]]
    | ['MyChild', [typeof Element]]
    | ['MyChild2', [typeof Component]]
  >
  expectType<{
    A: "abc";
    "a": 123;
    "C": true;
    "MyChild": typeof Element;
    "MyChild2": typeof Component;
  }>({} as T3000);

  /// Should return empty object if all tag paths are multi-level
  type T4000 = CombineTagPathsSingleLevel<
    | ['a', 'B',  [123]]
    | ['C', 'd', '1', '2', [true]]
    | ['MyChild', 'MyGrandChild', 'MyGreatGrandChild_Element', [typeof Element]]
    | ['MyChild', 'MyGrandChild', 'MyGreatGrandChild_Component', [typeof Component]]
  >
  expectType<{}>({} as T4000);

  /// Should transform single-level tag paths into a flat object (even if there are multi-level tag paths)
  type T5000 = CombineTagPathsSingleLevel<
    | ['A', ['abc']]
    | ['a', [123]]
    | ['C', [true]]
    | ['MyChild', [typeof Element]]
    | ['MyChild2', [typeof Component]]
    | ['a', 'B',  [123]]
    | ['C', 'd', '1', '2', [true]]
    | ['MyChild', 'MyGrandChild', 'MyGreatGrandChild_Element', [typeof Element]]
    | ['MyChild', 'MyGrandChild', 'MyGreatGrandChild_Component', [typeof Component]]
  >
  expectType<{
    A: "abc";
    "a": 123;
    "C": true;
    "MyChild": typeof Element;
    "MyChild2": typeof Component;
  }>({} as T5000);

  /// Should the documented example should work
  type T6000 = CombineTagPathsSingleLevel<
    | ['MyElement', [object]]
    | ['MyParentElement', [{
        MyChildComponent: typeof Component
        MyChildElement: {
          MyGrandChildElement: object
        }
      }]]
    | ['MyParentElement', 'MyChildComponent', [typeof Component]]
    | ['MyParentElement', 'MyChildElement', [{ MyGrandChildElement: object }]]
    | ['MyParentElement', 'MyChildElement', 'MyGrandChildElement', [object]]
  >
  expectType<{
    'MyElement': object;
    'MyParentElement': {
      MyChildComponent: typeof Component
      MyChildElement: {
        MyGrandChildElement: object
      }
    }
  }>({} as T6000);
}