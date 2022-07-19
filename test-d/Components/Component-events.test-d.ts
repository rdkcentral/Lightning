/**
 * Tests for all the types of events that can come from a Component
 *
 * - Signals
 * - Event Emitter Events
 * - Fire Ancestor Events
 */
import { Lightning } from '../../index.typedoc.js';
import { TestTemplateSpec } from './Component-types.test-d.js';

// Fire Ancestors are augmented globally
declare module '../../index.typedoc.js' {
  namespace Lightning {
    namespace Component {
      interface FireAncestorsMap {
        $augmentedComponentsEventsTest(a: number): string;
      }
    }
  }
}

namespace MyComponent {
  export interface TemplateSpec extends Lightning.Component.TemplateSpecStrong {

  }

  export interface EventMap extends Lightning.Component.EventMap {

  }

  export interface SignalMap extends Lightning.Component.SignalMap {
    mySignal(): void;
  }

  export interface TypeConfig extends Lightning.Component.TypeConfig {
    SignalMapType: SignalMap
  }
}

class MyComponent extends Lightning.Component<
  MyComponent.TemplateSpec,
  MyComponent.TypeConfig
> {

}

namespace MyApplication {
  export interface TemplateSpec extends Lightning.Application.TemplateSpecStrong {
    MyComponent: typeof MyComponent
  }
}

class MyApplication extends Lightning.Application<MyApplication.TemplateSpec> {
  MyComponent = this.getByRef('MyComponent')!;

  static _template(): Lightning.Component.Template<MyApplication.TemplateSpec> {
    return {
      MyComponent: {
        type: MyComponent,
        signals: {
          mySignal: true
        }
      }
    };
  }
}