# Guidelines

## Use `getByRef()` instead of `tag()`

Because it is virtually impossible to get TypeScript to accurately and implicitly type the return value of the `tag()` method, it's recommended to create getters in your components that both retrieve and explicitly type any child Elements or Components. That is, only use the tag() method inside these getters. This helps isolate the areas where explicit typing is needed (and where it could be incorrect) and makes the rest of your interaction with a Component much more type safe.
