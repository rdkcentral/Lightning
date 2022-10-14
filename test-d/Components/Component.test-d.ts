/*
 * If not stated otherwise in this file or this component's LICENSE file the
 * following copyright and licenses apply:
 *
 * Copyright 2022 Metrological
 *
 * Licensed under the Apache License, Version 2.0 (the License);
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
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
