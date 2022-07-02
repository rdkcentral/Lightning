/**
 * Unit tests for the Element types / type utilities
 */
import { expectType } from 'tsd';
import lng from '../../index.js';
import ListComponent from '../../src/components/ListComponent.mjs';




export interface TestLiteral extends lng.Component.Literal {
  MyStrongElement: typeof lng.Element<lng.Element.Literal>;
  MyLooseElement: typeof lng.Element;
  MyListComponent: typeof ListComponent;
}

//
// TransformPossibleElement
//
expectType<lng.Element<lng.Element.Literal, lng.Texture>>({} as lng.Element.TransformPossibleElement<TestLiteral['MyStrongElement']>);
expectType<lng.Element<lng.Element.LooseLiteral, lng.Texture>>({} as lng.Element.TransformPossibleElement<TestLiteral['MyLooseElement']>);
expectType<ListComponent>({} as lng.Element.TransformPossibleElement<TestLiteral['MyListComponent']>);
