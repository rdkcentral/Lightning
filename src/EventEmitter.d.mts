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
import { HandlerParameters } from "./internalTypes.mjs";

declare namespace EventEmitter {
  /**
   * Extend or use the DefaultEventMap to support loosely typed events.
   *
   * @remarks
   * This EventMap accepts any string as an event name, and accepts any arguments as well.
   */
  interface DefaultEventMap {
    [s: string]: (...args: any[]) => void;
  }

  export interface Mixin<EventMap = DefaultEventMap> {
    /**
     * Adds the listener function to the end of the listeners array for the event named `name`.
     *
     * @param name
     * @param listener
     */
    on<EventName extends keyof EventMap>(name: EventName, listener: EventMap[EventName]): void;

    /**
     * Adds a **one-time** listener function for the event named `name`. The next time `name`
     * is triggered, this listener is removed and then invoked.
     *
     * @param name
     * @param listener
     */
    once<EventName extends keyof EventMap>(name: EventName, listener: EventMap[EventName]): void;

    /**
     * Returns `true` if the listeners array for the event named `name` includes `listener`
     *
     * @param name
     * @param listener
     */
    has<EventName extends keyof EventMap>(name: EventName, listener: EventMap[EventName]): boolean;

    /**
     * Removes the specified listener from the listener array for the event named `name`.
     *
     * @param name
     * @param listener
     */
    off<EventName extends keyof EventMap>(name: EventName, listener: EventMap[EventName]): void;

    /**
     * Synchronously calls each of the listeners registered for the event named `name`,
     * in the order they were registered, passing the supplied arguments to each.
     *
     * @param name
     * @param arg1
     * @param arg2
     * @param arg3
     */
    emit<EventName extends keyof EventMap>(name: EventName, ...args: HandlerParameters<EventMap[EventName]>): void;

    /**
     * Alias for {@link off}
     *
     * @param name
     * @param listener
     */
    removeListener<EventName extends keyof EventMap>(name: EventName, listener: EventMap[EventName]): void;

    /**
     * Returns the number of listeners listening to the event named `name`.
     *
     * @param name
     */
    listenerCount<EventName extends keyof EventMap>(name: EventName): number;

    /**
     * Removes all listeners of the event named `name`.
     *
     * @param name
     */
    removeAllListeners<EventName extends keyof EventMap>(name: EventName): void;
  }
}

declare class EventEmitter<EventMap = EventEmitter.DefaultEventMap> implements EventEmitter.Mixin<EventMap> {
  constructor();
  // Copy/pasted (minus typedoc comments) from EventEmitter.Mixin
  on<EventName extends keyof EventMap>(name: EventName, listener: EventMap[EventName]): void;
  once<EventName extends keyof EventMap>(name: EventName, listener: EventMap[EventName]): void;
  has<EventName extends keyof EventMap>(name: EventName, listener: EventMap[EventName]): boolean;
  off<EventName extends keyof EventMap>(name: EventName, listener: EventMap[EventName]): void;
  emit<EventName extends keyof EventMap>(name: EventName, ...args: HandlerParameters<EventMap[EventName]>): void;
  removeListener<EventName extends keyof EventMap>(name: EventName, listener: EventMap[EventName]): void;
  listenerCount<EventName extends keyof EventMap>(name: EventName): number;
  removeAllListeners<EventName extends keyof EventMap>(name: EventName): void;

  static addAsMixin<T extends (...args: any[]) => {}>(cls: T): void;
}

export default EventEmitter;
