const Component = require('./Component');

class Application extends Component {

    constructor(options = {}, properties) {
        // Save options temporarily to avoid having to pass it through the constructor.
        Application._temp_options = options

        const stage = new Stage(options.stage)
        super(stage, properties)

        // We must construct while the application is not yet attached.
        // That's why we 'init' the stage later (which actually emits the attach event).
        this.stage.init()

        this.__keymap = this.getOption('keys')
        if (this.__keymap) {
            this.stage.adapter.registerKeyHandler((e) => {
                this._receiveKeydown(e)
            })
        }
    }

    getOption(name) {
        return this.__options[name]
    }

    _setOptions(o) {
        this.__options = {};

        let opt = (name, def) => {
            let value = o[name];

            if (value === undefined) {
                this.__options[name] = def;
            } else {
                this.__options[name] = value;
            }
        }

        opt('debug', false);
        opt('keys', {});
    }

    __construct() {
        this.stage.setApplication(this)

        this._setOptions(Application._temp_options)
        delete Application._temp_options

        // We must create the state manager before the first 'fire' ever: the 'construct' event.
        this.stateManager = new StateManager()
        this.stateManager.debug = this.__options.debug

        super.__construct()
    }

    __init() {
        super.__init()
        this.__updateFocus()
    }

    updateFocusPath() {
        this.__updateFocus()
    }

    __updateFocus(maxRecursion = 100) {
        const newFocusPath = this.__getFocusPath()
        const newFocusedComponent = newFocusPath[newFocusPath.length - 1]
        const prevFocusedComponent = this._focusPath ? this._focusPath[this._focusPath.length - 1] : undefined

        if (!prevFocusedComponent) {
            // First focus.
            this._focusPath = newFocusPath

            // Focus events.
            for (let i = 0, n = this._focusPath.length; i < n; i++) {
                this._focusPath[i].__focus(newFocusedComponent, undefined)
            }
        } else {
            let m = Math.min(this._focusPath.length, newFocusPath.length)
            let index
            for (index = 0; index < m; index++) {
                if (this._focusPath[index] !== newFocusPath[index]) {
                    break
                }
            }

            if (this._focusPath.length !== newFocusPath.length || index !== newFocusPath.length) {
                if (this.__options.debug) {
                    console.log(this.stateManager._logPrefix + '* FOCUS ' + newFocusedComponent.getLocationString())
                }
                // Unfocus events.
                for (let i = this._focusPath.length - 1; i >= index; i--) {
                    this._focusPath[i].__unfocus(newFocusedComponent, prevFocusedComponent)
                }

                this._focusPath = newFocusPath

                // Focus events.
                for (let i = index, n = this._focusPath.length; i < n; i++) {
                    this._focusPath[i].__focus(newFocusedComponent, prevFocusedComponent)
                }

                // Focus changed events.
                for (let i = 0; i < index; i++) {
                    this._focusPath[i].__focusChange(newFocusedComponent, prevFocusedComponent)
                }

                // Focus events could trigger focus changes.
                if (maxRecursion-- === 0) {
                    throw new Error("Max recursion count reached in focus update")
                }
                this.__updateFocus(maxRecursion)
            }
        }

        // Performance optimization: do not gather settings if no handler is defined.
        if (this.__initialized && this._handleFocusSettings !== Application.prototype._handleFocusSettings) {
            this.updateFocusSettings()
        }
    }

    updateFocusSettings() {
        const newFocusPath = this.__getFocusPath()
        const focusedComponent = newFocusPath[newFocusPath.length - 1]

        // Get focus settings. These can be used for dynamic application-wide settings the depend on the
        // focus directly (such as the application background).
        const focusSettings = {}
        for (let i = 0, n = this._focusPath.length; i < n; i++) {
            this._focusPath[i]._setFocusSettings(focusSettings)
        }

        this._handleFocusSettings(focusSettings, this.__prevFocusSettings, focusedComponent)

        this.__prevFocusSettings = focusSettings
    }

    _handleFocusSettings(settings, prevSettings, focused, prevFocused) {
        // Override to handle focus-based settings.
    }

    __getFocusPath() {
        const path = [this]
        let current = this
        do {
            const nextFocus = current._getFocused()
            if (!nextFocus || (nextFocus === current)) {
                // Found!
                break
            }


            let ptr = nextFocus.cparent
            if (ptr === current) {
                path.push(nextFocus)
            } else {
                // Not an immediate child: include full path to descendant.
                const newParts = [nextFocus]
                do {
                    if (!ptr) {
                        current._throwError("Return value for _getFocused must be an attached descendant component but its '" + nextFocus.getLocationString() + "'")
                    }
                    newParts.push(ptr)
                    ptr = ptr.cparent
                } while (ptr !== current)

                // Add them reversed.
                for (let i = 0, n = newParts.length; i < n; i++) {
                    path.push(newParts[n - i - 1])
                }
            }

            current = nextFocus
        } while(true)

        return path
    }

    get focusPath() {
        return this._focusPath
    }

    /**
     * Injects an event in the state machines, top-down from application to focused component.
     */
    focusTopDownEvent(event, args) {
        const path = this.focusPath
        const n = path.length
        if (Array.isArray(event)) {
            // Multiple events.
            for (let i = 0; i < n; i++) {
                if (path[i].fire(event)) {
                    return true
                }
            }
        } else {
            // Single event.
            for (let i = 0; i < n; i++) {
                if (path[i].fire(event, args)) {
                    return true
                }
            }
        }
        return false
    }

    /**
     * Injects an event in the state machines, bottom-up from focused component to application.
     */
    focusBottomUpEvent(event, args) {
        const path = this.focusPath
        const n = path.length
        if (Array.isArray(event)) {
            // Multiple events.
            for (let i = n - 1; i >= 0; i--) {
                if (path[i].fire(event)) {
                    return true
                }
            }
        } else {
            // Single event.
            for (let i = n - 1; i >= 0; i--) {
                if (path[i].fire(event, args)) {
                    return true
                }
            }
        }
        return false
    }

    _receiveKeydown(e) {
        const obj = {keyCode: e.keyCode}
        if (this.__keymap[e.keyCode]) {
            if (!this.stage.application.focusTopDownEvent([{event: "_capture" + this.__keymap[e.keyCode], args: obj}, {event: "_captureKey", args: obj}])) {
                this.stage.application.focusBottomUpEvent([{event: "_handle" + this.__keymap[e.keyCode], args: obj}, {event: "_handleKey", args: obj}])
            }
        } else {
            if (!this.stage.application.focusTopDownEvent("_captureKey", obj)) {
                this.stage.application.focusBottomUpEvent("_handleKey", obj)
            }
        }
    }

}

module.exports = Application

const Utils = require('../tree/Utils');
const Stage = require('../tree/Stage');
const StateManager = require('./StateManager');