/**
 * If `PossibleFunction` is a function, it returns the parameters from it as a tuple.
 * Otherwise, it returns an empty array tuple.
 *
 * @privateRemarks
 * This is a "safe" version of the included `Parameters` type. It allows us to extract parameters
 * from an EventMap function signature without having to enforce a generic constraint on all
 * EventMaps, which isn't practical without blowing up type safety.
 *
 * @hidden
 */
type EventEmitterParameters<PossibleFunction> =
  PossibleFunction extends (...args: any[]) => any
    ?
      Parameters<PossibleFunction>
    :
      [];

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
    emit<EventName extends keyof EventMap>(name: EventName, ...args: EventEmitterParameters<EventMap[EventName]>): void;

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
  emit<EventName extends keyof EventMap>(name: EventName, ...args: EventEmitterParameters<EventMap[EventName]>): void;
  removeListener<EventName extends keyof EventMap>(name: EventName, listener: EventMap[EventName]): void;
  listenerCount<EventName extends keyof EventMap>(name: EventName): number;
  removeAllListeners<EventName extends keyof EventMap>(name: EventName): void;

  static addAsMixin<T extends (...args: any[]) => {}>(cls: T): void;
}

export default EventEmitter;
