import CoreContext from "../../tree/core/CoreContext.mjs";
import CoreQuadList from "../../tree/core/CoreQuadList.mjs";

export default class WebGLCoreQuadList extends CoreQuadList {
  constructor(ctx: CoreContext);

  data: ArrayBuffer;
  floats: Float32Array;
  uints: Uint32Array;

  protected getAttribsDataByteOffset(index: number): number;
  protected getQuadContents(): string[];
}
