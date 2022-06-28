declare namespace StageUtils {
  export type TimingFunction =
    | 'linear'
    | 'ease'
    | 'ease-in'
    | 'ease-out'
    | 'ease-in-out'
    | 'step-start'
    | 'step-end'
    | `cubic-bezier(${string})`;
}

declare class StageUtils {
  static mergeColors(c1: number, c2: number, p: number): number;
  static mergeNumbers(v1: number, v2: number, p: number): number;
  static rgb(r: number, g: number, b: number): number;
  static rgba(r: number, g: number, b: number, a: number): number;
  static getRgbaString(c: number): string;
  static mergeColorAlpha(c: number, alpha: number): number;

  static getRgbComponentsNormalized(argb: number): Array<number>;
  static getRgbaComponentsNormalized(argb: number): Array<number>;
}

export default StageUtils;