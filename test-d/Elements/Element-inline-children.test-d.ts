/**
 * This tests the ability to create strongly typed Elements in a component that also have
 * child Elements or Components in them
 */
import { expectType } from 'tsd';
import lng from '../../index.js';
import ListComponent from '../../src/components/ListComponent.mjs';

namespace MyElementTest {
  export interface Literal extends lng.Component.Literal {
    ParentElementStrong: typeof lng.Element<{
      ComponentChildA: typeof ListComponent;
      ChildElement: typeof lng.Element<{
        GrandchildElement: typeof lng.Element;
      } & lng.Element.Literal>,
    } & lng.Element.Literal>;
    ParentElementLoose: typeof lng.Element<{
      ChildElementLoose: typeof lng.Element<{
        GrandchildElement: typeof lng.Element;
      } & lng.Element.LooseLiteral>
    } & lng.Element.LooseLiteral>;
  }
}

class MyTestComponent
  extends lng.Component<MyElementTest.Literal>
  implements lng.Component.ImplementLiteral<MyElementTest.Literal> {
  ParentElementStrong = this.getByRef('ParentElementStrong')!;
  ParentElementLoose = this.getByRef('ParentElementLoose')!;

  _init() {
    // Confirm you can get child elements by ref
    const ComponentChildA = this.ParentElementStrong.getByRef('ComponentChildA')!;
    const ChildElement = this.ParentElementStrong.getByRef('ChildElement')!;
    // And they are of the right type
    expectType<lng.components.ListComponent>(ComponentChildA);
    expectType<lng.Element<{ GrandchildElement: typeof lng.Element; } & lng.Element.Literal>>(ChildElement);
    // Also confirm you can get a grand-child element
    expectType<lng.Element>(ChildElement.getByRef('GrandchildElement')!);

    // Confirm that, because this is a strongly typed element that, we can't access unknown refs
    // @ts-expect-error
    this.ParentElementStrong.getByRef('INVALID_REF')!;
    // @ts-expect-error
    ChildElement.getByRef('INVALID_REF');

    // But in the case of loosely typed Elements, we can
    this.ParentElementLoose.getByRef('INVALID_REF');

    // And make sure known children can still be reached in a typesafe way
    expectType<
      lng.Element<{ GrandchildElement: typeof lng.Element; } & lng.Element.LooseLiteral>
    >(this.ParentElementLoose.getByRef('ChildElementLoose')!);
  }
}

// Expect an error here when `lng.Element.Literal` is not interected after the inline
// Literal type. if the requirement for this can be elimintated that would be good!
export interface MyTestComponentLiteral_Error extends lng.Component.Literal {
  // @ts-expect-error
  ParentElementStrong: typeof lng.Element<{
    ComponentChildA: typeof ListComponent;
  }>;
}
