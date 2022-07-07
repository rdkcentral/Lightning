declare namespace EventEmitter {
  export type EventListener = (arg1?: unknown, arg2?: unknown, arg3?: unknown) => void;

  export interface Mixin {
    /**
     * Adds the listener function to the end of the listeners array for the event named `name`.
     *
     * @param name
     * @param listener
     */
    on(name: string, listener: EventListener): void;

    /**
     * Adds a **one-time** listener function for the event named `name`. The next time `name`
     * is triggered, this listener is removed and then invoked.
     *
     * @param name
     * @param listener
     */
    once(name: string, listener: EventListener): void;

    /**
     * Returns `true` if the listeners array for the event named `name` includes `listener`
     *
     * @param name
     * @param listener
     */
    has(name: string, listener: EventListener): boolean;

    /**
     * Removes the specified listener from the listener array for the event named `name`.
     *
     * @param name
     * @param listener
     */
    off(name: string, listener: EventListener): void;

    /**
     * Synchronously calls each of the listeners registered for the event named `name`,
     * in the order they were registered, passing the supplied arguments to each.
     *
     * @param name
     * @param arg1
     * @param arg2
     * @param arg3
     */
    emit(name: string, arg1?: unknown, arg2?: unknown, arg3?: unknown): void;

    /**
     * Alias for {@link off}
     *
     * @param name
     * @param listener
     */
    removeListener(name: string, listener: EventListener): void;

    /**
     * Returns the number of listeners listening to the event named `name`.
     *
     * @param name
     */
    listenerCount(name: string): number;

    /**
     * Removes all listeners of the event named `name`.
     *
     * @param name
     */
    removeAllListeners(name: string): void;
  }
}

interface EventEmitter extends EventEmitter.Mixin {

}

declare class EventEmitter implements EventEmitter.Mixin {
  constructor();
  static addAsMixin<T extends (...args: any[]) => {}>(cls: T): void;
}

export default EventEmitter;
