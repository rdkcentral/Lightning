class Base {
    constructor() {
    }
    hello(from) {
        console.log('hello from ' + from);
    }
}


class View extends Base {
    constructor(parent) {
        super();
    }
}

class TextView extends metadata(View) {
    setSomeMetadata() {
        this.setMetadata("haha", 123);
    }

    getMetadata(name) {
        this.hello('view');
        return super.getMetadata(name);
    }
}

function metadata(superclass) {
    return class extends (metadataHelper(superclass)) {
        getMetadata(name) {
            this.hello('metadata mixin');
            console.log('view log: get metadata', name);
            return super.getMetadata(name);
        }
        setMetadata(name, value) {
            console.log('view log: set metadata', name, value);
            super.setMetadata(name, value);
        }
    }
}

function metadataHelper(superclass) {
    if (!superclass.prototype instanceof Base) {
        // Class may have restrictions on its superclass.
        throw new Error("MetadataHelper expects a Base class")
    }
    return class extends (someOtherHelper(superclass)) {
        construct(initial) {
            this.metadata = initial || {};
        }

        getMetadata(name) {
            this.hello('metadata helper');
            return this.metadata[name];
        }
        setMetadata(name, value) {
            this.metadata[name] = value;
        }
    }
}

// Adding 2 mixins with the same base class:
// Create first mixin, then call the creator of the other mixin with as superclass the shared base.
// The 2 mixins then will use the same shared base.

// Simple rule: a mixinable inheritance chain may not rely on a constructor.
// If initialisation is necessary, a custom function should be chosen.
// Per mixin inheritance base, the init name should be unique.

function someOtherHelper(superclass) {
    if (!superclass.prototype instanceof Base) {
        // Class may have restrictions on its superclass.
        throw new Error("MetadataHelper expects a Base class")
    }

    let c;
    (function(isDirect) {
        c = class extends superclass {
            constructor(...args) {
                if (isDirect) {
                    super();
                    this.initMetadata(args[0]);
                } else {
                    // Ignore constructor.
                    super(...args);
                }
            }
            initMetadata(initial) {
                this.metadata = initial || {};
            }
            getMetadata(name) {
                this.hello('metadata helper');
                return this.metadata[name];
            }
            setMetadata(name, value) {
                this.metadata[name] = value;
            }
        };
    })(superclass === Base);

    return c;
}

// Instantiate MetadataHelper as a normal class.
let MetadataHelper = metadataHelper(Base);
let helper = new MetadataHelper({a: 1});
console.log('a should be 1: ' + helper.getMetadata('a'));

let text = new TextView(null);
text.initMetadata({text: true});
console.log('text should be true: ' + text.getMetadata('text'));

// var base = new ImageView();
// console.log(base._x, base.worldAlpha);
// var settable = base.getSettable("x");
// base.addTag('test');
// let tags = base.getTags();
