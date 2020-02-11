export default class Utils {

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
        return typeof value === 'string';
    }

    static clone(v) {
        if (Utils.isObjectLiteral(v) || Array.isArray(v)) {
            return Utils.getDeepClone(v);
        } else {
            // Copy by value.
            return v;
        }
    }

    static cloneObjShallow(obj) {
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
        return !!value && (type === 'object' || type === 'function');
    }

    static isPlainObject(value) {
        let type = typeof value;
        return !!value && (type === 'object');
    }

    static isObjectLiteral(value){
        return typeof value === 'object' && value && value.constructor === Object;
    }

    static getArrayIndex(index, arr) {
        return Utils.getModuloIndex(index, arr.length);
    }

    static getModuloIndex(index, len) {
        if (len === 0) return index;
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
        if (Array.isArray(obj)) {
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

    static equalValues(v1, v2) {
        if ((typeof v1) !== (typeof v2)) return false;
        if (Utils.isObjectLiteral(v1)) {
            return Utils.isObjectLiteral(v2) && Utils.equalObjectLiterals(v1, v2);
        } else if (Array.isArray(v1)) {
            return Array.isArray(v2) && Utils.equalArrays(v1, v2);
        } else {
            return v1 === v2;
        }
    }

    static equalObjectLiterals(obj1, obj2) {
        let keys1 = Object.keys(obj1);
        let keys2 = Object.keys(obj2);
        if (keys1.length !== keys2.length) {
            return false;
        }

        for (let i = 0, n = keys1.length; i < n; i++) {
            const k1 = keys1[i];
            const k2 = keys2[i];
            if (k1 !== k2) {
                return false;
            }

            const v1 = obj1[k1];
            const v2 = obj2[k2];

            if (!Utils.equalValues(v1, v2)) {
                return false;
            }
        }

        return true;
    }

    static equalArrays(v1, v2) {
        if (v1.length !== v2.length) {
            return false;
        }
        for (let i = 0, n = v1.length; i < n; i++) {
            if (!this.equalValues(v1[i], v2[i])) {
                return false;
            }
        }

        return true;
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

    static isUcChar(charcode) {
        return charcode >= 65 && charcode <= 90;
    }

}

Utils.isWeb = (typeof window !== "undefined") && (typeof sparkscene === "undefined");
Utils.isWPE = Utils.isWeb && (navigator.userAgent.indexOf("WPE") !== -1);
Utils.isSpark = (typeof sparkscene !== "undefined");
Utils.isNode = (typeof window === "undefined") || Utils.isSpark;
