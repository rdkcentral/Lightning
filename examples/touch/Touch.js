let enabled = false;
let listeners;
let stage;

/**
 * Is user pressing `select / ok` button
 * @type {boolean}
 */
let touchStarted = false;
let startCoord;
let endCoord;
let delta;

/**
 * Element that initialized touchstart
 * @type {null}
 */
let touchedElement = null;

/**
 * Simple event to position translation
 * platform can provide own translator
 * @param event
 * @param cb
 * @returns {*}
 */
let translate = (event, cb) => {
    let clientX = 0;
    let clientY = 0;
    if (event instanceof MouseEvent) {
        clientX = event.clientX;
        clientY = event.clientY;
    } else {
        const {touches, changedTouches} = event;
        let touch = touches;

        if (changedTouches.length) {
            touch = changedTouches;
        }

        if (touch.length) {
            clientX = touch[0].clientX;
            clientY = touch[0].clientY;
        }
    }

    if (typeof cb === "function") {
        cb.call(null, ~~(clientX), ~~(clientY), event);
    }

    return cb;
};

const start = (x, y, event) => {
    const child = getAt(x, y);
    touchStarted = true;
    startCoord = new Vector(x, y);

    if (child) {
        touchedElement = child;
        emit(child, "_handleTouchStart", event);
    }
};

const move = (x, y) => {
    const current = new Vector(x, y);
    if (touchedElement) {
        emit(touchedElement, "_handleTouchMove", {
            start: startCoord, current, delta: current.subtract(startCoord)
        });
    } else {
        const child = getAt(x, y);
        if (child) {
            emit(child, "_handleTouchHover", {current});
        }
    }
};

const end = (x, y) => {
    const child = getAt(x, y);

    endCoord = new Vector(x, y);
    delta = endCoord.subtract(startCoord);

    if (child) {
        emit(child, "_handleTouchEnd", {delta});
    } else if (touchedElement) {
        emit(touchedElement, "_handleTouchEnd", {delta});
    }

    touchedElement = null;
};

/**
 * Get child at coords
 * @param x
 * @param y
 * @returns {*}
 */
const getAt = (x, y) => {
    const children = collect(x, y);
    if (children.length) {
        const core = children.pop();
        return core.element;
    }
    return null;
};

/**
 * Collect all children at coords
 * @param x
 * @param y
 * @returns {Array}
 */
const collect = (x, y) => {
    return stage.getChildrenByPosition(x, y);
};

/**
 * Call touchHandlers events on instance
 * @param instance
 * @param event
 * @param args
 */
const emit = (instance, event, args) => {
    if (instance[event]) {
        instance[event](args);
    }
};

export const initTouch = config => {
    if (config.listeners) {
        listeners = config;
    }
    if (config.translate) {
        translate = config.translate;
    }
};

/**
 * Lightning app must enable touch support
 * @param {Stage} stageInstance
 */
const enable = (stageInstance) => {
    if (enabled) {
        return;
    }

    stage = stageInstance;

    // provide default listeners if not provided via platform
    if (!listeners) {
        listeners = {
            start: () => {
                const evt = (event) => {
                    return translate.call(null, event, start);
                };

                document.addEventListener("touchstart", evt);
                document.addEventListener("mousedown", evt);
            },
            end: () => {
                const evt = (event) => {
                    return translate.call(null, event, end);
                };

                document.addEventListener("touchend", evt);
                document.addEventListener("mouseup", evt);

            },
            move: () => {
                const evt = (event) => {
                    translate.call(null, event, move);
                    event.preventDefault();
                };

                document.addEventListener("touchmove", evt, {passive: false});
                document.addEventListener("mousemove", evt);
            }
        };
    }

    listeners.start();
    listeners.end();
    listeners.move();

    enabled = true;
};

export default {
    enable
};

class Vector {
    constructor(x, y) {
        this.x = x || 0;
        this.y = y || 0;
    }

    add(v) {
        return new Vector(this.x + v.x, this.y + v.y);
    }

    subtract(v) {
        return new Vector(this.x - v.x, this.y - v.y);
    }
}