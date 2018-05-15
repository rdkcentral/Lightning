class StateManager {

    constructor() {
        this._fireLevel = 0
        this._logPrefix = ""
        this._debug = false
    }

    get debug() {
        return this._debug
    }

    set debug(v) {
        this._debug = v
    }

    /**
     * Fires the specified event on the state machine.
     * @param {Component} component
     * @param {string|object[]} event
     *   Either a single event, or an array of events ({event: 'name', args: *}.
     *   In case of an array, the event is fired that had a match in the deepest state.
     *   If multiple events match in the deepest state, the first specified one has priority.
     * @param {*} args
     * @return {boolean}
     *   True iff the state machine could find and execute a handler for the event (event and condition matched).
     */
    fire(component, event, args) {
        // After an event is fired (by external means), the action may cause other events to be triggered. We
        // distinguish between primary and indirect events because we have to perform some operations after primary
        // events only.

        // Purely for logging.
        const primaryEvent = (this._fireLevel === 0)
        this._fireLevel++

        if (this.debug) {
            if (!primaryEvent) {
                this._logPrefix += " "
            } else {
                this._logPrefix = ""
            }
        }

        let found
        if (Array.isArray(event)) {
            found = this._mfire(component, event, args)
        } else {
            found = this._fire(component, event, args)
        }

        if (found && primaryEvent) {
            // Update focus.
            component.application.__updateFocus()
        }

        this._fireLevel--

        if (this.debug) {
            this._logPrefix = this._logPrefix.substr(0, this._logPrefix.length - 1)
        }

        return !!found
    }

    _fire(component, event, args) {
        if (Utils.isUcChar(event.charCodeAt(0))) {
            component._throwError("Event may not start with an upper case character: " + event)
        }

        const paths = this._getStatePaths(component, component.state)
        for (let i = 0, n = paths.length; i < n; i++) {
            const result = this._attemptFirePathEvent(component, paths[i], event, args)
            if (result) {
                return result
            }
        }
    }

    _mfire(component, events) {
        const paths = this._getStatePaths(component, component.state)
        for (let j = 0, m = paths.length; j < m; j++) {
            for (let i = 0, n = events.length; i < n; i++) {
                const result = this._attemptFirePathEvent(component, paths[j], events[i].event, events[i].args)
                if (result) {
                    return result
                }
            }
        }
    }

    _attemptFirePathEvent(component, path, event, args) {
        const result = StateManager._getStateAction(path, event)
        if (result) {
            let validAction = (result.s !== undefined)
            let newState = result.s
            if (result.a) {
                try {
                    if (this.debug) {
                        console.log(`${this._logPrefix}${component.constructor.name} "${component.state}".${event} ${component.getLocationString()}`)
                    }
                    newState = result.a.call(component, args)
                    validAction = (newState !== false)
                    if (!validAction) {
                        if (this.debug) {
                            console.log(`${this._logPrefix}[PASS THROUGH]`)
                        }
                    }
                } catch(e) {
                    console.error(e)
                }
            }
            if (validAction) {
                result.event = event
                result.args = args
                result.s = newState
                result.p = path

                const prevState = component.state

                if (Utils.isString(newState)) {
                    this._setState(component, StateManager._ucfirst(newState), {event: event, args: args, prevState: prevState, newState: newState})
                }

                return result
            }
        }
    }

    static _ucfirst(str) {
        return str.charAt(0).toUpperCase() + str.substr(1)
    }

    _getStatePaths(component, state) {
        const states = component._getStates()

        if (state == "") return [states]
        const parts = state.split(".")

        let cursor = states
        const path = [cursor]
        for (let i = 0, n = parts.length; i < n; i++) {
            const key = StateManager._ucfirst(parts[i])
            if (!cursor.hasOwnProperty(key)) {
                component._throwError("State path not found: '" + state + "'")
            }
            cursor = cursor[key]
            path.push(cursor)
        }
        return path.reverse()
    }

    /**
     * Returns the active's edge action and state.
     * @param {string} state
     * @param event
     * @return {object}
     * @private
     */
    static _getStateAction(state, event) {
        if (!state.hasOwnProperty(event)) {
            return null
        }
        const def = state[event]

        if (Utils.isFunction(def)) {
            // Action.
            return {a: def, s: undefined}
        } else if (Utils.isString(def)) {
            // State.
            return {a: undefined, s: def}
        }

        return null
    }


    _setState(component, newState, eargs) {
        if (this.debug) {
            console.log(`${this._logPrefix}╚>"${newState !== component.state ? newState : ""}"`)
        }

        if (newState !== component.state) {
            this._fireLevel++
            if (this.debug) {
                this._logPrefix += " "
            }

            const paths = this._getStatePaths(component, component.state)

            // Switch state to new state.
            const newPaths = this._getStatePaths(component, newState)

            const info = StateManager._compareStatePaths(paths, newPaths)
            const exit = info.exit.reverse()
            const enter = info.enter
            const state = component.state
            for (let i = 0, n = exit.length; i < n; i++) {
                component.__state = StateManager._getSuperState(state, i)
                const def = StateManager._getStateAction(exit[i], "_exit")
                if (def) {
                    if (this.debug) {
                        console.log(`${this._logPrefix}${component.constructor.name} "${component.state}"._exit ${component.getLocationString()}`)
                    }
                    let stateSwitch = StateManager._executeAction(def, component, eargs)
                    if (stateSwitch === false) {
                        if (this.debug) {
                            console.log(`${this._logPrefix}[CANCELED]`)
                        }
                    } else if (stateSwitch) {
                        const info = this._setState(
                            component,
                            stateSwitch,
                            eargs
                        )

                        this._fireLevel--
                        if (this.debug) {
                            this._logPrefix = this._logPrefix.substr(0, this._logPrefix.length - 1)
                        }

                        return info
                    }
                }
            }

            for (let i = 0, n = enter.length; i < n; i++) {
                component.__state = StateManager._getSuperState(newState, (n - (i + 1)))
                const def = StateManager._getStateAction(enter[i], "_enter")
                if (def) {
                    if (this.debug) {
                        console.log(`${this._logPrefix}${component.constructor.name} "${newState}"._enter ${component.getLocationString()}`)
                    }
                    let stateSwitch = StateManager._executeAction(def, component, eargs)
                    if (stateSwitch === false) {
                        if (this.debug) {
                            console.log(`${this._logPrefix}[CANCELED]`)
                        }
                    } else if (stateSwitch) {
                        const info = this._setState(
                            component,
                            stateSwitch,
                            eargs
                        )

                        this._fireLevel--
                        if (this.debug) {
                            this._logPrefix = this._logPrefix.substr(0, this._logPrefix.length - 1)
                        }

                        return info
                    }
                }
            }

            this._fireLevel--
            if (this.debug) {
                this._logPrefix = this._logPrefix.substr(0, this._logPrefix.length - 1)
            }
        }

    }

    static _executeAction(action, component, args) {
        let newState
        if (action.a) {
            newState = action.a.call(component, args)
        }
        if (newState === undefined) {
            newState = action.s
        }
        return newState
    }

    static _getSuperState(state, levels) {
        if (levels === 0) {
            return state
        }
        return state.split(".").slice(0, -levels).join(".")
    }

    /**
     * Returns the exit states and enter states when switching states (in natural branch order).
     */
    static _compareStatePaths(current, newPaths) {
        current = current.reverse()
        newPaths = newPaths.reverse()
        const n = Math.min(current.length, newPaths.length)
        let pos
        for (pos = 0; pos < n; pos++) {
            if (current[pos] !== newPaths[pos]) break
        }

        return {exit: current.slice(pos), enter: newPaths.slice(pos)}
    }

}

module.exports = StateManager

const Utils = require('../tree/Utils')