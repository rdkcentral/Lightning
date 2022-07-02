import Element from "../tree/Element.mjs";
import Component from "./Component.mjs";

declare namespace Application {
  interface Settings {
    // !!!
  }

  interface Literal extends Component.Literal {
  }
}

declare class Application extends Component<Application.Literal> {
  constructor(appSettings: Application.Settings);
  get focusPath(): Element[] | undefined;
  updateFocusPath(): void;
  destroy(): void;
  _receiveKeyup(event: KeyboardEvent): void;
  _receiveKeydown(event: KeyboardEvent): void;
}

export default Application;