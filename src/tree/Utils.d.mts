export default class Utils {
  static isWeb: boolean;
  static isFunction(value: unknown): value is (...args: unknown[]) => unknown;
  static isNumber(value: unknown): value is number;
  static isInteger(value: unknown): value is number;
  static isBoolean(value: unknown): value is boolean;
  static isString(value: unknown): value is string;
  static clone<T>(v: T): T;
  static cloneObjShallow(obj: unknown): unknown;
  static merge<T, U>(obj1: T, obj2: U): T;
  static isObject(value: unknown): boolean;
  static isPlainObject(value: unknown): boolean;
  static isObjectLiteral(value: unknown): boolean;
  static getArrayIndex(index: number, arr: unknown[]): number;
  static getModuloIndex(index: number, len: number): number;

  static getDeepClone<T>(obj: T): T;

  static equalValues(v1: unknown, v2: unknown): boolean;

  static equalObjectLiterals(obj1: unknown, obj2: unknown): boolean;
  static equalArrays(v1: unknown[], v2: unknown[]): boolean;

  static setToArray(s: unknown): unknown[];

  static iteratorToArray(iterator: unknown): unknown[];

  static isUcChar(charcode: number): boolean;

  static isPS4: boolean;
  static isSpark: boolean;
}
