import CoreQuadList from "./CoreQuadList.mjs";

export default class CoreRenderState {
  quads: CoreQuadList;

  // Custom values (patched in by the Peacock team)
  renderCalls?: number;
  renderCount?: number;
}
