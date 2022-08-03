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
import Component from './application/Component.mjs';
import Element from './tree/Element.mjs'

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
export type EventMapType<TypeConfig extends Element.TypeConfig> = TypeConfig['EventMapType'];

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
export type SignalMapType<TypeConfig extends Component.TypeConfig> = TypeConfig['SignalMapType'];

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