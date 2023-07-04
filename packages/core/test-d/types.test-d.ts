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
import lng from '../index.js';

// `types` namespace should only be accessible in a type context
// @ts-expect-error
lng.types;
// @ts-expect-error
lng.types.Transition;
// @ts-expect-error
lng.types.TransitionSettings.Literal;
type t100 = lng.types.Transition;
type t200 = lng.types.TransitionSettings.Literal;
