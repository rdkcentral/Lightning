import lng from './lightning.mjs';

declare global {
  interface Window {
    attachInspector?(
      Application: typeof lng.Application,
      Element: typeof lng.Element,
      ElementCore: typeof lng.ElementCore,
      Stage: typeof lng.Stage,
      Component: typeof lng.Component,
      ElementTexturizer: typeof lng.ElementTexturizer,
      Texture: typeof lng.Texture,
    ): void;
  }
}
