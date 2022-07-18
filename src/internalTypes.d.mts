/**
 * This file contains internal types that are common to multiple modules
 *
 * @hidden
 * @module
 */


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
