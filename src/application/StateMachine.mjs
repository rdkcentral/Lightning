export default class StateMachine {

    constructor(config) {
        this._initStateMachine(config);
    }

    /**
     * Initializes the state machine instance on the target.
     * @param {object} [config]
     */
    _initStateMachine(config) {
        this._type = this.constructor;
        this._currentState = this._sm_getStateByPath("");
        this._setStateCounter = 0;
        this._sm_config = config;

        const context = {newState: "", prevState: null, sharedState: null, currentFire: null};
        this._sm_callEnter(this._currentState, [], context);
    }

    /**
     * Returns the current state path (for example "Initialized_Loading").
     * @returns {string}
     */
    _getState() {
        return this._currentState.__path;
    }

    /**
     * Returns true iff statePath is (an ancestor of) currentStatePath.
     * @param {string} statePath
     * @param {string} currentStatePath
     * @returns {Boolean}
     */
    _inState(statePath, currentStatePath = this._currentState.__path) {
        const state = this._sm_getStateByPath(statePath);
        const currentState = this._sm_getStateByPath(currentStatePath);
        const level = state.__level;
        const stateAtLevel = StateMachine._getStateAtLevel(currentState, level);
        return (stateAtLevel === state);
    }
    
    _getCurrentFire() {
        return this._currentFire;
    }

    /**
     * Fires the specified event on the state machine.
     * @param {string} event
     * @param {*[]} [args];
     * @param {string} [statePath]
     *   The state path to call fire on. By default, the current path.
     * @return {*}
     *   The return value of the matching event handler.
     */
    _fire(event, args = [], statePath = undefined) {
        const state = statePath !== undefined ? this._sm_getStateByPath(statePath) : this._currentState;
        const handlerInfo = state[event];
        if (handlerInfo) {
            const prevCurrentFire = this._currentFire;
            const currentFire = {s: handlerInfo.s, e: event, a: args, m: handlerInfo.m};
            this._currentFire = currentFire;

            const currentFireLevel = this._fireLevel;

            let result;

            try {
                this._sm_preFire();

                // DEBUGGING? Step in here for the handler!
                result = handlerInfo.m.apply(this, args);

                if (result === StateMachine.FIRE_NOT_HANDLED) {
                    if (this._sm_debug()) console.log(`${StateMachine._getLogPrefix()}[FIRE_NOT_HANDLED]`);
                    const parentState = handlerInfo.s.__parent;
                    if (parentState) {
                        result = this._fire(event, args, parentState.__path);
                    }
                }

                this._currentFire = prevCurrentFire;

                this._sm_postFire(currentFire);
            } finally {
                // Make sure that the fire level is recovered (even if there were errors).
                this._fireLevel = currentFireLevel;
            }

            return result;
        } else {
            if (handlerInfo === undefined) {
                // This will make lookups faster in the future.
                this._type._sm_rootState[event] = null;
            }
            return StateMachine.FIRE_NOT_HANDLED;
        }
    }

    /**
     * Fires the specified event on the state machine.
     * @param {object[]} events
     *   Either a single event, or an array of events ({event: 'name', args: *}.
     *   The event is fired that has a match in the deepest state.
     *   If multiple events match in the deepest state, the first specified one has priority.
     * @param {string} [statePath]
     *   The state path to call fire on. By default, the current path.
     * @return {*}
     *   The return value of the matching event handler.
     */
    _fireMultiple(events, statePath = undefined) {
        const state = statePath !== undefined ? this._sm_getStateByPath(statePath) : this._currentState;

        const handlerState = this._sm_getDeepestHandlerState(events, state);
        if (handlerState) {
            for (let i = 0, n = events.length; i < n; i++) {
                const event = events[i].event;
                const handlerInfo = state[event];
                if (handlerInfo && handlerInfo.s === handlerState) {
                    const result = this._fire(event, events[i].args, state.__path);
                    if (result !== StateMachine.FIRE_NOT_HANDLED) {
                        return result;
                    }
                }
            }

            if (handlerState.__parent) {
                // All handlers for this level returned FIRE_NOT_HANDLED, so try parent as well.
                return this._fireMultiple(events, handlerState);
            }
        }
        return StateMachine.FIRE_NOT_HANDLED;
    }

    /**
     * Switches to the specified state.
     * @param {string} statePath
     *   Substates are seperated by a underscores (for example "Initialized_Loading").
     * @param {*[]} [args]
     *   Args that are supplied in $enter and $exit events.
     */
    _setState(statePath, args = []) {
        const setStateId = ++this._setStateCounter;
        this._setStateId = setStateId;

        if (this._currentState.__path !== statePath) {
            if (this._sm_debug()) console.log(`${StateMachine._getLogPrefix()} ╚>${statePath}`);

            const newState = this._sm_getStateByPath(statePath);
            const sharedState = StateMachine._getSharedState(this._currentState, newState);

            const sharedLevel = sharedState.__level;
            const exitStates = StateMachine._getStatesUntilLevel(this._currentState, sharedLevel);
            const enterStates = StateMachine._getStatesUntilLevel(newState, sharedLevel).reverse();

            const context = {newState: newState.__path, prevState: this._currentState.__path, sharedState: sharedState.__path, currentFire: this._currentFire};

            for (let i = 0, n = exitStates.length; i < n; i++) {
                this._currentState = exitStates[i];
                this._sm_callExit(this._currentState, args, context);
                const stateChangeOverridden = (this._setStateId !== setStateId);
                if (stateChangeOverridden) {
                    return;
                }
            }

            for (let i = 0, n = enterStates.length; i < n; i++) {
                this._currentState = enterStates[i];
                this._sm_callEnter(this._currentState, args, context);
                const stateChangeOverridden = (this._setStateId !== setStateId);
                if (stateChangeOverridden) {
                    return;
                }
            }

            this._currentState = newState;
            this._fire('changedState', [args, context]);
        }
    }

    _sm_getDeepestHandlerState(events, state) {
        let result;
        for (let i = 0, n = events.length; i < n; i++) {
            const event = events[i].event;
            const handlerInfo = state[event];
            if (handlerInfo) {
                const eventLevel = handlerInfo.s.__level;
                if (!result || eventLevel < result.__level) {
                    result = handlerInfo.s;
                }
            }
        }
        return result;
    }

    get FIRE_NOT_HANDLED() {
        return StateMachine.FIRE_NOT_HANDLED;
    }

    static _getLogPrefix(char = "║") {
        let v = char;
        for (let i = 0; i < StateMachine._fireLevel - 1; i++) {
            v = v + " ";
        }
        return v;
    }

    _sm_getExtraLogInfo() {
        const infoFunction = this._sm_getLogInfoFunction();
        if (this._sm_getLogInfoFunction()) {
            return infoFunction.apply(this, []);
        } else {
            return "";
        }
    }

    _sm_preFire() {
        StateMachine._fireLevel++;
        if (this._sm_debug()) console.log(`${StateMachine._getLogPrefix(StateMachine._fireLevel === 1 ? "╬" : "║")} FIRE ${this._currentFire.e} (state "${this._currentState.__path}") [${this._currentFire.m.name}] @ "${this._type.name} ${this._sm_getExtraLogInfo()}"`);
    }

    _sm_postFire(currentFire) {
        StateMachine._fireLevel--;

        if (StateMachine._fireLevel === 0) {
            const func = this._sm_getOnAfterPrimaryFire();
            if (func) {
                func.apply(this, [currentFire]);
            }
        }
    }

    _sm_callEnter(state, args, context) {
        const p = state.__path;
        const methodName = `\$${p ? p + "_" : ""}enter`;
        if (this[methodName]) {
            this[methodName]({args, context});
        }
    }

    _sm_callExit(state, args, context) {
        const p = state.__path;
        const methodName = `\$${p ? p + "_" : ""}exit`;
        if (this[methodName]) {
            this[methodName]({args, context});
        }
    }

    _sm_getStateByPath(statePath) {
        const map = StateMachine._getStateMap(this._type);
        if (map[statePath]) {
            return map[statePath];
        } else {
            return StateMachine._ensureState(this._type, statePath);
        }
    }

    _getConfig(name) {
        if (this._sm_config) {
            if (this._sm_config.hasOwnProperty(name)) {
                return this._sm_config[name];
            }
        }

        if (this._type._sm_config) {
            if (this._type._sm_config.hasOwnProperty(name)) {
                return this._type._sm_config[name];
            }
        }
    }

    _sm_debug() {
        return this._getConfig('debug');
    }

    _sm_getLogInfoFunction() {
        return this._getConfig('logInfoFunction');
    }

    _sm_getOnAfterPrimaryFire() {
        return this._getConfig('onAfterPrimaryFire');
    }

    static _getStatesUntilLevel(state, level) {
        const states = [];
        while (state.__level > level) {
            states.push(state);
            state = state.__parent;
        }
        return states;
    }

    static _getSharedState(state1, state2) {
        const state1Array = StateMachine._getAncestorStates(state1);
        const state2Array = StateMachine._getAncestorStates(state2);
        const n = Math.min(state1Array.length, state2Array.length);
        for (let i = 0; i < n; i++) {
            if (state1Array[i] !== state2Array[i]) {
                return state1Array[i - 1];
            }
        }
        return state1Array[n - 1];
    }

    static _getAncestorStates(state) {
        const result = [];
        do {
            result.push(state);
        } while(state = state.__parent);
        return result.reverse();
    }

    static _getStateAtLevel(state, level) {
        if (level > state.__level) {
            return undefined;
        }

        while(level < state.__level) {
            state = state.__parent;
        }
        return state;
    }

    static _getStateMap(type) {
        if (type.hasOwnProperty('_sm_stateMap')) {
            return type._sm_stateMap;
        }

        // We always need a 'root' state.
        type._sm_stateMap = {};
        type._sm_rootState = this._addState(type, null, "");
        this._fillStateMapRecursive(type);
        return type._sm_stateMap;
    }

    static _fillStateMapRecursive(type) {
        const names = this._getPropertyEventMethodNames(type);
        for (let i = 0, n = names.length; i < n; i++) {
            const name = names[i];
            const parts = name.substr(1).split("_");
            const event = parts.pop();
            const statePath = parts.join("_");
            let state;
            if (statePath !== "") {
                state = this._ensureState(type, statePath);
            } else {
                state = type._sm_rootState;
            }
            const method = type.prototype[name];
            state[event] = {m: method, s: state};
        }
    }

    static _getPropertyEventMethodNames(type) {
        const properties = [];

        let current = type;
        while(current.prototype) {
            const names = Object.getOwnPropertyNames(current.prototype);
            for (let i = 0, n = names.length; i < n; i++) {
                const name = names[i];
                const isEventHandler = name.charAt(0) === "$" && (name.length > 0);
                if (isEventHandler) {
                    properties.push(name);
                }
            }
            current = Object.getPrototypeOf(current);
        }

        return properties;
    }

    static _ensureState(type, statePath) {
        let result = type._sm_stateMap[statePath];
        if (!result) {
            const statePathArray = statePath.split("_");
            let current = type._sm_rootState;
            let currentPath = "";
            for (let i = 0, n = statePathArray.length; i < n; i++) {
                currentPath += (currentPath ? "_" : "") + statePathArray[i];
                let sub = type._sm_stateMap[currentPath];
                if (!sub) {
                    sub = this._addState(type, current, statePathArray[i]);
                }
                current = sub;
            }
            result = current;
        }
        return result;
    }

    static _addState(type, parentState, name) {
        const newState = Object.create(parentState);
        newState.__name = name;
        newState.__subs = {};
        if (parentState) {
            parentState.__subs[name] = newState;
        }
        const parentPath = (parentState ? parentState.__path : "");
        let path = (parentPath ? parentPath + "_" : "") + name;
        newState.__path = path;
        newState.__level = parentState ? parentState.__level + 1 : 0;
        newState.__parent = parentState;
        type._sm_stateMap[path] = newState;
        return newState;
    }

    static mixin(type, config) {
        type._sm_config = config;

        const names = Object.getOwnPropertyNames(StateMachine.prototype);
        for (let i = 0, n = names.length; i < n; i++) {
            const name = names[i];
            if (name !== "constructor") {
                const descriptor = Object.getOwnPropertyDescriptor(StateMachine.prototype, name);
                Object.defineProperty(type.prototype, name, descriptor);
            }
        }
    }

}

StateMachine._fireLevel = 0;
StateMachine._lastPrimaryFireId = 0;
StateMachine.FIRE_NOT_HANDLED = Symbol("FIRE_NOT_HANDLED");