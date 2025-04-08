# Lightning

Lightning is a (TV) app development framework that offers great portability and performance.

## SDK
[SDK](https://github.com/rdkcentral/Lightning-SDK)

## Documentation
[Documentation](https://lightningjs.io/docs/)

## Lightning 3

[Lightning 3](https://github.com/lightning-js/renderer) and [Blits](https://github.com/lightning-js/blits) are now available.

## Feedback, bugs, questions and support

In case you find any _bugs_ or have _feature requests_, feel free to open an [issue](https://github.com/rdkcentral/Lightning/issues/new) on the GitHub repository.

If you have _questions_ or need _support_ building your App with Lightning and the Lightning-SDK, then we're happy to
help you out on our [Discourse Forum](https://forum.lightningjs.io/) on [LightningJS.io](http://www.lightningjs.io).

## Contributing

The Lightning is an open source project. If you want to contribute to it, please consider the following:

- the **master** branch is the latest stable release
- the **dev** branch is used for upcoming releases
- all development should be done in dedicated *topic branches* (from latest `dev`-branch)
- please send in your PR against the `dev`-branch

Before you submit your PR, make sure you install the projects dependencies, as this will activate automatic
linting and code formatting in a Git commit hook.

## Testing

Make sure changes and new code are covered with unit tests or/and integration tests.

### Unit tests (vitest)

Test files are under `src/` with a `.test.mjs` or `.test.mts` extension.

```
npm run test
```

### Integration tests (Playwright)

Test cases are under `tests/` and use either the ES5 build output or directly point to `.mjs` files (TypeScript won't run in the browser).

```
npx playwright install
npm run build
npm run playwright:interactive
```

## Changelog

Checkout the changelog [here](./CHANGELOG.md).