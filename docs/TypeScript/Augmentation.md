# Augmentation

There are certain global type structures provided by Lightning Core that your app may need/want to add on to. TypeScript allows such add-ons via [Declaration Merging](https://www.typescriptlang.org/docs/handbook/declaration-merging.html) and [Module Augmentation](https://www.typescriptlang.org/docs/handbook/declaration-merging.html#module-augmentation).

The following are the TypeScript interfaces exported by Lightning Core that are designed for augmentation. You may find need to augment other available interfaces. In this event, please let us know what interfaces you are augmenting so we may add use guidelines to this page (or submit a [PR](https://github.com/rdkcentral/Lightning/pulls)!).

## Component Key Handlers

Key Handlers are the methods you implement in your Components in order to handle key events. These are based on the Key Map provided during Application initialization. Often times the default set of key handlers that come with Lightning are good enough. But sometimes you need to add additional keys to it or replace it altogether. Lightning's TypeScript implementation includes the default key map set of handlers in the Component class. This allows you to write your class and have TypeScript make sure the parameters/return values are proper:

```ts
class MyComponent extends Lightning.Component {
  override _handleEnter(e: KeyboardEvent) {
    // Implementation
  }
}
```

Lightning's TypeScript implementation gives you two augmentable interfaces if you need to use your own custom key map in anyway:
- `Lightning.Component.DefaultKeyHandlers`
  - Allows adding new handlers without affecting existing default ones.
- `Lightning.Component.CustomKeyHandlers`
  - Allows replacing the entire set of DefaultKeyHandlers with your own custom handlers.

Augmenting these interfaces requires precise boilerplate to be used.

For each key, you need to add the following handlers precisely:
```
_capture<KeyName>?(e: KeyboardEvent): boolean | void;
_capture<KeyName>Release?(e: KeyboardEvent): boolean | void;
_handle<KeyName>?(e: KeyboardEvent): boolean | void;
_handle<KeyName>Release?(e: KeyboardEvent): boolean | void;
```

See the examples below.

### Lightning.Component.DefaultKeyHandlers (Add new handlers)

When this interface is augmented, you add additional key handlers to the existing default set.

```ts
import '@lightningjs/sdk'

declare module '@lightningjs/sdk' {
  namespace Lightning {
    namespace Component {
      interface DefaultKeyHandlers {
        _captureHome?(e: KeyboardEvent): boolean | void;
        _captureHomeRelease?(e: KeyboardEvent): boolean | void;
        _handleHome?(e: KeyboardEvent): boolean | void;
        _handleHomeRelease?(e: KeyboardEvent): boolean | void;
      }
    }
  }
}
```


### Lightning.Component.CustomKeyHandlers (Replace handlers)

When this interface is augmented, the entire set of `DefaultKeyHandlers` are replaced by whatever you define here.

Example:
```ts
import '@lightningjs/sdk'

declare module '@lightningjs/sdk' {
  namespace Lightning {
    namespace Component {
      interface CustomKeyHandlers {
        _captureHome?(e: KeyboardEvent): boolean | void;
        _captureHomeRelease?(e: KeyboardEvent): boolean | void;
        _handleHome?(e: KeyboardEvent): boolean | void;
        _handleHomeRelease?(e: KeyboardEvent): boolean | void;
      }
    }
  }
}
```

## Lightning.Component.FireAncestorsMap

Augmenting this interface this allows you to globally add to the events available in the `firstAncestors()` method available in any Component.

Example:
```ts
import '@lightningjs/sdk'

declare module '@lightningjs/sdk' {
  namespace Lightning {
    namespace Component {
      interface FireAncestorsMap {
        $itemCreated(): void;
        $selectItem(item: string, index: number): void;
      }
    }
  }
}
```

By augmenting the above, your application's Components will be able to make the following calls in a type-checked way including hints from the IDE of what the available events are and what parameters are required for each one. It also helps you prevent reusing the same event name with different method signatures.

```ts
this.fireAncestors('$itemCreated');
this.fireAncestors('$selectItem', 'abc', 123);
```

## Lightning.Application.EventMap

Some applications opt to use the root Application component (available from any Component with `this.application`) as a central event bus. Our [TMDB](https://github.com/mlapps/com.metrological.app.TMDB) demo app is a good example of this in action. The Application includes an empty `EventMap` which can be augmented with your Application's custom events.

Example:
```ts
import '@lightningjs/sdk'

declare module '@lightningjs/sdk' {
  namespace Lightning {
    namespace Application {
      interface EventMap {
        titleLoaded(): void;
        ratingColor(color: number): void;
        setBackground(evt: { src: string }): void;
      }
    }
  }
}
```

By augmenting the above, all of the Components of your application will now be able to emit and handle events to/from the root Application component. Including all the IDE help and type-checking that using TypeScript brings:

```ts
this.application.emit('titleLoaded');
this.application.emit('ratingColor', 123);
this.application.on('setBackground', ({src}) => console.log(src));
this.application.removeAllListeners('ratingColor');
```
