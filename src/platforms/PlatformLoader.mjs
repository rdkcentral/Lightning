import WebPlatform from "./browser/WebPlatform.mjs";
import Utils from "../tree/Utils.mjs";
export default class PlatformLoader {
    static load(options) {
        if (options.platform) {
            return options.platform;
        } else {
            if (Utils.isWeb) {
                return WebPlatform;
            } else {
                throw new Error("You must specify the platform class to be used.");
            }
        }
    }
}