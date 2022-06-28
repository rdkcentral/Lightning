import Element from "../tree/Element.mjs";
import Component from "./Component.mjs";

interface AppSettings {
  // !!!
}

declare namespace Application {
  interface Literal extends Component.Literal {
    type: typeof Application
  }
}

declare class Application extends Component<Application.Literal> implements Component.ImplementLiteral<Application.Literal> {
  constructor(appSettings: AppSettings);
  get focusPath(): Element[] | undefined;
  updateFocusPath(): void;
  destroy(): void;
  _receiveKeyup(event: KeyboardEvent): void;
  _receiveKeydown(event: KeyboardEvent): void;
}

export default Application;
