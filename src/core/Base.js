/**
 * Copyright Metrological, 2017
 */
class Base {

    /**
     * Mixes an ES5 class and the specified superclass.
     * @param superclass
     * @param extra
     *   An ES5 class constructor.
     */
    static mixinEs5(superclass, extra) {
        let proto = extra.prototype;

        let props = Object.getOwnPropertyNames(proto);
        for(let i = 0; i < props.length; i++) {
            let key = props[i];
            let desc = Object.getOwnPropertyDescriptor(proto, key);
            if (key !== 'constructor' && desc.configurable) {
                if (superclass.prototype[key]) {
                    // Mixin may not overwrite prototype methods.
                    console.warn('Mixin overwrites ' + key);
                } else {
                    Object.defineProperty(superclass.prototype, key, desc);
                }
            }
        }

        return superclass;
    };

    static defaultSetter(obj, name, value) {
        obj[name] = value
    }

    static patchObject(obj, settings) {
        if (!Utils.isObjectLiteral(settings)) {
            console.error("Settings must be object literal")
        } else {
            let names = Object.keys(settings)
            for (let i = 0, n = names.length; i < n; i++) {
                let name = names[i]

                this.patchObjectProperty(obj, name, settings[name])
            }
        }
    }

    static patchObjectProperty(obj, name, value) {
        let setter = obj.setSetting || Base.defaultSetter;

        if (name.substr(0, 1) === "_" && name !== "__create") {
            // Disallow patching private variables.
            console.error("Patch of private property '" + name + "' is not allowed")
        } else if (name !== "type") {
            // Type is a reserved keyword to specify the class type on creation.
            if (Utils.isFunction(value) && value.__local) {
                // Local function (Base.local(s => s.something))
                value = value.__local(obj)
            }

            setter(obj, name, value)
        }
    }

    static local(func) {
        // This function can be used as an object setting, which is called with the target object.
        func.__local = true
    }

}

let Utils = require('./Utils');

module.exports = Base;