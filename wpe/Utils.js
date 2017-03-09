var isNode = !!(((typeof module !== "undefined") && module.exports));

var Utils = {};

Utils.extendClass = function(subclass, parentclass) {
    subclass.prototype = Object.create(parentclass.prototype);
    subclass.prototype.constructor = subclass;
    subclass.prototype.parentConstructor = parentclass;
};

Utils.isFunction = function(value) {
    return typeof value === 'function';
};

Utils.isNumber = function(value) {
    return typeof value === 'number';
};

Utils.isInteger = function(value) {
    return (typeof value === 'number' && (value % 1) === 0);
};

Utils.isBoolean = function(value) {
    return value === true || value === false;
};

Utils.isString = function(value) {
    return typeof value == 'string';
};

Utils.isArray = Array.isArray;

Utils.cloneObj = function(obj) {
    var keys = Object.keys(obj);
    var clone = {};
    for (var i = 0; i < keys.length; i++) {
        clone[keys[i]] = obj[keys[i]];
    }
    return clone;
};

Utils.merge = function(obj1, obj2) {
    var keys = Object.keys(obj2);
    for (var i = 0; i < keys.length; i++) {
        obj1[keys[i]] = obj2[keys[i]];
    }
    return obj1;
};

Utils.isObject = function(value) {
    var type = typeof value;
    return !!value && (type == 'object' || type == 'function');
};

Utils.getArrayIndex = function(index, arr) {
    return Utils.getModuloIndex(index, arr.length);
};

Utils.getModuloIndex = function(index, len) {
    if (len == 0) return index;
    while (index < 0) {
        index += Math.ceil(-index / len) * len;
    }
    index = index % len;
    return index;
};

Utils.getDeepClone = function(obj) {
    var i, c;
    if (Utils.isFunction(obj)) {
        // Copy functions by reference.
        return obj;
    }
    if (Utils.isArray(obj)) {
        c = [];
        var keys = Object.keys(obj);
        for (i = 0; i < keys.length; i++) {
            c[keys[i]] = Utils.getDeepClone(obj[keys[i]]);
        }
        return c;
    } else if (Utils.isObject(obj)) {
        c = {};
        var keys = Object.keys(obj);
        for (i = 0; i < keys.length; i++) {
            c[keys[i]] = Utils.getDeepClone(obj[keys[i]]);
        }
        return c;
    } else {
        return obj;
    }
};

Utils.setToArray = function(s) {
    var result = [];
    s.forEach(function(value) {
        result.push(value);
    });
    return result;
};

Utils.iteratorToArray = function(iterator) {
    var result = [];
    var iteratorResult = iterator.next();
    while (!iteratorResult.done) {
        result.push(iteratorResult.value);
        iteratorResult = iterator.next();
    }
    return result;
};

Utils.async = {
    parallel: function(tasks, cb) {
        var i, n  = tasks.length;
        var done = false;
        var c = n;
        var results = [];
        for (i = 0; i < n; i++) {
            (function(i) {
                tasks[i](function(err, res) {
                    results[i] = res;
                    if (err) {
                        if (!done) {
                            cb(err);
                            done = true;
                        }
                    } else {
                        c--;
                        if (c == 0 && !done) {
                            cb(null, results);
                            done = true;
                        }
                    }
                });
            })(i);
        }
    }
};

if (isNode) {
    module.exports = Utils;
}