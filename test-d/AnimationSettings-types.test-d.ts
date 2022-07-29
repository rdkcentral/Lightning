import { expectType } from "tsd";
import { AnimationForceType } from "../src/animation/AnimationSettings.mjs";


function AnimationForceType_Tests() {
  /// Converts the force type literals into their corresponding types
  expectType<number>({} as AnimationForceType<'$$number'>);
  expectType<boolean>({} as AnimationForceType<'$$boolean'>);
  expectType<string>({} as AnimationForceType<'$$string'>);

  /// Generic param must be a valid force type
  // @ts-expect-error
  expectType<never>({} as AnimationForceType<'Anything'>);
}
