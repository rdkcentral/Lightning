import CoreQuadList from "./CoreQuadList.mjs";
import ElementCore from "./ElementCore.mjs";
import Element from "../Element.mjs";

export default class CoreQuadOperation {
  shaderOwner: ElementCore;
  length: number;
  get quads(): CoreQuadList;
  getElementCore(index: number): ElementCore;
  getElementWidth(index: number): Element['renderWidth'];
  getElementHeight(index: number): Element['renderHeight'];
}
