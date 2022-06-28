import Element from "../tree/Element.mjs";
import Component from "../application/Component.mjs";

export default class ObjectList<T> {
  a(object: Component.Template | T | Array<Component.Template> | Array<T>): T | null;
  add(object: T): void;
  addAt(object: T, index: number): void;
  clear(): void;
  forEach(callback: (item: T, index: number, array: T[]) => void): void;
  get(): T[];
  getAt(index: number): T | undefined;
  getByRef(ref: string): T | undefined;
  // !!! write test for all these, make sure they are the write types, check ListComponent
  patch(settings: Element.PatchTemplate | Element.PatchTemplate[]): void;
  remove(object: T): void;
  removeAt(index: number): T;

  get length(): number;
}
