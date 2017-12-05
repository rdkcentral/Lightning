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
        let setter = obj.setSetting || Base.defaultSetter;

        let names = Object.keys(settings)
        for (let i = 0, n = names.length; i < n; i++) {
            let name = names[i]

            // Type is a reserved keyword to specify the class type on creation.
            if (name.substr(0, 2) !== "__" && name !== "type") {
                let v = settings[name];

                if (Utils.isFunction(v) && v.__local) {
                    // Local function (Base.local(s => s.something))
                    v = v.__local(obj)
                }

                setter(obj, name, v)
            }
        }
    }

    static local(func) {
        // This function can be used as an object setting, which is called with the target object.
        func.__local = true
    }

}

let Utils = require('./Utils');

module.exports = Base;