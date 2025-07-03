/**
 * Minimal TypeScript declaration for bidi-js
 */
declare module "bidi-js" {
  export interface BidiAPI {
    getEmbeddingLevels(text: string): { levels: number[] };
  }

  declare function bidiFactory(): BidiAPI;

  export default bidiFactory;
}
