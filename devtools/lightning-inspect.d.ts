import type {
  Application,
  Component,
  Element,
  ElementCore,
  ElementTexturizer,
  Stage,
  Texture,
} from "../src";

declare interface ILng {
  Application?: typeof Application;
  Component?: typeof Component;
  Element: typeof Element;
  ElementCore: typeof ElementCore;
  ElementTexturizer: typeof ElementTexturizer;
  Stage: typeof Stage;
  Texture: typeof Texture;
}

declare global {
  interface Window {
    attachInspector(lng: ILng): void;
  }
}
