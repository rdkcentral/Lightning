export default class AppDefinition extends lng.EventEmitter {

    constructor(application) {
        super();
        this.application = application;
    }

    get identifier() {
        const identifier = this.constructor.identifier;
        if (!identifier) throw new Error("Application does not have an identifier: " + this.constructor.name);
        return identifier;
    }

    getPath(relPath) {
        return AppDefinition.getPath(this.constructor, relPath);
    }

    static getPath(relPath) {
        return "apps/" + this.identifier + "/static/" + relPath;
    }

    static get identifier() {
        throw new Error("Please supply an identifier in the App definition file.");
    }

    getAppViewType() {
        throw new Error("Please specify the app view type.");
    }

}