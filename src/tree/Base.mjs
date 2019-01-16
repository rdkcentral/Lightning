export default class Base {

    static defaultSetter(obj, name, value) {
        obj[name] = value;
    }

    static patchObject(obj, settings) {
        if (!Utils.isObjectLiteral(settings)) {
            console.error("Settings must be object literal");
        } else {
            let names = Object.keys(settings);
            for (let i = 0, n = names.length; i < n; i++) {
                let name = names[i];

                this.patchObjectProperty(obj, name, settings[name]);
            }
        }
    }

    static patchObjectProperty(obj, name, value) {
        let setter = obj.setSetting || Base.defaultSetter;

        if (name.charAt(0) === "_") {
            // Disallow patching private variables.
            if (name !== "__create") {
                console.error("Patch of private property '" + name + "' is not allowed");
            }
        } else if (name !== "type") {
            // Type is a reserved keyword to specify the class type on creation.
            if (Utils.isFunction(value) && value.__local) {
                // Local function (Base.local(s => s.something))
                value = value.__local(obj);
            }

            setter(obj, name, value);
        }
    }

    static local(func) {
        // This function can be used as an object setting, which is called with the target object.
        func.__local = true;
    }


}

import Utils from "./Utils.mjs";

