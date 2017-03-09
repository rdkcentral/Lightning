var isNode = !!(((typeof module !== "undefined") && module.exports));

if (isNode) {
    var Utils = require('./Utils');
    var Animation = require('./Animation');
}

/**
 * A custom-progress animation.
 * @param stage
 * @constructor
 * @extends Animation
 */
function CustomAnimation(stage) {
    Animation.call(this, stage);
}

Utils.extendClass(CustomAnimation, Animation);


if (isNode) {
    module.exports = CustomAnimation;
}