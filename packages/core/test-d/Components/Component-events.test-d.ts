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

  export interface TypeConfigLoose extends Lightning.Component.TypeConfigLoose {
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

//
// Explicit Loose TypeConfigs
//
// A component can be configured explicitly to have a loose type config
// Known signals and events will be type checked as usual but any signal or event can
// still be set up.
class MyComponent_Strong_LooseTypeConfig extends Lightning.Component<
  MyComponent_Strong.TemplateSpec,
  MyComponent_Strong.TypeConfigLoose
> {
  sendMoney(amount: number) {
    /// Test that known events and signals are type checked
    type T1000 = typeof this.emit<"burglarAlarm">;
    expectType<(name: "burglarAlarm", sound: string) => void>({} as T1000);

    type T2000 = typeof this.on<"burglarAlarm">;
    expectType<(name: "burglarAlarm", listener: (sound: string) => void) => void>({} as T2000);

    type T3000 = typeof this.signal<"audit">;
    expectType<(event: "audit") => void>({} as T3000);

    type T4000 = typeof this.signal<"money">;
    expectType<(event: "money", amount: number) => void>({} as T4000);

    /// Test that unknown events and signals are allowed without errors
    type T5000 = typeof this.emit<"unknownEvent">;
    expectType<(name: "unknownEvent", ...args: any[]) => void>({} as T5000);

    type T6000 = typeof this.on<"unknownEvent">;
    expectType<(name: "unknownEvent", listener: (...args: any[]) => void) => void>({} as T6000);

    type T7000 = typeof this.signal<"unknownSignal">;
    expectType<(event: "unknownSignal", ...args: any[]) => any>({} as T7000);

    /// Test that the parameter types of known events and signals are inferred correctly
    ///// Test the positive cases
    this.emit('burglarAlarm', 'sound');
    this.on('burglarAlarm', (sound) => {
      expectType<string>(sound);
    });
    this.signal('audit');
    this.signal('money', 100);
    ///// Test the error cases
    // @ts-expect-error second param should be a string
    this.emit('burglarAlarm', 100);
    // @ts-expect-error `sound` should be a string
    this.on('burglarAlarm', (sound: number) => {});
    // @ts-expect-error `audit` should not have any parameters
    this.signal('audit', 100);
    // @ts-expect-error `money` should have a number parameter
    this.signal('money', '100');

    /// Test that unknown events and signals are allowed without errors
    this.emit('unknownEvent', 'sound');
    this.on('unknownEvent', (sound: string) => {
      expectType<string>(sound);
    });
    this.signal('unknownSignal');
    this.signal('unknownSignal', 100);
  }
}

namespace MyApplication_LooseTypeConfig {
  export interface TemplateSpec extends Lightning.Application.TemplateSpec {
    MyComponent1: typeof MyComponent_Strong_LooseTypeConfig;
    MyComponent2: typeof MyComponent_Strong_LooseTypeConfig;
    MyComponent3: typeof MyComponent_Strong_LooseTypeConfig;
  }
}

class MyApplication_LooseTypeConfig extends Lightning.Application<MyApplication_LooseTypeConfig.TemplateSpec> {
  MyComponent1 = this.getByRef('MyComponent1')!;
  MyComponent2 = this.getByRef('MyComponent2')!;
  MyComponent3 = this.tag('MyComponent3')!;


  static override _template(): Lightning.Component.Template<MyApplication_LooseTypeConfig.TemplateSpec> {
    return {
      MyComponent1: {
        type: MyComponent_Strong_LooseTypeConfig,
        signals: {
          /// Should allow known signals with a direct handler
          audit(...args) {
            /// Should infer the correct parameter types of known signals
            expectType<[]>(args);
          },
          /// Should allow known signals with a direct handler
          money(...args) {
            /// Should infer the correct parameter types of known signals
            expectType<[number]>(args);
          },
          /// Should allow unknown signals with a direct handler
          unknownSignal(...args) {
            /// Should infer unknown signal parmas as any[]
            expectType<any[]>(args);
          },
          /// Should allow unknown signals with a string handler
          unknownSignal2: 'handler',
          /// Should allow unknown signals with a boolean handler
          unknownSingal3: true,
        },
      },
      MyComponent2: {
        type: MyComponent_Strong_LooseTypeConfig,
        signals: {
          /// Should allow known signals with a string handler
          audit: 'handler',
          /// Should allow known signals with a boolean handler
          money: true,
        },
      },
      MyComponent3: {
        type: MyComponent_Strong_LooseTypeConfig,
        signals: {
          /// Should NOT allow ANY signal (known or unknown) with completely invalid types
          // @ts-expect-error Known signal handler can't be a number
          audit: 100,
          // @ts-expect-error Known signal handler can't be an object
          money: {},
          // @ts-expect-error Unknown signal handler can't be a number
          unknownSignal: 100,
          // @ts-expect-error Unknown signal handler can't be an object
          unknownSignal2: {},
        },
      },
    };
  }

  override _init() {
    this.MyComponent1.emit('burglarAlarm', 'BANG!');
  }
}