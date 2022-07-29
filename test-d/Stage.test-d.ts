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
 * Tests for Stage
 */
import { expectNotType, expectType } from 'tsd';
import lng from '../index.js';

const stage = new lng.Stage();

/// element
function ElementTests() {
  /// If invalid patch object param types, lng.components.ListComponent isn't inferred as the type
  const t100 = stage.element({
    type: lng.components.ListComponent,
    viewportScrollOffset: 'abc' // this should be a number
  });
  expectNotType<lng.components.ListComponent>(t100);
  expectType<lng.Element>(t100);

  /// However it is inferred, if they are correct
  const t200 = stage.element({
    type: lng.components.ListComponent,
    viewportScrollOffset: 123 // this should be a number
  });
  expectType<lng.components.ListComponent>(t200);

  /// Allow, and encourage, explcit constructor type passed via generics
  const t300 = stage.element<typeof lng.components.ListComponent>({
    type: lng.components.ListComponent,
    viewportScrollOffset: 123
  });
  expectType<lng.components.ListComponent>(t300);

  /// And expect error if wrong params are passed
  const t400 = stage.element<typeof lng.components.ListComponent>({
    type: lng.components.ListComponent,
    // @ts-expect-error
    viewportScrollOffset: 'abc' // this sohuld be a number
  });
  expectType<lng.components.ListComponent>(t300);

  // Plain elements should be supported without generic params
  const t500 = stage.element({
    alpha: 123,
  });
  expectType<lng.Element>(t500);

  // Elements passed through directly result in Element returned
  const t600 = stage.element(t500);
  expectType<lng.Element>(t600);
}

/// c
function CTests() {
  /// If invalid patch object param types, lng.components.ListComponent isn't inferred as the type
  const t100 = stage.c({
    type: lng.components.ListComponent,
    viewportScrollOffset: 'abc' // this should be a number
  });
  expectNotType<lng.components.ListComponent>(t100);
  expectType<lng.Element>(t100);

  /// However it is inferred, if they are correct
  const t200 = stage.c({
    type: lng.components.ListComponent,
    viewportScrollOffset: 123 // this should be a number
  });
  expectType<lng.components.ListComponent>(t200);

  /// Allow, and encourage, explcit constructor type passed via generics
  const t300 = stage.c<typeof lng.components.ListComponent>({
    type: lng.components.ListComponent,
    viewportScrollOffset: 123
  });
  expectType<lng.components.ListComponent>(t300);

  /// And expect error if wrong params are passed
  const t400 = stage.c<typeof lng.components.ListComponent>({
    type: lng.components.ListComponent,
    // @ts-expect-error
    viewportScrollOffset: 'abc' // this sohuld be a number
  });
  expectType<lng.components.ListComponent>(t300);

  // Plain elements should be supported without generic params
  const t500 = stage.c({
    alpha: 123,
  });
  expectType<lng.Element>(t500);

  // Elements passed through directly result in Element returned
  const t600 = stage.c(t500);
  expectType<lng.Element>(t600);
}