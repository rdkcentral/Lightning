import { expectType } from 'tsd';
import lng from '../../index';

namespace Container {
  export interface TemplateSpec extends lng.Component.TemplateSpecStrong {
    BloomComponent: typeof lng.components.BloomComponent;
    BloomComponent_SpecificType: typeof lng.components.BloomComponent<lng.components.ListComponent>;
  }
}

class Container extends lng.Component<Container.TemplateSpec> implements lng.Component.ImplementTemplateSpec<Container.TemplateSpec> {
  static override _template(): lng.Component.Template<Container.TemplateSpec> {
    // Template validity
    return {
      BloomComponent: {
        type: lng.components.BloomComponent,
        amount: 2,
        paddingX: 10,
        paddingY: 10,
        content: {
          text: {
            text: 'Hello World'
          }
        }
      },
      BloomComponent_SpecificType: {
        type: lng.components.BloomComponent,
        content: {
          alpha: 123,
          items: [
            { text: 'abc' }
          ],
          // @ts-expect-error Sanity check: horizontal must be a boolean
          horizontal: 123
        },
        smoothScale: 123
      }
    };
  }

  override _init() {
    // Direct property setting
    this.BloomComponent.amount = 3;
    // @ts-expect-error Shouldn't allow a string
    this.BloomComponent.amount = '3';
    this.BloomComponent.paddingX = 20;
    // @ts-expect-error Shouldn't allow a string
    this.BloomComponent.paddingX = '33';

    this.BloomComponent.content = {
      src: 'image'
    };

    // Indirect patch
    this.patch({
      BloomComponent: {
        amount: 4,
        paddingX: 10,
        paddingY: 10,
        content: {
          text: {
            text: 'Hello World',
            // @ts-expect-error Prop not expected
            INVALID_PROP: 123
          }
        }
      }
    });

    // Direct patch
    this.BloomComponent.patch({
      amount: 4,
      paddingX: 10,
      paddingY: 10,
      content: {
        text: {
          text: 'Hello World',
          // @ts-expect-error Prop not expected
          INVALID_PROP: 123
        }
      }
    });

    // Specific type tests
    this.BloomComponent_SpecificType.content = {
      alpha: 123,
      items: [
        { text: 'abc' }
      ],
      // @ts-expect-error Sanity check: horizontal must be a boolean
      horizontal: 123
    };

    expectType<lng.components.ListComponent>(this.BloomComponent_SpecificType.content);

    this.patch({
      BloomComponent_SpecificType: {
        content: {
          alpha: 123,
          items: [
            { text: 'abc' }
          ],
          // @ts-expect-error Sanity check: horizontal must be a boolean
          horizontal: 123
        },
        smoothScale: 123
      }
    });

    this.BloomComponent_SpecificType.patch({
      content: {
        alpha: 123,
        items: [
          { text: 'abc' }
        ],
        // @ts-expect-error Sanity check: horizontal must be a boolean
        horizontal: 123
      },
      smoothScale: 123
    });
  }

  get BloomComponent(): lng.components.BloomComponent {
    return this.tag('BloomComponent')!;
  }

  readonly BloomComponent_SpecificType = this.getByRef('BloomComponent_SpecificType')!;
}