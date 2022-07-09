import CoreContext from "../../../tree/core/CoreContext.mjs";
import Element from "../../../tree/Element.mjs"; // Used in documentation
/**
 * Base Class for a WebGL Shader in Lightning
 *
 * @remarks
 * This class provides a default set of non-altering shader programs and can be extended to build new WebGL
 * shaders in Lightning. A Shader in Lightning can consist of both a
 * {@link https://www.khronos.org/opengl/wiki/Fragment_Shader Fragment Shader} program and a
 * {@link https://www.khronos.org/opengl/wiki/Vertex_Shader Vertex Shader} program.
 *
 * Shaders can be set on Lightning Elements (See: {@link Element.TemplateSpec.shader}) to enable many
 * amazing GPU driven effects.
 */
export default class DefaultShader extends WebGLShader {
  constructor(coreContext: CoreContext);
  /**
   * Fragment Shader GLSL Source Code
   *
   * @remarks
   * This static property is overridden by subclass shaders to the GLSL source
   * code for a {@link https://www.khronos.org/opengl/wiki/Fragment_Shader Fragment Shader} program.
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
   * code for a {@link https://www.khronos.org/opengl/wiki/Vertex_Shader Vertex Shader} program.
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
}
