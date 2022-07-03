/**
 * This tests the ability to create strongly typed Elements in a component that also have
 * child Elements or Components in them
 */
import { expectType } from 'tsd';
import lng from '../../index.js';
import ListComponent from '../../src/components/ListComponent.mjs';

namespace MyElementTest {
  export interface TemplateSpec extends lng.Component.TemplateSpecStrong {
    ParentElementStrong: typeof lng.Element<{
      ComponentChildA: typeof ListComponent;
      ChildElement: typeof lng.Element<{
        GrandchildElement: typeof lng.Element;
      } & lng.Element.TemplateSpecStrong>,
    } & lng.Element.TemplateSpecStrong>;
    ParentElementLoose: typeof lng.Element<{
      ChildElementLoose: typeof lng.Element<{
        GrandchildElement: typeof lng.Element;
      } & lng.Element.TemplateSpecLoose>
    } & lng.Element.TemplateSpecLoose>;
  }
}

class MyTestComponent
  extends lng.Component<MyElementTest.TemplateSpec>
  implements lng.Component.ImplementTemplateSpec<MyElementTest.TemplateSpec> {
  ParentElementStrong = this.getByRef('ParentElementStrong')!;
  ParentElementLoose = this.getByRef('ParentElementLoose')!;

  _init() {
    // Confirm you can get child elements by ref
    const ComponentChildA = this.ParentElementStrong.getByRef('ComponentChildA')!;
    const ChildElement = this.ParentElementStrong.getByRef('ChildElement')!;
    // And they are of the right type
    expectType<lng.components.ListComponent>(ComponentChildA);
    expectType<lng.Element<{ GrandchildElement: typeof lng.Element; } & lng.Element.TemplateSpecStrong>>(ChildElement);
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
      lng.Element<{ GrandchildElement: typeof lng.Element; } & lng.Element.TemplateSpecLoose>
    >(this.ParentElementLoose.getByRef('ChildElementLoose')!);
  }
}

export interface MyTestComponentTemplateSpec_Loose extends lng.Component.TemplateSpecStrong {
  ParentElementStrong: typeof lng.Element<{
    ComponentChildA: typeof ListComponent;
  } & lng.Element.TemplateSpecLoose>;
}

// Expect an error here when `lng.Element.TemplateSpecStrong` is not intersected after the inline
// TemplateSpec type. if the requirement for this can be elimintated that would be good!
export interface MyTestComponentTemplateSpec_Error extends lng.Component.TemplateSpecStrong {
  // @ts-expect-error
  ParentElementStrong: typeof lng.Element<{
    ComponentChildA: typeof ListComponent;
  }>;
}
