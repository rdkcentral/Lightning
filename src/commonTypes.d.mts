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
 * This file contains public types that are common to multiple modules
 *
 * @module
 */

/**
 * Types animations are allowed on
 */
export type AnimatableValueTypes = number | boolean | string;

/**
 * Extract the types from a union of `Types` that are valid AnimatableValueTypes
 *
 * @remarks
 * Returns `never`, if none of `Types` are AnimatableValueTypes.
 */
export type ExtractAnimatableValueTypes<Types> = Extract<Types, AnimatableValueTypes>;
