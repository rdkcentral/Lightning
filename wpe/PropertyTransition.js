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

    this.propertyIndex = Component.getPropertyIndex(property);

    Transition.call(this, Component.propertyGetters[this.propertyIndex](this.component));

    /**
     * The merge function. If null then use plain numeric interpolation merge.
     * @type {Function}
     */
    this.mergeFunction = Component.getMergeFunction(property);

    this.valueSetterFunction = Component.propertySettersFinal[this.propertyIndex];

}

Utils.extendClass(PropertyTransition, Transition);

PropertyTransition.prototype.setValue = function(v) {
    this.valueSetterFunction(this.component, v);
};

PropertyTransition.prototype.getMergedValue = function(v) {
    if (!this.mergeFunction) {
        // Numeric merge. Inline for performance.
        return this.targetValue * v + this.startValue * (1 - v);
    } else {
        return this.mergeFunction(this.targetValue, this.startValue, v);
    }
};

PropertyTransition.prototype.activate = function() {
    this.component.stage.addActiveTransition(this);
};

if (isNode) {
    module.exports = PropertyTransition;
    var Component = require('./Component');
}