# TypeScript

As of version #####, Lightning Core comes bundled with type definitions and in-code documentation which allow you to build Lightning apps in [TypeScript](https://www.typescriptlang.org/). The following documentation assumes to an extent that you are already familiar with the basics of writting a Lightning app in JavaScript, but even if you have no experience at all with Lightning, you may find the tips below as well as the Lightning CLI `lng create` boilerplate (coming soon) and the types/documentation available now in your IDE by using TypeScript enough to get started.

## Requirements

- Minimum TypeScript version: 4.7.3 (as tested)

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

### Augmentation

T

### Component Type Configs

Coming Soon
