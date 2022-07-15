import { expectType } from "tsd";
import { ReduceSpecificity } from "../src/internalTypes.mjs";

function ReduceSpecificityTests() {
  // Should work for a single type passed to param U
  function IndividualTypes() {
    // string
    expectType<string>({} as ReduceSpecificity<'string literal', string>);
    expectType<string>({} as ReduceSpecificity<'another string literal', string>);
    expectType<never>({} as ReduceSpecificity<32472398, string>);
    expectType<never>({} as ReduceSpecificity<true, string>);
    expectType<never>({} as ReduceSpecificity<false, string>);
    // boolean (special case)
    expectType<boolean>({} as ReduceSpecificity<true, boolean>);
    expectType<boolean>({} as ReduceSpecificity<false, boolean>);
    expectType<never>({} as ReduceSpecificity<'not a boolean', boolean>);
    // number
    expectType<number>({} as ReduceSpecificity<1234, number>);
    expectType<number>({} as ReduceSpecificity<4321, number>);
    expectType<never>({} as ReduceSpecificity<true, number>);
    expectType<never>({} as ReduceSpecificity<false, number>);

    // Should be able to reflect already non-specific in param T types back
    function Identity() {
      expectType<number>({} as ReduceSpecificity<number, number>);
      expectType<boolean>({} as ReduceSpecificity<boolean, boolean>);
      expectType<string>({} as ReduceSpecificity<string, string>);
    }
  }

  // Should work for a union of types in param U
  function MultipleTypes() {
    expectType<string>({} as ReduceSpecificity<'string literal', string | boolean | number>);
    expectType<string>({} as ReduceSpecificity<'another string literal', string | boolean | number>);
    expectType<number>({} as ReduceSpecificity<1234, string | boolean | number>);
    expectType<number>({} as ReduceSpecificity<4321, string | boolean | number>);
    expectType<boolean>({} as ReduceSpecificity<true, string | boolean | number>);
    expectType<boolean>({} as ReduceSpecificity<false, string | boolean | number>);

    // Should be able to reflect already non-specific in param T types back
    function Identity() {
      expectType<number>({} as ReduceSpecificity<number, string | boolean | number>);
      expectType<boolean>({} as ReduceSpecificity<boolean, string | boolean | number>);
      expectType<string>({} as ReduceSpecificity<string, string | boolean | number>);
    }
  }

}
