# Component Template Specs

Much of the time when writting a Lightning application, you're writting [Components](../Components/index.md). Within each Component you define a [Template](../Templates/index.md) which defines the starting properties, structure of children and properties of the children. For TypeScript to be aware of the structure of a Component's Template, you need to define what we call a **Template Spec**.

## Defining a Template Spec

Template Specs contain two sections of information that define your Component:
- Properties
  - The publicly settable/gettable properties of your Component.
  - These are represented by keys that begin with a **lower-case letter**.
- Children
  - The child Components/Elements of your Component.
  - These are represented by keys that begin with an **upper-case letter**. This key is the "ref" of the child.


Here's an example of a Template Spec with many of the types of structure explained:

```ts
export interface MyComponentTemplateSpec extends Lightning.Component.TemplateSpec {
  /*
    Properties
    ----------
    - Each key must begin with a lower-case letter

    - The value type defines the type of the property

    - Properties should never be marked optional (with `?`) so that TS can enforce that they are implemented in your Component.
   */

  // Simple properties
  myProperty1: number;
  myProperty2: string;
  myProperty3: boolean;

  // Content patch property
  // If your Component has a property that accepts a patch object that is sent to `patch()`
  // you can use the `PatchTemplate<ComponentTemplateSpecType>` type.
  myContentProperty: Lightning.Element.PatchTemplate<Element.TemplateSpecLoose>;

  /*
    Children
    --------
    - Each key must begin with an upper-case letter

    - The value type defines what kind of child it is

    - Children should never be marked optional (with `?`) because it is already implied that any child
      defined in the Template Spec may not exist at any given point during the lifetime of the application.
   */

  // Child components are inserted with the Component class type preceeded by `typeof`
  MyChildComponent: typeof MyChildComponent

  // Child elements, which contain no children, are inserted with `object`
  MyChildElementWithNoChildren: object

  // Child elements, which have children of their own, are inserted with an inline-object type.
  // The same rules that apply to Template Spec children apply to these nested Children.
  MyChildElementWithChildren: {
    GrandChild1: typeof MyCoolComponent;
    GrandChild2: object;
    GrandChild3: {
      GreatGrandChild1: object
    };
  };
}
```

## Using a Template Spec

After you create a Template Spec, you can now apply it to your Component. Whether you are creating a new Component from scratch or converting an existing Component to TypeScript the idea is the same:
- Extend from `Lightning.Component` like normal, adding the Template Spec to the first generic parameter of it:
  - `extends Lightning.Component<MyTemplateSpec>`
- Implement the `Lightning.Component.ImplementTemplateSpec` interface, adding the Template Spec to the first generic parameter as well:
  - `implements Lightning.Component.ImplementTemplateSpec<MyTemplateSpec>`
- Write the static `_template` method signature, including `Lightning.Component.Template` as the return value, but also adding the Template Spec as the generic param:
  - `static _template(): Lightning.Component.Template<MyTemplateSpec> {}`

It should look like the following:
```ts
class MyComponent
  extends Lightning.Component<MyTemplateSpec>
  implements Lightning.Component.ImplementTemplateSpec<MyTemplateSpec> {

  static override _template(): Lightning.Component.Template<MyTemplateSpec> {}
}
```

At this point, TypeScript should be giving you errors about the class not implementing the interface properly and `_template` not returning the right thing. So next we satisfy the interface by implementing the necessary getters/setters necessary:

```ts
class MyComponent /* ... */ {
  // The ImplementTemplateSpec inteface will enforce that these are implemented
  get myProperty1(): number { /* Implement */ }
  set myProperty1(v: number) { /* Implement */ }
  get myProperty2(): string { /* Implement */ }
  set myProperty2(v: string) { /* Implement */ }
  get myProperty3(): boolean { /* Implement */ }
  set myProperty3(v: boolean) { /* Implement */ }
  get myContentProperty(): Lightning.Element.PatchTemplate<Element.TemplateSpecLoose> { /* Implement */ }
  set myContentProperty(v: Lightning.Element.PatchTemplate<Element.TemplateSpecLoose>) { /* Implement */ }

  static override _template(): Lightning.Component.Template<MyTemplateSpec> {}
}
```

Next we implement the `_template` method based on our child structure:

