const View = require('../core/View');
const Utils = require('../core/Utils');

class Component extends View {

    constructor(stage, properties) {
        super(stage)

        // Encapsulate tags to prevent leaking.
        this.tagRoot = true;

        if (Utils.isObjectLiteral(properties)) {
            Object.assign(this, properties)
        }

        // Start with root state
        this.__state = ""

        this.__initialized = false
        this.__firstActive = false
        this.__firstEnable = false

        this.__construct()

        this.patch(this._getTemplate(), true)

        this.on('attach', () => this.__attach())
        this.on('detach', () => this.__detach())
        this.on('active', () => this.__active())
        this.on('inactive', () => this.__inactive())
        this.on('enabled', () => this.__enable())
        this.on('disable', () => this.__disable())

        this._signals = undefined
    }

    get application() {
        return this.stage.application
    }

    get state() {
        return this.__state
    }

    __construct() {
        this.fire('construct')
    }

    __attach() {
        if (!this.__initialized) {
            this.__init()
            this.__initialized = true
        }
        
        this.fire('attach')
    }

    __init() {
        this.fire('init')
    }

    __detach() {
        this.fire('detach')
    }

    __active() {
        if (!this.__firstActive) {
            this.fire('firstActive')
            this.__firstActive = true
        }

        this.fire('active')
    }

    __inactive() {
        this.fire('inactive')
    }

    __enable() {
        if (!this.__firstEnable) {
            this.fire('firstEnable')
            this.__firstEnable = true
        }

        this.fire('enable')
    }

    __disable() {
        this.fire('disable')
    }

    __focus(newTarget, prevTarget) {
        this.fire('focus', {newTarget: newTarget, prevTarget: prevTarget})
    }

    __unfocus(newTarget) {
        this.fire('unfocus', {newTarget: newTarget})
    }

    __focusBranch(target) {
        this.fire('focusBranch', {target: target})
    }

    __unfocusBranch(target, newTarget) {
        this.fire('focusBranch', {target:target, newTarget:newTarget})
    }

    __focusChange(target, newTarget) {
        this.fire('focusChange', {target:target, newTarget:newTarget})
    }

    __captureKey(e) {
        if (Component.KEYS_EVENTS_NAMES[e.keyCode]) {
            return this.fire([{event: "capture" + Component.KEYS_EVENTS_NAMES[e.keyCode]}, {event: "captureKey", args: {keyCode: e.keyCode}}])
        } else {
            return this.fire('captureKey', {keyCode: e.keyCode})
        }
    }

    __notifyKey(e) {
        if (Component.KEYS_EVENTS_NAMES[e.keyCode]) {
            return this.fire([{event: "notify" + Component.KEYS_EVENTS_NAMES[e.keyCode]}, {event: "notifyKey", args: {keyCode: e.keyCode}}])
        } else {
            return this.fire('notifyKey', {keyCode: e.keyCode})
        }
    }

    __handleKey(e) {
        if (Component.KEYS_EVENTS_NAMES[e.keyCode]) {
            return this.fire([{event: "handle" + Component.KEYS_EVENTS_NAMES[e.keyCode]}, {event: "handleKey", args: {keyCode: e.keyCode}}])
        } else {
            return this.fire('handleKey', {keyCode: e.keyCode})
        }
    }

    _getFocus() {
        // Override to delegate focus to child components.
        return this
    }

    _getStates() {
        if (!this.constructor.__states) {
            this.constructor.__states = this.constructor._states()
            if (!Utils.isObjectLiteral(this.constructor.__states)) {
                this._throwError("States object empty")
            }
        }
        return this.constructor.__states
    }

    static _states() {
        return {}
    }

    _getTemplate() {
        if (!this.constructor.__template) {
            this.constructor.__template = this.constructor._template()
            if (!Utils.isObjectLiteral(this.constructor.__template)) {
                this._throwError("Template object empty")
            }
        }
        return this.constructor.__template
    }

    static _template() {
        return {}
    }

    hasFocus() {
        let path = this.application._focusPath
        return path && path.length && path[path.length - 1] === this
    }

    hasFinalFocus() {
        let path = this.application._focusPath
        return path && (path.indexOf(this) >= 0)
    }

    get cparent() {
        return Component.getParent(this)
    }

