var isNode = !!(((typeof module !== "undefined") && module.exports));

if (isNode) {
    var Utils = require('./Utils');
    var GenericTransition = require('./GenericTransition');
}

/**
 * A transition for some component property.
 * @constructor
 */
function Transition(component, property) {
    this.component = component;

    this.property = property;

    this.setting = Component.SETTINGS[property];

    GenericTransition.call(this, this.setting.g(this.component));

    /**
     * The merge function. If null then use plain numeric interpolation merge.
     * @type {Function}
     */
    this.mergeFunction = this.setting.m;

    this.valueSetterFunction = this.setting.sf;

}

Utils.extendClass(Transition, GenericTransition);

Transition.prototype.setValue = function(v) {
    this.valueSetterFunction(this.component, v);
};

Transition.prototype.getMergedValue = function(v) {
    return this.mergeFunction(this.targetValue, this.startValue, v);
};

Transition.prototype.activate = function() {
    this.component.stage.addActiveTransition(this);
};

if (isNode) {
    module.exports = Transition;
    var Component = require('./Component');
}