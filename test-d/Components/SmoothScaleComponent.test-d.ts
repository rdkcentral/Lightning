import lng from '../../index';
import { expectType } from 'tsd';

namespace Container {
  export interface TemplateSpec extends lng.Component.TemplateSpecStrong {
    SmoothScaleComponent: typeof lng.components.SmoothScaleComponent;
    SmoothScaleComponent_SpecificType: typeof lng.components.SmoothScaleComponent<lng.components.ListComponent>;
  }
}

class Container extends lng.Component<Container.TemplateSpec> implements lng.Component.ImplementTemplateSpec<Container.TemplateSpec> {
  static _template(): lng.Component.Template<Container.TemplateSpec> {
    // Template validity
    return {
      SmoothScaleComponent: {
        type: lng.components.SmoothScaleComponent,
        content: {
          alpha: 123,
          // @ts-expect-error Sanity check: visible must be a boolean
          visible: 123
        },
        smoothScale: 123
      },
      SmoothScaleComponent_SpecificType: {
        type: lng.components.SmoothScaleComponent,
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

  SmoothScaleComponent: lng.components.SmoothScaleComponent = this.getByRef('SmoothScaleComponent')!;
  SmoothScaleComponent_SpecificType: lng.components.SmoothScaleComponent<lng.components.ListComponent> = this.getByRef('SmoothScaleComponent_SpecificType')!;

  _init() {
    // Direct property getting (TemplateSpec properties)
    expectType<lng.Element>(this.SmoothScaleComponent.content);
    expectType<number>(this.SmoothScaleComponent.smoothScale);

    // Direct property getting (Non-TemplateSpec readonly properties)
    // None


    // Direct property setting (TemplateSpec properties)
    this.SmoothScaleComponent.content = {
      alpha: 123,
      // @ts-expect-error Sanity check: visible must be a boolean
      visible: 123
    };
    this.SmoothScaleComponent.smoothScale = 123;

    // Function calls
    // None

    // Indirect patch
    this.patch({
      SmoothScaleComponent: {
        content: {
          alpha: 123,
          // @ts-expect-error Sanity check: visible must be a boolean
          visible: 123
        },
        smoothScale: 123
      },
    });

    // Direct patch
    this.SmoothScaleComponent.patch({
      content: {
        alpha: 123,
        // @ts-expect-error Sanity check: visible must be a boolean
        visible: 123
      },
      smoothScale: 123
    });

    // Specific type tests
    this.SmoothScaleComponent_SpecificType.content = {
      alpha: 123,
      items: [
        { text: 'abc' }
      ],
      // @ts-expect-error Sanity check: horizontal must be a boolean
      horizontal: 123
    };

    expectType<lng.components.ListComponent>(this.SmoothScaleComponent_SpecificType.content);

    this.patch({
      SmoothScaleComponent_SpecificType: {
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

    this.SmoothScaleComponent_SpecificType.patch({
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
}