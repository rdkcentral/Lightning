import CoreContext from "../../../tree/core/CoreContext.mjs";
import C2dCoreQuadOperation from "../C2dCoreQuadOperation.mjs";
import C2dShader from "../C2dShader.mjs";

export type C2dInfo = {
  index: number;
  operation: C2dCoreQuadOperation;
  rect: boolean;
  target: HTMLCanvasElement & { ctx: CanvasRenderingContext2D };
};

export default class C2dDefaultShader extends C2dShader {
  constructor(coreContext: CoreContext);
  _beforeDrawEl(info: C2dInfo): void;
  _afterDrawEl(info: C2dInfo): void;
}
