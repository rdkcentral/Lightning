/**
 * EventEmitter Tests
 *
 * The goal is to test the strong typing capability of EventEmitters
 */
import EventEmitter from "../src/EventEmitter.mjs";

/// Tests for Strongly typed event emitter
function StrongEventEmitterTests() {
  interface EventMap {
    voidEvent: () => void,
    numberParameterEvent: (arg1: number) => void,
    threeArgEvent: (arg1: string, arg2: number, arg3: boolean) => void,
  }

  const eeStrong = new EventEmitter<EventMap>;

  /// Known types are allowed
  function KnownTypes() {
    eeStrong.on('voidEvent', () => {});
    eeStrong.once('numberParameterEvent', () => {});
    eeStrong.has('threeArgEvent', () => {});
    eeStrong.off('voidEvent', () => {});
    eeStrong.emit('numberParameterEvent', 123);
    eeStrong.removeListener('threeArgEvent', () => {});
    eeStrong.listenerCount('voidEvent');
    eeStrong.removeAllListeners('numberParameterEvent');
  }

  /// Unknown types are not allowed
  function UnknownTypes() {
    // @ts-expect-error
    eeStrong.on('unknown', () => {});
    // @ts-expect-error
    eeStrong.once('unknown', () => {});
    // @ts-expect-error
    eeStrong.has('unknown', () => {});
    // @ts-expect-error
    eeStrong.off('unknown', () => {});
    // @ts-expect-error
    eeStrong.emit('unknown', 123);
    // @ts-expect-error
    eeStrong.removeListener('unknown', () => {});
    // @ts-expect-error
    eeStrong.listenerCount('unknown');
    // @ts-expect-error
    eeStrong.removeAllListeners('unknown');
  }

  /// Handler methods work when provided valid callback methods
  function HandlerMethodValidCallbacks() {
    eeStrong.on('voidEvent', () => {});
    eeStrong.once('numberParameterEvent', (arg1: number) => {});
    eeStrong.has('threeArgEvent', (arg1: string, arg2: number, arg3: boolean) => {});
    eeStrong.off('voidEvent', () => {});
    eeStrong.removeListener('threeArgEvent', (arg1: string, arg2: number, arg3: boolean) => {});
  }

  /// Handler methods error on invalid callback parameter types
  function HandlerMethodInvalidCallbacks() {
    // @ts-expect-error
    eeStrong.on('voidEvent', (arg1: number) => {});
    // @ts-expect-error
    eeStrong.once('numberParameterEvent', (arg1: string) => {});
    // @ts-expect-error
    eeStrong.has('threeArgEvent', (arg1: number) => {});
    // @ts-expect-error
    eeStrong.off('voidEvent', (arg1: number) => {});
    // @ts-expect-error
    eeStrong.removeListener('threeArgEvent', (arg1: number) => {});
  }

  /// emit() works for valid callback parameter values
  function EmitValid() {
    eeStrong.emit('voidEvent');
    eeStrong.emit('numberParameterEvent', 123);
    eeStrong.emit('threeArgEvent', 'abc', 123, true);
  }

  /// emit() errors for invalid callback parameter values
  function EmitErrors() {
    // @ts-expect-error
    eeStrong.emit('voidEvent', 123);
    // @ts-expect-error
    eeStrong.emit('numberParameterEvent', 'abc');
    // @ts-expect-error
    eeStrong.emit('threeArgEvent', true, 123);
  }

}

/// Tests for Loosely typed event emitter
function LooseEventEmitterTests() {
  interface LooseEventMap extends EventEmitter.DefaultEventMap {
    THE_ONLY_KNOWN_EVENT(): void;
  }
  const eeLoose = new EventEmitter<LooseEventMap>();


  /// Known events do not cause errors when provided with valid callbacks/param values
  function KnownEventsValid() {
    eeLoose.on('THE_ONLY_KNOWN_EVENT', () => {});
    eeLoose.once('THE_ONLY_KNOWN_EVENT', () => {});
    eeLoose.has('THE_ONLY_KNOWN_EVENT', () => {});
    eeLoose.off('THE_ONLY_KNOWN_EVENT', () => {});
    eeLoose.emit('THE_ONLY_KNOWN_EVENT');
    eeLoose.removeListener('THE_ONLY_KNOWN_EVENT', () => {});
    eeLoose.listenerCount('THE_ONLY_KNOWN_EVENT');
    eeLoose.removeAllListeners('THE_ONLY_KNOWN_EVENT');
  }

  /// Known events do not cause errors when provided with valid callbacks/param values
  function KnownEventsInvalid() {
    // @ts-expect-error
    eeLoose.on('THE_ONLY_KNOWN_EVENT', (arg1: number) => {});
    // @ts-expect-error
    eeLoose.once('THE_ONLY_KNOWN_EVENT', (arg1: number) => {});
    // @ts-expect-error
    eeLoose.has('THE_ONLY_KNOWN_EVENT', (arg1: number) => {});
    // @ts-expect-error
    eeLoose.off('THE_ONLY_KNOWN_EVENT', (arg1: number) => {});
    // @ts-expect-error
    eeLoose.emit('THE_ONLY_KNOWN_EVENT', 123);
    // @ts-expect-error
    eeLoose.removeListener('THE_ONLY_KNOWN_EVENT', (arg1: number) => {});
  }

  /// Any unknown event name is allowed
  function AnyEventName() {
    eeLoose.on('voidEvent', () => {});
    eeLoose.once('numberParameterEvent', () => {});
    eeLoose.has('threeArgEvent', () => {});
    eeLoose.off('voidEvent', () => {});
    eeLoose.emit('numberParameterEvent', 123);
    eeLoose.removeListener('threeArgEvent', () => {});
    eeLoose.listenerCount('voidEvent');
    eeLoose.removeAllListeners('numberParameterEvent');

    eeLoose.on('unknown', () => {});
    eeLoose.once('unknown', () => {});
    eeLoose.has('unknown', () => {});
    eeLoose.off('unknown', () => {});
    eeLoose.emit('unknown', 123);
    eeLoose.removeListener('unknown', () => {});
    eeLoose.listenerCount('unknown');
    eeLoose.removeAllListeners('unknown');
  }

  /// Handler methods work for any unknown unknown / callback methods
  function HandlerMethodAnyCallbacks() {
    eeLoose.on('voidEvent', () => {});
    eeLoose.once('numberParameterEvent', (arg1: number) => {});
    eeLoose.has('threeArgEvent', (arg1: string, arg2: number, arg3: boolean) => {});
    eeLoose.off('voidEvent', () => {});
    eeLoose.removeListener('threeArgEvent', (arg1: string, arg2: number, arg3: boolean) => {});

    eeLoose.on('voidEvent', (arg1: number) => {});
    eeLoose.once('numberParameterEvent', (arg1: string) => {});
    eeLoose.has('threeArgEvent', (arg1: number) => {});
    eeLoose.off('voidEvent', (arg1: number) => {});
    eeLoose.removeListener('threeArgEvent', (arg1: number) => {});
  }

  /// emit() works for any unkonwn event / callbacks param values
  function Emit() {
    eeLoose.emit('voidEvent');
    eeLoose.emit('numberParameterEvent', 123);
    eeLoose.emit('threeArgEvent', 'abc', 123, true);

    eeLoose.emit('voidEvent', 123);
    eeLoose.emit('numberParameterEvent', 'abc');
    eeLoose.emit('threeArgEvent', true, 123);
  }
}
