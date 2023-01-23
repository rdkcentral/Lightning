# Subclassable Components

Usually, when creating a Lightning Component you do not need to specify your own generic parameters which are mixed into the ones passed further down into the Component base class. However, there are times when you want to make your Component type flexible and perhaps just as flexible as the Component base class which allows you to pass a [Template Spec](./TemplateSpecs.md) and [Type Config](./TypeConfig.md). Perhaps you want to create a `PageBase<T>` component that accepts any child Component of type T. Or a completely flexible `MyBaseComponent<TemplateSpecType, TypeConfig>` which all of your App's Components extend. When doing this there are a few guidelines and gotchas you need to pay attention to that stem from some design choices in TypeScript.

## Basic Generic Ref Type

If we want to create an extendible base Component called `PageBase<T>`, where `T` is the type of Component used for the content of a page appearing with a static header component, we start by laying down the definition of its Template Spec like so:

```ts
export interface PageTemplateSpec<
  T extends Lightning.Component.Constructor = Lightning.Component.Constructor,
> extends Lightning.Component.TemplateSpec {
  Header: typeof Header
  Content: T
}
```

`Lightning.Component.Constructor` represents a `typeof` any Lightning Component. For example, if there's a component called `List` you can use `typeof List` as the type argument for `T`.

Then we implement the `PageBase` class itself using the same generic type parameter passed down into the Template Spec:

```ts
export class PageBase<T extends Lightning.Component.Constructor = Lightning.Component.Constructor>
  extends Lightning.Component<PageTemplateSpec<T>>
  implements Lightning.Component.ImplementTemplateSpec<PageTemplateSpec<T>>
{
  static override _template(): Lightning.Component.Template<PageTemplateSpec> {
    return {
      w: (w: number) => w,
      h: (h: number) => h,
      rect: true,
      color: 0xff0e0e0e,

      Header: {
        type: Header,
      },
      Content: undefined,
    };
  }

  Content = this.getByRef('Content')!;
}
```

We fill the base `_template()` out with how we want our base component to appear. Here a Header component is provided and we leave the Content component intentionally `undefined`. It will be provided by the subclass implementation. We also create a read-only property for `Content` which returns the result of `getByRef('Content')`.

Notice how the return type of `_template()` does not reference `T`. Due to how class generics work in TypeScript you are not allowed to pass the generic parameters from the class definition. By leaving it out we open it to be used for any Lightning Component type.

With this base we are ready to implement a subclass. Here we use a component called `List` as our Content component:

```ts
export class Discovery extends BasePage<typeof List> {
  static override _template(): Lightning.Component.Template<IPageTemplateSpec<typeof List>> {
    // Must assert the specific template type to the type of the template spec
    // because `super._template()` isn't/can't be aware of List
    const pageTemplate = super._template() as Lightning.Component.Template<
      IPageTemplateSpec<typeof List>
    >;

    pageTemplate.Content = {
      type: List,
      w: (w: number) => w,
      h: (h: number) => h,
    };

    return pageTemplate;
  }

  override _init() {
    this.Content.someListSpecificProperty = false;
  }
}
```

Here the `_template()` method calls the base component's `_template()` method, and then supplements it's Content ref with the `List` component. We must use `as` to assert the correct final type of the template object because of what we said above about class generic parameters and static methods. From here, you should be able to reference `this.Content` in your component's implementation and it will automatically be resolved to an instance of `List`.

## Extendible TemplateSpec / TypeConfig

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
