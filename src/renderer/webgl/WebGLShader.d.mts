import CoreContext from "../../tree/core/CoreContext.mjs";
import CoreQuadOperation from "../../tree/core/CoreQuadOperation.mjs";
import Shader from "../../tree/Shader.mjs";
import WebGLCoreQuadOperation from "./WebGLCoreQuadOperation.mjs";

declare namespace WebGLShader {
  export type GLUniformFunction = WebGLRenderingContext['uniform1f'] | WebGLRenderingContext['uniform2fv'];
}
declare class WebGLShader extends Shader {
  static vertexShaderSource: string;
  static fragmentShaderSource: string;

  constructor(ctx: CoreContext);

  gl: WebGLRenderingContext;

  protected _uniform(name: string): WebGLUniformLocation;
  protected _attrib(name: string): GLint;

  protected enableAttribs(): void;
  protected disableAttribs(): void;

  protected beforeDraw(operation: WebGLCoreQuadOperation): void;
  protected draw(operation: WebGLCoreQuadOperation): void;
  protected afterDraw(operation: WebGLCoreQuadOperation): void;

  protected setupUniforms(operation: CoreQuadOperation): void;
  protected _setUniform(
    name: string,
    value: number | Float32Array,
    glFunction: WebGLShader.GLUniformFunction,
  ): void;

  protected getExtraAttribBytesPerVertex(): number;
  protected getVertexAttribPointerOffset(
    operation: WebGLCoreQuadOperation,
  ): number;
  protected setExtraAttribsInBuffer(operation: WebGLCoreQuadOperation): void;
}

export default WebGLShader;
