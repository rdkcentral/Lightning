/*
 * If not stated otherwise in this file or this component's LICENSE file the
 * following copyright and licenses apply:
 *
 * Copyright 2020 Metrological
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
*/
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
