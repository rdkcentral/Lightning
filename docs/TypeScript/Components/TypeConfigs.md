# Component Type Configs

**Type Configs** define other types, outside of the [Template Specs](TemplateSpecs.md), that are used by a Component.

A Type Config is provided, optionally, as the 2nd generic parameter of the `Lightning.Component` base class:

```ts
class MyComponent
  extends Lightning.Component<MyComponentTemplateSpec, MyComponentTypeConfig> /* ... */ {
    // ...
  }
```

## Basic Structure

Below is a reproduction of the base `TypeConfig` interface that you extend to provide your own Type Config for a Component.

```ts
interface TypeConfig {
  EventMapType: Lightning.Component.EventMap;
  SignalMapType: Lightning.Component.SignalMap;
  TextureType: Lightning.Texture;

  // If you are using Lightning SDK the following options are available:
  IsPage: boolean;
  HistoryStateType: Record<string, unknown>
}
```

Definitions:
- `EventMapType`
  - The EventMap to associate with a Component
- `SignalMapType`
  - The SignalMap to associate with a Component
- `TextureType`
  - The Texture class to make available in a Component's `texture` property.
- `IsPage` (Lightning SDK only)
  - If set to `true` designates the Component as a Router Page
- `HistoryStateType` (Lightning SDK only)
  - The type to use for Router History State.
  - Used only if `IsPage` is set to `true`.

## Defining a Type Config

Define a Type Config for a Component by first creating an interface that extends `Lightning.Component.TypeConfig`. You only need to add the keys that you'd like to override for your Component.

```ts
interface MyComponentTypeConfig extends Lightning.Component.TypeConfig {
  EventMapType: MyComponentEventMap;
  SignalMapType: MyComponentSignalMap;
}
```

Below describes how to define each of the types.

## Event Maps

Event Maps define the specific events and the parameter structure of those events that a Component emits.

```ts
interface MyComponentEventMap extends Lightning.Component.EventMap {
  titleLoaded(): void;
  ratingColor(color: number, visible: boolean): void;
}
```

When this Event Map is set on a Component, the various EventEmitter calls on a Component instance will utilize them for type-checking and IDE hints.

```ts
this.emit('titleLoaded');
this.emit('ratingColor', 123, true);

this.on('titleLoaded', () => {});
this.on('ratingColor', (color, visible) => { console.log(color, visible); })

this.removeAllListeners('titleLoaded');
this.removeAllListeners('ratingColor');
```

## Signal Maps

Signal Maps define the specific [Signals](../../Communication/Signal.md) and parameter structure that a Component emits.


```ts
interface MyComponentSignalMap extends Lightning.Component.SignalMap {
  signalName(): void;
  toggleText(alpha: number, color: string): void;
  toggleImage(alpha: number): void;
}
```

When this Signal Map is set on a Component, the various signal interaction points on a Component instance will utilize them for type-checking and IDE hints:

```ts
class MyComponent
  extends Lightning.Component<MyComponentSpec, MyComponentTypeConfig> /* ... */ {

  override _handleEnter() {
    this.signal('signalName');
    this.signal('toggleText', 1.0, 'red');
    this.signal('toggleImage', 0.5);
  }
}

class MyParentComponent extends Lightning.Component {
  static _template() {
    return {
      Button: {
        type: MyComponent,
        signals: {
          // These keys / values are type checked
          signalName: true,
          toggleText: '_toggleText',
          toggleImage(alpha) { /* ... */ }
        },
        passSignals: {
          // Same for Pass Signals
          signalName: true,
          toggleText: 'renamedSignal',
        }
      }
    }

    // Warning: Signal handler signatures are NOT type checked
    _toggleText(alpha: number, color: string) {
      // ...
    }
  }
  // ...
}
```

## Loose Type Configs

If a Type Config is not explicitly provided, a **Loose Type Config** will be used by default. This is similar to the [**Loose Template Spec**](TemplateSpecs.md). Events and Signals will be handled in a much more looser fashion, allowing you to hook up any Events/Signals regardless of if any are explicitly specified.

You can also explicitly extend the base `LooseTypeConfig` interface if you want the best of both worlds. Explicitly specified Events and Signals will be type checked. But any other Event or Signal will be allowed and be able to emit/receive `any` set of parameters.

```ts
export interface TypeConfigLoose extends Lightning.Component.TypeConfigLoose {
  SignalMapType: MyComponentSignalMap,
  EventMapType: MyComponentEventMap
}
```
