# Subclassable Components

Usually, when creating a Lightning Component you do not need to specify your own generic parameters which are mixed into the ones passed further down into the Component base class. However, there are times when you want to make your Component type flexible and perhaps just as flexible as the Component base class which allows you to pass a [Template Spec](./TemplateSpecs.md) and [Type Config](./TypeConfig.md).  Perhaps you want to create a `MyList<T>` component that accepts any child Component of type T. Or a completely flexible `MyBaseComponent<TemplateSpecType, TypeConfig>` which all of your App's Components extend. When doing this there are a few guidelines and gotchas you need to pay attention to that stem from some design choices in TypeScript.

If we wish to create our own `MyBaseComponent` that provides its own base Template Spec and Event Map. First we start by creating our own interfaces for Template Spec and Type Config that extend their respective base interfaces from Component. The wrapping namespace `MyBaseComponent` is used purely for convention and organization. It is recommended but not required.

```ts
declare namespace MyBaseComponent {
  export interface TemplateSpec extends lng.Component.TemplateSpecStrong {
    MyBaseElement: {}
  }

  export interface EventMap extends lng.Component.EventMap {
    myBaseEvent(): void;
  }

  export interface TypeConfig extends lng.Component.TypeConfig {
    EventMapType: EventMap
  }
}
```
Note we added our own event `myBaseEvent` as well as an element called `MyBaseElement`.

Now we create the class. Supply two generic type parameters: `TemplateSpec` and `TypeConfig` in that order. Both should be constrained to extend from their respective interfaces that we just wrote above. Those same interfaces, respectively, should be assigned as the defaults for the parameters. This allows the type `MyBaseComponent` to be referenced without generic parameters which is useful to potential users and our implementation.

```ts
class MyBaseComponent<
  TemplateSpec extends MyBaseComponent.TemplateSpec = MyBaseComponent.TemplateSpec,
  TypeConfig extends MyBaseComponent.TypeConfig = MyBaseComponent.TypeConfig
> extends lng.Component<TemplateSpecType, TypeConfig> {

}
```

All of this so far is logical. We want to extend the interface types from Component, so we extend them and essentially rebuild the generic parameter list from the base `Component` class but using our new interfaces in place of the original ones from Component. We're now effectively allowing fully extensible subclasses from our base component.

Things get a bit tricky in our own implementation of the base component. Because the types for `TemplateSpec` and `TypeConfig` are not known at the implementation level, base methods from `Component` that rely on these types do not work normally. You would expect a statement like `this.getByRef('MyBaseElement')` to just work. After all, we just told TypeScript that the `TemplateSpec` generic param has to extend MyBaseComponent's Template Spec which includes MyBaseElement. But due to how [TypeScript handles generics and generic constraints](https://stackoverflow.com/a/73030517/1908298) this information is not enough for it to make confident decisions about what the type of `TemplateSpec` is when it is finally subclassed. So each of the generic type parameters are treated like a black box, and that getByRef call and even `this.emit('myBaseEvent')` will cause a TypeScript error. The error is ugly and can vary so we won't repeat it here.

Thankfully TypeScript offers us a solution that, while a bit of a pain, is easy to employ. And, again, this should not be needed for 95%+ of the Components you write. You can tell TypeScript to assert the `this` keyword is a fully known `MyBaseComponent`:

```ts
class MyBaseComponent /* ... */ {
  MyBaseElement: lng.Element = (this as MyBaseComponent).getByRef('MyBaseElement')!;

  override _init() {
    (this as MyBaseComponent).emit('myBaseEvent');
  }
}
```

Remember when we provided defaults for each of the generic type params? That allows these assertions to be written in this much cleaner abbreviated way while also remaining intuitive.

There are other ways to do this, if you don't want to wrap the as type assertion in every statement where it is needed:

```ts
class MyBaseComponent /* ... */ {
  MyBaseElement: lng.Element = (this as MyBaseComponent).getByRef('MyBaseElement')!;

  // Upcast `this` for entire method
  // https://www.typescriptlang.org/docs/handbook/2/classes.html#this-parameters
  override _handleEnter(this: MyBaseComponent) {
    this.emit('myBaseEvent');
  }

  override _init() {
    // Upcasting type of `this` in a constant
    const thiz: MyBaseComponent = this;
    thiz.emit('myBaseEvent');
  }
}
```
