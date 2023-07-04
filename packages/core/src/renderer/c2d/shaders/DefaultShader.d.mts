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
import C2dCoreQuadOperation from "../C2dCoreQuadOperation.mjs";
import C2dShader from "../C2dShader.mjs";

declare namespace C2dDefaultShader {
  export type C2dInfo = {
    index: number;
    operation: C2dCoreQuadOperation;
    rect: boolean;
    target: HTMLCanvasElement & { ctx: CanvasRenderingContext2D };
  };
}


declare class C2dDefaultShader extends C2dShader {
  constructor(coreContext: CoreContext);
  _beforeDrawEl(info: C2dDefaultShader.C2dInfo): void;
  _afterDrawEl(info: C2dDefaultShader.C2dInfo): void;
}

export default C2dDefaultShader;