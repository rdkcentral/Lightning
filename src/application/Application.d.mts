import EventEmitter from "../EventEmitter.mjs";
import Element from "../tree/Element.mjs";
import Texture from "../tree/Texture.mjs";
import Component from "./Component.mjs";

declare namespace Application {
  interface Settings {
    // !!!
  }

  interface TemplateSpec extends Component.TemplateSpecStrong {
  }

  interface EventMap extends Element.EventMap {
    // This is here so it can be augmented by Applications
  }
}

declare class Application extends Component<Application.TemplateSpec, Application.EventMap> implements EventEmitter<Application.EventMap> {
  constructor(appSettings: Application.Settings);
  get focusPath(): Element[] | undefined;
  updateFocusPath(): void;
  destroy(): void;
  _receiveKeyup(event: KeyboardEvent): void;
  _receiveKeydown(event: KeyboardEvent): void;
}

export default Application;
