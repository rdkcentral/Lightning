import type { Plugin } from 'vite';

/**
 * This Vite plugin ensures that TypeScript modules imported from JavaScript
 * modules are resolved correctly.
 */
export function fixTsImportsFromJs(): Plugin {
  return {
    name: 'fix-ts-imports-from-js',
    async resolveId(source, importer = '', options) {
      let resolution = await this.resolve(source, importer, {
        skipSelf: true,
        ...options
      });
      // If there was no resolution and the importer file is JavaScript and the source
      // ends in `.js` lets see if we can resolve a `.ts` file
      if (!resolution && (importer.endsWith('.js') || importer.endsWith('.mjs')) &&
        (source.endsWith('.js') || source.endsWith('.mjs'))) {
        const newSource = source.replace(/\.mjs$/, '.mts').replace(/\.js$/, '.ts');
        resolution = await this.resolve(newSource, importer, {
          skipSelf: true,
          ...options
        });
      }
      return resolution;
    },
  };
}
