import CoreContext from "./core/CoreContext.mjs";
import ElementCore from "./core/ElementCore.mjs";

declare namespace Shader {
  export interface Literal {
    type: typeof Shader;
    [key: string]: any; // Anything goes for now
  }
}

declare class Shader {
  ctx: CoreContext;

  constructor(coreContext: CoreContext);

  addElement(core: ElementCore): void;
  patch(settings: unknown): void;
  protected redraw(): void;
  removeElement(core: ElementCore): void;

  protected useDefault(): boolean;

  // This is a simplification, for now, to make it easier to interact with shader properties
  [x: string]: unknown;
}

export default Shader;