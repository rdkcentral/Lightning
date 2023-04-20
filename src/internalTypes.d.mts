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
 * This file contains internal types that are common to multiple modules
 *
 * @hidden Internal use only
 * @module
 */
import EventEmitter from './EventEmitter.mjs';
import Component from './application/Component.mjs';
import Element, { IsLooseTypeConfig } from './tree/Element.mjs'

/**
 * Allows all the documentation of a template spec to be inherited by any Element
 *
 * @hidden Internal use only
 */
 export type Documentation<T> = {
  // WARNING: You cannot use conditional key manipulation here or it will not allow documentation to be passed down
  [P in keyof T]: unknown;
}

/**
 * Reduce the specificity of T if it is assignable to one of
 * the types in U
 *
 * @example
 * ```
 * ReduceSpecificity<"string literal", string | number | boolean> === string
 * ReduceSpecificity<"string literal", number | boolean> === never
 * ReduceSpecificity<123, number | boolean> === number
 * ReduceSpecificity<true, number | boolean> === boolean
 * ```
 *
 * @hidden Internal use only
 */
export type ReduceSpecificity<T, U> =
  U extends U
    ?
      true extends U // Special case for booleans, since they are represented as (true | false) internally
        ?
          T extends boolean
            ?
              boolean
            :
              never
        :
          false extends U
            ?
              T extends boolean
                ?
                  boolean
                :
                  never
            :
              T extends U
                ?
                  U
                :
                  never
        :
          never;

/**
 * Extracts the EventMapType from Element Config
 *
 * @hidden Internal use only
 */
export type EventMapType<TypeConfig extends Element.TypeConfig> =
  IsLooseTypeConfig<TypeConfig> extends true
  ? TypeConfig['EventMapType'] & { [s: string]: (...args: any[]) => void; }
  : TypeConfig['EventMapType']

/**
 * Extracts the TextureType from Element TypeConfig
 *
 * @hidden Internal use only
 */
export type TextureType<TypeConfig extends Element.TypeConfig> = TypeConfig['TextureType'];

/**
 * Extracts the SignalMapType from Component TypeConfig
 *
 * @hidden Internal use only
 */
export type SignalMapType<TypeConfig extends Component.TypeConfig> =
  IsLooseTypeConfig<TypeConfig> extends true
    ? TypeConfig['SignalMapType'] & { [key: string]: (...args: any[]) => any }
    : TypeConfig['SignalMapType']

/**
 * If `PossibleFunction` is a function, it returns the parameters from it as a tuple.
 * Otherwise, it returns an empty array tuple.
 *
 * @privateRemarks
 * This is a "safe" version of the included `Parameters` type. It allows us to extract parameters
 * from an EventMap function signature without having to enforce a generic constraint on all
 * EventMaps, which isn't practical without blowing up type safety.
 *
 * @hidden Internal use only
 */
export type HandlerParameters<PossibleFunction> =
  PossibleFunction extends (...args: any[]) => any
    ?
      Parameters<PossibleFunction>
    :
      [];

/**
 * If `PossibleFunction` is a function, it returns the parameters from it as a tuple.
 * Otherwise, it returns an empty array tuple.
 *
 * @privateRemarks
 * Like HandlerParameter above, this is a "safe" version of the included `ReturnType` type.
 *
 * @hidden Internal use only
 */
export type HandlerReturnType<PossibleFunction> =
  PossibleFunction extends (...args: any[]) => any
    ?
      ReturnType<PossibleFunction>
    :
      void;

/**
 * Set of all capital letters
 *
 * @hidden Internal use only
 */
type Alphabet = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K' | 'L' | 'M' | 'N' | 'O' | 'P' | 'Q' | 'R' | 'S' | 'T' | 'U' | 'V' | 'W' | 'X' | 'Y' | 'Z';

/**
 * Any string that begins with a capital letter
 *
 * @hidden Internal use only
 */
export type ValidRef = `${Alphabet}${string}`;

/**
 * Returns `true` if T is a type that should terminate the calculation of
 * tag paths.
 *
 * @hidden Internal use only
 */
type IsTerminus<T> =
    T extends (string | number | boolean | any[] | Element.Constructor | Element)
        ?
            true
        :
            T extends object
                ?
                    object extends T
                        ?
                            true
                        :
                            false
                :
                    false

