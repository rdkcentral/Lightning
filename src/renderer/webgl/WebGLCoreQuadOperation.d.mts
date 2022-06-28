import CoreQuadOperation from "../../tree/core/CoreQuadOperation.mjs";
import WebGLCoreQuadList from "./WebGLCoreQuadList.mjs";

export default class WebGLCoreQuadOperation extends CoreQuadOperation {
  extraAttribsDataByteOffset: number;
  get quads(): WebGLCoreQuadList;
}
