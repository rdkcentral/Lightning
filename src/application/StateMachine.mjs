export default class StateMachine {

    constructor() {
        StateMachine.setupStateMachine(this);
    }

    static setupStateMachine(target) {
        const targetConstructor = target.constructor;
        const router = StateMachine.create(targetConstructor);
        Object.setPrototypeOf(target, router.prototype);
        target.constructor = targetConstructor;
        target._initStateMachine();
    }

    /**
     * Creates a state machine implementation.
     * It extends the original type and should be used when creating new instances.
     * The original type is available as static property 'original', and it must be used when subclassing as follows:
     * const type = StateMachine.create(class YourNewStateMachineClass extends YourBaseStateMachineClass.original {  })
     * @param {Class} type
     * @returns {StateMachine}
     */
    static create(type) {
        if (!type.hasOwnProperty('_sm')) {
            // Only need to run once.
            const stateMachineType = new StateMachineType(type);
            type._sm = stateMachineType;
        }

        return type._sm.router;
    }

    /**
     * Calls the specified method if it exists.
     * @param {string} event
     * @param {*...} args
     */
    fire(event, ...args) {
        if (this._hasMethod(event)) {
            return this[event](...args);
        }
    }

    /**
     * Returns the current state path (for example "Initialized.Loading").
     * @returns {string}
     * @protected
     */
    _getState() {
        return this._state.__path;
    }

    /**
     * Returns true iff statePath is (an ancestor of) currentStatePath.
     * @param {string} statePath
     * @param {string} currentStatePath
     * @returns {Boolean}
     * @protected
     */
    _inState(statePath, currentStatePath = this._state.__path) {
        const state = this._sm.getStateByPath(statePath);
        const currentState = this._sm.getStateByPath(currentStatePath);
        const level = state.__level;
        const stateAtLevel = StateMachine._getStateAtLevel(currentState, level);
        return (stateAtLevel === state);
    }

    /**
     * Returns true if the specified class member is defined for the currently set state.
     * @param {string} name
     * @returns {boolean}
     * @protected
     */
    _hasMember(name) {
        return !!this.constructor.prototype[name];
    }

    /**
     * Returns true if the specified class member is a method for the currently set state.
     * @param {string} name
     * @returns {boolean}
     * @protected
     */
    _hasMethod(name) {
        const member = this.constructor.prototype[name];
        return !!member && (typeof member === "function")
    }

    /**
     * Switches to the specified state.
     * @param {string} statePath
     *   Substates are seperated by a underscores (for example "Initialized.Loading").
     * @param {*[]} [args]
     *   Args that are supplied in $enter and $exit events.
     * @protected
     */
    _setState(statePath, args) {
        const setStateId = ++this._setStateCounter;
        this._setStateId = setStateId;

        if (this._state.__path !== statePath) {
            // Performance optimization.
            let newState = this._sm._stateMap[statePath];
            if (!newState) {
                // Check for super state.
                newState = this._sm.getStateByPath(statePath);
            }

            const prevState = this._state;

            const hasDifferentEnterMethod = (newState.prototype.$enter !== this._state.prototype.$enter);
            const hasDifferentExitMethod = (newState.prototype.$exit !== this._state.prototype.$exit);
            if (hasDifferentEnterMethod || hasDifferentExitMethod) {
                const sharedState = StateMachine._getSharedState(this._state, newState);
                const context = {
                    newState: newState.__path,
                    prevState: prevState.__path,
                    sharedState: sharedState.__path
                };
                const sharedLevel = sharedState.__level;

                if (hasDifferentExitMethod) {
                    const exitStates = StateMachine._getStatesUntilLevel(this._state, sharedLevel);
                    for (let i = 0, n = exitStates.length; i < n; i++) {
                        this.__setState(exitStates[i]);
                        this._callExit(this._state, args, context);
                        const stateChangeOverridden = (this._setStateId !== setStateId);
                        if (stateChangeOverridden) {
                            return;
                        }
                    }
                }

                if (hasDifferentEnterMethod) {
                    const enterStates = StateMachine._getStatesUntilLevel(newState, sharedLevel).reverse();
                    for (let i = 0, n = enterStates.length; i < n; i++) {
                        this.__setState(enterStates[i]);
                        this._callEnter(this._state, args, context);
                        const stateChangeOverridden = (this._setStateId !== setStateId);
                        if (stateChangeOverridden) {
                            return;
                        }
                    }
                }

            }

            this.__setState(newState);

            if (this._changedState) {
                const context = {
                    newState: newState.__path,
                    prevState: prevState.__path
                };

                if (args) {
                    this._changedState(context, ...args);
                } else {
                    this._changedState(context);
                }
            }

            if (this._onStateChange) {
                const context = {
                    newState: newState.__path,
                    prevState: prevState.__path
                };
                this._onStateChange(context);
            }

        }
    }

    _callEnter(state, args = [], context) {
        const hasParent = !!state.__parent;
        if (state.prototype.$enter) {
            if (!hasParent || (state.__parent.prototype.$enter !== state.prototype.$enter)) {
                state.prototype.$enter.apply(this, [context, ...args]);
            }
        }
    }

    _callExit(state, args = [], context) {
        const hasParent = !!state.__parent;
        if (state.prototype.$exit) {
            if (!hasParent || (state.__parent.prototype.$exit !== state.prototype.$exit)) {
                state.prototype.$exit.apply(this, [context, ...args]);
            }
        }
    }

    __setState(state) {
        this._state = state;
        this._stateIndex = state.__index;
        this.constructor = state;
    }

    _initStateMachine() {
        this._state = null;
        this._stateIndex = 0;
        this._setStateCounter = 0;
        this._sm = this._routedType._sm;
        this.__setState(this._sm.getStateByPath(""));
        const context = {newState: "", prevState: undefined, sharedState: undefined};
        this._callEnter(this._state, [], context);
        this._onStateChange = undefined;
    }

    /**
     * Between multiple member names, select the one specified in the deepest state.
     * If multiple member names are specified in the same deepest state, the first one in the array is returned.
     * @param {string[]} memberNames
     * @returns {string|undefined}
     * @protected
     */
    _getMostSpecificHandledMember(memberNames) {
        let cur = this._state;
        do {
            for (let i = 0, n = memberNames.length; i < n; i++) {
                const memberName = memberNames[i];
                if (!cur.__parent) {
                    if (cur.prototype[memberName]) {
                        return memberName;
                    }
                } else {
                    const alias = StateMachineType.getStateMemberAlias(cur.__path, memberName);
                    if (this[alias]) {
                        return memberName;
                    }
                }
            }
            cur = cur.__parent;
        } while (cur);
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
}

class StateMachineType {

    constructor(type) {
        this._type = type;
        this._router = null;

        this.init();
    }

    get router() {
        return this._router;
    }

    init() {
        this._router = this._createRouter();

        this._stateMap = this._getStateMap();

        this._addStateMemberDelegatorsToRouter();

    }

    _createRouter() {
        const type = this._type;

        const router = class StateMachineRouter extends type {
            constructor() {
                super(...arguments);
                if (!this.constructor.hasOwnProperty('_isRouter')) {
                    throw new Error(`You need to extend ${type.name}.original instead of ${type.name}.`);
                }
            }
        };
        router._isRouter = true;
        router.prototype._routedType = type;
        router.original = type;

        this._mixinStateMachineMethods(router);

        return router;
    }

    _mixinStateMachineMethods(router) {
        // Mixin the state machine methods, so that we reuse the methods instead of re-creating them.
        const names = Object.getOwnPropertyNames(StateMachine.prototype);
        for (let i = 0, n = names.length; i < n; i++) {
            const name = names[i];
            if (name !== "constructor") {
                const descriptor = Object.getOwnPropertyDescriptor(StateMachine.prototype, name);
                Object.defineProperty(router.prototype, name, descriptor);
            }
        }
    }

    _addStateMemberDelegatorsToRouter() {
        const members = this._getAllMemberNames();

        members.forEach(member => {
            this._addMemberRouter(member);
        });
    }

    /**
     * @note We are generating code because it yields much better performance.
     */
    _addMemberRouter(member) {
        const statePaths = Object.keys(this._stateMap);
        const descriptors = [];
        const aliases = [];
        statePaths.forEach((statePath, index) => {
            const state = this._stateMap[statePath];
            const descriptor = this._getDescriptor(state, member);
            if (descriptor) {
                descriptors[index] = descriptor;

                // Add to prototype.
                const alias = StateMachineType.getStateMemberAlias(descriptor._source.__path, member);
                aliases[index] = alias;

                if (!this._router.prototype.hasOwnProperty(alias)) {
                    Object.defineProperty(this._router.prototype, alias, descriptor);
                }
            } else {
                descriptors[index] = null;
                aliases[index] = null;
            }
        });

        let type = undefined;
        descriptors.forEach(descriptor => {
            if (descriptor) {
                const descType = this._getDescriptorType(descriptor);
                if (type && (type !== descType)) {
                    console.warn(`Member ${member} in ${this._type.name} has inconsistent types.`);
                    return;
                }
                type = descType;
            }
        });

        switch(type) {
            case "method":
                this._addMethodRouter(member, descriptors, aliases);
                break;
            case "getter":
                this._addGetterSetterRouters(member);
                break;
            case "property":
                console.warn("Fixed properties are not supported; please use a getter instead!")
                break;
        }
    }

    _getDescriptor(state, member, isValid = () => true) {
        let type = state;
        let curState = state;

        do {
            const descriptor = Object.getOwnPropertyDescriptor(type.prototype, member);
            if (descriptor) {
                if (isValid(descriptor)) {
                    descriptor._source = curState;
                    return descriptor;
                }
            }
            type = Object.getPrototypeOf(type);
            if (type && type.hasOwnProperty('__state')) {
                curState = type;
            }
        } while(type && type.prototype);
        return undefined;
    }

    _getDescriptorType(descriptor) {
        if (descriptor.get || descriptor.set) {
            return 'getter';
        } else {
            if (typeof descriptor.value === "function") {
                return 'method';
            } else {
                return 'property';
            }
        }
    }

    static _supportsSpread() {
        if (this.__supportsSpread === undefined) {
            this.__supportsSpread = false;
            try {
                const func = new Function("return [].concat(...arguments);");
                func();
                this.__supportsSpread = true;
            } catch(e) {}
        }
        return this.__supportsSpread;
    }

    _addMethodRouter(member, descriptors, aliases) {
        const code = [
            // The line ensures that, while debugging, your IDE won't open many tabs.
            "//@ sourceURL=StateMachineRouter.js",
            "const i = this._stateIndex;"
        ];
        let cur = aliases[0];
        const supportsSpread = StateMachineType._supportsSpread();
        for (let i = 1, n = aliases.length; i < n; i++) {
            const alias = aliases[i];
            if (alias !== cur) {
                if (cur) {
                    if (supportsSpread) {
                        code.push(`if (i < ${i}) return this["${cur}"](...arguments); else`);
                    } else {
                        code.push(`if (i < ${i}) return this["${cur}"].apply(this, arguments); else`);
                    }
                } else {
                    code.push(`if (i < ${i}) return ; else`);
                }
            }
            cur = alias;
        }
        if (cur) {
            if (supportsSpread) {
                code.push(`return this["${cur}"](...arguments);`);
            } else {
                code.push(`return this["${cur}"].apply(this, arguments);`);
            }
        } else {
            code.push(`;`);
        }
        const functionBody = code.join("\n");
        const router = new Function([], functionBody);

        const descriptor = {value: router};
        Object.defineProperty(this._router.prototype, member, descriptor);
    }

    _addGetterSetterRouters(member) {
        const getter = this._getGetterRouter(member);
        const setter = this._getSetterRouter(member);
        const descriptor = {
            get: getter,
            set: setter
        };
        Object.defineProperty(this._router.prototype, member, descriptor);
    }

    _getGetterRouter(member) {
        const statePaths = Object.keys(this._stateMap);
        const descriptors = [];
        const aliases = [];
        statePaths.forEach((statePath, index) => {
            const state = this._stateMap[statePath];
            const descriptor = this._getDescriptor(state, member, (descriptor => descriptor.get));
            if (descriptor) {
                descriptors[index] = descriptor;

                // Add to prototype.
                const alias = StateMachineType.getStateMemberAlias(descriptor._source.__path, member);
                aliases[index] = alias;

                if (!this._router.prototype.hasOwnProperty(alias)) {
                    Object.defineProperty(this._router.prototype, alias, descriptor);
                }
            } else {
                descriptors[index] = null;
                aliases[index] = null;
            }
        });

        const code = [
            // The line ensures that, while debugging, your IDE won't open many tabs.
            "//@ sourceURL=StateMachineRouter.js",
            "const i = this._stateIndex;"
        ];
        let cur = aliases[0];
        for (let i = 1, n = aliases.length; i < n; i++) {
            const alias = aliases[i];
            if (alias !== cur) {
                if (cur) {
                    code.push(`if (i < ${i}) return this["${cur}"]; else`);
                } else {
                    code.push(`if (i < ${i}) return ; else`);
                }
            }
            cur = alias;
        }
        if (cur) {
            code.push(`return this["${cur}"];`);
        } else {
            code.push(`;`);
        }
        const functionBody = code.join("\n");
        const router = new Function([], functionBody);
        return router;
    }

    _getSetterRouter(member) {
        const statePaths = Object.keys(this._stateMap);
        const descriptors = [];
        const aliases = [];
        statePaths.forEach((statePath, index) => {
            const state = this._stateMap[statePath];
            const descriptor = this._getDescriptor(state, member, (descriptor => descriptor.set));
            if (descriptor) {
                descriptors[index] = descriptor;

                // Add to prototype.
                const alias = StateMachineType.getStateMemberAlias(descriptor._source.__path, member);
                aliases[index] = alias;

                if (!this._router.prototype.hasOwnProperty(alias)) {
                    Object.defineProperty(this._router.prototype, alias, descriptor);
                }
            } else {
                descriptors[index] = null;
                aliases[index] = null;
            }
        });

        const code = [
            // The line ensures that, while debugging, your IDE won't open many tabs.
            "//@ sourceURL=StateMachineRouter.js",
            "const i = this._stateIndex;"
        ];
        let cur = aliases[0];
        for (let i = 1, n = aliases.length; i < n; i++) {
            const alias = aliases[i];
            if (alias !== cur) {
                if (cur) {
                    code.push(`if (i < ${i}) this["${cur}"] = arg; else`);
                } else {
                    code.push(`if (i < ${i}) ; else`);
                }
            }
            cur = alias;
        }
        if (cur) {
            code.push(`this["${cur}"] = arg;`);
        } else {
            code.push(`;`);
        }
        const functionBody = code.join("\n");
        const router = new Function(["arg"], functionBody);
        return router;
    }

    static getStateMemberAlias(path, member) {
        return "$" + (path ? path + "." : "") + member;
    }

    _getAllMemberNames() {
        const stateMap = this._stateMap;
        const map = Object.keys(stateMap);
        let members = new Set();
        map.forEach(statePath => {
            if (statePath === "") {
                // Root state can be skipped: if the method only occurs in the root state, we don't need to re-delegate it based on state.
                return;
            }
            const state = stateMap[statePath];
            const names = this._getStateMemberNames(state);
            names.forEach(name => {
                members.add(name);
            })
        });
        return [...members];
    }

    _getStateMemberNames(state) {
        let type = state;
        let members = new Set();
        const isRoot = this._type === state;
        do {
            const names = this._getStateMemberNamesForType(type);
            names.forEach(name => {
                members.add(name)
            });

            type = Object.getPrototypeOf(type);
        } while(type && type.prototype && (!type.hasOwnProperty("__state") || isRoot));

        return members;
    }

    _getStateMemberNamesForType(type) {
        const memberNames = Object.getOwnPropertyNames(type.prototype);
        return memberNames.filter(memberName => {
            return (memberName !== "constructor") && !StateMachineType._isStateLocalMember(memberName);
        });
    }

    static _isStateLocalMember(memberName) {
        return (memberName === "$enter") || (memberName === "$exit");
    }

    getStateByPath(statePath) {
        if (this._stateMap[statePath]) {
            return this._stateMap[statePath];
        }

        // Search for closest match.
        const parts = statePath.split(".");
        while(parts.pop()) {
            const statePath = parts.join(".");
            if (this._stateMap[statePath]) {
                return this._stateMap[statePath];
            }
        }
    }

    _getStateMap() {
        if (!this._stateMap) {
            this._stateMap = this._createStateMap();
        }
        return this._stateMap;
    }

    _createStateMap() {
        const stateMap = {};
        this._addState(this._type, null, "", stateMap);
        return stateMap;
    }

    _addState(state, parentState, name, stateMap) {
        state.__state = true;
        state.__name = name;

        this._addStaticStateProperty(state, parentState);

        const parentPath = (parentState ? parentState.__path : "");
        let path = (parentPath ? parentPath + "." : "") + name;
        state.__path = path;
        state.__level = parentState ? parentState.__level + 1 : 0;
        state.__parent = parentState;
        state.__index = Object.keys(stateMap).length;
        stateMap[path] = state;

        const states = state._states;
        if (states) {
            const isInheritedFromParent = (parentState && parentState._states === states);
            if (!isInheritedFromParent) {
                const subStates = state._states();
                subStates.forEach(subState => {
                    const stateName = StateMachineType._getStateName(subState);
                    this._addState(subState, state, stateName, stateMap);
                });
            }
        }
    }

    static _getStateName(state) {
        const name = state.name;

        const index = name.indexOf('$');
        if (index > 0) {
            // Strip off rollup name suffix.
            return name.substr(0, index);
        }

        return name;
    }

    _addStaticStateProperty(state, parentState) {
        if (parentState) {
            const isClassStateLevel = parentState && !parentState.__parent;
            if (isClassStateLevel) {
                this._router[state.__name] = state;
            } else {
                parentState[state.__name] = state;
            }
        }
    }

}