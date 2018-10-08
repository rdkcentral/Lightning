import FlowingGradientExample from "./FlowingGradientExample.mjs";


import NodePlatform from "../../src/platforms/node/NodePlatform.mjs";

const options = {stage: {w: 1600, h: 1000, clearColor: 0xFF000000, platform: NodePlatform}};
const app = new FlowingGradientExample(options);