/**
 * Generates a union of template spec object path string tuples where the last
 * tuple item is the value type for that path (wrapped in a single element tuple)
 *
 * @privateRemarks
 * This is a helper type function for {@link TemplateSpecTags}
 *
 * Example:
 *
 * ```ts
 * type Result = SpecToTagPaths<{
 *   MyElement: object
 *   MyParentElement: {
 *     MyChildComponent: typeof MyComponent
 *     MyChildElement: {
 *       MyGrandChildElement: object
 *     }
 *   }
 * }>
 * ```
 *
 * Equates to:
 *
 * ```ts
 * type Result =
 *   ['MyElement', [object]] |
 *   ['MyParentElement', [{
 *      MyChildComponent: typeof MyComponent
 *      MyChildElement: {
 *        MyGrandChildElement: object
 *      }
 *   }]] |
 *   ['MyParentElement', 'MyChildComponent', [typeof MyComponent]]
 *   ['MyParentElement', 'MyChildElement', [{ MyGrandChildElement: object }]] |
 *   ['MyParentElement', 'MyChildElement', 'MyGrandChildElement', [object]];
 * ```
 *
 * @hidden Internal use only
 */
export type SpecToTagPaths<T> =
    IsTerminus<T> extends true
        ?
            [[T]]
        :
            {
                [K in Extract<keyof T, ValidRef>]: [K, ...SpecToTagPaths<T[K]>] | [K, [T[K]]]
            }[Extract<keyof T, ValidRef>]

/**
 * Joins the given path string tuple into a single `.` separated string tag path
 *
 * @hidden Internal use only
 */
export type Join<T extends string[]> =
    T extends [] ? never :
    T extends [infer F] ? F :
    T extends [infer F, ...infer R] ?
    F extends string ?
    `${F}.${Join<Extract<R, string[]>>}` : never : string;

/**
 * Combines tag paths returned by {@link SpecToTagPaths} into a complete flattened object shape
 *
 * @privateRemarks
 * This is a helper type function for {@link TemplateSpecTags}.
 *
 * Only path elements that are a valid reference name (i.e. start with a capital letter {@link ValidRef}) are
 * included.
 *
 * Example:
 *
 * ```ts
 * type Result = CombineTagPaths<
 *   ['MyElement', [object]] |
 *   ['MyParentElement', [{
 *      MyChildComponent: typeof Component
 *      MyChildElement: {
 *        MyGrandChildElement: object
 *      }
 *   }]] |
 *   ['MyParentElement', 'MyChildComponent', [typeof Component]]
 *   ['MyParentElement', 'MyChildElement', [{ MyGrandChildElement: object }]] |
 *   ['MyParentElement', 'MyChildElement', 'MyGrandChildElement', [object]]
 * >
 * ```
 *
 * equates to:
 *
 * ```ts
 * type Result = {
 *   'MyElement': object;
 *   'MyParentElement': {
 *      MyChildComponent: typeof Component
 *      MyChildElement: {
 *        MyGrandChildElement: object
 *      }
 *   };
 *   'MyParentElement.MyChildComponent': typeof Component;
 *   'MyParentElement.MyChildElement': { MyGrandChildElement: object };
 *   'MyParentElement.MyChildElement.MyGrandChildElement': object
 * }
 * ```
 *
 * @hidden Internal use only
 */
export type CombineTagPaths<TagPaths extends any[]> = {
    [PathWithType in TagPaths as PathWithType extends [...infer Path extends string[], [any]] ? Join<Path> : never]:
        PathWithType extends [...any, [infer Type]]
            ?
                Type
            :
                never;
}

/**
 * Like {@link CombineTagPaths} but only includes the first level of refs from TagPaths
 *
 * @privateRemarks
 * This is a helper type function for {@link TemplateSpecTags}.
 *
 * Only path elements that are a valid reference name (i.e. start with a capital letter {@link ValidRef}) are
 * included.
 *
 * Example:
 *
 * ```ts
 * type Result = CombineTagPathsSingleLevel<
 *   ['MyElement', [object]] |
 *   ['MyParentElement', [{
 *      MyChildComponent: typeof Component
 *      MyChildElement: {
 *        MyGrandChildElement: object
 *      }
 *   }]] |
 *   ['MyParentElement', 'MyChildComponent', [typeof Component]]
 *   ['MyParentElement', 'MyChildElement', [{ MyGrandChildElement: object }]] |
 *   ['MyParentElement', 'MyChildElement', 'MyGrandChildElement', [object]]
 * >
 * ```
 *
 * equates to:
 *
 * ```ts
 * type Result = {
 *   'MyElement': object;
 *   'MyParentElement': {
 *      MyChildComponent: typeof Component
 *      MyChildElement: {
 *        MyGrandChildElement: object
 *      }
 *   }
 * }
 * ```
 */
export type CombineTagPathsSingleLevel<TagPaths extends any[]> = {
  [PathWithType in TagPaths as PathWithType extends [infer Key extends string, [any]] ? Key : never]:
      PathWithType extends [any, [infer Type]]
          ?
              Type
          :
              never;
}
