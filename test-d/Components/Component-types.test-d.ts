/**
 * Unit tests for the Element types / type utilities
 */
import { expectNotType, expectType } from 'tsd';
import lng from '../../index.js';

export interface SubComponentLiteral extends lng.Component.Literal {
  MyStrongElement: typeof lng.Element<lng.Element.Literal>;
  MyLooseElement: typeof lng.Element<lng.Element.LooseLiteral>;
  MyListComponent: typeof lng.components.ListComponent;
}

class SubComponent extends lng.Component<SubComponentLiteral> implements lng.Component.ImplementLiteral<SubComponentLiteral> {
  MyStrongElement = this.getByRef('MyStrongElement')!;
  MyLooseElement = this.getByRef('MyLooseElement')!;
  MyListComponent = this.getByRef('MyListComponent')!;
}

export interface TestLiteral extends lng.Component.Literal {
  MyStrongElement: typeof lng.Element<lng.Element.Literal>;
  MyLooseElement: typeof lng.Element;
  MyListComponent: typeof lng.components.ListComponent;
  MySubComponent: typeof SubComponent;
}

//
// TemplateRequireType
//
type TemplateRequireType_SubComponent = lng.Component.TemplateRequireType<typeof SubComponent>;
// `type` is required but nothing else is
const t10: TemplateRequireType_SubComponent = {
  type: SubComponent
};
// `type` must be correct
const t20: TemplateRequireType_SubComponent = {
  // @ts-expect-error This must be SubComponent for this to work
  type: lng.Component
};
// @ts-expect-error t2 requires a `type` key
const t30: TemplateRequireType_SubComponent = {};
// Other things can appear as well
const t40: TemplateRequireType_SubComponent = {
  type: SubComponent,
  alpha: 1.0,
  mountX: 1.0
};
// Child Components must be returned as TemplateRequireType<>
type T10 = NonNullable<TemplateRequireType_SubComponent['MyListComponent']>;
expectType<lng.Component.TemplateRequireType<typeof lng.components.ListComponent>>({} as T10);
// Child Components require `type`
const t50: TemplateRequireType_SubComponent = {
  type: SubComponent,
  // @ts-expect-error this needs a type
  MyListComponent: {}
}
// Child Components require correct `type`
const t60: TemplateRequireType_SubComponent = {
  type: SubComponent,
  MyListComponent: {
    // @ts-expect-error this needs a type
    type: lng.components.FastBlurComponent,
  }
}
// Child Components require correct `type`
const t70: TemplateRequireType_SubComponent = {
  type: SubComponent,
  MyListComponent: {
    type: lng.components.ListComponent,
  }
}
// Check that we can set many things on the sub component
const t80: TemplateRequireType_SubComponent = {
  type: SubComponent,
  color: 0xffffff,
  MyStrongElement: {
    alpha: 1.0,
    x: 123,
    visible: true,
  },
  MyLooseElement: {
    alpha: 1.0,
    x: 123,
    visible: true,
    // Invalid props allowed in LooseLiteral
    INVALID_PROP: 123,
  },
  MyListComponent: {
    type: lng.components.ListComponent,
    pivot: 0.5,
  }
};
// Child Loose Element is a TemplateLiteral<Element.LooseLiteral>
type T20 = NonNullable<TemplateRequireType_SubComponent['MyLooseElement']>;
expectType<lng.Component.TemplateLiteral<lng.Element.LooseLiteral & { smooth: lng.Element.SmoothLiteral<lng.Element.LooseLiteral>; }>>({} as T20);
expectNotType<lng.Component.TemplateLiteral<lng.Element.Literal & { smooth: lng.Element.SmoothLiteral<lng.Element.Literal>; }>>({} as T20);
// Child Strong Element is a TemplateLiteral<Element.LooseLiteral>
type T30 = NonNullable<TemplateRequireType_SubComponent['MyStrongElement']>;
expectType<lng.Component.TemplateLiteral<lng.Element.Literal>>({} as T30);
expectNotType<lng.Component.TemplateLiteral<lng.Element.LooseLiteral>>({} as T30);

