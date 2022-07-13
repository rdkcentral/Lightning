/**
 * Test for methods/etc of the Component base class
 */

import { expectType } from "tsd";
import Component from "../../src/application/Component.mjs";
import BloomComponent from "../../src/components/BloomComponent.mjs";
import ListComponent from "../../src/components/ListComponent.mjs";
import Element from "../../src/tree/Element.mjs";
import Stage from "../../src/tree/Stage.mjs";

const stage = new Stage();
const c = new Component(stage, {});

/**
 * Tests the special methods of Component
 */
function SpecialMethods() {
  /// seekAncestorByType
  expectType<BloomComponent | null>(c.seekAncestorByType(BloomComponent));
  // Generic type must match arg1
  // @ts-expect-error
  c.seekAncestorByType<typeof ListComponent>(BloomComponent);
  // Like this
  c.seekAncestorByType<typeof ListComponent>(ListComponent);
  // Does not accept a type of Element
  // @ts-expect-error
  c.seekAncestorByType(Element);
}
