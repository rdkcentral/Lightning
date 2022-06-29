declare namespace EventEmitter {
  export type EventListener = (arg1?: unknown, arg2?: unknown, arg3?: unknown) => void;

  export interface Mixin {
    emit(name: string, arg1?: unknown, arg2?: unknown, arg3?: unknown): void;
    has(name: string, listener: EventListener): boolean;
    off(name: string, listener: EventListener): void;
    on(name: string, listener: EventListener): void;
  }
}

// !!! Compare with how we did in loki
declare class EventEmitter implements EventEmitter.Mixin {
  constructor();

  on(name: string, listener: EventListener): void;
  has(name: string, listener: EventListener): boolean;
  off(name: string, listener: EventListener): void;
  emit(name: string, arg1?: unknown, arg2?: unknown, arg3?: unknown): void;

  static addAsMixin<T>(cls: T): T & EventEmitter.Mixin;
}

export default EventEmitter;
