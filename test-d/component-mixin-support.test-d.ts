/**
 * This tests to make sure we can support some sort of mixin pattern
 */

import { expectType } from 'tsd';
import lng from '../index.js';
import TransitionSettings from '../src/animation/TransitionSettings.mjs';
import Element from '../src/tree/Element.mjs';

function withMixin<
  BaseType extends lng.Component.Constructor<lng.Component>
>(
  Base: BaseType
) {
  interface MixinLiteral extends lng.Component.TemplateSpecStrong {
    mixinProp1: string;
    mixinProp2: number;
  }

  type LiteralType = MixinLiteral & lng.Component.ExtractTemplateSpec<InstanceType<BaseType>>;

  return class MixinClass extends Base implements lng.Component.ImplementTemplateSpec<MixinLiteral> {
    // Mixin implementation
    mixinProp1: string = '';
    mixinProp2: number = 123;

    mixinMethod(): number {
      return this.mixinProp2;
    }

    get mixinReadonlyProp(): string {
      return this.mixinProp1;
    }

    // Must override patch
    // Due to limitation preventing using this['__$type_TemplateSpec'] at the base Element level
    // https://github.com/microsoft/TypeScript/issues/49672
    patch(template: Element.PatchTemplate<LiteralType>): void {
      super.patch(template);
    }


    // Must also override __$type_TemplateSpec
    __$type_TemplateSpec: LiteralType = {} as LiteralType;
  }
}

class MixedInListComponent extends withMixin(lng.components.ListComponent) {
  _init() {
    // Make sure we have correct access to the mixed in things!
    expectType<string>(this.mixinProp1);
    expectType<number>(this.mixinProp2);
    expectType<number>(this.mixinMethod());
    expectType<string>(this.mixinReadonlyProp);
    this.mixinProp1 = 'abc';
    this.mixinProp2 = 123;

    // Make sure we have correct access to the Base things (ListComponent)!
    this.items = [
      {
        text: 'abc',
      },
      {
        text: 'abc'
      }
    ];

    this.scrollTransitionSettings = {} as TransitionSettings;
    this.scrollTransitionSettings = {
      // @ts-expect-error Sanity Check: delay has to be a number
      delay: 'abc',
      duration: 123
    }

    // Make sure we can patch ourselves directly for both!
    this.patch({
      mixinProp1: 'abc',
      mixinProp2: 123,
    });

    // Unknown properties should not be allowed
    this.patch({
      // @ts-expect-error
      INVALID_PROP: 123
    });
  }
}

namespace Container {
  export interface TemplateSpec extends lng.Component.TemplateSpecStrong {
    MixedInListComponent: typeof MixedInListComponent
    MixedInListComponent_Error: typeof MixedInListComponent
  }
}

class Container extends lng.Component<Container.TemplateSpec> implements lng.Component.ImplementTemplateSpec<Container.TemplateSpec> {
  static _template(): lng.Component.Template<Container.TemplateSpec> {
    // Template validity
    return {
      MixedInListComponent: {
        type: MixedInListComponent,
        mixinProp1: 'abc',
        mixinProp2: 123,
      },
      MixedInListComponent_Error: {
        // @ts-expect-error type must be MixedInListComponent
        type: lng.components.ListComponent,
        mixinProp1: 'abc',
        mixinProp2: 123
      }
    };
  }

  MixedInListComponent: MixedInListComponent = this.getByRef('MixedInListComponent')!;
  MixedInListComponent_Error: MixedInListComponent = this.getByRef('MixedInListComponent_Error')!;

  _init(this: Container) {
    // Direct property setting
    this.MixedInListComponent.mixinProp1 = 'xyz';
    this.MixedInListComponent.mixinProp2 = 123;

    // Indirect patch
    this.patch({
      MixedInListComponent: {
        type: MixedInListComponent,
        mixinProp1: 'abc',
        mixinProp2: 123,
        items: [
          { text: 'abc' },
          { text: 'abc' }
        ],
      }
    });

    // Indirect patch - Unknown props shouldn't be allowed
    this.patch({
      MixedInListComponent: {
        type: MixedInListComponent,
        mixinProp1: 'abc',
        mixinProp2: 123,
        items: [
          { text: 'abc' },
          { text: 'abc' }
        ],
        // @ts-expect-error
        INVALID_PROP: 123
      }
    });

    // Direct patch
    this.MixedInListComponent.patch({
      mixinProp1: 'abc',
      mixinProp2: 123,
      items: [
        { text: 'abc' },
        { text: 'abc' }
      ],
    });

    // Direct patch - Should not allow unknown props
    // @ts-expect-error
    this.MixedInListComponent.patch({
      mixinProp1: 'abc',
      INVALID_PROP: 123
    });

    // Function calls
    expectType<number>(this.MixedInListComponent.mixinMethod());
  }
}