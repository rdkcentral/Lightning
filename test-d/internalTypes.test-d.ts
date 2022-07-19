import { expectType } from "tsd";
import { EventMapType, ReduceSpecificity, SignalMapType, TextureType } from "../src/internalTypes.mjs";
import Application from '../src/application/Application.mjs';
import Component from '../src/application/Component.mjs';
import Element from '../src/application/Component.mjs';
import Texture from "../src/tree/Texture.mjs";

function ReduceSpecificity_Tests() {
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


function EventMapType_Tests() {
  expectType<Element.EventMap>({} as EventMapType<Element.TypeConfig>);
  expectType<Component.EventMap>({} as EventMapType<Component.TypeConfig>);
  expectType<Application.EventMap>({} as EventMapType<Application.TypeConfig>);

  interface MyComponentEventMap extends Component.EventMap {
    myEvent(): void;
  }
  interface MyComponentTypeConfig extends Component.TypeConfig {
    EventMapType?: MyComponentEventMap
  }
  expectType<MyComponentEventMap>({} as EventMapType<MyComponentTypeConfig>);
}

function TextureType_Tests() {
  expectType<Texture>({} as TextureType<Element.TypeConfig>);
  expectType<Texture>({} as TextureType<Component.TypeConfig>);
  expectType<Texture>({} as TextureType<Application.TypeConfig>);
}

function SignalMapType_Tests() {
  expectType<Component.SignalMap>({} as SignalMapType<Component.TypeConfig>);

  interface MyComponentSignalMap extends Component.SignalMap {
    myEvent(): void;
  }
  interface MyComponentTypeConfig extends Component.TypeConfig {
    SignalMapType?: MyComponentSignalMap
  }
  expectType<MyComponentSignalMap>({} as SignalMapType<MyComponentTypeConfig>);
}