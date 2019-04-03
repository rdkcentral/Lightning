import Component from "./Component.mjs";

export default class Application extends Component {

    constructor(options = {}, properties) {
        // Save options temporarily to avoid having to pass it through the constructor.
        Application._temp_options = options;

        // Booting flag is used to postpone updateFocusSettings;
        Application.booting = true;
        const stage = new Stage(options.stage);
        super(stage, properties);
        Application.booting = false;

        this.__updateFocusCounter = 0;

        // We must construct while the application is not yet attached.
        // That's why we 'init' the stage later (which actually emits the attach event).
        this.stage.init();

        // Initially, the focus settings are updated after both the stage and application are constructed.
        this.updateFocusSettings();

        this.__keymap = this.getOption('keys');
        if (this.__keymap) {
            this.stage.platform.registerKeyHandler((e) => {
                this._receiveKeydown(e);
            });
        }
    }

    getOption(name) {
        return this.__options[name];
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
        opt('keys', {
            38: "Up",
            40: "Down",
            37: "Left",
            39: "Right",
            13: "Enter",
            8: "Back",
            27: "Exit"
        });
    }

    __construct() {
        this.stage.setApplication(this);

        this._setOptions(Application._temp_options);
        delete Application._temp_options;

        super.__construct();
    }

    __init() {
        super.__init();
        this.__updateFocus();
    }

    updateFocusPath() {
        this.__updateFocus();
    }

    __updateFocus() {
        const notOverridden = this.__updateFocusRec();

        if (!Application.booting && notOverridden) {
            this.updateFocusSettings();
        }
    }

    __updateFocusRec() {
        const updateFocusId = ++this.__updateFocusCounter;
        this.__updateFocusId = updateFocusId;

        const newFocusPath = this.__getFocusPath();
        const newFocusedComponent = newFocusPath[newFocusPath.length - 1];
        const prevFocusedComponent = this._focusPath ? this._focusPath[this._focusPath.length - 1] : undefined;

        if (!prevFocusedComponent) {
            // Focus events.
            this._focusPath = [];
            for (let i = 0, n = newFocusPath.length; i < n; i++) {
                this._focusPath.push(newFocusPath[i]);
                this._focusPath[i]._focus(newFocusedComponent, undefined);
                const focusOverridden = (this.__updateFocusId !== updateFocusId);
                if (focusOverridden) {
                    return false;
                }
            }
            return true;
        } else {
            let m = Math.min(this._focusPath.length, newFocusPath.length);
            let index;
            for (index = 0; index < m; index++) {
                if (this._focusPath[index] !== newFocusPath[index]) {
                    break;
                }
            }

            if (this._focusPath.length !== newFocusPath.length || index !== newFocusPath.length) {
                if (this.__options.debug) {
                    console.log('FOCUS ' + newFocusedComponent.getLocationString());
                }
                // Unfocus events.
                for (let i = this._focusPath.length - 1; i >= index; i--) {
                    const unfocusedElement = this._focusPath.pop();
                    unfocusedElement._unfocus(newFocusedComponent, prevFocusedComponent);
                    const focusOverridden = (this.__updateFocusId !== updateFocusId);
                    if (focusOverridden) {
                        return false;
                    }
                }

                // Focus events.
                for (let i = index, n = newFocusPath.length; i < n; i++) {
                    this._focusPath.push(newFocusPath[i]);
                    this._focusPath[i]._focus(newFocusedComponent, prevFocusedComponent);
                    const focusOverridden = (this.__updateFocusId !== updateFocusId);
                    if (focusOverridden) {
                        return false;
                    }
                }

                // Focus changed events.
                for (let i = 0; i < index; i++) {
                    this._focusPath[i]._focusChange(newFocusedComponent, prevFocusedComponent);
                }
            }
        }

        return true;
    }

