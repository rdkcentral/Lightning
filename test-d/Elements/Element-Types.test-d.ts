/**
 * Unit tests for the Element types / type utilities
 */
import { expectAssignable, expectType } from 'tsd';
import lng from '../../index.js';
import { InlineElement } from '../../src/tree/Element.mjs';

export interface TestTemplateSpec extends lng.Component.TemplateSpecStrong {
  MyStrongElement_InlineEmpty: {},
  MyStrongElement_ExplicitType: typeof lng.Element<lng.Element.TemplateSpecStrong>;
  MyLooseElement: typeof lng.Element;
  MyListComponent: typeof lng.components.ListComponent;
  MyStrongElement_InlineChildren: {
    Child1: {},
    Child2: typeof lng.Element<lng.Element.TemplateSpecStrong>,
    Child3: typeof lng.components.ListComponent
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
    } & lng.Element.TemplateSpecStrong & {
        smooth: lng.Element.SmoothTemplate<lng.Element.TemplateSpecStrong>;
    }
  >({} as T100);
}

//
// TransformPossibleElement
//
function TransformPossibleElement_Test() {
  /// If `Key` is a valid ref string (i.e. begins with a capital letter) then transform it to an Element/Component instance type
  // Strong Element (implicit inline, empty)
  type T100 = lng.Element.TransformPossibleElement<'ValidRef', TestTemplateSpec['MyStrongElement_InlineEmpty']>;
  expectType<
    lng.Element<InlineElement<{}>>
  >({} as T100);
  // Strong Element (explicit type)
  type T200 = lng.Element.TransformPossibleElement<'ValidRef', TestTemplateSpec['MyStrongElement_ExplicitType']>;
  expectType<
    lng.Element<
      lng.Element.TemplateSpecStrong
    >
  >({} as T200);
  // Loose Element
  type T300 = lng.Element.TransformPossibleElement<'ValidRef', TestTemplateSpec['MyLooseElement']>;
  expectType<
    lng.Element<
      lng.Element.TemplateSpecLoose
    >
  >({} as T300);
  // Component
  type T400 = lng.Element.TransformPossibleElement<'ValidRef', TestTemplateSpec['MyListComponent']>;
  expectType<lng.components.ListComponent>({} as T400);
  // Strong Element (implicit inline, children)
  type T550 = lng.Element.TransformPossibleElement<'ValidRef', TestTemplateSpec['MyStrongElement_InlineChildren']>;
  expectType<
    lng.Element<
      InlineElement<{
        Child1: {};
        Child2: typeof lng.Element<lng.Element.TemplateSpecStrong>;
        Child3: typeof lng.components.ListComponent;
      }>
    >
  >({} as T550);

  /// If the `Key` is not a valid ref (i.e. doesn't begin with a capital letter) then it shouldn't be transformed
  type T500 = lng.Element.TransformPossibleElement<'invalidRef', TestTemplateSpec['MyStrongElement_InlineEmpty']>;
  expectType<TestTemplateSpec['MyStrongElement_InlineEmpty']>({} as T500);
  type T600 = lng.Element.TransformPossibleElement<'invalidRef', TestTemplateSpec['MyStrongElement_ExplicitType']>;
  expectType<TestTemplateSpec['MyStrongElement_ExplicitType']>({} as T600);
  type T700 = lng.Element.TransformPossibleElement<'invalidRef', TestTemplateSpec['MyLooseElement']>;
  expectType<TestTemplateSpec['MyLooseElement']>({} as T700);
  type T800 = lng.Element.TransformPossibleElement<'invalidRef', TestTemplateSpec['MyListComponent']>;
  expectType<TestTemplateSpec['MyListComponent']>({} as T800);
  type T900 = lng.Element.TransformPossibleElement<'invalidRef', TestTemplateSpec['MyStrongElement_InlineEmpty']>;
  expectType<TestTemplateSpec['MyStrongElement_InlineEmpty']>({} as T900);

  /// If `Key` is any `string` then we should return anything
  type T1000 = lng.Element.TransformPossibleElement<string, TestTemplateSpec['MyStrongElement_InlineEmpty']>;
  expectType<any>({} as T1000);
  type T1100 = lng.Element.TransformPossibleElement<string, TestTemplateSpec['MyStrongElement_ExplicitType']>;
  expectType<any>({} as T1100);
  type T1200 = lng.Element.TransformPossibleElement<string, TestTemplateSpec['MyLooseElement']>;
  expectType<any>({} as T1200);
  type T1300 = lng.Element.TransformPossibleElement<string, TestTemplateSpec['MyListComponent']>;
  expectType<any>({} as T1300);
  type T1400 = lng.Element.TransformPossibleElement<string, TestTemplateSpec['MyStrongElement_InlineEmpty']>;
  expectType<any>({} as T1400);

  /// The Default for standard prop keys (non-ref keys) is the actual value type
  type T1500 = lng.Element.TransformPossibleElement<'x', number>;
  expectType<number>({} as T1500);

  /// The Default for standard prop keys (non-ref keys) can be changed
  type T1600 = lng.Element.TransformPossibleElement<'x', number, string>;
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
      Child2: {
        text: 'abc',
      },
      Child3: {
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
    lng.Element.PatchTemplate<lng.Element.TemplateSpecStrong & {
        smooth: lng.Element.SmoothTemplate<lng.Element.TemplateSpecStrong>;
    }> | undefined
  >({} as T300);
  // Loose element
  type T400 = T100['MyLooseElement'];
  expectType<
    lng.Element.PatchTemplate<lng.Element.TemplateSpecLoose & {
        smooth: lng.Element.SmoothTemplate<lng.Element.TemplateSpecLoose>;
    }> | undefined
  >({} as T400);
  // Component
  type T500 = T100['MyListComponent'];
  expectType<
    {
      type?: typeof lng.components.ListComponent | undefined;
    } &
    lng.Element.PatchTemplate<
      lng.components.ListComponent.TemplateSpec &
      {
        smooth: lng.Element.SmoothTemplate<lng.components.ListComponent.TemplateSpec>;
      }
    >
    | undefined
  >({} as T500);
  // Strong Element (inline w/ child elements/components)
  type T600 = T100['MyStrongElement_InlineChildren'];
  expectType<
    lng.Element.PatchTemplate<
      InlineElement<{
        Child1: {};
        Child2: typeof lng.Element<lng.Element.TemplateSpecStrong>,
        Child3: typeof lng.components.ListComponent;
      }>
    > | undefined
  >({} as T600);
}