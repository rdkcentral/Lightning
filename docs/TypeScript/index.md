# TypeScript

As of version 2.7.0, Lightning Core comes bundled with type definitions and in-code documentation which allow you to build Lightning apps in [TypeScript](https://www.typescriptlang.org/). The following documentation assumes to an extent that you are already familiar with the basics of writting a Lightning app in JavaScript, but even if you have no experience at all with Lightning, you may find the tips below as well as the Lightning CLI `lng create` boilerplate (coming soon) and the types/documentation available now in your IDE by using TypeScript enough to get started.

TypeScript compilation is supported out of the box by Lightning CLI as of version [v2.8.0](https://github.com/rdkcentral/Lightning-CLI/blob/master/CHANGELOG.md#v280).

## Requirements

- Minimum TypeScript version: [4.7.3](https://github.com/microsoft/TypeScript/releases/tag/v4.7.3) (as tested)
- Minimum Lightning CLI version: [2.8.0](https://github.com/rdkcentral/Lightning-CLI/blob/master/CHANGELOG.md#v280)
  - If using Lightning CLI.

## How To Use

While many of the benefits of the types are available automatically, in order to effectively build a Lightning app in TypeScript that is type-aware and type-safe there are some guidelines and gotchas that you need to be aware of.

### If you get stuck...

Before we go on, we want to give you a small piece of advice. While we took great care to avoid incorrect typing and other error pits you may fall into and spend a lot of time trying to figure out, we, as humans, aren't perfect and you may encounter one of these areas of frustration.

If you find yourself in this kind of place, do the following:
- Use `// @ts-expect-error` (on the preceeding line) or the `any` type to remove the error
- Add a TODO comment for yourself or your team to address later.
- If you think the issue is caused by a mistake on our end, please don't hesitate to write up an [issue](https://github.com/rdkcentral/Lightning/issues) or a [PR](https://github.com/rdkcentral/Lightning/pulls).

### Suggested tsconfig.json

TypeScript projects must include a [TSConfig file](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html) (`tsconfig.json`) at the root the project repo. The following configuration, particularly the compiler options: `strict`, `noUncheckedIndexedAccess`, and `noImplicitOverride` keys, are what we recommend as a starting point for a new Lightning app written in TypeScript. You may modify these to meet the needs of your project.

```json
{
  "compilerOptions": {
    "outDir": "build-ts",
    "target": "ES2019",
    "lib": ["ES2019", "DOM"],
    "moduleResolution": "node",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true
  }
}
```

**Warning:** At a minimum, `strictNullChecks` [must be set to true](https://github.com/rdkcentral/Lightning-SDK/issues/358#issuecomment-1339321527) to avoid certain errors. This is done implicitly by setting `strict` to true as in the above configuration.

### Importing

Lightning should only be imported from a single import as such:
```ts
// If using Lightning SDK (recommended)
import { Lightning } from '@lightningjs/sdk';

// If using Lightning Core directly
import Lightning from '@lightningjs/core';
```

All public types are available from this single export. Examples:
```ts
const element: Lightning.Element;
const component: Lightning.Component;
const template: Lightning.Component.Template;
const animation: Lightning.types.Animation;
const transition: Lightning.types.Transition;
```

### Components

See [Components](Components/index.md) for how to create and use Components in Lightning with TypeScript.

### Guidelines / Gotchas

See [Guidelines / Gotchas](GuidelinesGotchas.md) for additional things to keep in mind while writing a Lightning app with TypeScript.

### Augmentation

See [Augmentation](Augmentation.md) for information on how to add app-specific types / structures to globally defined Lightning types.
