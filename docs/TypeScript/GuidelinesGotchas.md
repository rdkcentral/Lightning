# Guidelines / Gotchas

While great care was taken to make Lightning as type-safe as possible out of the box there is some care you need to take in order to maximize type-safety. There are also areas where type-safety is not possible. Keeping these guidelines and gotchas in mind (as well as familiarizing yourself with the rest of our documentation on TypeScript) will help you and your team enjoy the power of TypeScript with the least amount of headaches.

## DOM `Element` vs `Lightning.Element`

TypeScript globally exposes a class interface called `Element` which is a [DOM Element](https://developer.mozilla.org/en-US/docs/Web/API/Element). If you use the lone identifier `Element` as a type in your Lightning App, it will not cause an error, but you very likely meant to use `Lightning.Element`. This can cause invalid property access issues and type mismatches during assignements.

## Deep Property Transitions

The string "dot notation" access of transitions (via `smooth` / `setSmooth()`) is not supported in a type-safe way. If you can't avoid using them, you can use assert the property `as any` in order to clear the error TypeScript produces.

```ts
// Example 1
this.Actor.setSmooth("shader.amount" as any, 100);

// Example 2
this.patch({
  Actor: {
    smooth: {
      ["shader.amount" as any]: 100
    }
  },
})
```

## Deep Property Animations

Like Transitions (see above), the "dot notation" access of Animations (via `animation()`) is also not supported. Avoid using them whenever possible. When not possible, there are special type specific assertions you can use on the property keys:

- `as '$$number'` - for numbers
- `as '$$boolean'` - for booleans
- `as '$$string'` - for strings

Example:
```ts
this.animation({
  duration: 0.6, actions:[
    {t: 'RatingCircle', p: 'shader.angle' as '$$number', rv: 0.0001, v: (e) => {
      return (this._voteAverage/10) * e;
    }},
    {t: 'Number', p: 'text.text' as '$$string', rv: '0', v: (e) => {
      return `${Math.floor((this._voteAverage*10) * e)}`;
    }}
  ]
});
```

## Write-Only Properties

There are some write-only properties of classes that when read will return undefined. Due to a [limitation in TypeScript](https://github.com/microsoft/TypeScript/issues/43662), these cannot always be typed properly while still allowing their write type to function correctly. In situations like this the following warning is added to the property's documentation comment:
```
WARNING: DO NOT read from this property. It is WRITE-ONLY. It will return `undefined`.
```

## In General

In general, be on guard for random type issues. Report them to us if you encounter any not already called out.
