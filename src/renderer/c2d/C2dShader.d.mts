import Shader from "../../tree/Shader.mjs";
import C2dCoreQuadOperation from "./C2dCoreQuadOperation.mjs";

export default class C2dShader extends Shader {
  protected beforeDraw(operation: C2dCoreQuadOperation): void;
  protected draw(operation: C2dCoreQuadOperation): void;
  protected afterDraw(operation: C2dCoreQuadOperation): void;
}
