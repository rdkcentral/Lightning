import lng from '../../index';

namespace Container {
  export interface Literal extends lng.Component.Literal {
    BloomComponent: typeof lng.components.BloomComponent;
  }
}

class Container extends lng.Component<Container.Literal> implements lng.Component.ImplementLiteral<Container.Literal> {
  static _template(): lng.Component.Template<Container.Literal> {
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
      }
    };
  }

  _init() {
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
    this.BloomComponent.content = this.BloomComponent;

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
  }

  get BloomComponent(): lng.components.BloomComponent {
    return this.tag('BloomComponent')!;
  }
}