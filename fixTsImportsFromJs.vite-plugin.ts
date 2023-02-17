import type { Plugin } from 'vite';

export function fixTsImportsFromJs(): Plugin {
  console.log('loading fixTsImportsFromJs');
	return {
		name: 'fix-ts-imports-from-js',
    // async resolveDynamicImport(specifier: string, importer: string) {
    //   console.log('resolveDynamicImport', specifier, importer);
    // },
		async resolveId(source, importer = '', options) {
      // console.log('resolveId', source, importer, options);
      let resolution = await this.resolve(source, importer, {
        skipSelf: true,
        ...options
      });
      // If there was no resolution and the importer file is JavaScript and the source
      // ends in `.js` lets see if we can resolve a `.ts` file
      if (!resolution && (importer.endsWith('.js') || importer.endsWith('.mjs')) && source.endsWith('.js')) {
        resolution = await this.resolve(source.replace(/\.js$/, '.ts'), importer, {
          skipSelf: true,
          ...options
        });
      }
      return resolution;
		},
	};
}
