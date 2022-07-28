import CoreContext from "./core/CoreContext.mjs";
import ElementCore from "./core/ElementCore.mjs";

declare namespace Shader {
  export interface Settings {
    type?: typeof Shader;
  }

  /**
   * Loose form of Shader {@link Settings}
   */
  export interface SettingsLoose extends Settings {
    [key: string]: any;
  }
}

declare class Shader {
  isShader: true;

  // This is a hack that helps TypeScript to differentiate the Shader class and the `Shader.Settings` interface.
  type: undefined;

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