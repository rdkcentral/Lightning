import Component from "../application/Component.mjs";

export default class Base {
  static defaultSetter(obj: unknown, name: string, value: unknown): void;
  static patchObject(obj: unknown, settings: Component.Template): void;
  static patchObjectProperty(obj: unknown, name: string, value: unknown): void;
  static local(func: (...args: unknown[]) => unknown): void;
}
