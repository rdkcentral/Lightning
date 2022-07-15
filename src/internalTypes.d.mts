/**
 * This file contains internal types that are common to multiple modules
 *
 * @hidden
 * @module
 */


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
 * ###
 */
type ReduceSpecificity<T, U> =
  U extends U
    ?
      boolean extends U // Special case for booleans, since they are represented as (true | false) internally
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