```ts
class MyComponent /* ... */ {
  // ...
  static override _template(): Lightning.Component.Template<MyTemplateSpec> {
    return {
      // Fill in the Element properties of the Component
      // Notice the IDE auto-complete and documentation you get while entering each one
      rect: true,
      color: 0xffff0000,

      // Fill in whatever Children you want. You are not required to fill all of them out. That is
      // an implementation decision. You may want to create a child at a later time in the execution.
      MyChildComponent: {
        // Typescript enforces and provides auto-complete + documentation on all properties of children too!
        type: MyChildComponent,
        x: 10,
        y: 20,
        myChildComponentProp1: true
      },
      MyChildElementWithNoChildren: {
        x: 30,
        y: 40,
        text: {
          text: 'Some text',
          textColor: 0xffff0000
        }
      },
      MyChildElementWithChildren: {
        rect: true,
        color: 0xff00ff00,
        GrandChild3: {
          x: 50,
          y: 40,
          GreatGrandChild1: {
            src: 'myasset.png'
          }
        }
      }
    }
  }
}
```

You may then choose to make any of your Component's descendants easily accessible via private/public properties. `this.tag()` or `this.getByRef()` can be used to get at your components. We chose `getByRef()` in the example below as it is a bit more performant. In either case, your IDE provides you with an auto-complete prompt on the valid child paths / ref names based on your TemplateSpec so you can avoid typos.

```ts
class MyComponent /* ... */ {
  /*
    If our child is created on initialization (in _template) and is never removed/re-added, we can do a
    simple one-time `getByRef()` call. This line is executed automatically in the Component's constructor.

    Notice the prescene of the non-null assertion operator, `!`, at the end of the call. The return value for `getByRef()` is by default nullable. We use this operator to assert to TypeScript that the Element we are
    getting will definitely exist when this line executes. This saves us time/performance later from having to check all the time

    Also we've made our properties private so they are only accessible within the Component. The `_` prefix is
    not necessary and can depend on your team's coding style.
   */
  private _MyChildElementWithChildren = this.getByRef('MyChildElementWithChildren')!;

  /*
    To access a grand-child we can do so through it's parent that we just defined!
   */
  private _GrandChild3 = this._MyChildElementWithChildren.getByRef('GrandChild3')!;

  /*
    If we want to give public access to our great-grand child we can do that like this:
   */
  GreatGrandChild1 = this._GrandChild3.getByRef('GreatGrandChild1')!;

  /*
    If we have a descendant that may or may not exist at any given time, we must implement it as a getter

    This way `getByRef()` is called each time the descendant is needed. And note, this time we do not use
    the `!` non-null assertion operator since it's existance must be checked at runtime.
   */
  get GrandChild1() {
    return this._MyChildElementWithChildren.getByRef('GrandChild1');
  }

  // ...
}
```

For reference, here's the the equivalent using `tag()`:
```ts
class MyComponent /* ... */ {
  private _MyChildElementWithChildren = this.tag('MyChildElementWithChildren')!;
  private _GrandChild3 = this.tag('MyChildElementWithChildren.GrandChild3')!;
  GreatGrandChild1 = this.tag('MyChildElementWithChildren.GrandChild3.GreatGrandChild1')!;
  get GrandChild1() {
    return this.tag('MyChildElementWithChildren.GrandChild1')!;
  }
  // ...
}
```

Notice that you do not need to explicitly add types to each property. TypeScript automatically derives the types of each property from the return value type of `getByRef()` or `tag()`.

At this point your Component should be set for further implementation and use as children by other Components.

```ts
class MyComponent /* ... */ {
  override _handleEnter() {
    if (!this.GrandChild1) {
      this._MyChildElementWithChildren.patch({
        color: 0xff0000ff,
        GrandChild1: {
          text: 'Hello World!'
        }
      });
    }
    this._GrandChild3.src = 'myOtherAsset.png';
  }
}
```

## Loose Components

If you'd like to opt-out of some of the type safety aspects within a Component you can create a Loose Template Spec. To do this simply extend your Template Spec from `Lightning.Component.TemplateSpecLoose`. A Component that uses a Loose Template Spec is known as a Loose Component.

```ts
export interface MyComponentTemplateSpec extends Lightning.Component.TemplateSpecLoose {
  // ...
}
```

Doing this allows any arbitrary properties / child ref keys, in addition to the ones declared in the Template Spec, to be set on your component during `_template` creation and patches.

By default, all Components that do not set their own Template Spec are Loose. This allows Components that you may import from a third-party library that doesn't yet support TypeScript to be used in your app with little upfront friction.
