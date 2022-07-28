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
