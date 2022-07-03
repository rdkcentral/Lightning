/**
 * Unit tests for the Element types / type utilities
 */
import { expectType } from 'tsd';
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