    updateFocusSettings() {
        const focusedComponent = this._focusPath[this._focusPath.length - 1];

        // Get focus settings. These can be used for dynamic application-wide settings that depend on the
        // focus directly (such as the application background).
        const focusSettings = {};
        const defaultSetFocusSettings = Component.prototype._setFocusSettings;
        for (let i = 0, n = this._focusPath.length; i < n; i++) {
            if (this._focusPath[i]._setFocusSettings !== defaultSetFocusSettings) {
                this._focusPath[i]._setFocusSettings(focusSettings);
            }
        }

        const defaultHandleFocusSettings = Component.prototype._handleFocusSettings;
        for (let i = 0, n = this._focusPath.length; i < n; i++) {
            if (this._focusPath[i]._handleFocusSettings !== defaultHandleFocusSettings) {
                this._focusPath[i]._handleFocusSettings(focusSettings, this.__prevFocusSettings, focusedComponent);
            }
        }

        this.__prevFocusSettings = focusSettings;
    }

    _handleFocusSettings(settings, prevSettings, focused, prevFocused) {
        // Override to handle focus-based settings.
    }

    __getFocusPath() {
        const path = [this];
        let current = this;
        do {
            const nextFocus = current._getFocused();
            if (!nextFocus || (nextFocus === current)) {
                // Found!;
                break;
            }


            let ptr = nextFocus.cparent;
            if (ptr === current) {
                path.push(nextFocus);
            } else {
                // Not an immediate child: include full path to descendant.
                const newParts = [nextFocus];
                do {
                    if (!ptr) {
                        current._throwError("Return value for _getFocused must be an attached descendant component but its '" + nextFocus.getLocationString() + "'");
                    }
                    newParts.push(ptr);
                    ptr = ptr.cparent;
                } while (ptr !== current);

                // Add them reversed.
                for (let i = 0, n = newParts.length; i < n; i++) {
                    path.push(newParts[n - i - 1]);
                }
            }

            current = nextFocus;
        } while(true);

        return path;
    }

    get focusPath() {
        return this._focusPath;
    }

    /**
     * Injects an event in the state machines, top-down from application to focused component.
     */
    focusTopDownEvent(events, ...args) {
        const path = this.focusPath;
        const n = path.length;

        // Multiple events.
        for (let i = 0; i < n; i++) {
            const event = path[i]._getMostSpecificHandledMember(events);
            if (event !== undefined) {
                const returnValue = path[i][event](...args);
                if (returnValue !== false) {
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * Injects an event in the state machines, bottom-up from focused component to application.
     */
    focusBottomUpEvent(events, ...args) {
        const path = this.focusPath;
        const n = path.length;

        // Multiple events.
        for (let i = n - 1; i >= 0; i--) {
            const event = path[i]._getMostSpecificHandledMember(events);
            if (event !== undefined) {
                const returnValue = path[i][event](...args);
                if (returnValue !== false) {
                    return true;
                }
            }
        }

        return false;
    }

    _receiveKeydown(e) {
        const obj = e;
        if (this.__keymap[e.keyCode]) {
            if (!this.stage.application.focusTopDownEvent(["_capture" + this.__keymap[e.keyCode], "_captureKey"], obj)) {
                this.stage.application.focusBottomUpEvent(["_handle" + this.__keymap[e.keyCode], "_handleKey"], obj)
            }
        } else {
            if (!this.stage.application.focusTopDownEvent(["_captureKey"], obj)) {
                this.stage.application.focusBottomUpEvent(["_handleKey"], obj);
            }
        }
        this.updateFocusPath();
    }

    destroy() {
        if (!this._destroyed) {
            this._destroy();
            this.stage.destroy();
            this._destroyed = true;
        }
    }

    _destroy() {
        // This forces the _detach, _disabled and _active events to be called.
        this.stage.setApplication(undefined);
        this._updateAttachedFlag();
        this._updateEnabledFlag();
    }

    getCanvas() {
        return this.stage.getCanvas();
    }

}

import Stage from "../tree/Stage.mjs";