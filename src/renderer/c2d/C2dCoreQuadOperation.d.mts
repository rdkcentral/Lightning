import CoreQuadOperation from "../../tree/core/CoreQuadOperation.mjs";
import C2dCoreQuadList from "./C2dCoreQuadList.mjs";

export default class C2dCoreQuadOperation extends CoreQuadOperation {
  get quads(): C2dCoreQuadList;
}
