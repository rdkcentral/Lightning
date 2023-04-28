import type { Plugin } from 'vite';

/**
 * Simple vite plugin to add a copyright banner to the beginning of each chunk.
 *
 * @param bannerText The banner text to add to each chunk.
 */
export function banner(bannerText: string): Plugin {
  return {
    name: 'banner',
    enforce: 'post',
    generateBundle(options, bundle) {
      // Add banner to the beginning of each chunk
      Object.keys(bundle).forEach((key) => {
        const file = bundle[key];
        if (file.type === 'chunk') {
          file.code = bannerText + '\n' + file.code;
        }
      });
    }
  };
}
