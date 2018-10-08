import NodePlatform from "./node/NodePlatform.mjs";
export default class PlatformLoader {
    static load(options) {
        return NodePlatform;
    }
}