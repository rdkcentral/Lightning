import FlowingGradientExample from "./FlowingGradientExample.mjs";
import Stage from '../../src/tree/Stage.mjs';
import NodeAdapter from '../../src/node/NodeAdapter.mjs';

Stage.ADAPTER = NodeAdapter;

const options = {stage: {w: 1600, h: 1000, clearColor: 0xFF000000}};
const app = new FlowingGradientExample(options);
