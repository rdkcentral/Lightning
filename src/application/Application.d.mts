import Element from "../tree/Element.mjs";
import Component from "./Component.mjs";

declare namespace Application {
  interface Settings {
    // !!!
  }

  interface TemplateSpec extends Component.TemplateSpecStrong {
  }
}

declare class Application extends Component<Application.TemplateSpec> {
  constructor(appSettings: Application.Settings);
  get focusPath(): Element[] | undefined;
  updateFocusPath(): void;
  destroy(): void;
  _receiveKeyup(event: KeyboardEvent): void;
  _receiveKeydown(event: KeyboardEvent): void;
}

export default Application;
