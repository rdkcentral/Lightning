import WebPlatform from "./browser/WebPlatform.mjs";
export default class PlatformLoader {
    static load(options) {
        return WebPlatform;
    }
}