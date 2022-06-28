import CoreContext from "../tree/core/CoreContext.mjs";
import Shader from "../tree/Shader.mjs";
import Stage from "../tree/Stage.mjs";

export default class Renderer {
  constructor(stage: Stage);

  _defaultShader: Shader;

  createShader<T extends typeof Shader>(
    ctx: CoreContext,
    settings: Shader.Literal<T>,
  ): InstanceType<T>;

  isValidShaderType(shaderType: typeof Shader): boolean;
}
