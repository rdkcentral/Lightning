var isNode = !!(((typeof module !== "undefined") && module.exports));

if (isNode) {
    var Utils = require('./Utils');
    var Transition = require('./Transition');
}

/**
 * A transition for some element.
 * @constructor
 */
function PropertyTransition(component, property) {
    this.component = component;

    this.property = property;

    this.setting = Component.SETTINGS[property];

    Transition.call(this, this.setting.g(this.component));

    /**
     * The merge function. If null then use plain numeric interpolation merge.
     * @type {Function}
     */
    this.mergeFunction = this.setting.m;

    this.valueSetterFunction = this.setting.sf;

}

Utils.extendClass(PropertyTransition, Transition);

PropertyTransition.prototype.setValue = function(v) {
    this.valueSetterFunction(this.component, v);
};

PropertyTransition.prototype.getMergedValue = function(v) {
    return this.mergeFunction(this.targetValue, this.startValue, v);
};

PropertyTransition.prototype.activate = function() {
    this.component.stage.addActiveTransition(this);
};

if (isNode) {
    module.exports = PropertyTransition;
    var Component = require('./Component');
}