    getSharedAncestorComponent(view) {
        let ancestor = this.getSharedAncestor(view)
        while(ancestor && !ancestor.isComponent) {
            ancestor = ancestor.parent
        }
        return ancestor
    }

    /**
     * Fires the specified event on the state machine.
     * @param event
     * @param {object} args
     * @return {boolean}
     *   True iff the state machine could find and execute a handler for the event (event and condition matched).
     */
    fire(event, args = {}) {
        if (!Utils.isObjectLiteral(args)) {
            this._throwError("Fire: args must be object")
        }
        return this.application.stateManager.fire(this, event, args)
    }

    /**
     * Signals the parent of the specified event.
     * A parent/ancestor that wishes to handle the signal should set the 'signals' property on this component.
     * @param {string} event
     * @param {object} args
     * @param {boolean} bubble
     */
    signal(event, args = {}, bubble = false) {
        if (!Utils.isObjectLiteral(args)) {
            this._throwError("Signal: args must be object")
        }

        if (!args._source) {
            args = Object.assign({_source: this}, args)
        }

        if (this._signals && this.cparent) {
            let fireEvent = this._signals[event]
            if (fireEvent === false) {
                // Ignore event, even when bubbling.
                return
            }
            if (fireEvent) {
                if (fireEvent === true) {
                    fireEvent = event
                }

                const handled = this.cparent.fire(fireEvent, args)
                if (handled) return
            }
        }
        if (bubble && this.cparent) {
            // Bubble up.
            this.cparent.signal(event, args, bubble)
        }
    }

    get signals() {
        return this._signals
    }

    set signals(v) {
        if (!Utils.isObjectLiteral(v)) {
            this._throwError("Signals: specify an object with signal-to-fire mappings")
        }
        this._signals = Object.assign(this._signals || {}, v)
    }

    /**
     * Fires the specified event downwards.
     * A descendant that wishes to handle the signal should set the '_broadcasts' property on this component.
     * @warn handling a broadcast will stop it from propagating; to continue propagation return false from the state
     * event handler.
     */
    broadcast(event, args = {}) {
        if (!Utils.isObjectLiteral(args)) {
            this._throwError("Broadcast: args must be object")
        }

        if (!args._source) {
            args = Object.assign({_source: this}, args)
        }

        if (this.__broadcasts) {
            let fireEvent = this.__broadcasts[event]
            if (fireEvent === false) {
                return
            }
            if (fireEvent) {
                if (fireEvent === true) {
                    fireEvent = event
                }

                const handled = this.fire(fireEvent, args)
                if (handled) {
                    // Skip propagation
                    return
                }
            }
        }

        // Propagate down.
        const subs = []
        Component.collectSubComponents(subs, this)
        for (let i = 0, n = subs.length; i < n; i++) {
            subs[i].broadcast(event, args)
        }
    }

    static collectSubComponents(subs, view) {
        if (view.hasChildren()) {
            const childList = view._childList
            for (let i = 0, n = childList.length; i < n; i++) {
                const child = childList.getAt(i)
                if (child.isComponent) {
                    subs.push(child)
                } else {
                    Component.collectSubComponents(subs, child)
                }
            }
        }
    }

    get _broadcasts() {
        return this.__broadcasts
    }

    set _broadcasts(v) {
        if (!Utils.isObjectLiteral(v)) {
            this._throwError("Broadcasts: specify an object with broadcast-to-fire mappings")
        }
        this.__broadcasts = Object.assign(this.__broadcasts || {}, v)
    }

    static getComponent(view) {
        let parent = view
        while (parent && !parent.isComponent) {
            parent = parent.parent
        }
        return parent
    }

    static getParent(view) {
        return Component.getComponent(view.parent)
    }

}

Component.prototype.isComponent = true

Component.KEYS = {
    UP: 38,
    DOWN: 40,
    LEFT: 37,
    RIGHT: 39,
    ENTER: 13,
    // BACK: 27,
    // RCBACK: 166,
    KEY_S: 82
};

Component.KEYS_EVENTS_NAMES = {
    38: "Up",
    40: "Down",
    37: "Left",
    39: "Right",
    13: "Enter",
    // 27: "Back",
    9: "Back",
    8: "Back",
    93: "Back",
    174: "Back",
    175: "Menu",
    // 166: "Back",
    83: "Search"
};

module.exports = Component