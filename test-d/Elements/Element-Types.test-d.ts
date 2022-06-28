/**
 * Unit tests for the Element types / type utilities
 */
import { expectType } from 'tsd';
import lng from '../../index.js';
import ListComponent from '../../src/components/ListComponent.mjs';




export interface TestLiteral extends lng.Component.Literal {
  type: typeof lng.Component;
  MyStrongElement: lng.Element.Literal;
  MyLooseElement: lng.Element.LooseLiteral;
  MyListComponent: ListComponent.Literal;
}



//
// TransformPossibleLiteral
//
expectType<lng.Element<lng.Element.Literal, lng.Texture>>({} as lng.Element.TransformPossibleLiteral<TestLiteral['MyStrongElement']>);
expectType<lng.Element<lng.Element.LooseLiteral, lng.Texture>>({} as lng.Element.TransformPossibleLiteral<TestLiteral['MyLooseElement']>);
expectType<ListComponent>({} as lng.Element.TransformPossibleLiteral<TestLiteral['MyListComponent']>);
