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
