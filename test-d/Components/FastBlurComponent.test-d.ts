import { expectType } from 'tsd';
import lng from '../../index';

namespace Container {
  export interface TemplateSpec extends lng.Component.TemplateSpecStrong {
    FastBlurComponent: typeof lng.components.FastBlurComponent;
    FastBlurComponent_SpecificType: typeof lng.components.FastBlurComponent<lng.components.ListComponent>;
  }
}

class Container extends lng.Component<{ TemplateSpecType: Container.TemplateSpec }> implements lng.Component.ImplementTemplateSpec<Container.TemplateSpec> {
  static _template(): lng.Component.Template<Container.TemplateSpec> {
    // Template validity
    return {
      FastBlurComponent: {
        type: lng.components.FastBlurComponent,
        amount: 2,
        paddingX: 10,
        paddingY: 10,
        content: {
          text: {
            text: 'Hello World'
          }
        }
      },
      FastBlurComponent_SpecificType: {
        type: lng.components.FastBlurComponent,
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

  _init() {
    // Direct property setting
    this.FastBlurComponent.amount = 3;
    // @ts-expect-error Shouldn't allow a string
    this.FastBlurComponent.amount = '3';
    this.FastBlurComponent.paddingX = 20;
    // @ts-expect-error Shouldn't allow a string
    this.FastBlurComponent.paddingX = '33';

    this.FastBlurComponent.content = {
      src: 'image'
    };

    // Indirect patch
    this.patch({
      FastBlurComponent: {
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
    this.FastBlurComponent.patch({
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
    this.FastBlurComponent_SpecificType.content = {
      alpha: 123,
      items: [
        { text: 'abc' }
      ],
      // @ts-expect-error Sanity check: horizontal must be a boolean
      horizontal: 123
    };

    expectType<lng.components.ListComponent>(this.FastBlurComponent_SpecificType.content);

    this.patch({
      FastBlurComponent_SpecificType: {
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

    this.FastBlurComponent_SpecificType.patch({
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

  get FastBlurComponent(): lng.components.FastBlurComponent {
    return this.tag('FastBlurComponent')!;
  }

  readonly FastBlurComponent_SpecificType = this.getByRef('FastBlurComponent_SpecificType')!;
}