/*
 * If not stated otherwise in this file or this component's LICENSE file the
 * following copyright and licenses apply:
 *
 * Copyright 2022 Metrological
 *
 * Licensed under the Apache License, Version 2.0 (the License);
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
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
 * Shaders can be set on Lightning Elements (See: {@link Element.TemplateSpec.shader}) to enable many
 * amazing GPU driven effects.
 */
export default class DefaultShader extends WebGLShader {
  constructor(coreContext: CoreContext);
}
