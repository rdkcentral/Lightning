/*
 * If not stated otherwise in this file or this component's LICENSE file the
 * following copyright and licenses apply:
 *
 * Copyright 2022 Metrological
 *
 * Licensed under the Apache License, Version 2.0 (the License);
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
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

//
// Strong typing for signals and events
//
namespace MyComponent_Strong {
  export interface TemplateSpec extends Lightning.Component.TemplateSpec {

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

class MyComponent_Strong extends Lightning.Component<
  MyComponent_Strong.TemplateSpec,
  MyComponent_Strong.TypeConfig
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
  export interface TemplateSpec extends Lightning.Component.TemplateSpec {
    MyComponent_Strong: typeof MyComponent_Strong
    MyComponent_Strong2: typeof MyComponent_Strong
    MyComponent_Strong3: typeof MyComponent_Strong
    MyComponent_Strong4: typeof MyComponent_Strong
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
  MyComponent_Strong = this.getByRef('MyComponent_Strong')!;

  static override _template(): Lightning.Component.Template<MyParentComponent.TemplateSpec> {
    return {
      MyComponent_Strong: {
        type: MyComponent_Strong,
        signals: {
          /// Boolean handler
          money: true,
        },
        passSignals: {
          audit: true,
        }
      },
      MyComponent_Strong2: {
        type: MyComponent_Strong,
        signals: {
          /// Direct handler
          money: (amount: number) => {},
        },
        passSignals: {
          /// String handler
          audit: 'audit',
        }
      },
      MyComponent_Strong3: {
        type: MyComponent_Strong,
        signals: {
          /// Direct handler
          // @ts-expect-error Signal parameters are checked
          money: (invalidParamType: string) => {},
        },
      },
      MyComponent_Strong4: {
        type: MyComponent_Strong,
        signals: {
          // @ts-expect-error Any signal is not allowed for strong TypeConfigs
          notAValidSignal: true,
        },
        passSignals: {
          // @ts-expect-error Any signal is not allowed for strong TypeConfigs
          notAValidSignal: true,
        }
      }
    };
  }

  override _handleEnter() {
    this.MyComponent_Strong.sendMoney(100);
  }

  money(amount: number) {
    console.log(`Recieved $100 ${amount}`);
    this.fireAncestors('$augmentedComponentsEventsTest', amount);
  }
}

//
// Loose typing for signals and events
//
class MyComponent_Loose extends Lightning.Component {
  override _init() {
    /// Any signal can be emitted from loose components
    expectType<any>(this.signal('anythingShouldGo', 100));
    expectType<any>(this.signal('asWellAsAnyParam', 'string', 100, { a: 1 }, [1, 2, 3]));

    ////// Loose Events

    /// EventEmitter.on
    expectType<void>(this.on('anythingShouldGo', () => {}));
    expectType<void>(this.on('asWellAsAnyParam', (anyParam: number, shouldGo: string) => {}));

    /// EventEmitter.once
    expectType<void>(this.once('anythingShouldGo', () => {}));
    expectType<void>(this.once('asWellAsAnyParam', (anyParam: number, shouldGo: string) => {}));

    /// EventEmitter.has
    expectType<boolean>(this.has('anythingShouldGo', () => {}));
    expectType<boolean>(this.has('asWellAsAnyParam', (anyParam: number, shouldGo: string) => {}));

    /// EventEmitter.off
    expectType<void>(this.off('anythingShouldGo', () => {}));
    expectType<void>(this.off('asWellAsAnyParam', (anyParam: number, shouldGo: string) => {}));

    /// EventEmitter.emit
    expectType<void>(this.emit('anythingShouldGo', 100));
    expectType<void>(this.emit('asWellAsAnyParam', 'string', 100, { a: 1 }, [1, 2, 3]));

    /// EventEmitter.removeListener
    expectType<void>(this.removeListener('anythingShouldGo', () => {}));
    expectType<void>(this.removeListener('asWellAsAnyParam', (anyParam: number, shouldGo: string) => {}));

    /// EventEmitter.listenerCount
    expectType<number>(this.listenerCount('anythingShouldGo'));
    expectType<number>(this.listenerCount('asWellAsAnyParam'));

    /// EventEmitter.removeAllListeners
    expectType<void>(this.removeAllListeners('anythingShouldGo'));
    expectType<void>(this.removeAllListeners('asWellAsAnyParam'));
  }
}

namespace MyApplication {
  export interface TemplateSpec extends Lightning.Application.TemplateSpec {
    MyParentComponent: typeof MyParentComponent
    MyComponent_Loose: typeof MyComponent_Loose
  }
}

class MyApplication extends Lightning.Application<MyApplication.TemplateSpec> {
  MyParentComponent = this.getByRef('MyParentComponent')!;
  MyComponent_Loose = this.getByRef('MyComponent_Loose')!;

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
      },
      /// Loose TypeConfig allows any signals to be set up
      MyComponent_Loose: {
        type: MyComponent_Loose,
        signals: {
          anythingShouldGo: true,
          asWellAsAnyDirectHandler() {
            // Handle asWellAsAnyDirectHandler
          },
          orStringHandler: 'depositHandler'
        },
        passSignals: {
          anythingShouldGo: true,
          orStringHandler: 'depositHandler'
        }
      }
    };
  }

  override _init() {
    ////// Strong TypeConfig allows only defined events to be set up
    this.MyParentComponent.MyComponent_Strong.on('burglarAlarm', (sound) => {
      expectType<boolean>(this.fireAncestors('$callPolice'));
    });

    // @ts-expect-error Any event name is not allowed for strong TypeConfigs
    this.MyParentComponent.MyComponent_Strong.on('anyEventNameIsNotAllowed', () => {});
    // @ts-expect-error Defined event names cannot have invalid parameters
    this.MyParentComponent.MyComponent_Strong.on('burglarAlarm', (sound, notValidParameter) => {});

    ////// Loose TypeConfig allows any events to be set up
    this.MyComponent_Loose.on('anythingShouldGo', (anyParam: number, shouldGo: string) => {});
  }

  depositHandler(amount: number) {

  }

  $augmentedComponentsEventsTest(amount: number) {

  }
}