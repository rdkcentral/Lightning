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

  /**
   * Returns `true` if `value` is any JavaScript object value that you can access keys
   * from. This includes plain JavaScript objects, functions and objects instantiated
   * from classes.
   *
   * @param value
   */
  static isObject(value: unknown): value is Record<string | number | symbol, unknown>;

  /**
   * @deprecated Not used by the Lightning codebase
   */
  static isPlainObject(value: unknown): boolean;

  /**
   * Returns `true` if `value` is an "Object Literal", an plain JavaScript object that is
   * not instantiated from a class.
   *
   * @remarks
   * ```
   * Utils.isObjectLiteral({}) === true;
   * Utils.isObjectLiteral({
   *   type: MyComponent,
   *   x: 0,
   *   y: 100
   * }) === true;
   * Utils.isObjectLiteral(new Component()) === false;
   * Utils.isObjectLiteral(123) === false;
   * Utils.isObjectLiteral(null) === false;
   * ```
   * @param value
   */
  static isObjectLiteral(value: unknown): value is Record<string | number | symbol, unknown>;
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