//
// TemplateLiteral
//
type TemplatedLiteral_TestLiteral = lng.Component.TemplateLiteral<TestLiteral>;
type TemplatedLiteral_Element = lng.Component.TemplateLiteral<lng.Element.Literal>;
// Type is not allowed
const t90: TemplatedLiteral_TestLiteral = {};
const t100: TemplatedLiteral_TestLiteral = {
  // @ts-expect-error
  type: lng.Component
};
const t110: TemplatedLiteral_TestLiteral = {
  // @ts-expect-error
  type: lng.Component,
  text: '123'
};
// And `type` isn't there at all for Element
type T40 = TemplatedLiteral_Element extends { type: infer T } ? T : false;
expectType<false>({} as T40);
const t120: TemplatedLiteral_Element = {};
const t130: TemplatedLiteral_Element = {
  text: '123'
};

// Check we can set a lot of things
const t140: TemplatedLiteral_TestLiteral = {
  MyStrongElement: {
    alpha: 1.0,
    x: 123,
    visible: true,
  },
  MyLooseElement: {
    alpha: 1.0,
    x: 123,
    visible: true,
    // Invalid props allowed in LooseLiteral
    INVALID_PROP: 123,
  },
  MyListComponent: {
    type: lng.components.ListComponent,
    pivot: 0.5,
  } ,
  MySubComponent: {
    type: SubComponent,
    MyStrongElement: {
      alpha: 1.0,
      x: 123,
      visible: true,
    },
    MyLooseElement: {
      alpha: 1.0,
      x: 123,
      visible: true,
      // Invalid props allowed in LooseLiteral
      INVALID_PROP: 123,
    },
    MyListComponent: {
      type: lng.components.ListComponent,
      pivot: 0.5,
    }
  }
};
// Check that MyStrongElement is a TemplateLiteral<lng.Element.Literal>
type ShouldBeTemplateLiteral_Element_Literal = TemplatedLiteral_TestLiteral['MyStrongElement'];
expectType<lng.Component.TemplateLiteral<lng.Element.Literal> | undefined>({} as ShouldBeTemplateLiteral_Element_Literal);
// Check that MyLooseElement is a TemplateLiteral<lng.Element.LooseLiteral>
type ShouldBeTemplateLiteral_Element_LooseLiteral = TemplatedLiteral_TestLiteral['MyLooseElement'];
expectType<lng.Component.TemplateLiteral<lng.Element.LooseLiteral & { smooth: lng.Element.SmoothLiteral<lng.Element.LooseLiteral>; }> | undefined>({} as ShouldBeTemplateLiteral_Element_LooseLiteral);
// Check that MyListComponent is a TemplateLiteral<lng.components.ListComponent>
type ShouldBeTemplateRequireType_ListComponent_Literal = TemplatedLiteral_TestLiteral['MyListComponent'];
expectType<lng.Component.TemplateRequireType<typeof lng.components.ListComponent> | undefined>({} as ShouldBeTemplateRequireType_ListComponent_Literal);
// Check that MySubComponent is a TemplateLiteral<SubComponentLiteral>
type ShouldBeTemplateRequireType_SubComponentLiteral = TemplatedLiteral_TestLiteral['MySubComponent'];
expectType<lng.Component.TemplateRequireType<typeof SubComponent> | undefined>({} as ShouldBeTemplateRequireType_SubComponentLiteral);

 //
 // TransformPossibleLiteral
 //
 expectType<lng.Element<lng.Element.Literal, lng.Texture>>({} as lng.Element.TransformPossibleLiteral<TestLiteral['MyStrongElement']>);
 expectType<lng.Element<lng.Element.LooseLiteral, lng.Texture>>({} as lng.Element.TransformPossibleLiteral<TestLiteral['MyLooseElement']>);
 expectType<lng.components.ListComponent>({} as lng.Element.TransformPossibleLiteral<TestLiteral['MyListComponent']>);
