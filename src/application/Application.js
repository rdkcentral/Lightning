const Component = require('./Component');

class Application extends Component {

    constructor(stageOptions, properties) {
        const stage = new Stage(stageOptions)
        super(stage, properties)

        // We must construct while the application is not yet attached.
        // That's why we 'init' the stage later (which actually emits the attach event).
        this.stage.init()
    }

    __construct() {
        this.stage.setApplication(this)

        // We must create the state manager before the first 'fire' ever: the 'construct' event.
        this.stateManager = new StateManager()
        this.stateManager.debug = this.debug

        super.__construct()
    }

    __init() {
        super.__init()
        this.__updateFocus()
    }

    __updateFocus(maxRecursion = 100) {
        const newFocusPath = this.__getFocusPath()
        const newFocusedComponent = newFocusPath[newFocusPath.length - 1]
        if (!this._focusPath) {
            // First focus.
            this._focusPath = newFocusPath

            // Focus events.
            for (let i = 0, n = this._focusPath.length; i < n; i++) {
                this._focusPath[i].__focus(newFocusedComponent, undefined)
            }
        } else {
            const focusedComponent = this._focusPath[this._focusPath.length - 1]

            let m = Math.min(this._focusPath.length, newFocusPath.length)
            let index
            for (index = 0; index < m; index++) {
                if (this._focusPath[index] !== newFocusPath[index]) {
                    break
                }
            }

            if (this._focusPath.length !== newFocusPath.length || index !== newFocusPath.length) {
                if (this.debug) {
                    console.log(this.stateManager._logPrefix + '* FOCUS ' + newFocusedComponent.getLocationString())
                }
                // Unfocus events.
                for (let i = this._focusPath.length - 1; i >= index; i--) {
                    this._focusPath[i].__unfocus(newFocusedComponent, focusedComponent)
                }

                this._focusPath = newFocusPath

                // Focus events.
                for (let i = index, n = this._focusPath.length; i < n; i++) {
                    this._focusPath[i].__focus(newFocusedComponent, focusedComponent)
                }

                // Focus changed events.
                for (let i = 0; i < index; i++) {
                    this._focusPath[i].__focusChange(newFocusedComponent, focusedComponent)
                }

                // Focus events could trigger focus changes.
                if (maxRecursion-- === 0) {
                    throw new Error("Max recursion count reached in focus update")
                }
                this.__updateFocus(maxRecursion)
            }

        }
    }

    __getFocusPath() {
        const path = [this]
        let current = this
        do {
            const nextFocus = current._getFocus()
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
                    newParts.push(ptr)
                    ptr = ptr.cparent
                    if (!ptr) {
                        current._throwError("Return value for _getFocus must be an attached descendant component but its '" + nextFocus.getLocationString() + "'")
                    }
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

    receiveKeydown(e) {
        const path = this.focusPath
        const n = path.length
        for (let i = 0; i < n; i++) {
            if (path[i].__captureKey(e)) {
                return
            }

            path[i].__notifyKey(e)
        }
        for (let i = n - 1; i >= 0; i--) {
            if (path[i].__handleKey(e)) {
                return
            }
        }
    }

    get debug() {
        return this._debug
    }

    set debug(v) {
        this._debug = v
        if (this.stateManager) {
            this.stateManager.debug = true
        }
    }

}

Application.prototype.isApplication = true

module.exports = Application

const Stage = require('../core/Stage');
const StateManager = require('./StateManager');