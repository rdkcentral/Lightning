/**
 * Tests for all the types of events that can come from a Component
 *
 * - Signals
 * - Event Emitter Events
 * - Fire Ancestor Events
 */
import { expectType } from 'tsd';
import { Lightning } from '../../index.typedoc.js';

// Fire Ancestors are augmented globally
declare module '../../index.typedoc.js' {
  namespace Lightning {
    namespace Component {
      interface FireAncestorsMap {
        $augmentedComponentsEventsTest(a: number): string;
        $callPolice(): boolean;
      }
    }
  }
}

namespace MyComponent {
  export interface TemplateSpec extends Lightning.Component.TemplateSpecStrong {

  }

  export interface EventMap extends Lightning.Component.EventMap {
    burglarAlarm(sound: string): void;
  }

  export interface SignalMap extends Lightning.Component.SignalMap {
    money(amount: number): void;
    audit(): void;
  }

  export interface TypeConfig extends Lightning.Component.TypeConfig {
    SignalMapType: SignalMap,
    EventMapType: EventMap
  }
}

class MyComponent extends Lightning.Component<
  MyComponent.TemplateSpec,
  MyComponent.TypeConfig
> {
  sendMoney(amount: number) {
    if (amount > 10000000) {
      this.emit('burglarAlarm', 'WEEEE-OOOOO-WEEEE-OOOOO');
    }
    else if (amount > 100) {
      this.signal('audit');
    } else {
      this.signal('money', amount);
    }
  }
}

namespace MyParentComponent {
  export interface TemplateSpec extends Lightning.Component.TemplateSpecStrong {
    MyComponent: typeof MyComponent
  }

  export interface SignalMap extends Lightning.Component.SignalMap {
    audit(): void;
    deposit(a: number): void;
  }

  export interface TypeConfig extends Lightning.Component.TypeConfig {
    SignalMapType: SignalMap
  }
}

class MyParentComponent extends Lightning.Component<MyParentComponent.TemplateSpec, MyParentComponent.TypeConfig> {
  MyComponent = this.getByRef('MyComponent')!;

  static override _template(): Lightning.Component.Template<MyParentComponent.TemplateSpec> {
    return {
      MyComponent: {
        type: MyComponent,
        signals: {
          money: true
        },
        passSignals: {
          audit: true,
        }
      }
    };
  }

  override _handleEnter() {
    this.MyComponent.sendMoney(100);
  }

  money(amount: number) {
    console.log(`Recieved $100 ${amount}`);
    this.fireAncestors('$augmentedComponentsEventsTest', amount);
  }
}


namespace MyApplication {
  export interface TemplateSpec extends Lightning.Application.TemplateSpecStrong {
    MyParentComponent: typeof MyParentComponent
  }
}

class MyApplication extends Lightning.Application<MyApplication.TemplateSpec> {
  MyParentComponent = this.getByRef('MyParentComponent')!;

  static override _template(): Lightning.Component.Template<MyApplication.TemplateSpec> {
    return {
      MyParentComponent: {
        type: MyParentComponent,
        signals: {
          audit() {
            // Handle audit
          },
          deposit: 'depositHandler'
        },
      }
    };
  }

  override _init() {
    this.MyParentComponent.MyComponent.on('burglarAlarm', (sound) => {
      expectType<boolean>(this.fireAncestors('$callPolice'));
    })
  }

  depositHandler(amount: number) {

  }

  $augmentedComponentsEventsTest(amount: number) {

  }
}