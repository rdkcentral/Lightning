import CoreContext from "../../../tree/core/CoreContext.mjs";
import Element from "../../../tree/Element.mjs"; // Used in documentation
import WebGLShader from "../WebGLShader.mjs";
/**
 * Base Class for a WebGL Shader in Lightning
 *
 * @remarks
 * This class provides a default set of non-altering shader programs and can be extended to build new WebGL
 * shaders in Lightning. A Shader in Lightning can consist of both a
 * [Fragment Shader](https://www.khronos.org/opengl/wiki/Fragment_Shader) program and a
 * [Vertex Shader](https://www.khronos.org/opengl/wiki/Vertex_Shader) program.
 *
 * Shaders can be set on Lightning Elements (See: {@link Element.TemplateSpecStrong.shader}) to enable many
 * amazing GPU driven effects.
 */
export default class DefaultShader extends WebGLShader {
  constructor(coreContext: CoreContext);
}
