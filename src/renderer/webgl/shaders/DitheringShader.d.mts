import CoreContext from "../../../tree/core/CoreContext.mjs";
import DefaultShader from "./DefaultShader.mjs";

export default class DitheringShader extends DefaultShader {
  constructor(coreContext: CoreContext);

  set graining(graining: number);
  set random(random: boolean);
}
