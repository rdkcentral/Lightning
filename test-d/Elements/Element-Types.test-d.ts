/**
 * Unit tests for the Element types / type utilities
 */
import { expectAssignable, expectType } from 'tsd';
import lng from '../../index.js';
import ListComponent from '../../src/components/ListComponent.mjs';

export interface TestTemplateSpec extends lng.Component.TemplateSpecStrong {
  MyStrongElement: typeof lng.Element<lng.Element.TemplateSpecStrong>;
  MyLooseElement: typeof lng.Element;
  MyListComponent: typeof ListComponent;
}

//
// TransformPossibleElement
//
expectType<lng.Element<lng.Element.TemplateSpecStrong, lng.Texture>>({} as lng.Element.TransformPossibleElement<TestTemplateSpec['MyStrongElement']>);
expectType<lng.Element<lng.Element.TemplateSpecLoose, lng.Texture>>({} as lng.Element.TransformPossibleElement<TestTemplateSpec['MyLooseElement']>);
expectType<ListComponent>({} as lng.Element.TransformPossibleElement<TestTemplateSpec['MyListComponent']>);


//
// PatchTemplateArray
//
() => {
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
