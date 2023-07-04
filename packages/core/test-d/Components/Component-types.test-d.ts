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
 * Unit tests for the Component types / type utilities
 *
 * @module
 */
import { expectNotType, expectType } from 'tsd';
import lng from '../../index.js';
import { TemplateRequireType } from '../../src/application/Component.mjs';
import { SmoothTemplate, TransitionsTemplate } from '../../src/tree/Element.mjs';

export interface SubComponentTemplateSpec extends lng.Component.TemplateSpec {
  MyStrongElement: typeof lng.Element<lng.Element.TemplateSpec>;
  MyLooseElement: typeof lng.Element<lng.Element.TemplateSpecLoose>;
  MyListComponent: typeof lng.components.ListComponent;
}

class SubComponent extends lng.Component<SubComponentTemplateSpec> implements lng.Component.ImplementTemplateSpec<SubComponentTemplateSpec> {
  MyStrongElement = this.getByRef('MyStrongElement')!;
  MyLooseElement = this.getByRef('MyLooseElement')!;
  MyListComponent = this.getByRef('MyListComponent')!;
}

export interface TestTemplateSpec extends lng.Component.TemplateSpec {
  MyStrongElement: typeof lng.Element<lng.Element.TemplateSpec>;
  MyLooseElement: typeof lng.Element;
  MyListComponent: typeof lng.components.ListComponent;
  MySubComponent: typeof SubComponent;
}

//
// TemplateRequireType
//
type TemplateRequireType_SubComponent = TemplateRequireType<typeof SubComponent>;
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
expectType<TemplateRequireType<typeof lng.components.ListComponent>>({} as T10);
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
    // Invalid props allowed in TemplateSpecLoose
    INVALID_PROP: 123,
  },
  MyListComponent: {
    type: lng.components.ListComponent,
    pivot: 0.5,
  }
};
// Child Loose Element is a Template<Element.TemplateSpecLoose>
type T20 = NonNullable<TemplateRequireType_SubComponent['MyLooseElement']>;
expectType<
  lng.Component.Template<lng.Element.TemplateSpecLoose & {
    smooth: SmoothTemplate<lng.Element.TemplateSpecLoose>;
    transitions: TransitionsTemplate<lng.Element.TemplateSpecLoose>;
  }>
>({} as T20);
expectNotType<
  lng.Component.Template<lng.Element.TemplateSpec & {
    smooth: SmoothTemplate<lng.Element.TemplateSpec>;
    transitions: TransitionsTemplate<lng.Element.TemplateSpec>;
  }>
>({} as T20);
// Child Strong Element is a Template<Element.TemplateSpecLoose>
type T30 = NonNullable<TemplateRequireType_SubComponent['MyStrongElement']>;
expectType<lng.Component.Template<lng.Element.TemplateSpec>>({} as T30);
expectNotType<lng.Component.Template<lng.Element.TemplateSpecLoose>>({} as T30);

//
// Template
//
type Template_TestTemplateSpec = lng.Component.Template<TestTemplateSpec>;
type Template_Element = lng.Component.Template<lng.Element.TemplateSpec>;
// Type is not allowed
const t90: Template_TestTemplateSpec = {};
const t100: Template_TestTemplateSpec = {
  // @ts-expect-error
  type: lng.Component
};
const t110: Template_TestTemplateSpec = {
  // @ts-expect-error
  type: lng.Component,
  text: '123'
};
// And `type` isn't there at all for Element
type T40 = Template_Element extends { type: infer T } ? T : false;
expectType<false>({} as T40);
const t120: Template_Element = {};
const t130: Template_Element = {
  text: '123'
};

// Check we can set a lot of things
const t140: Template_TestTemplateSpec = {
  MyStrongElement: {
    alpha: 1.0,
    x: 123,
    visible: true,
  },
  MyLooseElement: {
    alpha: 1.0,
    x: 123,
    visible: true,
    // Invalid props allowed in TemplateSpecLoose
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
      // Invalid props allowed in TemplateSpecLoose
      INVALID_PROP: 123,
    },
    MyListComponent: {
      type: lng.components.ListComponent,
      pivot: 0.5,
    }
  }
};
// Check that MyStrongElement is a Template<lng.Element.TemplateSpec>
type ShouldBeTemplate_Element_TemplateSpec = Template_TestTemplateSpec['MyStrongElement'];
expectType<lng.Component.Template<lng.Element.TemplateSpec> | undefined>({} as ShouldBeTemplate_Element_TemplateSpec);
// Check that MyLooseElement is a Template<lng.Element.TemplateSpecLoose>
type ShouldBeTemplate_Element_TemplateSpecLoose = Template_TestTemplateSpec['MyLooseElement'];
expectType<
  lng.Component.Template<lng.Element.TemplateSpecLoose & {
    smooth: SmoothTemplate<lng.Element.TemplateSpecLoose>;
    transitions: TransitionsTemplate<lng.Element.TemplateSpecLoose>;
  }
> | undefined>({} as ShouldBeTemplate_Element_TemplateSpecLoose);
// Check that MyListComponent is a Template<lng.components.ListComponent>
type ShouldBeTemplateRequireType_ListComponent_TemplateSpec = Template_TestTemplateSpec['MyListComponent'];
expectType<TemplateRequireType<typeof lng.components.ListComponent> | undefined>({} as ShouldBeTemplateRequireType_ListComponent_TemplateSpec);
// Check that MySubComponent is a Template<SubComponentTemplateSpec>
type ShouldBeTemplateRequireType_SubComponentTemplateSpec = Template_TestTemplateSpec['MySubComponent'];
expectType<TemplateRequireType<typeof SubComponent> | undefined>({} as ShouldBeTemplateRequireType_SubComponentTemplateSpec);
