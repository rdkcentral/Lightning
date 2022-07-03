import lng from '../../index';

namespace Container {
  export interface TemplateSpec extends lng.Component.TemplateSpecStrong {
    FastBlurComponent: typeof lng.components.FastBlurComponent;
  }
}

class Container extends lng.Component<Container.TemplateSpec> implements lng.Component.ImplementTemplateSpec<Container.TemplateSpec> {
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
    this.FastBlurComponent.content = this.FastBlurComponent;

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
  }

  get FastBlurComponent(): lng.components.FastBlurComponent {
    return this.tag('FastBlurComponent')!;
  }
}