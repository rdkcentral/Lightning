/**
 * Minimal TypeScript declaration for bidi-js
 */
declare module "bidi-js" {
  export interface BidiAPI {
    getEmbeddingLevels(
      text: string,
      baseDirection?: "ltr" | "rtl" | "auto"
    ): {
      levels: number[];
    };
    getBidiCharTypeName(c: string): "L" | "R" | "AL" | "EN" | "ES" | "CS" | "ON" | "NSM" | "BN" | "B" | "S" | "WS" | "PDF" | "LRE" | "RLE" | "LRO" | "RLO";
  }

  declare function bidiFactory(): BidiAPI;

  export default bidiFactory;
}
