/**
 * Copyright Metrological, 2017
 */
class Utils {
    static isFunction(value) {
        return typeof value === 'function';
    }

    static isNumber(value) {
        return typeof value === 'number';
    }

    static isInteger(value) {
        return (typeof value === 'number' && (value % 1) === 0);
    }

    static isBoolean(value) {
        return value === true || value === false;
    }

    static isString(value) {
        return typeof value == 'string';
    }

    static cloneObj(obj) {
        let keys = Object.keys(obj);
        let clone = {}
        for (let i = 0; i < keys.length; i++) {
            clone[keys[i]] = obj[keys[i]];
        }
        return clone;
    }

    static merge(obj1, obj2) {
        let keys = Object.keys(obj2);
        for (let i = 0; i < keys.length; i++) {
            obj1[keys[i]] = obj2[keys[i]];
        }
        return obj1;
    }

    static isObject(value) {
        let type = typeof value;
        return !!value && (type == 'object' || type == 'function');
    }

    static isPlainObject(value) {
        let type = typeof value;
        return !!value && (type == 'object');
    }

    static isObjectLiteral(value){
        return typeof value === 'object' && value && value.constructor === Object
    }

    static getArrayIndex(index, arr) {
        return Utils.getModuloIndex(index, arr.length);
    }

    static getModuloIndex(index, len) {
        if (len == 0) return index;
        while (index < 0) {
            index += Math.ceil(-index / len) * len;
        }
        index = index % len;
        return index;
    }

    static getDeepClone(obj) {
        let i, c;
        if (Utils.isFunction(obj)) {
            // Copy functions by reference.
            return obj;
        }
        if (Utils.isArray(obj)) {
            c = [];
            let keys = Object.keys(obj);
            for (i = 0; i < keys.length; i++) {
                c[keys[i]] = Utils.getDeepClone(obj[keys[i]]);
            }
            return c;
        } else if (Utils.isObject(obj)) {
            c = {}
            let keys = Object.keys(obj);
            for (i = 0; i < keys.length; i++) {
                c[keys[i]] = Utils.getDeepClone(obj[keys[i]]);
            }
            return c;
        } else {
            return obj;
        }
    }

    static setToArray(s) {
        let result = [];
        s.forEach(function (value) {
            result.push(value);
        });
        return result;
    }

    static iteratorToArray(iterator) {
        let result = [];
        let iteratorResult = iterator.next();
        while (!iteratorResult.done) {
            result.push(iteratorResult.value);
            iteratorResult = iterator.next();
        }
        return result;
    }
}

Utils.isNode = (typeof window === "undefined");

module.exports = Utils;