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
 * Tests for basic type functionality of states
 *
 * @module
 */
import { expectType } from 'tsd';
import lng from '../../index.js';

class MyComponent extends lng.Component {
  override _init() {
    /// _getState returns a string
    expectType<string>(this._getState());
    /// _setState returns void and allows one parameter (with any state for now)
    expectType<void>(this._setState('MyState2'));
    expectType<void>(this._setState('AnythingIsAllowed'));
  }

  /// Expect state to be specifyable as well as the overridable handlers in them
  static override _states() {
    return [
      class MyState extends this {
        override $enter(event: lng.Component.StateMachineEvent) {
          expectType<string>(event.newState);
          expectType<string>(event.prevState);
          expectType<string>(event.sharedState);
        }

        override $exit(event: lng.Component.StateMachineEvent) {
          // Intentionally blank
        }

        override _handleKey() {
          this._setState('MyState2')
        }
      },
      class MyState2 extends this {
        /// Any arbitrary args may be specified after the event param
        override $enter(event: lng.Component.StateMachineEvent, unknownArg1: string, unknownArg2: number) {
          // Intentionally blank
        }

        /// Any arbitrary args may be specified after the event param
        override $exit(event: lng.Component.StateMachineEvent, unknownArg1: boolean, unknownArg2: 'abc') {
          // Intentionally blank
        }

        override _handleEnterRelease() {

        }
      },
    ];
  }
}