import CoreContext from "../../tree/core/CoreContext.mjs";
import CoreQuadOperation from "../../tree/core/CoreQuadOperation.mjs";
import Shader from "../../tree/Shader.mjs";
import WebGLCoreQuadOperation from "./WebGLCoreQuadOperation.mjs";

declare namespace WebGLShader {
  export type GLUniformFunction = WebGLRenderingContext['uniform1f'] | WebGLRenderingContext['uniform2fv'];
}
declare class WebGLShader extends Shader {
  constructor(ctx: CoreContext);
  /**
   * Fragment Shader GLSL Source Code
   *
   * @remarks
   * This static property is overridden by subclass shaders to the GLSL source
   * code for a [Fragment Shader](https://www.khronos.org/opengl/wiki/Fragment_Shader) program.
   *
   * @example
   * ```ts
   * MyShader.fragmentShaderSource = `
   * #ifdef GL_ES
   * # ifdef GL_FRAGMENT_PRECISION_HIGH
   * precision highp float;
   * # else
   * precision lowp float;
   * # endif
   * #endif
   * varying vec2 vTextureCoord;
   * varying vec4 vColor;
   * uniform sampler2D uSampler;
   * void main(void){
   *     gl_FragColor = texture2D(uSampler, vTextureCoord) * vColor;
   * }
   * `;
   * ```
   */
  static fragmentShaderSource: string;
  /**
   * Vertex Shader GLSL Source Code
   *
   * @remarks
   * This default shader program is replaced by subclass shaders to the GLSL source
   * code for a [Vertex Shader](https://www.khronos.org/opengl/wiki/Vertex_Shader) program.
   *
   * @example
   * ```ts
   * DefaultShader.vertexShaderSource = `
   * #ifdef GL_ES
   * # ifdef GL_FRAGMENT_PRECISION_HIGH
   * precision highp float;
   * # else
   * precision lowp float;
   * # endif
   * #endif
   * attribute vec2 aVertexPosition;
   * attribute vec2 aTextureCoord;
   * attribute vec4 aColor;
   * uniform vec2 projection;
   * varying vec2 vTextureCoord;
   * varying vec4 vColor;
   * void main(void){
   *     gl_Position = vec4(aVertexPosition.x * projection.x - 1.0, aVertexPosition.y * -abs(projection.y) + 1.0, 0.0, 1.0);
   *     vTextureCoord = aTextureCoord;
   *     vColor = aColor;
   *     gl_Position.y = -sign(projection.y) * gl_Position.y;
   * }
   * `;
   * ```
   */
  static vertexShaderSource: string;

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
