/*
 * If not stated otherwise in this file or this component's LICENSE file the
 * following copyright and licenses apply:
 *
 * Copyright 2020 RDK Management
 *
 * Licensed under the Apache License, Version 2.0 (the License);
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * This is a partial (and more efficient) implementation of the event emitter.
 * It attempts to maintain a one-to-one mapping between events and listeners, skipping an array lookup.
 * Only if there are multiple listeners, they are combined in an array.
 */
export default class EventEmitter {

    constructor() {
        // This is set (and kept) to true when events are used at all.
        this._hasEventListeners = false;
    }

    on(name, listener) {
        if (!this._hasEventListeners) {
            this._eventFunction = {};
            this._eventListeners = {};
            this._hasEventListeners = true;
        }

        const current = this._eventFunction[name];
        if (!current) {
            this._eventFunction[name] = { on: listener };
        } else if (!current.on) {
            this._eventFunction[name] = { ...current, on: listener };
        } else {
            if (this._eventFunction[name].on !== EventEmitter.combiner) {
                this._eventListeners[name] = { ...this._eventListeners[name], on: [this._eventFunction[name].on, listener] };
                this._eventFunction[name].on = EventEmitter.combiner;
            } else {
                this._eventListeners[name].on.push(listener);
            }
        }
    }

    once(name, listener) {
        if (!this._hasEventListeners) {
            this._eventFunction = {}
            this._eventListeners = {}
            this._hasEventListeners = true;
        }

        const current = this._eventFunction[name];
        if (!current) {
            this._eventFunction[name] = { once: listener };
        } else if (!current.once) {
            this._eventFunction[name] = { ...current, once: listener };
        } else {
            if (this._eventFunction[name].once !== EventEmitter.combiner) {
                this._eventListeners[name] = { ...this._eventListeners[name], once: [this._eventFunction[name].once, listener] };
                this._eventFunction[name].once = EventEmitter.combiner;
            } else {
                this._eventListeners[name].once.push(listener);
            }
        }
    }

    has(name, listener) {
        if (this._hasEventListeners) {
            const hasWithType = (type) => {
                const current = this._eventFunction[name][type];
                if (current) {
                    if (current === EventEmitter.combiner) {
                        const listeners = this._eventListeners[name][type];
                        let index = listeners.indexOf(listener);
                        return (index >= 0);
                    } else if (this._eventFunction[name][type] === listener) {
                        return true;
                    } else {
                        return false;
                    }
                } else {
                    return false;
                }
            };

            return hasWithType('on') || hasWithType('once');
        }
        return false;
    }

    off(name, listener) {
        if (this._hasEventListeners) {
            const offWithType = (type) => {
                const current = this._eventFunction[name][type];
                const otherType = type === 'on' ? 'once' : 'on';

                if (current) {
                    if (current === EventEmitter.combiner) {
                        const listeners = this._eventListeners[name][type];
                        let index = listeners.indexOf(listener);
                        if (index >= 0) {
                            listeners.splice(index, 1);
                        }
                        if (listeners.length === 1) {
                            this._eventFunction[name][type] = listeners[0];
                            delete this._eventListeners[name];
                        }
                    } else if (this._eventFunction[name][type] === listener) {
                        if (this._eventFunction[name][otherType]) {
                            this._eventFunction[name][type] = undefined;
                        } else {
                            this._eventFunction = undefined;
                            this._hasEventListeners = false;
                        }
                    }
                }
            }
            offWithType('on');
            offWithType('once');
        }
    }

    removeListener(name, listener) {
        this.off(name, listener);
    }

    emit(name, arg1, arg2, arg3) {
        if (this._hasEventListeners && this._eventFunction[name]) {
            const onFunc = this._eventFunction[name].on;
            const onceFunc = this._eventFunction[name].once;
            if (onFunc) {
                if (onFunc === EventEmitter.combiner) {
                    onFunc(this, name, arg1, arg2, arg3);
                } else {
                    onFunc(arg1, arg2, arg3);
                }
            }
            if (onceFunc) {
                if (onceFunc === EventEmitter.combiner) {
                    onceFunc(this, name, arg1, arg2, arg3);
                    this._eventListeners[name].once.forEach(
                        listener => this.off(name, listener)
                    );
                    // After n-1 listener, last listener is moved to eventFunction
                    this.off(name, this._eventFunction[name].once);
                } else {
                    onceFunc(arg1, arg2, arg3);
                    this.off(name, onceFunc);
                }
            }
        }
    }

    listenerCount(name) {
        if (this._hasEventListeners) {
            const countWithType = (type) => {
                const func = this._eventFunction[name];
                if (func && func[type]) {
                    if (func[type] === EventEmitter.combiner) {
                        return this._eventListeners[name][type].length;
                    } else {
                        return 1;
                    }
                } else {
                    return 0;
                }
            }
            return countWithType('on') + countWithType('once');
        } else {
            return 0;
        }
    }

    removeAllListeners(name) {
        if (this._hasEventListeners) {
            delete this._eventFunction[name];
            delete this._eventListeners[name];
            this._hasEventListeners = false;
        }
    }

}

EventEmitter.combiner = function(object, name, arg1, arg2, arg3) {
    const onListeners = object._eventListeners[name].on;
    const onceListeners = object._eventListeners[name].once;
    if (onListeners) {
        // Because listener may detach itself while being invoked, we use a forEach instead of for loop.
        onListeners.forEach((listener) => {
            listener(arg1, arg2, arg3);
        });
    }
    if (onceListeners) {
        // Because listener may detach itself while being invoked, we use a forEach instead of for loop.
        onceListeners.forEach((listener) => {
            listener(arg1, arg2, arg3);
        });
    }
}

EventEmitter.addAsMixin = function(cls) {
    cls.prototype.on = EventEmitter.prototype.on;
    cls.prototype.once = EventEmitter.prototype.once;
    cls.prototype.has = EventEmitter.prototype.has;
    cls.prototype.off = EventEmitter.prototype.off;
    cls.prototype.removeListener = EventEmitter.prototype.removeListener;
    cls.prototype.emit = EventEmitter.prototype.emit;
    cls.prototype.listenerCount = EventEmitter.prototype.listenerCount;
    cls.prototype.removeAllListeners = EventEmitter.prototype.removeAllListeners;
}

