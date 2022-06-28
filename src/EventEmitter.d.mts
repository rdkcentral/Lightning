type EventListener = (arg1?: unknown, arg2?: unknown, arg3?: unknown) => void;

interface EventEmitterMixin {
  emit(name: string, arg1?: unknown, arg2?: unknown, arg3?: unknown): void;
  has(name: string, listener: EventListener): boolean;
  off(name: string, listener: EventListener): void;
  on(name: string, listener: EventListener): void;
}

// !!! Compare with how we did in loki
export default class EventEmitter implements EventEmitterMixin {
  constructor();

  on(name: string, listener: EventListener): void;
  has(name: string, listener: EventListener): boolean;
  off(name: string, listener: EventListener): void;
  emit(name: string, arg1?: unknown, arg2?: unknown, arg3?: unknown): void;

  static addAsMixin<T>(cls: T): T & EventEmitterMixin;
}
