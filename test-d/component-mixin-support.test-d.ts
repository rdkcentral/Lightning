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
  // !!! See if we can make this easier
  interface IMixinClass {
    mixinMethod(): number;
    readonly mixinReadonlyProp: string;
    mixinProp1: string;
    mixinProp2: number;
  }

  interface MixinLiteral extends lng.Component.Literal {
    type: lng.Component.Constructor<InstanceType<BaseType> & IMixinClass>;
    mixinProp1: string;
    mixinProp2: number;
  }

  type LiteralType = MixinLiteral & lng.Component.ExtractLiteral<InstanceType<BaseType>>;

  return class MixinClass extends Base implements IMixinClass {
    // Mixin implementation
    mixinProp1: string = '';
    mixinProp2: number = 123;

    mixinMethod(): number {
      return this.mixinProp2;
    }

    get mixinReadonlyProp(): string {
      return this.mixinProp1;
    }

    // Patch override required
    patch(template: Element.PatchTemplate<LiteralType>): void {
      super.patch(template);
    }


    // Override of __$type_Literal
    __$type_Literal: LiteralType = {} as LiteralType;
  }
}

class MixedInListComponent extends withMixin(lng.components.ListComponent) {
  _init() { // !!! Check in on: https://github.com/microsoft/TypeScript/issues/49672
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
      mixinProp2: 123
    });
  }
}

namespace Container {
  export interface Literal extends lng.Component.Literal {
    type: typeof Container;
    MixedInListComponent: lng.Component.ExtractLiteral<MixedInListComponent>;
    MixedInListComponent_Error: lng.Component.ExtractLiteral<MixedInListComponent>;
  }
}

class Container extends lng.Component<Container.Literal> implements lng.Component.ImplementLiteral<Container.Literal> {
  static _template(): lng.Component.Template<Container> {
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
        mixinProp2: 123,
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

    // Direct patch
    this.MixedInListComponent.patch({
      mixinProp1: 'abc',
      mixinProp2: 123,
      items: [
        { text: 'abc' },
        { text: 'abc' }
      ],
    });

    // Function calls
    expectType<number>(this.MixedInListComponent.mixinMethod());
  }
}