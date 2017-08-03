/**
 * Copyright Metrological, 2017
 */
class Base {
    constructor() {
        let proto = Object.getPrototypeOf(this);
        if (!Base.protoReady.has(proto)) {
            Base.initPrototype(proto);
        }
    }

    /**
     * @protected
     */
    _properties() {
    }

    static initPrototype(proto) {
        if (!Base.protoReady.has(proto)) {
            const stack = [];

            // run prototype functions
            while(proto){
                if(!Base.protoReady.has(proto)) {
                    stack.push(proto);
                }
                Base.protoReady.add(proto);
                proto = Object.getPrototypeOf(proto);
            }

            for(let i = stack.length - 1; i >= 0; i--) {
                proto = stack[i];

                 // Initialize properties.
                if (proto.hasOwnProperty('_properties')) {
                    proto._properties();
                }
            }
        }
    }

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

    setSettings(settings) {
        Base.setObjectSettings(this, settings);
    }

    static setObjectSettings(obj, settings) {
        for (let name in settings) {
            // Type is a reserved keyword to specify the class type on creation.
            if (settings.hasOwnProperty(name) && name != 'type') {
                let v = settings[name];
                if (Utils.isObjectLiteral(v) && Utils.isObject(obj[name])) {
                    // Sub object.
                    var p = obj[name];
                    if (p.setSettings) {
                        // Custom setSettings method.
                        p.setSettings(v);
                    } else {
                        Base.setObjectSettings(p, v);
                    }
                } else {
                    obj[name] = v;
                }
            }
        }
    }

}

Base.protoReady = new WeakSet();

let Utils = require('./Utils');

module.exports = Base;