/**
 * Lightning v1.3.1
 *
 * https://github.com/WebPlatformForEmbedded/Lightning
 */

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.lng = factory());
}(this, (function () { 'use strict';

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function");
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        writable: true,
        configurable: true
      }
    });
    if (superClass) _setPrototypeOf(subClass, superClass);
  }

  function _getPrototypeOf(o) {
    _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
      return o.__proto__ || Object.getPrototypeOf(o);
    };
    return _getPrototypeOf(o);
  }

  function _setPrototypeOf(o, p) {
    _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
      o.__proto__ = p;
      return o;
    };

    return _setPrototypeOf(o, p);
  }

  function _newArrowCheck(innerThis, boundThis) {
    if (innerThis !== boundThis) {
      throw new TypeError("Cannot instantiate an arrow function");
    }
  }

  function _assertThisInitialized(self) {
    if (self === void 0) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return self;
  }

  function _possibleConstructorReturn(self, call) {
    if (call && (typeof call === "object" || typeof call === "function")) {
      return call;
    }

    return _assertThisInitialized(self);
  }

  function _superPropBase(object, property) {
    while (!Object.prototype.hasOwnProperty.call(object, property)) {
      object = _getPrototypeOf(object);
      if (object === null) break;
    }

    return object;
  }

  function _get(target, property, receiver) {
    if (typeof Reflect !== "undefined" && Reflect.get) {
      _get = Reflect.get;
    } else {
      _get = function _get(target, property, receiver) {
        var base = _superPropBase(target, property);

        if (!base) return;
        var desc = Object.getOwnPropertyDescriptor(base, property);

        if (desc.get) {
          return desc.get.call(receiver);
        }

        return desc.value;
      };
    }

    return _get(target, property, receiver || target);
  }

  function set(target, property, value, receiver) {
    if (typeof Reflect !== "undefined" && Reflect.set) {
      set = Reflect.set;
    } else {
      set = function set(target, property, value, receiver) {
        var base = _superPropBase(target, property);

        var desc;

        if (base) {
          desc = Object.getOwnPropertyDescriptor(base, property);

          if (desc.set) {
            desc.set.call(receiver, value);
            return true;
          } else if (!desc.writable) {
            return false;
          }
        }

        desc = Object.getOwnPropertyDescriptor(receiver, property);

        if (desc) {
          if (!desc.writable) {
            return false;
          }

          desc.value = value;
          Object.defineProperty(receiver, property, desc);
        } else {
          _defineProperty(receiver, property, value);
        }

        return true;
      };
    }

    return set(target, property, value, receiver);
  }

  function _set(target, property, value, receiver, isStrict) {
    var s = set(target, property, value, receiver || target);

    if (!s && isStrict) {
      throw new Error('failed to set property');
    }

    return value;
  }

  function _toConsumableArray(arr) {
    return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread();
  }

  function _arrayWithoutHoles(arr) {
    if (Array.isArray(arr)) {
      for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

      return arr2;
    }
  }

  function _iterableToArray(iter) {
    if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter);
  }

  function _nonIterableSpread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance");
  }

  var StageUtils =
  /*#__PURE__*/
  function () {
    function StageUtils() {
      _classCallCheck(this, StageUtils);
    }

    _createClass(StageUtils, null, [{
      key: "mergeNumbers",
      value: function mergeNumbers(v1, v2, p) {
        return v1 * p + v2 * (1 - p);
      }
    }, {
      key: "rgb",
      value: function rgb(r, g, b) {
        return (r << 16) + (g << 8) + b + 255 * 16777216;
      }
    }, {
      key: "rgba",
      value: function rgba(r, g, b, a) {
        return (r << 16) + (g << 8) + b + (a * 255 | 0) * 16777216;
      }
    }, {
      key: "getRgbString",
      value: function getRgbString(color) {
        var r = (color / 65536 | 0) % 256;
        var g = (color / 256 | 0) % 256;
        var b = color % 256;
        return 'rgb(' + r + ',' + g + ',' + b + ')';
      }
    }, {
      key: "getRgbaString",
      value: function getRgbaString(color) {
        var r = (color / 65536 | 0) % 256;
        var g = (color / 256 | 0) % 256;
        var b = color % 256;
        var a = (color / 16777216 | 0) / 255;
        return 'rgba(' + r + ',' + g + ',' + b + ',' + a.toFixed(4) + ')';
      }
    }, {
      key: "getRgbaStringFromArray",
      value: function getRgbaStringFromArray(color) {
        var r = Math.floor(color[0] * 255);
        var g = Math.floor(color[1] * 255);
        var b = Math.floor(color[2] * 255);
        var a = Math.floor(color[3] * 255) / 255;
        return 'rgba(' + r + ',' + g + ',' + b + ',' + a.toFixed(4) + ')';
      }
    }, {
      key: "getRgbaComponentsNormalized",
      value: function getRgbaComponentsNormalized(argb) {
        var r = (argb / 65536 | 0) % 256;
        var g = (argb / 256 | 0) % 256;
        var b = argb % 256;
        var a = argb / 16777216 | 0;
        return [r / 255, g / 255, b / 255, a / 255];
      }
    }, {
      key: "getRgbComponentsNormalized",
      value: function getRgbComponentsNormalized(argb) {
        var r = (argb / 65536 | 0) % 256;
        var g = (argb / 256 | 0) % 256;
        var b = argb % 256;
        return [r / 255, g / 255, b / 255];
      }
    }, {
      key: "getRgbaComponents",
      value: function getRgbaComponents(argb) {
        var r = (argb / 65536 | 0) % 256;
        var g = (argb / 256 | 0) % 256;
        var b = argb % 256;
        var a = argb / 16777216 | 0;
        return [r, g, b, a];
      }
    }, {
      key: "getArgbNumber",
      value: function getArgbNumber(rgba) {
        rgba[0] = Math.max(0, Math.min(255, rgba[0]));
        rgba[1] = Math.max(0, Math.min(255, rgba[1]));
        rgba[2] = Math.max(0, Math.min(255, rgba[2]));
        rgba[3] = Math.max(0, Math.min(255, rgba[3]));
        var v = ((rgba[3] | 0) << 24) + ((rgba[0] | 0) << 16) + ((rgba[1] | 0) << 8) + (rgba[2] | 0);

        if (v < 0) {
          v = 0xFFFFFFFF + v + 1;
        }

        return v;
      }
    }, {
      key: "mergeColors",
      value: function mergeColors(c1, c2, p) {
        var r1 = (c1 / 65536 | 0) % 256;
        var g1 = (c1 / 256 | 0) % 256;
        var b1 = c1 % 256;
        var a1 = c1 / 16777216 | 0;
        var r2 = (c2 / 65536 | 0) % 256;
        var g2 = (c2 / 256 | 0) % 256;
        var b2 = c2 % 256;
        var a2 = c2 / 16777216 | 0;
        var r = r1 * p + r2 * (1 - p);
        var g = g1 * p + g2 * (1 - p);
        var b = b1 * p + b2 * (1 - p);
        var a = a1 * p + a2 * (1 - p);
        return Math.round(a) * 16777216 + Math.round(r) * 65536 + Math.round(g) * 256 + Math.round(b);
      }
    }, {
      key: "mergeMultiColors",
      value: function mergeMultiColors(c, p) {
        var r = 0,
            g = 0,
            b = 0,
            a = 0,
            t = 0;
        var n = c.length;

        for (var i = 0; i < n; i++) {
          var r1 = (c[i] / 65536 | 0) % 256;
          var g1 = (c[i] / 256 | 0) % 256;
          var b1 = c[i] % 256;
          var a1 = c[i] / 16777216 | 0;
          r += r1 * p[i];
          g += g1 * p[i];
          b += b1 * p[i];
          a += a1 * p[i];
          t += p[i];
        }

        t = 1 / t;
        return Math.round(a * t) * 16777216 + Math.round(r * t) * 65536 + Math.round(g * t) * 256 + Math.round(b * t);
      }
    }, {
      key: "mergeMultiColorsEqual",
      value: function mergeMultiColorsEqual(c) {
        var r = 0,
            g = 0,
            b = 0,
            a = 0,
            t = 0;
        var n = c.length;

        for (var i = 0; i < n; i++) {
          var r1 = (c[i] / 65536 | 0) % 256;
          var g1 = (c[i] / 256 | 0) % 256;
          var b1 = c[i] % 256;
          var a1 = c[i] / 16777216 | 0;
          r += r1;
          g += g1;
          b += b1;
          a += a1;
          t += 1.0;
        }

        t = 1 / t;
        return Math.round(a * t) * 16777216 + Math.round(r * t) * 65536 + Math.round(g * t) * 256 + Math.round(b * t);
      }
    }, {
      key: "mergeColorAlpha",
      value: function mergeColorAlpha(c, alpha) {
        var a = (c / 16777216 | 0) * alpha | 0;
        return ((c >> 16 & 0xff) * a / 255 & 0xff) + ((c & 0xff00) * a / 255 & 0xff00) + (((c & 0xff) << 16) * a / 255 & 0xff0000) + (a << 24);
      }
    }, {
      key: "rad",
      value: function rad(deg) {
        return deg * (Math.PI / 180);
      }
    }, {
      key: "getTimingBezier",
      value: function getTimingBezier(a, b, c, d) {
        var xc = 3.0 * a;
        var xb = 3.0 * (c - a) - xc;
        var xa = 1.0 - xc - xb;
        var yc = 3.0 * b;
        var yb = 3.0 * (d - b) - yc;
        var ya = 1.0 - yc - yb;
        return function (time) {
          if (time >= 1.0) {
            return 1;
          }

          if (time <= 0) {
            return 0;
          }

          var t = 0.5,
              cbx,
              cbxd,
              dx;

          for (var it = 0; it < 20; it++) {
            cbx = t * (t * (t * xa + xb) + xc);
            dx = time - cbx;

            if (dx > -1e-8 && dx < 1e-8) {
              return t * (t * (t * ya + yb) + yc);
            } // Cubic bezier derivative.


            cbxd = t * (t * (3 * xa) + 2 * xb) + xc;

            if (cbxd > 1e-10 && cbxd < 1e-10) {
              // Problematic. Fall back to binary search method.
              break;
            }

            t += dx / cbxd;
          } // Fallback: binary search method. This is more reliable when there are near-0 slopes.


          var minT = 0;
          var maxT = 1;

          for (var _it = 0; _it < 20; _it++) {
            t = 0.5 * (minT + maxT);
            cbx = t * (t * (t * xa + xb) + xc);
            dx = time - cbx;

            if (dx > -1e-8 && dx < 1e-8) {
              // Solution found!
              return t * (t * (t * ya + yb) + yc);
            }

            if (dx < 0) {
              maxT = t;
            } else {
              minT = t;
            }
          }
        };
      }
    }, {
      key: "getTimingFunction",
      value: function getTimingFunction(str) {
        switch (str) {
          case "linear":
            return function (time) {
              return time;
            };

          case "ease":
            return StageUtils.getTimingBezier(0.25, 0.1, 0.25, 1.0);

          case "ease-in":
            return StageUtils.getTimingBezier(0.42, 0, 1.0, 1.0);

          case "ease-out":
            return StageUtils.getTimingBezier(0, 0, 0.58, 1.0);

          case "ease-in-out":
            return StageUtils.getTimingBezier(0.42, 0, 0.58, 1.0);

          case "step-start":
            return function () {
              return 1;
            };

          case "step-end":
            return function (time) {
              return time === 1 ? 1 : 0;
            };

          default:
            var s = "cubic-bezier(";

            if (str && str.indexOf(s) === 0) {
              var parts = str.substr(s.length, str.length - s.length - 1).split(",");

              if (parts.length !== 4) {
                console.warn("Unknown timing function: " + str); // Fallback: use linear.

                return function (time) {
                  return time;
                };
              }

              var a = parseFloat(parts[0]);
              var b = parseFloat(parts[1]);
              var c = parseFloat(parts[2]);
              var d = parseFloat(parts[3]);

              if (isNaN(a) || isNaN(b) || isNaN(c) || isNaN(d)) {
                console.warn("Unknown timing function: " + str); // Fallback: use linear.

                return function (time) {
                  return time;
                };
              }

              return StageUtils.getTimingBezier(a, b, c, d);
            } else {
              console.warn("Unknown timing function: " + str); // Fallback: use linear.

              return function (time) {
                return time;
              };
            }

        }
      }
    }]);

    return StageUtils;
  }();

  var Utils =
  /*#__PURE__*/
  function () {
    function Utils() {
      _classCallCheck(this, Utils);
    }

    _createClass(Utils, null, [{
      key: "isFunction",
      value: function isFunction(value) {
        return typeof value === 'function';
      }
    }, {
      key: "isNumber",
      value: function isNumber(value) {
        return typeof value === 'number';
      }
    }, {
      key: "isInteger",
      value: function isInteger(value) {
        return typeof value === 'number' && value % 1 === 0;
      }
    }, {
      key: "isBoolean",
      value: function isBoolean(value) {
        return value === true || value === false;
      }
    }, {
      key: "isString",
      value: function isString(value) {
        return typeof value === 'string';
      }
    }, {
      key: "clone",
      value: function clone(v) {
        if (Utils.isObjectLiteral(v) || Array.isArray(v)) {
          return Utils.getDeepClone(v);
        } else {
          // Copy by value.
          return v;
        }
      }
    }, {
      key: "cloneObjShallow",
      value: function cloneObjShallow(obj) {
        var keys = Object.keys(obj);
        var clone = {};

        for (var i = 0; i < keys.length; i++) {
          clone[keys[i]] = obj[keys[i]];
        }

        return clone;
      }
    }, {
      key: "merge",
      value: function merge(obj1, obj2) {
        var keys = Object.keys(obj2);

        for (var i = 0; i < keys.length; i++) {
          obj1[keys[i]] = obj2[keys[i]];
        }

        return obj1;
      }
    }, {
      key: "isObject",
      value: function isObject(value) {
        var type = typeof value;
        return !!value && (type === 'object' || type === 'function');
      }
    }, {
      key: "isPlainObject",
      value: function isPlainObject(value) {
        var type = typeof value;
        return !!value && type === 'object';
      }
    }, {
      key: "isObjectLiteral",
      value: function isObjectLiteral(value) {
        return typeof value === 'object' && value && value.constructor === Object;
      }
    }, {
      key: "getArrayIndex",
      value: function getArrayIndex(index, arr) {
        return Utils.getModuloIndex(index, arr.length);
      }
    }, {
      key: "getModuloIndex",
      value: function getModuloIndex(index, len) {
        if (len === 0) return index;

        while (index < 0) {
          index += Math.ceil(-index / len) * len;
        }

        index = index % len;
        return index;
      }
    }, {
      key: "getDeepClone",
      value: function getDeepClone(obj) {
        var i, c;

        if (Utils.isFunction(obj)) {
          // Copy functions by reference.
          return obj;
        }

        if (Array.isArray(obj)) {
          c = [];
          var keys = Object.keys(obj);

          for (i = 0; i < keys.length; i++) {
            c[keys[i]] = Utils.getDeepClone(obj[keys[i]]);
          }

          return c;
        } else if (Utils.isObject(obj)) {
          c = {};

          var _keys = Object.keys(obj);

          for (i = 0; i < _keys.length; i++) {
            c[_keys[i]] = Utils.getDeepClone(obj[_keys[i]]);
          }

          return c;
        } else {
          return obj;
        }
      }
    }, {
      key: "equalValues",
      value: function equalValues(v1, v2) {
        if (typeof v1 !== typeof v2) return false;

        if (Utils.isObjectLiteral(v1)) {
          return Utils.isObjectLiteral(v2) && Utils.equalObjectLiterals(v1, v2);
        } else if (Array.isArray(v1)) {
          return Array.isArray(v2) && Utils.equalArrays(v1, v2);
        } else {
          return v1 === v2;
        }
      }
    }, {
      key: "equalObjectLiterals",
      value: function equalObjectLiterals(obj1, obj2) {
        var keys1 = Object.keys(obj1);
        var keys2 = Object.keys(obj2);

        if (keys1.length !== keys2.length) {
          return false;
        }

        for (var i = 0, n = keys1.length; i < n; i++) {
          var k1 = keys1[i];
          var k2 = keys2[i];

          if (k1 !== k2) {
            return false;
          }

          var v1 = obj1[k1];
          var v2 = obj2[k2];

          if (!Utils.equalValues(v1, v2)) {
            return false;
          }
        }

        return true;
      }
    }, {
      key: "equalArrays",
      value: function equalArrays(v1, v2) {
        if (v1.length !== v2.length) {
          return false;
        }

        for (var i = 0, n = v1.length; i < n; i++) {
          if (!this.equalValues(v1[i], v2[i])) {
            return false;
          }
        }

        return true;
      }
    }, {
      key: "setToArray",
      value: function setToArray(s) {
        var result = [];
        s.forEach(function (value) {
          result.push(value);
        });
        return result;
      }
    }, {
      key: "iteratorToArray",
      value: function iteratorToArray(iterator) {
        var result = [];
        var iteratorResult = iterator.next();

        while (!iteratorResult.done) {
          result.push(iteratorResult.value);
          iteratorResult = iterator.next();
        }

        return result;
      }
    }, {
      key: "isUcChar",
      value: function isUcChar(charcode) {
        return charcode >= 65 && charcode <= 90;
      }
    }]);

    return Utils;
  }();
  Utils.isNode = typeof window === "undefined";
  Utils.isWeb = typeof window !== "undefined";
  Utils.isWPE = Utils.isWeb && navigator.userAgent.indexOf("WPE") !== -1;
  Utils.isSpark = typeof window === "undefined" && typeof sparkscene !== "undefined";

  var Base =
  /*#__PURE__*/
  function () {
    function Base() {
      _classCallCheck(this, Base);
    }

    _createClass(Base, null, [{
      key: "defaultSetter",
      value: function defaultSetter(obj, name, value) {
        obj[name] = value;
      }
    }, {
      key: "patchObject",
      value: function patchObject(obj, settings) {
        if (!Utils.isObjectLiteral(settings)) {
          console.error("Settings must be object literal");
        } else {
          var names = Object.keys(settings);

          for (var i = 0, n = names.length; i < n; i++) {
            var name = names[i];
            this.patchObjectProperty(obj, name, settings[name]);
          }
        }
      }
    }, {
      key: "patchObjectProperty",
      value: function patchObjectProperty(obj, name, value) {
        var setter = obj.setSetting || Base.defaultSetter;

        if (name.charAt(0) === "_") {
          // Disallow patching private variables.
          if (name !== "__create") {
            console.error("Patch of private property '" + name + "' is not allowed");
          }
        } else if (name !== "type") {
          // Type is a reserved keyword to specify the class type on creation.
          if (Utils.isFunction(value) && value.__local) {
            // Local function (Base.local(s => s.something))
            value = value.__local(obj);
          }

          setter(obj, name, value);
        }
      }
    }, {
      key: "local",
      value: function local(func) {
        // This function can be used as an object setting, which is called with the target object.
        func.__local = true;
      }
    }]);

    return Base;
  }();

  var SpacingCalculator =
  /*#__PURE__*/
  function () {
    function SpacingCalculator() {
      _classCallCheck(this, SpacingCalculator);
    }

    _createClass(SpacingCalculator, null, [{
      key: "getSpacing",
      value: function getSpacing(mode, numberOfItems, remainingSpace) {
        var itemGaps = numberOfItems - 1;
        var spacePerGap;
        var spacingBefore, spacingBetween;

        switch (mode) {
          case "flex-start":
            spacingBefore = 0;
            spacingBetween = 0;
            break;

          case "flex-end":
            spacingBefore = remainingSpace;
            spacingBetween = 0;
            break;

          case "center":
            spacingBefore = remainingSpace / 2;
            spacingBetween = 0;
            break;

          case "space-between":
            spacingBefore = 0;
            spacingBetween = Math.max(0, remainingSpace) / itemGaps;
            break;

          case "space-around":
            if (remainingSpace < 0) {
              return this.getSpacing("center", numberOfItems, remainingSpace);
            } else {
              spacePerGap = remainingSpace / (itemGaps + 1);
              spacingBefore = 0.5 * spacePerGap;
              spacingBetween = spacePerGap;
            }

            break;

          case "space-evenly":
            if (remainingSpace < 0) {
              return this.getSpacing("center", numberOfItems, remainingSpace);
            } else {
              spacePerGap = remainingSpace / (itemGaps + 2);
              spacingBefore = spacePerGap;
              spacingBetween = spacePerGap;
            }

            break;

          case "stretch":
            spacingBefore = 0;
            spacingBetween = 0;
            break;

          default:
            throw new Error("Unknown mode: " + mode);
        }

        return {
          spacingBefore,
          spacingBetween
        };
      }
    }]);

    return SpacingCalculator;
  }();

  var ContentAligner =
  /*#__PURE__*/
  function () {
    function ContentAligner(layout) {
      _classCallCheck(this, ContentAligner);

      this._layout = layout;
      this._totalCrossAxisSize = 0;
    }

    _createClass(ContentAligner, [{
      key: "init",
      value: function init() {
        this._totalCrossAxisSize = this._getTotalCrossAxisSize();
      }
    }, {
      key: "align",
      value: function align() {
        var crossAxisSize = this._layout.crossAxisSize;
        var remainingSpace = crossAxisSize - this._totalCrossAxisSize;

        var _this$_getSpacing = this._getSpacing(remainingSpace),
            spacingBefore = _this$_getSpacing.spacingBefore,
            spacingBetween = _this$_getSpacing.spacingBetween;

        var lines = this._lines;
        var mode = this._layout._flexContainer.alignContent;
        var growSize = 0;

        if (mode === "stretch" && lines.length && remainingSpace > 0) {
          growSize = remainingSpace / lines.length;
        }

        var currentPos = spacingBefore;

        for (var i = 0, n = lines.length; i < n; i++) {
          var crossAxisLayoutOffset = currentPos;
          var aligner = lines[i].createItemAligner();
          var finalCrossAxisLayoutSize = lines[i].crossAxisLayoutSize + growSize;
          aligner.setCrossAxisLayoutSize(finalCrossAxisLayoutSize);
          aligner.setCrossAxisLayoutOffset(crossAxisLayoutOffset);
          aligner.align();

          if (aligner.recursiveResizeOccured) {
            lines[i].setItemPositions();
          }

          currentPos += finalCrossAxisLayoutSize;
          currentPos += spacingBetween;
        }
      }
    }, {
      key: "_getTotalCrossAxisSize",
      value: function _getTotalCrossAxisSize() {
        var lines = this._lines;
        var total = 0;

        for (var i = 0, n = lines.length; i < n; i++) {
          var line = lines[i];
          total += line.crossAxisLayoutSize;
        }

        return total;
      }
    }, {
      key: "_getSpacing",
      value: function _getSpacing(remainingSpace) {
        var mode = this._layout._flexContainer.alignContent;
        var numberOfItems = this._lines.length;
        return SpacingCalculator.getSpacing(mode, numberOfItems, remainingSpace);
      }
    }, {
      key: "_lines",
      get: function get() {
        return this._layout._lines;
      }
    }, {
      key: "totalCrossAxisSize",
      get: function get() {
        return this._totalCrossAxisSize;
      }
    }]);

    return ContentAligner;
  }();

  var FlexUtils =
  /*#__PURE__*/
  function () {
    function FlexUtils() {
      _classCallCheck(this, FlexUtils);
    }

    _createClass(FlexUtils, null, [{
      key: "getParentAxisSizeWithPadding",
      value: function getParentAxisSizeWithPadding(item, horizontal) {
        var target = item.target;
        var parent = target.getParent();

        if (!parent) {
          return 0;
        } else {
          var flexParent = item.flexParent;

          if (flexParent) {
            // Use pending layout size.
            return this.getAxisLayoutSize(flexParent, horizontal) + this.getTotalPadding(flexParent, horizontal);
          } else {
            // Use 'absolute' size.
            return horizontal ? parent.w : parent.h;
          }
        }
      }
    }, {
      key: "getRelAxisSize",
      value: function getRelAxisSize(item, horizontal) {
        if (horizontal) {
          if (item.funcW) {
            if (this._allowRelAxisSizeFunction(item, true)) {
              return item.funcW(this.getParentAxisSizeWithPadding(item, true));
            } else {
              return 0;
            }
          } else {
            return item.originalWidth;
          }
        } else {
          if (item.funcH) {
            if (this._allowRelAxisSizeFunction(item, false)) {
              return item.funcH(this.getParentAxisSizeWithPadding(item, false));
            } else {
              return 0;
            }
          } else {
            return item.originalHeight;
          }
        }
      }
    }, {
      key: "_allowRelAxisSizeFunction",
      value: function _allowRelAxisSizeFunction(item, horizontal) {
        var flexParent = item.flexParent;

        if (flexParent && flexParent._flex._layout.isAxisFitToContents(horizontal)) {
          // We don't allow relative width on fit-to-contents because it leads to conflicts.
          return false;
        }

        return true;
      }
    }, {
      key: "isZeroAxisSize",
      value: function isZeroAxisSize(item, horizontal) {
        if (horizontal) {
          return !item.originalWidth && !item.funcW;
        } else {
          return !item.originalHeight && !item.funcH;
        }
      }
    }, {
      key: "getAxisLayoutPos",
      value: function getAxisLayoutPos(item, horizontal) {
        return horizontal ? item.x : item.y;
      }
    }, {
      key: "getAxisLayoutSize",
      value: function getAxisLayoutSize(item, horizontal) {
        return horizontal ? item.w : item.h;
      }
    }, {
      key: "setAxisLayoutPos",
      value: function setAxisLayoutPos(item, horizontal, pos) {
        if (horizontal) {
          item.x = pos;
        } else {
          item.y = pos;
        }
      }
    }, {
      key: "setAxisLayoutSize",
      value: function setAxisLayoutSize(item, horizontal, size) {
        if (horizontal) {
          item.w = size;
        } else {
          item.h = size;
        }
      }
    }, {
      key: "getAxisMinSize",
      value: function getAxisMinSize(item, horizontal) {
        var minSize = this.getPlainAxisMinSize(item, horizontal);
        var flexItemMinSize = 0;

        if (item.isFlexItemEnabled()) {
          flexItemMinSize = item._flexItem._getMinSizeSetting(horizontal);
        }

        var hasLimitedMinSize = flexItemMinSize > 0;

        if (hasLimitedMinSize) {
          minSize = Math.max(minSize, flexItemMinSize);
        }

        return minSize;
      }
    }, {
      key: "getPlainAxisMinSize",
      value: function getPlainAxisMinSize(item, horizontal) {
        if (item.isFlexEnabled()) {
          return item._flex._layout.getAxisMinSize(horizontal);
        } else {
          var isShrinkable = item.flexItem.shrink !== 0;

          if (isShrinkable) {
            return 0;
          } else {
            return this.getRelAxisSize(item, horizontal);
          }
        }
      }
    }, {
      key: "resizeAxis",
      value: function resizeAxis(item, horizontal, size) {
        if (item.isFlexEnabled()) {
          var isMainAxis = item._flex._horizontal === horizontal;

          if (isMainAxis) {
            item._flex._layout.resizeMainAxis(size);
          } else {
            item._flex._layout.resizeCrossAxis(size);
          }
        } else {
          this.setAxisLayoutSize(item, horizontal, size);
        }
      }
    }, {
      key: "getPaddingOffset",
      value: function getPaddingOffset(item, horizontal) {
        if (item.isFlexEnabled()) {
          var flex = item._flex;

          if (horizontal) {
            return flex.paddingLeft;
          } else {
            return flex.paddingTop;
          }
        } else {
          return 0;
        }
      }
    }, {
      key: "getTotalPadding",
      value: function getTotalPadding(item, horizontal) {
        if (item.isFlexEnabled()) {
          var flex = item._flex;

          if (horizontal) {
            return flex.paddingRight + flex.paddingLeft;
          } else {
            return flex.paddingTop + flex.paddingBottom;
          }
        } else {
          return 0;
        }
      }
    }, {
      key: "getMarginOffset",
      value: function getMarginOffset(item, horizontal) {
        var flexItem = item.flexItem;

        if (flexItem) {
          if (horizontal) {
            return flexItem.marginLeft;
          } else {
            return flexItem.marginTop;
          }
        } else {
          return 0;
        }
      }
    }, {
      key: "getTotalMargin",
      value: function getTotalMargin(item, horizontal) {
        var flexItem = item.flexItem;

        if (flexItem) {
          if (horizontal) {
            return flexItem.marginRight + flexItem.marginLeft;
          } else {
            return flexItem.marginTop + flexItem.marginBottom;
          }
        } else {
          return 0;
        }
      }
    }]);

    return FlexUtils;
  }();

  var SizeShrinker =
  /*#__PURE__*/
  function () {
    function SizeShrinker(line) {
      _classCallCheck(this, SizeShrinker);

      this._line = line;
      this._amountRemaining = 0;
      this._shrunkSize = 0;
    }

    _createClass(SizeShrinker, [{
      key: "shrink",
      value: function shrink(amount) {
        this._shrunkSize = 0;
        this._amountRemaining = amount;

        var totalShrinkAmount = this._getTotalShrinkAmount();

        if (totalShrinkAmount) {
          var items = this._line.items;

          do {
            var amountPerShrink = this._amountRemaining / totalShrinkAmount;

            for (var i = this._line.startIndex; i <= this._line.endIndex; i++) {
              var item = items[i];
              var flexItem = item.flexItem;
              var shrinkAmount = flexItem.shrink;
              var isShrinkableItem = shrinkAmount > 0;

              if (isShrinkableItem) {
                var shrink = shrinkAmount * amountPerShrink;

                var minSize = flexItem._getMainAxisMinSize();

                var size = flexItem._getMainAxisLayoutSize();

                if (size > minSize) {
                  var maxShrink = size - minSize;
                  var isFullyShrunk = shrink >= maxShrink;

                  if (isFullyShrunk) {
                    shrink = maxShrink; // Destribute remaining amount over the other flex items.

                    totalShrinkAmount -= shrinkAmount;
                  }

                  var finalSize = size - shrink;

                  flexItem._resizeMainAxis(finalSize);

                  this._shrunkSize += shrink;
                  this._amountRemaining -= shrink;

                  if (Math.abs(this._amountRemaining) < 10e-6) {
                    return;
                  }
                }
              }
            }
          } while (totalShrinkAmount && Math.abs(this._amountRemaining) > 10e-6);
        }
      }
    }, {
      key: "_getTotalShrinkAmount",
      value: function _getTotalShrinkAmount() {
        var total = 0;
        var items = this._line.items;

        for (var i = this._line.startIndex; i <= this._line.endIndex; i++) {
          var item = items[i];
          var flexItem = item.flexItem;

          if (flexItem.shrink) {
            var minSize = flexItem._getMainAxisMinSize();

            var size = flexItem._getMainAxisLayoutSize(); // Exclude those already fully shrunk.


            if (size > minSize) {
              total += flexItem.shrink;
            }
          }
        }

        return total;
      }
    }, {
      key: "getShrunkSize",
      value: function getShrunkSize() {
        return this._shrunkSize;
      }
    }]);

    return SizeShrinker;
  }();

  var SizeGrower =
  /*#__PURE__*/
  function () {
    function SizeGrower(line) {
      _classCallCheck(this, SizeGrower);

      this._line = line;
      this._amountRemaining = 0;
      this._grownSize = 0;
    }

    _createClass(SizeGrower, [{
      key: "grow",
      value: function grow(amount) {
        this._grownSize = 0;
        this._amountRemaining = amount;

        var totalGrowAmount = this._getTotalGrowAmount();

        if (totalGrowAmount) {
          var items = this._line.items;

          do {
            var amountPerGrow = this._amountRemaining / totalGrowAmount;

            for (var i = this._line.startIndex; i <= this._line.endIndex; i++) {
              var item = items[i];
              var flexItem = item.flexItem;
              var growAmount = flexItem.grow;
              var isGrowableItem = growAmount > 0;

              if (isGrowableItem) {
                var grow = growAmount * amountPerGrow;

                var maxSize = flexItem._getMainAxisMaxSizeSetting();

                var size = flexItem._getMainAxisLayoutSize();

                if (maxSize > 0) {
                  if (size >= maxSize) {
                    // Already fully grown.
                    grow = 0;
                  } else {
                    var maxGrow = maxSize - size;
                    var isFullyGrown = grow >= maxGrow;

                    if (isFullyGrown) {
                      grow = maxGrow; // Destribute remaining amount over the other flex items.

                      totalGrowAmount -= growAmount;
                    }
                  }
                }

                if (grow > 0) {
                  var finalSize = size + grow;

                  flexItem._resizeMainAxis(finalSize);

                  this._grownSize += grow;
                  this._amountRemaining -= grow;

                  if (Math.abs(this._amountRemaining) < 10e-6) {
                    return;
                  }
                }
              }
            }
          } while (totalGrowAmount && Math.abs(this._amountRemaining) > 10e-6);
        }
      }
    }, {
      key: "_getTotalGrowAmount",
      value: function _getTotalGrowAmount() {
        var total = 0;
        var items = this._line.items;

        for (var i = this._line.startIndex; i <= this._line.endIndex; i++) {
          var item = items[i];
          var flexItem = item.flexItem;

          if (flexItem.grow) {
            var maxSize = flexItem._getMainAxisMaxSizeSetting();

            var size = flexItem._getMainAxisLayoutSize(); // Exclude those already fully grown.


            if (maxSize === 0 || size < maxSize) {
              total += flexItem.grow;
            }
          }
        }

        return total;
      }
    }, {
      key: "getGrownSize",
      value: function getGrownSize() {
        return this._grownSize;
      }
    }]);

    return SizeGrower;
  }();

  var ItemPositioner =
  /*#__PURE__*/
  function () {
    function ItemPositioner(lineLayout) {
      _classCallCheck(this, ItemPositioner);

      this._line = lineLayout;
    }

    _createClass(ItemPositioner, [{
      key: "position",
      value: function position() {
        var _this$_getSpacing = this._getSpacing(),
            spacingBefore = _this$_getSpacing.spacingBefore,
            spacingBetween = _this$_getSpacing.spacingBetween;

        var currentPos = spacingBefore;
        var items = this._line.items;

        for (var i = this._line.startIndex; i <= this._line.endIndex; i++) {
          var item = items[i];

          item.flexItem._setMainAxisLayoutPos(currentPos);

          currentPos += item.flexItem._getMainAxisLayoutSizeWithPaddingAndMargin();
          currentPos += spacingBetween;
        }
      }
    }, {
      key: "_getSpacing",
      value: function _getSpacing() {
        var remainingSpace = this._line._availableSpace;
        var mode = this._layout._flexContainer.justifyContent;
        var numberOfItems = this._line.numberOfItems;
        return SpacingCalculator.getSpacing(mode, numberOfItems, remainingSpace);
      }
    }, {
      key: "_layout",
      get: function get() {
        return this._line._layout;
      }
    }]);

    return ItemPositioner;
  }();

  var ItemAligner =
  /*#__PURE__*/
  function () {
    function ItemAligner(line) {
      _classCallCheck(this, ItemAligner);

      this._line = line;
      this._crossAxisLayoutSize = 0;
      this._crossAxisLayoutOffset = 0;
      this._alignItemsSetting = null;
      this._recursiveResizeOccured = false;
      this._isCrossAxisFitToContents = false;
    }

    _createClass(ItemAligner, [{
      key: "setCrossAxisLayoutSize",
      value: function setCrossAxisLayoutSize(size) {
        this._crossAxisLayoutSize = size;
      }
    }, {
      key: "setCrossAxisLayoutOffset",
      value: function setCrossAxisLayoutOffset(offset) {
        this._crossAxisLayoutOffset = offset;
      }
    }, {
      key: "align",
      value: function align() {
        this._alignItemsSetting = this._flexContainer.alignItems;
        this._isCrossAxisFitToContents = this._layout.isAxisFitToContents(!this._flexContainer._horizontal);
        this._recursiveResizeOccured = false;
        var items = this._line.items;

        for (var i = this._line.startIndex; i <= this._line.endIndex; i++) {
          var item = items[i];

          this._alignItem(item);
        }
      }
    }, {
      key: "_alignItem",
      value: function _alignItem(item) {
        var flexItem = item.flexItem;
        var align = flexItem.alignSelf || this._alignItemsSetting;

        if (align === "stretch" && this._preventStretch(flexItem)) {
          align = "flex-start";
        }

        if (align !== "stretch" && !this._isCrossAxisFitToContents) {
          if (flexItem._hasRelCrossAxisSize()) {
            // As cross axis size might have changed, we need to recalc the relative flex item's size.
            flexItem._resetCrossAxisLayoutSize();
          }
        }

        switch (align) {
          case "flex-start":
            this._alignItemFlexStart(flexItem);

            break;

          case "flex-end":
            this._alignItemFlexEnd(flexItem);

            break;

          case "center":
            this._alignItemFlexCenter(flexItem);

            break;

          case "stretch":
            this._alignItemStretch(flexItem);

            break;
        }
      }
    }, {
      key: "_alignItemFlexStart",
      value: function _alignItemFlexStart(flexItem) {
        flexItem._setCrossAxisLayoutPos(this._crossAxisLayoutOffset);
      }
    }, {
      key: "_alignItemFlexEnd",
      value: function _alignItemFlexEnd(flexItem) {
        var itemCrossAxisSize = flexItem._getCrossAxisLayoutSizeWithPaddingAndMargin();

        flexItem._setCrossAxisLayoutPos(this._crossAxisLayoutOffset + (this._crossAxisLayoutSize - itemCrossAxisSize));
      }
    }, {
      key: "_alignItemFlexCenter",
      value: function _alignItemFlexCenter(flexItem) {
        var itemCrossAxisSize = flexItem._getCrossAxisLayoutSizeWithPaddingAndMargin();

        var center = (this._crossAxisLayoutSize - itemCrossAxisSize) / 2;

        flexItem._setCrossAxisLayoutPos(this._crossAxisLayoutOffset + center);
      }
    }, {
      key: "_alignItemStretch",
      value: function _alignItemStretch(flexItem) {
        flexItem._setCrossAxisLayoutPos(this._crossAxisLayoutOffset);

        var mainAxisLayoutSizeBeforeResize = flexItem._getMainAxisLayoutSize();

        var size = this._crossAxisLayoutSize - flexItem._getCrossAxisMargin() - flexItem._getCrossAxisPadding();

        var crossAxisMinSizeSetting = flexItem._getCrossAxisMinSizeSetting();

        if (crossAxisMinSizeSetting > 0) {
          size = Math.max(size, crossAxisMinSizeSetting);
        }

        var crossAxisMaxSizeSetting = flexItem._getCrossAxisMaxSizeSetting();

        var crossAxisMaxSizeSettingEnabled = crossAxisMaxSizeSetting > 0;

        if (crossAxisMaxSizeSettingEnabled) {
          size = Math.min(size, crossAxisMaxSizeSetting);
        }

        flexItem._resizeCrossAxis(size);

        var mainAxisLayoutSizeAfterResize = flexItem._getMainAxisLayoutSize();

        var recursiveResize = mainAxisLayoutSizeAfterResize !== mainAxisLayoutSizeBeforeResize;

        if (recursiveResize) {
          // Recursive resize can happen when this flex item has the opposite direction than the container
          // and is wrapping and auto-sizing. Due to item/content stretching the main axis size of the flex
          // item may decrease. If it does so, we must re-justify-content the complete line.
          // Notice that we don't account for changes to the (if autosized) main axis size caused by recursive
          // resize, which may cause the container's main axis to not shrink to the contents properly.
          // This is by design, because if we had re-run the main axis layout, we could run into issues such
          // as slow layout or endless loops.
          this._recursiveResizeOccured = true;
        }
      }
    }, {
      key: "_preventStretch",
      value: function _preventStretch(flexItem) {
        var hasFixedCrossAxisSize = flexItem._hasFixedCrossAxisSize();

        var forceStretch = flexItem.alignSelf === "stretch";
        return hasFixedCrossAxisSize && !forceStretch;
      }
    }, {
      key: "_layout",
      get: function get() {
        return this._line._layout;
      }
    }, {
      key: "_flexContainer",
      get: function get() {
        return this._layout._flexContainer;
      }
    }, {
      key: "recursiveResizeOccured",
      get: function get() {
        return this._recursiveResizeOccured;
      }
    }]);

    return ItemAligner;
  }();

  var LineLayout =
  /*#__PURE__*/
  function () {
    function LineLayout(layout, startIndex, endIndex, availableSpace) {
      _classCallCheck(this, LineLayout);

      this._layout = layout;
      this.items = layout.items;
      this.startIndex = startIndex;
      this.endIndex = endIndex;
      this._availableSpace = availableSpace;
    }

    _createClass(LineLayout, [{
      key: "performLayout",
      value: function performLayout() {
        this._setItemSizes();

        this.setItemPositions();

        this._calcLayoutInfo();
      }
    }, {
      key: "_setItemSizes",
      value: function _setItemSizes() {
        if (this._availableSpace > 0) {
          this._growItemSizes(this._availableSpace);
        } else if (this._availableSpace < 0) {
          this._shrinkItemSizes(-this._availableSpace);
        }
      }
    }, {
      key: "_growItemSizes",
      value: function _growItemSizes(amount) {
        var grower = new SizeGrower(this);
        grower.grow(amount);
        this._availableSpace -= grower.getGrownSize();
      }
    }, {
      key: "_shrinkItemSizes",
      value: function _shrinkItemSizes(amount) {
        var shrinker = new SizeShrinker(this);
        shrinker.shrink(amount);
        this._availableSpace += shrinker.getShrunkSize();
      }
    }, {
      key: "setItemPositions",
      value: function setItemPositions() {
        var positioner = new ItemPositioner(this);
        positioner.position();
      }
    }, {
      key: "createItemAligner",
      value: function createItemAligner() {
        return new ItemAligner(this);
      }
    }, {
      key: "_calcLayoutInfo",
      value: function _calcLayoutInfo() {
        this._calcCrossAxisMaxLayoutSize();
      }
    }, {
      key: "getMainAxisMinSize",
      value: function getMainAxisMinSize() {
        var mainAxisMinSize = 0;

        for (var i = this.startIndex; i <= this.endIndex; i++) {
          var item = this.items[i];
          mainAxisMinSize += item.flexItem._getMainAxisMinSizeWithPaddingAndMargin();
        }

        return mainAxisMinSize;
      }
    }, {
      key: "_calcCrossAxisMaxLayoutSize",
      value: function _calcCrossAxisMaxLayoutSize() {
        this._crossAxisMaxLayoutSize = this._getCrossAxisMaxLayoutSize();
      }
    }, {
      key: "_getCrossAxisMaxLayoutSize",
      value: function _getCrossAxisMaxLayoutSize() {
        var crossAxisMaxSize = 0;

        for (var i = this.startIndex; i <= this.endIndex; i++) {
          var item = this.items[i];
          crossAxisMaxSize = Math.max(crossAxisMaxSize, item.flexItem._getCrossAxisLayoutSizeWithPaddingAndMargin());
        }

        return crossAxisMaxSize;
      }
    }, {
      key: "numberOfItems",
      get: function get() {
        return this.endIndex - this.startIndex + 1;
      }
    }, {
      key: "crossAxisLayoutSize",
      get: function get() {
        var noSpecifiedCrossAxisSize = this._layout.isCrossAxisFitToContents() && !this._layout.resizingCrossAxis;
        var shouldFitToContents = this._layout.isWrapping() || noSpecifiedCrossAxisSize;

        if (shouldFitToContents) {
          return this._crossAxisMaxLayoutSize;
        } else {
          return this._layout.crossAxisSize;
        }
      }
    }]);

    return LineLayout;
  }();

  /**
   * Distributes items over layout lines.
   */

  var LineLayouter =
  /*#__PURE__*/
  function () {
    function LineLayouter(layout) {
      _classCallCheck(this, LineLayouter);

      this._layout = layout;
      this._mainAxisMinSize = -1;
      this._crossAxisMinSize = -1;
      this._mainAxisContentSize = 0;
    }

    _createClass(LineLayouter, [{
      key: "layoutLines",
      value: function layoutLines() {
        this._setup();

        var items = this._layout.items;

        var wrap = this._layout.isWrapping();

        var startIndex = 0;
        var i;
        var n = items.length;

        for (i = 0; i < n; i++) {
          var item = items[i];

          this._layoutFlexItem(item); // Get predicted main axis size.


          var itemMainAxisSize = item.flexItem._getMainAxisLayoutSizeWithPaddingAndMargin();

          if (wrap && i > startIndex) {
            var isOverflowing = this._curMainAxisPos + itemMainAxisSize > this._mainAxisSize;

            if (isOverflowing) {
              this._layoutLine(startIndex, i - 1);

              this._curMainAxisPos = 0;
              startIndex = i;
            }
          }

          this._addToMainAxisPos(itemMainAxisSize);
        }

        if (startIndex < i) {
          this._layoutLine(startIndex, i - 1);
        }
      }
    }, {
      key: "_layoutFlexItem",
      value: function _layoutFlexItem(item) {
        if (item.isFlexEnabled()) {
          item.flexLayout.updateTreeLayout();
        } else {
          item.flexItem._resetLayoutSize();
        }
      }
    }, {
      key: "_setup",
      value: function _setup() {
        this._mainAxisSize = this._layout.mainAxisSize;
        this._curMainAxisPos = 0;
        this._maxMainAxisPos = 0;
        this._lines = [];
        this._mainAxisMinSize = -1;
        this._crossAxisMinSize = -1;
        this._mainAxisContentSize = 0;
      }
    }, {
      key: "_addToMainAxisPos",
      value: function _addToMainAxisPos(itemMainAxisSize) {
        this._curMainAxisPos += itemMainAxisSize;

        if (this._curMainAxisPos > this._maxMainAxisPos) {
          this._maxMainAxisPos = this._curMainAxisPos;
        }
      }
    }, {
      key: "_layoutLine",
      value: function _layoutLine(startIndex, endIndex) {
        var availableSpace = this._getAvailableMainAxisLayoutSpace();

        var line = new LineLayout(this._layout, startIndex, endIndex, availableSpace);
        line.performLayout();

        this._lines.push(line);

        if (this._mainAxisContentSize === 0 || this._curMainAxisPos > this._mainAxisContentSize) {
          this._mainAxisContentSize = this._curMainAxisPos;
        }
      }
    }, {
      key: "_getAvailableMainAxisLayoutSpace",
      value: function _getAvailableMainAxisLayoutSpace() {
        if (!this._layout.resizingMainAxis && this._layout.isMainAxisFitToContents()) {
          return 0;
        } else {
          return this._mainAxisSize - this._curMainAxisPos;
        }
      }
    }, {
      key: "_getCrossAxisMinSize",
      value: function _getCrossAxisMinSize() {
        var crossAxisMinSize = 0;
        var items = this._layout.items;

        for (var i = 0, n = items.length; i < n; i++) {
          var item = items[i];

          var itemCrossAxisMinSize = item.flexItem._getCrossAxisMinSizeWithPaddingAndMargin();

          crossAxisMinSize = Math.max(crossAxisMinSize, itemCrossAxisMinSize);
        }

        return crossAxisMinSize;
      }
    }, {
      key: "_getMainAxisMinSize",
      value: function _getMainAxisMinSize() {
        if (this._lines.length === 1) {
          return this._lines[0].getMainAxisMinSize();
        } else {
          // Wrapping lines: specified width is used as min width (in accordance to W3C flexbox).
          return this._layout.mainAxisSize;
        }
      }
    }, {
      key: "lines",
      get: function get() {
        return this._lines;
      }
    }, {
      key: "mainAxisMinSize",
      get: function get() {
        if (this._mainAxisMinSize === -1) {
          this._mainAxisMinSize = this._getMainAxisMinSize();
        }

        return this._mainAxisMinSize;
      }
    }, {
      key: "crossAxisMinSize",
      get: function get() {
        if (this._crossAxisMinSize === -1) {
          this._crossAxisMinSize = this._getCrossAxisMinSize();
        }

        return this._crossAxisMinSize;
      }
    }, {
      key: "mainAxisContentSize",
      get: function get() {
        return this._mainAxisContentSize;
      }
    }]);

    return LineLayouter;
  }();

  var ItemCoordinatesUpdater =
  /*#__PURE__*/
  function () {
    function ItemCoordinatesUpdater(layout) {
      _classCallCheck(this, ItemCoordinatesUpdater);

      this._layout = layout;
      this._isReverse = this._flexContainer._reverse;
      this._horizontalPaddingOffset = this._layout._getHorizontalPaddingOffset();
      this._verticalPaddingOffset = this._layout._getVerticalPaddingOffset();
    }

    _createClass(ItemCoordinatesUpdater, [{
      key: "finalize",
      value: function finalize() {
        var parentFlex = this._layout.getParentFlexContainer();

        if (parentFlex) {
          // We must update it from the parent to set padding offsets and reverse position.
          var updater = new ItemCoordinatesUpdater(parentFlex._layout);

          updater._finalizeItemAndChildren(this._flexContainer.item);
        } else {
          this._finalizeRoot();

          this._finalizeItems();
        }
      }
    }, {
      key: "_finalizeRoot",
      value: function _finalizeRoot() {
        var item = this._flexContainer.item;
        var x = FlexUtils.getAxisLayoutPos(item, true);
        var y = FlexUtils.getAxisLayoutPos(item, false);
        var w = FlexUtils.getAxisLayoutSize(item, true);
        var h = FlexUtils.getAxisLayoutSize(item, false);
        w += this._layout._getHorizontalPadding();
        h += this._layout._getVerticalPadding();
        item.clearRecalcFlag();
        item.setLayout(x, y, w, h);
      }
    }, {
      key: "_finalizeItems",
      value: function _finalizeItems() {
        var items = this._layout.items;

        for (var i = 0, n = items.length; i < n; i++) {
          var item = items[i];

          var validCache = this._validateItemCache(item); // Notice that we must also finalize a cached items, as it's coordinates may have changed.


          this._finalizeItem(item);

          if (!validCache) {
            this._finalizeItemChildren(item);
          }
        }
      }
    }, {
      key: "_validateItemCache",
      value: function _validateItemCache(item) {
        if (item.recalc === 0) {
          if (item.isFlexEnabled()) {
            var layout = item._flex._layout;
            var dimensionsMatchPreviousResult = item.w === item.target.w && item.h === item.target.h;

            if (dimensionsMatchPreviousResult) {
              // Cache is valid.
              return true;
            } else {
              var crossAxisSize = layout.crossAxisSize;
              layout.performResizeMainAxis(layout.mainAxisSize);
              layout.performResizeCrossAxis(crossAxisSize);
            }
          }
        }

        return false;
      }
    }, {
      key: "_finalizeItemAndChildren",
      value: function _finalizeItemAndChildren(item) {
        this._finalizeItem(item);

        this._finalizeItemChildren(item);
      }
    }, {
      key: "_finalizeItem",
      value: function _finalizeItem(item) {
        if (this._isReverse) {
          this._reverseMainAxisLayoutPos(item);
        }

        var x = FlexUtils.getAxisLayoutPos(item, true);
        var y = FlexUtils.getAxisLayoutPos(item, false);
        var w = FlexUtils.getAxisLayoutSize(item, true);
        var h = FlexUtils.getAxisLayoutSize(item, false);
        x += this._horizontalPaddingOffset;
        y += this._verticalPaddingOffset;
        var flex = item.flex;

        if (flex) {
          w += item._flex._layout._getHorizontalPadding();
          h += item._flex._layout._getVerticalPadding();
        }

        var flexItem = item.flexItem;

        if (flexItem) {
          x += flexItem._getHorizontalMarginOffset();
          y += flexItem._getVerticalMarginOffset();
        }

        item.clearRecalcFlag();
        item.setLayout(x, y, w, h);
      }
    }, {
      key: "_finalizeItemChildren",
      value: function _finalizeItemChildren(item) {
        var flex = item._flex;

        if (flex) {
          var updater = new ItemCoordinatesUpdater(flex._layout);

          updater._finalizeItems();
        }
      }
    }, {
      key: "_reverseMainAxisLayoutPos",
      value: function _reverseMainAxisLayoutPos(item) {
        var endPos = item.flexItem._getMainAxisLayoutPos() + item.flexItem._getMainAxisLayoutSizeWithPaddingAndMargin();

        var reversedPos = this._layout.mainAxisSize - endPos;

        item.flexItem._setMainAxisLayoutPos(reversedPos);
      }
    }, {
      key: "_flexContainer",
      get: function get() {
        return this._layout._flexContainer;
      }
    }]);

    return ItemCoordinatesUpdater;
  }();

  /**
   * Layouts a flex container (and descendants).
   */

  var FlexLayout =
  /*#__PURE__*/
  function () {
    function FlexLayout(flexContainer) {
      _classCallCheck(this, FlexLayout);

      this._flexContainer = flexContainer;
      this._lineLayouter = new LineLayouter(this);
      this._resizingMainAxis = false;
      this._resizingCrossAxis = false;
      this._cachedMainAxisSizeAfterLayout = 0;
      this._cachedCrossAxisSizeAfterLayout = 0;
      this._shrunk = false;
    }

    _createClass(FlexLayout, [{
      key: "layoutTree",
      value: function layoutTree() {
        var isSubTree = this.item.flexParent !== null;

        if (isSubTree) {
          // Use the dimensions set by the parent flex tree.
          this._updateSubTreeLayout();
        } else {
          this.updateTreeLayout();
        }

        this.updateItemCoords();
      }
    }, {
      key: "updateTreeLayout",
      value: function updateTreeLayout() {
        if (this.recalc) {
          this._performUpdateLayoutTree();
        } else {
          this._performUpdateLayoutTreeFromCache();
        }
      }
    }, {
      key: "_performUpdateLayoutTree",
      value: function _performUpdateLayoutTree() {
        this._setInitialAxisSizes();

        this._layoutAxes();

        this._refreshLayoutCache();
      }
    }, {
      key: "_refreshLayoutCache",
      value: function _refreshLayoutCache() {
        this._cachedMainAxisSizeAfterLayout = this.mainAxisSize;
        this._cachedCrossAxisSizeAfterLayout = this.crossAxisSize;
      }
    }, {
      key: "_performUpdateLayoutTreeFromCache",
      value: function _performUpdateLayoutTreeFromCache() {
        var sizeMightHaveChanged = this.item.funcW || this.item.funcH;

        if (sizeMightHaveChanged) {
          // Update after all.
          this.item.enableLocalRecalcFlag();

          this._performUpdateLayoutTree();
        } else {
          this.mainAxisSize = this._cachedMainAxisSizeAfterLayout;
          this.crossAxisSize = this._cachedCrossAxisSizeAfterLayout;
        }
      }
    }, {
      key: "updateItemCoords",
      value: function updateItemCoords() {
        var updater = new ItemCoordinatesUpdater(this);
        updater.finalize();
      }
    }, {
      key: "_updateSubTreeLayout",
      value: function _updateSubTreeLayout() {
        // The dimensions of this container are guaranteed not to have changed.
        // That's why we can safely 'reuse' those and re-layout the contents.
        var crossAxisSize = this.crossAxisSize;

        this._layoutMainAxis();

        this.performResizeCrossAxis(crossAxisSize);
      }
    }, {
      key: "_setInitialAxisSizes",
      value: function _setInitialAxisSizes() {
        if (this.item.isFlexItemEnabled()) {
          this.item.flexItem._resetLayoutSize();
        } else {
          this.mainAxisSize = this._getMainAxisBasis();
          this.crossAxisSize = this._getCrossAxisBasis();
        }

        this._resizingMainAxis = false;
        this._resizingCrossAxis = false;
        this._shrunk = false;
      }
    }, {
      key: "_layoutAxes",
      value: function _layoutAxes() {
        this._layoutMainAxis();

        this._layoutCrossAxis();
      }
      /**
       * @pre mainAxisSize should exclude padding.
       */

    }, {
      key: "_layoutMainAxis",
      value: function _layoutMainAxis() {
        this._layoutLines();

        this._fitMainAxisSizeToContents();
      }
    }, {
      key: "_layoutLines",
      value: function _layoutLines() {
        this._lineLayouter.layoutLines();
      }
    }, {
      key: "_fitMainAxisSizeToContents",
      value: function _fitMainAxisSizeToContents() {
        if (!this._resizingMainAxis) {
          if (this.isMainAxisFitToContents()) {
            this.mainAxisSize = this._lineLayouter.mainAxisContentSize;
          }
        }
      }
      /**
       * @pre crossAxisSize should exclude padding.
       */

    }, {
      key: "_layoutCrossAxis",
      value: function _layoutCrossAxis() {
        var aligner = new ContentAligner(this);
        aligner.init();
        this._totalCrossAxisSize = aligner.totalCrossAxisSize;

        this._fitCrossAxisSizeToContents();

        aligner.align();
      }
    }, {
      key: "_fitCrossAxisSizeToContents",
      value: function _fitCrossAxisSizeToContents() {
        if (!this._resizingCrossAxis) {
          if (this.isCrossAxisFitToContents()) {
            this.crossAxisSize = this._totalCrossAxisSize;
          }
        }
      }
    }, {
      key: "isWrapping",
      value: function isWrapping() {
        return this._flexContainer.wrap;
      }
    }, {
      key: "isAxisFitToContents",
      value: function isAxisFitToContents(horizontal) {
        if (this._horizontal === horizontal) {
          return this.isMainAxisFitToContents();
        } else {
          return this.isCrossAxisFitToContents();
        }
      }
    }, {
      key: "isMainAxisFitToContents",
      value: function isMainAxisFitToContents() {
        return !this.isWrapping() && !this._hasFixedMainAxisBasis();
      }
    }, {
      key: "isCrossAxisFitToContents",
      value: function isCrossAxisFitToContents() {
        return !this._hasFixedCrossAxisBasis();
      }
    }, {
      key: "_hasFixedMainAxisBasis",
      value: function _hasFixedMainAxisBasis() {
        return !FlexUtils.isZeroAxisSize(this.item, this._horizontal);
      }
    }, {
      key: "_hasFixedCrossAxisBasis",
      value: function _hasFixedCrossAxisBasis() {
        return !FlexUtils.isZeroAxisSize(this.item, !this._horizontal);
      }
    }, {
      key: "getAxisMinSize",
      value: function getAxisMinSize(horizontal) {
        if (this._horizontal === horizontal) {
          return this._getMainAxisMinSize();
        } else {
          return this._getCrossAxisMinSize();
        }
      }
    }, {
      key: "_getMainAxisMinSize",
      value: function _getMainAxisMinSize() {
        return this._lineLayouter.mainAxisMinSize;
      }
    }, {
      key: "_getCrossAxisMinSize",
      value: function _getCrossAxisMinSize() {
        return this._lineLayouter.crossAxisMinSize;
      }
    }, {
      key: "resizeMainAxis",
      value: function resizeMainAxis(size) {
        if (this.mainAxisSize !== size) {
          if (this.recalc > 0) {
            this.performResizeMainAxis(size);
          } else {
            if (this._checkValidCacheMainAxisResize()) {
              this.mainAxisSize = size;

              this._fitCrossAxisSizeToContents();
            } else {
              // Cache miss.
              this.item.enableLocalRecalcFlag();
              this.performResizeMainAxis(size);
            }
          }
        }
      }
    }, {
      key: "_checkValidCacheMainAxisResize",
      value: function _checkValidCacheMainAxisResize(size) {
        var isFinalMainAxisSize = size === this.targetMainAxisSize;

        if (isFinalMainAxisSize) {
          return true;
        }

        var canIgnoreCacheMiss = !this.isCrossAxisFitToContents();

        if (canIgnoreCacheMiss) {
          // Allow other main axis resizes and check if final resize matches the target main axis size
          //  (ItemCoordinatesUpdater).
          return true;
        }

        return false;
      }
    }, {
      key: "performResizeMainAxis",
      value: function performResizeMainAxis(size) {
        var isShrinking = size < this.mainAxisSize;
        this._shrunk = isShrinking;
        this.mainAxisSize = size;
        this._resizingMainAxis = true;

        this._layoutAxes();

        this._resizingMainAxis = false;
      }
    }, {
      key: "resizeCrossAxis",
      value: function resizeCrossAxis(size) {
        if (this.crossAxisSize !== size) {
          if (this.recalc > 0) {
            this.performResizeCrossAxis(size);
          } else {
            this.crossAxisSize = size;
          }
        }
      }
    }, {
      key: "performResizeCrossAxis",
      value: function performResizeCrossAxis(size) {
        this.crossAxisSize = size;
        this._resizingCrossAxis = true;

        this._layoutCrossAxis();

        this._resizingCrossAxis = false;
      }
    }, {
      key: "getParentFlexContainer",
      value: function getParentFlexContainer() {
        return this.item.isFlexItemEnabled() ? this.item.flexItem.ctr : null;
      }
    }, {
      key: "_getHorizontalPadding",
      value: function _getHorizontalPadding() {
        return FlexUtils.getTotalPadding(this.item, true);
      }
    }, {
      key: "_getVerticalPadding",
      value: function _getVerticalPadding() {
        return FlexUtils.getTotalPadding(this.item, false);
      }
    }, {
      key: "_getHorizontalPaddingOffset",
      value: function _getHorizontalPaddingOffset() {
        return FlexUtils.getPaddingOffset(this.item, true);
      }
    }, {
      key: "_getVerticalPaddingOffset",
      value: function _getVerticalPaddingOffset() {
        return FlexUtils.getPaddingOffset(this.item, false);
      }
    }, {
      key: "_getMainAxisBasis",
      value: function _getMainAxisBasis() {
        return FlexUtils.getRelAxisSize(this.item, this._horizontal);
      }
    }, {
      key: "_getCrossAxisBasis",
      value: function _getCrossAxisBasis() {
        return FlexUtils.getRelAxisSize(this.item, !this._horizontal);
      }
    }, {
      key: "shrunk",
      get: function get() {
        return this._shrunk;
      }
    }, {
      key: "recalc",
      get: function get() {
        return this.item.recalc;
      }
    }, {
      key: "_lines",
      get: function get() {
        return this._lineLayouter.lines;
      }
    }, {
      key: "targetMainAxisSize",
      get: function get() {
        return this._horizontal ? this.item.target.w : this.item.target.h;
      }
    }, {
      key: "targetCrossAxisSize",
      get: function get() {
        return this._horizontal ? this.item.target.h : this.item.target.w;
      }
    }, {
      key: "_horizontal",
      get: function get() {
        return this._flexContainer._horizontal;
      }
    }, {
      key: "_reverse",
      get: function get() {
        return this._flexContainer._reverse;
      }
    }, {
      key: "item",
      get: function get() {
        return this._flexContainer.item;
      }
    }, {
      key: "items",
      get: function get() {
        return this.item.items;
      }
    }, {
      key: "resizingMainAxis",
      get: function get() {
        return this._resizingMainAxis;
      }
    }, {
      key: "resizingCrossAxis",
      get: function get() {
        return this._resizingCrossAxis;
      }
    }, {
      key: "numberOfItems",
      get: function get() {
        return this.items.length;
      }
    }, {
      key: "mainAxisSize",
      get: function get() {
        return FlexUtils.getAxisLayoutSize(this.item, this._horizontal);
      },
      set: function set(v) {
        FlexUtils.setAxisLayoutSize(this.item, this._horizontal, v);
      }
    }, {
      key: "crossAxisSize",
      get: function get() {
        return FlexUtils.getAxisLayoutSize(this.item, !this._horizontal);
      },
      set: function set(v) {
        FlexUtils.setAxisLayoutSize(this.item, !this._horizontal, v);
      }
    }]);

    return FlexLayout;
  }();

  var FlexContainer =
  /*#__PURE__*/
  function () {
    function FlexContainer(item) {
      _classCallCheck(this, FlexContainer);

      this._item = item;
      this._layout = new FlexLayout(this);
      this._horizontal = true;
      this._reverse = false;
      this._wrap = false;
      this._alignItems = 'stretch';
      this._justifyContent = 'flex-start';
      this._alignContent = 'flex-start';
      this._paddingLeft = 0;
      this._paddingTop = 0;
      this._paddingRight = 0;
      this._paddingBottom = 0;
    }

    _createClass(FlexContainer, [{
      key: "_changedDimensions",
      value: function _changedDimensions() {
        this._item.changedDimensions();
      }
    }, {
      key: "_changedContents",
      value: function _changedContents() {
        this._item.changedContents();
      }
    }, {
      key: "patch",
      value: function patch(settings) {
        Base.patchObject(this, settings);
      }
    }, {
      key: "item",
      get: function get() {
        return this._item;
      }
    }, {
      key: "direction",
      get: function get() {
        return (this._horizontal ? "row" : "column") + (this._reverse ? "-reverse" : "");
      },
      set: function set(f) {
        if (this.direction === f) return;
        this._horizontal = f === 'row' || f === 'row-reverse';
        this._reverse = f === 'row-reverse' || f === 'column-reverse';

        this._changedContents();
      }
    }, {
      key: "wrap",
      set: function set(v) {
        this._wrap = v;

        this._changedContents();
      },
      get: function get() {
        return this._wrap;
      }
    }, {
      key: "alignItems",
      get: function get() {
        return this._alignItems;
      },
      set: function set(v) {
        if (this._alignItems === v) return;

        if (FlexContainer.ALIGN_ITEMS.indexOf(v) === -1) {
          throw new Error("Unknown alignItems, options: " + FlexContainer.ALIGN_ITEMS.join(","));
        }

        this._alignItems = v;

        this._changedContents();
      }
    }, {
      key: "alignContent",
      get: function get() {
        return this._alignContent;
      },
      set: function set(v) {
        if (this._alignContent === v) return;

        if (FlexContainer.ALIGN_CONTENT.indexOf(v) === -1) {
          throw new Error("Unknown alignContent, options: " + FlexContainer.ALIGN_CONTENT.join(","));
        }

        this._alignContent = v;

        this._changedContents();
      }
    }, {
      key: "justifyContent",
      get: function get() {
        return this._justifyContent;
      },
      set: function set(v) {
        if (this._justifyContent === v) return;

        if (FlexContainer.JUSTIFY_CONTENT.indexOf(v) === -1) {
          throw new Error("Unknown justifyContent, options: " + FlexContainer.JUSTIFY_CONTENT.join(","));
        }

        this._justifyContent = v;

        this._changedContents();
      }
    }, {
      key: "padding",
      set: function set(v) {
        this.paddingLeft = v;
        this.paddingTop = v;
        this.paddingRight = v;
        this.paddingBottom = v;
      },
      get: function get() {
        return this.paddingLeft;
      }
    }, {
      key: "paddingLeft",
      set: function set(v) {
        this._paddingLeft = v;

        this._changedDimensions();
      },
      get: function get() {
        return this._paddingLeft;
      }
    }, {
      key: "paddingTop",
      set: function set(v) {
        this._paddingTop = v;

        this._changedDimensions();
      },
      get: function get() {
        return this._paddingTop;
      }
    }, {
      key: "paddingRight",
      set: function set(v) {
        this._paddingRight = v;

        this._changedDimensions();
      },
      get: function get() {
        return this._paddingRight;
      }
    }, {
      key: "paddingBottom",
      set: function set(v) {
        this._paddingBottom = v;

        this._changedDimensions();
      },
      get: function get() {
        return this._paddingBottom;
      }
    }]);

    return FlexContainer;
  }();
  FlexContainer.ALIGN_ITEMS = ["flex-start", "flex-end", "center", "stretch"];
  FlexContainer.ALIGN_CONTENT = ["flex-start", "flex-end", "center", "space-between", "space-around", "space-evenly", "stretch"];
  FlexContainer.JUSTIFY_CONTENT = ["flex-start", "flex-end", "center", "space-between", "space-around", "space-evenly"];

  var FlexItem =
  /*#__PURE__*/
  function () {
    function FlexItem(item) {
      _classCallCheck(this, FlexItem);

      this._ctr = null;
      this._item = item;
      this._grow = 0;
      this._shrink = FlexItem.SHRINK_AUTO;
      this._alignSelf = undefined;
      this._minWidth = 0;
      this._minHeight = 0;
      this._maxWidth = 0;
      this._maxHeight = 0;
      this._marginLeft = 0;
      this._marginTop = 0;
      this._marginRight = 0;
      this._marginBottom = 0;
    }

    _createClass(FlexItem, [{
      key: "_getDefaultShrink",
      value: function _getDefaultShrink() {
        if (this.item.isFlexEnabled()) {
          return 1;
        } else {
          // All non-flex containers are absolutely positioned items with fixed dimensions, and by default not shrinkable.
          return 0;
        }
      }
    }, {
      key: "_changed",
      value: function _changed() {
        if (this.ctr) this.ctr._changedContents();
      }
    }, {
      key: "patch",
      value: function patch(settings) {
        Base.patchObject(this, settings);
      }
    }, {
      key: "_resetLayoutSize",
      value: function _resetLayoutSize() {
        this._resetHorizontalAxisLayoutSize();

        this._resetVerticalAxisLayoutSize();
      }
    }, {
      key: "_resetCrossAxisLayoutSize",
      value: function _resetCrossAxisLayoutSize() {
        if (this.ctr._horizontal) {
          this._resetVerticalAxisLayoutSize();
        } else {
          this._resetHorizontalAxisLayoutSize();
        }
      }
    }, {
      key: "_resetHorizontalAxisLayoutSize",
      value: function _resetHorizontalAxisLayoutSize() {
        var w = FlexUtils.getRelAxisSize(this.item, true);

        if (this._minWidth) {
          w = Math.max(this._minWidth, w);
        }

        if (this._maxWidth) {
          w = Math.min(this._maxWidth, w);
        }

        FlexUtils.setAxisLayoutSize(this.item, true, w);
      }
    }, {
      key: "_resetVerticalAxisLayoutSize",
      value: function _resetVerticalAxisLayoutSize() {
        var h = FlexUtils.getRelAxisSize(this.item, false);

        if (this._minHeight) {
          h = Math.max(this._minHeight, h);
        }

        if (this._maxHeight) {
          h = Math.min(this._maxHeight, h);
        }

        FlexUtils.setAxisLayoutSize(this.item, false, h);
      }
    }, {
      key: "_getCrossAxisMinSizeSetting",
      value: function _getCrossAxisMinSizeSetting() {
        return this._getMinSizeSetting(!this.ctr._horizontal);
      }
    }, {
      key: "_getCrossAxisMaxSizeSetting",
      value: function _getCrossAxisMaxSizeSetting() {
        return this._getMaxSizeSetting(!this.ctr._horizontal);
      }
    }, {
      key: "_getMainAxisMaxSizeSetting",
      value: function _getMainAxisMaxSizeSetting() {
        return this._getMaxSizeSetting(this.ctr._horizontal);
      }
    }, {
      key: "_getMinSizeSetting",
      value: function _getMinSizeSetting(horizontal) {
        if (horizontal) {
          return this._minWidth;
        } else {
          return this._minHeight;
        }
      }
    }, {
      key: "_getMaxSizeSetting",
      value: function _getMaxSizeSetting(horizontal) {
        if (horizontal) {
          return this._maxWidth;
        } else {
          return this._maxHeight;
        }
      }
    }, {
      key: "_getMainAxisMinSize",
      value: function _getMainAxisMinSize() {
        return FlexUtils.getAxisMinSize(this.item, this.ctr._horizontal);
      }
    }, {
      key: "_getCrossAxisMinSize",
      value: function _getCrossAxisMinSize() {
        return FlexUtils.getAxisMinSize(this.item, !this.ctr._horizontal);
      }
    }, {
      key: "_getMainAxisLayoutSize",
      value: function _getMainAxisLayoutSize() {
        return FlexUtils.getAxisLayoutSize(this.item, this.ctr._horizontal);
      }
    }, {
      key: "_getMainAxisLayoutPos",
      value: function _getMainAxisLayoutPos() {
        return FlexUtils.getAxisLayoutPos(this.item, this.ctr._horizontal);
      }
    }, {
      key: "_setMainAxisLayoutPos",
      value: function _setMainAxisLayoutPos(pos) {
        return FlexUtils.setAxisLayoutPos(this.item, this.ctr._horizontal, pos);
      }
    }, {
      key: "_setCrossAxisLayoutPos",
      value: function _setCrossAxisLayoutPos(pos) {
        return FlexUtils.setAxisLayoutPos(this.item, !this.ctr._horizontal, pos);
      }
    }, {
      key: "_getCrossAxisLayoutSize",
      value: function _getCrossAxisLayoutSize() {
        return FlexUtils.getAxisLayoutSize(this.item, !this.ctr._horizontal);
      }
    }, {
      key: "_resizeCrossAxis",
      value: function _resizeCrossAxis(size) {
        return FlexUtils.resizeAxis(this.item, !this.ctr._horizontal, size);
      }
    }, {
      key: "_resizeMainAxis",
      value: function _resizeMainAxis(size) {
        return FlexUtils.resizeAxis(this.item, this.ctr._horizontal, size);
      }
    }, {
      key: "_getMainAxisPadding",
      value: function _getMainAxisPadding() {
        return FlexUtils.getTotalPadding(this.item, this.ctr._horizontal);
      }
    }, {
      key: "_getCrossAxisPadding",
      value: function _getCrossAxisPadding() {
        return FlexUtils.getTotalPadding(this.item, !this.ctr._horizontal);
      }
    }, {
      key: "_getMainAxisMargin",
      value: function _getMainAxisMargin() {
        return FlexUtils.getTotalMargin(this.item, this.ctr._horizontal);
      }
    }, {
      key: "_getCrossAxisMargin",
      value: function _getCrossAxisMargin() {
        return FlexUtils.getTotalMargin(this.item, !this.ctr._horizontal);
      }
    }, {
      key: "_getHorizontalMarginOffset",
      value: function _getHorizontalMarginOffset() {
        return FlexUtils.getMarginOffset(this.item, true);
      }
    }, {
      key: "_getVerticalMarginOffset",
      value: function _getVerticalMarginOffset() {
        return FlexUtils.getMarginOffset(this.item, false);
      }
    }, {
      key: "_getMainAxisMinSizeWithPaddingAndMargin",
      value: function _getMainAxisMinSizeWithPaddingAndMargin() {
        return this._getMainAxisMinSize() + this._getMainAxisPadding() + this._getMainAxisMargin();
      }
    }, {
      key: "_getCrossAxisMinSizeWithPaddingAndMargin",
      value: function _getCrossAxisMinSizeWithPaddingAndMargin() {
        return this._getCrossAxisMinSize() + this._getCrossAxisPadding() + this._getCrossAxisMargin();
      }
    }, {
      key: "_getMainAxisLayoutSizeWithPaddingAndMargin",
      value: function _getMainAxisLayoutSizeWithPaddingAndMargin() {
        return this._getMainAxisLayoutSize() + this._getMainAxisPadding() + this._getMainAxisMargin();
      }
    }, {
      key: "_getCrossAxisLayoutSizeWithPaddingAndMargin",
      value: function _getCrossAxisLayoutSizeWithPaddingAndMargin() {
        return this._getCrossAxisLayoutSize() + this._getCrossAxisPadding() + this._getCrossAxisMargin();
      }
    }, {
      key: "_hasFixedCrossAxisSize",
      value: function _hasFixedCrossAxisSize() {
        return !FlexUtils.isZeroAxisSize(this.item, !this.ctr._horizontal);
      }
    }, {
      key: "_hasRelCrossAxisSize",
      value: function _hasRelCrossAxisSize() {
        return !!(this.ctr._horizontal ? this.item.funcH : this.item.funcW);
      }
    }, {
      key: "item",
      get: function get() {
        return this._item;
      }
    }, {
      key: "grow",
      get: function get() {
        return this._grow;
      },
      set: function set(v) {
        if (this._grow === v) return;
        this._grow = parseInt(v) || 0;

        this._changed();
      }
    }, {
      key: "shrink",
      get: function get() {
        if (this._shrink === FlexItem.SHRINK_AUTO) {
          return this._getDefaultShrink();
        }

        return this._shrink;
      },
      set: function set(v) {
        if (this._shrink === v) return;
        this._shrink = parseInt(v) || 0;

        this._changed();
      }
    }, {
      key: "alignSelf",
      get: function get() {
        return this._alignSelf;
      },
      set: function set(v) {
        if (this._alignSelf === v) return;

        if (v === undefined) {
          this._alignSelf = undefined;
        } else {
          if (FlexContainer.ALIGN_ITEMS.indexOf(v) === -1) {
            throw new Error("Unknown alignSelf, options: " + FlexContainer.ALIGN_ITEMS.join(","));
          }

          this._alignSelf = v;
        }

        this._changed();
      }
    }, {
      key: "minWidth",
      get: function get() {
        return this._minWidth;
      },
      set: function set(v) {
        this._minWidth = Math.max(0, v);

        this._item.changedDimensions(true, false);
      }
    }, {
      key: "minHeight",
      get: function get() {
        return this._minHeight;
      },
      set: function set(v) {
        this._minHeight = Math.max(0, v);

        this._item.changedDimensions(false, true);
      }
    }, {
      key: "maxWidth",
      get: function get() {
        return this._maxWidth;
      },
      set: function set(v) {
        this._maxWidth = Math.max(0, v);

        this._item.changedDimensions(true, false);
      }
    }, {
      key: "maxHeight",
      get: function get() {
        return this._maxHeight;
      },
      set: function set(v) {
        this._maxHeight = Math.max(0, v);

        this._item.changedDimensions(false, true);
      }
      /**
       * @note margins behave slightly different than in HTML with regard to shrinking.
       * In HTML, (outer) margins can be removed when shrinking. In this engine, they will not shrink at all.
       */

    }, {
      key: "margin",
      set: function set(v) {
        this.marginLeft = v;
        this.marginTop = v;
        this.marginRight = v;
        this.marginBottom = v;
      },
      get: function get() {
        return this.marginLeft;
      }
    }, {
      key: "marginLeft",
      set: function set(v) {
        this._marginLeft = v;

        this._changed();
      },
      get: function get() {
        return this._marginLeft;
      }
    }, {
      key: "marginTop",
      set: function set(v) {
        this._marginTop = v;

        this._changed();
      },
      get: function get() {
        return this._marginTop;
      }
    }, {
      key: "marginRight",
      set: function set(v) {
        this._marginRight = v;

        this._changed();
      },
      get: function get() {
        return this._marginRight;
      }
    }, {
      key: "marginBottom",
      set: function set(v) {
        this._marginBottom = v;

        this._changed();
      },
      get: function get() {
        return this._marginBottom;
      }
    }, {
      key: "ctr",
      set: function set(v) {
        this._ctr = v;
      },
      get: function get() {
        return this._ctr;
      }
    }]);

    return FlexItem;
  }();
  FlexItem.SHRINK_AUTO = -1;

  /**
   * This is the connection between the render tree with the layout tree of this flex container/item.
   */

  var FlexTarget =
  /*#__PURE__*/
  function () {
    function FlexTarget(target) {
      _classCallCheck(this, FlexTarget);

      this._target = target;
      /**
       * Possible values (only in case of container):
       * bit 0: has changed or contains items with changes
       * bit 1: width changed
       * bit 2: height changed
       */

      this._recalc = 0;
      this._enabled = false;
      this.x = 0;
      this.y = 0;
      this.w = 0;
      this.h = 0;
      this._originalX = 0;
      this._originalY = 0;
      this._originalWidth = 0;
      this._originalHeight = 0;
      this._flex = null;
      this._flexItem = null;
      this._flexItemDisabled = false;
      this._items = null;
    }

    _createClass(FlexTarget, [{
      key: "layoutFlexTree",
      value: function layoutFlexTree() {
        if (this.isFlexEnabled() && this.isChanged()) {
          this.flexLayout.layoutTree();
        }
      }
    }, {
      key: "_enableFlex",
      value: function _enableFlex() {
        this._flex = new FlexContainer(this);

        this._checkEnabled();

        this.changedDimensions();

        this._enableChildrenAsFlexItems();
      }
    }, {
      key: "_disableFlex",
      value: function _disableFlex() {
        this.changedDimensions();
        this._flex = null;

        this._checkEnabled();

        this._disableChildrenAsFlexItems();
      }
    }, {
      key: "_enableChildrenAsFlexItems",
      value: function _enableChildrenAsFlexItems() {
        var children = this._target._children;

        if (children) {
          for (var i = 0, n = children.length; i < n; i++) {
            var child = children[i];

            child.layout._enableFlexItem();
          }
        }
      }
    }, {
      key: "_disableChildrenAsFlexItems",
      value: function _disableChildrenAsFlexItems() {
        var children = this._target._children;

        if (children) {
          for (var i = 0, n = children.length; i < n; i++) {
            var child = children[i];

            child.layout._disableFlexItem();
          }
        }
      }
    }, {
      key: "_enableFlexItem",
      value: function _enableFlexItem() {
        this._ensureFlexItem();

        var flexParent = this._target._parent._layout;
        this._flexItem.ctr = flexParent._flex;
        flexParent.changedContents();

        this._checkEnabled();
      }
    }, {
      key: "_disableFlexItem",
      value: function _disableFlexItem() {
        if (this._flexItem) {
          this._flexItem.ctr = null;
        } // We keep the flexItem object because it may contain custom settings.


        this._checkEnabled(); // Offsets have been changed. We can't recover them, so we'll just clear them instead.


        this._resetOffsets();
      }
    }, {
      key: "_resetOffsets",
      value: function _resetOffsets() {
        this.x = 0;
        this.y = 0;
      }
    }, {
      key: "_ensureFlexItem",
      value: function _ensureFlexItem() {
        if (!this._flexItem) {
          this._flexItem = new FlexItem(this);
        }
      }
    }, {
      key: "_checkEnabled",
      value: function _checkEnabled() {
        var enabled = this.isEnabled();

        if (this._enabled !== enabled) {
          if (enabled) {
            this._enable();
          } else {
            this._disable();
          }

          this._enabled = enabled;
        }
      }
    }, {
      key: "_enable",
      value: function _enable() {
        this._setupTargetForFlex();

        this._target.enableFlexLayout();
      }
    }, {
      key: "_disable",
      value: function _disable() {
        this._restoreTargetToNonFlex();

        this._target.disableFlexLayout();
      }
    }, {
      key: "isEnabled",
      value: function isEnabled() {
        return this.isFlexEnabled() || this.isFlexItemEnabled();
      }
    }, {
      key: "isFlexEnabled",
      value: function isFlexEnabled() {
        return this._flex !== null;
      }
    }, {
      key: "isFlexItemEnabled",
      value: function isFlexItemEnabled() {
        return this.flexParent !== null;
      }
    }, {
      key: "_restoreTargetToNonFlex",
      value: function _restoreTargetToNonFlex() {
        var target = this._target;
        target.x = this._originalX;
        target.y = this._originalY;
        target.setDimensions(this._originalWidth, this._originalHeight);
      }
    }, {
      key: "_setupTargetForFlex",
      value: function _setupTargetForFlex() {
        var target = this._target;
        this._originalX = target._x;
        this._originalY = target._y;
        this._originalWidth = target._w;
        this._originalHeight = target._h;
      }
    }, {
      key: "setParent",
      value: function setParent(from, to) {
        if (from && from.isFlexContainer()) {
          from._layout._changedChildren();
        }

        if (to && to.isFlexContainer()) {
          this._enableFlexItem();

          to._layout._changedChildren();
        }

        this._checkEnabled();
      }
    }, {
      key: "setVisible",
      value: function setVisible(v) {
        var parent = this.flexParent;

        if (parent) {
          parent._changedChildren();
        }
      }
    }, {
      key: "_getFlexItems",
      value: function _getFlexItems() {
        var items = [];
        var children = this._target._children;

        if (children) {
          for (var i = 0, n = children.length; i < n; i++) {
            var item = children[i];

            if (item.visible) {
              if (item.isFlexItem()) {
                items.push(item.layout);
              }
            }
          }
        }

        return items;
      }
    }, {
      key: "_changedChildren",
      value: function _changedChildren() {
        this._clearFlexItemsCache();

        this.changedContents();
      }
    }, {
      key: "_clearFlexItemsCache",
      value: function _clearFlexItemsCache() {
        this._items = null;
      }
    }, {
      key: "setLayout",
      value: function setLayout(x, y, w, h) {
        var originalX = this._originalX;
        var originalY = this._originalY;

        if (this.funcX) {
          originalX = this.funcX(FlexUtils.getParentAxisSizeWithPadding(this, true));
        }

        if (this.funcY) {
          originalY = this.funcY(FlexUtils.getParentAxisSizeWithPadding(this, false));
        }

        if (this.isFlexItemEnabled()) {
          this.target.setLayout(x + originalX, y + originalY, w, h);
        } else {
          // Reuse the x,y 'settings'.
          this.target.setLayout(originalX, originalY, w, h);
        }
      }
    }, {
      key: "changedDimensions",
      value: function changedDimensions() {
        var changeWidth = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
        var changeHeight = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

        this._updateRecalc(changeWidth, changeHeight);
      }
    }, {
      key: "changedContents",
      value: function changedContents() {
        this._updateRecalc();
      }
    }, {
      key: "forceLayout",
      value: function forceLayout() {
        this._updateRecalc();
      }
    }, {
      key: "isChanged",
      value: function isChanged() {
        return this._recalc > 0;
      }
    }, {
      key: "_updateRecalc",
      value: function _updateRecalc() {
        var changeExternalWidth = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
        var changeExternalHeight = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

        if (this.isFlexEnabled()) {
          var layout = this._flex._layout; // When something internal changes, it can have effect on the external dimensions.

          changeExternalWidth = changeExternalWidth || layout.isAxisFitToContents(true);
          changeExternalHeight = changeExternalHeight || layout.isAxisFitToContents(false);
        }

        var recalc = 1 + (changeExternalWidth ? 2 : 0) + (changeExternalHeight ? 4 : 0);
        var newRecalcFlags = this.getNewRecalcFlags(recalc);
        this._recalc |= recalc;

        if (newRecalcFlags > 1) {
          if (this.flexParent) {
            this.flexParent._updateRecalcBottomUp(recalc);
          } else {
            this._target.triggerLayout();
          }
        } else {
          this._target.triggerLayout();
        }
      }
    }, {
      key: "getNewRecalcFlags",
      value: function getNewRecalcFlags(flags) {
        return 7 - this._recalc & flags;
      }
    }, {
      key: "_updateRecalcBottomUp",
      value: function _updateRecalcBottomUp(childRecalc) {
        var newRecalc = this._getRecalcFromChangedChildRecalc(childRecalc);

        var newRecalcFlags = this.getNewRecalcFlags(newRecalc);
        this._recalc |= newRecalc;

        if (newRecalcFlags > 1) {
          var flexParent = this.flexParent;

          if (flexParent) {
            flexParent._updateRecalcBottomUp(newRecalc);
          } else {
            this._target.triggerLayout();
          }
        } else {
          this._target.triggerLayout();
        }
      }
    }, {
      key: "_getRecalcFromChangedChildRecalc",
      value: function _getRecalcFromChangedChildRecalc(childRecalc) {
        var layout = this._flex._layout;
        var mainAxisRecalcFlag = layout._horizontal ? 1 : 2;
        var crossAxisRecalcFlag = layout._horizontal ? 2 : 1;
        var crossAxisDimensionsChangedInChild = childRecalc & crossAxisRecalcFlag;

        if (!crossAxisDimensionsChangedInChild) {
          var mainAxisDimensionsChangedInChild = childRecalc & mainAxisRecalcFlag;

          if (mainAxisDimensionsChangedInChild) {
            var mainAxisIsWrapping = layout.isWrapping();

            if (mainAxisIsWrapping) {
              var crossAxisIsFitToContents = layout.isCrossAxisFitToContents();

              if (crossAxisIsFitToContents) {
                // Special case: due to wrapping, the cross axis size may be changed.
                childRecalc += crossAxisRecalcFlag;
              }
            }
          }
        }

        var isWidthDynamic = layout.isAxisFitToContents(true);
        var isHeightDynamic = layout.isAxisFitToContents(false);

        if (layout.shrunk) {
          // If during previous layout this container was 'shrunk', any changes may change the 'min axis size' of the
          // contents, leading to a different axis size on this container even when it was not 'fit to contents'.
          if (layout._horizontal) {
            isWidthDynamic = true;
          } else {
            isHeightDynamic = true;
          }
        }

        var localRecalc = 1 + (isWidthDynamic ? 2 : 0) + (isHeightDynamic ? 4 : 0);
        var combinedRecalc = childRecalc & localRecalc;
        return combinedRecalc;
      }
    }, {
      key: "clearRecalcFlag",
      value: function clearRecalcFlag() {
        this._recalc = 0;
      }
    }, {
      key: "enableLocalRecalcFlag",
      value: function enableLocalRecalcFlag() {
        this._recalc = 1;
      }
    }, {
      key: "setOriginalXWithoutUpdatingLayout",
      value: function setOriginalXWithoutUpdatingLayout(v) {
        this._originalX = v;
      }
    }, {
      key: "setOriginalYWithoutUpdatingLayout",
      value: function setOriginalYWithoutUpdatingLayout(v) {
        this._originalY = v;
      }
    }, {
      key: "flexLayout",
      get: function get() {
        return this.flex ? this.flex._layout : null;
      }
    }, {
      key: "target",
      get: function get() {
        return this._target;
      }
    }, {
      key: "flex",
      get: function get() {
        return this._flex;
      },
      set: function set(v) {
        if (!v) {
          if (this.isFlexEnabled()) {
            this._disableFlex();
          }
        } else {
          if (!this.isFlexEnabled()) {
            this._enableFlex();
          }

          this._flex.patch(v);
        }
      }
    }, {
      key: "flexItem",
      get: function get() {
        if (this._flexItemDisabled) {
          return false;
        }

        this._ensureFlexItem();

        return this._flexItem;
      },
      set: function set(v) {
        if (v === false) {
          if (!this._flexItemDisabled) {
            var parent = this.flexParent;
            this._flexItemDisabled = true;

            this._checkEnabled();

            if (parent) {
              parent._clearFlexItemsCache();

              parent.changedContents();
            }
          }
        } else {
          this._ensureFlexItem();

          this._flexItem.patch(v);

          if (this._flexItemDisabled) {
            this._flexItemDisabled = false;

            this._checkEnabled();

            var _parent = this.flexParent;

            if (_parent) {
              _parent._clearFlexItemsCache();

              _parent.changedContents();
            }
          }
        }
      }
    }, {
      key: "flexParent",
      get: function get() {
        if (this._flexItemDisabled) {
          return null;
        }

        var parent = this._target._parent;

        if (parent && parent.isFlexContainer()) {
          return parent._layout;
        }

        return null;
      }
    }, {
      key: "items",
      get: function get() {
        if (!this._items) {
          this._items = this._getFlexItems();
        }

        return this._items;
      }
    }, {
      key: "recalc",
      get: function get() {
        return this._recalc;
      }
    }, {
      key: "originalX",
      get: function get() {
        return this._originalX;
      }
    }, {
      key: "originalY",
      get: function get() {
        return this._originalY;
      }
    }, {
      key: "originalWidth",
      get: function get() {
        return this._originalWidth;
      },
      set: function set(v) {
        if (this._originalWidth !== v) {
          this._originalWidth = v;
          this.changedDimensions(true, false);
        }
      }
    }, {
      key: "originalHeight",
      get: function get() {
        return this._originalHeight;
      },
      set: function set(v) {
        if (this._originalHeight !== v) {
          this._originalHeight = v;
          this.changedDimensions(false, true);
        }
      }
    }, {
      key: "funcX",
      get: function get() {
        return this._target.funcX;
      }
    }, {
      key: "funcY",
      get: function get() {
        return this._target.funcY;
      }
    }, {
      key: "funcW",
      get: function get() {
        return this._target.funcW;
      }
    }, {
      key: "funcH",
      get: function get() {
        return this._target.funcH;
      }
    }]);

    return FlexTarget;
  }();

  var TextureSource =
  /*#__PURE__*/
  function () {
    function TextureSource(manager) {
      var loader = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

      _classCallCheck(this, TextureSource);

      this.id = TextureSource.id++;
      this.manager = manager;
      this.stage = manager.stage;
      /**
       * All enabled textures (textures that are used by visible elements).
       * @type {Set<Texture>}
       */

      this.textures = new Set();
      /**
       * The number of active textures (textures that have at least one active element).
       * @type {number}
       * @private
       */

      this._activeTextureCount = 0;
      /**
       * The factory for the source of this texture.
       * @type {Function}
       */

      this.loader = loader;
      /**
       * Identifier for reuse.
       * @type {String}
       */

      this.lookupId = null;
      /**
       * If set, this.is called when the texture source is no longer displayed (this.components.size becomes 0).
       * @type {Function}
       */

      this._cancelCb = null;
      /**
       * Loading since timestamp in millis.
       * @type {number}
       */

      this.loadingSince = 0;
      this.w = 0;
      this.h = 0;
      this._nativeTexture = null;
      /**
       * If true, then this.texture source is never freed from memory during garbage collection.
       * @type {boolean}
       */

      this.permanent = false;
      /**
       * Sub-object with texture-specific rendering information.
       * For images, contains the src property, for texts, contains handy rendering information.
       * @type {Object}
       */

      this.renderInfo = null;
      /**
       * Generated for 'renderToTexture'.
       * @type {boolean}
       * @private
       */

      this._isResultTexture = !this.loader;
      /**
       * Contains the load error, if the texture source could previously not be loaded.
       * @type {object}
       * @private
       */

      this._loadError = null;
      /**
       *  Hold a reference to the javascript variable which contains the texture, this is not required for WebGL in WebBrowsers but is required for Spark runtime.
       * @type {object}
       * @private
       */

      this._imageRef = null;
    }

    _createClass(TextureSource, [{
      key: "addTexture",
      value: function addTexture(v) {
        if (!this.textures.has(v)) {
          this.textures.add(v);
        }
      }
    }, {
      key: "removeTexture",
      value: function removeTexture(v) {
        this.textures.delete(v);
      }
    }, {
      key: "incActiveTextureCount",
      value: function incActiveTextureCount() {
        this._activeTextureCount++;

        if (this._activeTextureCount === 1) {
          this.becomesUsed();
        }
      }
    }, {
      key: "decActiveTextureCount",
      value: function decActiveTextureCount() {
        this._activeTextureCount--;

        if (this._activeTextureCount === 0) {
          this.becomesUnused();
        }
      }
    }, {
      key: "forEachEnabledElement",
      value: function forEachEnabledElement(cb) {
        var _this = this;

        this.textures.forEach(function (texture) {
          _newArrowCheck(this, _this);

          texture.elements.forEach(cb);
        }.bind(this));
      }
    }, {
      key: "hasEnabledElements",
      value: function hasEnabledElements() {
        return this.textures.size > 0;
      }
    }, {
      key: "forEachActiveElement",
      value: function forEachActiveElement(cb) {
        var _this2 = this;

        this.textures.forEach(function (texture) {
          var _this3 = this;

          _newArrowCheck(this, _this2);

          texture.elements.forEach(function (element) {
            _newArrowCheck(this, _this3);

            if (element.active) {
              cb(element);
            }
          }.bind(this));
        }.bind(this));
      }
    }, {
      key: "getRenderWidth",
      value: function getRenderWidth() {
        return this.w;
      }
    }, {
      key: "getRenderHeight",
      value: function getRenderHeight() {
        return this.h;
      }
    }, {
      key: "allowCleanup",
      value: function allowCleanup() {
        return !this.permanent && !this.isUsed();
      }
    }, {
      key: "becomesUsed",
      value: function becomesUsed() {
        // Even while the texture is being loaded, make sure it is on the lookup map so that others can reuse it.
        this.load();
      }
    }, {
      key: "becomesUnused",
      value: function becomesUnused() {
        this.cancel();
      }
    }, {
      key: "cancel",
      value: function cancel() {
        if (this.isLoading()) {
          if (this._cancelCb) {
            this._cancelCb(this); // Clear callback to avoid memory leaks.


            this._cancelCb = null;
          }

          this.loadingSince = 0;
        }
      }
    }, {
      key: "isLoaded",
      value: function isLoaded() {
        return !!this._nativeTexture;
      }
    }, {
      key: "isLoading",
      value: function isLoading() {
        return this.loadingSince > 0;
      }
    }, {
      key: "isError",
      value: function isError() {
        return !!this._loadError;
      }
    }, {
      key: "reload",
      value: function reload() {
        this.free();

        if (this.isUsed()) {
          this.load();
        }
      }
    }, {
      key: "load",
      value: function load() {
        var _this4 = this;

        var forceSync = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

        // From the moment of loading (when a texture source becomes used by active elements)
        if (this.isResultTexture) {
          // Element result texture source, for which the loading is managed by the core.
          return;
        }

        if (!this._nativeTexture && !this.isLoading()) {
          this.loadingSince = new Date().getTime();
          this._cancelCb = this.loader(function (err, options) {
            _newArrowCheck(this, _this4);

            // Ignore loads that come in after a cancel.
            if (this.isLoading()) {
              // Clear callback to avoid memory leaks.
              this._cancelCb = null;

              if (this.manager.stage.destroyed) {
                // Ignore async load when stage is destroyed.
                return;
              }

              if (err) {
                // Emit txError.
                this.onError(err);
              } else if (options && options.source) {
                if (!this.stage.isUpdatingFrame() && !forceSync && options.throttle !== false) {
                  var textureThrottler = this.stage.textureThrottler;
                  this._cancelCb = textureThrottler.genericCancelCb;
                  textureThrottler.add(this, options);
                } else {
                  this.processLoadedSource(options);
                }
              }
            }
          }.bind(this), this);
        }
      }
    }, {
      key: "processLoadedSource",
      value: function processLoadedSource(options) {
        this.loadingSince = 0;
        this.setSource(options);
      }
    }, {
      key: "setSource",
      value: function setSource(options) {
        var source = options.source;
        this.w = source.width || options && options.w || 0;
        this.h = source.height || options && options.h || 0;

        if (options && options.renderInfo) {
          // Assign to id in cache so that it can be reused.
          this.renderInfo = options.renderInfo;
        }

        this.permanent = !!options.permanent;
        if (options && options.imageRef) this._imageRef = options.imageRef;

        if (this._isNativeTexture(source)) {
          // Texture managed by caller.
          this._nativeTexture = source;
          this.w = this.w || source.w;
          this.h = this.h || source.h; // WebGLTexture objects are by default;

          this.permanent = options.hasOwnProperty('permanent') ? options.permanent : true;
        } else {
          this.manager.uploadTextureSource(this, options);
        } // Must be cleared when reload is succesful.


        this._loadError = null;
        this.onLoad();
      }
    }, {
      key: "isUsed",
      value: function isUsed() {
        return this._activeTextureCount > 0;
      }
    }, {
      key: "onLoad",
      value: function onLoad() {
        var _this5 = this;

        if (this.isUsed()) {
          this.textures.forEach(function (texture) {
            _newArrowCheck(this, _this5);

            texture.onLoad();
          }.bind(this));
        }
      }
    }, {
      key: "forceRenderUpdate",
      value: function forceRenderUpdate() {
        // Userland should call this method after changing the nativeTexture manually outside of the framework
        //  (using tex[Sub]Image2d for example).
        if (this._nativeTexture) {
          // Change 'update' flag. This is currently not used by the framework but is handy in userland.
          this._nativeTexture.update = this.stage.frameCounter;
        }

        this.forEachActiveElement(function (element) {
          element.forceRenderUpdate();
        });
      }
    }, {
      key: "forceUpdateRenderCoords",
      value: function forceUpdateRenderCoords() {
        this.forEachActiveElement(function (element) {
          element._updateTextureCoords();
        });
      }
    }, {
      key: "clearNativeTexture",
      value: function clearNativeTexture() {
        this._nativeTexture = null; //also clear the reference to the texture variable.

        this._imageRef = null;
      }
      /**
       * Used for result textures.
       */

    }, {
      key: "replaceNativeTexture",
      value: function replaceNativeTexture(newNativeTexture, w, h) {
        var _this6 = this;

        var prevNativeTexture = this._nativeTexture; // Loaded by core.

        this._nativeTexture = newNativeTexture;
        this.w = w;
        this.h = h;

        if (!prevNativeTexture && this._nativeTexture) {
          this.forEachActiveElement(function (element) {
            _newArrowCheck(this, _this6);

            return element.onTextureSourceLoaded();
          }.bind(this));
        }

        if (!this._nativeTexture) {
          this.forEachActiveElement(function (element) {
            _newArrowCheck(this, _this6);

            return element._setDisplayedTexture(null);
          }.bind(this));
        } // Dimensions must be updated also on enabled elements, as it may force it to go within bounds.


        this.forEachEnabledElement(function (element) {
          _newArrowCheck(this, _this6);

          return element._updateDimensions();
        }.bind(this)); // Notice that the sprite map must never contain render textures.
      }
    }, {
      key: "onError",
      value: function onError(e) {
        var _this7 = this;

        this._loadError = e;
        this.loadingSince = 0;
        console.error('texture load error', e, this.lookupId);
        this.forEachActiveElement(function (element) {
          _newArrowCheck(this, _this7);

          return element.onTextureSourceLoadError(e);
        }.bind(this));
      }
    }, {
      key: "free",
      value: function free() {
        if (this.isLoaded()) {
          this.manager.freeTextureSource(this);
        }
      }
    }, {
      key: "_isNativeTexture",
      value: function _isNativeTexture(source) {
        return Utils.isNode ? source.constructor.name === "WebGLTexture" : source instanceof WebGLTexture;
      }
    }, {
      key: "loadError",
      get: function get() {
        return this._loadError;
      }
    }, {
      key: "isResultTexture",
      get: function get() {
        return this._isResultTexture;
      },
      set: function set(v) {
        this._isResultTexture = v;
      }
    }, {
      key: "nativeTexture",
      get: function get() {
        return this._nativeTexture;
      }
    }]);

    return TextureSource;
  }();
  TextureSource.prototype.isTextureSource = true;
  TextureSource.id = 1;

  var ElementTexturizer =
  /*#__PURE__*/
  function () {
    function ElementTexturizer(elementCore) {
      _classCallCheck(this, ElementTexturizer);

      this._element = elementCore.element;
      this._core = elementCore;
      this.ctx = this._core.ctx;
      this._enabled = false;
      this.lazy = false;
      this._colorize = false;
      this._renderTexture = null;
      this._renderTextureReused = false;
      this._resultTextureSource = null;
      this._renderOffscreen = false;
      this.empty = false;
    }

    _createClass(ElementTexturizer, [{
      key: "_getTextureSource",
      value: function _getTextureSource() {
        if (!this._resultTextureSource) {
          this._resultTextureSource = new TextureSource(this._element.stage.textureManager);
          this.updateResultTexture();
        }

        return this._resultTextureSource;
      }
    }, {
      key: "hasResultTexture",
      value: function hasResultTexture() {
        return !!this._resultTextureSource;
      }
    }, {
      key: "resultTextureInUse",
      value: function resultTextureInUse() {
        return this._resultTextureSource && this._resultTextureSource.hasEnabledElements();
      }
    }, {
      key: "updateResultTexture",
      value: function updateResultTexture() {
        var _this = this;

        var resultTexture = this.getResultTexture();

        if (this._resultTextureSource) {
          if (this._resultTextureSource.nativeTexture !== resultTexture) {
            var w = resultTexture ? resultTexture.w : 0;
            var h = resultTexture ? resultTexture.h : 0;

            this._resultTextureSource.replaceNativeTexture(resultTexture, w, h);
          } // Texture will be updated: all elements using the source need to be updated as well.


          this._resultTextureSource.forEachEnabledElement(function (element) {
            _newArrowCheck(this, _this);

            element._updateDimensions();

            element.core.setHasRenderUpdates(3);
          }.bind(this));
        }
      }
    }, {
      key: "mustRenderToTexture",
      value: function mustRenderToTexture() {
        // Check if we must really render as texture.
        if (this._enabled && !this.lazy) {
          return true;
        } else if (this._enabled && this.lazy && this._core._hasRenderUpdates < 3) {
          // Static-only: if renderToTexture did not need to update during last drawn frame, generate it as a cache.
          return true;
        }

        return false;
      }
    }, {
      key: "deactivate",
      value: function deactivate() {
        this.release();
      }
    }, {
      key: "release",
      value: function release() {
        this.releaseRenderTexture();
      }
    }, {
      key: "releaseRenderTexture",
      value: function releaseRenderTexture() {
        if (this._renderTexture) {
          if (!this._renderTextureReused) {
            this.ctx.releaseRenderTexture(this._renderTexture);
          }

          this._renderTexture = null;
          this._renderTextureReused = false;
          this.updateResultTexture();
        }
      } // Reuses the specified texture as the render texture (in ancestor).

    }, {
      key: "reuseTextureAsRenderTexture",
      value: function reuseTextureAsRenderTexture(nativeTexture) {
        if (this._renderTexture !== nativeTexture) {
          this.releaseRenderTexture();
          this._renderTexture = nativeTexture;
          this._renderTextureReused = true;
        }
      }
    }, {
      key: "hasRenderTexture",
      value: function hasRenderTexture() {
        return !!this._renderTexture;
      }
    }, {
      key: "getRenderTexture",
      value: function getRenderTexture() {
        if (!this._renderTexture) {
          this._renderTexture = this.ctx.allocateRenderTexture(this._core._w, this._core._h);
          this._renderTextureReused = false;
        }

        return this._renderTexture;
      }
    }, {
      key: "getResultTexture",
      value: function getResultTexture() {
        return this._renderTexture;
      }
    }, {
      key: "enabled",
      get: function get() {
        return this._enabled;
      },
      set: function set(v) {
        this._enabled = v;

        this._core.updateRenderToTextureEnabled();
      }
    }, {
      key: "renderOffscreen",
      get: function get() {
        return this._renderOffscreen;
      },
      set: function set(v) {
        this._renderOffscreen = v;

        this._core.setHasRenderUpdates(1); // This enforces rechecking the 'within bounds'.


        this._core._setRecalc(6);
      }
    }, {
      key: "colorize",
      get: function get() {
        return this._colorize;
      },
      set: function set(v) {
        if (this._colorize !== v) {
          this._colorize = v; // Only affects the finally drawn quad.

          this._core.setHasRenderUpdates(1);
        }
      }
    }, {
      key: "renderTextureReused",
      get: function get() {
        return this._renderTextureReused;
      }
    }]);

    return ElementTexturizer;
  }();

  var ElementCore =
  /*#__PURE__*/
  function () {
    function ElementCore(element) {
      _classCallCheck(this, ElementCore);

      this._element = element;
      this.ctx = element.stage.ctx; // The memory layout of the internal variables is affected by their position in the constructor.
      // It boosts performance to order them by usage of cpu-heavy functions (renderSimple and update).

      this._recalc = 0;
      this._parent = null;
      this._onUpdate = null;
      this._pRecalc = 0;
      this._worldContext = new ElementCoreContext();
      this._hasUpdates = false;
      this._localAlpha = 1;
      this._onAfterCalcs = null;
      this._onAfterUpdate = null; // All local translation/transform updates: directly propagated from x/y/w/h/scale/whatever.

      this._localPx = 0;
      this._localPy = 0;
      this._localTa = 1;
      this._localTb = 0;
      this._localTc = 0;
      this._localTd = 1;
      this._isComplex = false;
      this._dimsUnknown = false;
      this._clipping = false; // Used by both update and render.

      this._zSort = false;
      this._outOfBounds = 0;
      /**
       * The texture source to be displayed.
       * @type {TextureSource}
       */

      this._displayedTextureSource = null;
      this._zContextUsage = 0;
      this._children = null;
      this._hasRenderUpdates = 0;
      this._zIndexedChildren = null;
      this._renderContext = this._worldContext;
      this.renderState = this.ctx.renderState;
      this._scissor = null; // The ancestor ElementCore that owns the inherited shader. Null if none is active (default shader).

      this._shaderOwner = null;
      this._updateTreeOrder = 0;
      this._colorUl = this._colorUr = this._colorBl = this._colorBr = 0xFFFFFFFF;
      this._x = 0;
      this._y = 0;
      this._w = 0;
      this._h = 0;
      this._optFlags = 0;
      this._funcX = null;
      this._funcY = null;
      this._funcW = null;
      this._funcH = null;
      this._scaleX = 1;
      this._scaleY = 1;
      this._pivotX = 0.5;
      this._pivotY = 0.5;
      this._mountX = 0;
      this._mountY = 0;
      this._rotation = 0;
      this._alpha = 1;
      this._visible = true;
      this._ulx = 0;
      this._uly = 0;
      this._brx = 1;
      this._bry = 1;
      this._zIndex = 0;
      this._forceZIndexContext = false;
      this._zParent = null;
      this._isRoot = false;
      /**
       * Iff true, during zSort, this element should be 're-sorted' because either:
       * - zIndex did chang
       * - zParent did change
       * - element was moved in the render tree
       * @type {boolean}
       */

      this._zIndexResort = false;
      this._shader = null; // Element is rendered on another texture.

      this._renderToTextureEnabled = false;
      this._texturizer = null;
      this._useRenderToTexture = false;
      this._boundsMargin = null;
      this._recBoundsMargin = null;
      this._withinBoundsMargin = false;
      this._viewport = null;
      this._clipbox = true;
      this.render = this._renderSimple;
      this._layout = null;
    }

    _createClass(ElementCore, [{
      key: "_disableFuncX",
      value: function _disableFuncX() {
        this._optFlags = this._optFlags & 0xFFFF - 1;
        this._funcX = null;
      }
    }, {
      key: "_disableFuncY",
      value: function _disableFuncY() {
        this._optFlags = this._optFlags & 0xFFFF - 2;
        this._funcY = null;
      }
    }, {
      key: "disableFuncW",
      value: function disableFuncW() {
        this._optFlags = this._optFlags & 0xFFFF - 4;
        this._funcW = null;
      }
    }, {
      key: "disableFuncH",
      value: function disableFuncH() {
        this._optFlags = this._optFlags & 0xFFFF - 8;
        this._funcH = null;
      }
    }, {
      key: "getRenderWidth",
      value: function getRenderWidth() {
        if (this.hasFlexLayout()) {
          return this._layout.originalWidth;
        } else {
          return this._w;
        }
      }
    }, {
      key: "getRenderHeight",
      value: function getRenderHeight() {
        if (this.hasFlexLayout()) {
          return this._layout.originalHeight;
        } else {
          return this._h;
        }
      }
    }, {
      key: "_updateLocalTransform",
      value: function _updateLocalTransform() {
        if (this._rotation !== 0 && this._rotation % (2 * Math.PI)) {
          // check to see if the rotation is the same as the previous render. This means we only need to use sin and cos when rotation actually changes
          var _sr = Math.sin(this._rotation);

          var _cr = Math.cos(this._rotation);

          this._setLocalTransform(_cr * this._scaleX, -_sr * this._scaleY, _sr * this._scaleX, _cr * this._scaleY);
        } else {
          this._setLocalTransform(this._scaleX, 0, 0, this._scaleY);
        }

        this._updateLocalTranslate();
      }
    }, {
      key: "_updateLocalTranslate",
      value: function _updateLocalTranslate() {
        this._recalcLocalTranslate();

        this._triggerRecalcTranslate();
      }
    }, {
      key: "_recalcLocalTranslate",
      value: function _recalcLocalTranslate() {
        var pivotXMul = this._pivotX * this._w;
        var pivotYMul = this._pivotY * this._h;
        var px = this._x - (pivotXMul * this._localTa + pivotYMul * this._localTb) + pivotXMul;
        var py = this._y - (pivotXMul * this._localTc + pivotYMul * this._localTd) + pivotYMul;
        px -= this._mountX * this._w;
        py -= this._mountY * this._h;
        this._localPx = px;
        this._localPy = py;
      }
    }, {
      key: "_updateLocalTranslateDelta",
      value: function _updateLocalTranslateDelta(dx, dy) {
        this._addLocalTranslate(dx, dy);
      }
    }, {
      key: "_updateLocalAlpha",
      value: function _updateLocalAlpha() {
        this._setLocalAlpha(this._visible ? this._alpha : 0);
      }
    }, {
      key: "setHasRenderUpdates",

      /**
       * @param {number} type
       * 0: no updates
       * 1: re-invoke shader
       * 3: re-create render texture and re-invoke shader
       */
      value: function setHasRenderUpdates(type) {
        if (this._worldContext.alpha) {
          // Ignore if 'world invisible'. Render updates will be reset to 3 for every element that becomes visible.
          var p = this;
          p._hasRenderUpdates = Math.max(type, p._hasRenderUpdates);

          while ((p = p._parent) && p._hasRenderUpdates !== 3) {
            p._hasRenderUpdates = 3;
          }
        }
      }
      /**
       * @param {Number} type
       *   1: alpha
       *   2: translate
       *   4: transform
       * 128: becomes visible
       * 256: flex layout updated
       */

    }, {
      key: "_setRecalc",
      value: function _setRecalc(type) {
        this._recalc |= type;

        this._setHasUpdates(); // Any changes in descendants should trigger texture updates.


        if (this._parent) {
          this._parent.setHasRenderUpdates(3);
        }
      }
    }, {
      key: "_setHasUpdates",
      value: function _setHasUpdates() {
        var p = this;

        while (p && !p._hasUpdates) {
          p._hasUpdates = true;
          p = p._parent;
        }
      }
    }, {
      key: "getParent",
      value: function getParent() {
        return this._parent;
      }
    }, {
      key: "setParent",
      value: function setParent(parent) {
        if (parent !== this._parent) {
          var prevIsZContext = this.isZContext();
          var prevParent = this._parent;
          this._parent = parent; // Notify flex layout engine.

          if (this._layout || parent && parent.isFlexContainer()) {
            this.layout.setParent(prevParent, parent);
          }

          if (prevParent) {
            // When elements are deleted, the render texture must be re-rendered.
            prevParent.setHasRenderUpdates(3);
          }

          this._setRecalc(1 + 2 + 4);

          if (this._parent) {
            // Force parent to propagate hasUpdates flag.
            this._parent._setHasUpdates();
          }

          if (this._zIndex === 0) {
            this.setZParent(parent);
          } else {
            this.setZParent(parent ? parent.findZContext() : null);
          }

          if (prevIsZContext !== this.isZContext()) {
            if (!this.isZContext()) {
              this.disableZContext();
            } else {
              this.enableZContext(prevParent.findZContext());
            }
          } // Tree order did change: even if zParent stays the same, we must resort.


          this._zIndexResort = true;

          if (this._zParent) {
            this._zParent.enableZSort();
          }

          if (!this._shader) {
            var newShaderOwner = parent && !parent._renderToTextureEnabled ? parent._shaderOwner : null;

            if (newShaderOwner !== this._shaderOwner) {
              this.setHasRenderUpdates(1);

              this._setShaderOwnerRecursive(newShaderOwner);
            }
          }
        }
      }
    }, {
      key: "enableZSort",
      value: function enableZSort() {
        var force = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

        if (!this._zSort && this._zContextUsage > 0) {
          this._zSort = true;

          if (force) {
            // ZSort must be done, even if this element is invisible.
            // This is done to prevent memory leaks when removing element from inactive render branches.
            this.ctx.forceZSort(this);
          }
        }
      }
    }, {
      key: "addChildAt",
      value: function addChildAt(index, child) {
        if (!this._children) this._children = [];

        this._children.splice(index, 0, child);

        child.setParent(this);
      }
    }, {
      key: "setChildAt",
      value: function setChildAt(index, child) {
        if (!this._children) this._children = [];

        this._children[index].setParent(null);

        this._children[index] = child;
        child.setParent(this);
      }
    }, {
      key: "removeChildAt",
      value: function removeChildAt(index) {
        var child = this._children[index];

        this._children.splice(index, 1);

        child.setParent(null);
      }
    }, {
      key: "removeChildren",
      value: function removeChildren() {
        if (this._children) {
          for (var i = 0, n = this._children.length; i < n; i++) {
            this._children[i].setParent(null);
          }

          this._children.splice(0);

          if (this._zIndexedChildren) {
            this._zIndexedChildren.splice(0);
          }
        }
      }
    }, {
      key: "syncChildren",
      value: function syncChildren(removed, added, order) {
        this._children = order;

        for (var i = 0, n = removed.length; i < n; i++) {
          removed[i].setParent(null);
        }

        for (var _i = 0, _n = added.length; _i < _n; _i++) {
          added[_i].setParent(this);
        }
      }
    }, {
      key: "moveChild",
      value: function moveChild(fromIndex, toIndex) {
        var c = this._children[fromIndex];

        this._children.splice(fromIndex, 1);

        this._children.splice(toIndex, 0, c); // Tree order changed: must resort!;


        this._zIndexResort = true;

        if (this._zParent) {
          this._zParent.enableZSort();
        }
      }
    }, {
      key: "_setLocalTransform",
      value: function _setLocalTransform(a, b, c, d) {
        this._setRecalc(4);

        this._localTa = a;
        this._localTb = b;
        this._localTc = c;
        this._localTd = d; // We also regard negative scaling as a complex case, so that we can optimize the non-complex case better.

        this._isComplex = b !== 0 || c !== 0 || a < 0 || d < 0;
      }
    }, {
      key: "_addLocalTranslate",
      value: function _addLocalTranslate(dx, dy) {
        this._localPx += dx;
        this._localPy += dy;

        this._triggerRecalcTranslate();
      }
    }, {
      key: "_setLocalAlpha",
      value: function _setLocalAlpha(a) {
        if (!this._worldContext.alpha && this._parent && this._parent._worldContext.alpha && a) {
          // Element is becoming visible. We need to force update.
          this._setRecalc(1 + 128);
        } else {
          this._setRecalc(1);
        }

        if (a < 1e-14) {
          // Tiny rounding errors may cause failing visibility tests.
          a = 0;
        }

        this._localAlpha = a;
      }
    }, {
      key: "setDimensions",
      value: function setDimensions(w, h) {
        var isEstimate = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : this._dimsUnknown;
        // In case of an estimation, the update loop should perform different bound checks.
        this._dimsUnknown = isEstimate;

        if (this.hasFlexLayout()) {
          this._layout.originalWidth = w;
          this._layout.originalHeight = h;
        } else {
          if (this._w !== w || this._h !== h) {
            this._updateDimensions(w, h);

            return true;
          }
        }

        return false;
      }
    }, {
      key: "_updateDimensions",
      value: function _updateDimensions(w, h) {
        if (this._w !== w || this._h !== h) {
          this._w = w;
          this._h = h;

          this._triggerRecalcTranslate();

          if (this._texturizer) {
            this._texturizer.releaseRenderTexture();

            this._texturizer.updateResultTexture();
          } // Due to width/height change: update the translation vector.


          this._updateLocalTranslate();
        }
      }
    }, {
      key: "setTextureCoords",
      value: function setTextureCoords(ulx, uly, brx, bry) {
        this.setHasRenderUpdates(3);
        this._ulx = ulx;
        this._uly = uly;
        this._brx = brx;
        this._bry = bry;
      }
    }, {
      key: "setDisplayedTextureSource",
      value: function setDisplayedTextureSource(textureSource) {
        this.setHasRenderUpdates(3);
        this._displayedTextureSource = textureSource;
      }
    }, {
      key: "setAsRoot",
      value: function setAsRoot() {
        // Use parent dummy.
        this._parent = new ElementCore(this._element); // After setting root, make sure it's updated.

        this._parent._hasRenderUpdates = 3;
        this._parent._hasUpdates = true; // Root is, and will always be, the primary zContext.

        this._isRoot = true;
        this.ctx.root = this; // Set scissor area of 'fake parent' to stage's viewport.

        this._parent._viewport = [0, 0, this.ctx.stage.coordsWidth, this.ctx.stage.coordsHeight];
        this._parent._scissor = this._parent._viewport; // When recBoundsMargin is null, the defaults are used (100 for all sides).

        this._parent._recBoundsMargin = null;

        this._setRecalc(1 + 2 + 4);
      }
    }, {
      key: "isAncestorOf",
      value: function isAncestorOf(c) {
        var p = c;

        while (p = p._parent) {
          if (this === p) {
            return true;
          }
        }

        return false;
      }
    }, {
      key: "isZContext",
      value: function isZContext() {
        return this._forceZIndexContext || this._renderToTextureEnabled || this._zIndex !== 0 || this._isRoot || !this._parent;
      }
    }, {
      key: "findZContext",
      value: function findZContext() {
        if (this.isZContext()) {
          return this;
        } else {
          return this._parent.findZContext();
        }
      }
    }, {
      key: "setZParent",
      value: function setZParent(newZParent) {
        if (this._zParent !== newZParent) {
          if (this._zParent !== null) {
            if (this._zIndex !== 0) {
              this._zParent.decZContextUsage();
            } // We must filter out this item upon the next resort.


            this._zParent.enableZSort();
          }

          if (newZParent !== null) {
            var hadZContextUsage = newZParent._zContextUsage > 0; // @pre: new parent's children array has already been modified.

            if (this._zIndex !== 0) {
              newZParent.incZContextUsage();
            }

            if (newZParent._zContextUsage > 0) {
              if (!hadZContextUsage && this._parent === newZParent) ; else {
                // Add new child to array.
                newZParent._zIndexedChildren.push(this);
              } // Order should be checked.


              newZParent.enableZSort();
            }
          }

          this._zParent = newZParent; // Newly added element must be marked for resort.

          this._zIndexResort = true;
        }
      }
    }, {
      key: "incZContextUsage",
      value: function incZContextUsage() {
        this._zContextUsage++;

        if (this._zContextUsage === 1) {
          if (!this._zIndexedChildren) {
            this._zIndexedChildren = [];
          }

          if (this._children) {
            // Copy.
            for (var i = 0, n = this._children.length; i < n; i++) {
              this._zIndexedChildren.push(this._children[i]);
            } // Initially, children are already sorted properly (tree order).


            this._zSort = false;
          }
        }
      }
    }, {
      key: "decZContextUsage",
      value: function decZContextUsage() {
        this._zContextUsage--;

        if (this._zContextUsage === 0) {
          this._zSort = false;

          this._zIndexedChildren.splice(0);
        }
      }
    }, {
      key: "enableZContext",
      value: function enableZContext(prevZContext) {
        var _this = this;

        if (prevZContext && prevZContext._zContextUsage > 0) {
          // Transfer from upper z context to this z context.
          var results = this._getZIndexedDescs();

          results.forEach(function (c) {
            _newArrowCheck(this, _this);

            if (this.isAncestorOf(c) && c._zIndex !== 0) {
              c.setZParent(this);
            }
          }.bind(this));
        }
      }
    }, {
      key: "_getZIndexedDescs",
      value: function _getZIndexedDescs() {
        var results = [];

        if (this._children) {
          for (var i = 0, n = this._children.length; i < n; i++) {
            this._children[i]._getZIndexedDescsRec(results);
          }
        }

        return results;
      }
    }, {
      key: "_getZIndexedDescsRec",
      value: function _getZIndexedDescsRec(results) {
        if (this._zIndex) {
          results.push(this);
        } else if (this._children && !this.isZContext()) {
          for (var i = 0, n = this._children.length; i < n; i++) {
            this._children[i]._getZIndexedDescsRec(results);
          }
        }
      }
    }, {
      key: "disableZContext",
      value: function disableZContext() {
        // Transfer from this z context to upper z context.
        if (this._zContextUsage > 0) {
          var newZParent = this._parent.findZContext(); // Make sure that z-indexed children are up to date (old ones removed).


          if (this._zSort) {
            this.sortZIndexedChildren();
          }

          this._zIndexedChildren.slice().forEach(function (c) {
            if (c._zIndex !== 0) {
              c.setZParent(newZParent);
            }
          });
        }
      }
    }, {
      key: "_setShaderOwnerRecursive",
      value: function _setShaderOwnerRecursive(elementCore) {
        this._shaderOwner = elementCore;

        if (this._children && !this._renderToTextureEnabled) {
          for (var i = 0, n = this._children.length; i < n; i++) {
            var c = this._children[i];

            if (!c._shader) {
              c._setShaderOwnerRecursive(elementCore);

              c._hasRenderUpdates = 3;
            }
          }
        }
      }
    }, {
      key: "_setShaderOwnerChildrenRecursive",
      value: function _setShaderOwnerChildrenRecursive(elementCore) {
        if (this._children) {
          for (var i = 0, n = this._children.length; i < n; i++) {
            var c = this._children[i];

            if (!c._shader) {
              c._setShaderOwnerRecursive(elementCore);

              c._hasRenderUpdates = 3;
            }
          }
        }
      }
    }, {
      key: "_hasRenderContext",
      value: function _hasRenderContext() {
        return this._renderContext !== this._worldContext;
      }
    }, {
      key: "updateRenderToTextureEnabled",
      value: function updateRenderToTextureEnabled() {
        // Enforce texturizer initialisation.
        var v = this.texturizer._enabled;

        if (v) {
          this._enableRenderToTexture();
        } else {
          this._disableRenderToTexture();

          this._texturizer.releaseRenderTexture();
        }
      }
    }, {
      key: "_enableRenderToTexture",
      value: function _enableRenderToTexture() {
        if (!this._renderToTextureEnabled) {
          var prevIsZContext = this.isZContext();
          this._renderToTextureEnabled = true;
          this._renderContext = new ElementCoreContext(); // If render to texture is active, a new shader context is started.

          this._setShaderOwnerChildrenRecursive(null);

          if (!prevIsZContext) {
            // Render context forces z context.
            this.enableZContext(this._parent ? this._parent.findZContext() : null);
          }

          this.setHasRenderUpdates(3); // Make sure that the render coordinates get updated.

          this._setRecalc(7);

          this.render = this._renderAdvanced;
        }
      }
    }, {
      key: "_disableRenderToTexture",
      value: function _disableRenderToTexture() {
        if (this._renderToTextureEnabled) {
          this._renderToTextureEnabled = false;

          this._setShaderOwnerChildrenRecursive(this._shaderOwner);

          this._renderContext = this._worldContext;

          if (!this.isZContext()) {
            this.disableZContext();
          } // Make sure that the render coordinates get updated.


          this._setRecalc(7);

          this.setHasRenderUpdates(3);
          this.render = this._renderSimple;
        }
      }
    }, {
      key: "isWhite",
      value: function isWhite() {
        return this._colorUl === 0xFFFFFFFF && this._colorUr === 0xFFFFFFFF && this._colorBl === 0xFFFFFFFF && this._colorBr === 0xFFFFFFFF;
      }
    }, {
      key: "hasSimpleTexCoords",
      value: function hasSimpleTexCoords() {
        return this._ulx === 0 && this._uly === 0 && this._brx === 1 && this._bry === 1;
      }
    }, {
      key: "_stashTexCoords",
      value: function _stashTexCoords() {
        this._stashedTexCoords = [this._ulx, this._uly, this._brx, this._bry];
        this._ulx = 0;
        this._uly = 0;
        this._brx = 1;
        this._bry = 1;
      }
    }, {
      key: "_unstashTexCoords",
      value: function _unstashTexCoords() {
        this._ulx = this._stashedTexCoords[0];
        this._uly = this._stashedTexCoords[1];
        this._brx = this._stashedTexCoords[2];
        this._bry = this._stashedTexCoords[3];
        this._stashedTexCoords = null;
      }
    }, {
      key: "_stashColors",
      value: function _stashColors() {
        this._stashedColors = [this._colorUl, this._colorUr, this._colorBr, this._colorBl];
        this._colorUl = 0xFFFFFFFF;
        this._colorUr = 0xFFFFFFFF;
        this._colorBr = 0xFFFFFFFF;
        this._colorBl = 0xFFFFFFFF;
      }
    }, {
      key: "_unstashColors",
      value: function _unstashColors() {
        this._colorUl = this._stashedColors[0];
        this._colorUr = this._stashedColors[1];
        this._colorBr = this._stashedColors[2];
        this._colorBl = this._stashedColors[3];
        this._stashedColors = null;
      }
    }, {
      key: "isVisible",
      value: function isVisible() {
        return this._localAlpha > 1e-14;
      }
    }, {
      key: "update",
      value: function update() {
        this._recalc |= this._parent._pRecalc;

        if (this._layout && this._layout.isEnabled()) {
          if (this._recalc & 256) {
            this._layout.layoutFlexTree();
          }
        } else if (this._recalc & 2 && this._optFlags) {
          this._applyRelativeDimFuncs();
        }

        if (this._onUpdate) {
          // Block all 'upwards' updates when changing things in this branch.
          this._hasUpdates = true;

          this._onUpdate(this.element, this);
        }

        var pw = this._parent._worldContext;
        var w = this._worldContext;
        var visible = pw.alpha && this._localAlpha;
        /**
         * We must update if:
         * - branch contains updates (even when invisible because it may contain z-indexed descendants)
         * - there are (inherited) updates and this branch is visible
         * - this branch becomes invisible (descs may be z-indexed so we must update all alpha values)
         */

        if (this._hasUpdates || this._recalc && visible || w.alpha && !visible) {
          var recalc = this._recalc; // Update world coords/alpha.

          if (recalc & 1) {
            if (!w.alpha && visible) {
              // Becomes visible.
              this._hasRenderUpdates = 3;
            }

            w.alpha = pw.alpha * this._localAlpha;

            if (w.alpha < 1e-14) {
              // Tiny rounding errors may cause failing visibility tests.
              w.alpha = 0;
            }
          }

          if (recalc & 6) {
            w.px = pw.px + this._localPx * pw.ta;
            w.py = pw.py + this._localPy * pw.td;
            if (pw.tb !== 0) w.px += this._localPy * pw.tb;
            if (pw.tc !== 0) w.py += this._localPx * pw.tc;
          }

          if (recalc & 4) {
            w.ta = this._localTa * pw.ta;
            w.tb = this._localTd * pw.tb;
            w.tc = this._localTa * pw.tc;
            w.td = this._localTd * pw.td;

            if (this._isComplex) {
              w.ta += this._localTc * pw.tb;
              w.tb += this._localTb * pw.ta;
              w.tc += this._localTc * pw.td;
              w.td += this._localTb * pw.tc;
            }
          } // Update render coords/alpha.


          var pr = this._parent._renderContext;

          if (this._parent._hasRenderContext()) {
            var init = this._renderContext === this._worldContext;

            if (init) {
              // First render context build: make sure that it is fully initialized correctly.
              // Otherwise, if we get into bounds later, the render context would not be initialized correctly.
              this._renderContext = new ElementCoreContext();
            }

            var _r = this._renderContext; // Update world coords/alpha.

            if (init || recalc & 1) {
              _r.alpha = pr.alpha * this._localAlpha;

              if (_r.alpha < 1e-14) {
                _r.alpha = 0;
              }
            }

            if (init || recalc & 6) {
              _r.px = pr.px + this._localPx * pr.ta;
              _r.py = pr.py + this._localPy * pr.td;
              if (pr.tb !== 0) _r.px += this._localPy * pr.tb;
              if (pr.tc !== 0) _r.py += this._localPx * pr.tc;
            }

            if (init) {
              // We set the recalc toggle, because we must make sure that the scissor is updated.
              recalc |= 2;
            }

            if (init || recalc & 4) {
              _r.ta = this._localTa * pr.ta;
              _r.tb = this._localTd * pr.tb;
              _r.tc = this._localTa * pr.tc;
              _r.td = this._localTd * pr.td;

              if (this._isComplex) {
                _r.ta += this._localTc * pr.tb;
                _r.tb += this._localTb * pr.ta;
                _r.tc += this._localTc * pr.td;
                _r.td += this._localTb * pr.tc;
              }
            }
          } else {
            this._renderContext = this._worldContext;
          }

          if (this.ctx.updateTreeOrder === -1) {
            this.ctx.updateTreeOrder = this._updateTreeOrder + 1;
          } else {
            this._updateTreeOrder = this.ctx.updateTreeOrder++;
          } // Determine whether we must use a 'renderTexture'.


          var useRenderToTexture = this._renderToTextureEnabled && this._texturizer.mustRenderToTexture();

          if (this._useRenderToTexture !== useRenderToTexture) {
            // Coords must be changed.
            this._recalc |= 2 + 4; // Scissor may change: force update.

            recalc |= 2;

            if (!this._useRenderToTexture) {
              // We must release the texture.
              this._texturizer.release();
            }
          }

          this._useRenderToTexture = useRenderToTexture;
          var r = this._renderContext;
          var bboxW = this._dimsUnknown ? 2048 : this._w;
          var bboxH = this._dimsUnknown ? 2048 : this._h; // Calculate a bbox for this element.

          var sx, sy, ex, ey;
          var rComplex = r.tb !== 0 || r.tc !== 0 || r.ta < 0 || r.td < 0;

          if (rComplex) {
            sx = Math.min(0, bboxW * r.ta, bboxW * r.ta + bboxH * r.tb, bboxH * r.tb) + r.px;
            ex = Math.max(0, bboxW * r.ta, bboxW * r.ta + bboxH * r.tb, bboxH * r.tb) + r.px;
            sy = Math.min(0, bboxW * r.tc, bboxW * r.tc + bboxH * r.td, bboxH * r.td) + r.py;
            ey = Math.max(0, bboxW * r.tc, bboxW * r.tc + bboxH * r.td, bboxH * r.td) + r.py;
          } else {
            sx = r.px;
            ex = r.px + r.ta * bboxW;
            sy = r.py;
            ey = r.py + r.td * bboxH;
          }

          if (this._dimsUnknown && (rComplex || this._localTa < 1 || this._localTb < 1)) {
            // If we are dealing with a non-identity matrix, we must extend the bbox so that withinBounds and
            //  scissors will include the complete range of (positive) dimensions up to ,lh.
            var nx = this._x * pr.ta + this._y * pr.tb + pr.px;
            var ny = this._x * pr.tc + this._y * pr.td + pr.py;
            if (nx < sx) sx = nx;
            if (ny < sy) sy = ny;
            if (nx > ex) ex = nx;
            if (ny > ey) ey = ny;
          }

          if (recalc & 6 || !this._scissor
          /* initial */
          ) {
              // Determine whether we must 'clip'.
              if (this._clipping && r.isSquare()) {
                // If the parent renders to a texture, it's scissor should be ignored;
                var area = this._parent._useRenderToTexture ? this._parent._viewport : this._parent._scissor;

                if (area) {
                  // Merge scissor areas.
                  var lx = Math.max(area[0], sx);
                  var ly = Math.max(area[1], sy);
                  this._scissor = [lx, ly, Math.min(area[2] + area[0], ex) - lx, Math.min(area[3] + area[1], ey) - ly];
                } else {
                  this._scissor = [sx, sy, ex - sx, ey - sy];
                }
              } else {
                // No clipping: reuse parent scissor.
                this._scissor = this._parent._useRenderToTexture ? this._parent._viewport : this._parent._scissor;
              }
            } // Calculate the outOfBounds margin.


          if (this._boundsMargin) {
            this._recBoundsMargin = this._boundsMargin;
          } else {
            this._recBoundsMargin = this._parent._recBoundsMargin;
          }

          if (this._onAfterCalcs) {
            // After calcs may change render coords, scissor and/or recBoundsMargin.
            if (this._onAfterCalcs(this.element)) {
              // Recalculate bbox.
              if (rComplex) {
                sx = Math.min(0, bboxW * r.ta, bboxW * r.ta + bboxH * r.tb, bboxH * r.tb) + r.px;
                ex = Math.max(0, bboxW * r.ta, bboxW * r.ta + bboxH * r.tb, bboxH * r.tb) + r.px;
                sy = Math.min(0, bboxW * r.tc, bboxW * r.tc + bboxH * r.td, bboxH * r.td) + r.py;
                ey = Math.max(0, bboxW * r.tc, bboxW * r.tc + bboxH * r.td, bboxH * r.td) + r.py;
              } else {
                sx = r.px;
                ex = r.px + r.ta * bboxW;
                sy = r.py;
                ey = r.py + r.td * bboxH;
              }

              if (this._dimsUnknown && (rComplex || this._localTa < 1 || this._localTb < 1)) {
                var _nx = this._x * pr.ta + this._y * pr.tb + pr.px;

                var _ny = this._x * pr.tc + this._y * pr.td + pr.py;

                if (_nx < sx) sx = _nx;
                if (_ny < sy) sy = _ny;
                if (_nx > ex) ex = _nx;
                if (_ny > ey) ey = _ny;
              }
            }
          }

          if (this._parent._outOfBounds === 2) {
            // Inherit parent out of boundsness.
            this._outOfBounds = 2;

            if (this._withinBoundsMargin) {
              this._withinBoundsMargin = false;

              this.element._disableWithinBoundsMargin();
            }
          } else {
            if (recalc & 6) {
              // Recheck if element is out-of-bounds (all settings that affect this should enable recalc bit 2 or 4).
              this._outOfBounds = 0;
              var withinMargin = true; // Offscreens are always rendered as long as the parent is within bounds.

              if (!this._renderToTextureEnabled || !this._texturizer || !this._texturizer.renderOffscreen) {
                if (this._scissor && (this._scissor[2] <= 0 || this._scissor[3] <= 0)) {
                  // Empty scissor area.
                  this._outOfBounds = 2;
                } else {
                  // Use bbox to check out-of-boundness.
                  if (this._scissor[0] > ex || this._scissor[1] > ey || sx > this._scissor[0] + this._scissor[2] || sy > this._scissor[1] + this._scissor[3]) {
                    this._outOfBounds = 1;
                  }

                  if (this._outOfBounds) {
                    if (this._clipping || this._useRenderToTexture || this._clipbox && bboxW && bboxH) {
                      this._outOfBounds = 2;
                    }
                  }
                }

                withinMargin = this._outOfBounds === 0;

                if (!withinMargin) {
                  // Re-test, now with margins.
                  if (this._recBoundsMargin) {
                    withinMargin = !(ex < this._scissor[0] - this._recBoundsMargin[2] || ey < this._scissor[1] - this._recBoundsMargin[3] || sx > this._scissor[0] + this._scissor[2] + this._recBoundsMargin[0] || sy > this._scissor[1] + this._scissor[3] + this._recBoundsMargin[1]);
                  } else {
                    withinMargin = !(ex < this._scissor[0] - 100 || ey < this._scissor[1] - 100 || sx > this._scissor[0] + this._scissor[2] + 100 || sy > this._scissor[1] + this._scissor[3] + 100);
                  }

                  if (withinMargin && this._outOfBounds === 2) {
                    // Children must be visited because they may contain elements that are within margin, so must be visible.
                    this._outOfBounds = 1;
                  }
                }
              }

              if (this._withinBoundsMargin !== withinMargin) {
                this._withinBoundsMargin = withinMargin;

                if (this._withinBoundsMargin) {
                  // This may update things (txLoaded events) in the element itself, but also in descendants and ancestors.
                  // Changes in ancestors should be executed during the next call of the stage update. But we must
                  // take care that the _recalc and _hasUpdates flags are properly registered. That's why we clear
                  // both before entering the children, and use _pRecalc to transfer inherited updates instead of
                  // _recalc directly.
                  // Changes in descendants are automatically executed within the current update loop, though we must
                  // take care to not update the hasUpdates flag unnecessarily in ancestors. We achieve this by making
                  // sure that the hasUpdates flag of this element is turned on, which blocks it for ancestors.
                  this._hasUpdates = true;
                  var _recalc = this._recalc;
                  this._recalc = 0;

                  this.element._enableWithinBoundsMargin();

                  if (this._recalc) {
                    // This element needs to be re-updated now, because we want the dimensions (and other changes) to be updated.
                    return this.update();
                  }

                  this._recalc = _recalc;
                } else {
                  this.element._disableWithinBoundsMargin();
                }
              }
            }
          }

          if (this._useRenderToTexture) {
            // Set viewport necessary for children scissor calculation.
            if (this._viewport) {
              this._viewport[2] = bboxW;
              this._viewport[3] = bboxH;
            } else {
              this._viewport = [0, 0, bboxW, bboxH];
            }
          } // Filter out bits that should not be copied to the children (currently all are).


          this._pRecalc = this._recalc & 135; // Clear flags so that future updates are properly detected.

          this._recalc = 0;
          this._hasUpdates = false;

          if (this._outOfBounds < 2) {
            if (this._useRenderToTexture) {
              if (this._worldContext.isIdentity()) {
                // Optimization.
                // The world context is already identity: use the world context as render context to prevents the
                // ancestors from having to update the render context.
                this._renderContext = this._worldContext;
              } else {
                // Temporarily replace the render coord attribs by the identity matrix.
                // This allows the children to calculate the render context.
                this._renderContext = ElementCoreContext.IDENTITY;
              }
            }

            if (this._children) {
              for (var i = 0, n = this._children.length; i < n; i++) {
                this._children[i].update();
              }
            }

            if (this._useRenderToTexture) {
              this._renderContext = r;
            }
          } else {
            if (this._children) {
              for (var _i2 = 0, _n2 = this._children.length; _i2 < _n2; _i2++) {
                if (this._children[_i2]._hasUpdates) {
                  this._children[_i2].update();
                } else {
                  // Make sure we don't lose the 'inherited' updates.
                  this._children[_i2]._recalc |= this._pRecalc;

                  this._children[_i2].updateOutOfBounds();
                }
              }
            }
          }

          if (this._onAfterUpdate) {
            this._onAfterUpdate(this.element);
          }
        } else {
          if (this.ctx.updateTreeOrder === -1 || this._updateTreeOrder >= this.ctx.updateTreeOrder) {
            // If new tree order does not interfere with the current (gaps allowed) there's no need to traverse the branch.
            this.ctx.updateTreeOrder = -1;
          } else {
            this.updateTreeOrder();
          }
        }
      }
    }, {
      key: "_applyRelativeDimFuncs",
      value: function _applyRelativeDimFuncs() {
        if (this._optFlags & 1) {
          var x = this._funcX(this._parent.w);

          if (x !== this._x) {
            this._localPx += x - this._x;
            this._x = x;
          }
        }

        if (this._optFlags & 2) {
          var y = this._funcY(this._parent.h);

          if (y !== this._y) {
            this._localPy += y - this._y;
            this._y = y;
          }
        }

        var changedDims = false;

        if (this._optFlags & 4) {
          var w = this._funcW(this._parent.w);

          if (w !== this._w) {
            this._w = w;
            changedDims = true;
          }
        }

        if (this._optFlags & 8) {
          var h = this._funcH(this._parent.h);

          if (h !== this._h) {
            this._h = h;
            changedDims = true;
          }
        }

        if (changedDims) {
          // Recalc mount, scale position.
          this._recalcLocalTranslate();

          this.element.onDimensionsChanged(this._w, this._h);
        }
      }
    }, {
      key: "updateOutOfBounds",
      value: function updateOutOfBounds() {
        // Propagate outOfBounds flag to descendants (necessary because of z-indexing).
        // Invisible elements are not drawn anyway. When alpha is updated, so will _outOfBounds.
        if (this._outOfBounds !== 2 && this._renderContext.alpha > 0) {
          // Inherit parent out of boundsness.
          this._outOfBounds = 2;

          if (this._withinBoundsMargin) {
            this._withinBoundsMargin = false;

            this.element._disableWithinBoundsMargin();
          }

          if (this._children) {
            for (var i = 0, n = this._children.length; i < n; i++) {
              this._children[i].updateOutOfBounds();
            }
          }
        }
      }
    }, {
      key: "updateTreeOrder",
      value: function updateTreeOrder() {
        if (this._localAlpha && this._outOfBounds !== 2) {
          this._updateTreeOrder = this.ctx.updateTreeOrder++;

          if (this._children) {
            for (var i = 0, n = this._children.length; i < n; i++) {
              this._children[i].updateTreeOrder();
            }
          }
        }
      }
    }, {
      key: "_renderSimple",
      value: function _renderSimple() {
        this._hasRenderUpdates = 0;

        if (this._zSort) {
          this.sortZIndexedChildren();
        }

        if (this._outOfBounds < 2 && this._renderContext.alpha) {
          var renderState = this.renderState;

          if (this._outOfBounds === 0 && this._displayedTextureSource) {
            renderState.setShader(this.activeShader, this._shaderOwner);
            renderState.setScissor(this._scissor);
            this.renderState.addQuad(this);
          } // Also add children to the VBO.


          if (this._children) {
            if (this._zContextUsage) {
              for (var i = 0, n = this._zIndexedChildren.length; i < n; i++) {
                this._zIndexedChildren[i].render();
              }
            } else {
              for (var _i3 = 0, _n3 = this._children.length; _i3 < _n3; _i3++) {
                if (this._children[_i3]._zIndex === 0) {
                  // If zIndex is set, this item already belongs to a zIndexedChildren array in one of the ancestors.
                  this._children[_i3].render();
                }
              }
            }
          }
        }
      }
    }, {
      key: "_renderAdvanced",
      value: function _renderAdvanced() {
        var hasRenderUpdates = this._hasRenderUpdates; // We must clear the hasRenderUpdates flag before rendering, because updating result textures in combination
        // with z-indexing may trigger render updates on a render branch that is 'half done'.
        // We need to ensure that the full render branch is marked for render updates, not only half (leading to freeze).

        this._hasRenderUpdates = 0;

        if (this._zSort) {
          this.sortZIndexedChildren();
        }

        if (this._outOfBounds < 2 && this._renderContext.alpha) {
          var renderState = this.renderState;
          var mustRenderChildren = true;
          var renderTextureInfo;
          var prevRenderTextureInfo;

          if (this._useRenderToTexture) {
            if (this._w === 0 || this._h === 0) {
              // Ignore this branch and don't draw anything.
              return;
            } else if (!this._texturizer.hasRenderTexture() || hasRenderUpdates >= 3) {
              // Switch to default shader for building up the render texture.
              renderState.setShader(renderState.defaultShader, this);
              prevRenderTextureInfo = renderState.renderTextureInfo;
              renderTextureInfo = {
                nativeTexture: null,
                offset: 0,
                // Set by CoreRenderState.
                w: this._w,
                h: this._h,
                empty: true,
                cleared: false,
                ignore: false,
                cache: false
              };

              if (this._texturizer.hasResultTexture() || !renderState.isCachingTexturizer && hasRenderUpdates < 3) {
                /**
                 * We don't always cache render textures.
                 *
                 * The rule is, that caching for a specific render texture is only enabled if:
                 * - There is a result texture to be updated.
                 * - There were no render updates -within the contents- since last frame (ElementCore.hasRenderUpdates < 3)
                 * - AND there are no ancestors that are being cached during this frame (CoreRenderState.isCachingTexturizer)
                 *   If an ancestor is cached anyway, it's probably not necessary to keep deeper caches. If the top level is to
                 *   change while a lower one is not, that lower level will be cached instead.
                 *
                 * In case of the fast blur element, this prevents having to cache all blur levels and stages, saving a huge amount
                 * of GPU memory!
                 *
                 * Especially when using multiple stacked layers of the same dimensions that are RTT this will have a very
                 * noticable effect on performance as less render textures need to be allocated.
                 */
                renderTextureInfo.cache = true;
                renderState.isCachingTexturizer = true;
              }

              if (!this._texturizer.hasResultTexture()) {
                // We can already release the current texture to the pool, as it will be rebuild anyway.
                // In case of multiple layers of 'filtering', this may save us from having to create one
                //  render-to-texture layer.
                // Notice that we don't do this when there is a result texture, as any other element may rely on
                //  that result texture being filled.
                this._texturizer.releaseRenderTexture();
              }

              renderState.setRenderTextureInfo(renderTextureInfo);
              renderState.setScissor(null);

              if (this._displayedTextureSource) {
                var r = this._renderContext; // Use an identity context for drawing the displayed texture to the render texture.

                this._renderContext = ElementCoreContext.IDENTITY; // Add displayed texture source in local coordinates.

                this.renderState.addQuad(this);
                this._renderContext = r;
              }
            } else {
              mustRenderChildren = false;
            }
          } else {
            if (this._outOfBounds === 0 && this._displayedTextureSource) {
              renderState.setShader(this.activeShader, this._shaderOwner);
              renderState.setScissor(this._scissor);
              this.renderState.addQuad(this);
            }
          } // Also add children to the VBO.


          if (mustRenderChildren && this._children) {
            if (this._zContextUsage) {
              for (var i = 0, n = this._zIndexedChildren.length; i < n; i++) {
                this._zIndexedChildren[i].render();
              }
            } else {
              for (var _i4 = 0, _n4 = this._children.length; _i4 < _n4; _i4++) {
                if (this._children[_i4]._zIndex === 0) {
                  // If zIndex is set, this item already belongs to a zIndexedChildren array in one of the ancestors.
                  this._children[_i4].render();
                }
              }
            }
          }

          if (this._useRenderToTexture) {
            var updateResultTexture = false;

            if (mustRenderChildren) {
              // Finished refreshing renderTexture.
              renderState.finishedRenderTexture(); // If nothing was rendered, we store a flag in the texturizer and prevent unnecessary
              //  render-to-texture and filtering.

              this._texturizer.empty = renderTextureInfo.empty;

              if (renderTextureInfo.empty) {
                // We ignore empty render textures and do not draw the final quad.
                // The following cleans up memory and enforces that the result texture is also cleared.
                this._texturizer.releaseRenderTexture();
              } else if (renderTextureInfo.nativeTexture) {
                // If nativeTexture is set, we can reuse that directly instead of creating a new render texture.
                this._texturizer.reuseTextureAsRenderTexture(renderTextureInfo.nativeTexture);

                renderTextureInfo.ignore = true;
              } else {
                if (this._texturizer.renderTextureReused) {
                  // Quad operations must be written to a render texture actually owned.
                  this._texturizer.releaseRenderTexture();
                } // Just create the render texture.


                renderTextureInfo.nativeTexture = this._texturizer.getRenderTexture();
              } // Restore the parent's render texture.


              renderState.setRenderTextureInfo(prevRenderTextureInfo);
              updateResultTexture = true;
            }

            if (!this._texturizer.empty) {
              var resultTexture = this._texturizer.getResultTexture();

              if (updateResultTexture) {
                if (resultTexture) {
                  // Logging the update frame can be handy for userland.
                  resultTexture.update = renderState.stage.frameCounter;
                }

                this._texturizer.updateResultTexture();
              }

              if (!this._texturizer.renderOffscreen) {
                // Render result texture to the actual render target.
                renderState.setShader(this.activeShader, this._shaderOwner);
                renderState.setScissor(this._scissor); // If no render texture info is set, the cache can be reused.

                var cache = !renderTextureInfo || renderTextureInfo.cache;
                renderState.setTexturizer(this._texturizer, cache);

                this._stashTexCoords();

                if (!this._texturizer.colorize) this._stashColors();
                this.renderState.addQuad(this, true);
                if (!this._texturizer.colorize) this._unstashColors();

                this._unstashTexCoords();

                renderState.setTexturizer(null);
              }
            }
          }

          if (renderTextureInfo && renderTextureInfo.cache) {
            // Allow siblings to cache.
            renderState.isCachingTexturizer = false;
          }
        }
      }
    }, {
      key: "sortZIndexedChildren",
      value: function sortZIndexedChildren() {
        /**
         * We want to avoid resorting everything. Instead, we do a single pass of the full array:
         * - filtering out elements with a different zParent than this (were removed)
         * - filtering out, but also gathering (in a temporary array) the elements that have zIndexResort flag
         * - then, finally, we merge-sort both the new array and the 'old' one
         * - element may have been added 'double', so when merge-sorting also check for doubles.
         * - if the old one is larger (in size) than it should be, splice off the end of the array.
         */
        var n = this._zIndexedChildren.length;
        var ptr = 0;
        var a = this._zIndexedChildren; // Notice that items may occur multiple times due to z-index changing.

        var b = [];

        for (var i = 0; i < n; i++) {
          if (a[i]._zParent === this) {
            if (a[i]._zIndexResort) {
              b.push(a[i]);
            } else {
              if (ptr !== i) {
                a[ptr] = a[i];
              }

              ptr++;
            }
          }
        }

        var m = b.length;

        if (m) {
          for (var j = 0; j < m; j++) {
            b[j]._zIndexResort = false;
          }

          b.sort(ElementCore.sortZIndexedChildren);
          var _n5 = ptr;

          if (!_n5) {
            ptr = 0;
            var _j = 0;

            do {
              a[ptr++] = b[_j++];
            } while (_j < m);

            if (a.length > ptr) {
              // Slice old (unnecessary) part off array.
              a.splice(ptr);
            }
          } else {
            // Merge-sort arrays;
            ptr = 0;
            var _i5 = 0;
            var _j2 = 0;
            var mergeResult = [];

            do {
              var v = a[_i5]._zIndex === b[_j2]._zIndex ? a[_i5]._updateTreeOrder - b[_j2]._updateTreeOrder : a[_i5]._zIndex - b[_j2]._zIndex;
              var add = v > 0 ? b[_j2++] : a[_i5++];

              if (ptr === 0 || mergeResult[ptr - 1] !== add) {
                mergeResult[ptr++] = add;
              }

              if (_i5 >= _n5) {
                do {
                  var _add = b[_j2++];

                  if (ptr === 0 || mergeResult[ptr - 1] !== _add) {
                    mergeResult[ptr++] = _add;
                  }
                } while (_j2 < m);

                break;
              } else if (_j2 >= m) {
                do {
                  var _add2 = a[_i5++];

                  if (ptr === 0 || mergeResult[ptr - 1] !== _add2) {
                    mergeResult[ptr++] = _add2;
                  }
                } while (_i5 < _n5);

                break;
              }
            } while (true);

            this._zIndexedChildren = mergeResult;
          }
        } else {
          if (a.length > ptr) {
            // Slice old (unnecessary) part off array.
            a.splice(ptr);
          }
        }

        this._zSort = false;
      }
    }, {
      key: "getCornerPoints",
      value: function getCornerPoints() {
        var w = this._worldContext;
        return [w.px, w.py, w.px + this._w * w.ta, w.py + this._w * w.tc, w.px + this._w * w.ta + this._h * w.tb, w.py + this._w * w.tc + this._h * w.td, w.px + this._h * w.tb, w.py + this._h * w.td];
      }
    }, {
      key: "getRenderTextureCoords",
      value: function getRenderTextureCoords(relX, relY) {
        var r = this._renderContext;
        return [r.px + r.ta * relX + r.tb * relY, r.py + r.tc * relX + r.td * relY];
      }
    }, {
      key: "getAbsoluteCoords",
      value: function getAbsoluteCoords(relX, relY) {
        var w = this._renderContext;
        return [w.px + w.ta * relX + w.tb * relY, w.py + w.tc * relX + w.td * relY];
      }
    }, {
      key: "isFlexItem",
      value: function isFlexItem() {
        return !!this._layout && this._layout.isFlexItemEnabled();
      }
    }, {
      key: "isFlexContainer",
      value: function isFlexContainer() {
        return !!this._layout && this._layout.isFlexEnabled();
      }
    }, {
      key: "enableFlexLayout",
      value: function enableFlexLayout() {
        this._ensureLayout();
      }
    }, {
      key: "_ensureLayout",
      value: function _ensureLayout() {
        if (!this._layout) {
          this._layout = new FlexTarget(this);
        }
      }
    }, {
      key: "disableFlexLayout",
      value: function disableFlexLayout() {
        this._triggerRecalcTranslate();
      }
    }, {
      key: "hasFlexLayout",
      value: function hasFlexLayout() {
        return this._layout && this._layout.isEnabled();
      }
    }, {
      key: "setLayout",
      value: function setLayout(x, y, w, h) {
        this.x = x;
        this.y = y;

        this._updateDimensions(w, h);
      }
    }, {
      key: "triggerLayout",
      value: function triggerLayout() {
        this._setRecalc(256);
      }
    }, {
      key: "_triggerRecalcTranslate",
      value: function _triggerRecalcTranslate() {
        this._setRecalc(2);
      }
    }, {
      key: "offsetX",
      get: function get() {
        if (this._funcX) {
          return this._funcX;
        } else {
          if (this.hasFlexLayout()) {
            return this._layout.originalX;
          } else {
            return this._x;
          }
        }
      },
      set: function set(v) {
        if (Utils.isFunction(v)) {
          this.funcX = v;
        } else {
          this._disableFuncX();

          if (this.hasFlexLayout()) {
            this.x += v - this._layout.originalX;

            this._layout.setOriginalXWithoutUpdatingLayout(v);
          } else {
            this.x = v;
          }
        }
      }
    }, {
      key: "x",
      get: function get() {
        return this._x;
      },
      set: function set(v) {
        if (v !== this._x) {
          this._updateLocalTranslateDelta(v - this._x, 0);

          this._x = v;
        }
      }
    }, {
      key: "funcX",
      get: function get() {
        return this._optFlags & 1 ? this._funcX : null;
      },
      set: function set(v) {
        if (this._funcX !== v) {
          this._optFlags |= 1;
          this._funcX = v;

          if (this.hasFlexLayout()) {
            this._layout.setOriginalXWithoutUpdatingLayout(0);

            this.layout.forceLayout();
          } else {
            this._x = 0;

            this._triggerRecalcTranslate();
          }
        }
      }
    }, {
      key: "offsetY",
      get: function get() {
        if (this._funcY) {
          return this._funcY;
        } else {
          if (this.hasFlexLayout()) {
            return this._layout.originalY;
          } else {
            return this._y;
          }
        }
      },
      set: function set(v) {
        if (Utils.isFunction(v)) {
          this.funcY = v;
        } else {
          this._disableFuncY();

          if (this.hasFlexLayout()) {
            this.y += v - this._layout.originalY;

            this._layout.setOriginalYWithoutUpdatingLayout(v);
          } else {
            this.y = v;
          }
        }
      }
    }, {
      key: "y",
      get: function get() {
        return this._y;
      },
      set: function set(v) {
        if (v !== this._y) {
          this._updateLocalTranslateDelta(0, v - this._y);

          this._y = v;
        }
      }
    }, {
      key: "funcY",
      get: function get() {
        return this._optFlags & 2 ? this._funcY : null;
      },
      set: function set(v) {
        if (this._funcY !== v) {
          this._optFlags |= 2;
          this._funcY = v;

          if (this.hasFlexLayout()) {
            this._layout.setOriginalYWithoutUpdatingLayout(0);

            this.layout.forceLayout();
          } else {
            this._y = 0;

            this._triggerRecalcTranslate();
          }
        }
      }
    }, {
      key: "funcW",
      get: function get() {
        return this._optFlags & 4 ? this._funcW : null;
      },
      set: function set(v) {
        if (this._funcW !== v) {
          this._optFlags |= 4;
          this._funcW = v;

          if (this.hasFlexLayout()) {
            this._layout._originalWidth = 0;
            this.layout.changedDimensions(true, false);
          } else {
            this._w = 0;

            this._triggerRecalcTranslate();
          }
        }
      }
    }, {
      key: "funcH",
      get: function get() {
        return this._optFlags & 8 ? this._funcH : null;
      },
      set: function set(v) {
        if (this._funcH !== v) {
          this._optFlags |= 8;
          this._funcH = v;

          if (this.hasFlexLayout()) {
            this._layout._originalHeight = 0;
            this.layout.changedDimensions(false, true);
          } else {
            this._h = 0;

            this._triggerRecalcTranslate();
          }
        }
      }
    }, {
      key: "w",
      get: function get() {
        return this._w;
      }
    }, {
      key: "h",
      get: function get() {
        return this._h;
      }
    }, {
      key: "scaleX",
      get: function get() {
        return this._scaleX;
      },
      set: function set(v) {
        if (this._scaleX !== v) {
          this._scaleX = v;

          this._updateLocalTransform();
        }
      }
    }, {
      key: "scaleY",
      get: function get() {
        return this._scaleY;
      },
      set: function set(v) {
        if (this._scaleY !== v) {
          this._scaleY = v;

          this._updateLocalTransform();
        }
      }
    }, {
      key: "scale",
      get: function get() {
        return this.scaleX;
      },
      set: function set(v) {
        if (this._scaleX !== v || this._scaleY !== v) {
          this._scaleX = v;
          this._scaleY = v;

          this._updateLocalTransform();
        }
      }
    }, {
      key: "pivotX",
      get: function get() {
        return this._pivotX;
      },
      set: function set(v) {
        if (this._pivotX !== v) {
          this._pivotX = v;

          this._updateLocalTranslate();
        }
      }
    }, {
      key: "pivotY",
      get: function get() {
        return this._pivotY;
      },
      set: function set(v) {
        if (this._pivotY !== v) {
          this._pivotY = v;

          this._updateLocalTranslate();
        }
      }
    }, {
      key: "pivot",
      get: function get() {
        return this._pivotX;
      },
      set: function set(v) {
        if (this._pivotX !== v || this._pivotY !== v) {
          this._pivotX = v;
          this._pivotY = v;

          this._updateLocalTranslate();
        }
      }
    }, {
      key: "mountX",
      get: function get() {
        return this._mountX;
      },
      set: function set(v) {
        if (this._mountX !== v) {
          this._mountX = v;

          this._updateLocalTranslate();
        }
      }
    }, {
      key: "mountY",
      get: function get() {
        return this._mountY;
      },
      set: function set(v) {
        if (this._mountY !== v) {
          this._mountY = v;

          this._updateLocalTranslate();
        }
      }
    }, {
      key: "mount",
      get: function get() {
        return this._mountX;
      },
      set: function set(v) {
        if (this._mountX !== v || this._mountY !== v) {
          this._mountX = v;
          this._mountY = v;

          this._updateLocalTranslate();
        }
      }
    }, {
      key: "rotation",
      get: function get() {
        return this._rotation;
      },
      set: function set(v) {
        if (this._rotation !== v) {
          this._rotation = v;

          this._updateLocalTransform();
        }
      }
    }, {
      key: "alpha",
      get: function get() {
        return this._alpha;
      },
      set: function set(v) {
        // Account for rounding errors.
        v = v > 1 ? 1 : v < 1e-14 ? 0 : v;

        if (this._alpha !== v) {
          var prev = this._alpha;
          this._alpha = v;

          this._updateLocalAlpha();

          if (prev === 0 !== (v === 0)) {
            this._element._updateEnabledFlag();
          }
        }
      }
    }, {
      key: "visible",
      get: function get() {
        return this._visible;
      },
      set: function set(v) {
        if (this._visible !== v) {
          this._visible = v;

          this._updateLocalAlpha();

          this._element._updateEnabledFlag();

          if (this.hasFlexLayout()) {
            this.layout.setVisible(v);
          }
        }
      }
    }, {
      key: "displayedTextureSource",
      get: function get() {
        return this._displayedTextureSource;
      }
    }, {
      key: "isRoot",
      get: function get() {
        return this._isRoot;
      }
    }, {
      key: "zIndex",
      get: function get() {
        return this._zIndex;
      },
      set: function set(zIndex) {
        if (this._zIndex !== zIndex) {
          this.setHasRenderUpdates(1);
          var newZParent = this._zParent;
          var prevIsZContext = this.isZContext();

          if (zIndex === 0 && this._zIndex !== 0) {
            if (this._parent === this._zParent) {
              if (this._zParent) {
                this._zParent.decZContextUsage();
              }
            } else {
              newZParent = this._parent;
            }
          } else if (zIndex !== 0 && this._zIndex === 0) {
            newZParent = this._parent ? this._parent.findZContext() : null;

            if (newZParent === this._zParent) {
              if (this._zParent) {
                this._zParent.incZContextUsage();

                this._zParent.enableZSort();
              }
            }
          } else if (zIndex !== this._zIndex) {
            if (this._zParent && this._zParent._zContextUsage) {
              this._zParent.enableZSort();
            }
          }

          if (newZParent !== this._zParent) {
            this.setZParent(null);
          }

          this._zIndex = zIndex;

          if (newZParent !== this._zParent) {
            this.setZParent(newZParent);
          }

          if (prevIsZContext !== this.isZContext()) {
            if (!this.isZContext()) {
              this.disableZContext();
            } else {
              this.enableZContext(this._parent.findZContext());
            }
          } // Make sure that resort is done.


          this._zIndexResort = true;

          if (this._zParent) {
            this._zParent.enableZSort();
          }
        }
      }
    }, {
      key: "forceZIndexContext",
      get: function get() {
        return this._forceZIndexContext;
      },
      set: function set(v) {
        this.setHasRenderUpdates(1);
        var prevIsZContext = this.isZContext();
        this._forceZIndexContext = v;

        if (prevIsZContext !== this.isZContext()) {
          if (!this.isZContext()) {
            this.disableZContext();
          } else {
            this.enableZContext(this._parent.findZContext());
          }
        }
      }
    }, {
      key: "colorUl",
      get: function get() {
        return this._colorUl;
      },
      set: function set(color) {
        if (this._colorUl !== color) {
          this.setHasRenderUpdates(this._displayedTextureSource ? 3 : 1);
          this._colorUl = color;
        }
      }
    }, {
      key: "colorUr",
      get: function get() {
        return this._colorUr;
      },
      set: function set(color) {
        if (this._colorUr !== color) {
          this.setHasRenderUpdates(this._displayedTextureSource ? 3 : 1);
          this._colorUr = color;
        }
      }
    }, {
      key: "colorBl",
      get: function get() {
        return this._colorBl;
      },
      set: function set(color) {
        if (this._colorBl !== color) {
          this.setHasRenderUpdates(this._displayedTextureSource ? 3 : 1);
          this._colorBl = color;
        }
      }
    }, {
      key: "colorBr",
      get: function get() {
        return this._colorBr;
      },
      set: function set(color) {
        if (this._colorBr !== color) {
          this.setHasRenderUpdates(this._displayedTextureSource ? 3 : 1);
          this._colorBr = color;
        }
      }
    }, {
      key: "onUpdate",
      set: function set(f) {
        this._onUpdate = f;

        this._setRecalc(7);
      }
    }, {
      key: "onAfterUpdate",
      set: function set(f) {
        this._onAfterUpdate = f;

        this._setRecalc(7);
      }
    }, {
      key: "onAfterCalcs",
      set: function set(f) {
        this._onAfterCalcs = f;

        this._setRecalc(7);
      }
    }, {
      key: "shader",
      get: function get() {
        return this._shader;
      },
      set: function set(v) {
        this.setHasRenderUpdates(1);
        var prevShader = this._shader;
        this._shader = v;

        if (!v && prevShader) {
          // Disabled shader.
          var newShaderOwner = this._parent && !this._parent._renderToTextureEnabled ? this._parent._shaderOwner : null;

          this._setShaderOwnerRecursive(newShaderOwner);
        } else if (v) {
          // Enabled shader.
          this._setShaderOwnerRecursive(this);
        }
      }
    }, {
      key: "activeShader",
      get: function get() {
        return this._shaderOwner ? this._shaderOwner.shader : this.renderState.defaultShader;
      }
    }, {
      key: "activeShaderOwner",
      get: function get() {
        return this._shaderOwner;
      }
    }, {
      key: "clipping",
      get: function get() {
        return this._clipping;
      },
      set: function set(v) {
        if (this._clipping !== v) {
          this._clipping = v; // Force update of scissor by updating translate.
          // Alpha must also be updated because the scissor area may have been empty.

          this._setRecalc(1 + 2);
        }
      }
    }, {
      key: "clipbox",
      get: function get() {
        return this._clipbox;
      },
      set: function set(v) {
        // In case of out-of-bounds element, all children will also be ignored.
        // It will save us from executing the update/render loops for those.
        // The optimization will be used immediately during the next frame.
        this._clipbox = v;
      }
    }, {
      key: "renderContext",
      get: function get() {
        return this._renderContext;
      }
    }, {
      key: "outOfBounds",
      get: function get() {
        return this._outOfBounds;
      }
    }, {
      key: "boundsMargin",
      set: function set(v) {
        /**
         *  null: inherit from parent.
         *  number[4]: specific margins: left, top, right, bottom.
         */
        this._boundsMargin = v ? v.slice() : null; // We force recalc in order to set all boundsMargin recursively during the next update.

        this._triggerRecalcTranslate();
      },
      get: function get() {
        return this._boundsMargin;
      }
    }, {
      key: "zSort",
      get: function get() {
        return this._zSort;
      }
    }, {
      key: "localTa",
      get: function get() {
        return this._localTa;
      }
    }, {
      key: "localTb",
      get: function get() {
        return this._localTb;
      }
    }, {
      key: "localTc",
      get: function get() {
        return this._localTc;
      }
    }, {
      key: "localTd",
      get: function get() {
        return this._localTd;
      }
    }, {
      key: "element",
      get: function get() {
        return this._element;
      }
    }, {
      key: "renderUpdates",
      get: function get() {
        return this._hasRenderUpdates;
      }
    }, {
      key: "texturizer",
      get: function get() {
        if (!this._texturizer) {
          this._texturizer = new ElementTexturizer(this);
        }

        return this._texturizer;
      }
    }, {
      key: "layout",
      get: function get() {
        this._ensureLayout();

        return this._layout;
      }
    }, {
      key: "flex",
      get: function get() {
        return this._layout ? this._layout.flex : null;
      },
      set: function set(v) {
        this.layout.flex = v;
      }
    }, {
      key: "flexItem",
      get: function get() {
        return this._layout ? this._layout.flexItem : null;
      },
      set: function set(v) {
        this.layout.flexItem = v;
      }
    }]);

    return ElementCore;
  }();

  var ElementCoreContext =
  /*#__PURE__*/
  function () {
    function ElementCoreContext() {
      _classCallCheck(this, ElementCoreContext);

      this.alpha = 1;
      this.px = 0;
      this.py = 0;
      this.ta = 1;
      this.tb = 0;
      this.tc = 0;
      this.td = 1;
    }

    _createClass(ElementCoreContext, [{
      key: "isIdentity",
      value: function isIdentity() {
        return this.alpha === 1 && this.px === 0 && this.py === 0 && this.ta === 1 && this.tb === 0 && this.tc === 0 && this.td === 1;
      }
    }, {
      key: "isSquare",
      value: function isSquare() {
        return this.tb === 0 && this.tc === 0;
      }
    }]);

    return ElementCoreContext;
  }();

  ElementCoreContext.IDENTITY = new ElementCoreContext();

  ElementCore.sortZIndexedChildren = function (a, b) {
    return a._zIndex === b._zIndex ? a._updateTreeOrder - b._updateTreeOrder : a._zIndex - b._zIndex;
  };

  /**
   * This is a partial (and more efficient) implementation of the event emitter.
   * It attempts to maintain a one-to-one mapping between events and listeners, skipping an array lookup.
   * Only if there are multiple listeners, they are combined in an array.
   */
  var EventEmitter =
  /*#__PURE__*/
  function () {
    function EventEmitter() {
      _classCallCheck(this, EventEmitter);

      // This is set (and kept) to true when events are used at all.
      this._hasEventListeners = false;
    }

    _createClass(EventEmitter, [{
      key: "on",
      value: function on(name, listener) {
        if (!this._hasEventListeners) {
          this._eventFunction = {};
          this._eventListeners = {};
          this._hasEventListeners = true;
        }

        var current = this._eventFunction[name];

        if (!current) {
          this._eventFunction[name] = listener;
        } else {
          if (this._eventFunction[name] !== EventEmitter.combiner) {
            this._eventListeners[name] = [this._eventFunction[name], listener];
            this._eventFunction[name] = EventEmitter.combiner;
          } else {
            this._eventListeners[name].push(listener);
          }
        }
      }
    }, {
      key: "has",
      value: function has(name, listener) {
        if (this._hasEventListeners) {
          var current = this._eventFunction[name];

          if (current) {
            if (current === EventEmitter.combiner) {
              var listeners = this._eventListeners[name];
              var index = listeners.indexOf(listener);
              return index >= 0;
            } else if (this._eventFunction[name] === listener) {
              return true;
            }
          }
        }

        return false;
      }
    }, {
      key: "off",
      value: function off(name, listener) {
        if (this._hasEventListeners) {
          var current = this._eventFunction[name];

          if (current) {
            if (current === EventEmitter.combiner) {
              var listeners = this._eventListeners[name];
              var index = listeners.indexOf(listener);

              if (index >= 0) {
                listeners.splice(index, 1);
              }

              if (listeners.length === 1) {
                this._eventFunction[name] = listeners[0];
                this._eventListeners[name] = undefined;
              }
            } else if (this._eventFunction[name] === listener) {
              this._eventFunction[name] = undefined;
            }
          }
        }
      }
    }, {
      key: "removeListener",
      value: function removeListener(name, listener) {
        this.off(name, listener);
      }
    }, {
      key: "emit",
      value: function emit(name, arg1, arg2, arg3) {
        if (this._hasEventListeners) {
          var func = this._eventFunction[name];

          if (func) {
            if (func === EventEmitter.combiner) {
              func(this, name, arg1, arg2, arg3);
            } else {
              func(arg1, arg2, arg3);
            }
          }
        }
      }
    }, {
      key: "listenerCount",
      value: function listenerCount(name) {
        if (this._hasEventListeners) {
          var func = this._eventFunction[name];

          if (func) {
            if (func === EventEmitter.combiner) {
              return this._eventListeners[name].length;
            } else {
              return 1;
            }
          }
        } else {
          return 0;
        }
      }
    }, {
      key: "removeAllListeners",
      value: function removeAllListeners(name) {
        if (this._hasEventListeners) {
          delete this._eventFunction[name];
          delete this._eventListeners[name];
        }
      }
    }]);

    return EventEmitter;
  }();

  EventEmitter.combiner = function (object, name, arg1, arg2, arg3) {
    var _this = this;

    var listeners = object._eventListeners[name];

    if (listeners) {
      // Because listener may detach itself while being invoked, we use a forEach instead of for loop.
      listeners.forEach(function (listener) {
        _newArrowCheck(this, _this);

        listener(arg1, arg2, arg3);
      }.bind(this));
    }
  };

  EventEmitter.addAsMixin = function (cls) {
    cls.prototype.on = EventEmitter.prototype.on;
    cls.prototype.has = EventEmitter.prototype.has;
    cls.prototype.off = EventEmitter.prototype.off;
    cls.prototype.removeListener = EventEmitter.prototype.removeListener;
    cls.prototype.emit = EventEmitter.prototype.emit;
    cls.prototype.listenerCount = EventEmitter.prototype.listenerCount;
    cls.prototype.removeAllListeners = EventEmitter.prototype.removeAllListeners;
  };

  var Shader =
  /*#__PURE__*/
  function () {
    function Shader(coreContext) {
      _classCallCheck(this, Shader);

      this._initialized = false;
      this.ctx = coreContext;
      /**
       * The (enabled) elements that use this shader.
       * @type {Set<ElementCore>}
       */

      this._elements = new Set();
    }

    _createClass(Shader, [{
      key: "addElement",
      value: function addElement(elementCore) {
        this._elements.add(elementCore);
      }
    }, {
      key: "removeElement",
      value: function removeElement(elementCore) {
        this._elements.delete(elementCore);

        if (!this._elements) {
          this.cleanup();
        }
      }
    }, {
      key: "redraw",
      value: function redraw() {
        var _this = this;

        this._elements.forEach(function (elementCore) {
          _newArrowCheck(this, _this);

          elementCore.setHasRenderUpdates(2);
        }.bind(this));
      }
    }, {
      key: "patch",
      value: function patch(settings) {
        Base.patchObject(this, settings);
      }
    }, {
      key: "useDefault",
      value: function useDefault() {
        // Should return true if this shader is configured (using it's properties) to not have any effect.
        // This may allow the render engine to avoid unnecessary shader program switches or even texture copies.
        return false;
      }
    }, {
      key: "addEmpty",
      value: function addEmpty() {
        // Draws this shader even if there are no quads to be added.
        // This is handy for custom shaders.
        return false;
      }
    }, {
      key: "cleanup",
      value: function cleanup() {// Called when no more enabled elements have this shader.
      }
    }, {
      key: "isShader",
      get: function get() {
        return true;
      }
    }], [{
      key: "create",
      value: function create(stage, v) {
        var shader;

        if (Utils.isObjectLiteral(v)) {
          if (v.type) {
            shader = stage.renderer.createShader(stage.ctx, v);
          } else {
            shader = this.shader;
          }

          if (shader) {
            Base.patchObject(shader, v);
          }
        } else if (v === null) {
          shader = stage.ctx.renderState.defaultShader;
        } else if (v === undefined) {
          shader = null;
        } else {
          if (v.isShader) {
            if (!stage.renderer.isValidShaderType(v.constructor)) {
              console.error("Invalid shader type");
              v = null;
            }

            shader = v;
          } else {
            console.error("Please specify a shader type.");
            return;
          }
        }

        return shader;
      }
    }, {
      key: "getWebGL",
      value: function getWebGL() {
        return undefined;
      }
    }, {
      key: "getC2d",
      value: function getC2d() {
        return undefined;
      }
    }]);

    return Shader;
  }();

  var Texture =
  /*#__PURE__*/
  function () {
    /**
     * @param {Stage} stage
     */
    function Texture(stage) {
      _classCallCheck(this, Texture);

      this.stage = stage;
      this.manager = this.stage.textureManager;
      this.id = Texture.id++;
      /**
       * All enabled elements that use this texture object (either as texture or displayedTexture).
       * @type {Set<Element>}
       */

      this.elements = new Set();
      /**
       * The number of enabled elements that are active.
       * @type {number}
       */

      this._activeCount = 0;
      /**
       * The associated texture source.
       * Should not be changed.
       * @type {TextureSource}
       */

      this._source = null;
      /**
       * A resize mode can be set to cover or contain a certain area.
       * It will reset the texture clipping settings.
       * When manual texture clipping is performed, the resizeMode is reset.
       * @type {{type: string, width: number, height: number}}
       * @private
       */

      this._resizeMode = null;
      /**
       * The texture clipping x-offset.
       * @type {number}
       */

      this._x = 0;
      /**
       * The texture clipping y-offset.
       * @type {number}
       */

      this._y = 0;
      /**
       * The texture clipping width. If 0 then full width.
       * @type {number}
       */

      this._w = 0;
      /**
       * The texture clipping height. If 0 then full height.
       * @type {number}
       */

      this._h = 0;
      /**
       * Render precision (0.5 = fuzzy, 1 = normal, 2 = sharp even when scaled twice, etc.).
       * @type {number}
       * @private
       */

      this._precision = 1;
      /**
       * The (maximum) expected texture source width. Used for within bounds determination while texture is not yet loaded.
       * If not set, 2048 is used by ElementCore.update.
       * @type {number}
       */

      this.mw = 0;
      /**
       * The (maximum) expected texture source height. Used for within bounds determination while texture is not yet loaded.
       * If not set, 2048 is used by ElementCore.update.
       * @type {number}
       */

      this.mh = 0;
      /**
       * Indicates if Texture.prototype.texture uses clipping.
       * @type {boolean}
       */

      this.clipping = false;
      /**
       * Indicates whether this texture must update (when it becomes used again).
       * @type {boolean}
       * @private
       */

      this._mustUpdate = true;
    }

    _createClass(Texture, [{
      key: "addElement",
      value: function addElement(v) {
        if (!this.elements.has(v)) {
          this.elements.add(v);

          if (this.elements.size === 1) {
            if (this._source) {
              this._source.addTexture(this);
            }
          }

          if (v.active) {
            this.incActiveCount();
          }
        }
      }
    }, {
      key: "removeElement",
      value: function removeElement(v) {
        if (this.elements.delete(v)) {
          if (this.elements.size === 0) {
            if (this._source) {
              this._source.removeTexture(this);
            }
          }

          if (v.active) {
            this.decActiveCount();
          }
        }
      }
    }, {
      key: "incActiveCount",
      value: function incActiveCount() {
        // Ensure that texture source's activeCount has transferred ownership.
        var source = this.source;

        if (source) {
          this._checkForNewerReusableTextureSource();
        }

        this._activeCount++;

        if (this._activeCount === 1) {
          this.becomesUsed();
        }
      }
    }, {
      key: "decActiveCount",
      value: function decActiveCount() {
        var source = this.source; // Force updating the source.

        this._activeCount--;

        if (!this._activeCount) {
          this.becomesUnused();
        }
      }
    }, {
      key: "becomesUsed",
      value: function becomesUsed() {
        if (this.source) {
          this.source.incActiveTextureCount();
        }
      }
    }, {
      key: "onLoad",
      value: function onLoad() {
        var _this = this;

        if (this._resizeMode) {
          this._applyResizeMode();
        }

        this.elements.forEach(function (element) {
          _newArrowCheck(this, _this);

          if (element.active) {
            element.onTextureSourceLoaded();
          }
        }.bind(this));
      }
    }, {
      key: "_checkForNewerReusableTextureSource",
      value: function _checkForNewerReusableTextureSource() {
        // When this source became unused and cleaned up, it may have disappeared from the reusable texture map.
        // In the meantime another texture may have been generated loaded with the same lookup id.
        // If this is the case, use that one instead to make sure only one active texture source per lookup id exists.
        var source = this.source;

        if (!source.isLoaded()) {
          var reusable = this._getReusableTextureSource();

          if (reusable && reusable.isLoaded() && reusable !== source) {
            this._replaceTextureSource(reusable);
          }
        } else {
          if (this._resizeMode) {
            this._applyResizeMode();
          }
        }
      }
    }, {
      key: "becomesUnused",
      value: function becomesUnused() {
        if (this.source) {
          this.source.decActiveTextureCount();
        }
      }
    }, {
      key: "isUsed",
      value: function isUsed() {
        return this._activeCount > 0;
      }
      /**
       * Returns the lookup id for the current texture settings, to be able to reuse it.
       * @returns {string|null}
       */

    }, {
      key: "_getLookupId",
      value: function _getLookupId() {
        // Default: do not reuse texture.
        return null;
      }
      /**
       * Generates a loader function that is able to generate the texture for the current settings of this texture.
       * It should return a function that receives a single callback argument.
       * That callback should be called with the following arguments:
       *   - err
       *   - options: object
       *     - source: ArrayBuffer|WebGlTexture|ImageData|HTMLImageElement|HTMLCanvasElement|HTMLVideoElement|ImageBitmap
       *     - w: Number
       *     - h: Number
       *     - permanent: Boolean
       *     - hasAlpha: boolean
       *     - permultiplyAlpha: boolean
       *     - flipBlueRed: boolean
       *     - renderInfo: object
       * The loader itself may return a Function that is called when loading of the texture is cancelled. This can be used
       * to stop fetching an image when it is no longer in element, for example.
       */

    }, {
      key: "_getSourceLoader",
      value: function _getSourceLoader() {
        throw new Error("Texture.generate must be implemented.");
      }
    }, {
      key: "_getIsValid",

      /**
       * If texture is not 'valid', no source can be created for it.
       * @returns {boolean}
       */
      value: function _getIsValid() {
        return true;
      }
      /**
       * This must be called when the texture source must be re-generated.
       */

    }, {
      key: "_changed",
      value: function _changed() {
        // If no element is actively using this texture, ignore it altogether.
        if (this.isUsed()) {
          this._updateSource();
        } else {
          this._mustUpdate = true;
        }
      }
    }, {
      key: "_updateSource",
      value: function _updateSource() {
        // We delay all updateSource calls to the next drawFrame, so that we can bundle them.
        // Otherwise we may reload a texture more often than necessary, when, for example, patching multiple text
        // properties.
        this.stage.addUpdateSourceTexture(this);
      }
    }, {
      key: "_performUpdateSource",
      value: function _performUpdateSource() {
        var force = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

        // If, in the meantime, the texture was no longer used, just remember that it must update until it becomes used
        // again.
        if (force || this.isUsed()) {
          this._mustUpdate = false;

          var source = this._getTextureSource();

          this._replaceTextureSource(source);
        }
      }
    }, {
      key: "_getTextureSource",
      value: function _getTextureSource() {
        var source = null;

        if (this._getIsValid()) {
          var lookupId = this._getLookupId();

          source = this._getReusableTextureSource(lookupId);

          if (!source) {
            source = this.manager.getTextureSource(this._getSourceLoader(), lookupId);
          }
        }

        return source;
      }
    }, {
      key: "_getReusableTextureSource",
      value: function _getReusableTextureSource() {
        var lookupId = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this._getLookupId();

        if (this._getIsValid()) {
          if (lookupId) {
            return this.manager.getReusableTextureSource(lookupId);
          }
        }

        return null;
      }
    }, {
      key: "_replaceTextureSource",
      value: function _replaceTextureSource() {
        var _this2 = this;

        var newSource = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
        var oldSource = this._source;
        this._source = newSource;

        if (this.elements.size) {
          if (oldSource) {
            if (this._activeCount) {
              oldSource.decActiveTextureCount();
            }

            oldSource.removeTexture(this);
          }

          if (newSource) {
            // Must happen before setDisplayedTexture to ensure sprite map texcoords are used.
            newSource.addTexture(this);

            if (this._activeCount) {
              newSource.incActiveTextureCount();
            }
          }
        }

        if (this.isUsed()) {
          if (newSource) {
            if (newSource.isLoaded()) {
              this.elements.forEach(function (element) {
                _newArrowCheck(this, _this2);

                if (element.active) {
                  element._setDisplayedTexture(this);
                }
              }.bind(this));
            } else {
              var loadError = newSource.loadError;

              if (loadError) {
                this.elements.forEach(function (element) {
                  _newArrowCheck(this, _this2);

                  if (element.active) {
                    element.onTextureSourceLoadError(loadError);
                  }
                }.bind(this));
              }
            }
          } else {
            this.elements.forEach(function (element) {
              _newArrowCheck(this, _this2);

              if (element.active) {
                element._setDisplayedTexture(null);
              }
            }.bind(this));
          }
        }
      }
    }, {
      key: "load",
      value: function load() {
        // Make sure that source is up to date.
        if (this.source) {
          if (!this.isLoaded()) {
            this.source.load(true);
          }
        }
      }
    }, {
      key: "isLoaded",
      value: function isLoaded() {
        return this._source && this._source.isLoaded();
      }
    }, {
      key: "free",
      value: function free() {
        if (this._source) {
          this._source.free();
        }
      }
    }, {
      key: "_clearResizeMode",
      value: function _clearResizeMode() {
        this._resizeMode = null;
      }
    }, {
      key: "_applyResizeMode",
      value: function _applyResizeMode() {
        if (this._resizeMode.type === "cover") {
          this._applyResizeCover();
        } else if (this._resizeMode.type === "contain") {
          this._applyResizeContain();
        }

        this._updatePrecision();

        this._updateClipping();
      }
    }, {
      key: "_applyResizeCover",
      value: function _applyResizeCover() {
        var scaleX = this._resizeMode.w / this._source.w;
        var scaleY = this._resizeMode.h / this._source.h;
        var scale = Math.max(scaleX, scaleY);
        if (!scale) return;
        this._precision = 1 / scale;

        if (scaleX && scaleX < scale) {
          var desiredSize = this._precision * this._resizeMode.w;
          var choppedOffPixels = this._source.w - desiredSize;
          this._x = choppedOffPixels * this._resizeMode.clipX;
          this._w = this._source.w - choppedOffPixels;
        }

        if (scaleY && scaleY < scale) {
          var _desiredSize = this._precision * this._resizeMode.h;

          var _choppedOffPixels = this._source.h - _desiredSize;

          this._y = _choppedOffPixels * this._resizeMode.clipY;
          this._h = this._source.h - _choppedOffPixels;
        }
      }
    }, {
      key: "_applyResizeContain",
      value: function _applyResizeContain() {
        var scaleX = this._resizeMode.w / this._source.w;
        var scaleY = this._resizeMode.h / this._source.h;
        var scale = scaleX;

        if (!scale || scaleY < scale) {
          scale = scaleY;
        }

        if (!scale) return;
        this._precision = 1 / scale;
      }
    }, {
      key: "enableClipping",
      value: function enableClipping(x, y, w, h) {
        this._clearResizeMode();

        x *= this._precision;
        y *= this._precision;
        w *= this._precision;
        h *= this._precision;

        if (this._x !== x || this._y !== y || this._w !== w || this._h !== h) {
          this._x = x;
          this._y = y;
          this._w = w;
          this._h = h;

          this._updateClipping(true);
        }
      }
    }, {
      key: "disableClipping",
      value: function disableClipping() {
        this._clearResizeMode();

        if (this._x || this._y || this._w || this._h) {
          this._x = 0;
          this._y = 0;
          this._w = 0;
          this._h = 0;

          this._updateClipping();
        }
      }
    }, {
      key: "_updateClipping",
      value: function _updateClipping() {
        this.clipping = !!(this._x || this._y || this._w || this._h);
        var self = this;
        this.elements.forEach(function (element) {
          // Ignore if not the currently displayed texture.
          if (element.displayedTexture === self) {
            element.onDisplayedTextureClippingChanged();
          }
        });
      }
    }, {
      key: "_updatePrecision",
      value: function _updatePrecision() {
        var self = this;
        this.elements.forEach(function (element) {
          // Ignore if not the currently displayed texture.
          if (element.displayedTexture === self) {
            element.onPrecisionChanged();
          }
        });
      }
    }, {
      key: "getNonDefaults",
      value: function getNonDefaults() {
        var nonDefaults = {};
        nonDefaults['type'] = this.constructor.name;
        if (this.x !== 0) nonDefaults['x'] = this.x;
        if (this.y !== 0) nonDefaults['y'] = this.y;
        if (this.w !== 0) nonDefaults['w'] = this.w;
        if (this.h !== 0) nonDefaults['h'] = this.h;
        if (this.precision !== 1) nonDefaults['precision'] = this.precision;
        return nonDefaults;
      }
    }, {
      key: "isAutosizeTexture",
      value: function isAutosizeTexture() {
        return true;
      }
    }, {
      key: "getRenderWidth",
      value: function getRenderWidth() {
        if (!this.isAutosizeTexture()) {
          // In case of the rectangle texture, we'd prefer to not cause a 1x1 w,h as it would interfere with flex layout fit-to-contents.
          return 0;
        } // If dimensions are unknown (texture not yet loaded), use maximum width as a fallback as render width to allow proper bounds checking.


        return (this._w || (this._source ? this._source.getRenderWidth() - this._x : 0)) / this._precision;
      }
    }, {
      key: "getRenderHeight",
      value: function getRenderHeight() {
        if (!this.isAutosizeTexture()) {
          // In case of the rectangle texture, we'd prefer to not cause a 1x1 w,h as it would interfere with flex layout fit-to-contents.
          return 0;
        }

        return (this._h || (this._source ? this._source.getRenderHeight() - this._y : 0)) / this._precision;
      }
    }, {
      key: "patch",
      value: function patch(settings) {
        Base.patchObject(this, settings);
      }
    }, {
      key: "source",
      get: function get() {
        if (this._mustUpdate || this.stage.hasUpdateSourceTexture(this)) {
          this._performUpdateSource(true);

          this.stage.removeUpdateSourceTexture(this);
        }

        return this._source;
      }
    }, {
      key: "isValid",
      get: function get() {
        return this._getIsValid();
      }
    }, {
      key: "loadError",
      get: function get() {
        return this._source && this._source.loadError;
      }
    }, {
      key: "resizeMode",
      set: function set(_ref) {
        var _ref$type = _ref.type,
            type = _ref$type === void 0 ? "cover" : _ref$type,
            _ref$w = _ref.w,
            w = _ref$w === void 0 ? 0 : _ref$w,
            _ref$h = _ref.h,
            h = _ref$h === void 0 ? 0 : _ref$h,
            _ref$clipX = _ref.clipX,
            clipX = _ref$clipX === void 0 ? 0.5 : _ref$clipX,
            _ref$clipY = _ref.clipY,
            clipY = _ref$clipY === void 0 ? 0.5 : _ref$clipY;
        this._resizeMode = {
          type,
          w,
          h,
          clipX,
          clipY
        };

        if (this.isLoaded()) {
          this._applyResizeMode();
        }
      },
      get: function get() {
        return this._resizeMode;
      }
    }, {
      key: "px",
      get: function get() {
        return this._x;
      }
    }, {
      key: "py",
      get: function get() {
        return this._y;
      }
    }, {
      key: "pw",
      get: function get() {
        return this._w;
      }
    }, {
      key: "ph",
      get: function get() {
        return this._h;
      }
    }, {
      key: "x",
      get: function get() {
        return this._x / this._precision;
      },
      set: function set(v) {
        this._clearResizeMode();

        v = v * this._precision;

        if (this._x !== v) {
          this._x = v;

          this._updateClipping();
        }
      }
    }, {
      key: "y",
      get: function get() {
        return this._y / this._precision;
      },
      set: function set(v) {
        this._clearResizeMode();

        v = v * this._precision;

        if (this._y !== v) {
          this._y = v;

          this._updateClipping();
        }
      }
    }, {
      key: "w",
      get: function get() {
        return this._w / this._precision;
      },
      set: function set(v) {
        this._clearResizeMode();

        v = v * this._precision;

        if (this._w !== v) {
          this._w = v;

          this._updateClipping();
        }
      }
    }, {
      key: "h",
      get: function get() {
        return this._h / this._precision;
      },
      set: function set(v) {
        this._clearResizeMode();

        v = v * this._precision;

        if (this._h !== v) {
          this._h = v;

          this._updateClipping();
        }
      }
    }, {
      key: "precision",
      get: function get() {
        return this._precision;
      },
      set: function set(v) {
        this._clearResizeMode();

        if (this._precision !== v) {
          this._precision = v;

          this._updatePrecision();
        }
      }
    }]);

    return Texture;
  }();
  Texture.prototype.isTexture = true;
  Texture.id = 0;

  var ImageTexture =
  /*#__PURE__*/
  function (_Texture) {
    _inherits(ImageTexture, _Texture);

    function ImageTexture(stage) {
      var _this;

      _classCallCheck(this, ImageTexture);

      _this = _possibleConstructorReturn(this, _getPrototypeOf(ImageTexture).call(this, stage));
      _this._src = undefined;
      _this._hasAlpha = false;
      return _this;
    }

    _createClass(ImageTexture, [{
      key: "_getIsValid",
      value: function _getIsValid() {
        return !!this._src;
      }
    }, {
      key: "_getLookupId",
      value: function _getLookupId() {
        return this._src;
      }
    }, {
      key: "_getSourceLoader",
      value: function _getSourceLoader() {
        var _this2 = this;

        var src = this._src;
        var hasAlpha = this._hasAlpha;

        if (this.stage.getOption('srcBasePath')) {
          var fc = src.charCodeAt(0);

          if (src.indexOf("//") === -1 && (fc >= 65 && fc <= 90 || fc >= 97 && fc <= 122 || fc == 46)) {
            // Alphabetical or dot: prepend base path.
            src = this.stage.getOption('srcBasePath') + src;
          }
        }

        return function (cb) {
          _newArrowCheck(this, _this2);

          return this.stage.platform.loadSrcTexture({
            src: src,
            hasAlpha: hasAlpha
          }, cb);
        }.bind(this);
      }
    }, {
      key: "getNonDefaults",
      value: function getNonDefaults() {
        var obj = _get(_getPrototypeOf(ImageTexture.prototype), "getNonDefaults", this).call(this);

        if (this._src) {
          obj.src = this._src;
        }

        return obj;
      }
    }, {
      key: "src",
      get: function get$$1() {
        return this._src;
      },
      set: function set(v) {
        if (this._src !== v) {
          this._src = v;

          this._changed();
        }
      }
    }, {
      key: "hasAlpha",
      get: function get$$1() {
        return this._hasAlpha;
      },
      set: function set(v) {
        if (this._hasAlpha !== v) {
          this._hasAlpha = v;

          this._changed();
        }
      }
    }]);

    return ImageTexture;
  }(Texture);

  var TextTextureRenderer =
  /*#__PURE__*/
  function () {
    function TextTextureRenderer(stage, canvas, settings) {
      _classCallCheck(this, TextTextureRenderer);

      this._stage = stage;
      this._canvas = canvas;
      this._context = this._canvas.getContext('2d');
      this._settings = settings;
    }

    _createClass(TextTextureRenderer, [{
      key: "getPrecision",
      value: function getPrecision() {
        return this._settings.precision;
      }
    }, {
      key: "setFontProperties",
      value: function setFontProperties() {
        this._context.font = this._getFontSetting();
        this._context.textBaseline = this._settings.textBaseline;
      }
    }, {
      key: "_getFontSetting",
      value: function _getFontSetting() {
        var ff = this._settings.fontFace;

        if (!Array.isArray(ff)) {
          ff = [ff];
        }

        var ffs = [];

        for (var i = 0, n = ff.length; i < n; i++) {
          if (ff[i] === "serif" || ff[i] === "sans-serif") {
            ffs.push(ff[i]);
          } else {
            ffs.push(`"${ff[i]}"`);
          }
        }

        return `${this._settings.fontStyle} ${this._settings.fontSize * this.getPrecision()}px ${ffs.join(",")}`;
      }
    }, {
      key: "_load",
      value: function _load() {
        var _this = this;

        if (Utils.isWeb && document.fonts) {
          var fontSetting = this._getFontSetting();

          try {
            if (!document.fonts.check(fontSetting, this._settings.text)) {
              // Use a promise that waits for loading.
              return document.fonts.load(fontSetting, this._settings.text).catch(function (err) {
                _newArrowCheck(this, _this);

                // Just load the fallback font.
                console.warn('Font load error', err, fontSetting);
              }.bind(this)).then(function () {
                _newArrowCheck(this, _this);

                if (!document.fonts.check(fontSetting, this._settings.text)) {
                  console.warn('Font not found', fontSetting);
                }
              }.bind(this));
            }
          } catch (e) {
            console.warn("Can't check font loading for " + fontSetting);
          }
        }
      }
    }, {
      key: "draw",
      value: function draw() {
        var _this2 = this;

        // We do not use a promise so that loading is performed syncronous when possible.
        var loadPromise = this._load();

        if (!loadPromise) {
          return Utils.isSpark ? this._stage.platform.drawText(this) : this._draw();
        } else {
          return loadPromise.then(function () {
            _newArrowCheck(this, _this2);

            return Utils.isSpark ? this._stage.platform.drawText(this) : this._draw();
          }.bind(this));
        }
      }
    }, {
      key: "_draw",
      value: function _draw() {
        var renderInfo = {};
        var precision = this.getPrecision();
        var paddingLeft = this._settings.paddingLeft * precision;
        var paddingRight = this._settings.paddingRight * precision;
        var fontSize = this._settings.fontSize * precision;
        var offsetY = this._settings.offsetY === null ? null : this._settings.offsetY * precision;
        var lineHeight = this._settings.lineHeight * precision;
        var w = this._settings.w * precision;
        var h = this._settings.h * precision;
        var wordWrapWidth = this._settings.wordWrapWidth * precision;
        var cutSx = this._settings.cutSx * precision;
        var cutEx = this._settings.cutEx * precision;
        var cutSy = this._settings.cutSy * precision;
        var cutEy = this._settings.cutEy * precision; // Set font properties.

        this.setFontProperties(); // Total width.

        var width = w || 2048 / this.getPrecision(); // Inner width.

        var innerWidth = width - paddingLeft;

        if (innerWidth < 10) {
          width += 10 - innerWidth;
          innerWidth += 10 - innerWidth;
        }

        if (!wordWrapWidth) {
          wordWrapWidth = innerWidth;
        } // Text overflow


        if (this._settings.textOverflow && !this._settings.wordWrap) {
          var suffix;

          switch (this._settings.textOverflow) {
            case 'clip':
              suffix = '';
              break;

            case 'ellipsis':
              suffix = this._settings.maxLinesSuffix;
              break;

            default:
              suffix = this._settings.textOverflow;
          }

          this._settings.text = this.wrapWord(this._settings.text, wordWrapWidth, suffix);
        } // word wrap
        // preserve original text


        var linesInfo;

        if (this._settings.wordWrap) {
          linesInfo = this.wrapText(this._settings.text, wordWrapWidth);
        } else {
          linesInfo = {
            l: this._settings.text.split(/(?:\r\n|\r|\n)/),
            n: []
          };
          var n = linesInfo.l.length;

          for (var _i = 0; _i < n - 1; _i++) {
            linesInfo.n.push(_i);
          }
        }

        var lines = linesInfo.l;

        if (this._settings.maxLines && lines.length > this._settings.maxLines) {
          var usedLines = lines.slice(0, this._settings.maxLines);
          var otherLines = null;

          if (this._settings.maxLinesSuffix) {
            // Wrap again with max lines suffix enabled.
            var _w = this._settings.maxLinesSuffix ? this._context.measureText(this._settings.maxLinesSuffix).width : 0;

            var al = this.wrapText(usedLines[usedLines.length - 1], wordWrapWidth - _w);
            usedLines[usedLines.length - 1] = al.l[0] + this._settings.maxLinesSuffix;
            otherLines = [al.l.length > 1 ? al.l[1] : ''];
          } else {
            otherLines = [''];
          } // Re-assemble the remaining text.


          var _i2,
              _n = lines.length;

          var j = 0;
          var m = linesInfo.n.length;

          for (_i2 = this._settings.maxLines; _i2 < _n; _i2++) {
            otherLines[j] += (otherLines[j] ? " " : "") + lines[_i2];

            if (_i2 + 1 < m && linesInfo.n[_i2 + 1]) {
              j++;
            }
          }

          renderInfo.remainingText = otherLines.join("\n");
          renderInfo.moreTextLines = true;
          lines = usedLines;
        } else {
          renderInfo.moreTextLines = false;
          renderInfo.remainingText = "";
        } // calculate text width


        var maxLineWidth = 0;
        var lineWidths = [];

        for (var _i3 = 0; _i3 < lines.length; _i3++) {
          var lineWidth = this._context.measureText(lines[_i3]).width;

          lineWidths.push(lineWidth);
          maxLineWidth = Math.max(maxLineWidth, lineWidth);
        }

        renderInfo.lineWidths = lineWidths;

        if (!w) {
          // Auto-set width to max text length.
          width = maxLineWidth + paddingLeft + paddingRight;
          innerWidth = maxLineWidth;
        } // calculate text height


        lineHeight = lineHeight || fontSize;
        var height;

        if (h) {
          height = h;
        } else {
          height = lineHeight * (lines.length - 1) + 0.5 * fontSize + Math.max(lineHeight, fontSize) + offsetY;
        }

        if (offsetY === null) {
          offsetY = fontSize;
        }

        renderInfo.w = width;
        renderInfo.h = height;
        renderInfo.lines = lines;
        renderInfo.precision = precision;

        if (!width) {
          // To prevent canvas errors.
          width = 1;
        }

        if (!height) {
          // To prevent canvas errors.
          height = 1;
        }

        if (cutSx || cutEx) {
          width = Math.min(width, cutEx - cutSx);
        }

        if (cutSy || cutEy) {
          height = Math.min(height, cutEy - cutSy);
        } // Add extra margin to prevent issue with clipped text when scaling.


        this._canvas.width = Math.ceil(width + this._stage.getOption('textRenderIssueMargin'));
        this._canvas.height = Math.ceil(height); // Canvas context has been reset.

        this.setFontProperties();

        if (fontSize >= 128) {
          // WpeWebKit bug: must force compositing because cairo-traps-compositor will not work with text first.
          this._context.globalAlpha = 0.01;

          this._context.fillRect(0, 0, 0.01, 0.01);

          this._context.globalAlpha = 1.0;
        }

        if (cutSx || cutSy) {
          this._context.translate(-cutSx, -cutSy);
        }

        var linePositionX;
        var linePositionY;
        var drawLines = []; // Draw lines line by line.

        for (var _i4 = 0, _n2 = lines.length; _i4 < _n2; _i4++) {
          linePositionX = 0;
          linePositionY = _i4 * lineHeight + offsetY;

          if (this._settings.textAlign === 'right') {
            linePositionX += innerWidth - lineWidths[_i4];
          } else if (this._settings.textAlign === 'center') {
            linePositionX += (innerWidth - lineWidths[_i4]) / 2;
          }

          linePositionX += paddingLeft;
          drawLines.push({
            text: lines[_i4],
            x: linePositionX,
            y: linePositionY,
            w: lineWidths[_i4]
          });
        } // Highlight.


        if (this._settings.highlight) {
          var color = this._settings.highlightColor || 0x00000000;
          var hlHeight = this._settings.highlightHeight * precision || fontSize * 1.5;
          var offset = this._settings.highlightOffset * precision;
          var hlPaddingLeft = this._settings.highlightPaddingLeft !== null ? this._settings.highlightPaddingLeft * precision : paddingLeft;
          var hlPaddingRight = this._settings.highlightPaddingRight !== null ? this._settings.highlightPaddingRight * precision : paddingRight;
          this._context.fillStyle = StageUtils.getRgbaString(color);

          for (var _i5 = 0; _i5 < drawLines.length; _i5++) {
            var drawLine = drawLines[_i5];

            this._context.fillRect(drawLine.x - hlPaddingLeft, drawLine.y - offsetY + offset, drawLine.w + hlPaddingRight + hlPaddingLeft, hlHeight);
          }
        } // Text shadow.


        var prevShadowSettings = null;

        if (this._settings.shadow) {
          prevShadowSettings = [this._context.shadowColor, this._context.shadowOffsetX, this._context.shadowOffsetY, this._context.shadowBlur];
          this._context.shadowColor = StageUtils.getRgbaString(this._settings.shadowColor);
          this._context.shadowOffsetX = this._settings.shadowOffsetX * precision;
          this._context.shadowOffsetY = this._settings.shadowOffsetY * precision;
          this._context.shadowBlur = this._settings.shadowBlur * precision;
        }

        this._context.fillStyle = StageUtils.getRgbaString(this._settings.textColor);

        for (var _i6 = 0, _n3 = drawLines.length; _i6 < _n3; _i6++) {
          var _drawLine = drawLines[_i6];

          this._context.fillText(_drawLine.text, _drawLine.x, _drawLine.y);
        }

        if (prevShadowSettings) {
          this._context.shadowColor = prevShadowSettings[0];
          this._context.shadowOffsetX = prevShadowSettings[1];
          this._context.shadowOffsetY = prevShadowSettings[2];
          this._context.shadowBlur = prevShadowSettings[3];
        }

        if (cutSx || cutSy) {
          this._context.translate(cutSx, cutSy);
        }

        this.renderInfo = renderInfo;
      }
    }, {
      key: "wrapWord",
      value: function wrapWord(word, wordWrapWidth, suffix) {
        var suffixWidth = this._context.measureText(suffix).width;

        var wordLen = word.length;

        var wordWidth = this._context.measureText(word).width;
        /* If word fits wrapWidth, do nothing */


        if (wordWidth <= wordWrapWidth) {
          return word;
        }
        /* Make initial guess for text cuttoff */


        var cutoffIndex = Math.floor(wordWrapWidth * wordLen / wordWidth);
        var truncWordWidth = this._context.measureText(word.substring(0, cutoffIndex)).width + suffixWidth;
        /* In case guess was overestimated, shrink it letter by letter. */

        if (truncWordWidth > wordWrapWidth) {
          while (cutoffIndex > 0) {
            truncWordWidth = this._context.measureText(word.substring(0, cutoffIndex)).width + suffixWidth;

            if (truncWordWidth > wordWrapWidth) {
              cutoffIndex -= 1;
            } else {
              break;
            }
          }
          /* In case guess was underestimated, extend it letter by letter. */

        } else {
          while (cutoffIndex < wordLen) {
            truncWordWidth = this._context.measureText(word.substring(0, cutoffIndex)).width + suffixWidth;

            if (truncWordWidth < wordWrapWidth) {
              cutoffIndex += 1;
            } else {
              // Finally, when bound is crossed, retract last letter.
              cutoffIndex -= 1;
              break;
            }
          }
        }
        /* If wrapWidth is too short to even contain suffix alone, return empty string */


        return word.substring(0, cutoffIndex) + (wordWrapWidth >= suffixWidth ? suffix : '');
      }
      /**
       * Applies newlines to a string to have it optimally fit into the horizontal
       * bounds set by the Text object's wordWrapWidth property.
       */

    }, {
      key: "wrapText",
      value: function wrapText(text, wordWrapWidth) {
        // Greedy wrapping algorithm that will wrap words as the line grows longer.
        // than its horizontal bounds.
        var lines = text.split(/\r?\n/g);
        var allLines = [];
        var realNewlines = [];

        for (var i = 0; i < lines.length; i++) {
          var resultLines = [];
          var result = '';
          var spaceLeft = wordWrapWidth;
          var words = lines[i].split(' ');

          for (var j = 0; j < words.length; j++) {
            var wordWidth = this._context.measureText(words[j]).width;

            var wordWidthWithSpace = wordWidth + this._context.measureText(' ').width;

            if (j === 0 || wordWidthWithSpace > spaceLeft) {
              // Skip printing the newline if it's the first word of the line that is.
              // greater than the word wrap width.
              if (j > 0) {
                resultLines.push(result);
                result = '';
              }

              result += words[j];
              spaceLeft = wordWrapWidth - wordWidth;
            } else {
              spaceLeft -= wordWidthWithSpace;
              result += ' ' + words[j];
            }
          }

          if (result) {
            resultLines.push(result);
            result = '';
          }

          allLines = allLines.concat(resultLines);

          if (i < lines.length - 1) {
            realNewlines.push(allLines.length);
          }
        }

        return {
          l: allLines,
          n: realNewlines
        };
      }
    }]);

    return TextTextureRenderer;
  }();

  var TextTexture =
  /*#__PURE__*/
  function (_Texture) {
    _inherits(TextTexture, _Texture);

    function TextTexture(stage) {
      var _this;

      _classCallCheck(this, TextTexture);

      _this = _possibleConstructorReturn(this, _getPrototypeOf(TextTexture).call(this, stage)); // We use the stage precision as the default precision in case of a text texture.

      _this._precision = _this.stage.getOption('precision');
      return _this;
    }

    _createClass(TextTexture, [{
      key: "_getIsValid",
      value: function _getIsValid() {
        return !!this.text;
      }
    }, {
      key: "_getLookupId",
      value: function _getLookupId() {
        var parts = [];
        if (this.w !== 0) parts.push("w " + this.w);
        if (this.h !== 0) parts.push("h " + this.h);
        if (this.fontStyle !== "normal") parts.push("fS" + this.fontStyle);
        if (this.fontSize !== 40) parts.push("fs" + this.fontSize);
        if (this.fontFace !== null) parts.push("ff" + (Array.isArray(this.fontFace) ? this.fontFace.join(",") : this.fontFace));
        if (this.wordWrap !== true) parts.push("wr" + (this.wordWrap ? 1 : 0));
        if (this.wordWrapWidth !== 0) parts.push("ww" + this.wordWrapWidth);
        if (this.textOverflow != "") parts.push("to" + this.textOverflow);
        if (this.lineHeight !== null) parts.push("lh" + this.lineHeight);
        if (this.textBaseline !== "alphabetic") parts.push("tb" + this.textBaseline);
        if (this.textAlign !== "left") parts.push("ta" + this.textAlign);
        if (this.offsetY !== null) parts.push("oy" + this.offsetY);
        if (this.maxLines !== 0) parts.push("ml" + this.maxLines);
        if (this.maxLinesSuffix !== "..") parts.push("ms" + this.maxLinesSuffix);
        parts.push("pc" + this.precision);
        if (this.textColor !== 0xffffffff) parts.push("co" + this.textColor.toString(16));
        if (this.paddingLeft !== 0) parts.push("pl" + this.paddingLeft);
        if (this.paddingRight !== 0) parts.push("pr" + this.paddingRight);
        if (this.shadow !== false) parts.push("sh" + (this.shadow ? 1 : 0));
        if (this.shadowColor !== 0xff000000) parts.push("sc" + this.shadowColor.toString(16));
        if (this.shadowOffsetX !== 0) parts.push("sx" + this.shadowOffsetX);
        if (this.shadowOffsetY !== 0) parts.push("sy" + this.shadowOffsetY);
        if (this.shadowBlur !== 5) parts.push("sb" + this.shadowBlur);
        if (this.highlight !== false) parts.push("hL" + (this.highlight ? 1 : 0));
        if (this.highlightHeight !== 0) parts.push("hh" + this.highlightHeight);
        if (this.highlightColor !== 0xff000000) parts.push("hc" + this.highlightColor.toString(16));
        if (this.highlightOffset !== null) parts.push("ho" + this.highlightOffset);
        if (this.highlightPaddingLeft !== null) parts.push("hl" + this.highlightPaddingLeft);
        if (this.highlightPaddingRight !== null) parts.push("hr" + this.highlightPaddingRight);
        if (this.cutSx) parts.push("csx" + this.cutSx);
        if (this.cutEx) parts.push("cex" + this.cutEx);
        if (this.cutSy) parts.push("csy" + this.cutSy);
        if (this.cutEy) parts.push("cey" + this.cutEy);
        var id = "TX$" + parts.join("|") + ":" + this.text;
        return id;
      }
    }, {
      key: "_getSourceLoader",
      value: function _getSourceLoader() {
        var args = this.cloneArgs(); // Inherit font face from stage.

        if (args.fontFace === null) {
          args.fontFace = this.stage.getOption('defaultFontFace');
        }

        return function (cb) {
          var _this2 = this;

          var canvas = this.stage.platform.getDrawingCanvas();
          var renderer = new TextTextureRenderer(this.stage, canvas, args);
          var p = renderer.draw();

          if (p) {
            p.then(function () {
              _newArrowCheck(this, _this2);

              /* FIXME: on some platforms (e.g. RPI), throttling text textures cause artifacts */
              cb(null, Object.assign({
                renderInfo: renderer.renderInfo,
                throttle: false
              }, this.stage.platform.getTextureOptionsForDrawingCanvas(canvas)));
            }.bind(this)).catch(function (err) {
              _newArrowCheck(this, _this2);

              cb(err);
            }.bind(this));
          } else {
            cb(null, Object.assign({
              renderInfo: renderer.renderInfo,
              throttle: false
            }, this.stage.platform.getTextureOptionsForDrawingCanvas(canvas)));
          }
        };
      }
    }, {
      key: "getNonDefaults",
      value: function getNonDefaults() {
        var nonDefaults = _get(_getPrototypeOf(TextTexture.prototype), "getNonDefaults", this).call(this);

        if (this.text !== "") nonDefaults['text'] = this.text;
        if (this.w !== 0) nonDefaults['w'] = this.w;
        if (this.h !== 0) nonDefaults['h'] = this.h;
        if (this.fontStyle !== "normal") nonDefaults['fontStyle'] = this.fontStyle;
        if (this.fontSize !== 40) nonDefaults["fontSize"] = this.fontSize;
        if (this.fontFace !== null) nonDefaults["fontFace"] = this.fontFace;
        if (this.wordWrap !== true) nonDefaults["wordWrap"] = this.wordWrap;
        if (this.wordWrapWidth !== 0) nonDefaults["wordWrapWidth"] = this.wordWrapWidth;
        if (this.textOverflow != "") nonDefaults["textOverflow"] = this.textOverflow;
        if (this.lineHeight !== null) nonDefaults["lineHeight"] = this.lineHeight;
        if (this.textBaseline !== "alphabetic") nonDefaults["textBaseline"] = this.textBaseline;
        if (this.textAlign !== "left") nonDefaults["textAlign"] = this.textAlign;
        if (this.offsetY !== null) nonDefaults["offsetY"] = this.offsetY;
        if (this.maxLines !== 0) nonDefaults["maxLines"] = this.maxLines;
        if (this.maxLinesSuffix !== "..") nonDefaults["maxLinesSuffix"] = this.maxLinesSuffix;
        if (this.precision !== this.stage.getOption('precision')) nonDefaults["precision"] = this.precision;
        if (this.textColor !== 0xffffffff) nonDefaults["textColor"] = this.textColor;
        if (this.paddingLeft !== 0) nonDefaults["paddingLeft"] = this.paddingLeft;
        if (this.paddingRight !== 0) nonDefaults["paddingRight"] = this.paddingRight;
        if (this.shadow !== false) nonDefaults["shadow"] = this.shadow;
        if (this.shadowColor !== 0xff000000) nonDefaults["shadowColor"] = this.shadowColor;
        if (this.shadowOffsetX !== 0) nonDefaults["shadowOffsetX"] = this.shadowOffsetX;
        if (this.shadowOffsetY !== 0) nonDefaults["shadowOffsetY"] = this.shadowOffsetY;
        if (this.shadowBlur !== 5) nonDefaults["shadowBlur"] = this.shadowBlur;
        if (this.highlight !== false) nonDefaults["highlight"] = this.highlight;
        if (this.highlightHeight !== 0) nonDefaults["highlightHeight"] = this.highlightHeight;
        if (this.highlightColor !== 0xff000000) nonDefaults["highlightColor"] = this.highlightColor;
        if (this.highlightOffset !== 0) nonDefaults["highlightOffset"] = this.highlightOffset;
        if (this.highlightPaddingLeft !== 0) nonDefaults["highlightPaddingLeft"] = this.highlightPaddingLeft;
        if (this.highlightPaddingRight !== 0) nonDefaults["highlightPaddingRight"] = this.highlightPaddingRight;
        if (this.cutSx) nonDefaults["cutSx"] = this.cutSx;
        if (this.cutEx) nonDefaults["cutEx"] = this.cutEx;
        if (this.cutSy) nonDefaults["cutSy"] = this.cutSy;
        if (this.cutEy) nonDefaults["cutEy"] = this.cutEy;
        return nonDefaults;
      }
    }, {
      key: "cloneArgs",
      value: function cloneArgs() {
        var obj = {};
        obj.text = this._text;
        obj.w = this._w;
        obj.h = this._h;
        obj.fontStyle = this._fontStyle;
        obj.fontSize = this._fontSize;
        obj.fontFace = this._fontFace;
        obj.wordWrap = this._wordWrap;
        obj.wordWrapWidth = this._wordWrapWidth;
        obj.textOverflow = this._textOverflow;
        obj.lineHeight = this._lineHeight;
        obj.textBaseline = this._textBaseline;
        obj.textAlign = this._textAlign;
        obj.offsetY = this._offsetY;
        obj.maxLines = this._maxLines;
        obj.maxLinesSuffix = this._maxLinesSuffix;
        obj.precision = this._precision;
        obj.textColor = this._textColor;
        obj.paddingLeft = this._paddingLeft;
        obj.paddingRight = this._paddingRight;
        obj.shadow = this._shadow;
        obj.shadowColor = this._shadowColor;
        obj.shadowOffsetX = this._shadowOffsetX;
        obj.shadowOffsetY = this._shadowOffsetY;
        obj.shadowBlur = this._shadowBlur;
        obj.highlight = this._highlight;
        obj.highlightHeight = this._highlightHeight;
        obj.highlightColor = this._highlightColor;
        obj.highlightOffset = this._highlightOffset;
        obj.highlightPaddingLeft = this._highlightPaddingLeft;
        obj.highlightPaddingRight = this._highlightPaddingRight;
        obj.cutSx = this._cutSx;
        obj.cutEx = this._cutEx;
        obj.cutSy = this._cutSy;
        obj.cutEy = this._cutEy;
        return obj;
      }
    }, {
      key: "text",
      get: function get$$1() {
        return this._text;
      },
      set: function set$$1(v) {
        if (this._text !== v) {
          this._text = "" + v;

          this._changed();
        }
      }
    }, {
      key: "w",
      get: function get$$1() {
        return this._w;
      },
      set: function set$$1(v) {
        if (this._w !== v) {
          this._w = v;

          this._changed();
        }
      }
    }, {
      key: "h",
      get: function get$$1() {
        return this._h;
      },
      set: function set$$1(v) {
        if (this._h !== v) {
          this._h = v;

          this._changed();
        }
      }
    }, {
      key: "fontStyle",
      get: function get$$1() {
        return this._fontStyle;
      },
      set: function set$$1(v) {
        if (this._fontStyle !== v) {
          this._fontStyle = v;

          this._changed();
        }
      }
    }, {
      key: "fontSize",
      get: function get$$1() {
        return this._fontSize;
      },
      set: function set$$1(v) {
        if (this._fontSize !== v) {
          this._fontSize = v;

          this._changed();
        }
      }
    }, {
      key: "fontFace",
      get: function get$$1() {
        return this._fontFace;
      },
      set: function set$$1(v) {
        if (this._fontFace !== v) {
          this._fontFace = v;

          this._changed();
        }
      }
    }, {
      key: "wordWrap",
      get: function get$$1() {
        return this._wordWrap;
      },
      set: function set$$1(v) {
        if (this._wordWrap !== v) {
          this._wordWrap = v;

          this._changed();
        }
      }
    }, {
      key: "wordWrapWidth",
      get: function get$$1() {
        return this._wordWrapWidth;
      },
      set: function set$$1(v) {
        if (this._wordWrapWidth !== v) {
          this._wordWrapWidth = v;

          this._changed();
        }
      }
    }, {
      key: "textOverflow",
      get: function get$$1() {
        return this._textOverflow;
      },
      set: function set$$1(v) {
        if (v != this._textOverflow) {
          this._textOverflow = v;

          this._changed();
        }
      }
    }, {
      key: "lineHeight",
      get: function get$$1() {
        return this._lineHeight;
      },
      set: function set$$1(v) {
        if (this._lineHeight !== v) {
          this._lineHeight = v;

          this._changed();
        }
      }
    }, {
      key: "textBaseline",
      get: function get$$1() {
        return this._textBaseline;
      },
      set: function set$$1(v) {
        if (this._textBaseline !== v) {
          this._textBaseline = v;

          this._changed();
        }
      }
    }, {
      key: "textAlign",
      get: function get$$1() {
        return this._textAlign;
      },
      set: function set$$1(v) {
        if (this._textAlign !== v) {
          this._textAlign = v;

          this._changed();
        }
      }
    }, {
      key: "offsetY",
      get: function get$$1() {
        return this._offsetY;
      },
      set: function set$$1(v) {
        if (this._offsetY !== v) {
          this._offsetY = v;

          this._changed();
        }
      }
    }, {
      key: "maxLines",
      get: function get$$1() {
        return this._maxLines;
      },
      set: function set$$1(v) {
        if (this._maxLines !== v) {
          this._maxLines = v;

          this._changed();
        }
      }
    }, {
      key: "maxLinesSuffix",
      get: function get$$1() {
        return this._maxLinesSuffix;
      },
      set: function set$$1(v) {
        if (this._maxLinesSuffix !== v) {
          this._maxLinesSuffix = v;

          this._changed();
        }
      }
    }, {
      key: "textColor",
      get: function get$$1() {
        return this._textColor;
      },
      set: function set$$1(v) {
        if (this._textColor !== v) {
          this._textColor = v;

          this._changed();
        }
      }
    }, {
      key: "paddingLeft",
      get: function get$$1() {
        return this._paddingLeft;
      },
      set: function set$$1(v) {
        if (this._paddingLeft !== v) {
          this._paddingLeft = v;

          this._changed();
        }
      }
    }, {
      key: "paddingRight",
      get: function get$$1() {
        return this._paddingRight;
      },
      set: function set$$1(v) {
        if (this._paddingRight !== v) {
          this._paddingRight = v;

          this._changed();
        }
      }
    }, {
      key: "shadow",
      get: function get$$1() {
        return this._shadow;
      },
      set: function set$$1(v) {
        if (this._shadow !== v) {
          this._shadow = v;

          this._changed();
        }
      }
    }, {
      key: "shadowColor",
      get: function get$$1() {
        return this._shadowColor;
      },
      set: function set$$1(v) {
        if (this._shadowColor !== v) {
          this._shadowColor = v;

          this._changed();
        }
      }
    }, {
      key: "shadowOffsetX",
      get: function get$$1() {
        return this._shadowOffsetX;
      },
      set: function set$$1(v) {
        if (this._shadowOffsetX !== v) {
          this._shadowOffsetX = v;

          this._changed();
        }
      }
    }, {
      key: "shadowOffsetY",
      get: function get$$1() {
        return this._shadowOffsetY;
      },
      set: function set$$1(v) {
        if (this._shadowOffsetY !== v) {
          this._shadowOffsetY = v;

          this._changed();
        }
      }
    }, {
      key: "shadowBlur",
      get: function get$$1() {
        return this._shadowBlur;
      },
      set: function set$$1(v) {
        if (this._shadowBlur !== v) {
          this._shadowBlur = v;

          this._changed();
        }
      }
    }, {
      key: "highlight",
      get: function get$$1() {
        return this._highlight;
      },
      set: function set$$1(v) {
        if (this._highlight !== v) {
          this._highlight = v;

          this._changed();
        }
      }
    }, {
      key: "highlightHeight",
      get: function get$$1() {
        return this._highlightHeight;
      },
      set: function set$$1(v) {
        if (this._highlightHeight !== v) {
          this._highlightHeight = v;

          this._changed();
        }
      }
    }, {
      key: "highlightColor",
      get: function get$$1() {
        return this._highlightColor;
      },
      set: function set$$1(v) {
        if (this._highlightColor !== v) {
          this._highlightColor = v;

          this._changed();
        }
      }
    }, {
      key: "highlightOffset",
      get: function get$$1() {
        return this._highlightOffset;
      },
      set: function set$$1(v) {
        if (this._highlightOffset !== v) {
          this._highlightOffset = v;

          this._changed();
        }
      }
    }, {
      key: "highlightPaddingLeft",
      get: function get$$1() {
        return this._highlightPaddingLeft;
      },
      set: function set$$1(v) {
        if (this._highlightPaddingLeft !== v) {
          this._highlightPaddingLeft = v;

          this._changed();
        }
      }
    }, {
      key: "highlightPaddingRight",
      get: function get$$1() {
        return this._highlightPaddingRight;
      },
      set: function set$$1(v) {
        if (this._highlightPaddingRight !== v) {
          this._highlightPaddingRight = v;

          this._changed();
        }
      }
    }, {
      key: "cutSx",
      get: function get$$1() {
        return this._cutSx;
      },
      set: function set$$1(v) {
        if (this._cutSx !== v) {
          this._cutSx = v;

          this._changed();
        }
      }
    }, {
      key: "cutEx",
      get: function get$$1() {
        return this._cutEx;
      },
      set: function set$$1(v) {
        if (this._cutEx !== v) {
          this._cutEx = v;

          this._changed();
        }
      }
    }, {
      key: "cutSy",
      get: function get$$1() {
        return this._cutSy;
      },
      set: function set$$1(v) {
        if (this._cutSy !== v) {
          this._cutSy = v;

          this._changed();
        }
      }
    }, {
      key: "cutEy",
      get: function get$$1() {
        return this._cutEy;
      },
      set: function set$$1(v) {
        if (this._cutEy !== v) {
          this._cutEy = v;

          this._changed();
        }
      }
    }, {
      key: "precision",
      get: function get$$1() {
        return _get(_getPrototypeOf(TextTexture.prototype), "precision", this);
      },
      set: function set$$1(v) {
        // We actually draw differently when the precision changes.
        if (this.precision !== v) {
          _set(_getPrototypeOf(TextTexture.prototype), "precision", v, this, true);

          this._changed();
        }
      }
    }]);

    return TextTexture;
  }(Texture); // Because there are so many properties, we prefer to use the prototype for default values.
  var proto = TextTexture.prototype;
  proto._text = "";
  proto._w = 0;
  proto._h = 0;
  proto._fontStyle = "normal";
  proto._fontSize = 40;
  proto._fontFace = null;
  proto._wordWrap = true;
  proto._wordWrapWidth = 0;
  proto._textOverflow = "";
  proto._lineHeight = null;
  proto._textBaseline = "alphabetic";
  proto._textAlign = "left";
  proto._offsetY = null;
  proto._maxLines = 0;
  proto._maxLinesSuffix = "..";
  proto._textColor = 0xFFFFFFFF;
  proto._paddingLeft = 0;
  proto._paddingRight = 0;
  proto._shadow = false;
  proto._shadowColor = 0xFF000000;
  proto._shadowOffsetX = 0;
  proto._shadowOffsetY = 0;
  proto._shadowBlur = 5;
  proto._highlight = false;
  proto._highlightHeight = 0;
  proto._highlightColor = 0xFF000000;
  proto._highlightOffset = 0;
  proto._highlightPaddingLeft = 0;
  proto._highlightPaddingRight = 0;
  proto._cutSx = 0;
  proto._cutEx = 0;
  proto._cutSy = 0;
  proto._cutEy = 0;

  var SourceTexture =
  /*#__PURE__*/
  function (_Texture) {
    _inherits(SourceTexture, _Texture);

    function SourceTexture(stage) {
      var _this;

      _classCallCheck(this, SourceTexture);

      _this = _possibleConstructorReturn(this, _getPrototypeOf(SourceTexture).call(this, stage));
      _this._textureSource = undefined;
      return _this;
    }

    _createClass(SourceTexture, [{
      key: "_getTextureSource",
      value: function _getTextureSource() {
        return this._textureSource;
      }
    }, {
      key: "textureSource",
      get: function get() {
        return this._textureSource;
      },
      set: function set(v) {
        if (v !== this._textureSource) {
          if (v.isResultTexture) {
            // In case of a result texture, automatically inherit the precision.
            this._precision = this.stage.getRenderPrecision();
          }

          this._textureSource = v;

          this._changed();
        }
      }
    }]);

    return SourceTexture;
  }(Texture);

  var Transition =
  /*#__PURE__*/
  function (_EventEmitter) {
    _inherits(Transition, _EventEmitter);

    function Transition(manager, settings, element, property) {
      var _this;

      _classCallCheck(this, Transition);

      _this = _possibleConstructorReturn(this, _getPrototypeOf(Transition).call(this));
      _this.manager = manager;
      _this._settings = settings;
      _this._element = element;
      _this._getter = element.constructor.getGetter(property);
      _this._setter = element.constructor.getSetter(property);
      _this._merger = settings.merger;

      if (!_this._merger) {
        _this._merger = element.constructor.getMerger(property);
      }

      _this._startValue = _this._getter(_this._element);
      _this._targetValue = _this._startValue;
      _this._p = 1;
      _this._delayLeft = 0;
      return _this;
    }

    _createClass(Transition, [{
      key: "start",
      value: function start(targetValue) {
        this._startValue = this._getter(this._element);

        if (!this.isAttached()) {
          // We don't support transitions on non-attached elements. Just set value without invoking listeners.
          this._targetValue = targetValue;
          this._p = 1;

          this._updateDrawValue();
        } else {
          if (targetValue === this._startValue) {
            this.reset(targetValue, 1);
          } else {
            this._targetValue = targetValue;
            this._p = 0;
            this._delayLeft = this._settings.delay;
            this.emit('start');
            this.add();
          }
        }
      }
    }, {
      key: "finish",
      value: function finish() {
        if (this._p < 1) {
          // Value setting and will must be invoked (async) upon next transition cycle.
          this._p = 1;
        }
      }
    }, {
      key: "stop",
      value: function stop() {
        // Just stop where the transition is at.
        this.emit('stop');
        this.manager.removeActive(this);
      }
    }, {
      key: "pause",
      value: function pause() {
        this.stop();
      }
    }, {
      key: "play",
      value: function play() {
        this.manager.addActive(this);
      }
    }, {
      key: "reset",
      value: function reset(targetValue, p) {
        if (!this.isAttached()) {
          // We don't support transitions on non-attached elements. Just set value without invoking listeners.
          this._startValue = this._getter(this._element);
          this._targetValue = targetValue;
          this._p = 1;

          this._updateDrawValue();
        } else {
          this._startValue = this._getter(this._element);
          this._targetValue = targetValue;
          this._p = p;
          this.add();
        }
      }
    }, {
      key: "_updateDrawValue",
      value: function _updateDrawValue() {
        this._setter(this._element, this.getDrawValue());
      }
    }, {
      key: "add",
      value: function add() {
        this.manager.addActive(this);
      }
    }, {
      key: "isAttached",
      value: function isAttached() {
        return this._element.attached;
      }
    }, {
      key: "isRunning",
      value: function isRunning() {
        return this._p < 1.0;
      }
    }, {
      key: "progress",
      value: function progress(dt) {
        if (!this.isAttached()) {
          // Skip to end of transition so that it is removed.
          this._p = 1;
        }

        if (this.p < 1) {
          if (this.delayLeft > 0) {
            this._delayLeft -= dt;

            if (this.delayLeft < 0) {
              dt = -this.delayLeft;
              this._delayLeft = 0;
              this.emit('delayEnd');
            } else {
              return;
            }
          }

          if (this._settings.duration == 0) {
            this._p = 1;
          } else {
            this._p += dt / this._settings.duration;
          }

          if (this._p >= 1) {
            // Finished!;
            this._p = 1;
          }
        }

        this._updateDrawValue();

        this.invokeListeners();
      }
    }, {
      key: "invokeListeners",
      value: function invokeListeners() {
        this.emit('progress', this.p);

        if (this.p === 1) {
          this.emit('finish');
        }
      }
    }, {
      key: "updateTargetValue",
      value: function updateTargetValue(targetValue) {
        var t = this._settings.timingFunctionImpl(this.p);

        if (t === 1) {
          this._targetValue = targetValue;
        } else if (t === 0) {
          this._startValue = this._targetValue;
          this._targetValue = targetValue;
        } else {
          this._startValue = targetValue - (targetValue - this._targetValue) / (1 - t);
          this._targetValue = targetValue;
        }
      }
    }, {
      key: "getDrawValue",
      value: function getDrawValue() {
        if (this.p >= 1) {
          return this.targetValue;
        } else {
          var v = this._settings._timingFunctionImpl(this.p);

          return this._merger(this.targetValue, this.startValue, v);
        }
      }
    }, {
      key: "skipDelay",
      value: function skipDelay() {
        this._delayLeft = 0;
      }
    }, {
      key: "startValue",
      get: function get() {
        return this._startValue;
      }
    }, {
      key: "targetValue",
      get: function get() {
        return this._targetValue;
      }
    }, {
      key: "p",
      get: function get() {
        return this._p;
      }
    }, {
      key: "delayLeft",
      get: function get() {
        return this._delayLeft;
      }
    }, {
      key: "element",
      get: function get() {
        return this._element;
      }
    }, {
      key: "settings",
      get: function get() {
        return this._settings;
      },
      set: function set(v) {
        this._settings = v;
      }
    }]);

    return Transition;
  }(EventEmitter);
  Transition.prototype.isTransition = true;

  /**
   * Manages a list of objects.
   * Objects may be patched. Then, they can be referenced using the 'ref' (string) property.
   */
  var ObjectList =
  /*#__PURE__*/
  function () {
    function ObjectList() {
      _classCallCheck(this, ObjectList);

      this._items = [];
      this._refs = {};
    }

    _createClass(ObjectList, [{
      key: "get",
      value: function get() {
        return this._items;
      }
    }, {
      key: "add",
      value: function add(item) {
        this.addAt(item, this._items.length);
      }
    }, {
      key: "addAt",
      value: function addAt(item, index) {
        if (index >= 0 && index <= this._items.length) {
          var currentIndex = this._items.indexOf(item);

          if (currentIndex === index) {
            return item;
          }

          if (currentIndex != -1) {
            this.setAt(item, index);
          } else {
            if (item.ref) {
              this._refs[item.ref] = item;
            }

            this._items.splice(index, 0, item);

            this.onAdd(item, index);
          }
        } else {
          throw new Error('addAt: The index ' + index + ' is out of bounds ' + this._items.length);
        }
      }
    }, {
      key: "replaceByRef",
      value: function replaceByRef(item) {
        if (item.ref) {
          var existingItem = this.getByRef(item.ref);

          if (!existingItem) {
            throw new Error('replaceByRef: no item found with reference: ' + item.ref);
          }

          this.replace(item, existingItem);
        } else {
          throw new Error('replaceByRef: no ref specified in item');
        }

        this.addAt(item, this._items.length);
      }
    }, {
      key: "replace",
      value: function replace(item, prevItem) {
        var index = this.getIndex(prevItem);

        if (index === -1) {
          throw new Error('replace: The previous item does not exist');
        }

        this.setAt(item, index);
      }
    }, {
      key: "setAt",
      value: function setAt(item, index) {
        if (index >= 0 && index <= this._items.length) {
          var currentIndex = this._items.indexOf(item);

          if (currentIndex != -1) {
            if (currentIndex !== index) {
              var fromIndex = currentIndex;

              if (fromIndex !== index) {
                this._items.splice(fromIndex, 1);

                this._items.splice(index, 0, item);

                this.onMove(item, fromIndex, index);
              }
            }
          } else {
            if (index < this._items.length) {
              if (this._items[index].ref) {
                this._refs[this._items[index].ref] = undefined;
              }
            }

            var prevItem = this._items[index]; // Doesn't exist yet: overwrite current.

            this._items[index] = item;

            if (item.ref) {
              this._refs[item.ref] = item;
            }

            this.onSet(item, index, prevItem);
          }
        } else {
          throw new Error('setAt: The index ' + index + ' is out of bounds ' + this._items.length);
        }
      }
    }, {
      key: "getAt",
      value: function getAt(index) {
        return this._items[index];
      }
    }, {
      key: "getIndex",
      value: function getIndex(item) {
        return this._items.indexOf(item);
      }
    }, {
      key: "remove",
      value: function remove(item) {
        var index = this._items.indexOf(item);

        if (index !== -1) {
          this.removeAt(index);
        }
      }
    }, {
      key: "removeAt",
      value: function removeAt(index) {
        var item = this._items[index];

        if (item.ref) {
          this._refs[item.ref] = undefined;
        }

        this._items.splice(index, 1);

        this.onRemove(item, index);
        return item;
      }
    }, {
      key: "clear",
      value: function clear() {
        var n = this._items.length;

        if (n) {
          var prev = this._items;
          this._items = [];
          this._refs = {};
          this.onSync(prev, [], []);
        }
      }
    }, {
      key: "a",
      value: function a(o) {
        if (Utils.isObjectLiteral(o)) {
          var c = this.createItem(o);
          c.patch(o);
          this.add(c);
          return c;
        } else if (Array.isArray(o)) {
          for (var i = 0, n = o.length; i < n; i++) {
            this.a(o[i]);
          }

          return null;
        } else if (this.isItem(o)) {
          this.add(o);
          return o;
        }
      }
    }, {
      key: "_getRefs",
      value: function _getRefs() {
        return this._refs;
      }
    }, {
      key: "getByRef",
      value: function getByRef(ref) {
        return this._refs[ref];
      }
    }, {
      key: "clearRef",
      value: function clearRef(ref) {
        delete this._refs[ref];
      }
    }, {
      key: "setRef",
      value: function setRef(ref, child) {
        this._refs[ref] = child;
      }
    }, {
      key: "patch",
      value: function patch(settings) {
        if (Utils.isObjectLiteral(settings)) {
          this._setByObject(settings);
        } else if (Array.isArray(settings)) {
          this._setByArray(settings);
        }
      }
    }, {
      key: "_setByObject",
      value: function _setByObject(settings) {
        // Overrule settings of known referenced items.
        var refs = this._getRefs();

        var crefs = Object.keys(settings);

        for (var i = 0, n = crefs.length; i < n; i++) {
          var cref = crefs[i];
          var s = settings[cref];
          var c = refs[cref];

          if (!c) {
            if (this.isItem(s)) {
              // Replace previous item;
              s.ref = cref;
              this.add(s);
            } else {
              // Create new item.
              c = this.createItem(s);
              c.ref = cref;
              c.patch(s);
              this.add(c);
            }
          } else {
            if (this.isItem(s)) {
              if (c !== s) {
                // Replace previous item;
                var idx = this.getIndex(c);
                s.ref = cref;
                this.setAt(s, idx);
              }
            } else {
              c.patch(s);
            }
          }
        }
      }
    }, {
      key: "_equalsArray",
      value: function _equalsArray(array) {
        var same = true;

        if (array.length === this._items.length) {
          for (var i = 0, n = this._items.length; i < n && same; i++) {
            same = same && this._items[i] === array[i];
          }
        } else {
          same = false;
        }

        return same;
      }
    }, {
      key: "_setByArray",
      value: function _setByArray(array) {
        // For performance reasons, first check if the arrays match exactly and bail out if they do.
        if (this._equalsArray(array)) {
          return;
        }

        for (var i = 0, n = this._items.length; i < n; i++) {
          this._items[i].marker = true;
        }

        var refs;
        var newItems = [];

        for (var _i = 0, _n = array.length; _i < _n; _i++) {
          var s = array[_i];

          if (this.isItem(s)) {
            s.marker = false;
            newItems.push(s);
          } else {
            var cref = s.ref;
            var c = void 0;

            if (cref) {
              if (!refs) refs = this._getRefs();
              c = refs[cref];
            }

            if (!c) {
              // Create new item.
              c = this.createItem(s);
            } else {
              c.marker = false;
            }

            if (Utils.isObjectLiteral(s)) {
              c.patch(s);
            }

            newItems.push(c);
          }
        }

        this._setItems(newItems);
      }
    }, {
      key: "_setItems",
      value: function _setItems(newItems) {
        var _this = this;

        var prevItems = this._items;
        this._items = newItems; // Remove the items.

        var removed = prevItems.filter(function (item) {
          _newArrowCheck(this, _this);

          var m = item.marker;
          delete item.marker;
          return m;
        }.bind(this));
        var added = newItems.filter(function (item) {
          _newArrowCheck(this, _this);

          return prevItems.indexOf(item) === -1;
        }.bind(this));

        if (removed.length || added.length) {
          // Recalculate refs.
          this._refs = {};

          for (var i = 0, n = this._items.length; i < n; i++) {
            var ref = this._items[i].ref;

            if (ref) {
              this._refs[ref] = this._items[i];
            }
          }
        }

        this.onSync(removed, added, newItems);
      }
    }, {
      key: "sort",
      value: function sort(f) {
        var items = this._items.slice();

        items.sort(f);

        this._setByArray(items);
      }
    }, {
      key: "onAdd",
      value: function onAdd(item, index) {}
    }, {
      key: "onRemove",
      value: function onRemove(item, index) {}
    }, {
      key: "onSync",
      value: function onSync(removed, added, order) {}
    }, {
      key: "onSet",
      value: function onSet(item, index, prevItem) {}
    }, {
      key: "onMove",
      value: function onMove(item, fromIndex, toIndex) {}
    }, {
      key: "createItem",
      value: function createItem(object) {
        throw new Error("ObjectList.createItem must create and return a new object");
      }
    }, {
      key: "isItem",
      value: function isItem(object) {
        return false;
      }
    }, {
      key: "forEach",
      value: function forEach(f) {
        this.get().forEach(f);
      }
    }, {
      key: "first",
      get: function get() {
        return this._items[0];
      }
    }, {
      key: "last",
      get: function get() {
        return this._items.length ? this._items[this._items.length - 1] : undefined;
      }
    }, {
      key: "length",
      get: function get() {
        return this._items.length;
      }
    }]);

    return ObjectList;
  }();

  var ElementChildList =
  /*#__PURE__*/
  function (_ObjectList) {
    _inherits(ElementChildList, _ObjectList);

    function ElementChildList(element) {
      var _this;

      _classCallCheck(this, ElementChildList);

      _this = _possibleConstructorReturn(this, _getPrototypeOf(ElementChildList).call(this));
      _this._element = element;
      return _this;
    }

    _createClass(ElementChildList, [{
      key: "_connectParent",
      value: function _connectParent(item) {
        var prevParent = item.parent;

        if (prevParent && prevParent !== this._element) {
          // Cleanup in previous child list, without
          var prevChildList = item.parent.childList;
          var index = prevChildList.getIndex(item);

          if (item.ref) {
            prevChildList._refs[item.ref] = undefined;
          }

          prevChildList._items.splice(index, 1); // Also clean up element core.


          prevParent.core.removeChildAt(index);
        }

        item._setParent(this._element); // We are expecting the caller to sync it to the core.

      }
    }, {
      key: "onAdd",
      value: function onAdd(item, index) {
        this._connectParent(item);

        this._element.core.addChildAt(index, item.core);
      }
    }, {
      key: "onRemove",
      value: function onRemove(item, index) {
        item._setParent(null);

        this._element.core.removeChildAt(index);
      }
    }, {
      key: "onSync",
      value: function onSync(removed, added, order) {
        var _this2 = this;

        for (var i = 0, n = removed.length; i < n; i++) {
          removed[i]._setParent(null);
        }

        for (var _i = 0, _n = added.length; _i < _n; _i++) {
          this._connectParent(added[_i]);
        }

        var gc = function gc(i) {
          _newArrowCheck(this, _this2);

          return i.core;
        }.bind(this);

        this._element.core.syncChildren(removed.map(gc), added.map(gc), order.map(gc));
      }
    }, {
      key: "onSet",
      value: function onSet(item, index, prevItem) {
        prevItem._setParent(null);

        this._connectParent(item);

        this._element.core.setChildAt(index, item.core);
      }
    }, {
      key: "onMove",
      value: function onMove(item, fromIndex, toIndex) {
        this._element.core.moveChild(fromIndex, toIndex);
      }
    }, {
      key: "createItem",
      value: function createItem(object) {
        if (object.type) {
          return new object.type(this._element.stage);
        } else {
          return this._element.stage.createElement();
        }
      }
    }, {
      key: "isItem",
      value: function isItem(object) {
        return object.isElement;
      }
    }]);

    return ElementChildList;
  }(ObjectList);

  var Element =
  /*#__PURE__*/
  function () {
    function Element(stage) {
      _classCallCheck(this, Element);

      this.stage = stage;
      this.__id = Element.id++;

      this.__start(); // EventEmitter constructor.


      this._hasEventListeners = false;
      this.__core = new ElementCore(this);
      /**
       * A reference that can be used while merging trees.
       * @type {string}
       */

      this.__ref = null;
      /**
       * An element is attached if it is a descendant of the stage root.
       * @type {boolean}
       */

      this.__attached = false;
      /**
       * An element is enabled when it is attached and it is visible (worldAlpha > 0).
       * @type {boolean}
       */

      this.__enabled = false;
      /**
       * An element is active when it is enabled and it is within bounds.
       * @type {boolean}
       */

      this.__active = false;
      /**
       * @type {Element}
       */

      this.__parent = null;
      /**
       * The texture that is currently set.
       * @type {Texture}
       */

      this.__texture = null;
      /**
       * The currently displayed texture. While this.texture is loading, this one may be different.
       * @type {Texture}
       */

      this.__displayedTexture = null;
      /**
       * Tags that can be used to identify/search for a specific element.
       * @type {String[]}
       */

      this.__tags = null;
      /**
       * The tree's tags mapping.
       * This contains all elements for all known tags, at all times.
       * @type {Map}
       */

      this.__treeTags = null;
      /**
       * Creates a tag context: tagged elements in this branch will not be reachable from ancestors of this elements.
       * @type {boolean}
       */

      this.__tagRoot = false;
      /**
       * (Lazy-initialised) list of children owned by this elements.
       * @type {ElementChildList}
       */

      this.__childList = null;
      this._w = 0;
      this._h = 0;
    }

    _createClass(Element, [{
      key: "__start",
      value: function __start() {}
    }, {
      key: "setAsRoot",
      value: function setAsRoot() {
        this.__core.setAsRoot();

        this._updateAttachedFlag();

        this._updateEnabledFlag();
      }
    }, {
      key: "_setParent",
      value: function _setParent(parent) {
        if (this.__parent === parent) return;

        if (this.__parent) {
          this._unsetTagsParent();
        }

        this.__parent = parent;

        if (parent) {
          this._setTagsParent();
        }

        this._updateAttachedFlag();

        this._updateEnabledFlag();

        if (this.isRoot && parent) {
          this._throwError("Root should not be added as a child! Results are unspecified!");
        }
      }
    }, {
      key: "getDepth",
      value: function getDepth() {
        var depth = 0;
        var p = this.__parent;

        while (p) {
          depth++;
          p = p.__parent;
        }

        return depth;
      }
    }, {
      key: "getAncestor",
      value: function getAncestor(l) {
        var p = this;

        while (l > 0 && p.__parent) {
          p = p.__parent;
          l--;
        }

        return p;
      }
    }, {
      key: "getAncestorAtDepth",
      value: function getAncestorAtDepth(depth) {
        var levels = this.getDepth() - depth;

        if (levels < 0) {
          return null;
        }

        return this.getAncestor(levels);
      }
    }, {
      key: "isAncestorOf",
      value: function isAncestorOf(c) {
        var p = c;

        while (p = p.parent) {
          if (this === p) {
            return true;
          }
        }

        return false;
      }
    }, {
      key: "getSharedAncestor",
      value: function getSharedAncestor(c) {
        var o1 = this;
        var o2 = c;
        var l1 = o1.getDepth();
        var l2 = o2.getDepth();

        if (l1 > l2) {
          o1 = o1.getAncestor(l1 - l2);
        } else if (l2 > l1) {
          o2 = o2.getAncestor(l2 - l1);
        }

        do {
          if (o1 === o2) {
            return o1;
          }

          o1 = o1.__parent;
          o2 = o2.__parent;
        } while (o1 && o2);

        return null;
      }
    }, {
      key: "_isAttached",
      value: function _isAttached() {
        return this.__parent ? this.__parent.__attached : this.stage.root === this;
      }
    }, {
      key: "_isEnabled",
      value: function _isEnabled() {
        return this.__core.visible && this.__core.alpha > 0 && (this.__parent ? this.__parent.__enabled : this.stage.root === this);
      }
    }, {
      key: "_isActive",
      value: function _isActive() {
        return this._isEnabled() && this.withinBoundsMargin;
      }
    }, {
      key: "_updateAttachedFlag",

      /**
       * Updates the 'attached' flag for this branch.
       */
      value: function _updateAttachedFlag() {
        var newAttached = this._isAttached();

        if (this.__attached !== newAttached) {
          this.__attached = newAttached;

          if (newAttached) {
            this._onSetup();
          }

          var children = this._children.get();

          if (children) {
            var m = children.length;

            if (m > 0) {
              for (var i = 0; i < m; i++) {
                children[i]._updateAttachedFlag();
              }
            }
          }

          if (newAttached) {
            this._onAttach();
          } else {
            this._onDetach();
          }
        }
      }
    }, {
      key: "_updateEnabledFlag",

      /**
       * Updates the 'enabled' flag for this branch.
       */
      value: function _updateEnabledFlag() {
        var newEnabled = this._isEnabled();

        if (this.__enabled !== newEnabled) {
          if (newEnabled) {
            this._onEnabled();

            this._setEnabledFlag();
          } else {
            this._onDisabled();

            this._unsetEnabledFlag();
          }

          var children = this._children.get();

          if (children) {
            var m = children.length;

            if (m > 0) {
              for (var i = 0; i < m; i++) {
                children[i]._updateEnabledFlag();
              }
            }
          }
        }
      }
    }, {
      key: "_setEnabledFlag",
      value: function _setEnabledFlag() {
        this.__enabled = true; // Force re-check of texture because dimensions might have changed (cutting).

        this._updateDimensions();

        this._updateTextureCoords();

        if (this.__texture) {
          this.__texture.addElement(this);
        }

        if (this.withinBoundsMargin) {
          this._setActiveFlag();
        }

        if (this.__core.shader) {
          this.__core.shader.addElement(this.__core);
        }
      }
    }, {
      key: "_unsetEnabledFlag",
      value: function _unsetEnabledFlag() {
        var _this = this;

        if (this.__active) {
          this._unsetActiveFlag();
        }

        if (this.__texture) {
          this.__texture.removeElement(this);
        }

        if (this.__core.shader) {
          this.__core.shader.removeElement(this.__core);
        }

        if (this._texturizer) {
          this.texturizer.filters.forEach(function (filter) {
            _newArrowCheck(this, _this);

            return filter.removeElement(this.__core);
          }.bind(this));
        }

        this.__enabled = false;
      }
    }, {
      key: "_setActiveFlag",
      value: function _setActiveFlag() {
        this.__active = true; // This must happen before enabling the texture, because it may already be loaded or load directly.

        if (this.__texture) {
          this.__texture.incActiveCount();
        }

        if (this.__texture) {
          this._enableTexture();
        }

        this._onActive();
      }
    }, {
      key: "_unsetActiveFlag",
      value: function _unsetActiveFlag() {
        if (this.__texture) {
          this.__texture.decActiveCount();
        }

        this.__active = false;

        if (this.__texture) {
          this._disableTexture();
        }

        if (this._hasTexturizer()) {
          this.texturizer.deactivate();
        }

        this._onInactive();
      }
    }, {
      key: "_onSetup",
      value: function _onSetup() {}
    }, {
      key: "_onAttach",
      value: function _onAttach() {}
    }, {
      key: "_onDetach",
      value: function _onDetach() {}
    }, {
      key: "_onEnabled",
      value: function _onEnabled() {}
    }, {
      key: "_onDisabled",
      value: function _onDisabled() {}
    }, {
      key: "_onActive",
      value: function _onActive() {}
    }, {
      key: "_onInactive",
      value: function _onInactive() {}
    }, {
      key: "_onResize",
      value: function _onResize() {}
    }, {
      key: "_getRenderWidth",
      value: function _getRenderWidth() {
        if (this._w) {
          return this._w;
        } else if (this.__displayedTexture) {
          return this.__displayedTexture.getRenderWidth();
        } else if (this.__texture) {
          // Texture already loaded, but not yet updated (probably because this element is not active).
          return this.__texture.getRenderWidth();
        } else {
          return 0;
        }
      }
    }, {
      key: "_getRenderHeight",
      value: function _getRenderHeight() {
        if (this._h) {
          return this._h;
        } else if (this.__displayedTexture) {
          return this.__displayedTexture.getRenderHeight();
        } else if (this.__texture) {
          // Texture already loaded, but not yet updated (probably because this element is not active).
          return this.__texture.getRenderHeight();
        } else {
          return 0;
        }
      }
    }, {
      key: "textureIsLoaded",
      value: function textureIsLoaded() {
        return this.__texture && this.__texture.isLoaded();
      }
    }, {
      key: "loadTexture",
      value: function loadTexture() {
        if (this.__texture) {
          this.__texture.load();

          if (!this.__texture.isUsed() || !this._isEnabled()) {
            // Loading the texture will have no effect on the dimensions of this element.
            // Manually update them, so that calcs can be performed immediately in userland.
            this._updateDimensions();
          }
        }
      }
    }, {
      key: "_enableTextureError",
      value: function _enableTextureError() {
        // txError event should automatically be re-triggered when a element becomes active.
        var loadError = this.__texture.loadError;

        if (loadError) {
          this.emit('txError', loadError, this.__texture._source);
        }
      }
    }, {
      key: "_enableTexture",
      value: function _enableTexture() {
        if (this.__texture.isLoaded()) {
          this._setDisplayedTexture(this.__texture);
        } else {
          // We don't want to retain the old 'ghost' image as it wasn't visible anyway.
          this._setDisplayedTexture(null);

          this._enableTextureError();
        }
      }
    }, {
      key: "_disableTexture",
      value: function _disableTexture() {
        // We disable the displayed texture because, when the texture changes while invisible, we should use that w, h,
        // mw, mh for checking within bounds.
        this._setDisplayedTexture(null);
      }
    }, {
      key: "_setDisplayedTexture",
      value: function _setDisplayedTexture(v) {
        var prevTexture = this.__displayedTexture;

        if (prevTexture && v !== prevTexture) {
          if (this.__texture !== prevTexture) {
            // The old displayed texture is deprecated.
            prevTexture.removeElement(this);
          }
        }

        var prevSource = this.__core.displayedTextureSource ? this.__core.displayedTextureSource._source : null;
        var sourceChanged = (v ? v._source : null) !== prevSource;
        this.__displayedTexture = v;

        this._updateDimensions();

        if (this.__displayedTexture) {
          if (sourceChanged) {
            // We don't need to reference the displayed texture because it was already referenced (this.texture === this.displayedTexture).
            this._updateTextureCoords();

            this.__core.setDisplayedTextureSource(this.__displayedTexture._source);
          }
        } else {
          this.__core.setDisplayedTextureSource(null);
        }

        if (sourceChanged) {
          if (this.__displayedTexture) {
            this.emit('txLoaded', this.__displayedTexture);
          } else {
            this.emit('txUnloaded', this.__displayedTexture);
          }
        }
      }
    }, {
      key: "onTextureSourceLoaded",
      value: function onTextureSourceLoaded() {
        // This function is called when element is enabled, but we only want to set displayed texture for active elements.
        if (this.active) {
          // We may be dealing with a texture reloading, so we must force update.
          this._setDisplayedTexture(this.__texture);
        }
      }
    }, {
      key: "onTextureSourceLoadError",
      value: function onTextureSourceLoadError(e) {
        this.emit('txError', e, this.__texture._source);
      }
    }, {
      key: "forceRenderUpdate",
      value: function forceRenderUpdate() {
        this.__core.setHasRenderUpdates(3);
      }
    }, {
      key: "onDisplayedTextureClippingChanged",
      value: function onDisplayedTextureClippingChanged() {
        this._updateDimensions();

        this._updateTextureCoords();
      }
    }, {
      key: "onPrecisionChanged",
      value: function onPrecisionChanged() {
        this._updateDimensions();
      }
    }, {
      key: "onDimensionsChanged",
      value: function onDimensionsChanged(w, h) {
        if (this.texture instanceof TextTexture) {
          this.texture.w = w;
          this.texture.h = h;
          this.w = w;
          this.h = h;
        }
      }
    }, {
      key: "_updateDimensions",
      value: function _updateDimensions() {
        var w = this._getRenderWidth();

        var h = this._getRenderHeight();

        var unknownSize = false;

        if (!w || !h) {
          if (!this.__displayedTexture && this.__texture) {
            // We use a 'max width' replacement instead in the ElementCore calcs.
            // This makes sure that it is able to determine withinBounds.
            w = w || this.__texture.mw;
            h = h || this.__texture.mh;

            if ((!w || !h) && this.__texture.isAutosizeTexture()) {
              unknownSize = true;
            }
          }
        }

        if (this.__core.setDimensions(w, h, unknownSize)) {
          this._onResize();
        }
      }
    }, {
      key: "_updateTextureCoords",
      value: function _updateTextureCoords() {
        if (this.displayedTexture && this.displayedTexture._source) {
          var displayedTexture = this.displayedTexture;
          var displayedTextureSource = this.displayedTexture._source;
          var tx1 = 0,
              ty1 = 0,
              tx2 = 1.0,
              ty2 = 1.0;

          if (displayedTexture.clipping) {
            // Apply texture clipping.
            var w = displayedTextureSource.getRenderWidth();
            var h = displayedTextureSource.getRenderHeight();
            var iw, ih, rw, rh;
            iw = 1 / w;
            ih = 1 / h;

            if (displayedTexture.pw) {
              rw = displayedTexture.pw * iw;
            } else {
              rw = (w - displayedTexture.px) * iw;
            }

            if (displayedTexture.ph) {
              rh = displayedTexture.ph * ih;
            } else {
              rh = (h - displayedTexture.py) * ih;
            }

            iw *= displayedTexture.px;
            ih *= displayedTexture.py;
            tx1 = iw;
            ty1 = ih;
            tx2 = tx2 * rw + iw;
            ty2 = ty2 * rh + ih;
            tx1 = Math.max(0, tx1);
            ty1 = Math.max(0, ty1);
            tx2 = Math.min(1, tx2);
            ty2 = Math.min(1, ty2);
          }

          this.__core.setTextureCoords(tx1, ty1, tx2, ty2);
        }
      }
    }, {
      key: "getCornerPoints",
      value: function getCornerPoints() {
        return this.__core.getCornerPoints();
      }
    }, {
      key: "_unsetTagsParent",
      value: function _unsetTagsParent() {
        var _this2 = this;

        if (this.__tags) {
          this.__tags.forEach(function (tag) {
            _newArrowCheck(this, _this2);

            // Remove from treeTags.
            var p = this;

            while (p = p.__parent) {
              var parentTreeTags = p.__treeTags.get(tag);

              parentTreeTags.delete(this);

              if (p.__tagRoot) {
                break;
              }
            }
          }.bind(this));
        }

        var tags = null;
        var n = 0;

        if (this.__treeTags) {
          if (!this.__tagRoot) {
            tags = Utils.iteratorToArray(this.__treeTags.keys());
            n = tags.length;

            if (n > 0) {
              for (var i = 0; i < n; i++) {
                var tagSet = this.__treeTags.get(tags[i]); // Remove from treeTags.


                var p = this;

                var _loop = function _loop() {
                  var parentTreeTags = p.__treeTags.get(tags[i]);

                  tagSet.forEach(function (comp) {
                    parentTreeTags.delete(comp);
                  });

                  if (p.__tagRoot) {
                    return "break";
                  }
                };

                while (p = p.__parent) {
                  var _ret = _loop();

                  if (_ret === "break") break;
                }
              }
            }
          }
        }
      }
    }, {
      key: "_setTagsParent",
      value: function _setTagsParent() {
        var _this3 = this;

        // Just copy over the 'local' tags.
        if (this.__tags) {
          this.__tags.forEach(function (tag) {
            _newArrowCheck(this, _this3);

            var p = this;

            while (p = p.__parent) {
              if (!p.__treeTags) {
                p.__treeTags = new Map();
              }

              var s = p.__treeTags.get(tag);

              if (!s) {
                s = new Set();

                p.__treeTags.set(tag, s);
              }

              s.add(this);

              if (p.__tagRoot) {
                break;
              }
            }
          }.bind(this));
        }

        if (this.__treeTags && this.__treeTags.size) {
          if (!this.__tagRoot) {
            this.__treeTags.forEach(function (tagSet, tag) {
              _newArrowCheck(this, _this3);

              var p = this;

              var _loop2 = function _loop2() {
                if (p.__tagRoot) ;

                if (!p.__treeTags) {
                  p.__treeTags = new Map();
                }

                var s = p.__treeTags.get(tag);

                if (!s) {
                  s = new Set();

                  p.__treeTags.set(tag, s);
                }

                tagSet.forEach(function (comp) {
                  s.add(comp);
                });
              };

              while (!p.__tagRoot && (p = p.__parent)) {
                _loop2();
              }
            }.bind(this));
          }
        }
      }
    }, {
      key: "_getByTag",
      value: function _getByTag(tag) {
        if (!this.__treeTags) {
          return [];
        }

        var t = this.__treeTags.get(tag);

        return t ? Utils.setToArray(t) : [];
      }
    }, {
      key: "getTags",
      value: function getTags() {
        return this.__tags ? this.__tags : [];
      }
    }, {
      key: "setTags",
      value: function setTags(tags) {
        var _this4 = this;

        tags = tags.reduce(function (acc, tag) {
          _newArrowCheck(this, _this4);

          return acc.concat(tag.split(' '));
        }.bind(this), []);

        if (this.__ref) {
          tags.push(this.__ref);
        }

        var i,
            n = tags.length;
        var removes = [];
        var adds = [];

        for (i = 0; i < n; i++) {
          if (!this.hasTag(tags[i])) {
            adds.push(tags[i]);
          }
        }

        var currentTags = this.tags || [];
        n = currentTags.length;

        for (i = 0; i < n; i++) {
          if (tags.indexOf(currentTags[i]) == -1) {
            removes.push(currentTags[i]);
          }
        }

        for (i = 0; i < removes.length; i++) {
          this.removeTag(removes[i]);
        }

        for (i = 0; i < adds.length; i++) {
          this.addTag(adds[i]);
        }
      }
    }, {
      key: "addTag",
      value: function addTag(tag) {
        if (tag.indexOf(' ') === -1) {
          if (Utils.isUcChar(tag.charCodeAt(0))) {
            this._throwError("Tag may not start with an upper case character.");
          }

          this._addTag(tag);
        } else {
          var tags = tag.split(' ');

          for (var i = 0, m = tags.length; i < m; i++) {
            var _tag2 = tags[i];

            if (Utils.isUcChar(_tag2.charCodeAt(0))) {
              this._throwError("Tag may not start with an upper case character.");
            }

            this._addTag(_tag2);
          }
        }
      }
    }, {
      key: "_addTag",
      value: function _addTag(tag) {
        if (!this.__tags) {
          this.__tags = [];
        }

        if (this.__tags.indexOf(tag) === -1) {
          this.__tags.push(tag); // Add to treeTags hierarchy.


          var p = this.__parent;

          if (p) {
            do {
              if (!p.__treeTags) {
                p.__treeTags = new Map();
              }

              var s = p.__treeTags.get(tag);

              if (!s) {
                s = new Set();

                p.__treeTags.set(tag, s);
              }

              s.add(this);
            } while (!p.__tagRoot && (p = p.__parent));
          }
        }
      }
    }, {
      key: "removeTag",
      value: function removeTag(tag) {
        var i = this.__tags.indexOf(tag);

        if (i !== -1) {
          this.__tags.splice(i, 1); // Remove from treeTags hierarchy.


          var p = this.__parent;

          if (p) {
            do {
              var list = p.__treeTags.get(tag);

              if (list) {
                list.delete(this);
              }
            } while (!p.__tagRoot && (p = p.__parent));
          }
        }
      }
    }, {
      key: "hasTag",
      value: function hasTag(tag) {
        return this.__tags && this.__tags.indexOf(tag) !== -1;
      }
      /**
       * Returns one of the elements from the subtree that have this tag.
       * @param {string} tag
       * @returns {Element}
       */

    }, {
      key: "_tag",
      value: function _tag(tag) {
        if (tag.indexOf(".") !== -1) {
          return this.mtag(tag)[0];
        } else {
          if (this.__treeTags) {
            var t = this.__treeTags.get(tag);

            if (t) {
              var item = t.values().next();
              return item ? item.value : undefined;
            }
          }
        }
      }
    }, {
      key: "mtag",

      /**
       * Returns all elements from the subtree that have this tag.
       * @param {string} tag
       * @returns {Element[]}
       */
      value: function mtag(tag) {
        var idx = tag.indexOf(".");

        if (idx >= 0) {
          var parts = tag.split('.');

          var res = this._getByTag(parts[0]);

          var level = 1;
          var c = parts.length;

          while (res.length && level < c) {
            var resn = [];

            for (var j = 0, n = res.length; j < n; j++) {
              resn = resn.concat(res[j]._getByTag(parts[level]));
            }

            res = resn;
            level++;
          }

          return res;
        } else {
          return this._getByTag(tag);
        }
      }
    }, {
      key: "stag",
      value: function stag(tag, settings) {
        var t = this.mtag(tag);
        var n = t.length;

        for (var i = 0; i < n; i++) {
          Base.patchObject(t[i], settings);
        }
      }
    }, {
      key: "sel",
      value: function sel(path) {
        var results = this.select(path);

        if (results.length) {
          return results[0];
        } else {
          return undefined;
        }
      }
    }, {
      key: "select",
      value: function select(path) {
        if (path.indexOf(",") !== -1) {
          var selectors = path.split(',');
          var res = [];

          for (var i = 0; i < selectors.length; i++) {
            res = res.concat(this._select(selectors[i]));
          }

          return res;
        } else {
          return this._select(path);
        }
      }
    }, {
      key: "_select",
      value: function _select(path) {
        if (path === "") return [this];
        var pointIdx = path.indexOf(".");
        var arrowIdx = path.indexOf(">");

        if (pointIdx === -1 && arrowIdx === -1) {
          // Quick case.
          return this.mtag(path);
        } // Detect by first char.


        var isRef;

        if (arrowIdx === 0) {
          isRef = true;
          path = path.substr(1);
        } else if (pointIdx === 0) {
          isRef = false;
          path = path.substr(1);
        } else {
          isRef = false;
        }

        return this._selectChilds(path, isRef);
      }
    }, {
      key: "_selectChilds",
      value: function _selectChilds(path, isRef) {
        var pointIdx = path.indexOf(".");
        var arrowIdx = path.indexOf(">");

        if (pointIdx === -1 && arrowIdx === -1) {
          if (isRef) {
            var ref = this.getByRef(path);
            return ref ? [ref] : [];
          } else {
            return this.mtag(path);
          }
        }

        if (arrowIdx === -1 || pointIdx !== -1 && pointIdx < arrowIdx) {
          var next;
          var str = path.substr(0, pointIdx);

          if (isRef) {
            var _ref = this.getByRef(str);

            next = _ref ? [_ref] : [];
          } else {
            next = this.mtag(str);
          }

          var total = [];
          var subPath = path.substr(pointIdx + 1);

          for (var i = 0, n = next.length; i < n; i++) {
            total = total.concat(next[i]._selectChilds(subPath, false));
          }

          return total;
        } else {
          var _next;

          var _str = path.substr(0, arrowIdx);

          if (isRef) {
            var _ref2 = this.getByRef(_str);

            _next = _ref2 ? [_ref2] : [];
          } else {
            _next = this.mtag(_str);
          }

          var _total = [];

          var _subPath = path.substr(arrowIdx + 1);

          for (var _i = 0, _n = _next.length; _i < _n; _i++) {
            _total = _total.concat(_next[_i]._selectChilds(_subPath, true));
          }

          return _total;
        }
      }
    }, {
      key: "getByRef",
      value: function getByRef(ref) {
        return this.childList.getByRef(ref);
      }
    }, {
      key: "getLocationString",
      value: function getLocationString() {
        var i;
        i = this.__parent ? this.__parent._children.getIndex(this) : "R";
        var localTags = this.getTags();
        var str = this.__parent ? this.__parent.getLocationString() : "";

        if (this.ref) {
          str += ":[" + i + "]" + this.ref;
        } else if (localTags.length) {
          str += ":[" + i + "]" + localTags.join(",");
        } else {
          str += ":[" + i + "]#" + this.id;
        }

        return str;
      }
    }, {
      key: "toString",
      value: function toString() {
        var obj = this.getSettings();
        return Element.getPrettyString(obj, "");
      }
    }, {
      key: "getSettings",
      value: function getSettings() {
        var _this5 = this;

        var settings = this.getNonDefaults();

        var children = this._children.get();

        if (children) {
          var n = children.length;

          if (n) {
            var childArray = [];
            var missing = false;

            for (var i = 0; i < n; i++) {
              childArray.push(children[i].getSettings());
              missing = missing || !children[i].ref;
            }

            if (!missing) {
              settings.children = {};
              childArray.forEach(function (child) {
                _newArrowCheck(this, _this5);

                settings.children[child.ref] = child;
              }.bind(this));
            } else {
              settings.children = childArray;
            }
          }
        }

        settings.id = this.id;
        return settings;
      }
    }, {
      key: "getNonDefaults",
      value: function getNonDefaults() {
        var settings = {};

        if (this.constructor !== Element) {
          settings.type = this.constructor.name;
        }

        if (this.__ref) {
          settings.ref = this.__ref;
        }

        if (this.__tags && this.__tags.length) {
          settings.tags = this.__tags;
        }

        if (this.x !== 0) settings.x = this.x;
        if (this.y !== 0) settings.y = this.y;
        if (this.w !== 0) settings.w = this.w;
        if (this.h !== 0) settings.h = this.h;

        if (this.scaleX === this.scaleY) {
          if (this.scaleX !== 1) settings.scale = this.scaleX;
        } else {
          if (this.scaleX !== 1) settings.scaleX = this.scaleX;
          if (this.scaleY !== 1) settings.scaleY = this.scaleY;
        }

        if (this.pivotX === this.pivotY) {
          if (this.pivotX !== 0.5) settings.pivot = this.pivotX;
        } else {
          if (this.pivotX !== 0.5) settings.pivotX = this.pivotX;
          if (this.pivotY !== 0.5) settings.pivotY = this.pivotY;
        }

        if (this.mountX === this.mountY) {
          if (this.mountX !== 0) settings.mount = this.mountX;
        } else {
          if (this.mountX !== 0) settings.mountX = this.mountX;
          if (this.mountY !== 0) settings.mountY = this.mountY;
        }

        if (this.alpha !== 1) settings.alpha = this.alpha;
        if (!this.visible) settings.visible = false;
        if (this.rotation !== 0) settings.rotation = this.rotation;

        if (this.colorUl === this.colorUr && this.colorBl === this.colorBr && this.colorUl === this.colorBl) {
          if (this.colorUl !== 0xFFFFFFFF) settings.color = this.colorUl.toString(16);
        } else {
          if (this.colorUl !== 0xFFFFFFFF) settings.colorUl = this.colorUl.toString(16);
          if (this.colorUr !== 0xFFFFFFFF) settings.colorUr = this.colorUr.toString(16);
          if (this.colorBl !== 0xFFFFFFFF) settings.colorBl = this.colorBl.toString(16);
          if (this.colorBr !== 0xFFFFFFFF) settings.colorBr = this.colorBr.toString(16);
        }

        if (this.zIndex) settings.zIndex = this.zIndex;
        if (this.forceZIndexContext) settings.forceZIndexContext = true;
        if (this.clipping) settings.clipping = this.clipping;
        if (!this.clipbox) settings.clipbox = this.clipbox;

        if (this.__texture) {
          var tnd = this.__texture.getNonDefaults();

          if (Object.keys(tnd).length) {
            settings.texture = tnd;
          }
        }

        if (this.shader) {
          var _tnd = this.shader.getNonDefaults();

          if (Object.keys(_tnd).length) {
            settings.shader = _tnd;
          }
        }

        if (this._hasTexturizer()) {
          if (this.texturizer.enabled) {
            settings.renderToTexture = this.texturizer.enabled;
          }

          if (this.texturizer.lazy) {
            settings.renderToTextureLazy = this.texturizer.lazy;
          }

          if (this.texturizer.colorize) {
            settings.colorizeResultTexture = this.texturizer.colorize;
          }

          if (this.texturizer.renderOffscreen) {
            settings.renderOffscreen = this.texturizer.renderOffscreen;
          }
        }

        return settings;
      }
    }, {
      key: "_enableWithinBoundsMargin",
      value: function _enableWithinBoundsMargin() {
        // Iff enabled, this toggles the active flag.
        if (this.__enabled) {
          this._setActiveFlag();
        }
      }
    }, {
      key: "_disableWithinBoundsMargin",
      value: function _disableWithinBoundsMargin() {
        // Iff active, this toggles the active flag.
        if (this.__active) {
          this._unsetActiveFlag();
        }
      }
    }, {
      key: "hasChildren",
      value: function hasChildren() {
        return this._allowChildrenAccess() && this.__childList && this.__childList.length > 0;
      }
    }, {
      key: "_allowChildrenAccess",
      value: function _allowChildrenAccess() {
        return true;
      }
    }, {
      key: "add",
      value: function add(o) {
        return this.childList.a(o);
      }
    }, {
      key: "enableTextTexture",
      value: function enableTextTexture() {
        if (!this.texture || !(this.texture instanceof TextTexture)) {
          this.texture = new TextTexture(this.stage);

          if (!this.texture.w && !this.texture.h) {
            // Inherit dimensions from element.
            // This allows userland to set dimensions of the Element and then later specify the text.
            this.texture.w = this.w;
            this.texture.h = this.h;
          }
        }

        return this.texture;
      }
    }, {
      key: "forceUpdate",
      value: function forceUpdate() {
        // Make sure that the update loop is run.
        this.__core._setHasUpdates();
      }
    }, {
      key: "_hasTexturizer",
      value: function _hasTexturizer() {
        return !!this.__core._texturizer;
      }
    }, {
      key: "getTexture",
      value: function getTexture() {
        return this.texturizer._getTextureSource();
      }
    }, {
      key: "patch",
      value: function patch(settings) {
        var paths = Object.keys(settings);

        for (var i = 0, n = paths.length; i < n; i++) {
          var path = paths[i];
          var v = settings[path];
          var firstCharCode = path.charCodeAt(0);

          if (Utils.isUcChar(firstCharCode)) {
            // Ref.
            var child = this.getByRef(path);

            if (!child) {
              if (v !== undefined) {
                // Add to list immediately.
                var c = void 0;

                if (Utils.isObjectLiteral(v)) {
                  // Catch this case to capture createMode flag.
                  c = this.childList.createItem(v);
                  c.patch(v);
                } else if (Utils.isObject(v)) {
                  c = v;
                }

                if (c.isElement) {
                  c.ref = path;
                }

                this.childList.a(c);
              }
            } else {
              if (v === undefined) {
                if (child.parent) {
                  child.parent.childList.remove(child);
                }
              } else if (Utils.isObjectLiteral(v)) {
                child.patch(v);
              } else if (v.isElement) {
                // Replace element by new element.
                v.ref = path;
                this.childList.replace(v, child);
              } else {
                this._throwError("Unexpected value for path: " + path);
              }
            }
          } else {
            // Property.
            Base.patchObjectProperty(this, path, v);
          }
        }
      }
    }, {
      key: "_throwError",
      value: function _throwError(message) {
        throw new Error(this.constructor.name + " (" + this.getLocationString() + "): " + message);
      }
    }, {
      key: "animation",
      value: function animation(settings) {
        return this.stage.animations.createAnimation(this, settings);
      }
    }, {
      key: "transition",
      value: function transition(property) {
        var settings = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

        if (settings === null) {
          return this._getTransition(property);
        } else {
          this._setTransition(property, settings); // We do not create/return the transition, because it would undo the 'lazy transition creation' optimization.


          return null;
        }
      }
    }, {
      key: "fastForward",
      value: function fastForward(property) {
        if (this._transitions) {
          var t = this._transitions[property];

          if (t && t.isTransition) {
            t.finish();
          }
        }
      }
    }, {
      key: "_getTransition",
      value: function _getTransition(property) {
        if (!this._transitions) {
          this._transitions = {};
        }

        var t = this._transitions[property];

        if (!t) {
          // Create default transition.
          t = new Transition(this.stage.transitions, this.stage.transitions.defaultTransitionSettings, this, property);
        } else if (t.isTransitionSettings) {
          // Upgrade to 'real' transition.
          t = new Transition(this.stage.transitions, t, this, property);
        }

        this._transitions[property] = t;
        return t;
      }
    }, {
      key: "_setTransition",
      value: function _setTransition(property, settings) {
        if (!settings) {
          this._removeTransition(property);
        } else {
          if (Utils.isObjectLiteral(settings)) {
            // Convert plain object to proper settings object.
            settings = this.stage.transitions.createSettings(settings);
          }

          if (!this._transitions) {
            this._transitions = {};
          }

          var current = this._transitions[property];

          if (current && current.isTransition) {
            // Runtime settings change.
            current.settings = settings;
            return current;
          } else {
            // Initially, only set the settings and upgrade to a 'real' transition when it is used.
            this._transitions[property] = settings;
          }
        }
      }
    }, {
      key: "_removeTransition",
      value: function _removeTransition(property) {
        if (this._transitions) {
          delete this._transitions[property];
        }
      }
    }, {
      key: "getSmooth",
      value: function getSmooth(property, v) {
        var t = this._getTransition(property);

        if (t && t.isAttached()) {
          return t.targetValue;
        } else {
          return v;
        }
      }
    }, {
      key: "setSmooth",
      value: function setSmooth(property, v, settings) {
        if (settings) {
          this._setTransition(property, settings);
        }

        var t = this._getTransition(property);

        t.start(v);
        return t;
      }
    }, {
      key: "id",
      get: function get() {
        return this.__id;
      }
    }, {
      key: "ref",
      set: function set(ref) {
        if (this.__ref !== ref) {
          var charcode = ref.charCodeAt(0);

          if (!Utils.isUcChar(charcode)) {
            this._throwError("Ref must start with an upper case character: " + ref);
          }

          if (this.__ref !== null) {
            this.removeTag(this.__ref);

            if (this.__parent) {
              this.__parent.__childList.clearRef(this.__ref);
            }
          }

          this.__ref = ref;

          if (this.__ref) {
            this._addTag(this.__ref);

            if (this.__parent) {
              this.__parent.__childList.setRef(this.__ref, this);
            }
          }
        }
      },
      get: function get() {
        return this.__ref;
      }
    }, {
      key: "core",
      get: function get() {
        return this.__core;
      }
    }, {
      key: "isRoot",
      get: function get() {
        return this.__core.isRoot;
      }
    }, {
      key: "attached",
      get: function get() {
        return this.__attached;
      }
    }, {
      key: "enabled",
      get: function get() {
        return this.__enabled;
      }
    }, {
      key: "active",
      get: function get() {
        return this.__active;
      }
    }, {
      key: "renderWidth",
      get: function get() {
        if (this.__enabled) {
          // Render width is only maintained if this element is enabled.
          return this.__core.getRenderWidth();
        } else {
          return this._getRenderWidth();
        }
      }
    }, {
      key: "renderHeight",
      get: function get() {
        if (this.__enabled) {
          return this.__core.getRenderHeight();
        } else {
          return this._getRenderHeight();
        }
      }
    }, {
      key: "finalX",
      get: function get() {
        return this.__core.x;
      }
    }, {
      key: "finalY",
      get: function get() {
        return this.__core.y;
      }
    }, {
      key: "finalW",
      get: function get() {
        return this.__core.w;
      }
    }, {
      key: "finalH",
      get: function get() {
        return this.__core.h;
      }
    }, {
      key: "texture",
      get: function get() {
        return this.__texture;
      },
      set: function set(v) {
        var texture;

        if (Utils.isObjectLiteral(v)) {
          if (v.type) {
            texture = new v.type(this.stage);
          } else {
            texture = this.texture;
          }

          if (texture) {
            Base.patchObject(texture, v);
          }
        } else if (!v) {
          texture = null;
        } else {
          if (v.isTexture) {
            texture = v;
          } else if (v.isTextureSource) {
            texture = new SourceTexture(this.stage);
            texture.textureSource = v;
          } else {
            console.error("Please specify a texture type.");
            return;
          }
        }

        var prevTexture = this.__texture;

        if (texture !== prevTexture) {
          this.__texture = texture;

          if (this.__texture) {
            if (this.__enabled) {
              this.__texture.addElement(this);

              if (this.withinBoundsMargin) {
                if (this.__texture.isLoaded()) {
                  this._setDisplayedTexture(this.__texture);
                } else {
                  this._enableTextureError();
                }
              }
            }
          } else {
            // Make sure that current texture is cleared when the texture is explicitly set to null.
            this._setDisplayedTexture(null);
          }

          if (prevTexture && prevTexture !== this.__displayedTexture) {
            prevTexture.removeElement(this);
          }

          this._updateDimensions();
        }
      }
    }, {
      key: "displayedTexture",
      get: function get() {
        return this.__displayedTexture;
      }
    }, {
      key: "tag",
      get: function get() {
        return this._tag;
      },
      set: function set(t) {
        this.tags = t;
      }
    }, {
      key: "tagRoot",
      get: function get() {
        return this.__tagRoot;
      },
      set: function set(v) {
        if (this.__tagRoot !== v) {
          if (!v) {
            this._setTagsParent();
          } else {
            this._unsetTagsParent();
          }

          this.__tagRoot = v;
        }
      }
    }, {
      key: "withinBoundsMargin",
      get: function get() {
        return this.__core._withinBoundsMargin;
      }
    }, {
      key: "boundsMargin",
      set: function set(v) {
        if (!Array.isArray(v) && v !== null) {
          throw new Error("boundsMargin should be an array of left-top-right-bottom values or null (inherit margin)");
        }

        this.__core.boundsMargin = v;
      },
      get: function get() {
        return this.__core.boundsMargin;
      }
    }, {
      key: "x",
      get: function get() {
        return this.__core.offsetX;
      },
      set: function set(v) {
        this.__core.offsetX = v;
      }
    }, {
      key: "y",
      get: function get() {
        return this.__core.offsetY;
      },
      set: function set(v) {
        this.__core.offsetY = v;
      }
    }, {
      key: "w",
      get: function get() {
        return this._w;
      },
      set: function set(v) {
        if (Utils.isFunction(v)) {
          this._w = 0;
          this.__core.funcW = v;
        } else {
          v = Math.max(v, 0);

          if (this._w !== v) {
            this.__core.disableFuncW();

            this._w = v;

            this._updateDimensions();
          }
        }
      }
    }, {
      key: "h",
      get: function get() {
        return this._h;
      },
      set: function set(v) {
        if (Utils.isFunction(v)) {
          this._h = 0;
          this.__core.funcH = v;
        } else {
          v = Math.max(v, 0);

          if (this._h !== v) {
            this.__core.disableFuncH();

            this._h = v;

            this._updateDimensions();
          }
        }
      }
    }, {
      key: "scaleX",
      get: function get() {
        return this.__core.scaleX;
      },
      set: function set(v) {
        this.__core.scaleX = v;
      }
    }, {
      key: "scaleY",
      get: function get() {
        return this.__core.scaleY;
      },
      set: function set(v) {
        this.__core.scaleY = v;
      }
    }, {
      key: "scale",
      get: function get() {
        return this.__core.scale;
      },
      set: function set(v) {
        this.__core.scale = v;
      }
    }, {
      key: "pivotX",
      get: function get() {
        return this.__core.pivotX;
      },
      set: function set(v) {
        this.__core.pivotX = v;
      }
    }, {
      key: "pivotY",
      get: function get() {
        return this.__core.pivotY;
      },
      set: function set(v) {
        this.__core.pivotY = v;
      }
    }, {
      key: "pivot",
      get: function get() {
        return this.__core.pivot;
      },
      set: function set(v) {
        this.__core.pivot = v;
      }
    }, {
      key: "mountX",
      get: function get() {
        return this.__core.mountX;
      },
      set: function set(v) {
        this.__core.mountX = v;
      }
    }, {
      key: "mountY",
      get: function get() {
        return this.__core.mountY;
      },
      set: function set(v) {
        this.__core.mountY = v;
      }
    }, {
      key: "mount",
      get: function get() {
        return this.__core.mount;
      },
      set: function set(v) {
        this.__core.mount = v;
      }
    }, {
      key: "rotation",
      get: function get() {
        return this.__core.rotation;
      },
      set: function set(v) {
        this.__core.rotation = v;
      }
    }, {
      key: "alpha",
      get: function get() {
        return this.__core.alpha;
      },
      set: function set(v) {
        this.__core.alpha = v;
      }
    }, {
      key: "visible",
      get: function get() {
        return this.__core.visible;
      },
      set: function set(v) {
        this.__core.visible = v;
      }
    }, {
      key: "colorUl",
      get: function get() {
        return this.__core.colorUl;
      },
      set: function set(v) {
        this.__core.colorUl = v;
      }
    }, {
      key: "colorUr",
      get: function get() {
        return this.__core.colorUr;
      },
      set: function set(v) {
        this.__core.colorUr = v;
      }
    }, {
      key: "colorBl",
      get: function get() {
        return this.__core.colorBl;
      },
      set: function set(v) {
        this.__core.colorBl = v;
      }
    }, {
      key: "colorBr",
      get: function get() {
        return this.__core.colorBr;
      },
      set: function set(v) {
        this.__core.colorBr = v;
      }
    }, {
      key: "color",
      get: function get() {
        return this.__core.colorUl;
      },
      set: function set(v) {
        if (this.colorUl !== v || this.colorUr !== v || this.colorBl !== v || this.colorBr !== v) {
          this.colorUl = v;
          this.colorUr = v;
          this.colorBl = v;
          this.colorBr = v;
        }
      }
    }, {
      key: "colorTop",
      get: function get() {
        return this.colorUl;
      },
      set: function set(v) {
        if (this.colorUl !== v || this.colorUr !== v) {
          this.colorUl = v;
          this.colorUr = v;
        }
      }
    }, {
      key: "colorBottom",
      get: function get() {
        return this.colorBl;
      },
      set: function set(v) {
        if (this.colorBl !== v || this.colorBr !== v) {
          this.colorBl = v;
          this.colorBr = v;
        }
      }
    }, {
      key: "colorLeft",
      get: function get() {
        return this.colorUl;
      },
      set: function set(v) {
        if (this.colorUl !== v || this.colorBl !== v) {
          this.colorUl = v;
          this.colorBl = v;
        }
      }
    }, {
      key: "colorRight",
      get: function get() {
        return this.colorUr;
      },
      set: function set(v) {
        if (this.colorUr !== v || this.colorBr !== v) {
          this.colorUr = v;
          this.colorBr = v;
        }
      }
    }, {
      key: "zIndex",
      get: function get() {
        return this.__core.zIndex;
      },
      set: function set(v) {
        this.__core.zIndex = v;
      }
    }, {
      key: "forceZIndexContext",
      get: function get() {
        return this.__core.forceZIndexContext;
      },
      set: function set(v) {
        this.__core.forceZIndexContext = v;
      }
    }, {
      key: "clipping",
      get: function get() {
        return this.__core.clipping;
      },
      set: function set(v) {
        this.__core.clipping = v;
      }
    }, {
      key: "clipbox",
      get: function get() {
        return this.__core.clipbox;
      },
      set: function set(v) {
        this.__core.clipbox = v;
      }
    }, {
      key: "tags",
      get: function get() {
        return this.getTags();
      },
      set: function set(v) {
        if (!Array.isArray(v)) v = [v];
        this.setTags(v);
      }
    }, {
      key: "t",
      set: function set(v) {
        this.tags = v;
      }
    }, {
      key: "_children",
      get: function get() {
        if (!this.__childList) {
          this.__childList = new ElementChildList(this, false);
        }

        return this.__childList;
      }
    }, {
      key: "childList",
      get: function get() {
        if (!this._allowChildrenAccess()) {
          this._throwError("Direct access to children is not allowed in " + this.getLocationString());
        }

        return this._children;
      }
    }, {
      key: "children",
      get: function get() {
        return this.childList.get();
      },
      set: function set(children) {
        this.childList.patch(children);
      }
    }, {
      key: "p",
      get: function get() {
        return this.__parent;
      }
    }, {
      key: "parent",
      get: function get() {
        return this.__parent;
      }
    }, {
      key: "src",
      get: function get() {
        if (this.texture && this.texture instanceof ImageTexture) {
          return this.texture._src;
        } else {
          return undefined;
        }
      },
      set: function set(v) {
        var texture = new ImageTexture(this.stage);
        texture.src = v;
        this.texture = texture;
      }
    }, {
      key: "mw",
      set: function set(v) {
        if (this.texture) {
          this.texture.mw = v;

          this._updateDimensions();
        } else {
          this._throwError('Please set mw after setting a texture.');
        }
      }
    }, {
      key: "mh",
      set: function set(v) {
        if (this.texture) {
          this.texture.mh = v;

          this._updateDimensions();
        } else {
          this._throwError('Please set mh after setting a texture.');
        }
      }
    }, {
      key: "rect",
      get: function get() {
        return this.texture === this.stage.rectangleTexture;
      },
      set: function set(v) {
        if (v) {
          this.texture = this.stage.rectangleTexture;
        } else {
          this.texture = null;
        }
      }
    }, {
      key: "text",
      get: function get() {
        if (this.texture && this.texture instanceof TextTexture) {
          return this.texture;
        } else {
          return null;
        }
      },
      set: function set(v) {
        if (!this.texture || !(this.texture instanceof TextTexture)) {
          this.enableTextTexture();
        }

        if (Utils.isString(v)) {
          this.texture.text = v;
        } else {
          this.texture.patch(v);
        }
      }
    }, {
      key: "onUpdate",
      set: function set(f) {
        this.__core.onUpdate = f;
      }
    }, {
      key: "onAfterCalcs",
      set: function set(f) {
        this.__core.onAfterCalcs = f;
      }
    }, {
      key: "onAfterUpdate",
      set: function set(f) {
        this.__core.onAfterUpdate = f;
      }
    }, {
      key: "shader",
      get: function get() {
        return this.__core.shader;
      },
      set: function set(v) {
        if (Utils.isObjectLiteral(v) && !v.type) {
          // Setting properties on an existing shader.
          if (this.shader) {
            this.shader.patch(v);
          }
        } else {
          var shader = Shader.create(this.stage, v);

          if (this.__enabled && this.__core.shader) {
            this.__core.shader.removeElement(this.__core);
          }

          this.__core.shader = shader;

          if (this.__enabled && this.__core.shader) {
            this.__core.shader.addElement(this.__core);
          }
        }
      }
    }, {
      key: "renderToTexture",
      get: function get() {
        return this.rtt;
      },
      set: function set(v) {
        this.rtt = v;
      }
    }, {
      key: "rtt",
      get: function get() {
        return this._hasTexturizer() && this.texturizer.enabled;
      },
      set: function set(v) {
        this.texturizer.enabled = v;
      }
    }, {
      key: "rttLazy",
      get: function get() {
        return this._hasTexturizer() && this.texturizer.lazy;
      },
      set: function set(v) {
        this.texturizer.lazy = v;
      }
    }, {
      key: "renderOffscreen",
      get: function get() {
        return this._hasTexturizer() && this.texturizer.renderOffscreen;
      },
      set: function set(v) {
        this.texturizer.renderOffscreen = v;
      }
    }, {
      key: "colorizeResultTexture",
      get: function get() {
        return this._hasTexturizer() && this.texturizer.colorize;
      },
      set: function set(v) {
        this.texturizer.colorize = v;
      }
    }, {
      key: "texturizer",
      get: function get() {
        return this.__core.texturizer;
      }
    }, {
      key: "transitions",
      set: function set(object) {
        var _this6 = this;

        var keys = Object.keys(object);
        keys.forEach(function (property) {
          _newArrowCheck(this, _this6);

          this.transition(property, object[property]);
        }.bind(this));
      }
    }, {
      key: "smooth",
      set: function set(object) {
        var _this7 = this;

        var keys = Object.keys(object);
        keys.forEach(function (property) {
          _newArrowCheck(this, _this7);

          var value = object[property];

          if (Array.isArray(value)) {
            this.setSmooth(property, value[0], value[1]);
          } else {
            this.setSmooth(property, value);
          }
        }.bind(this));
      }
    }, {
      key: "flex",
      get: function get() {
        return this.__core.flex;
      },
      set: function set(v) {
        this.__core.flex = v;
      }
    }, {
      key: "flexItem",
      get: function get() {
        return this.__core.flexItem;
      },
      set: function set(v) {
        this.__core.flexItem = v;
      }
    }], [{
      key: "getPrettyString",
      value: function getPrettyString(obj, indent) {
        var children = obj.children;
        delete obj.children; // Convert singular json settings object.

        var colorKeys = ["color", "colorUl", "colorUr", "colorBl", "colorBr"];
        var str = JSON.stringify(obj, function (k, v) {
          if (colorKeys.indexOf(k) !== -1) {
            return "COLOR[" + v.toString(16) + "]";
          }

          return v;
        });
        str = str.replace(/"COLOR\[([a-f0-9]{1,8})\]"/g, "0x$1");

        if (children) {
          var childStr = "";

          if (Utils.isObjectLiteral(children)) {
            var refs = Object.keys(children);
            childStr = "";

            for (var i = 0, n = refs.length; i < n; i++) {
              childStr += `\n${indent}  "${refs[i]}":`;
              delete children[refs[i]].ref;
              childStr += Element.getPrettyString(children[refs[i]], indent + "  ") + (i < n - 1 ? "," : "");
            }

            var isEmpty = str === "{}";
            str = str.substr(0, str.length - 1) + (isEmpty ? "" : ",") + childStr + "\n" + indent + "}";
          } else {
            var _n2 = children.length;
            childStr = "[";

            for (var _i2 = 0; _i2 < _n2; _i2++) {
              childStr += Element.getPrettyString(children[_i2], indent + "  ") + (_i2 < _n2 - 1 ? "," : "") + "\n";
            }

            childStr += indent + "]}";

            var _isEmpty = str === "{}";

            str = str.substr(0, str.length - 1) + (_isEmpty ? "" : ",") + "\"children\":\n" + indent + childStr + "}";
          }
        }

        return str;
      }
    }, {
      key: "getGetter",
      value: function getGetter(propertyPath) {
        var getter = Element.PROP_GETTERS.get(propertyPath);

        if (!getter) {
          getter = new Function('obj', 'return obj.' + propertyPath);
          Element.PROP_GETTERS.set(propertyPath, getter);
        }

        return getter;
      }
    }, {
      key: "getSetter",
      value: function getSetter(propertyPath) {
        var setter = Element.PROP_SETTERS.get(propertyPath);

        if (!setter) {
          setter = new Function('obj', 'v', 'obj.' + propertyPath + ' = v');
          Element.PROP_SETTERS.set(propertyPath, setter);
        }

        return setter;
      }
    }, {
      key: "isColorProperty",
      value: function isColorProperty(property) {
        return property.toLowerCase().indexOf("color") >= 0;
      }
    }, {
      key: "getMerger",
      value: function getMerger(property) {
        if (Element.isColorProperty(property)) {
          return StageUtils.mergeColors;
        } else {
          return StageUtils.mergeNumbers;
        }
      }
    }]);

    return Element;
  }(); // This gives a slight performance benefit compared to extending EventEmitter.
  EventEmitter.addAsMixin(Element);
  Element.prototype.isElement = 1;
  Element.id = 1; // Getters reused when referencing element (subobject) properties by a property path, as used in a transition or animation ('x', 'texture.x', etc).

  Element.PROP_GETTERS = new Map(); // Setters reused when referencing element (subobject) properties by a property path, as used in a transition or animation ('x', 'texture.x', etc).

  Element.PROP_SETTERS = new Map();

  var StateMachine =
  /*#__PURE__*/
  function () {
    function StateMachine() {
      _classCallCheck(this, StateMachine);

      StateMachine.setupStateMachine(this);
    }

    _createClass(StateMachine, [{
      key: "fire",

      /**
       * Calls the specified method if it exists.
       * @param {string} event
       * @param {*...} args
       */
      value: function fire(event) {
        if (this._hasMethod(event)) {
          for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
            args[_key - 1] = arguments[_key];
          }

          return this[event].apply(this, args);
        }
      }
      /**
       * Returns the current state path (for example "Initialized.Loading").
       * @returns {string}
       * @protected
       */

    }, {
      key: "_getState",
      value: function _getState() {
        return this._state.__path;
      }
      /**
       * Returns true iff statePath is (an ancestor of) currentStatePath.
       * @param {string} statePath
       * @param {string} currentStatePath
       * @returns {Boolean}
       * @protected
       */

    }, {
      key: "_inState",
      value: function _inState(statePath) {
        var currentStatePath = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this._state.__path;

        var state = this._sm.getStateByPath(statePath);

        var currentState = this._sm.getStateByPath(currentStatePath);

        var level = state.__level;

        var stateAtLevel = StateMachine._getStateAtLevel(currentState, level);

        return stateAtLevel === state;
      }
      /**
       * Returns true if the specified class member is defined for the currently set state.
       * @param {string} name
       * @returns {boolean}
       * @protected
       */

    }, {
      key: "_hasMember",
      value: function _hasMember(name) {
        return !!this.constructor.prototype[name];
      }
      /**
       * Returns true if the specified class member is a method for the currently set state.
       * @param {string} name
       * @returns {boolean}
       * @protected
       */

    }, {
      key: "_hasMethod",
      value: function _hasMethod(name) {
        var member = this.constructor.prototype[name];
        return !!member && typeof member === "function";
      }
      /**
       * Switches to the specified state.
       * @param {string} statePath
       *   Substates are seperated by a underscores (for example "Initialized.Loading").
       * @param {*[]} [args]
       *   Args that are supplied in $enter and $exit events.
       * @protected
       */

    }, {
      key: "_setState",
      value: function _setState(statePath, args) {
        var setStateId = ++this._setStateCounter;
        this._setStateId = setStateId;

        if (this._state.__path !== statePath) {
          // Performance optimization.
          var newState = this._sm._stateMap[statePath];

          if (!newState) {
            // Check for super state.
            newState = this._sm.getStateByPath(statePath);
          }

          var prevState = this._state;
          var hasDifferentEnterMethod = newState.prototype.$enter !== this._state.prototype.$enter;
          var hasDifferentExitMethod = newState.prototype.$exit !== this._state.prototype.$exit;

          if (hasDifferentEnterMethod || hasDifferentExitMethod) {
            var sharedState = StateMachine._getSharedState(this._state, newState);

            var context = {
              newState: newState.__path,
              prevState: prevState.__path,
              sharedState: sharedState.__path
            };
            var sharedLevel = sharedState.__level;

            if (hasDifferentExitMethod) {
              var exitStates = StateMachine._getStatesUntilLevel(this._state, sharedLevel);

              for (var i = 0, n = exitStates.length; i < n; i++) {
                this.__setState(exitStates[i]);

                this._callExit(this._state, args, context);

                var stateChangeOverridden = this._setStateId !== setStateId;

                if (stateChangeOverridden) {
                  return;
                }
              }
            }

            if (hasDifferentEnterMethod) {
              var enterStates = StateMachine._getStatesUntilLevel(newState, sharedLevel).reverse();

              for (var _i = 0, _n = enterStates.length; _i < _n; _i++) {
                this.__setState(enterStates[_i]);

                this._callEnter(this._state, args, context);

                var _stateChangeOverridden = this._setStateId !== setStateId;

                if (_stateChangeOverridden) {
                  return;
                }
              }
            }
          }

          this.__setState(newState);

          if (this._changedState) {
            var _context = {
              newState: newState.__path,
              prevState: prevState.__path
            };

            if (args) {
              this._changedState.apply(this, [_context].concat(_toConsumableArray(args)));
            } else {
              this._changedState(_context);
            }
          }

          if (this._onStateChange) {
            var _context2 = {
              newState: newState.__path,
              prevState: prevState.__path
            };

            this._onStateChange(_context2);
          }
        }
      }
    }, {
      key: "_callEnter",
      value: function _callEnter(state) {
        var args = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
        var context = arguments.length > 2 ? arguments[2] : undefined;
        var hasParent = !!state.__parent;

        if (state.prototype.$enter) {
          if (!hasParent || state.__parent.prototype.$enter !== state.prototype.$enter) {
            state.prototype.$enter.apply(this, [context].concat(_toConsumableArray(args)));
          }
        }
      }
    }, {
      key: "_callExit",
      value: function _callExit(state) {
        var args = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
        var context = arguments.length > 2 ? arguments[2] : undefined;
        var hasParent = !!state.__parent;

        if (state.prototype.$exit) {
          if (!hasParent || state.__parent.prototype.$exit !== state.prototype.$exit) {
            state.prototype.$exit.apply(this, [context].concat(_toConsumableArray(args)));
          }
        }
      }
    }, {
      key: "__setState",
      value: function __setState(state) {
        this._state = state;
        this._stateIndex = state.__index;
        this.constructor = state;
      }
    }, {
      key: "_initStateMachine",
      value: function _initStateMachine() {
        this._state = null;
        this._stateIndex = 0;
        this._setStateCounter = 0;
        this._sm = this._routedType._sm;

        this.__setState(this._sm.getStateByPath(""));

        var context = {
          newState: "",
          prevState: undefined,
          sharedState: undefined
        };

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

    }, {
      key: "_getMostSpecificHandledMember",
      value: function _getMostSpecificHandledMember(memberNames) {
        var cur = this._state;

        do {
          for (var i = 0, n = memberNames.length; i < n; i++) {
            var memberName = memberNames[i];

            if (!cur.__parent) {
              if (cur.prototype[memberName]) {
                return memberName;
              }
            } else {
              var alias = StateMachineType.getStateMemberAlias(cur.__path, memberName);

              if (this[alias]) {
                return memberName;
              }
            }
          }

          cur = cur.__parent;
        } while (cur);
      }
    }], [{
      key: "setupStateMachine",
      value: function setupStateMachine(target) {
        var targetConstructor = target.constructor;
        var router = StateMachine.create(targetConstructor);
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

    }, {
      key: "create",
      value: function create(type) {
        if (!type.hasOwnProperty('_sm')) {
          // Only need to run once.
          var stateMachineType = new StateMachineType(type);
          type._sm = stateMachineType;
        }

        return type._sm.router;
      }
    }, {
      key: "_getStatesUntilLevel",
      value: function _getStatesUntilLevel(state, level) {
        var states = [];

        while (state.__level > level) {
          states.push(state);
          state = state.__parent;
        }

        return states;
      }
    }, {
      key: "_getSharedState",
      value: function _getSharedState(state1, state2) {
        var state1Array = StateMachine._getAncestorStates(state1);

        var state2Array = StateMachine._getAncestorStates(state2);

        var n = Math.min(state1Array.length, state2Array.length);

        for (var i = 0; i < n; i++) {
          if (state1Array[i] !== state2Array[i]) {
            return state1Array[i - 1];
          }
        }

        return state1Array[n - 1];
      }
    }, {
      key: "_getAncestorStates",
      value: function _getAncestorStates(state) {
        var result = [];

        do {
          result.push(state);
        } while (state = state.__parent);

        return result.reverse();
      }
    }, {
      key: "_getStateAtLevel",
      value: function _getStateAtLevel(state, level) {
        if (level > state.__level) {
          return undefined;
        }

        while (level < state.__level) {
          state = state.__parent;
        }

        return state;
      }
    }]);

    return StateMachine;
  }();

  var StateMachineType =
  /*#__PURE__*/
  function () {
    function StateMachineType(type) {
      _classCallCheck(this, StateMachineType);

      this._type = type;
      this._router = null;
      this.init();
    }

    _createClass(StateMachineType, [{
      key: "init",
      value: function init() {
        this._router = this._createRouter();
        this._stateMap = this._getStateMap();

        this._addStateMemberDelegatorsToRouter();
      }
    }, {
      key: "_createRouter",
      value: function _createRouter() {
        var type = this._type;

        var router =
        /*#__PURE__*/
        function (_type) {
          _inherits(StateMachineRouter, _type);

          function StateMachineRouter() {
            var _this;

            _classCallCheck(this, StateMachineRouter);

            _this = _possibleConstructorReturn(this, _getPrototypeOf(StateMachineRouter).apply(this, arguments));

            if (!_this.constructor.hasOwnProperty('_isRouter')) {
              throw new Error(`You need to extend ${type.name}.original instead of ${type.name}.`);
            }

            return _this;
          }

          return StateMachineRouter;
        }(type);

        router._isRouter = true;
        router.prototype._routedType = type;
        router.original = type;

        this._mixinStateMachineMethods(router);

        return router;
      }
    }, {
      key: "_mixinStateMachineMethods",
      value: function _mixinStateMachineMethods(router) {
        // Mixin the state machine methods, so that we reuse the methods instead of re-creating them.
        var names = Object.getOwnPropertyNames(StateMachine.prototype);

        for (var i = 0, n = names.length; i < n; i++) {
          var name = names[i];

          if (name !== "constructor") {
            var descriptor = Object.getOwnPropertyDescriptor(StateMachine.prototype, name);
            Object.defineProperty(router.prototype, name, descriptor);
          }
        }
      }
    }, {
      key: "_addStateMemberDelegatorsToRouter",
      value: function _addStateMemberDelegatorsToRouter() {
        var _this2 = this;

        var members = this._getAllMemberNames();

        members.forEach(function (member) {
          _newArrowCheck(this, _this2);

          this._addMemberRouter(member);
        }.bind(this));
      }
      /**
       * @note We are generating code because it yields much better performance.
       */

    }, {
      key: "_addMemberRouter",
      value: function _addMemberRouter(member) {
        var _this3 = this;

        var statePaths = Object.keys(this._stateMap);
        var descriptors = [];
        var aliases = [];
        statePaths.forEach(function (statePath, index) {
          _newArrowCheck(this, _this3);

          var state = this._stateMap[statePath];

          var descriptor = this._getDescriptor(state, member);

          if (descriptor) {
            descriptors[index] = descriptor; // Add to prototype.

            var alias = StateMachineType.getStateMemberAlias(descriptor._source.__path, member);
            aliases[index] = alias;

            if (!this._router.prototype.hasOwnProperty(alias)) {
              Object.defineProperty(this._router.prototype, alias, descriptor);
            }
          } else {
            descriptors[index] = null;
            aliases[index] = null;
          }
        }.bind(this));
        var type = undefined;
        descriptors.forEach(function (descriptor) {
          _newArrowCheck(this, _this3);

          if (descriptor) {
            var descType = this._getDescriptorType(descriptor);

            if (type && type !== descType) {
              console.warn(`Member ${member} in ${this._type.name} has inconsistent types.`);
              return;
            }

            type = descType;
          }
        }.bind(this));

        switch (type) {
          case "method":
            this._addMethodRouter(member, descriptors, aliases);

            break;

          case "getter":
            this._addGetterSetterRouters(member);

            break;

          case "property":
            console.warn("Fixed properties are not supported; please use a getter instead!");
            break;
        }
      }
    }, {
      key: "_getDescriptor",
      value: function _getDescriptor(state, member) {
        var _this4 = this;

        var isValid = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : function () {
          _newArrowCheck(this, _this4);

          return true;
        }.bind(this);
        var type = state;
        var curState = state;

        do {
          var descriptor = Object.getOwnPropertyDescriptor(type.prototype, member);

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
        } while (type && type.prototype);

        return undefined;
      }
    }, {
      key: "_getDescriptorType",
      value: function _getDescriptorType(descriptor) {
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
    }, {
      key: "_addMethodRouter",
      value: function _addMethodRouter(member, descriptors, aliases) {
        var code = [// The line ensures that, while debugging, your IDE won't open many tabs.
        "//@ sourceURL=StateMachineRouter.js", "const i = this._stateIndex;"];
        var cur = aliases[0];

        var supportsSpread = StateMachineType._supportsSpread();

        for (var i = 1, n = aliases.length; i < n; i++) {
          var alias = aliases[i];

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

        var functionBody = code.join("\n");
        var router = new Function([], functionBody);
        var descriptor = {
          value: router
        };
        Object.defineProperty(this._router.prototype, member, descriptor);
      }
    }, {
      key: "_addGetterSetterRouters",
      value: function _addGetterSetterRouters(member) {
        var getter = this._getGetterRouter(member);

        var setter = this._getSetterRouter(member);

        var descriptor = {
          get: getter,
          set: setter
        };
        Object.defineProperty(this._router.prototype, member, descriptor);
      }
    }, {
      key: "_getGetterRouter",
      value: function _getGetterRouter(member) {
        var _this5 = this;

        var statePaths = Object.keys(this._stateMap);
        var descriptors = [];
        var aliases = [];
        statePaths.forEach(function (statePath, index) {
          var _this6 = this;

          _newArrowCheck(this, _this5);

          var state = this._stateMap[statePath];

          var descriptor = this._getDescriptor(state, member, function (descriptor) {
            _newArrowCheck(this, _this6);

            return descriptor.get;
          }.bind(this));

          if (descriptor) {
            descriptors[index] = descriptor; // Add to prototype.

            var alias = StateMachineType.getStateMemberAlias(descriptor._source.__path, member);
            aliases[index] = alias;

            if (!this._router.prototype.hasOwnProperty(alias)) {
              Object.defineProperty(this._router.prototype, alias, descriptor);
            }
          } else {
            descriptors[index] = null;
            aliases[index] = null;
          }
        }.bind(this));
        var code = [// The line ensures that, while debugging, your IDE won't open many tabs.
        "//@ sourceURL=StateMachineRouter.js", "const i = this._stateIndex;"];
        var cur = aliases[0];

        for (var i = 1, n = aliases.length; i < n; i++) {
          var alias = aliases[i];

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

        var functionBody = code.join("\n");
        var router = new Function([], functionBody);
        return router;
      }
    }, {
      key: "_getSetterRouter",
      value: function _getSetterRouter(member) {
        var _this7 = this;

        var statePaths = Object.keys(this._stateMap);
        var descriptors = [];
        var aliases = [];
        statePaths.forEach(function (statePath, index) {
          var _this8 = this;

          _newArrowCheck(this, _this7);

          var state = this._stateMap[statePath];

          var descriptor = this._getDescriptor(state, member, function (descriptor) {
            _newArrowCheck(this, _this8);

            return descriptor.set;
          }.bind(this));

          if (descriptor) {
            descriptors[index] = descriptor; // Add to prototype.

            var alias = StateMachineType.getStateMemberAlias(descriptor._source.__path, member);
            aliases[index] = alias;

            if (!this._router.prototype.hasOwnProperty(alias)) {
              Object.defineProperty(this._router.prototype, alias, descriptor);
            }
          } else {
            descriptors[index] = null;
            aliases[index] = null;
          }
        }.bind(this));
        var code = [// The line ensures that, while debugging, your IDE won't open many tabs.
        "//@ sourceURL=StateMachineRouter.js", "const i = this._stateIndex;"];
        var cur = aliases[0];

        for (var i = 1, n = aliases.length; i < n; i++) {
          var alias = aliases[i];

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

        var functionBody = code.join("\n");
        var router = new Function(["arg"], functionBody);
        return router;
      }
    }, {
      key: "_getAllMemberNames",
      value: function _getAllMemberNames() {
        var _this9 = this;

        var stateMap = this._stateMap;
        var map = Object.keys(stateMap);
        var members = new Set();
        map.forEach(function (statePath) {
          var _this10 = this;

          _newArrowCheck(this, _this9);

          if (statePath === "") {
            // Root state can be skipped: if the method only occurs in the root state, we don't need to re-delegate it based on state.
            return;
          }

          var state = stateMap[statePath];

          var names = this._getStateMemberNames(state);

          names.forEach(function (name) {
            _newArrowCheck(this, _this10);

            members.add(name);
          }.bind(this));
        }.bind(this));
        return _toConsumableArray(members);
      }
    }, {
      key: "_getStateMemberNames",
      value: function _getStateMemberNames(state) {
        var _this11 = this;

        var type = state;
        var members = new Set();
        var isRoot = this._type === state;

        do {
          var names = this._getStateMemberNamesForType(type);

          names.forEach(function (name) {
            _newArrowCheck(this, _this11);

            members.add(name);
          }.bind(this));
          type = Object.getPrototypeOf(type);
        } while (type && type.prototype && (!type.hasOwnProperty("__state") || isRoot));

        return members;
      }
    }, {
      key: "_getStateMemberNamesForType",
      value: function _getStateMemberNamesForType(type) {
        var _this12 = this;

        var memberNames = Object.getOwnPropertyNames(type.prototype);
        return memberNames.filter(function (memberName) {
          _newArrowCheck(this, _this12);

          return memberName !== "constructor" && !StateMachineType._isStateLocalMember(memberName);
        }.bind(this));
      }
    }, {
      key: "getStateByPath",
      value: function getStateByPath(statePath) {
        if (this._stateMap[statePath]) {
          return this._stateMap[statePath];
        } // Search for closest match.


        var parts = statePath.split(".");

        while (parts.pop()) {
          var _statePath = parts.join(".");

          if (this._stateMap[_statePath]) {
            return this._stateMap[_statePath];
          }
        }
      }
    }, {
      key: "_getStateMap",
      value: function _getStateMap() {
        if (!this._stateMap) {
          this._stateMap = this._createStateMap();
        }

        return this._stateMap;
      }
    }, {
      key: "_createStateMap",
      value: function _createStateMap() {
        var stateMap = {};

        this._addState(this._type, null, "", stateMap);

        return stateMap;
      }
    }, {
      key: "_addState",
      value: function _addState(state, parentState, name, stateMap) {
        var _this13 = this;

        state.__state = true;
        state.__name = name;

        this._addStaticStateProperty(state, parentState);

        var parentPath = parentState ? parentState.__path : "";
        var path = (parentPath ? parentPath + "." : "") + name;
        state.__path = path;
        state.__level = parentState ? parentState.__level + 1 : 0;
        state.__parent = parentState;
        state.__index = Object.keys(stateMap).length;
        stateMap[path] = state;
        var states = state._states;

        if (states) {
          var isInheritedFromParent = parentState && parentState._states === states;

          if (!isInheritedFromParent) {
            var subStates = state._states();

            subStates.forEach(function (subState) {
              _newArrowCheck(this, _this13);

              var stateName = StateMachineType._getStateName(subState);

              this._addState(subState, state, stateName, stateMap);
            }.bind(this));
          }
        }
      }
    }, {
      key: "_addStaticStateProperty",
      value: function _addStaticStateProperty(state, parentState) {
        if (parentState) {
          var isClassStateLevel = parentState && !parentState.__parent;

          if (isClassStateLevel) {
            this._router[state.__name] = state;
          } else {
            parentState[state.__name] = state;
          }
        }
      }
    }, {
      key: "router",
      get: function get() {
        return this._router;
      }
    }], [{
      key: "_supportsSpread",
      value: function _supportsSpread() {
        if (this.__supportsSpread === undefined) {
          this.__supportsSpread = false;

          try {
            var func = new Function("return [].concat(...arguments);");
            func();
            this.__supportsSpread = true;
          } catch (e) {}
        }

        return this.__supportsSpread;
      }
    }, {
      key: "getStateMemberAlias",
      value: function getStateMemberAlias(path, member) {
        return "$" + (path ? path + "." : "") + member;
      }
    }, {
      key: "_isStateLocalMember",
      value: function _isStateLocalMember(memberName) {
        return memberName === "$enter" || memberName === "$exit";
      }
    }, {
      key: "_getStateName",
      value: function _getStateName(state) {
        var name = state.name;
        var index = name.indexOf('$');

        if (index > 0) {
          // Strip off rollup name suffix.
          return name.substr(0, index);
        }

        return name;
      }
    }]);

    return StateMachineType;
  }();

  /**
   * @extends StateMachine
   */

  var Component =
  /*#__PURE__*/
  function (_Element) {
    _inherits(Component, _Element);

    function Component(stage, properties) {
      var _this;

      _classCallCheck(this, Component);

      _this = _possibleConstructorReturn(this, _getPrototypeOf(Component).call(this, stage)); // Encapsulate tags to prevent leaking.

      _this.tagRoot = true;

      if (Utils.isObjectLiteral(properties)) {
        Object.assign(_assertThisInitialized(_this), properties);
      }

      _this.__initialized = false;
      _this.__firstActive = false;
      _this.__firstEnable = false;
      _this.__signals = undefined;
      _this.__passSignals = undefined;

      _this.__construct(); // Quick-apply template.


      var func = _this.constructor.getTemplateFunc();

      func.f(_assertThisInitialized(_this), func.a);

      _this._build();

      return _this;
    }

    _createClass(Component, [{
      key: "__start",
      value: function __start() {
        StateMachine.setupStateMachine(this);
        this._onStateChange = Component.prototype.__onStateChange;
      }
    }, {
      key: "__onStateChange",
      value: function __onStateChange() {
        /* FIXME: Workaround for case, where application was shut but component still lives */
        if (this.application) {
          this.application.updateFocusPath();
        }
      }
    }, {
      key: "_refocus",
      value: function _refocus() {
        /* FIXME: Workaround for case, where application was shut but component still lives */
        if (this.application) {
          this.application.updateFocusPath();
        }
      }
      /**
       * Returns a high-performance template patcher.
       */

    }, {
      key: "_onSetup",
      value: function _onSetup() {
        if (!this.__initialized) {
          this._setup();
        }
      }
    }, {
      key: "_setup",
      value: function _setup() {}
    }, {
      key: "_onAttach",
      value: function _onAttach() {
        if (!this.__initialized) {
          this.__init();

          this.__initialized = true;
        }

        this._attach();
      }
    }, {
      key: "_attach",
      value: function _attach() {}
    }, {
      key: "_onDetach",
      value: function _onDetach() {
        this._detach();
      }
    }, {
      key: "_detach",
      value: function _detach() {}
    }, {
      key: "_onEnabled",
      value: function _onEnabled() {
        if (!this.__firstEnable) {
          this._firstEnable();

          this.__firstEnable = true;
        }

        this._enable();
      }
    }, {
      key: "_firstEnable",
      value: function _firstEnable() {}
    }, {
      key: "_enable",
      value: function _enable() {}
    }, {
      key: "_onDisabled",
      value: function _onDisabled() {
        this._disable();
      }
    }, {
      key: "_disable",
      value: function _disable() {}
    }, {
      key: "_onActive",
      value: function _onActive() {
        if (!this.__firstActive) {
          this._firstActive();

          this.__firstActive = true;
        }

        this._active();
      }
    }, {
      key: "_firstActive",
      value: function _firstActive() {}
    }, {
      key: "_active",
      value: function _active() {}
    }, {
      key: "_onInactive",
      value: function _onInactive() {
        this._inactive();
      }
    }, {
      key: "_inactive",
      value: function _inactive() {}
    }, {
      key: "__construct",
      value: function __construct() {
        this._construct();
      }
    }, {
      key: "_construct",
      value: function _construct$$1() {}
    }, {
      key: "_build",
      value: function _build() {}
    }, {
      key: "__init",
      value: function __init() {
        this._init();
      }
    }, {
      key: "_init",
      value: function _init() {}
    }, {
      key: "_focus",
      value: function _focus(newTarget, prevTarget) {}
    }, {
      key: "_unfocus",
      value: function _unfocus(newTarget) {}
    }, {
      key: "_focusChange",
      value: function _focusChange(target, newTarget) {}
    }, {
      key: "_getFocused",
      value: function _getFocused() {
        // Override to delegate focus to child components.
        return this;
      }
    }, {
      key: "_setFocusSettings",
      value: function _setFocusSettings(settings) {// Override to add custom settings. See Application._handleFocusSettings().
      }
    }, {
      key: "_handleFocusSettings",
      value: function _handleFocusSettings(settings) {// Override to react on custom settings. See Application._handleFocusSettings().
      }
    }, {
      key: "hasFinalFocus",
      value: function hasFinalFocus() {
        var path = this.application._focusPath;
        return path && path.length && path[path.length - 1] === this;
      }
    }, {
      key: "hasFocus",
      value: function hasFocus() {
        var path = this.application._focusPath;
        return path && path.indexOf(this) >= 0;
      }
    }, {
      key: "seekAncestorByType",
      value: function seekAncestorByType(type) {
        var c = this.cparent;

        while (c) {
          if (c.constructor === type) {
            return c;
          }

          c = c.cparent;
        }
      }
    }, {
      key: "getSharedAncestorComponent",
      value: function getSharedAncestorComponent(element) {
        var ancestor = this.getSharedAncestor(element);

        while (ancestor && !ancestor.isComponent) {
          ancestor = ancestor.parent;
        }

        return ancestor;
      }
    }, {
      key: "signal",

      /**
       * Signals the parent of the specified event.
       * A parent/ancestor that wishes to handle the signal should set the 'signals' property on this component.
       * @param {string} event
       * @param {...*} args
       */
      value: function signal(event) {
        for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
          args[_key - 1] = arguments[_key];
        }

        return this._signal(event, args);
      }
    }, {
      key: "_signal",
      value: function _signal(event, args) {
        var signalParent = this._getParentSignalHandler();

        if (signalParent) {
          if (this.__signals) {
            var fireEvent = this.__signals[event];

            if (fireEvent === false) {
              // Ignore event.
              return;
            }

            if (fireEvent) {
              if (fireEvent === true) {
                fireEvent = event;
              }

              if (signalParent._hasMethod(fireEvent)) {
                return signalParent[fireEvent].apply(signalParent, _toConsumableArray(args));
              }
            }
          }

          var passSignal = this.__passSignals && this.__passSignals[event];

          if (passSignal) {
            // Bubble up.
            if (passSignal && passSignal !== true) {
              // Replace signal name.
              event = passSignal;
            }

            return signalParent._signal(event, args);
          }
        }
      }
    }, {
      key: "_getParentSignalHandler",
      value: function _getParentSignalHandler() {
        return this.cparent ? this.cparent._getSignalHandler() : null;
      }
    }, {
      key: "_getSignalHandler",
      value: function _getSignalHandler() {
        if (this._signalProxy) {
          return this.cparent ? this.cparent._getSignalHandler() : null;
        }

        return this;
      }
    }, {
      key: "fireAncestors",
      value: function fireAncestors(name) {
        if (!name.startsWith('$')) {
          throw new Error("Ancestor event name must be prefixed by dollar sign.");
        }

        var parent = this._getParentSignalHandler();

        if (parent) {
          for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
            args[_key2 - 1] = arguments[_key2];
          }

          return parent._doFireAncestors(name, args);
        }
      }
    }, {
      key: "_doFireAncestors",
      value: function _doFireAncestors(name, args) {
        if (this._hasMethod(name)) {
          return this.fire.apply(this, [name].concat(_toConsumableArray(args)));
        } else {
          var signalParent = this._getParentSignalHandler();

          if (signalParent) {
            return signalParent._doFireAncestors(name, args);
          }
        }
      }
    }, {
      key: "state",
      get: function get() {
        return this._getState();
      }
    }, {
      key: "application",
      get: function get() {
        return this.stage.application;
      }
    }, {
      key: "cparent",
      get: function get() {
        return Component.getParent(this);
      }
    }, {
      key: "signals",
      get: function get() {
        return this.__signals;
      },
      set: function set(v) {
        if (!Utils.isObjectLiteral(v)) {
          this._throwError("Signals: specify an object with signal-to-fire mappings");
        }

        this.__signals = v;
      }
    }, {
      key: "alterSignals",
      set: function set(v) {
        if (!Utils.isObjectLiteral(v)) {
          this._throwError("Signals: specify an object with signal-to-fire mappings");
        }

        if (!this.__signals) {
          this.__signals = {};
        }

        for (var key in v) {
          var d = v[key];

          if (d === undefined) {
            delete this.__signals[key];
          } else {
            this.__signals[key] = v;
          }
        }
      }
    }, {
      key: "passSignals",
      get: function get() {
        return this.__passSignals || {};
      },
      set: function set(v) {
        this.__passSignals = Object.assign(this.__passSignals || {}, v);
      }
    }, {
      key: "alterPassSignals",
      set: function set(v) {
        if (!Utils.isObjectLiteral(v)) {
          this._throwError("Signals: specify an object with signal-to-fire mappings");
        }

        if (!this.__passSignals) {
          this.__passSignals = {};
        }

        for (var key in v) {
          var d = v[key];

          if (d === undefined) {
            delete this.__passSignals[key];
          } else {
            this.__passSignals[key] = v;
          }
        }
      }
    }, {
      key: "_signalProxy",
      get: function get() {
        return false;
      }
    }], [{
      key: "getTemplateFunc",
      value: function getTemplateFunc() {
        // We need a different template function per patch id.
        var name = "_templateFunc"; // Be careful with class-based static inheritance.

        var hasName = '__has' + name;

        if (this[hasName] !== this) {
          this[hasName] = this;
          this[name] = this.parseTemplate(this._template());
        }

        return this[name];
      }
    }, {
      key: "parseTemplate",
      value: function parseTemplate(obj) {
        var context = {
          loc: [],
          store: [],
          rid: 0
        };
        this.parseTemplateRec(obj, context, "element");
        var code = context.loc.join(";\n");
        var f = new Function("element", "store", code);
        return {
          f: f,
          a: context.store
        };
      }
    }, {
      key: "parseTemplateRec",
      value: function parseTemplateRec(obj, context, cursor) {
        var _this2 = this;

        var store = context.store;
        var loc = context.loc;
        var keys = Object.keys(obj);
        keys.forEach(function (key) {
          _newArrowCheck(this, _this2);

          var value = obj[key];

          if (Utils.isUcChar(key.charCodeAt(0))) {
            // Value must be expanded as well.
            if (Utils.isObjectLiteral(value)) {
              // Ref.
              var childCursor = `r${key.replace(/[^a-z0-9]/gi, "") + context.rid}`;
              var type = value.type ? value.type : Element;

              if (type === Element) {
                loc.push(`const ${childCursor} = element.stage.createElement()`);
              } else {
                store.push(type);
                loc.push(`const ${childCursor} = new store[${store.length - 1}](${cursor}.stage)`);
              }

              loc.push(`${childCursor}.ref = "${key}"`);
              context.rid++; // Enter sub.

              this.parseTemplateRec(value, context, childCursor);
              loc.push(`${cursor}.childList.add(${childCursor})`);
            } else if (Utils.isObject(value)) {
              // Dynamic assignment.
              store.push(value);
              loc.push(`${cursor}.childList.add(store[${store.length - 1}])`);
            }
          } else {
            if (key === "text") {
              var propKey = cursor + "__text";
              loc.push(`const ${propKey} = ${cursor}.enableTextTexture()`);
              this.parseTemplatePropRec(value, context, propKey);
            } else if (key === "texture" && Utils.isObjectLiteral(value)) {
              var _propKey = cursor + "__texture";

              var _type = value.type;

              if (_type) {
                store.push(_type);
                loc.push(`const ${_propKey} = new store[${store.length - 1}](${cursor}.stage)`);
                this.parseTemplatePropRec(value, context, _propKey);
                loc.push(`${cursor}["${key}"] = ${_propKey}`);
              } else {
                loc.push(`${_propKey} = ${cursor}.texture`);
                this.parseTemplatePropRec(value, context, _propKey);
              }
            } else {
              // Property;
              if (Utils.isNumber(value)) {
                loc.push(`${cursor}["${key}"] = ${value}`);
              } else if (Utils.isBoolean(value)) {
                loc.push(`${cursor}["${key}"] = ${value ? "true" : "false"}`);
              } else if (Utils.isObject(value) || Array.isArray(value)) {
                // Dynamic assignment.
                // Because literal objects may contain dynamics, we store the full object.
                store.push(value);
                loc.push(`${cursor}["${key}"] = store[${store.length - 1}]`);
              } else {
                // String etc.
                loc.push(`${cursor}["${key}"] = ${JSON.stringify(value)}`);
              }
            }
          }
        }.bind(this));
      }
    }, {
      key: "parseTemplatePropRec",
      value: function parseTemplatePropRec(obj, context, cursor) {
        var _this3 = this;

        var store = context.store;
        var loc = context.loc;
        var keys = Object.keys(obj);
        keys.forEach(function (key) {
          _newArrowCheck(this, _this3);

          if (key !== "type") {
            var value = obj[key];

            if (Utils.isNumber(value)) {
              loc.push(`${cursor}["${key}"] = ${value}`);
            } else if (Utils.isBoolean(value)) {
              loc.push(`${cursor}["${key}"] = ${value ? "true" : "false"}`);
            } else if (Utils.isObject(value) || Array.isArray(value)) {
              // Dynamic assignment.
              // Because literal objects may contain dynamics, we store the full object.
              store.push(value);
              loc.push(`${cursor}["${key}"] = store[${store.length - 1}]`);
            } else {
              // String etc.
              loc.push(`${cursor}["${key}"] = ${JSON.stringify(value)}`);
            }
          }
        }.bind(this));
      }
    }, {
      key: "_template",
      value: function _template() {
        return {};
      }
    }, {
      key: "collectSubComponents",
      value: function collectSubComponents(subs, element) {
        if (element.hasChildren()) {
          var childList = element.__childList;

          for (var i = 0, n = childList.length; i < n; i++) {
            var child = childList.getAt(i);

            if (child.isComponent) {
              subs.push(child);
            } else {
              Component.collectSubComponents(subs, child);
            }
          }
        }
      }
    }, {
      key: "getComponent",
      value: function getComponent(element) {
        var parent = element;

        while (parent && !parent.isComponent) {
          parent = parent.parent;
        }

        return parent;
      }
    }, {
      key: "getParent",
      value: function getParent(element) {
        return Component.getComponent(element.parent);
      }
    }]);

    return Component;
  }(Element);
  Component.prototype.isComponent = true;

  var CoreQuadList =
  /*#__PURE__*/
  function () {
    function CoreQuadList(ctx) {
      _classCallCheck(this, CoreQuadList);

      this.ctx = ctx;
      this.quadTextures = [];
      this.quadElements = [];
    }

    _createClass(CoreQuadList, [{
      key: "reset",
      value: function reset() {
        this.quadTextures = [];
        this.quadElements = [];
        this.dataLength = 0;
      }
    }, {
      key: "getElement",
      value: function getElement(index) {
        return this.quadElements[index]._element;
      }
    }, {
      key: "getElementCore",
      value: function getElementCore(index) {
        return this.quadElements[index];
      }
    }, {
      key: "getTexture",
      value: function getTexture(index) {
        return this.quadTextures[index];
      }
    }, {
      key: "getTextureWidth",
      value: function getTextureWidth(index) {
        var nativeTexture = this.quadTextures[index];

        if (nativeTexture.w) {
          // Render texture;
          return nativeTexture.w;
        } else {
          return this.quadElements[index]._displayedTextureSource.w;
        }
      }
    }, {
      key: "getTextureHeight",
      value: function getTextureHeight(index) {
        var nativeTexture = this.quadTextures[index];

        if (nativeTexture.h) {
          // Render texture;
          return nativeTexture.h;
        } else {
          return this.quadElements[index]._displayedTextureSource.h;
        }
      }
    }, {
      key: "length",
      get: function get() {
        return this.quadTextures.length;
      }
    }]);

    return CoreQuadList;
  }();

  var WebGLCoreQuadList =
  /*#__PURE__*/
  function (_CoreQuadList) {
    _inherits(WebGLCoreQuadList, _CoreQuadList);

    function WebGLCoreQuadList(ctx) {
      var _this;

      _classCallCheck(this, WebGLCoreQuadList);

      _this = _possibleConstructorReturn(this, _getPrototypeOf(WebGLCoreQuadList).call(this, ctx)); // Allocate a fairly big chunk of memory that should be enough to support ~100000 (default) quads.
      // We do not (want to) handle memory overflow.

      var byteSize = ctx.stage.getOption('bufferMemory');
      _this.dataLength = 0;
      _this.data = new ArrayBuffer(byteSize);
      _this.floats = new Float32Array(_this.data);
      _this.uints = new Uint32Array(_this.data);
      return _this;
    }

    _createClass(WebGLCoreQuadList, [{
      key: "getAttribsDataByteOffset",
      value: function getAttribsDataByteOffset(index) {
        // Where this quad can be found in the attribs buffer.
        return index * 80;
      }
    }, {
      key: "getQuadContents",
      value: function getQuadContents() {
        // Debug: log contents of quad buffer.
        var floats = this.floats;
        var uints = this.uints;
        var lines = [];

        for (var i = 1; i <= this.length; i++) {
          var str = 'entry ' + i + ': ';

          for (var j = 0; j < 4; j++) {
            var b = i * 20 + j * 4;
            str += floats[b] + ',' + floats[b + 1] + ':' + floats[b + 2] + ',' + floats[b + 3] + '[' + uints[b + 4].toString(16) + '] ';
          }

          lines.push(str);
        }

        return lines;
      }
    }]);

    return WebGLCoreQuadList;
  }(CoreQuadList);

  var CoreQuadOperation =
  /*#__PURE__*/
  function () {
    function CoreQuadOperation(ctx, shader, shaderOwner, renderTextureInfo, scissor, index) {
      _classCallCheck(this, CoreQuadOperation);

      this.ctx = ctx;
      this.shader = shader;
      this.shaderOwner = shaderOwner;
      this.renderTextureInfo = renderTextureInfo;
      this.scissor = scissor;
      this.index = index;
      this.length = 0;
    }

    _createClass(CoreQuadOperation, [{
      key: "getTexture",
      value: function getTexture(index) {
        return this.quads.getTexture(this.index + index);
      }
    }, {
      key: "getElementCore",
      value: function getElementCore(index) {
        return this.quads.getElementCore(this.index + index);
      }
    }, {
      key: "getElement",
      value: function getElement(index) {
        return this.quads.getElement(this.index + index);
      }
    }, {
      key: "getElementWidth",
      value: function getElementWidth(index) {
        return this.getElement(index).renderWidth;
      }
    }, {
      key: "getElementHeight",
      value: function getElementHeight(index) {
        return this.getElement(index).renderHeight;
      }
    }, {
      key: "getTextureWidth",
      value: function getTextureWidth(index) {
        return this.quads.getTextureWidth(this.index + index);
      }
    }, {
      key: "getTextureHeight",
      value: function getTextureHeight(index) {
        return this.quads.getTextureHeight(this.index + index);
      }
    }, {
      key: "getRenderWidth",
      value: function getRenderWidth() {
        if (this.renderTextureInfo) {
          return this.renderTextureInfo.w;
        } else {
          return this.ctx.stage.w;
        }
      }
    }, {
      key: "getRenderHeight",
      value: function getRenderHeight() {
        if (this.renderTextureInfo) {
          return this.renderTextureInfo.h;
        } else {
          return this.ctx.stage.h;
        }
      }
    }, {
      key: "quads",
      get: function get() {
        return this.ctx.renderState.quads;
      }
    }]);

    return CoreQuadOperation;
  }();

  var WebGLCoreQuadOperation =
  /*#__PURE__*/
  function (_CoreQuadOperation) {
    _inherits(WebGLCoreQuadOperation, _CoreQuadOperation);

    function WebGLCoreQuadOperation(ctx, shader, shaderOwner, renderTextureInfo, scissor, index) {
      var _this;

      _classCallCheck(this, WebGLCoreQuadOperation);

      _this = _possibleConstructorReturn(this, _getPrototypeOf(WebGLCoreQuadOperation).call(this, ctx, shader, shaderOwner, renderTextureInfo, scissor, index));
      _this.extraAttribsDataByteOffset = 0;
      return _this;
    }

    _createClass(WebGLCoreQuadOperation, [{
      key: "getAttribsDataByteOffset",
      value: function getAttribsDataByteOffset(index) {
        // Where this quad can be found in the attribs buffer.
        return this.quads.getAttribsDataByteOffset(this.index + index);
      }
      /**
       * Returns the relative pixel coordinates in the shader owner to gl position coordinates in the render texture.
       * @param x
       * @param y
       * @return {number[]}
       */

    }, {
      key: "getNormalRenderTextureCoords",
      value: function getNormalRenderTextureCoords(x, y) {
        var coords = this.shaderOwner.getRenderTextureCoords(x, y);
        coords[0] /= this.getRenderWidth();
        coords[1] /= this.getRenderHeight();
        coords[0] = coords[0] * 2 - 1;
        coords[1] = 1 - coords[1] * 2;
        return coords;
      }
    }, {
      key: "getProjection",
      value: function getProjection() {
        if (this.renderTextureInfo === null) {
          return this.ctx.renderExec._projection;
        } else {
          return this.renderTextureInfo.nativeTexture.projection;
        }
      }
    }]);

    return WebGLCoreQuadOperation;
  }(CoreQuadOperation);

  var CoreRenderExecutor =
  /*#__PURE__*/
  function () {
    function CoreRenderExecutor(ctx) {
      _classCallCheck(this, CoreRenderExecutor);

      this.ctx = ctx;
      this.renderState = ctx.renderState;
      this.gl = this.ctx.stage.gl;
    }

    _createClass(CoreRenderExecutor, [{
      key: "destroy",
      value: function destroy() {}
    }, {
      key: "_reset",
      value: function _reset() {
        this._bindRenderTexture(null);

        this._setScissor(null);

        this._clearRenderTexture();
      }
    }, {
      key: "execute",
      value: function execute() {
        this._reset();

        var qops = this.renderState.quadOperations;
        var i = 0,
            n = qops.length;

        while (i < n) {
          this._processQuadOperation(qops[i]);

          i++;
        }
      }
    }, {
      key: "_processQuadOperation",
      value: function _processQuadOperation(quadOperation) {
        if (quadOperation.renderTextureInfo && quadOperation.renderTextureInfo.ignore) {
          // Ignore quad operations when we are 're-using' another texture as the render texture result.
          return;
        }

        this._setupQuadOperation(quadOperation);

        this._execQuadOperation(quadOperation);
      }
    }, {
      key: "_setupQuadOperation",
      value: function _setupQuadOperation(quadOperation) {}
    }, {
      key: "_execQuadOperation",
      value: function _execQuadOperation(op) {
        // Set render texture.
        var nativeTexture = op.renderTextureInfo ? op.renderTextureInfo.nativeTexture : null;

        if (this._renderTexture !== nativeTexture) {
          this._bindRenderTexture(nativeTexture);
        }

        if (op.renderTextureInfo && !op.renderTextureInfo.cleared) {
          this._setScissor(null);

          this._clearRenderTexture();

          op.renderTextureInfo.cleared = true;

          this._setScissor(op.scissor);
        } else {
          this._setScissor(op.scissor);
        }

        this._renderQuadOperation(op);
      }
    }, {
      key: "_renderQuadOperation",
      value: function _renderQuadOperation(op) {}
    }, {
      key: "_bindRenderTexture",
      value: function _bindRenderTexture(renderTexture) {
        this._renderTexture = renderTexture;
      }
    }, {
      key: "_clearRenderTexture",
      value: function _clearRenderTexture(renderTexture) {}
    }, {
      key: "_setScissor",
      value: function _setScissor(area) {}
    }]);

    return CoreRenderExecutor;
  }();

  var WebGLCoreRenderExecutor =
  /*#__PURE__*/
  function (_CoreRenderExecutor) {
    _inherits(WebGLCoreRenderExecutor, _CoreRenderExecutor);

    function WebGLCoreRenderExecutor(ctx) {
      var _this;

      _classCallCheck(this, WebGLCoreRenderExecutor);

      _this = _possibleConstructorReturn(this, _getPrototypeOf(WebGLCoreRenderExecutor).call(this, ctx));
      _this.gl = _this.ctx.stage.gl;

      _this.init();

      return _this;
    }

    _createClass(WebGLCoreRenderExecutor, [{
      key: "init",
      value: function init() {
        var gl = this.gl; // Create new sharable buffer for params.

        this._attribsBuffer = gl.createBuffer();
        var maxQuads = Math.floor(this.renderState.quads.data.byteLength / 80); // Init webgl arrays.

        var allIndices = new Uint16Array(maxQuads * 6); // fill the indices with the quads to draw.

        for (var i = 0, j = 0; i < maxQuads; i += 6, j += 4) {
          allIndices[i] = j;
          allIndices[i + 1] = j + 1;
          allIndices[i + 2] = j + 2;
          allIndices[i + 3] = j;
          allIndices[i + 4] = j + 2;
          allIndices[i + 5] = j + 3;
        } // The quads buffer can be (re)used to draw a range of quads.


        this._quadsBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._quadsBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, allIndices, gl.STATIC_DRAW); // The matrix that causes the [0,0 - W,H] box to map to [-1,-1 - 1,1] in the end results.

        this._projection = new Float32Array([2 / this.ctx.stage.coordsWidth, -2 / this.ctx.stage.coordsHeight]);
      }
    }, {
      key: "destroy",
      value: function destroy() {
        _get(_getPrototypeOf(WebGLCoreRenderExecutor.prototype), "destroy", this).call(this);

        this.gl.deleteBuffer(this._attribsBuffer);
        this.gl.deleteBuffer(this._quadsBuffer);
      }
    }, {
      key: "_reset",
      value: function _reset() {
        _get(_getPrototypeOf(WebGLCoreRenderExecutor.prototype), "_reset", this).call(this);

        var gl = this.gl;
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        gl.enable(gl.BLEND);
        gl.disable(gl.DEPTH_TEST);

        this._stopShaderProgram();

        this._setupBuffers();
      }
    }, {
      key: "_setupBuffers",
      value: function _setupBuffers() {
        var gl = this.gl;
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._quadsBuffer);
        var element = new Float32Array(this.renderState.quads.data, 0, this.renderState.quads.dataLength);
        gl.bindBuffer(gl.ARRAY_BUFFER, this._attribsBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, element, gl.DYNAMIC_DRAW);
      }
    }, {
      key: "_setupQuadOperation",
      value: function _setupQuadOperation(quadOperation) {
        _get(_getPrototypeOf(WebGLCoreRenderExecutor.prototype), "_setupQuadOperation", this).call(this, quadOperation);

        this._useShaderProgram(quadOperation.shader, quadOperation);
      }
    }, {
      key: "_renderQuadOperation",
      value: function _renderQuadOperation(op) {
        var shader = op.shader;

        if (op.length || op.shader.addEmpty()) {
          shader.beforeDraw(op);
          shader.draw(op);
          shader.afterDraw(op);
        }
      }
      /**
       * @param {WebGLShader} shader;
       * @param {CoreQuadOperation} operation;
       */

    }, {
      key: "_useShaderProgram",
      value: function _useShaderProgram(shader, operation) {
        if (!shader.hasSameProgram(this._currentShaderProgram)) {
          if (this._currentShaderProgram) {
            this._currentShaderProgram.stopProgram();
          }

          shader.useProgram();
          this._currentShaderProgram = shader;
        }

        shader.setupUniforms(operation);
      }
    }, {
      key: "_stopShaderProgram",
      value: function _stopShaderProgram() {
        if (this._currentShaderProgram) {
          // The currently used shader program should be stopped gracefully.
          this._currentShaderProgram.stopProgram();

          this._currentShaderProgram = null;
        }
      }
    }, {
      key: "_bindRenderTexture",
      value: function _bindRenderTexture(renderTexture) {
        _get(_getPrototypeOf(WebGLCoreRenderExecutor.prototype), "_bindRenderTexture", this).call(this, renderTexture);

        var gl = this.gl;

        if (!this._renderTexture) {
          gl.bindFramebuffer(gl.FRAMEBUFFER, null);
          gl.viewport(0, 0, this.ctx.stage.w, this.ctx.stage.h);
        } else {
          gl.bindFramebuffer(gl.FRAMEBUFFER, this._renderTexture.framebuffer);
          gl.viewport(0, 0, this._renderTexture.w, this._renderTexture.h);
        }
      }
    }, {
      key: "_clearRenderTexture",
      value: function _clearRenderTexture() {
        _get(_getPrototypeOf(WebGLCoreRenderExecutor.prototype), "_clearRenderTexture", this).call(this);

        var gl = this.gl;

        if (!this._renderTexture) {
          var glClearColor = this.ctx.stage.getClearColor();

          if (glClearColor) {
            gl.clearColor(glClearColor[0] * glClearColor[3], glClearColor[1] * glClearColor[3], glClearColor[2] * glClearColor[3], glClearColor[3]);
            gl.clear(gl.COLOR_BUFFER_BIT);
          }
        } else {
          // Clear texture.
          gl.clearColor(0, 0, 0, 0);
          gl.clear(gl.COLOR_BUFFER_BIT);
        }
      }
    }, {
      key: "_setScissor",
      value: function _setScissor(area) {
        _get(_getPrototypeOf(WebGLCoreRenderExecutor.prototype), "_setScissor", this).call(this, area);

        if (this._scissor === area) {
          return;
        }

        this._scissor = area;
        var gl = this.gl;

        if (!area) {
          gl.disable(gl.SCISSOR_TEST);
        } else {
          gl.enable(gl.SCISSOR_TEST);
          var precision = this.ctx.stage.getRenderPrecision();
          var y = area[1];

          if (this._renderTexture === null) {
            // Flip.
            y = this.ctx.stage.h / precision - (area[1] + area[3]);
          }

          gl.scissor(Math.round(area[0] * precision), Math.round(y * precision), Math.round(area[2] * precision), Math.round(area[3] * precision));
        }
      }
    }]);

    return WebGLCoreRenderExecutor;
  }(CoreRenderExecutor);

  var CoreRenderState =
  /*#__PURE__*/
  function () {
    function CoreRenderState(ctx) {
      _classCallCheck(this, CoreRenderState);

      this.ctx = ctx;
      this.stage = ctx.stage;
      this.defaultShader = this.stage.renderer.getDefaultShader(ctx);
      this.renderer = ctx.stage.renderer;
      this.quads = this.renderer.createCoreQuadList(ctx);
    }

    _createClass(CoreRenderState, [{
      key: "reset",
      value: function reset() {
        this._renderTextureInfo = null;
        this._scissor = null;
        this._shader = null;
        this._shaderOwner = null;
        this._realShader = null;
        this._check = false;
        this.quadOperations = [];
        this._texturizer = null;
        this._texturizerTemporary = false;
        this._quadOperation = null;
        this.quads.reset();
        this._temporaryTexturizers = [];
        this._isCachingTexturizer = false;
      }
    }, {
      key: "setShader",
      value: function setShader(shader, owner) {
        if (this._shaderOwner !== owner || this._realShader !== shader) {
          // Same shader owner: active shader is also the same.
          // Prevent any shader usage to save performance.
          this._realShader = shader;

          if (shader.useDefault()) {
            // Use the default shader when possible to prevent unnecessary program changes.
            shader = this.defaultShader;
          }

          if (this._shader !== shader || this._shaderOwner !== owner) {
            this._shader = shader;
            this._shaderOwner = owner;
            this._check = true;
          }
        }
      }
    }, {
      key: "setScissor",
      value: function setScissor(area) {
        if (this._scissor !== area) {
          if (area) {
            this._scissor = area;
          } else {
            this._scissor = null;
          }

          this._check = true;
        }
      }
    }, {
      key: "getScissor",
      value: function getScissor() {
        return this._scissor;
      }
    }, {
      key: "setRenderTextureInfo",
      value: function setRenderTextureInfo(renderTextureInfo) {
        if (this._renderTextureInfo !== renderTextureInfo) {
          this._renderTextureInfo = renderTextureInfo;
          this._scissor = null;
          this._check = true;
        }
      }
      /**
       * Sets the texturizer to be drawn during subsequent addQuads.
       * @param {ElementTexturizer} texturizer
       */

    }, {
      key: "setTexturizer",
      value: function setTexturizer(texturizer) {
        var cache = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
        this._texturizer = texturizer;
        this._cacheTexturizer = cache;
      }
    }, {
      key: "addQuad",
      value: function addQuad(elementCore) {
        if (!this._quadOperation) {
          this._createQuadOperation();
        } else if (this._check && this._hasChanges()) {
          this._finishQuadOperation();

          this._check = false;
        }

        var nativeTexture = null;

        if (this._texturizer) {
          nativeTexture = this._texturizer.getResultTexture();

          if (!this._cacheTexturizer) {
            // We can release the temporary texture immediately after finalizing this quad operation.
            this._temporaryTexturizers.push(this._texturizer);
          }
        }

        if (!nativeTexture) {
          nativeTexture = elementCore._displayedTextureSource.nativeTexture;
        }

        if (this._renderTextureInfo) {
          if (this._shader === this.defaultShader && this._renderTextureInfo.empty) {
            // The texture might be reusable under some conditions. We will check them in ElementCore.renderer.
            this._renderTextureInfo.nativeTexture = nativeTexture;
            this._renderTextureInfo.offset = this.length;
          } else {
            // It is not possible to reuse another texture when there is more than one quad.
            this._renderTextureInfo.nativeTexture = null;
          }

          this._renderTextureInfo.empty = false;
        }

        this.quads.quadTextures.push(nativeTexture);
        this.quads.quadElements.push(elementCore);
        this._quadOperation.length++;
        this.renderer.addQuad(this, this.quads, this.length - 1);
      }
    }, {
      key: "finishedRenderTexture",
      value: function finishedRenderTexture() {
        if (this._renderTextureInfo.nativeTexture) {
          // There was only one texture drawn in this render texture.
          // Check if we can reuse it so that we can optimize out an unnecessary render texture operation.
          // (it should exactly span this render texture).
          if (!this._isRenderTextureReusable()) {
            this._renderTextureInfo.nativeTexture = null;
          }
        }
      }
    }, {
      key: "_isRenderTextureReusable",
      value: function _isRenderTextureReusable() {
        var offset = this._renderTextureInfo.offset;
        return this.quads.quadTextures[offset].w === this._renderTextureInfo.w && this.quads.quadTextures[offset].h === this._renderTextureInfo.h && this.renderer.isRenderTextureReusable(this, this._renderTextureInfo);
      }
    }, {
      key: "_hasChanges",
      value: function _hasChanges() {
        var q = this._quadOperation;
        if (this._shader !== q.shader) return true;
        if (this._shaderOwner !== q.shaderOwner) return true;
        if (this._renderTextureInfo !== q.renderTextureInfo) return true;

        if (this._scissor !== q.scissor) {
          if (this._scissor[0] !== q.scissor[0] || this._scissor[1] !== q.scissor[1] || this._scissor[2] !== q.scissor[2] || this._scissor[3] !== q.scissor[3]) {
            return true;
          }
        }

        return false;
      }
    }, {
      key: "_finishQuadOperation",
      value: function _finishQuadOperation() {
        var create = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

        if (this._quadOperation) {
          if (this._quadOperation.length || this._shader.addEmpty()) {
            if (!this._quadOperation.scissor || this._quadOperation.scissor[2] > 0 && this._quadOperation.scissor[3] > 0) {
              // Ignore empty clipping regions.
              this.quadOperations.push(this._quadOperation);
            }
          }

          if (this._temporaryTexturizers.length) {
            for (var i = 0, n = this._temporaryTexturizers.length; i < n; i++) {
              // We can now reuse these render-to-textures in subsequent stages.
              // Huge performance benefit when filtering (fast blur).
              this._temporaryTexturizers[i].releaseRenderTexture();
            }

            this._temporaryTexturizers = [];
          }

          this._quadOperation = null;
        }

        if (create) {
          this._createQuadOperation();
        }
      }
    }, {
      key: "_createQuadOperation",
      value: function _createQuadOperation() {
        this._quadOperation = this.renderer.createCoreQuadOperation(this.ctx, this._shader, this._shaderOwner, this._renderTextureInfo, this._scissor, this.length);
        this._check = false;
      }
    }, {
      key: "finish",
      value: function finish() {
        if (this._quadOperation) {
          // Add remaining.
          this._finishQuadOperation(false);
        }

        this.renderer.finishRenderState(this);
      }
    }, {
      key: "length",
      get: function get() {
        return this.quads.quadTextures.length;
      }
    }, {
      key: "renderTextureInfo",
      get: function get() {
        return this._renderTextureInfo;
      }
    }, {
      key: "isCachingTexturizer",
      set: function set(v) {
        this._isCachingTexturizer = v;
      },
      get: function get() {
        return this._isCachingTexturizer;
      }
    }]);

    return CoreRenderState;
  }();

  /**
   * Base functionality for shader setup/destroy.
   */
  var WebGLShaderProgram =
  /*#__PURE__*/
  function () {
    function WebGLShaderProgram(vertexShaderSource, fragmentShaderSource) {
      _classCallCheck(this, WebGLShaderProgram);

      this.vertexShaderSource = vertexShaderSource;
      this.fragmentShaderSource = fragmentShaderSource;
      this._program = null;
      this._uniformLocations = new Map();
      this._attributeLocations = new Map();
      this._currentUniformValues = {};
    }

    _createClass(WebGLShaderProgram, [{
      key: "compile",
      value: function compile(gl) {
        if (this._program) return;
        this.gl = gl;
        this._program = gl.createProgram();

        var glVertShader = this._glCompile(gl.VERTEX_SHADER, this.vertexShaderSource);

        var glFragShader = this._glCompile(gl.FRAGMENT_SHADER, this.fragmentShaderSource);

        gl.attachShader(this._program, glVertShader);
        gl.attachShader(this._program, glFragShader);
        gl.linkProgram(this._program); // if linking fails, then log and cleanup

        if (!gl.getProgramParameter(this._program, gl.LINK_STATUS)) {
          console.error('Error: Could not initialize shader.');
          console.error('gl.VALIDATE_STATUS', gl.getProgramParameter(this._program, gl.VALIDATE_STATUS));
          console.error('gl.getError()', gl.getError()); // if there is a program info log, log it

          if (gl.getProgramInfoLog(this._program) !== '') {
            console.warn('Warning: gl.getProgramInfoLog()', gl.getProgramInfoLog(this._program));
          }

          gl.deleteProgram(this._program);
          this._program = null;
        } // clean up some shaders


        gl.deleteShader(glVertShader);
        gl.deleteShader(glFragShader);
      }
    }, {
      key: "_glCompile",
      value: function _glCompile(type, src) {
        var _this = this;

        var shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, src);
        this.gl.compileShader(shader);

        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
          console.log(this.constructor.name, 'Type: ' + (type === this.gl.VERTEX_SHADER ? 'vertex shader' : 'fragment shader'));
          console.log(this.gl.getShaderInfoLog(shader));
          var idx = 0;
          console.log("========== source ==========\n" + src.split("\n").map(function (line) {
            _newArrowCheck(this, _this);

            return "" + ++idx + ": " + line;
          }.bind(this)).join("\n"));
          return null;
        }

        return shader;
      }
    }, {
      key: "getUniformLocation",
      value: function getUniformLocation(name) {
        var location = this._uniformLocations.get(name);

        if (location === undefined) {
          location = this.gl.getUniformLocation(this._program, name);

          this._uniformLocations.set(name, location);
        }

        return location;
      }
    }, {
      key: "getAttribLocation",
      value: function getAttribLocation(name) {
        var location = this._attributeLocations.get(name);

        if (location === undefined) {
          location = this.gl.getAttribLocation(this._program, name);

          this._attributeLocations.set(name, location);
        }

        return location;
      }
    }, {
      key: "destroy",
      value: function destroy() {
        if (this._program) {
          this.gl.deleteProgram(this._program);
          this._program = null;
        }
      }
    }, {
      key: "_valueEquals",
      value: function _valueEquals(v1, v2) {
        // Uniform value is either a typed array or a numeric value.
        if (v1.length && v2.length) {
          for (var i = 0, n = v1.length; i < n; i++) {
            if (v1[i] !== v2[i]) return false;
          }

          return true;
        } else {
          return v1 === v2;
        }
      }
    }, {
      key: "_valueClone",
      value: function _valueClone(v) {
        if (v.length) {
          return v.slice(0);
        } else {
          return v;
        }
      }
    }, {
      key: "setUniformValue",
      value: function setUniformValue(name, value, glFunction) {
        var v = this._currentUniformValues[name];

        if (v === undefined || !this._valueEquals(v, value)) {
          var clonedValue = this._valueClone(value);

          this._currentUniformValues[name] = clonedValue;
          var loc = this.getUniformLocation(name);

          if (loc) {
            var isMatrix = glFunction === this.gl.uniformMatrix2fv || glFunction === this.gl.uniformMatrix3fv || glFunction === this.gl.uniformMatrix4fv;

            if (isMatrix) {
              glFunction.call(this.gl, loc, false, clonedValue);
            } else {
              glFunction.call(this.gl, loc, clonedValue);
            }
          }
        }
      }
    }, {
      key: "glProgram",
      get: function get() {
        return this._program;
      }
    }, {
      key: "compiled",
      get: function get() {
        return !!this._program;
      }
    }]);

    return WebGLShaderProgram;
  }();

  var WebGLShader =
  /*#__PURE__*/
  function (_Shader) {
    _inherits(WebGLShader, _Shader);

    function WebGLShader(ctx) {
      var _this;

      _classCallCheck(this, WebGLShader);

      _this = _possibleConstructorReturn(this, _getPrototypeOf(WebGLShader).call(this, ctx));
      var stage = ctx.stage;
      _this._program = stage.renderer.shaderPrograms.get(_this.constructor);

      if (!_this._program) {
        _this._program = new WebGLShaderProgram(_this.constructor.vertexShaderSource, _this.constructor.fragmentShaderSource); // Let the vbo context perform garbage collection.

        stage.renderer.shaderPrograms.set(_this.constructor, _this._program);
      }

      _this.gl = stage.gl;
      return _this;
    }

    _createClass(WebGLShader, [{
      key: "_init",
      value: function _init() {
        if (!this._initialized) {
          this.initialize();
          this._initialized = true;
        }
      }
    }, {
      key: "initialize",
      value: function initialize() {
        this._program.compile(this.gl);
      }
    }, {
      key: "_uniform",
      value: function _uniform(name) {
        return this._program.getUniformLocation(name);
      }
    }, {
      key: "_attrib",
      value: function _attrib(name) {
        return this._program.getAttribLocation(name);
      }
    }, {
      key: "_setUniform",
      value: function _setUniform(name, value, glFunction) {
        this._program.setUniformValue(name, value, glFunction);
      }
    }, {
      key: "useProgram",
      value: function useProgram() {
        this._init();

        this.gl.useProgram(this.glProgram);
        this.beforeUsage();
        this.enableAttribs();
      }
    }, {
      key: "stopProgram",
      value: function stopProgram() {
        this.afterUsage();
        this.disableAttribs();
      }
    }, {
      key: "hasSameProgram",
      value: function hasSameProgram(other) {
        // For performance reasons, we first check for identical references.
        return other && (other === this || other._program === this._program);
      }
    }, {
      key: "beforeUsage",
      value: function beforeUsage() {// Override to set settings other than the default settings (blend mode etc).
      }
    }, {
      key: "afterUsage",
      value: function afterUsage() {// All settings changed in beforeUsage should be reset here.
      }
    }, {
      key: "enableAttribs",
      value: function enableAttribs() {}
    }, {
      key: "disableAttribs",
      value: function disableAttribs() {}
    }, {
      key: "getExtraAttribBytesPerVertex",
      value: function getExtraAttribBytesPerVertex() {
        return 0;
      }
    }, {
      key: "getVertexAttribPointerOffset",
      value: function getVertexAttribPointerOffset(operation) {
        return operation.extraAttribsDataByteOffset - (operation.index + 1) * 4 * this.getExtraAttribBytesPerVertex();
      }
    }, {
      key: "setExtraAttribsInBuffer",
      value: function setExtraAttribsInBuffer(operation) {// Set extra attrib data in in operation.quads.data/floats/uints, starting from
        // operation.extraAttribsBufferByteOffset.
      }
    }, {
      key: "setupUniforms",
      value: function setupUniforms(operation) {// Set all shader-specific uniforms.
        // Notice that all uniforms should be set, even if they have not been changed within this shader instance.
        // The uniforms are shared by all shaders that have the same type (and shader program).
      }
    }, {
      key: "_getProjection",
      value: function _getProjection(operation) {
        return operation.getProjection();
      }
    }, {
      key: "getFlipY",
      value: function getFlipY(operation) {
        return this._getProjection(operation)[1] < 0;
      }
    }, {
      key: "beforeDraw",
      value: function beforeDraw(operation) {}
    }, {
      key: "draw",
      value: function draw(operation) {}
    }, {
      key: "afterDraw",
      value: function afterDraw(operation) {}
    }, {
      key: "cleanup",
      value: function cleanup() {
        this._initialized = false; // Program takes little resources, so it is only destroyed when the full stage is destroyed.
      }
    }, {
      key: "glProgram",
      get: function get() {
        return this._program.glProgram;
      }
    }, {
      key: "initialized",
      get: function get() {
        return this._initialized;
      }
    }]);

    return WebGLShader;
  }(Shader);

  var DefaultShader =
  /*#__PURE__*/
  function (_WebGLShader) {
    _inherits(DefaultShader, _WebGLShader);

    function DefaultShader() {
      _classCallCheck(this, DefaultShader);

      return _possibleConstructorReturn(this, _getPrototypeOf(DefaultShader).apply(this, arguments));
    }

    _createClass(DefaultShader, [{
      key: "enableAttribs",
      value: function enableAttribs() {
        // Enables the attribs in the shader program.
        var gl = this.gl;
        gl.vertexAttribPointer(this._attrib("aVertexPosition"), 2, gl.FLOAT, false, 20, 0);
        gl.enableVertexAttribArray(this._attrib("aVertexPosition"));

        if (this._attrib("aTextureCoord") !== -1) {
          gl.vertexAttribPointer(this._attrib("aTextureCoord"), 2, gl.FLOAT, false, 20, 2 * 4);
          gl.enableVertexAttribArray(this._attrib("aTextureCoord"));
        }

        if (this._attrib("aColor") !== -1) {
          // Some shaders may ignore the color.
          gl.vertexAttribPointer(this._attrib("aColor"), 4, gl.UNSIGNED_BYTE, true, 20, 4 * 4);
          gl.enableVertexAttribArray(this._attrib("aColor"));
        }
      }
    }, {
      key: "disableAttribs",
      value: function disableAttribs() {
        // Disables the attribs in the shader program.
        var gl = this.gl;
        gl.disableVertexAttribArray(this._attrib("aVertexPosition"));

        if (this._attrib("aTextureCoord") !== -1) {
          gl.disableVertexAttribArray(this._attrib("aTextureCoord"));
        }

        if (this._attrib("aColor") !== -1) {
          gl.disableVertexAttribArray(this._attrib("aColor"));
        }
      }
    }, {
      key: "setupUniforms",
      value: function setupUniforms(operation) {
        this._setUniform("projection", this._getProjection(operation), this.gl.uniform2fv, false);
      }
    }, {
      key: "draw",
      value: function draw(operation) {
        var gl = this.gl;
        var length = operation.length;

        if (length) {
          var glTexture = operation.getTexture(0);
          var pos = 0;

          for (var i = 0; i < length; i++) {
            var tx = operation.getTexture(i);

            if (glTexture !== tx) {
              gl.bindTexture(gl.TEXTURE_2D, glTexture);
              gl.drawElements(gl.TRIANGLES, 6 * (i - pos), gl.UNSIGNED_SHORT, (pos + operation.index) * 6 * 2);
              glTexture = tx;
              pos = i;
            }
          }

          if (pos < length) {
            gl.bindTexture(gl.TEXTURE_2D, glTexture);
            gl.drawElements(gl.TRIANGLES, 6 * (length - pos), gl.UNSIGNED_SHORT, (pos + operation.index) * 6 * 2);
          }
        }
      }
    }]);

    return DefaultShader;
  }(WebGLShader);
  DefaultShader.vertexShaderSource = `
    #ifdef GL_ES
    precision lowp float;
    #endif
    attribute vec2 aVertexPosition;
    attribute vec2 aTextureCoord;
    attribute vec4 aColor;
    uniform vec2 projection;
    varying vec2 vTextureCoord;
    varying vec4 vColor;
    void main(void){
        gl_Position = vec4(aVertexPosition.x * projection.x - 1.0, aVertexPosition.y * -abs(projection.y) + 1.0, 0.0, 1.0);
        vTextureCoord = aTextureCoord;
        vColor = aColor;
        gl_Position.y = -sign(projection.y) * gl_Position.y;
    }
`;
  DefaultShader.fragmentShaderSource = `
    #ifdef GL_ES
    precision lowp float;
    #endif
    varying vec2 vTextureCoord;
    varying vec4 vColor;
    uniform sampler2D uSampler;
    void main(void){
        gl_FragColor = texture2D(uSampler, vTextureCoord) * vColor;
    }
`;

  var Renderer =
  /*#__PURE__*/
  function () {
    function Renderer(stage) {
      _classCallCheck(this, Renderer);

      this.stage = stage;
      this._defaultShader = undefined;
    }

    _createClass(Renderer, [{
      key: "gc",
      value: function gc(aggressive) {}
    }, {
      key: "destroy",
      value: function destroy() {}
    }, {
      key: "getDefaultShader",
      value: function getDefaultShader() {
        var ctx = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.stage.ctx;

        if (!this._defaultShader) {
          this._defaultShader = this._createDefaultShader(ctx);
        }

        return this._defaultShader;
      }
    }, {
      key: "_createDefaultShader",
      value: function _createDefaultShader(ctx) {}
    }, {
      key: "isValidShaderType",
      value: function isValidShaderType(shaderType) {
        return shaderType.prototype instanceof this._getShaderBaseType();
      }
    }, {
      key: "createShader",
      value: function createShader(ctx, settings) {
        var shaderType = settings.type; // If shader type is not correct, use a different platform.

        if (!this.isValidShaderType(shaderType)) {
          var convertedShaderType = this._getShaderAlternative(shaderType);

          if (!convertedShaderType) {
            console.warn("Shader has no implementation for render target: " + shaderType.name);
            return this._createDefaultShader(ctx);
          }

          return new convertedShaderType(ctx);
        } else {
          var shader = new shaderType(ctx);
          Base.patchObject(this, settings);
          return shader;
        }
      }
    }, {
      key: "_getShaderBaseType",
      value: function _getShaderBaseType() {}
    }, {
      key: "_getShaderAlternative",
      value: function _getShaderAlternative(shaderType) {
        return this.getDefaultShader();
      }
    }, {
      key: "copyRenderTexture",
      value: function copyRenderTexture(renderTexture, nativeTexture, options) {
        console.warn('copyRenderTexture not supported by renderer');
      }
    }]);

    return Renderer;
  }();

  var WebGLRenderer =
  /*#__PURE__*/
  function (_Renderer) {
    _inherits(WebGLRenderer, _Renderer);

    function WebGLRenderer(stage) {
      var _this;

      _classCallCheck(this, WebGLRenderer);

      _this = _possibleConstructorReturn(this, _getPrototypeOf(WebGLRenderer).call(this, stage));
      _this.shaderPrograms = new Map();
      return _this;
    }

    _createClass(WebGLRenderer, [{
      key: "destroy",
      value: function destroy() {
        var _this2 = this;

        this.shaderPrograms.forEach(function (shaderProgram) {
          _newArrowCheck(this, _this2);

          return shaderProgram.destroy();
        }.bind(this));
      }
    }, {
      key: "_createDefaultShader",
      value: function _createDefaultShader(ctx) {
        return new DefaultShader(ctx);
      }
    }, {
      key: "_getShaderBaseType",
      value: function _getShaderBaseType() {
        return WebGLShader;
      }
    }, {
      key: "_getShaderAlternative",
      value: function _getShaderAlternative(shaderType) {
        return shaderType.getWebGL && shaderType.getWebGL();
      }
    }, {
      key: "createCoreQuadList",
      value: function createCoreQuadList(ctx) {
        return new WebGLCoreQuadList(ctx);
      }
    }, {
      key: "createCoreQuadOperation",
      value: function createCoreQuadOperation(ctx, shader, shaderOwner, renderTextureInfo, scissor, index) {
        return new WebGLCoreQuadOperation(ctx, shader, shaderOwner, renderTextureInfo, scissor, index);
      }
    }, {
      key: "createCoreRenderExecutor",
      value: function createCoreRenderExecutor(ctx) {
        return new WebGLCoreRenderExecutor(ctx);
      }
    }, {
      key: "createCoreRenderState",
      value: function createCoreRenderState(ctx) {
        return new CoreRenderState(ctx);
      }
    }, {
      key: "createRenderTexture",
      value: function createRenderTexture(w, h, pw, ph) {
        var gl = this.stage.gl;
        var glTexture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, glTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, pw, ph, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        glTexture.params = {};
        glTexture.params[gl.TEXTURE_MAG_FILTER] = gl.LINEAR;
        glTexture.params[gl.TEXTURE_MIN_FILTER] = gl.LINEAR;
        glTexture.params[gl.TEXTURE_WRAP_S] = gl.CLAMP_TO_EDGE;
        glTexture.params[gl.TEXTURE_WRAP_T] = gl.CLAMP_TO_EDGE;
        glTexture.options = {
          format: gl.RGBA,
          internalFormat: gl.RGBA,
          type: gl.UNSIGNED_BYTE
        }; // We need a specific framebuffer for every render texture.

        glTexture.framebuffer = gl.createFramebuffer();
        glTexture.projection = new Float32Array([2 / w, 2 / h]);
        gl.bindFramebuffer(gl.FRAMEBUFFER, glTexture.framebuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, glTexture, 0);
        return glTexture;
      }
    }, {
      key: "freeRenderTexture",
      value: function freeRenderTexture(glTexture) {
        var gl = this.stage.gl;
        gl.deleteFramebuffer(glTexture.framebuffer);
        gl.deleteTexture(glTexture);
      }
    }, {
      key: "uploadTextureSource",
      value: function uploadTextureSource(textureSource, options) {
        var _this3 = this;

        var gl = this.stage.gl;
        var source = options.source;
        var format = {
          premultiplyAlpha: true,
          hasAlpha: true
        };

        if (options && options.hasOwnProperty('premultiplyAlpha')) {
          format.premultiplyAlpha = options.premultiplyAlpha;
        }

        if (options && options.hasOwnProperty('flipBlueRed')) {
          format.flipBlueRed = options.flipBlueRed;
        }

        if (options && options.hasOwnProperty('hasAlpha')) {
          format.hasAlpha = options.hasAlpha;
        }

        if (!format.hasAlpha) {
          format.premultiplyAlpha = false;
        }

        format.texParams = options.texParams || {};
        format.texOptions = options.texOptions || {};
        var glTexture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, glTexture);
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, format.premultiplyAlpha);

        if (Utils.isNode) {
          gl.pixelStorei(gl.UNPACK_FLIP_BLUE_RED, !!format.flipBlueRed);
        }

        var texParams = format.texParams;
        if (!texParams[gl.TEXTURE_MAG_FILTER]) texParams[gl.TEXTURE_MAG_FILTER] = gl.LINEAR;
        if (!texParams[gl.TEXTURE_MIN_FILTER]) texParams[gl.TEXTURE_MIN_FILTER] = gl.LINEAR;
        if (!texParams[gl.TEXTURE_WRAP_S]) texParams[gl.TEXTURE_WRAP_S] = gl.CLAMP_TO_EDGE;
        if (!texParams[gl.TEXTURE_WRAP_T]) texParams[gl.TEXTURE_WRAP_T] = gl.CLAMP_TO_EDGE;
        Object.keys(texParams).forEach(function (key) {
          _newArrowCheck(this, _this3);

          var value = texParams[key];
          gl.texParameteri(gl.TEXTURE_2D, parseInt(key), value);
        }.bind(this));
        var texOptions = format.texOptions;
        texOptions.format = texOptions.format || (format.hasAlpha ? gl.RGBA : gl.RGB);
        texOptions.type = texOptions.type || gl.UNSIGNED_BYTE;
        texOptions.internalFormat = texOptions.internalFormat || texOptions.format;
        this.stage.platform.uploadGlTexture(gl, textureSource, source, texOptions);
        glTexture.params = Utils.cloneObjShallow(texParams);
        glTexture.options = Utils.cloneObjShallow(texOptions);
        return glTexture;
      }
    }, {
      key: "freeTextureSource",
      value: function freeTextureSource(textureSource) {
        this.stage.gl.deleteTexture(textureSource.nativeTexture);
      }
    }, {
      key: "addQuad",
      value: function addQuad(renderState, quads, index) {
        var offset = index * 20;
        var elementCore = quads.quadElements[index];
        var r = elementCore._renderContext;
        var floats = renderState.quads.floats;
        var uints = renderState.quads.uints;
        var mca = StageUtils.mergeColorAlpha;

        if (r.tb !== 0 || r.tc !== 0) {
          floats[offset++] = r.px;
          floats[offset++] = r.py;
          floats[offset++] = elementCore._ulx;
          floats[offset++] = elementCore._uly;
          uints[offset++] = mca(elementCore._colorUl, r.alpha);
          floats[offset++] = r.px + elementCore._w * r.ta;
          floats[offset++] = r.py + elementCore._w * r.tc;
          floats[offset++] = elementCore._brx;
          floats[offset++] = elementCore._uly;
          uints[offset++] = mca(elementCore._colorUr, r.alpha);
          floats[offset++] = r.px + elementCore._w * r.ta + elementCore._h * r.tb;
          floats[offset++] = r.py + elementCore._w * r.tc + elementCore._h * r.td;
          floats[offset++] = elementCore._brx;
          floats[offset++] = elementCore._bry;
          uints[offset++] = mca(elementCore._colorBr, r.alpha);
          floats[offset++] = r.px + elementCore._h * r.tb;
          floats[offset++] = r.py + elementCore._h * r.td;
          floats[offset++] = elementCore._ulx;
          floats[offset++] = elementCore._bry;
          uints[offset] = mca(elementCore._colorBl, r.alpha);
        } else {
          // Simple.
          var cx = r.px + elementCore._w * r.ta;
          var cy = r.py + elementCore._h * r.td;
          floats[offset++] = r.px;
          floats[offset++] = r.py;
          floats[offset++] = elementCore._ulx;
          floats[offset++] = elementCore._uly;
          uints[offset++] = mca(elementCore._colorUl, r.alpha);
          floats[offset++] = cx;
          floats[offset++] = r.py;
          floats[offset++] = elementCore._brx;
          floats[offset++] = elementCore._uly;
          uints[offset++] = mca(elementCore._colorUr, r.alpha);
          floats[offset++] = cx;
          floats[offset++] = cy;
          floats[offset++] = elementCore._brx;
          floats[offset++] = elementCore._bry;
          uints[offset++] = mca(elementCore._colorBr, r.alpha);
          floats[offset++] = r.px;
          floats[offset++] = cy;
          floats[offset++] = elementCore._ulx;
          floats[offset++] = elementCore._bry;
          uints[offset] = mca(elementCore._colorBl, r.alpha);
        }
      }
    }, {
      key: "isRenderTextureReusable",
      value: function isRenderTextureReusable(renderState, renderTextureInfo) {
        var offset = renderState._renderTextureInfo.offset * 80 / 4;
        var floats = renderState.quads.floats;
        var uints = renderState.quads.uints;
        return floats[offset] === 0 && floats[offset + 1] === 0 && floats[offset + 2] === 0 && floats[offset + 3] === 0 && uints[offset + 4] === 0xFFFFFFFF && floats[offset + 5] === renderTextureInfo.w && floats[offset + 6] === 0 && floats[offset + 7] === 1 && floats[offset + 8] === 0 && uints[offset + 9] === 0xFFFFFFFF && floats[offset + 10] === renderTextureInfo.w && floats[offset + 11] === renderTextureInfo.h && floats[offset + 12] === 1 && floats[offset + 13] === 1 && uints[offset + 14] === 0xFFFFFFFF && floats[offset + 15] === 0 && floats[offset + 16] === renderTextureInfo.h && floats[offset + 17] === 0 && floats[offset + 18] === 1 && uints[offset + 19] === 0xFFFFFFFF;
      }
    }, {
      key: "finishRenderState",
      value: function finishRenderState(renderState) {
        // Set extra shader attribute data.
        var offset = renderState.length * 80;

        for (var i = 0, n = renderState.quadOperations.length; i < n; i++) {
          renderState.quadOperations[i].extraAttribsDataByteOffset = offset;
          var extra = renderState.quadOperations[i].shader.getExtraAttribBytesPerVertex() * 4 * renderState.quadOperations[i].length;
          offset += extra;

          if (extra) {
            renderState.quadOperations[i].shader.setExtraAttribsInBuffer(renderState.quadOperations[i], renderState.quads);
          }
        }

        renderState.quads.dataLength = offset;
      }
    }, {
      key: "copyRenderTexture",
      value: function copyRenderTexture(renderTexture, nativeTexture, options) {
        var gl = this.stage.gl;
        gl.bindTexture(gl.TEXTURE_2D, nativeTexture);
        gl.bindFramebuffer(gl.FRAMEBUFFER, renderTexture.framebuffer);
        var precision = renderTexture.precision;
        gl.copyTexSubImage2D(gl.TEXTURE_2D, 0, precision * (options.sx || 0), precision * (options.sy || 0), precision * (options.x || 0), precision * (options.y || 0), precision * (options.w || renderTexture.ow), precision * (options.h || renderTexture.oh));
      }
    }]);

    return WebGLRenderer;
  }(Renderer);

  var C2dCoreQuadList =
  /*#__PURE__*/
  function (_CoreQuadList) {
    _inherits(C2dCoreQuadList, _CoreQuadList);

    function C2dCoreQuadList(ctx) {
      var _this;

      _classCallCheck(this, C2dCoreQuadList);

      _this = _possibleConstructorReturn(this, _getPrototypeOf(C2dCoreQuadList).call(this, ctx));
      _this.renderContexts = [];
      _this.modes = [];
      return _this;
    }

    _createClass(C2dCoreQuadList, [{
      key: "setRenderContext",
      value: function setRenderContext(index, v) {
        this.renderContexts[index] = v;
      }
    }, {
      key: "setSimpleTc",
      value: function setSimpleTc(index, v) {
        if (v) {
          this.modes[index] |= 1;
        } else {
          this.modes[index] -= this.modes[index] & 1;
        }
      }
    }, {
      key: "setWhite",
      value: function setWhite(index, v) {
        if (v) {
          this.modes[index] |= 2;
        } else {
          this.modes[index] -= this.modes[index] & 2;
        }
      }
    }, {
      key: "getRenderContext",
      value: function getRenderContext(index) {
        return this.renderContexts[index];
      }
    }, {
      key: "getSimpleTc",
      value: function getSimpleTc(index) {
        return this.modes[index] & 1;
      }
    }, {
      key: "getWhite",
      value: function getWhite(index) {
        return this.modes[index] & 2;
      }
    }]);

    return C2dCoreQuadList;
  }(CoreQuadList);

  var C2dCoreQuadOperation =
  /*#__PURE__*/
  function (_CoreQuadOperation) {
    _inherits(C2dCoreQuadOperation, _CoreQuadOperation);

    function C2dCoreQuadOperation() {
      _classCallCheck(this, C2dCoreQuadOperation);

      return _possibleConstructorReturn(this, _getPrototypeOf(C2dCoreQuadOperation).apply(this, arguments));
    }

    _createClass(C2dCoreQuadOperation, [{
      key: "getRenderContext",
      value: function getRenderContext(index) {
        return this.quads.getRenderContext(this.index + index);
      }
    }, {
      key: "getSimpleTc",
      value: function getSimpleTc(index) {
        return this.quads.getSimpleTc(this.index + index);
      }
    }, {
      key: "getWhite",
      value: function getWhite(index) {
        return this.quads.getWhite(this.index + index);
      }
    }]);

    return C2dCoreQuadOperation;
  }(CoreQuadOperation);

  var C2dCoreRenderExecutor =
  /*#__PURE__*/
  function (_CoreRenderExecutor) {
    _inherits(C2dCoreRenderExecutor, _CoreRenderExecutor);

    function C2dCoreRenderExecutor() {
      _classCallCheck(this, C2dCoreRenderExecutor);

      return _possibleConstructorReturn(this, _getPrototypeOf(C2dCoreRenderExecutor).apply(this, arguments));
    }

    _createClass(C2dCoreRenderExecutor, [{
      key: "init",
      value: function init() {
        this._mainRenderTexture = this.ctx.stage.getCanvas();
      }
    }, {
      key: "_renderQuadOperation",
      value: function _renderQuadOperation(op) {
        var shader = op.shader;

        if (op.length || op.shader.addEmpty()) {
          var target = this._renderTexture || this._mainRenderTexture;
          shader.beforeDraw(op, target);
          shader.draw(op, target);
          shader.afterDraw(op, target);
        }
      }
    }, {
      key: "_clearRenderTexture",
      value: function _clearRenderTexture() {
        var ctx = this._getContext();

        var clearColor = [0, 0, 0, 0];

        if (this._mainRenderTexture.ctx === ctx) {
          clearColor = this.ctx.stage.getClearColor();
        }

        var renderTexture = ctx.canvas;
        ctx.setTransform(1, 0, 0, 1, 0, 0);

        if (!clearColor[0] && !clearColor[1] && !clearColor[2] && !clearColor[3]) {
          ctx.clearRect(0, 0, renderTexture.width, renderTexture.height);
        } else {
          ctx.fillStyle = StageUtils.getRgbaStringFromArray(clearColor); // Do not use fillRect because it produces artifacts.

          ctx.globalCompositeOperation = 'copy';
          ctx.beginPath();
          ctx.rect(0, 0, renderTexture.width, renderTexture.height);
          ctx.closePath();
          ctx.fill();
          ctx.globalCompositeOperation = 'source-over';
        }
      }
    }, {
      key: "_getContext",
      value: function _getContext() {
        if (this._renderTexture) {
          return this._renderTexture.ctx;
        } else {
          return this._mainRenderTexture.ctx;
        }
      }
    }, {
      key: "_restoreContext",
      value: function _restoreContext() {
        var ctx = this._getContext();

        ctx.restore();
        ctx.save();
        ctx._scissor = null;
      }
    }, {
      key: "_setScissor",
      value: function _setScissor(area) {
        var ctx = this._getContext();

        if (!C2dCoreRenderExecutor._equalScissorAreas(ctx.canvas, ctx._scissor, area)) {
          // Clipping is stored in the canvas context state.
          // We can't reset clipping alone so we need to restore the full context.
          this._restoreContext();

          var precision = this.ctx.stage.getRenderPrecision();

          if (area) {
            ctx.beginPath();
            ctx.rect(Math.round(area[0] * precision), Math.round(area[1] * precision), Math.round(area[2] * precision), Math.round(area[3] * precision));
            ctx.closePath();
            ctx.clip();
          }

          ctx._scissor = area;
        }
      }
    }], [{
      key: "_equalScissorAreas",
      value: function _equalScissorAreas(canvas, area, current) {
        if (!area) {
          area = [0, 0, canvas.width, canvas.height];
        }

        if (!current) {
          current = [0, 0, canvas.width, canvas.height];
        }

        return Utils.equalValues(area, current);
      }
    }]);

    return C2dCoreRenderExecutor;
  }(CoreRenderExecutor);

  var C2dShader =
  /*#__PURE__*/
  function (_Shader) {
    _inherits(C2dShader, _Shader);

    function C2dShader() {
      _classCallCheck(this, C2dShader);

      return _possibleConstructorReturn(this, _getPrototypeOf(C2dShader).apply(this, arguments));
    }

    _createClass(C2dShader, [{
      key: "beforeDraw",
      value: function beforeDraw(operation) {}
    }, {
      key: "draw",
      value: function draw(operation) {}
    }, {
      key: "afterDraw",
      value: function afterDraw(operation) {}
    }]);

    return C2dShader;
  }(Shader);

  var DefaultShader$1 =
  /*#__PURE__*/
  function (_C2dShader) {
    _inherits(DefaultShader, _C2dShader);

    function DefaultShader(ctx) {
      var _this;

      _classCallCheck(this, DefaultShader);

      _this = _possibleConstructorReturn(this, _getPrototypeOf(DefaultShader).call(this, ctx));
      _this._rectangleTexture = ctx.stage.rectangleTexture.source.nativeTexture;
      _this._tintManager = _this.ctx.stage.renderer.tintManager;
      return _this;
    }

    _createClass(DefaultShader, [{
      key: "draw",
      value: function draw(operation, target) {
        var ctx = target.ctx;
        var length = operation.length;

        for (var i = 0; i < length; i++) {
          var tx = operation.getTexture(i);

          var _vc = operation.getElementCore(i);

          var rc = operation.getRenderContext(i);
          var white = operation.getWhite(i);
          var stc = operation.getSimpleTc(i); //@todo: try to optimize out per-draw transform setting. split translate, transform.

          var precision = this.ctx.stage.getRenderPrecision();
          ctx.setTransform(rc.ta * precision, rc.tc * precision, rc.tb * precision, rc.td * precision, rc.px * precision, rc.py * precision);
          var rect = tx === this._rectangleTexture;
          var info = {
            operation,
            target,
            index: i,
            rect
          };

          if (rect) {
            // Check for gradient.
            if (white) {
              ctx.fillStyle = 'white';
            } else {
              this._setColorGradient(ctx, _vc);
            }

            ctx.globalAlpha = rc.alpha;

            this._beforeDrawEl(info);

            ctx.fillRect(0, 0, _vc.w, _vc.h);

            this._afterDrawEl(info);

            ctx.globalAlpha = 1.0;
          } else {
            // @todo: set image smoothing based on the texture.
            // @todo: optimize by registering whether identity texcoords are used.
            ctx.globalAlpha = rc.alpha;

            this._beforeDrawEl(info); // @todo: test if rounding yields better performance.
            // Notice that simple texture coords can be turned on even though vc._ulx etc are not simple, because
            //  we are rendering a render-to-texture (texcoords were stashed). Same is true for 'white' color btw.


            var sourceX = stc ? 0 : _vc._ulx * tx.w;
            var sourceY = stc ? 0 : _vc._uly * tx.h;
            var sourceW = (stc ? 1 : _vc._brx - _vc._ulx) * tx.w;
            var sourceH = (stc ? 1 : _vc._bry - _vc._uly) * tx.h;
            var colorize = !white;

            if (colorize) {
              // @todo: cache the tint texture for better performance.
              // Draw to intermediate texture with background color/gradient.
              // This prevents us from having to create a lot of render texture canvases.
              // Notice that we don't support (non-rect) gradients, only color tinting for c2d. We'll just take the average color.
              var color = _vc._colorUl;

              if (_vc._colorUl !== _vc._colorUr || _vc._colorUr !== _vc._colorBl || _vc._colorBr !== _vc._colorBl) {
                color = StageUtils.mergeMultiColorsEqual([_vc._colorUl, _vc._colorUr, _vc._colorBl, _vc._colorBr]);
              }

              var alpha = (color / 16777216 | 0) / 255.0;
              ctx.globalAlpha *= alpha;
              var rgb = color & 0x00FFFFFF;

              var tintTexture = this._tintManager.getTintTexture(tx, rgb); // Actually draw result.


              ctx.fillStyle = 'white';
              ctx.drawImage(tintTexture, sourceX, sourceY, sourceW, sourceH, 0, 0, _vc.w, _vc.h);
            } else {
              ctx.fillStyle = 'white';
              ctx.drawImage(tx, sourceX, sourceY, sourceW, sourceH, 0, 0, _vc.w, _vc.h);
            }

            this._afterDrawEl(info);

            ctx.globalAlpha = 1.0;
          }
        }
      }
    }, {
      key: "_setColorGradient",
      value: function _setColorGradient(ctx, vc) {
        var w = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : vc.w;
        var h = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : vc.h;
        var transparency = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : true;
        var color = vc._colorUl;
        var gradient; //@todo: quick single color check.
        //@todo: cache gradient/fill style (if possible, probably context-specific).

        if (vc._colorUl === vc._colorUr) {
          if (vc._colorBl === vc._colorBr) {
            if (vc._colorUl === vc.colorBl) ; else {
              // Vertical gradient.
              gradient = ctx.createLinearGradient(0, 0, 0, h);

              if (transparency) {
                gradient.addColorStop(0, StageUtils.getRgbaString(vc._colorUl));
                gradient.addColorStop(1, StageUtils.getRgbaString(vc._colorBl));
              } else {
                gradient.addColorStop(0, StageUtils.getRgbString(vc._colorUl));
                gradient.addColorStop(1, StageUtils.getRgbString(vc._colorBl));
              }
            }
          }
        } else {
          if (vc._colorUl === vc._colorBl && vc._colorUr === vc._colorBr) {
            // Horizontal gradient.
            gradient = ctx.createLinearGradient(0, 0, w, 0);

            if (transparency) {
              gradient.addColorStop(0, StageUtils.getRgbaString(vc._colorUl));
              gradient.addColorStop(1, StageUtils.getRgbaString(vc._colorBr));
            } else {
              gradient.addColorStop(0, StageUtils.getRgbString(vc._colorUl));
              gradient.addColorStop(1, StageUtils.getRgbString(vc._colorBr));
            }
          }
        }

        if (gradient) {
          ctx.fillStyle = gradient;
        } else {
          ctx.fillStyle = transparency ? StageUtils.getRgbaString(color) : StageUtils.getRgbString(color);
        }
      }
    }, {
      key: "_beforeDrawEl",
      value: function _beforeDrawEl(info) {}
    }, {
      key: "_afterDrawEl",
      value: function _afterDrawEl(info) {}
    }]);

    return DefaultShader;
  }(C2dShader);

  var C2dTextureTintManager =
  /*#__PURE__*/
  function () {
    function C2dTextureTintManager(stage) {
      _classCallCheck(this, C2dTextureTintManager);

      this.stage = stage;
      this._usedMemory = 0;
      this._cachedNativeTextures = new Set();
    }

    _createClass(C2dTextureTintManager, [{
      key: "destroy",
      value: function destroy() {
        this.gc(true);
      }
    }, {
      key: "_addMemoryUsage",
      value: function _addMemoryUsage(delta) {
        this._usedMemory += delta;
        this.stage.addMemoryUsage(delta);
      }
    }, {
      key: "delete",
      value: function _delete(nativeTexture) {
        // Should be called when native texture is cleaned up.
        if (this._hasCache(nativeTexture)) {
          var cache = this._getCache(nativeTexture);

          var prevMemUsage = cache.memoryUsage;
          cache.clear();

          this._cachedNativeTextures.delete(nativeTexture);

          this._addMemoryUsage(cache.memoryUsage - prevMemUsage);
        }
      }
    }, {
      key: "getTintTexture",
      value: function getTintTexture(nativeTexture, color) {
        var frame = this.stage.frameCounter;

        this._cachedNativeTextures.add(nativeTexture);

        var cache = this._getCache(nativeTexture);

        var item = cache.get(color);
        item.lf = frame;

        if (item.tx) {
          if (nativeTexture.update > item.u) {
            // Native texture was updated in the mean time: renew.
            this._tintTexture(item.tx, nativeTexture, color);
          }

          return item.tx;
        } else {
          var before = cache.memoryUsage; // Find blanco tint texture.

          var target = cache.reuseTexture(frame);

          if (target) {
            target.ctx.clearRect(0, 0, target.width, target.height);
          } else {
            // Allocate new.
            target = document.createElement('canvas');
            target.width = nativeTexture.w;
            target.height = nativeTexture.h;
            target.ctx = target.getContext('2d');
          }

          this._tintTexture(target, nativeTexture, color);

          cache.set(color, target, frame);
          var after = cache.memoryUsage;

          if (after !== before) {
            this._addMemoryUsage(after - before);
          }

          return target;
        }
      }
    }, {
      key: "_tintTexture",
      value: function _tintTexture(target, source, color) {
        var col = color.toString(16);

        while (col.length < 6) {
          col = "0" + col;
        }

        target.ctx.fillStyle = '#' + col;
        target.ctx.globalCompositeOperation = 'copy';
        target.ctx.fillRect(0, 0, source.w, source.h);
        target.ctx.globalCompositeOperation = 'multiply';
        target.ctx.drawImage(source, 0, 0, source.w, source.h, 0, 0, target.width, target.height); // Alpha-mix the texture.

        target.ctx.globalCompositeOperation = 'destination-in';
        target.ctx.drawImage(source, 0, 0, source.w, source.h, 0, 0, target.width, target.height);
      }
    }, {
      key: "_hasCache",
      value: function _hasCache(nativeTexture) {
        return !!nativeTexture._tintCache;
      }
    }, {
      key: "_getCache",
      value: function _getCache(nativeTexture) {
        if (!nativeTexture._tintCache) {
          nativeTexture._tintCache = new C2dTintCache(nativeTexture);
        }

        return nativeTexture._tintCache;
      }
    }, {
      key: "gc",
      value: function gc() {
        var _this = this;

        var aggressive = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
        var frame = this.stage.frameCounter;
        var delta = 0;

        this._cachedNativeTextures.forEach(function (texture) {
          _newArrowCheck(this, _this);

          var cache = this._getCache(texture);

          if (aggressive) {
            delta += cache.memoryUsage;
            texture.clear();
          } else {
            var before = cache.memoryUsage;
            cache.cleanup(frame);
            cache.releaseBlancoTextures();
            delta += cache.memoryUsage - before;
          }
        }.bind(this));

        if (aggressive) {
          this._cachedNativeTextures.clear();
        }

        if (delta) {
          this._addMemoryUsage(delta);
        }
      }
    }]);

    return C2dTextureTintManager;
  }();

  var C2dTintCache =
  /*#__PURE__*/
  function () {
    function C2dTintCache(nativeTexture) {
      _classCallCheck(this, C2dTintCache);

      this._tx = nativeTexture;
      this._colors = new Map();
      this._blancoTextures = null;
      this._lastCleanupFrame = 0;
      this._memTextures = 0;
    }

    _createClass(C2dTintCache, [{
      key: "releaseBlancoTextures",
      value: function releaseBlancoTextures() {
        this._memTextures -= this._blancoTextures.length;
        this._blancoTextures = [];
      }
    }, {
      key: "clear",
      value: function clear() {
        // Dereference the textures.
        this._blancoTextures = null;

        this._colors.clear();

        this._memTextures = 0;
      }
    }, {
      key: "get",
      value: function get(color) {
        var item = this._colors.get(color);

        if (!item) {
          item = {
            lf: -1,
            tx: undefined,
            u: -1
          };

          this._colors.set(color, item);
        }

        return item;
      }
    }, {
      key: "set",
      value: function set(color, texture, frame) {
        var item = this.get(color);
        item.lf = frame;
        item.tx = texture;
        item.u = frame;
        this._memTextures++;
      }
    }, {
      key: "cleanup",
      value: function cleanup(frame) {
        var _this2 = this;

        // We only need to clean up once per frame.
        if (this._lastCleanupFrame !== frame) {
          // We limit blanco textures reuse to one frame only to prevent memory usage growth.
          this._blancoTextures = [];

          this._colors.forEach(function (item, color) {
            _newArrowCheck(this, _this2);

            // Clean up entries that were not used last frame.
            if (item.lf < frame - 1) {
              if (item.tx) {
                // Keep as reusable blanco texture.
                this._blancoTextures.push(item.tx);
              }

              this._colors.delete(color);
            }
          }.bind(this));

          this._lastCleanupFrame = frame;
        }
      }
    }, {
      key: "reuseTexture",
      value: function reuseTexture(frame) {
        // Try to reuse textures, because creating them every frame is expensive.
        this.cleanup(frame);

        if (this._blancoTextures && this._blancoTextures.length) {
          this._memTextures--;
          return this._blancoTextures.pop();
        }
      }
    }, {
      key: "memoryUsage",
      get: function get() {
        return this._memTextures * this._tx.w * this._tx.h;
      }
    }]);

    return C2dTintCache;
  }();

  var C2dRenderer =
  /*#__PURE__*/
  function (_Renderer) {
    _inherits(C2dRenderer, _Renderer);

    function C2dRenderer(stage) {
      var _this;

      _classCallCheck(this, C2dRenderer);

      _this = _possibleConstructorReturn(this, _getPrototypeOf(C2dRenderer).call(this, stage));
      _this.tintManager = new C2dTextureTintManager(stage);

      _this.setupC2d(_this.stage.c2d.canvas);

      return _this;
    }

    _createClass(C2dRenderer, [{
      key: "destroy",
      value: function destroy() {
        this.tintManager.destroy();
      }
    }, {
      key: "_createDefaultShader",
      value: function _createDefaultShader(ctx) {
        return new DefaultShader$1(ctx);
      }
    }, {
      key: "_getShaderBaseType",
      value: function _getShaderBaseType() {
        return C2dShader;
      }
    }, {
      key: "_getShaderAlternative",
      value: function _getShaderAlternative(shaderType) {
        return shaderType.getC2d && shaderType.getC2d();
      }
    }, {
      key: "createCoreQuadList",
      value: function createCoreQuadList(ctx) {
        return new C2dCoreQuadList(ctx);
      }
    }, {
      key: "createCoreQuadOperation",
      value: function createCoreQuadOperation(ctx, shader, shaderOwner, renderTextureInfo, scissor, index) {
        return new C2dCoreQuadOperation(ctx, shader, shaderOwner, renderTextureInfo, scissor, index);
      }
    }, {
      key: "createCoreRenderExecutor",
      value: function createCoreRenderExecutor(ctx) {
        return new C2dCoreRenderExecutor(ctx);
      }
    }, {
      key: "createCoreRenderState",
      value: function createCoreRenderState(ctx) {
        return new CoreRenderState(ctx);
      }
    }, {
      key: "createRenderTexture",
      value: function createRenderTexture(w, h, pw, ph) {
        var canvas = document.createElement('canvas');
        canvas.width = pw;
        canvas.height = ph;
        this.setupC2d(canvas);
        return canvas;
      }
    }, {
      key: "freeRenderTexture",
      value: function freeRenderTexture(nativeTexture) {
        this.tintManager.delete(nativeTexture);
      }
    }, {
      key: "gc",
      value: function gc(aggressive) {
        this.tintManager.gc(aggressive);
      }
    }, {
      key: "uploadTextureSource",
      value: function uploadTextureSource(textureSource, options) {
        // For canvas, we do not need to upload.
        if (options.source.buffer) {
          // Convert RGBA buffer to canvas.
          var canvas = document.createElement('canvas');
          canvas.width = options.w;
          canvas.height = options.h;
          var imageData = new ImageData(new Uint8ClampedArray(options.source.buffer), options.w, options.h);
          canvas.getContext('2d').putImageData(imageData, 0, 0);
          return canvas;
        }

        return options.source;
      }
    }, {
      key: "freeTextureSource",
      value: function freeTextureSource(textureSource) {
        this.tintManager.delete(textureSource.nativeTexture);
      }
    }, {
      key: "addQuad",
      value: function addQuad(renderState, quads, index) {
        // Render context changes while traversing so we save it by ref.
        var elementCore = quads.quadElements[index];
        quads.setRenderContext(index, elementCore._renderContext);
        quads.setWhite(index, elementCore.isWhite());
        quads.setSimpleTc(index, elementCore.hasSimpleTexCoords());
      }
    }, {
      key: "isRenderTextureReusable",
      value: function isRenderTextureReusable(renderState, renderTextureInfo) {
        // @todo: check render coords/matrix, maybe move this to core?
        return false;
      }
    }, {
      key: "finishRenderState",
      value: function finishRenderState(renderState) {}
    }, {
      key: "setupC2d",
      value: function setupC2d(canvas) {
        var ctx = canvas.getContext('2d');
        canvas.ctx = ctx;
        ctx._scissor = null; // Save base state so we can restore the defaults later.

        canvas.ctx.save();
      }
    }]);

    return C2dRenderer;
  }(Renderer);

  var ImageWorker =
  /*#__PURE__*/
  function () {
    function ImageWorker() {

      _classCallCheck(this, ImageWorker);

      this._items = new Map();
      this._id = 0;

      this._initWorker();
    }

    _createClass(ImageWorker, [{
      key: "destroy",
      value: function destroy() {
        if (this._worker) {
          this._worker.terminate();
        }
      }
    }, {
      key: "_initWorker",
      value: function _initWorker() {
        var _this = this;

        var code = `(${createWorker.toString()})()`;
        var blob = new Blob([code.replace('"use strict";', '')]); // firefox adds "use strict"; to any function which might block worker execution so knock it off

        var blobURL = (window.URL ? URL : webkitURL).createObjectURL(blob, {
          type: 'application/javascript; charset=utf-8'
        });
        this._worker = new Worker(blobURL);

        this._worker.postMessage({
          type: 'config',
          config: {
            path: window.location.href
          }
        });

        this._worker.onmessage = function (e) {
          _newArrowCheck(this, _this);

          if (e.data && e.data.id) {
            var id = e.data.id;

            var item = this._items.get(id);

            if (item) {
              if (e.data.type == 'data') {
                this.finish(item, e.data.info);
              } else {
                this.error(item, e.data.info);
              }
            }
          }
        }.bind(this);
      }
    }, {
      key: "create",
      value: function create(src) {
        var id = ++this._id;
        var item = new ImageWorkerImage(this, id, src);

        this._items.set(id, item);

        this._worker.postMessage({
          type: "add",
          id: id,
          src: src
        });

        return item;
      }
    }, {
      key: "cancel",
      value: function cancel(image) {
        this._worker.postMessage({
          type: "cancel",
          id: image.id
        });

        this._items.delete(image.id);
      }
    }, {
      key: "error",
      value: function error(image, info) {
        image.error(info);

        this._items.delete(image.id);
      }
    }, {
      key: "finish",
      value: function finish(image, info) {
        image.load(info);

        this._items.delete(image.id);
      }
    }]);

    return ImageWorker;
  }();

  var ImageWorkerImage =
  /*#__PURE__*/
  function () {
    function ImageWorkerImage(manager, id, src) {
      _classCallCheck(this, ImageWorkerImage);

      this._manager = manager;
      this._id = id;
      this._src = src;
      this._onError = null;
      this._onLoad = null;
    }

    _createClass(ImageWorkerImage, [{
      key: "cancel",
      value: function cancel() {
        this._manager.cancel(this);
      }
    }, {
      key: "load",
      value: function load(info) {
        if (this._onLoad) {
          this._onLoad(info);
        }
      }
    }, {
      key: "error",
      value: function error(info) {
        if (this._onError) {
          this._onError(info);
        }
      }
    }, {
      key: "id",
      get: function get() {
        return this._id;
      }
    }, {
      key: "src",
      get: function get() {
        return this._src;
      }
    }, {
      key: "onError",
      set: function set(f) {
        this._onError = f;
      }
    }, {
      key: "onLoad",
      set: function set(f) {
        this._onLoad = f;
      }
    }]);

    return ImageWorkerImage;
  }();
  /**
   * Notice that, within the createWorker function, we must only use ES5 code to keep it ES5-valid after babelifying, as
   *  the converted code of this section is converted to a blob and used as the js of the web worker thread.
   */


  var createWorker = function createWorker() {
    function ImageWorkerServer() {
      this.items = new Map();
      var t = this;

      onmessage = function onmessage(e) {
        t._receiveMessage(e);
      };
    }

    ImageWorkerServer.isPathAbsolute = function (path) {
      return /^(?:\/|[a-z]+:\/\/)/.test(path);
    };

    ImageWorkerServer.prototype._receiveMessage = function (e) {
      if (e.data.type === 'config') {
        this.config = e.data.config;
        var base = this.config.path;
        var parts = base.split("/");
        parts.pop();
        this._relativeBase = parts.join("/") + "/";
      } else if (e.data.type === 'add') {
        this.add(e.data.id, e.data.src);
      } else if (e.data.type === 'cancel') {
        this.cancel(e.data.id);
      }
    };

    ImageWorkerServer.prototype.add = function (id, src) {
      // Convert relative URLs.
      if (!ImageWorkerServer.isPathAbsolute(src)) {
        src = this._relativeBase + src;
      }

      if (src.substr(0, 2) === "//") {
        // This doesn't work for image workers.
        src = "http:" + src;
      }

      var item = new ImageWorkerServerItem(id, src);
      var t = this;

      item.onFinish = function (result) {
        t.finish(item, result);
      };

      item.onError = function (info) {
        t.error(item, info);
      };

      this.items.set(id, item);
      item.start();
    };

    ImageWorkerServer.prototype.cancel = function (id) {
      var item = this.items.get(id);

      if (item) {
        item.cancel();
        this.items.delete(id);
      }
    };

    ImageWorkerServer.prototype.finish = function (item, _ref) {
      var imageBitmap = _ref.imageBitmap,
          hasAlphaChannel = _ref.hasAlphaChannel;
      postMessage({
        type: "data",
        id: item.id,
        info: {
          imageBitmap,
          hasAlphaChannel
        }
      }, [imageBitmap]);
      this.items.delete(item.id);
    };

    ImageWorkerServer.prototype.error = function (item, _ref2) {
      var type = _ref2.type,
          message = _ref2.message;
      postMessage({
        type: "error",
        id: item.id,
        info: {
          type,
          message
        }
      });
      this.items.delete(item.id);
    };

    ImageWorkerServer.isWPEBrowser = function () {
      return navigator.userAgent.indexOf("WPE") !== -1;
    };

    function ImageWorkerServerItem(id, src) {
      this._onError = undefined;
      this._onFinish = undefined;
      this._id = id;
      this._src = src;
      this._xhr = undefined;
      this._mimeType = undefined;
      this._canceled = false;
    }

    Object.defineProperty(ImageWorkerServerItem.prototype, 'id', {
      get: function get() {
        return this._id;
      }
    });
    Object.defineProperty(ImageWorkerServerItem.prototype, 'onFinish', {
      get: function get() {
        return this._onFinish;
      },
      set: function set(f) {
        this._onFinish = f;
      }
    });
    Object.defineProperty(ImageWorkerServerItem.prototype, 'onError', {
      get: function get() {
        return this._onError;
      },
      set: function set(f) {
        this._onError = f;
      }
    });

    ImageWorkerServerItem.prototype.start = function () {
      this._xhr = new XMLHttpRequest();

      this._xhr.open("GET", this._src, true);

      this._xhr.responseType = "blob";
      var t = this;

      this._xhr.onerror = function (oEvent) {
        t.error({
          type: "connection",
          message: "Connection error"
        });
      };

      this._xhr.onload = function (oEvent) {
        var blob = t._xhr.response;
        t._mimeType = blob.type;

        t._createImageBitmap(blob);
      };

      this._xhr.send();
    };

    ImageWorkerServerItem.prototype._createImageBitmap = function (blob) {
      var t = this;
      createImageBitmap(blob, {
        premultiplyAlpha: 'premultiply',
        colorSpaceConversion: 'none',
        imageOrientation: 'none'
      }).then(function (imageBitmap) {
        t.finish({
          imageBitmap,
          hasAlphaChannel: t._hasAlphaChannel()
        });
      }).catch(function (e) {
        t.error({
          type: "parse",
          message: "Error parsing image data"
        });
      });
    };

    ImageWorkerServerItem.prototype._hasAlphaChannel = function () {
      if (ImageWorkerServer.isWPEBrowser()) {
        // When using unaccelerated rendering image (https://github.com/WebPlatformForEmbedded/WPEWebKit/blob/wpe-20170728/Source/WebCore/html/ImageBitmap.cpp#L52),
        // everything including JPG images are in RGBA format. Upload is way faster when using an alpha channel.
        // @todo: after hardware acceleration is fixed and re-enabled, JPG should be uploaded in RGB to get the best possible performance and memory usage.
        return true;
      } else {
        return this._mimeType.indexOf("image/png") !== -1;
      }
    };

    ImageWorkerServerItem.prototype.cancel = function () {
      if (this._canceled) return;

      if (this._xhr) {
        this._xhr.abort();
      }

      this._canceled = true;
    };

    ImageWorkerServerItem.prototype.error = function (type, message) {
      if (!this._canceled && this._onError) {
        this._onError({
          type,
          message
        });
      }
    };

    ImageWorkerServerItem.prototype.finish = function (info) {
      if (!this._canceled && this._onFinish) {
        this._onFinish(info);
      }
    };

    var worker = new ImageWorkerServer();
  };

  /**
   * Platform-specific functionality.
   * Copyright Metrological, 2017;
   */

  var WebPlatform =
  /*#__PURE__*/
  function () {
    function WebPlatform() {
      _classCallCheck(this, WebPlatform);
    }

    _createClass(WebPlatform, [{
      key: "init",
      value: function init(stage) {
        this.stage = stage;
        this._looping = false;
        this._awaitingLoop = false;

        if (this.stage.getOption("useImageWorker")) {
          if (!window.createImageBitmap || !window.Worker) {
            console.warn("Can't use image worker because browser does not have createImageBitmap and Web Worker support");
          } else {
            console.log('Using image worker!');
            this._imageWorker = new ImageWorker();
          }
        }
      }
    }, {
      key: "destroy",
      value: function destroy() {
        if (this._imageWorker) {
          this._imageWorker.destroy();
        }

        this._removeKeyHandler();
      }
    }, {
      key: "startLoop",
      value: function startLoop() {
        this._looping = true;

        if (!this._awaitingLoop) {
          this.loop();
        }
      }
    }, {
      key: "stopLoop",
      value: function stopLoop() {
        this._looping = false;
      }
    }, {
      key: "loop",
      value: function loop() {
        var self = this;

        var lp = function lp() {
          self._awaitingLoop = false;

          if (self._looping) {
            self.stage.drawFrame();
            requestAnimationFrame(lp);
            self._awaitingLoop = true;
          }
        };

        requestAnimationFrame(lp);
      }
    }, {
      key: "uploadGlTexture",
      value: function uploadGlTexture(gl, textureSource, source, options) {
        if (source instanceof ImageData || source instanceof HTMLImageElement || source instanceof HTMLCanvasElement || source instanceof HTMLVideoElement || window.ImageBitmap && source instanceof ImageBitmap) {
          // Web-specific data types.
          gl.texImage2D(gl.TEXTURE_2D, 0, options.internalFormat, options.format, options.type, source);
        } else {
          gl.texImage2D(gl.TEXTURE_2D, 0, options.internalFormat, textureSource.w, textureSource.h, 0, options.format, options.type, source);
        }
      }
    }, {
      key: "loadSrcTexture",
      value: function loadSrcTexture(_ref, cb) {
        var src = _ref.src,
            hasAlpha = _ref.hasAlpha;
        var cancelCb = undefined;
        var isPng = src.indexOf(".png") >= 0;

        if (this._imageWorker) {
          // WPE-specific image parser.
          var image = this._imageWorker.create(src);

          image.onError = function (err) {
            return cb("Image load error");
          };

          image.onLoad = function (_ref2) {
            var imageBitmap = _ref2.imageBitmap,
                hasAlphaChannel = _ref2.hasAlphaChannel;
            cb(null, {
              source: imageBitmap,
              renderInfo: {
                src: src
              },
              hasAlpha: hasAlphaChannel,
              premultiplyAlpha: true
            });
          };

          cancelCb = function cancelCb() {
            image.cancel();
          };
        } else {
          var _image = new Image();

          if (!(src.substr(0, 5) == "data:")) {
            // Base64.
            _image.crossOrigin = "Anonymous";
          }

          _image.onerror = function (err) {
            // Ignore error message when cancelled.
            if (_image.src) {
              return cb("Image load error");
            }
          };

          _image.onload = function () {
            cb(null, {
              source: _image,
              renderInfo: {
                src: src
              },
              hasAlpha: isPng || hasAlpha
            });
          };

          _image.src = src;

          cancelCb = function cancelCb() {
            _image.onerror = null;
            _image.onload = null;

            _image.removeAttribute('src');
          };
        }

        return cancelCb;
      }
    }, {
      key: "createWebGLContext",
      value: function createWebGLContext(w, h) {
        var canvas = this.stage.getOption('canvas') || document.createElement('canvas');

        if (w && h) {
          canvas.width = w;
          canvas.height = h;
        }

        var opts = {
          alpha: true,
          antialias: false,
          premultipliedAlpha: true,
          stencil: true,
          preserveDrawingBuffer: false
        };
        var gl = canvas.getContext('webgl', opts) || canvas.getContext('experimental-webgl', opts);

        if (!gl) {
          throw new Error('This browser does not support webGL.');
        }

        return gl;
      }
    }, {
      key: "createCanvasContext",
      value: function createCanvasContext(w, h) {
        var canvas = this.stage.getOption('canvas') || document.createElement('canvas');

        if (w && h) {
          canvas.width = w;
          canvas.height = h;
        }

        var c2d = canvas.getContext('2d');

        if (!c2d) {
          throw new Error('This browser does not support 2d canvas.');
        }

        return c2d;
      }
    }, {
      key: "getHrTime",
      value: function getHrTime() {
        return window.performance ? window.performance.now() : new Date().getTime();
      }
    }, {
      key: "getDrawingCanvas",
      value: function getDrawingCanvas() {
        // We can't reuse this canvas because textures may load async.
        return document.createElement('canvas');
      }
    }, {
      key: "getTextureOptionsForDrawingCanvas",
      value: function getTextureOptionsForDrawingCanvas(canvas) {
        var options = {};
        options.source = canvas;
        return options;
      }
    }, {
      key: "nextFrame",
      value: function nextFrame(changes) {
        /* WebGL blits automatically */
      }
    }, {
      key: "registerKeydownHandler",
      value: function registerKeydownHandler(keyhandler) {
        var _this = this;

        this._keydownListener = function (e) {
          _newArrowCheck(this, _this);

          keyhandler(e);
        }.bind(this);

        window.addEventListener('keydown', this._keydownListener);
      }
    }, {
      key: "registerKeyupHandler",
      value: function registerKeyupHandler(keyhandler) {
        var _this2 = this;

        this._keyupListener = function (e) {
          _newArrowCheck(this, _this2);

          keyhandler(e);
        }.bind(this);

        window.addEventListener('keyup', this._keyupListener);
      }
    }, {
      key: "_removeKeyHandler",
      value: function _removeKeyHandler() {
        if (this._keydownListener) {
          window.removeEventListener('keydown', this._keydownListener);
        }

        if (this._keyupListener) {
          window.removeEventListener('keyup', this._keyupListener);
        }
      }
    }]);

    return WebPlatform;
  }();

  var PlatformLoader =
  /*#__PURE__*/
  function () {
    function PlatformLoader() {
      _classCallCheck(this, PlatformLoader);
    }

    _createClass(PlatformLoader, null, [{
      key: "load",
      value: function load(options) {
        if (options.platform) {
          return options.platform;
        } else {
          return WebPlatform;
        }
      }
    }]);

    return PlatformLoader;
  }();

  var Utils$1 =
  /*#__PURE__*/
  function () {
    function Utils() {
      _classCallCheck(this, Utils);
    }

    _createClass(Utils, null, [{
      key: "isFunction",
      value: function isFunction(value) {
        return typeof value === 'function';
      }
    }, {
      key: "isNumber",
      value: function isNumber(value) {
        return typeof value === 'number';
      }
    }, {
      key: "isInteger",
      value: function isInteger(value) {
        return typeof value === 'number' && value % 1 === 0;
      }
    }, {
      key: "isBoolean",
      value: function isBoolean(value) {
        return value === true || value === false;
      }
    }, {
      key: "isString",
      value: function isString(value) {
        return typeof value == 'string';
      }
    }, {
      key: "isObject",
      value: function isObject(value) {
        var type = typeof value;
        return !!value && (type == 'object' || type == 'function');
      }
    }, {
      key: "isPlainObject",
      value: function isPlainObject(value) {
        var type = typeof value;
        return !!value && type == 'object';
      }
    }, {
      key: "isObjectLiteral",
      value: function isObjectLiteral(value) {
        return typeof value === 'object' && value && value.constructor === Object;
      }
    }, {
      key: "getArrayIndex",
      value: function getArrayIndex(index, arr) {
        return Utils.getModuloIndex(index, arr.length);
      }
    }, {
      key: "equalValues",
      value: function equalValues(v1, v2) {
        if (typeof v1 !== typeof v2) return false;

        if (Utils.isObjectLiteral(v1)) {
          return Utils.isObjectLiteral(v2) && Utils.equalObjectLiterals(v1, v2);
        } else if (Array.isArray(v1)) {
          return Array.isArray(v2) && Utils.equalArrays(v1, v2);
        } else {
          return v1 === v2;
        }
      }
    }, {
      key: "equalObjectLiterals",
      value: function equalObjectLiterals(obj1, obj2) {
        var keys1 = Object.keys(obj1);
        var keys2 = Object.keys(obj2);

        if (keys1.length !== keys2.length) {
          return false;
        }

        for (var i = 0, n = keys1.length; i < n; i++) {
          var k1 = keys1[i];
          var k2 = keys2[i];

          if (k1 !== k2) {
            return false;
          }

          var v1 = obj1[k1];
          var v2 = obj2[k2];

          if (!Utils.equalValues(v1, v2)) {
            return false;
          }
        }

        return true;
      }
    }, {
      key: "equalArrays",
      value: function equalArrays(v1, v2) {
        if (v1.length !== v2.length) {
          return false;
        }

        for (var i = 0, n = v1.length; i < n; i++) {
          if (!this.equalValues(v1[i], v2[i])) {
            return false;
          }
        }

        return true;
      }
    }]);

    return Utils;
  }();
  /**
   * Maintains the state of a WebGLRenderingContext.
   */


  var WebGLState =
  /*#__PURE__*/
  function () {
    function WebGLState(id, gl) {
      _classCallCheck(this, WebGLState);

      this._id = id;
      this._gl = gl;
      this._program = undefined;
      this._buffers = new Map();
      this._framebuffers = new Map();
      this._renderbuffers = new Map(); // Contains vertex attribute definition arrays (enabled, size, type, normalized, stride, offset).

      this._vertexAttribs = new Array(16);
      this._nonDefaultFlags = new Set();
      this._settings = new Map();
      this._textures = new Array(8);
      this._maxTexture = 0;
      this._activeTexture = gl.TEXTURE0;
      this._pixelStorei = new Array(5);
    }

    _createClass(WebGLState, [{
      key: "_getDefaultFlag",
      value: function _getDefaultFlag(cap) {
        return cap === this._gl.DITHER;
      }
    }, {
      key: "setFlag",
      value: function setFlag(cap, v) {
        var def = this._getDefaultFlag(cap);

        if (v === def) {
          return this._nonDefaultFlags.delete(cap);
        } else {
          if (!this._nonDefaultFlags.has(cap)) {
            this._nonDefaultFlags.add(cap);

            return true;
          } else {
            return false;
          }
        }
      }
    }, {
      key: "setBuffer",
      value: function setBuffer(target, buffer) {
        var change = this._buffers.get(target) !== buffer;

        this._buffers.set(target, buffer);

        if (change && target === this._gl.ARRAY_BUFFER) {
          // When the array buffer is changed all attributes are cleared.
          this._vertexAttribs = [];
        }

        return change;
      }
    }, {
      key: "setFramebuffer",
      value: function setFramebuffer(target, buffer) {
        var change = this._framebuffers.get(target) !== buffer;

        this._framebuffers.set(target, buffer);

        return change;
      }
    }, {
      key: "setRenderbuffer",
      value: function setRenderbuffer(target, buffer) {
        var change = this._renderbuffers.get(target) !== buffer;

        this._renderbuffers.set(target, buffer);

        return change;
      }
    }, {
      key: "setProgram",
      value: function setProgram(program) {
        var change = this._program !== program;
        this._program = program;
        return change;
      }
    }, {
      key: "setSetting",
      value: function setSetting(func, v) {
        var s = this._settings.get(func);

        var change = !s || !Utils$1.equalValues(s, v);

        this._settings.set(func, v);

        return change;
      }
    }, {
      key: "disableVertexAttribArray",
      value: function disableVertexAttribArray(index) {
        var va = this._vertexAttribs[index];

        if (va && va[5]) {
          va[5] = false;
          return true;
        }

        return false;
      }
    }, {
      key: "enableVertexAttribArray",
      value: function enableVertexAttribArray(index) {
        var va = this._vertexAttribs[index];

        if (va) {
          if (!va[0]) {
            va[0] = true;
            return true;
          }
        } else {
          this._vertexAttribs[index] = [0, 0, 0, 0, 0, true];
          return true;
        }

        return false;
      }
    }, {
      key: "vertexAttribPointer",
      value: function vertexAttribPointer(index, props) {
        var va = this._vertexAttribs[index];
        var equal = false;

        if (va) {
          equal = va[0] === props[0] && va[1] === props[1] && va[2] === props[2] && va[3] === props[3] && va[4] === props[4];
        }

        if (equal) {
          return false;
        } else {
          props[5] = va ? va[5] : false;
          return true;
        }
      }
    }, {
      key: "setActiveTexture",
      value: function setActiveTexture(texture) {
        var changed = this._activeTexture !== texture;
        this._activeTexture = texture;
        return changed;
      }
    }, {
      key: "bindTexture",
      value: function bindTexture(target, texture) {
        var activeIndex = WebGLState._getTextureIndex(this._activeTexture);

        this._maxTexture = Math.max(this._maxTexture, activeIndex + 1);
        var current = this._textures[activeIndex];

        var targetIndex = WebGLState._getTextureTargetIndex(target);

        if (current) {
          if (current[targetIndex] === texture) {
            return false;
          }

          current[targetIndex] = texture;
          return true;
        } else {
          if (texture) {
            this._textures[activeIndex] = [];
            this._textures[activeIndex][targetIndex] = texture;
            return true;
          } else {
            return false;
          }
        }
      }
    }, {
      key: "setPixelStorei",
      value: function setPixelStorei(pname, param) {
        var i = WebGLState._getPixelStoreiIndex(pname);

        var change = !Utils$1.equalValues(this._pixelStorei[i], param);
        this._pixelStorei[i] = param;
        return change;
      }
    }, {
      key: "migrate",
      value: function migrate(s) {
        var t = this; // Warning: migrate should call the original prototype methods directly.

        this._migrateFlags(t, s); // useProgram


        if (s._program !== t._program) {
          this._gl._useProgram(s._program);
        }

        this._migrateFramebuffers(t, s);

        this._migrateRenderbuffers(t, s);

        var buffersChanged = this._migrateBuffers(t, s);

        this._migrateAttributes(t, s, buffersChanged);

        this._migrateFlags(t, s);

        this._migrateSettings(t, s);

        this._migratePixelStorei(t, s);

        this._migrateTextures(t, s);
      }
    }, {
      key: "_migratePixelStorei",
      value: function _migratePixelStorei(t, s) {
        for (var i = 0, n = t._pixelStorei.length; i < n; i++) {
          if (t._pixelStorei[i] !== s._pixelStorei[i]) {
            var value = s._pixelStorei[i] !== undefined ? s._pixelStorei[i] : WebGLState._getDefaultPixelStoreiByIndex(i);

            this._gl._pixelStorei(WebGLState._getPixelStoreiByIndex(i), value);
          }
        }
      }
    }, {
      key: "_migrateTextures",
      value: function _migrateTextures(t, s) {
        var max = Math.max(t._maxTexture, s._maxTexture);
        var activeTexture = t._activeTexture;

        for (var i = 0; i < max; i++) {
          var sTargets = s._textures[i];
          var tTargets = t._textures[i];

          var textureNumb = WebGLState._getTextureByIndex(i);

          var targetMax = Math.max(tTargets ? tTargets.length : 0, sTargets ? sTargets.length : 0);

          for (var j = 0, n = targetMax; j < n; j++) {
            var target = WebGLState._getTextureTargetByIndex(j);

            if (activeTexture !== textureNumb) {
              this._gl._activeTexture(textureNumb);

              activeTexture = textureNumb;
            }

            var texture = sTargets && sTargets[j] || null;

            this._gl._bindTexture(target, texture);
          }
        }

        if (s._activeTexture !== activeTexture) {
          this._gl._activeTexture(s._activeTexture);
        }
      }
    }, {
      key: "_migrateBuffers",
      value: function _migrateBuffers(t, s) {
        var _this = this;

        s._buffers.forEach(function (framebuffer, target) {
          _newArrowCheck(this, _this);

          if (t._buffers.get(target) !== framebuffer) {
            this._gl._bindBuffer(target, framebuffer);
          }
        }.bind(this));

        t._buffers.forEach(function (buffer, target) {
          _newArrowCheck(this, _this);

          var b = s._buffers.get(target);

          if (b === undefined) {
            this._gl._bindBuffer(target, null);
          }
        }.bind(this));

        return s._buffers.get(this._gl.ARRAY_BUFFER) !== t._buffers.get(this._gl.ARRAY_BUFFER);
      }
    }, {
      key: "_migrateFramebuffers",
      value: function _migrateFramebuffers(t, s) {
        var _this2 = this;

        s._framebuffers.forEach(function (framebuffer, target) {
          _newArrowCheck(this, _this2);

          if (t._framebuffers.get(target) !== framebuffer) {
            this._gl._bindFramebuffer(target, framebuffer);
          }
        }.bind(this));

        t._framebuffers.forEach(function (framebuffer, target) {
          _newArrowCheck(this, _this2);

          var fb = s._framebuffers.get(target);

          if (fb === undefined) {
            this._gl._bindFramebuffer(target, null);
          }
        }.bind(this));
      }
    }, {
      key: "_migrateRenderbuffers",
      value: function _migrateRenderbuffers(t, s) {
        var _this3 = this;

        s._renderbuffers.forEach(function (renderbuffer, target) {
          _newArrowCheck(this, _this3);

          if (t._renderbuffers.get(target) !== renderbuffer) {
            this._gl._bindRenderbuffer(target, renderbuffer);
          }
        }.bind(this));

        t._renderbuffers.forEach(function (renderbuffer, target) {
          _newArrowCheck(this, _this3);

          var fb = s._renderbuffers.get(target);

          if (fb === undefined) {
            this._gl._bindRenderbuffer(target, null);
          }
        }.bind(this));
      }
    }, {
      key: "_migrateAttributes",
      value: function _migrateAttributes(t, s, buffersChanged) {
        var _this4 = this;

        if (!buffersChanged) {
          t._vertexAttribs.forEach(function (attrib, index) {
            _newArrowCheck(this, _this4);

            if (!s._vertexAttribs[index]) {
              // We can't 'delete' a vertex attrib so we'll disable it.
              this._gl._disableVertexAttribArray(index);
            }
          }.bind(this));

          s._vertexAttribs.forEach(function (attrib, index) {
            _newArrowCheck(this, _this4);

            this._gl._vertexAttribPointer(index, attrib[0], attrib[1], attrib[2], attrib[4]);

            if (attrib[5]) {
              this._gl._enableVertexAttribArray(index);
            } else {
              this._gl._disableVertexAttribArray(index);
            }
          }.bind(this));
        } else {
          // When buffers are changed, previous attributes were reset automatically.
          s._vertexAttribs.forEach(function (attrib, index) {
            _newArrowCheck(this, _this4);

            if (attrib[0]) {
              // Do not set vertex attrib pointer when it was just the default value.
              this._gl._vertexAttribPointer(index, attrib[0], attrib[1], attrib[2], attrib[3], attrib[4]);
            }

            if (attrib[5]) {
              this._gl._enableVertexAttribArray(index);
            }
          }.bind(this));
        }
      }
    }, {
      key: "_migrateSettings",
      value: function _migrateSettings(t, s) {
        var _this5 = this;

        var defaults = this.constructor.getDefaultSettings();

        t._settings.forEach(function (value, func) {
          _newArrowCheck(this, _this5);

          var name = func.name || func.xname;

          if (!s._settings.has(func)) {
            var args = defaults.get(name);

            if (Utils$1.isFunction(args)) {
              args = args(this._gl);
            } // We are actually setting the setting for optimization purposes.


            s._settings.set(func, args);

            func.apply(this._gl, args);
          }
        }.bind(this));

        s._settings.forEach(function (value, func) {
          _newArrowCheck(this, _this5);

          var tValue = t._settings.get(func);

          if (!tValue || !Utils$1.equalValues(tValue, value)) {
            func.apply(this._gl, value);
          }
        }.bind(this));
      }
    }, {
      key: "_migrateFlags",
      value: function _migrateFlags(t, s) {
        var _this6 = this;

        t._nonDefaultFlags.forEach(function (setting) {
          _newArrowCheck(this, _this6);

          if (!s._nonDefaultFlags.has(setting)) {
            if (this._getDefaultFlag(setting)) {
              this._gl._enable(setting);
            } else {
              this._gl._disable(setting);
            }
          }
        }.bind(this));

        s._nonDefaultFlags.forEach(function (setting) {
          _newArrowCheck(this, _this6);

          if (!t._nonDefaultFlags.has(setting)) {
            if (this._getDefaultFlag(setting)) {
              this._gl._disable(setting);
            } else {
              this._gl._enable(setting);
            }
          }
        }.bind(this));
      }
    }], [{
      key: "getDefaultSettings",
      value: function getDefaultSettings() {
        if (!this._defaultSettings) {
          this._defaultSettings = new Map();
          var d = this._defaultSettings;
          var g = WebGLRenderingContext.prototype;
          d.set("viewport", function (gl) {
            return [0, 0, gl.canvas.width, gl.canvas.height];
          });
          d.set("scissor", function (gl) {
            return [0, 0, gl.canvas.width, gl.canvas.height];
          });
          d.set("blendColor", [0, 0, 0, 0]);
          d.set("blendEquation", [g.FUNC_ADD]);
          d.set("blendEquationSeparate", [g.FUNC_ADD, g.FUNC_ADD]);
          d.set("blendFunc", [g.ONE, g.ZERO]);
          d.set("blendFuncSeparate", [g.ONE, g.ZERO, g.ONE, g.ZERO]);
          d.set("clearColor", [0, 0, 0, 0]);
          d.set("clearDepth", [1]);
          d.set("clearStencil", [0]);
          d.set("colorMask", [true, true, true, true]);
          d.set("cullFace", [g.BACK]);
          d.set("depthFunc", [g.LESS]);
          d.set("depthMask", [true]);
          d.set("depthRange", [0, 1]);
          d.set("frontFace", [g.CCW]);
          d.set("lineWidth", [1]);
          d.set("polygonOffset", [0, 0]);
          d.set("sampleCoverage", [1, false]);
          d.set("stencilFunc", [g.ALWAYS, 0, 1]);
          d.set("_stencilFuncSeparateFront", [g.ALWAYS, 0, 1]);
          d.set("_stencilFuncSeparateBack", [g.ALWAYS, 0, 1]);
          d.set("_stencilFuncSeparateFrontAndBack", [g.ALWAYS, 0, 1]);
          d.set("stencilMask", [1]);
          d.set("_stencilMaskSeparateFront", [1]);
          d.set("_stencilMaskSeparateBack", [1]);
          d.set("_stencilMaskSeparateFrontAndBack", [1]);
          d.set("stencilOp", [g.KEEP, g.KEEP, g.KEEP]);
          d.set("_stencilOpSeparateFront", [g.KEEP, g.KEEP, g.KEEP]);
          d.set("_stencilOpSeparateBack", [g.KEEP, g.KEEP, g.KEEP]);
          d.set("_stencilOpSeparateFrontAndBack", [g.KEEP, g.KEEP, g.KEEP]);
          d.set("vertexAttrib1f", []);
          d.set("vertexAttrib1fv", []);
          d.set("vertexAttrib2f", []);
          d.set("vertexAttrib2fv", []);
          d.set("vertexAttrib3f", []);
          d.set("vertexAttrib3fv", []);
          d.set("vertexAttrib4f", []);
          d.set("vertexAttrib4fv", []);
        }

        return this._defaultSettings;
      }
    }, {
      key: "_getTextureTargetIndex",
      value: function _getTextureTargetIndex(target) {
        switch (target) {
          case 0x0DE1:
            /* TEXTURE_2D */
            return 0;

          case 0x8513:
            /* TEXTURE_CUBE_MAP */
            return 1;

          default:
            // Shouldn't happen.
            throw new Error('Unknown texture target: ' + target);
        }
      }
    }, {
      key: "_getTextureTargetByIndex",
      value: function _getTextureTargetByIndex(index) {
        if (!this._textureTargetIndices) {
          this._textureTargetIndices = [0x0DE1, 0x8513];
        }

        return this._textureTargetIndices[index];
      }
    }, {
      key: "_getTextureIndex",
      value: function _getTextureIndex(index) {
        return index - 0x84C0
        /* GL_TEXTURE0 */
        ;
      }
    }, {
      key: "_getTextureByIndex",
      value: function _getTextureByIndex(index) {
        return index + 0x84C0;
      }
    }, {
      key: "_getPixelStoreiIndex",
      value: function _getPixelStoreiIndex(pname) {
        switch (pname) {
          case 0x0D05:
            /* PACK_ALIGNMENT */
            return 0;

          case 0x0CF5:
            /* UNPACK_ALIGNMENT */
            return 1;

          case 0x9240:
            /* UNPACK_FLIP_Y_WEBGL */
            return 2;

          case 0x9241:
            /* UNPACK_PREMULTIPLY_ALPHA_WEBGL */
            return 3;

          case 0x9243:
            /* UNPACK_COLORSPACE_CONVERSION_WEBGL */
            return 4;
          //@todo: support WebGL2 properties, see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/pixelStorei

          case 0x9245:
            /* UNPACK_FLIP_BLUE_RED */
            return 5;

          default:
            // Shouldn't happen.
            throw new Error('Unknown pixelstorei: ' + pname);
        }
      }
    }, {
      key: "_getPixelStoreiByIndex",
      value: function _getPixelStoreiByIndex(index) {
        if (!this._pixelStoreiIndices) {
          this._pixelStoreiIndices = [0x0D05, 0x0CF5, 0x9240, 0x9241, 0x9243];
        }

        return this._pixelStoreiIndices[index];
      }
    }, {
      key: "_getDefaultPixelStoreiByIndex",
      value: function _getDefaultPixelStoreiByIndex(index) {
        if (!this._pixelStoreiDefaults) {
          this._pixelStoreiDefaults = [4, 4, false, false, WebGLRenderingContext.prototype.BROWSER_DEFAULT_WEBGL];
        }

        return this._pixelStoreiDefaults[index];
      }
    }]);

    return WebGLState;
  }();

  var WebGLStateManager =
  /*#__PURE__*/
  function () {
    function WebGLStateManager() {
      _classCallCheck(this, WebGLStateManager);
    }

    _createClass(WebGLStateManager, [{
      key: "_initStateManager",
      value: function _initStateManager() {
        var id = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "default";
        this._states = {};
        this._state = this._getState(id);
      }
    }, {
      key: "_getState",
      value: function _getState(id) {
        if (!this._states[id]) {
          this._states[id] = new WebGLState(id, this);
        }

        return this._states[id];
      }
    }, {
      key: "switchState",
      value: function switchState() {
        var id = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "default";

        if (this._state._id !== id) {
          var newState = this._getState(id);

          this._state.migrate(newState);

          this._state = newState;
        }
      }
    }, {
      key: "$useProgram",
      value: function $useProgram(program) {
        if (this._state.setProgram(program)) this._useProgram(program);
      }
    }, {
      key: "$bindBuffer",
      value: function $bindBuffer(target, fb) {
        if (this._state.setBuffer(target, fb)) this._bindBuffer(target, fb);
      }
    }, {
      key: "$bindFramebuffer",
      value: function $bindFramebuffer(target, fb) {
        if (this._state.setFramebuffer(target, fb)) this._bindFramebuffer(target, fb);
      }
    }, {
      key: "$bindRenderbuffer",
      value: function $bindRenderbuffer(target, fb) {
        if (this._state.setRenderbuffer(target, fb)) this._bindRenderbuffer(target, fb);
      }
    }, {
      key: "$enable",
      value: function $enable(cap) {
        if (this._state.setFlag(cap, true)) this._enable(cap);
      }
    }, {
      key: "$disable",
      value: function $disable(cap) {
        if (this._state.setFlag(cap, false)) this._disable(cap);
      }
    }, {
      key: "$viewport",
      value: function $viewport(x, y, w, h) {
        if (this._state.setSetting(this._viewport, [x, y, w, h])) this._viewport(x, y, w, h);
      }
    }, {
      key: "$scissor",
      value: function $scissor(x, y, w, h) {
        if (this._state.setSetting(this._scissor, [x, y, w, h])) this._scissor(x, y, w, h);
      }
    }, {
      key: "$disableVertexAttribArray",
      value: function $disableVertexAttribArray(index) {
        if (this._state.disableVertexAttribArray(index)) this._disableVertexAttribArray(index);
      }
    }, {
      key: "$enableVertexAttribArray",
      value: function $enableVertexAttribArray(index) {
        if (this._state.enableVertexAttribArray(index)) this._enableVertexAttribArray(index);
      }
    }, {
      key: "$vertexAttribPointer",
      value: function $vertexAttribPointer(index, size, type, normalized, stride, offset) {
        if (this._state.vertexAttribPointer(index, [size, type, normalized, stride, offset])) this._vertexAttribPointer(index, size, type, normalized, stride, offset);
      }
    }, {
      key: "$activeTexture",
      value: function $activeTexture(texture) {
        if (this._state.setActiveTexture(texture)) this._activeTexture(texture);
      }
    }, {
      key: "$bindTexture",
      value: function $bindTexture(target, texture) {
        if (this._state.bindTexture(target, texture)) this._bindTexture(target, texture);
      }
    }, {
      key: "$pixelStorei",
      value: function $pixelStorei(pname, param) {
        if (this._state.setPixelStorei(pname, param)) {
          this._pixelStorei(pname, param);
        }
      }
    }, {
      key: "$stencilFuncSeparate",
      value: function $stencilFuncSeparate(face, func, ref, mask) {
        var f;

        switch (face) {
          case this.FRONT:
            f = this._stencilFuncSeparateFront;
            break;

          case this.BACK:
            f = this._stencilFuncSeparateBack;
            break;

          case this.FRONT_AND_BACK:
            f = this._stencilFuncSeparateFrontAndBack;
            break;
        }

        if (this._state.setSetting(f, [func, ref, mask])) f.apply(this, [func, ref, mask]);
      }
    }, {
      key: "_stencilFuncSeparateFront",
      value: function _stencilFuncSeparateFront(func, ref, mask) {
        this._stencilFuncSeparate(this.FRONT, func, ref, mask);
      }
    }, {
      key: "_stencilFuncSeparateBack",
      value: function _stencilFuncSeparateBack(func, ref, mask) {
        this._stencilFuncSeparate(this.BACK, func, ref, mask);
      }
    }, {
      key: "_stencilFuncSeparateFrontAndBack",
      value: function _stencilFuncSeparateFrontAndBack(func, ref, mask) {
        this._stencilFuncSeparate(this.FRONT_AND_BACK, func, ref, mask);
      }
    }, {
      key: "$stencilMaskSeparate",
      value: function $stencilMaskSeparate(face, mask) {
        var f;

        switch (face) {
          case this.FRONT:
            f = this._stencilMaskSeparateFront;
            break;

          case this.BACK:
            f = this._stencilMaskSeparateBack;
            break;

          case this.FRONT_AND_BACK:
            f = this._stencilMaskSeparateFrontAndBack;
            break;
        }

        if (this._state.setSetting(f, [mask])) f.apply(this, [mask]);
      }
    }, {
      key: "_stencilMaskSeparateFront",
      value: function _stencilMaskSeparateFront(mask) {
        this._stencilMaskSeparate(this.FRONT, mask);
      }
    }, {
      key: "_stencilMaskSeparateBack",
      value: function _stencilMaskSeparateBack(mask) {
        this._stencilMaskSeparate(this.BACK, mask);
      }
    }, {
      key: "_stencilMaskSeparateFrontAndBack",
      value: function _stencilMaskSeparateFrontAndBack(mask) {
        this._stencilMaskSeparate(this.FRONT_AND_BACK, mask);
      }
    }, {
      key: "$stencilOpSeparate",
      value: function $stencilOpSeparate(face, fail, zfail, zpass) {
        var f;

        switch (face) {
          case this.FRONT:
            f = this._stencilOpSeparateFront;
            break;

          case this.BACK:
            f = this._stencilOpSeparateBack;
            break;

          case this.FRONT_AND_BACK:
            f = this._stencilOpSeparateFrontAndBack;
            break;
        }

        if (this._state.setSetting(f, [fail, zfail, zpass])) f.apply(this, [fail, zfail, zpass]);
      }
    }, {
      key: "_stencilOpSeparateFront",
      value: function _stencilOpSeparateFront(fail, zfail, zpass) {
        this._stencilOpSeparate(this.FRONT, fail, zfail, zpass);
      }
    }, {
      key: "_stencilOpSeparateBack",
      value: function _stencilOpSeparateBack(fail, zfail, zpass) {
        this._stencilOpSeparate(this.BACK, fail, zfail, zpass);
      }
    }, {
      key: "_stencilOpSeparateFrontAndBack",
      value: function _stencilOpSeparateFrontAndBack(fail, zfail, zpass) {
        this._stencilOpSeparate(this.FRONT_AND_BACK, fail, zfail, zpass);
      }
    }, {
      key: "$blendColor",
      value: function $blendColor(red, green, blue, alpha) {
        if (this._state.setSetting(this._blendColor, [red, green, blue, alpha])) this._blendColor(red, green, blue, alpha);
      }
    }, {
      key: "$blendEquation",
      value: function $blendEquation(mode) {
        if (this._state.setSetting(this._blendEquation, [mode])) this._blendEquation(mode);
      }
    }, {
      key: "$blendEquationSeparate",
      value: function $blendEquationSeparate(modeRGB, modeAlpha) {
        if (this._state.setSetting(this._blendEquationSeparate, [modeRGB, modeAlpha])) this._blendEquationSeparate(modeRGB, modeAlpha);
      }
    }, {
      key: "$blendFunc",
      value: function $blendFunc(sfactor, dfactor) {
        if (this._state.setSetting(this._blendFunc, [sfactor, dfactor])) this._blendFunc(sfactor, dfactor);
      }
    }, {
      key: "$blendFuncSeparate",
      value: function $blendFuncSeparate(srcRGB, dstRGB, srcAlpha, dstAlpha) {
        if (this._state.setSetting(this._blendFuncSeparate, [srcRGB, dstRGB, srcAlpha, dstAlpha])) this._blendFuncSeparate(srcRGB, dstRGB, srcAlpha, dstAlpha);
      }
    }, {
      key: "$clearColor",
      value: function $clearColor(red, green, blue, alpha) {
        if (this._state.setSetting(this._clearColor, [red, green, blue, alpha])) this._clearColor(red, green, blue, alpha);
      }
    }, {
      key: "$clearDepth",
      value: function $clearDepth(depth) {
        if (this._state.setSetting(this._clearDepth, [depth])) this._clearDepth(depth);
      }
    }, {
      key: "$clearStencil",
      value: function $clearStencil(s) {
        if (this._state.setSetting(this._clearStencil, [s])) this._clearStencil(s);
      }
    }, {
      key: "$colorMask",
      value: function $colorMask(red, green, blue, alpha) {
        if (this._state.setSetting(this._colorMask, [red, green, blue, alpha])) this._colorMask(red, green, blue, alpha);
      }
    }, {
      key: "$cullFace",
      value: function $cullFace(mode) {
        if (this._state.setSetting(this._cullFace, [mode])) this._cullFace(mode);
      }
    }, {
      key: "$depthFunc",
      value: function $depthFunc(func) {
        if (this._state.setSetting(this._depthFunc, [func])) this._depthFunc(func);
      }
    }, {
      key: "$depthMask",
      value: function $depthMask(flag) {
        if (this._state.setSetting(this._depthMask, [flag])) this._depthMask(flag);
      }
    }, {
      key: "$depthRange",
      value: function $depthRange(zNear, zFar) {
        if (this._state.setSetting(this._depthRange, [zNear, zFar])) this._depthRange(zNear, zFar);
      }
    }, {
      key: "$frontFace",
      value: function $frontFace(mode) {
        if (this._state.setSetting(this._frontFace, [mode])) this._frontFace(mode);
      }
    }, {
      key: "$lineWidth",
      value: function $lineWidth(width) {
        if (this._state.setSetting(this._lineWidth, [width])) this._lineWidth(width);
      }
    }, {
      key: "$polygonOffset",
      value: function $polygonOffset(factor, units) {
        if (this._state.setSetting(this._polygonOffset, [factor, units])) this._polygonOffset(factor, units);
      }
    }, {
      key: "$sampleCoverage",
      value: function $sampleCoverage(value, invert) {
        if (this._state.setSetting(this._sampleCoverage, [value, invert])) this._sampleCoverage(value, invert);
      }
    }, {
      key: "$stencilFunc",
      value: function $stencilFunc(func, ref, mask) {
        if (this._state.setSetting(this._stencilFunc, [func, ref, mask])) this._stencilFunc(func, ref, mask);
      }
    }, {
      key: "$stencilMask",
      value: function $stencilMask(mask) {
        if (this._state.setSetting(this._stencilMask, [mask])) this._stencilMask(mask);
      }
    }, {
      key: "$stencilOp",
      value: function $stencilOp(fail, zfail, zpass) {
        if (this._state.setSetting(this._stencilOp, [fail, zfail, zpass])) this._stencilOp(fail, zfail, zpass);
      }
    }, {
      key: "$vertexAttrib1f",
      value: function $vertexAttrib1f(indx, x) {
        if (this._state.setSetting(this._vertexAttrib1f, [indx, x])) this._vertexAttrib1f(indx, x);
      }
    }, {
      key: "$vertexAttrib1fv",
      value: function $vertexAttrib1fv(indx, values) {
        if (this._state.setSetting(this._vertexAttrib1fv, [indx, values])) this._vertexAttrib1fv(indx, values);
      }
    }, {
      key: "$vertexAttrib2f",
      value: function $vertexAttrib2f(indx, x, y) {
        if (this._state.setSetting(this._vertexAttrib2f, [indx, x, y])) this._vertexAttrib2f(indx, x, y);
      }
    }, {
      key: "$vertexAttrib2fv",
      value: function $vertexAttrib2fv(indx, values) {
        if (this._state.setSetting(this._vertexAttrib2fv, [indx, values])) this._vertexAttrib2fv(indx, values);
      }
    }, {
      key: "$vertexAttrib3f",
      value: function $vertexAttrib3f(indx, x, y, z) {
        if (this._state.setSetting(this._vertexAttrib3f, [indx, x, y, z])) this._vertexAttrib3f(indx, x, y, z);
      }
    }, {
      key: "$vertexAttrib3fv",
      value: function $vertexAttrib3fv(indx, values) {
        if (this._state.setSetting(this._vertexAttrib3fv, [indx, values])) this._vertexAttrib3fv(indx, values);
      }
    }, {
      key: "$vertexAttrib4f",
      value: function $vertexAttrib4f(indx, x, y, z, w) {
        if (this._state.setSetting(this._vertexAttrib4f, [indx, x, y, z, w])) this._vertexAttrib4f(indx, x, y, z, w);
      }
    }, {
      key: "$vertexAttrib4fv",
      value: function $vertexAttrib4fv(indx, values) {
        if (this._state.setSetting(this._vertexAttrib4fv, [indx, values])) this._vertexAttrib4fv(indx, values);
      }
      /**
       * Sets up the rendering context for context sharing.
       * @param {WebGLRenderingContext} gl
       * @param {string} id
       */

    }], [{
      key: "enable",
      value: function enable(gl) {
        var _this7 = this;

        var id = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "default";
        var names = Object.getOwnPropertyNames(WebGLStateManager.prototype);
        var WebGLRenderingContextProto = gl.__proto__;
        names.forEach(function (name) {
          _newArrowCheck(this, _this7);

          if (name !== "constructor") {
            var method = WebGLStateManager.prototype[name];

            if (name.charAt(0) === "$") {
              name = name.substr(1);
            }

            if (gl[name]) {
              if (!gl[name].name) {
                // We do this for compatibility with the Chrome WebGL Inspector plugin.
                gl[name].xname = name;
              }

              gl['_' + name] = gl[name];
            }

            gl[name] = method;
          }
        }.bind(this));

        WebGLStateManager.prototype._initStateManager.call(gl, id);

        return gl;
      }
    }]);

    return WebGLStateManager;
  }();

  var TextureManager =
  /*#__PURE__*/
  function () {
    function TextureManager(stage) {
      _classCallCheck(this, TextureManager);

      this.stage = stage;
      /**
       * The currently used amount of texture memory.
       * @type {number}
       */

      this._usedMemory = 0;
      /**
       * All uploaded texture sources.
       * @type {TextureSource[]}
       */

      this._uploadedTextureSources = [];
      /**
       * The texture source lookup id to texture source hashmap.
       * @type {Map<String, TextureSource>}
       */

      this.textureSourceHashmap = new Map();
    }

    _createClass(TextureManager, [{
      key: "destroy",
      value: function destroy() {
        for (var i = 0, n = this._uploadedTextureSources.length; i < n; i++) {
          this._nativeFreeTextureSource(this._uploadedTextureSources[i]);
        }

        this.textureSourceHashmap.clear();
        this._usedMemory = 0;
      }
    }, {
      key: "getReusableTextureSource",
      value: function getReusableTextureSource(id) {
        return this.textureSourceHashmap.get(id);
      }
    }, {
      key: "getTextureSource",
      value: function getTextureSource(func, id) {
        // Check if texture source is already known.
        var textureSource = id ? this.textureSourceHashmap.get(id) : null;

        if (!textureSource) {
          // Create new texture source.
          textureSource = new TextureSource(this, func);

          if (id) {
            textureSource.lookupId = id;
            this.textureSourceHashmap.set(id, textureSource);
          }
        }

        return textureSource;
      }
    }, {
      key: "uploadTextureSource",
      value: function uploadTextureSource(textureSource, options) {
        if (textureSource.isLoaded()) return;

        this._addMemoryUsage(textureSource.w * textureSource.h); // Load texture.


        var nativeTexture = this._nativeUploadTextureSource(textureSource, options);

        textureSource._nativeTexture = nativeTexture; // We attach w and h to native texture (we need it in CoreRenderState._isRenderTextureReusable).

        nativeTexture.w = textureSource.w;
        nativeTexture.h = textureSource.h;
        nativeTexture.update = this.stage.frameCounter;

        this._uploadedTextureSources.push(textureSource);

        this.addToLookupMap(textureSource);
      }
    }, {
      key: "_addMemoryUsage",
      value: function _addMemoryUsage(delta) {
        this._usedMemory += delta;
        this.stage.addMemoryUsage(delta);
      }
    }, {
      key: "addToLookupMap",
      value: function addToLookupMap(textureSource) {
        var lookupId = textureSource.lookupId;

        if (lookupId) {
          if (!this.textureSourceHashmap.has(lookupId)) {
            this.textureSourceHashmap.set(lookupId, textureSource);
          }
        }
      }
    }, {
      key: "gc",
      value: function gc() {
        this.freeUnusedTextureSources();

        this._cleanupLookupMap();
      }
    }, {
      key: "freeUnusedTextureSources",
      value: function freeUnusedTextureSources() {
        var remainingTextureSources = [];

        for (var i = 0, n = this._uploadedTextureSources.length; i < n; i++) {
          var ts = this._uploadedTextureSources[i];

          if (ts.allowCleanup()) {
            this._freeManagedTextureSource(ts);
          } else {
            remainingTextureSources.push(ts);
          }
        }

        this._uploadedTextureSources = remainingTextureSources;

        this._cleanupLookupMap();
      }
    }, {
      key: "_freeManagedTextureSource",
      value: function _freeManagedTextureSource(textureSource) {
        if (textureSource.isLoaded()) {
          this._nativeFreeTextureSource(textureSource);

          this._addMemoryUsage(-textureSource.w * textureSource.h);
        } // Should be reloaded.


        textureSource.loadingSince = null;
      }
    }, {
      key: "_cleanupLookupMap",
      value: function _cleanupLookupMap() {
        var _this = this;

        // We keep those that still have value (are being loaded or already loaded, or are likely to be reused).
        this.textureSourceHashmap.forEach(function (textureSource, lookupId) {
          _newArrowCheck(this, _this);

          if (!(textureSource.isLoaded() || textureSource.isLoading()) && !textureSource.isUsed()) {
            this.textureSourceHashmap.delete(lookupId);
          }
        }.bind(this));
      }
      /**
       * Externally free texture source.
       * @param textureSource
       */

    }, {
      key: "freeTextureSource",
      value: function freeTextureSource(textureSource) {
        var index = this._uploadedTextureSources.indexOf(textureSource);

        var managed = index !== -1;

        if (textureSource.isLoaded()) {
          if (managed) {
            this._addMemoryUsage(-textureSource.w * textureSource.h);

            this._uploadedTextureSources.splice(index, 1);
          }

          this._nativeFreeTextureSource(textureSource);
        } // Should be reloaded.


        textureSource.loadingSince = null;
      }
    }, {
      key: "_nativeUploadTextureSource",
      value: function _nativeUploadTextureSource(textureSource, options) {
        return this.stage.renderer.uploadTextureSource(textureSource, options);
      }
    }, {
      key: "_nativeFreeTextureSource",
      value: function _nativeFreeTextureSource(textureSource) {
        this.stage.renderer.freeTextureSource(textureSource);
        textureSource.clearNativeTexture();
      }
    }, {
      key: "usedMemory",
      get: function get() {
        return this._usedMemory;
      }
    }]);

    return TextureManager;
  }();

  /**
   * Allows throttling of loading texture sources, keeping the app responsive.
   */
  var TextureThrottler =
  /*#__PURE__*/
  function () {
    function TextureThrottler(stage) {
      var _this = this;

      _classCallCheck(this, TextureThrottler);

      this.stage = stage;

      this.genericCancelCb = function (textureSource) {
        _newArrowCheck(this, _this);

        this._remove(textureSource);
      }.bind(this);

      this._sources = [];
      this._data = [];
    }

    _createClass(TextureThrottler, [{
      key: "destroy",
      value: function destroy() {
        this._sources = [];
        this._data = [];
      }
    }, {
      key: "processSome",
      value: function processSome() {
        if (this._sources.length) {
          var start = Date.now();

          do {
            this._processItem();
          } while (this._sources.length && Date.now() - start < TextureThrottler.MAX_UPLOAD_TIME_PER_FRAME);
        }
      }
    }, {
      key: "_processItem",
      value: function _processItem() {
        var source = this._sources.pop();

        var data = this._data.pop();

        if (source.isLoading()) {
          source.processLoadedSource(data);
        }
      }
    }, {
      key: "add",
      value: function add(textureSource, data) {
        this._sources.push(textureSource);

        this._data.push(data);
      }
    }, {
      key: "_remove",
      value: function _remove(textureSource) {
        var index = this._sources.indexOf(textureSource);

        if (index >= 0) {
          this._sources.splice(index, 1);

          this._data.splice(index, 1);
        }
      }
    }]);

    return TextureThrottler;
  }();
  TextureThrottler.MAX_UPLOAD_TIME_PER_FRAME = 10;

  var CoreContext =
  /*#__PURE__*/
  function () {
    function CoreContext(stage) {
      _classCallCheck(this, CoreContext);

      this.stage = stage;
      this.root = null;
      this.updateTreeOrder = 0;
      this.renderState = this.stage.renderer.createCoreRenderState(this);
      this.renderExec = this.stage.renderer.createCoreRenderExecutor(this);
      this.renderExec.init();
      this._usedMemory = 0;
      this._renderTexturePool = [];
      this._renderTextureId = 1;
      this._zSorts = [];
    }

    _createClass(CoreContext, [{
      key: "destroy",
      value: function destroy() {
        var _this = this;

        this._renderTexturePool.forEach(function (texture) {
          _newArrowCheck(this, _this);

          return this._freeRenderTexture(texture);
        }.bind(this));

        this._usedMemory = 0;
      }
    }, {
      key: "hasRenderUpdates",
      value: function hasRenderUpdates() {
        return !!this.root._parent._hasRenderUpdates;
      }
    }, {
      key: "render",
      value: function render() {
        // Clear flag to identify if anything changes before the next frame.
        this.root._parent._hasRenderUpdates = 0;

        this._render();
      }
    }, {
      key: "update",
      value: function update() {
        this._update(); // Due to the boundsVisibility flag feature (and onAfterUpdate hook), it is possible that other elements were
        // changed during the update loop (for example due to the txLoaded event). We process these changes immediately
        // (but not recursively to prevent infinite loops).


        if (this.root._hasUpdates) {
          this._update();
        }

        this._performForcedZSorts();
      }
      /**
       * Certain ElementCore items may be forced to zSort to strip out references to prevent memleaks..
       */

    }, {
      key: "_performForcedZSorts",
      value: function _performForcedZSorts() {
        var n = this._zSorts.length;

        if (n) {
          // Forced z-sorts (ElementCore may force a z-sort in order to free memory/prevent memory leaks).
          for (var i = 0, _n = this._zSorts.length; i < _n; i++) {
            if (this._zSorts[i].zSort) {
              this._zSorts[i].sortZIndexedChildren();
            }
          }

          this._zSorts = [];
        }
      }
    }, {
      key: "_update",
      value: function _update() {
        this.updateTreeOrder = 0;
        this.root.update();
      }
    }, {
      key: "_render",
      value: function _render() {
        // Obtain a sequence of the quad operations.
        this._fillRenderState();

        if (this.stage.getOption('readPixelsBeforeDraw')) {
          var pixels = new Uint8Array(4);
          var gl = this.stage.gl;
          gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
        } // Now run them with the render executor.


        this._performRender();
      }
    }, {
      key: "_fillRenderState",
      value: function _fillRenderState() {
        this.renderState.reset();
        this.root.render();
        this.renderState.finish();
      }
    }, {
      key: "_performRender",
      value: function _performRender() {
        this.renderExec.execute();
      }
    }, {
      key: "_addMemoryUsage",
      value: function _addMemoryUsage(delta) {
        this._usedMemory += delta;
        this.stage.addMemoryUsage(delta);
      }
    }, {
      key: "allocateRenderTexture",
      value: function allocateRenderTexture(w, h) {
        var prec = this.stage.getRenderPrecision();
        var pw = Math.max(1, Math.round(w * prec));
        var ph = Math.max(1, Math.round(h * prec)); // Search last item first, so that last released render texture is preferred (may cause memory cache benefits).

        var n = this._renderTexturePool.length;

        for (var i = n - 1; i >= 0; i--) {
          var _texture = this._renderTexturePool[i]; // We don't want to reuse the same render textures within the same frame because that will create gpu stalls.

          if (_texture.w === pw && _texture.h === ph && _texture.update !== this.stage.frameCounter) {
            _texture.f = this.stage.frameCounter;

            this._renderTexturePool.splice(i, 1);

            return _texture;
          }
        }

        var texture = this._createRenderTexture(w, h, pw, ph);

        texture.precision = prec;
        return texture;
      }
    }, {
      key: "releaseRenderTexture",
      value: function releaseRenderTexture(texture) {
        this._renderTexturePool.push(texture);
      }
    }, {
      key: "freeUnusedRenderTextures",
      value: function freeUnusedRenderTextures() {
        var _this2 = this;

        var maxAge = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 60;
        // Clean up all textures that are no longer used.
        // This cache is short-lived because it is really just meant to supply running shaders that are
        // updated during a number of frames.
        var limit = this.stage.frameCounter - maxAge;
        this._renderTexturePool = this._renderTexturePool.filter(function (texture) {
          _newArrowCheck(this, _this2);

          if (texture.f <= limit) {
            this._freeRenderTexture(texture);

            return false;
          }

          return true;
        }.bind(this));
      }
    }, {
      key: "_createRenderTexture",
      value: function _createRenderTexture(w, h, pw, ph) {
        this._addMemoryUsage(pw * ph);

        var texture = this.stage.renderer.createRenderTexture(w, h, pw, ph);
        texture.id = this._renderTextureId++;
        texture.f = this.stage.frameCounter;
        texture.ow = w;
        texture.oh = h;
        texture.w = pw;
        texture.h = ph;
        return texture;
      }
    }, {
      key: "_freeRenderTexture",
      value: function _freeRenderTexture(nativeTexture) {
        this.stage.renderer.freeRenderTexture(nativeTexture);

        this._addMemoryUsage(-nativeTexture.w * nativeTexture.h);
      }
    }, {
      key: "copyRenderTexture",
      value: function copyRenderTexture(renderTexture, nativeTexture, options) {
        this.stage.renderer.copyRenderTexture(renderTexture, nativeTexture, options);
      }
    }, {
      key: "forceZSort",
      value: function forceZSort(elementCore) {
        this._zSorts.push(elementCore);
      }
    }, {
      key: "usedMemory",
      get: function get() {
        return this._usedMemory;
      }
    }]);

    return CoreContext;
  }();

  var TransitionSettings =
  /*#__PURE__*/
  function () {
    function TransitionSettings(stage) {
      _classCallCheck(this, TransitionSettings);

      this.stage = stage;
      this._timingFunction = 'ease';
      this._timingFunctionImpl = StageUtils.getTimingFunction(this._timingFunction);
      this.delay = 0;
      this.duration = 0.2;
      this.merger = null;
    }

    _createClass(TransitionSettings, [{
      key: "patch",
      value: function patch(settings) {
        Base.patchObject(this, settings);
      }
    }, {
      key: "timingFunction",
      get: function get() {
        return this._timingFunction;
      },
      set: function set(v) {
        this._timingFunction = v;
        this._timingFunctionImpl = StageUtils.getTimingFunction(v);
      }
    }, {
      key: "timingFunctionImpl",
      get: function get() {
        return this._timingFunctionImpl;
      }
    }]);

    return TransitionSettings;
  }();
  TransitionSettings.prototype.isTransitionSettings = true;

  var TransitionManager =
  /*#__PURE__*/
  function () {
    function TransitionManager(stage) {
      var _this = this;

      _classCallCheck(this, TransitionManager);

      this.stage = stage;
      this.stage.on('frameStart', function () {
        _newArrowCheck(this, _this);

        return this.progress();
      }.bind(this));
      /**
       * All transitions that are running and attached.
       * (we don't support transitions on un-attached elements to prevent memory leaks)
       * @type {Set<Transition>}
       */

      this.active = new Set();
      this.defaultTransitionSettings = new TransitionSettings(this.stage);
    }

    _createClass(TransitionManager, [{
      key: "progress",
      value: function progress() {
        var _this2 = this;

        if (this.active.size) {
          var dt = this.stage.dt;
          var filter = false;
          this.active.forEach(function (a) {
            a.progress(dt);

            if (!a.isRunning()) {
              filter = true;
            }
          });

          if (filter) {
            this.active = new Set(_toConsumableArray(this.active).filter(function (t) {
              _newArrowCheck(this, _this2);

              return t.isRunning();
            }.bind(this)));
          }
        }
      }
    }, {
      key: "createSettings",
      value: function createSettings(settings) {
        var transitionSettings = new TransitionSettings();
        Base.patchObject(transitionSettings, settings);
        return transitionSettings;
      }
    }, {
      key: "addActive",
      value: function addActive(transition) {
        this.active.add(transition);
      }
    }, {
      key: "removeActive",
      value: function removeActive(transition) {
        this.active.delete(transition);
      }
    }]);

    return TransitionManager;
  }();

  var MultiSpline =
  /*#__PURE__*/
  function () {
    function MultiSpline() {
      _classCallCheck(this, MultiSpline);

      this._clear();
    }

    _createClass(MultiSpline, [{
      key: "_clear",
      value: function _clear() {
        this._p = [];
        this._pe = [];
        this._idp = [];
        this._f = [];
        this._v = [];
        this._lv = [];
        this._sm = [];
        this._s = [];
        this._ve = [];
        this._sme = [];
        this._se = [];
        this._length = 0;
      }
    }, {
      key: "parse",
      value: function parse(rgba, def) {
        var i, n;

        if (!Utils.isObjectLiteral(def)) {
          def = {
            0: def
          };
        }

        var defaultSmoothness = 0.5;
        var items = [];

        for (var key in def) {
          if (def.hasOwnProperty(key)) {
            var obj = def[key];

            if (!Utils.isObjectLiteral(obj)) {
              obj = {
                v: obj
              };
            }

            var p = parseFloat(key);

            if (key === "sm") {
              defaultSmoothness = obj.v;
            } else if (!isNaN(p) && p >= 0 && p <= 2) {
              obj.p = p;
              obj.f = Utils.isFunction(obj.v);
              obj.lv = obj.f ? obj.v(0, 0) : obj.v;
              items.push(obj);
            }
          }
        } // Sort by progress value.


        items = items.sort(function (a, b) {
          return a.p - b.p;
        });
        n = items.length;

        for (i = 0; i < n; i++) {
          var last = i === n - 1;

          if (!items[i].hasOwnProperty('pe')) {
            // Progress.
            items[i].pe = last ? items[i].p <= 1 ? 1 : 2
            /* support onetotwo stop */
            : items[i + 1].p;
          } else {
            // Prevent multiple items at the same time.
            var max = i < n - 1 ? items[i + 1].p : 1;

            if (items[i].pe > max) {
              items[i].pe = max;
            }
          }

          if (items[i].pe === items[i].p) {
            items[i].idp = 0;
          } else {
            items[i].idp = 1 / (items[i].pe - items[i].p);
          }
        } // Color merger: we need to split/combine RGBA components.
        // Calculate bezier helper values.;


        for (i = 0; i < n; i++) {
          if (!items[i].hasOwnProperty('sm')) {
            // Smoothness.;
            items[i].sm = defaultSmoothness;
          }

          if (!items[i].hasOwnProperty('s')) {
            // Slope.;
            if (i === 0 || i === n - 1 || items[i].p === 1
            /* for onetotwo */
            ) {
              // Horizontal slope at start and end.;
              items[i].s = rgba ? [0, 0, 0, 0] : 0;
            } else {
              var pi = items[i - 1];
              var ni = items[i + 1];

              if (pi.p === ni.p) {
                items[i].s = rgba ? [0, 0, 0, 0] : 0;
              } else {
                if (rgba) {
                  var nc = MultiSpline.getRgbaComponents(ni.lv);
                  var pc = MultiSpline.getRgbaComponents(pi.lv);
                  var d = 1 / (ni.p - pi.p);
                  items[i].s = [d * (nc[0] - pc[0]), d * (nc[1] - pc[1]), d * (nc[2] - pc[2]), d * (nc[3] - pc[3])];
                } else {
                  items[i].s = (ni.lv - pi.lv) / (ni.p - pi.p);
                }
              }
            }
          }
        }

        for (i = 0; i < n - 1; i++) {
          // Calculate value function.;
          if (!items[i].f) {
            var _last = i === n - 1;

            if (!items[i].hasOwnProperty('ve')) {
              items[i].ve = _last ? items[i].lv : items[i + 1].lv;
            } // We can only interpolate on numeric values. Non-numeric values are set literally when reached time.


            if (Utils.isNumber(items[i].v) && Utils.isNumber(items[i].lv)) {
              if (!items[i].hasOwnProperty('sme')) {
                items[i].sme = _last ? defaultSmoothness : items[i + 1].sm;
              }

              if (!items[i].hasOwnProperty('se')) {
                items[i].se = _last ? rgba ? [0, 0, 0, 0] : 0 : items[i + 1].s;
              } // Generate spline.;


              if (rgba) {
                items[i].v = MultiSpline.getSplineRgbaValueFunction(items[i].v, items[i].ve, items[i].p, items[i].pe, items[i].sm, items[i].sme, items[i].s, items[i].se);
              } else {
                items[i].v = MultiSpline.getSplineValueFunction(items[i].v, items[i].ve, items[i].p, items[i].pe, items[i].sm, items[i].sme, items[i].s, items[i].se);
              }

              items[i].f = true;
            }
          }
        }

        if (this.length) {
          this._clear();
        }

        for (i = 0, n = items.length; i < n; i++) {
          this._add(items[i]);
        }
      }
    }, {
      key: "_add",
      value: function _add(item) {
        this._p.push(item.p || 0);

        this._pe.push(item.pe || 0);

        this._idp.push(item.idp || 0);

        this._f.push(item.f || false);

        this._v.push(item.hasOwnProperty('v') ? item.v : 0
        /* v might be false or null */
        );

        this._lv.push(item.lv || 0);

        this._sm.push(item.sm || 0);

        this._s.push(item.s || 0);

        this._ve.push(item.ve || 0);

        this._sme.push(item.sme || 0);

        this._se.push(item.se || 0);

        this._length++;
      }
    }, {
      key: "_getItem",
      value: function _getItem(p) {
        var n = this._length;

        if (!n) {
          return -1;
        }

        if (p < this._p[0]) {
          return 0;
        }

        for (var i = 0; i < n; i++) {
          if (this._p[i] <= p && p < this._pe[i]) {
            return i;
          }
        }

        return n - 1;
      }
    }, {
      key: "getValue",
      value: function getValue(p) {
        var i = this._getItem(p);

        if (i === -1) {
          return undefined;
        } else {
          if (this._f[i]) {
            var o = Math.min(1, Math.max(0, (p - this._p[i]) * this._idp[i]));
            return this._v[i](o);
          } else {
            return this._v[i];
          }
        }
      }
    }, {
      key: "length",
      get: function get() {
        return this._length;
      }
    }], [{
      key: "getRgbaComponents",
      value: function getRgbaComponents(argb) {
        var r = (argb / 65536 | 0) % 256;
        var g = (argb / 256 | 0) % 256;
        var b = argb % 256;
        var a = argb / 16777216 | 0;
        return [r, g, b, a];
      }
    }, {
      key: "getSplineValueFunction",
      value: function getSplineValueFunction(v1, v2, p1, p2, o1, i2, s1, s2) {
        // Normalize slopes because we use a spline that goes from 0 to 1.
        var dp = p2 - p1;
        s1 *= dp;
        s2 *= dp;
        var helpers = MultiSpline.getSplineHelpers(v1, v2, o1, i2, s1, s2);

        if (!helpers) {
          return function (p) {
            if (p === 0) return v1;
            if (p === 1) return v2;
            return v2 * p + v1 * (1 - p);
          };
        } else {
          return function (p) {
            if (p === 0) return v1;
            if (p === 1) return v2;
            return MultiSpline.calculateSpline(helpers, p);
          };
        }
      }
    }, {
      key: "getSplineRgbaValueFunction",
      value: function getSplineRgbaValueFunction(v1, v2, p1, p2, o1, i2, s1, s2) {
        // Normalize slopes because we use a spline that goes from 0 to 1.
        var dp = p2 - p1;
        s1[0] *= dp;
        s1[1] *= dp;
        s1[2] *= dp;
        s1[3] *= dp;
        s2[0] *= dp;
        s2[1] *= dp;
        s2[2] *= dp;
        s2[3] *= dp;
        var cv1 = MultiSpline.getRgbaComponents(v1);
        var cv2 = MultiSpline.getRgbaComponents(v2);
        var helpers = [MultiSpline.getSplineHelpers(cv1[0], cv2[0], o1, i2, s1[0], s2[0]), MultiSpline.getSplineHelpers(cv1[1], cv2[1], o1, i2, s1[1], s2[1]), MultiSpline.getSplineHelpers(cv1[2], cv2[2], o1, i2, s1[2], s2[2]), MultiSpline.getSplineHelpers(cv1[3], cv2[3], o1, i2, s1[3], s2[3])];

        if (!helpers[0]) {
          return function (p) {
            // Linear.
            if (p === 0) return v1;
            if (p === 1) return v2;
            return MultiSpline.mergeColors(v2, v1, p);
          };
        } else {
          return function (p) {
            if (p === 0) return v1;
            if (p === 1) return v2;
            return MultiSpline.getArgbNumber([Math.min(255, MultiSpline.calculateSpline(helpers[0], p)), Math.min(255, MultiSpline.calculateSpline(helpers[1], p)), Math.min(255, MultiSpline.calculateSpline(helpers[2], p)), Math.min(255, MultiSpline.calculateSpline(helpers[3], p))]);
          };
        }
      }
    }, {
      key: "getSplineHelpers",

      /**
       * Creates helpers to be used in the spline function.
       * @param {number} v1
       *   From value.
       * @param {number} v2
       *   To value.
       * @param {number} o1
       *   From smoothness (0 = linear, 1 = smooth).
       * @param {number} s1
       *   From slope (0 = horizontal, infinite = vertical).
       * @param {number} i2
       *   To smoothness.
       * @param {number} s2
       *   To slope.
       * @returns {Number[]}
       *   The helper values to be supplied to the spline function.
       *   If the configuration is actually linear, null is returned.
       */
      value: function getSplineHelpers(v1, v2, o1, i2, s1, s2) {
        if (!o1 && !i2) {
          // Linear.
          return null;
        } // Cubic bezier points.
        // http://cubic-bezier.com/


        var csx = o1;
        var csy = v1 + s1 * o1;
        var cex = 1 - i2;
        var cey = v2 - s2 * i2;
        var xa = 3 * csx - 3 * cex + 1;
        var xb = -6 * csx + 3 * cex;
        var xc = 3 * csx;
        var ya = 3 * csy - 3 * cey + v2 - v1;
        var yb = 3 * (cey + v1) - 6 * csy;
        var yc = 3 * (csy - v1);
        var yd = v1;
        return [xa, xb, xc, ya, yb, yc, yd];
      }
    }, {
      key: "calculateSpline",

      /**
       * Calculates the intermediate spline value based on the specified helpers.
       * @param {number[]} helpers
       *   Obtained from getSplineHelpers.
       * @param {number} p
       * @return {number}
       */
      value: function calculateSpline(helpers, p) {
        var xa = helpers[0];
        var xb = helpers[1];
        var xc = helpers[2];
        var ya = helpers[3];
        var yb = helpers[4];
        var yc = helpers[5];
        var yd = helpers[6];

        if (xa === -2 && ya === -2 && xc === 0 && yc === 0) {
          // Linear.
          return p;
        } // Find t for p.


        var t = 0.5,
            cbx,
            dx;

        for (var it = 0; it < 20; it++) {
          // Cubic bezier function: f(t)=t*(t*(t*a+b)+c).
          cbx = t * (t * (t * xa + xb) + xc);
          dx = p - cbx;

          if (dx > -1e-8 && dx < 1e-8) {
            // Solution found!
            return t * (t * (t * ya + yb) + yc) + yd;
          } // Cubic bezier derivative function: f'(t)=t*(t*(3*a)+2*b)+c


          var cbxd = t * (t * (3 * xa) + 2 * xb) + xc;

          if (cbxd > 1e-10 && cbxd < 1e-10) {
            // Problematic. Fall back to binary search method.
            break;
          }

          t += dx / cbxd;
        } // Fallback: binary search method. This is more reliable when there are near-0 slopes.


        var minT = 0;
        var maxT = 1;

        for (var _it = 0; _it < 20; _it++) {
          t = 0.5 * (minT + maxT); // Cubic bezier function: f(t)=t*(t*(t*a+b)+c)+d.

          cbx = t * (t * (t * xa + xb) + xc);
          dx = p - cbx;

          if (dx > -1e-8 && dx < 1e-8) {
            // Solution found!
            return t * (t * (t * ya + yb) + yc) + yd;
          }

          if (dx < 0) {
            maxT = t;
          } else {
            minT = t;
          }
        }

        return t;
      }
    }, {
      key: "mergeColors",
      value: function mergeColors(c1, c2, p) {
        var r1 = (c1 / 65536 | 0) % 256;
        var g1 = (c1 / 256 | 0) % 256;
        var b1 = c1 % 256;
        var a1 = c1 / 16777216 | 0;
        var r2 = (c2 / 65536 | 0) % 256;
        var g2 = (c2 / 256 | 0) % 256;
        var b2 = c2 % 256;
        var a2 = c2 / 16777216 | 0;
        var r = r1 * p + r2 * (1 - p);
        var g = g1 * p + g2 * (1 - p);
        var b = b1 * p + b2 * (1 - p);
        var a = a1 * p + a2 * (1 - p);
        return Math.round(a) * 16777216 + Math.round(r) * 65536 + Math.round(g) * 256 + Math.round(b);
      }
    }, {
      key: "getArgbNumber",
      value: function getArgbNumber(rgba) {
        rgba[0] = Math.max(0, Math.min(255, rgba[0]));
        rgba[1] = Math.max(0, Math.min(255, rgba[1]));
        rgba[2] = Math.max(0, Math.min(255, rgba[2]));
        rgba[3] = Math.max(0, Math.min(255, rgba[3]));
        var v = ((rgba[3] | 0) << 24) + ((rgba[0] | 0) << 16) + ((rgba[1] | 0) << 8) + (rgba[2] | 0);

        if (v < 0) {
          v = 0xFFFFFFFF + v + 1;
        }

        return v;
      }
    }]);

    return MultiSpline;
  }();

  var AnimationActionSettings =
  /*#__PURE__*/
  function () {
    function AnimationActionSettings(animationSettings) {
      _classCallCheck(this, AnimationActionSettings);

      this.animationSettings = animationSettings;
      /**
       * The selector that selects the elements.
       * @type {string}
       */

      this._selector = "";
      /**
       * The value items, ordered by progress offset.
       * @type {MultiSpline}
       * @private;
       */

      this._items = new MultiSpline();
      /**
       * The affected properties (paths).
       * @private;
       */

      this._props = [];
      /**
       * Property setters, indexed according to props.
       * @private;
       */

      this._propSetters = [];
      this._resetValue = undefined;
      this._hasResetValue = false;
      this._hasColorProperty = undefined;
    }

    _createClass(AnimationActionSettings, [{
      key: "getResetValue",
      value: function getResetValue() {
        if (this._hasResetValue) {
          return this._resetValue;
        } else {
          return this._items.getValue(0);
        }
      }
    }, {
      key: "apply",
      value: function apply(element, p, factor) {
        var elements = this.getAnimatedElements(element);

        var v = this._items.getValue(p);

        if (v === undefined || !elements.length) {
          return;
        }

        if (factor !== 1) {
          // Stop factor.;
          var sv = this.getResetValue();

          if (Utils.isNumber(v) && Utils.isNumber(sv)) {
            if (this.hasColorProperty()) {
              v = StageUtils.mergeColors(v, sv, factor);
            } else {
              v = StageUtils.mergeNumbers(v, sv, factor);
            }
          }
        } // Apply transformation to all components.;


        var n = this._propSetters.length;
        var m = elements.length;

        for (var j = 0; j < m; j++) {
          for (var i = 0; i < n; i++) {
            this._propSetters[i](elements[j], v);
          }
        }
      }
    }, {
      key: "getAnimatedElements",
      value: function getAnimatedElements(element) {
        return element.select(this._selector);
      }
    }, {
      key: "reset",
      value: function reset(element) {
        var elements = this.getAnimatedElements(element);
        var v = this.getResetValue();

        if (v === undefined || !elements.length) {
          return;
        } // Apply transformation to all components.


        var n = this._propSetters.length;
        var m = elements.length;

        for (var j = 0; j < m; j++) {
          for (var i = 0; i < n; i++) {
            this._propSetters[i](elements[j], v);
          }
        }
      }
    }, {
      key: "patch",
      value: function patch(settings) {
        Base.patchObject(this, settings);
      }
    }, {
      key: "hasColorProperty",
      value: function hasColorProperty() {
        if (this._hasColorProperty === undefined) {
          this._hasColorProperty = this._props.length ? Element.isColorProperty(this._props[0]) : false;
        }

        return this._hasColorProperty;
      }
    }, {
      key: "selector",
      set: function set(v) {
        this._selector = v;
      }
    }, {
      key: "t",
      set: function set(v) {
        this.selector = v;
      }
    }, {
      key: "resetValue",
      get: function get() {
        return this._resetValue;
      },
      set: function set(v) {
        this._resetValue = v;
        this._hasResetValue = v !== undefined;
      }
    }, {
      key: "rv",
      set: function set(v) {
        this.resetValue = v;
      }
    }, {
      key: "value",
      set: function set(v) {
        this._items.parse(this.hasColorProperty(), v);
      }
    }, {
      key: "v",
      set: function set(v) {
        this.value = v;
      }
    }, {
      key: "properties",
      set: function set(v) {
        var _this = this;

        if (!Array.isArray(v)) {
          v = [v];
        }

        this._props = [];
        v.forEach(function (prop) {
          _newArrowCheck(this, _this);

          this._props.push(prop);

          this._propSetters.push(Element.getSetter(prop));
        }.bind(this));
      }
    }, {
      key: "property",
      set: function set(v) {
        this._hasColorProperty = undefined;
        this.properties = v;
      }
    }, {
      key: "p",
      set: function set(v) {
        this.properties = v;
      }
    }]);

    return AnimationActionSettings;
  }();
  AnimationActionSettings.prototype.isAnimationActionSettings = true;

  var AnimationSettings =
  /*#__PURE__*/
  function () {
    function AnimationSettings() {
      _classCallCheck(this, AnimationSettings);

      /**
       * @type {AnimationActionSettings[]}
       */
      this._actions = [];
      this.delay = 0;
      this.duration = 1;
      this.repeat = 0;
      this.repeatOffset = 0;
      this.repeatDelay = 0;
      this.autostop = false;
      this.stopMethod = AnimationSettings.STOP_METHODS.FADE;
      this._stopTimingFunction = 'ease';
      this._stopTimingFunctionImpl = StageUtils.getTimingFunction(this._stopTimingFunction);
      this.stopDuration = 0;
      this.stopDelay = 0;
    }

    _createClass(AnimationSettings, [{
      key: "apply",

      /**
       * Applies the animation to the specified element, for the specified progress between 0 and 1.
       * @param {Element} element;
       * @param {number} p;
       * @param {number} factor;
       */
      value: function apply(element, p) {
        var factor = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;

        this._actions.forEach(function (action) {
          action.apply(element, p, factor);
        });
      }
      /**
       * Resets the animation to the reset values.
       * @param {Element} element;
       */

    }, {
      key: "reset",
      value: function reset(element) {
        this._actions.forEach(function (action) {
          action.reset(element);
        });
      }
    }, {
      key: "patch",
      value: function patch(settings) {
        Base.patchObject(this, settings);
      }
    }, {
      key: "actions",
      get: function get() {
        return this._actions;
      },
      set: function set(v) {
        this._actions = [];

        for (var i = 0, n = v.length; i < n; i++) {
          var e = v[i];

          if (!e.isAnimationActionSettings) {
            var aas = new AnimationActionSettings(this);
            aas.patch(e);

            this._actions.push(aas);
          } else {
            this._actions.push(e);
          }
        }
      }
    }, {
      key: "stopTimingFunction",
      get: function get() {
        return this._stopTimingFunction;
      },
      set: function set(v) {
        this._stopTimingFunction = v;
        this._stopTimingFunctionImpl = StageUtils.getTimingFunction(v);
      }
    }, {
      key: "stopTimingFunctionImpl",
      get: function get() {
        return this._stopTimingFunctionImpl;
      }
    }]);

    return AnimationSettings;
  }();
  AnimationSettings.STOP_METHODS = {
    FADE: 'fade',
    REVERSE: 'reverse',
    FORWARD: 'forward',
    IMMEDIATE: 'immediate',
    ONETOTWO: 'onetotwo'
  };

  var Animation =
  /*#__PURE__*/
  function (_EventEmitter) {
    _inherits(Animation, _EventEmitter);

    function Animation(manager, settings, element) {
      var _this;

      _classCallCheck(this, Animation);

      _this = _possibleConstructorReturn(this, _getPrototypeOf(Animation).call(this));
      _this.manager = manager;
      _this._settings = settings;
      _this._element = element;
      _this._state = Animation.STATES.IDLE;
      _this._p = 0;
      _this._delayLeft = 0;
      _this._repeatsLeft = 0;
      _this._stopDelayLeft = 0;
      _this._stopP = 0;
      return _this;
    }

    _createClass(Animation, [{
      key: "start",
      value: function start() {
        if (this._element && this._element.attached) {
          this._p = 0;
          this._delayLeft = this.settings.delay;
          this._repeatsLeft = this.settings.repeat;
          this._state = Animation.STATES.PLAYING;
          this.emit('start');
          this.checkActive();
        } else {
          console.warn("Element must be attached before starting animation");
        }
      }
    }, {
      key: "play",
      value: function play() {
        if (this._state === Animation.STATES.PAUSED) {
          // Continue.;
          this._state = Animation.STATES.PLAYING;
          this.checkActive();
          this.emit('resume');
        } else if (this._state == Animation.STATES.STOPPING && this.settings.stopMethod == AnimationSettings.STOP_METHODS.REVERSE) {
          // Continue.;
          this._state = Animation.STATES.PLAYING;
          this.emit('stopContinue');
        } else if (this._state != Animation.STATES.PLAYING && this._state != Animation.STATES.FINISHED) {
          // Restart.;
          this.start();
        }
      }
    }, {
      key: "pause",
      value: function pause() {
        if (this._state === Animation.STATES.PLAYING) {
          this._state = Animation.STATES.PAUSED;
          this.emit('pause');
        }
      }
    }, {
      key: "replay",
      value: function replay() {
        if (this._state == Animation.STATES.FINISHED) {
          this.start();
        } else {
          this.play();
        }
      }
    }, {
      key: "skipDelay",
      value: function skipDelay() {
        this._delayLeft = 0;
        this._stopDelayLeft = 0;
      }
    }, {
      key: "finish",
      value: function finish() {
        if (this._state === Animation.STATES.PLAYING) {
          this._delayLeft = 0;
          this._p = 1;
        } else if (this._state === Animation.STATES.STOPPING) {
          this._stopDelayLeft = 0;
          this._p = 0;
        }
      }
    }, {
      key: "stop",
      value: function stop() {
        if (this._state === Animation.STATES.STOPPED || this._state === Animation.STATES.IDLE) return;
        this._stopDelayLeft = this.settings.stopDelay || 0;

        if (this.settings.stopMethod === AnimationSettings.STOP_METHODS.IMMEDIATE && !this._stopDelayLeft || this._delayLeft > 0) {
          // Stop upon next progress.;
          this._state = Animation.STATES.STOPPING;
          this.emit('stop');
        } else {
          if (this.settings.stopMethod === AnimationSettings.STOP_METHODS.FADE) {
            this._stopP = 0;
          }

          this._state = Animation.STATES.STOPPING;
          this.emit('stop');
        }

        this.checkActive();
      }
    }, {
      key: "stopNow",
      value: function stopNow() {
        if (this._state !== Animation.STATES.STOPPED || this._state !== Animation.STATES.IDLE) {
          this._state = Animation.STATES.STOPPING;
          this._p = 0;
          this.emit('stop');
          this.reset();
          this._state = Animation.STATES.STOPPED;
          this.emit('stopFinish');
        }
      }
    }, {
      key: "isPaused",
      value: function isPaused() {
        return this._state === Animation.STATES.PAUSED;
      }
    }, {
      key: "isPlaying",
      value: function isPlaying() {
        return this._state === Animation.STATES.PLAYING;
      }
    }, {
      key: "isStopping",
      value: function isStopping() {
        return this._state === Animation.STATES.STOPPING;
      }
    }, {
      key: "isFinished",
      value: function isFinished() {
        return this._state === Animation.STATES.FINISHED;
      }
    }, {
      key: "checkActive",
      value: function checkActive() {
        if (this.isActive()) {
          this.manager.addActive(this);
        }
      }
    }, {
      key: "isActive",
      value: function isActive() {
        return (this._state == Animation.STATES.PLAYING || this._state == Animation.STATES.STOPPING) && this._element && this._element.attached;
      }
    }, {
      key: "progress",
      value: function progress(dt) {
        if (!this._element) return;

        this._progress(dt);

        this.apply();
      }
    }, {
      key: "_progress",
      value: function _progress(dt) {
        if (this._state == Animation.STATES.STOPPING) {
          this._stopProgress(dt);

          return;
        }

        if (this._state != Animation.STATES.PLAYING) {
          return;
        }

        if (this._delayLeft > 0) {
          this._delayLeft -= dt;

          if (this._delayLeft < 0) {
            dt = -this._delayLeft;
            this._delayLeft = 0;
            this.emit('delayEnd');
          } else {
            return;
          }
        }

        if (this.settings.duration === 0) {
          this._p = 1;
        } else if (this.settings.duration > 0) {
          this._p += dt / this.settings.duration;
        }

        if (this._p >= 1) {
          // Finished!;
          if (this.settings.repeat == -1 || this._repeatsLeft > 0) {
            if (this._repeatsLeft > 0) {
              this._repeatsLeft--;
            }

            this._p = this.settings.repeatOffset;

            if (this.settings.repeatDelay) {
              this._delayLeft = this.settings.repeatDelay;
            }

            this.emit('repeat', this._repeatsLeft);
          } else {
            this._p = 1;
            this._state = Animation.STATES.FINISHED;
            this.emit('finish');

            if (this.settings.autostop) {
              this.stop();
            }
          }
        } else {
          this.emit('progress', this._p);
        }
      }
    }, {
      key: "_stopProgress",
      value: function _stopProgress(dt) {
        var duration = this._getStopDuration();

        if (this._stopDelayLeft > 0) {
          this._stopDelayLeft -= dt;

          if (this._stopDelayLeft < 0) {
            dt = -this._stopDelayLeft;
            this._stopDelayLeft = 0;
            this.emit('stopDelayEnd');
          } else {
            return;
          }
        }

        if (this.settings.stopMethod == AnimationSettings.STOP_METHODS.IMMEDIATE) {
          this._state = Animation.STATES.STOPPED;
          this.emit('stopFinish');
        } else if (this.settings.stopMethod == AnimationSettings.STOP_METHODS.REVERSE) {
          if (duration === 0) {
            this._p = 0;
          } else if (duration > 0) {
            this._p -= dt / duration;
          }

          if (this._p <= 0) {
            this._p = 0;
            this._state = Animation.STATES.STOPPED;
            this.emit('stopFinish');
          }
        } else if (this.settings.stopMethod == AnimationSettings.STOP_METHODS.FADE) {
          this._progressStopTransition(dt);

          if (this._stopP >= 1) {
            this._p = 0;
            this._state = Animation.STATES.STOPPED;
            this.emit('stopFinish');
          }
        } else if (this.settings.stopMethod == AnimationSettings.STOP_METHODS.ONETOTWO) {
          if (this._p < 2) {
            if (duration === 0) {
              this._p = 2;
            } else if (duration > 0) {
              if (this._p < 1) {
                this._p += dt / this.settings.duration;
              } else {
                this._p += dt / duration;
              }
            }

            if (this._p >= 2) {
              this._p = 2;
              this._state = Animation.STATES.STOPPED;
              this.emit('stopFinish');
            } else {
              this.emit('progress', this._p);
            }
          }
        } else if (this.settings.stopMethod == AnimationSettings.STOP_METHODS.FORWARD) {
          if (this._p < 1) {
            if (this.settings.duration == 0) {
              this._p = 1;
            } else {
              this._p += dt / this.settings.duration;
            }

            if (this._p >= 1) {
              if (this.settings.stopMethod == AnimationSettings.STOP_METHODS.FORWARD) {
                this._p = 1;
                this._state = Animation.STATES.STOPPED;
                this.emit('stopFinish');
              } else {
                if (this._repeatsLeft > 0) {
                  this._repeatsLeft--;
                  this._p = 0;
                  this.emit('repeat', this._repeatsLeft);
                } else {
                  this._p = 1;
                  this._state = Animation.STATES.STOPPED;
                  this.emit('stopFinish');
                }
              }
            } else {
              this.emit('progress', this._p);
            }
          }
        }
      }
    }, {
      key: "_progressStopTransition",
      value: function _progressStopTransition(dt) {
        if (this._stopP < 1) {
          if (this._stopDelayLeft > 0) {
            this._stopDelayLeft -= dt;

            if (this._stopDelayLeft < 0) {
              dt = -this._stopDelayLeft;
              this._stopDelayLeft = 0;
              this.emit('delayEnd');
            } else {
              return;
            }
          }

          var duration = this._getStopDuration();

          if (duration == 0) {
            this._stopP = 1;
          } else {
            this._stopP += dt / duration;
          }

          if (this._stopP >= 1) {
            // Finished!;
            this._stopP = 1;
          }
        }
      }
    }, {
      key: "_getStopDuration",
      value: function _getStopDuration() {
        return this.settings.stopDuration || this.settings.duration;
      }
    }, {
      key: "apply",
      value: function apply() {
        if (this._state === Animation.STATES.STOPPED) {
          this.reset();
        } else {
          var factor = 1;

          if (this._state === Animation.STATES.STOPPING && this.settings.stopMethod === AnimationSettings.STOP_METHODS.FADE) {
            factor = 1 - this.settings.stopTimingFunctionImpl(this._stopP);
          }

          this._settings.apply(this._element, this._p, factor);
        }
      }
    }, {
      key: "reset",
      value: function reset() {
        this._settings.reset(this._element);
      }
    }, {
      key: "state",
      get: function get() {
        return this._state;
      }
    }, {
      key: "p",
      get: function get() {
        return this._p;
      }
    }, {
      key: "delayLeft",
      get: function get() {
        return this._delayLeft;
      }
    }, {
      key: "element",
      get: function get() {
        return this._element;
      }
    }, {
      key: "frame",
      get: function get() {
        return Math.round(this._p * this._settings.duration * 60);
      }
    }, {
      key: "settings",
      get: function get() {
        return this._settings;
      }
    }]);

    return Animation;
  }(EventEmitter);
  Animation.STATES = {
    IDLE: 0,
    PLAYING: 1,
    STOPPING: 2,
    STOPPED: 3,
    FINISHED: 4,
    PAUSED: 5
  };

  var AnimationManager =
  /*#__PURE__*/
  function () {
    function AnimationManager(stage) {
      var _this = this;

      _classCallCheck(this, AnimationManager);

      this.stage = stage;
      this.stage.on('frameStart', function () {
        _newArrowCheck(this, _this);

        return this.progress();
      }.bind(this));
      /**
       * All running animations on attached subjects.
       * @type {Set<Animation>}
       */

      this.active = new Set();
    }

    _createClass(AnimationManager, [{
      key: "progress",
      value: function progress() {
        var _this2 = this;

        if (this.active.size) {
          var dt = this.stage.dt;
          var filter = false;
          this.active.forEach(function (a) {
            if (a.isActive()) {
              a.progress(dt);
            } else {
              filter = true;
            }
          });

          if (filter) {
            this.active = new Set(_toConsumableArray(this.active).filter(function (t) {
              _newArrowCheck(this, _this2);

              return t.isActive();
            }.bind(this)));
          }
        }
      }
    }, {
      key: "createAnimation",
      value: function createAnimation(element, settings) {
        if (Utils.isObjectLiteral(settings)) {
          // Convert plain object to proper settings object.
          settings = this.createSettings(settings);
        }

        return new Animation(this, settings, element);
      }
    }, {
      key: "createSettings",
      value: function createSettings(settings) {
        var animationSettings = new AnimationSettings();
        Base.patchObject(animationSettings, settings);
        return animationSettings;
      }
    }, {
      key: "addActive",
      value: function addActive(transition) {
        this.active.add(transition);
      }
    }]);

    return AnimationManager;
  }();

  var RectangleTexture =
  /*#__PURE__*/
  function (_Texture) {
    _inherits(RectangleTexture, _Texture);

    function RectangleTexture() {
      _classCallCheck(this, RectangleTexture);

      return _possibleConstructorReturn(this, _getPrototypeOf(RectangleTexture).apply(this, arguments));
    }

    _createClass(RectangleTexture, [{
      key: "_getLookupId",
      value: function _getLookupId() {
        return '__whitepix';
      }
    }, {
      key: "_getSourceLoader",
      value: function _getSourceLoader() {
        return function (cb) {
          var whitePixel = new Uint8Array([255, 255, 255, 255]);
          cb(null, {
            source: whitePixel,
            w: 1,
            h: 1,
            permanent: true
          });
        };
      }
    }, {
      key: "isAutosizeTexture",
      value: function isAutosizeTexture() {
        return false;
      }
    }]);

    return RectangleTexture;
  }(Texture);

  var Stage =
  /*#__PURE__*/
  function (_EventEmitter) {
    _inherits(Stage, _EventEmitter);

    function Stage() {
      var _this;

      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      _classCallCheck(this, Stage);

      _this = _possibleConstructorReturn(this, _getPrototypeOf(Stage).call(this));

      _this._setOptions(options);

      _this._usedMemory = 0;
      _this._lastGcFrame = 0;
      var platformType = Stage.platform ? Stage.platform : PlatformLoader.load(options);
      _this.platform = new platformType();

      if (_this.platform.init) {
        _this.platform.init(_assertThisInitialized(_this));
      }

      _this.gl = null;
      _this.c2d = null;

      var context = _this.getOption('context');

      if (context) {
        if (context.useProgram) {
          _this.gl = context;
        } else {
          _this.c2d = context;
        }
      } else {
        if (Utils.isWeb && (!Stage.isWebglSupported() || _this.getOption('canvas2d'))) {
          console.log('Using canvas2d renderer');
          _this.c2d = _this.platform.createCanvasContext(_this.getOption('w'), _this.getOption('h'));
        } else {
          _this.gl = _this.platform.createWebGLContext(_this.getOption('w'), _this.getOption('h'));
        }
      }

      if (_this.gl) {
        // Wrap in WebGLStateManager.
        // This prevents unnecessary double WebGL commands from being executed, and allows context switching.
        // Context switching is necessary when reusing the same context for Three.js.
        // Note that the user must make sure that the WebGL context is untouched before creating the application,
        //  when manually passing over a canvas or context in the options.
        WebGLStateManager.enable(_this.gl, "lightning");
      }

      _this._mode = _this.gl ? 0 : 1; // Override width and height.

      if (_this.getCanvas()) {
        _this._options.w = _this.getCanvas().width;
        _this._options.h = _this.getCanvas().height;
      }

      if (_this._mode === 0) {
        _this._renderer = new WebGLRenderer(_assertThisInitialized(_this));
      } else {
        _this._renderer = new C2dRenderer(_assertThisInitialized(_this));
      }

      _this.setClearColor(_this.getOption('clearColor'));

      _this.frameCounter = 0;
      _this.transitions = new TransitionManager(_assertThisInitialized(_this));
      _this.animations = new AnimationManager(_assertThisInitialized(_this));
      _this.textureManager = new TextureManager(_assertThisInitialized(_this));
      _this.textureThrottler = new TextureThrottler(_assertThisInitialized(_this));
      _this.startTime = 0;
      _this.currentTime = 0;
      _this.dt = 0; // Preload rectangle texture, so that we can skip some border checks for loading textures.

      _this.rectangleTexture = new RectangleTexture(_assertThisInitialized(_this));

      _this.rectangleTexture.load(); // Never clean up because we use it all the time.


      _this.rectangleTexture.source.permanent = true;
      _this.ctx = new CoreContext(_assertThisInitialized(_this));
      _this._updateSourceTextures = new Set();
      return _this;
    }

    _createClass(Stage, [{
      key: "isWebgl",
      value: function isWebgl() {
        return this.mode === 0;
      }
    }, {
      key: "isC2d",
      value: function isC2d() {
        return this.mode === 1;
      }
    }, {
      key: "getOption",
      value: function getOption(name) {
        return this._options[name];
      }
    }, {
      key: "_setOptions",
      value: function _setOptions(o) {
        var _this2 = this;

        this._options = {};

        var opt = function opt(name, def) {
          _newArrowCheck(this, _this2);

          var value = o[name];

          if (value === undefined) {
            this._options[name] = def;
          } else {
            this._options[name] = value;
          }
        }.bind(this);

        opt('canvas', null);
        opt('context', null);
        opt('w', 1920);
        opt('h', 1080);
        opt('srcBasePath', null);
        opt('memoryPressure', 24e6);
        opt('bufferMemory', 2e6);
        opt('textRenderIssueMargin', 0);
        opt('clearColor', [0, 0, 0, 0]);
        opt('defaultFontFace', 'sans-serif');
        opt('fixedDt', 0);
        opt('useImageWorker', true);
        opt('autostart', true);
        opt('precision', 1);
        opt('canvas2d', false);
        opt('platform', null);
        opt('readPixelsBeforeDraw', false);
      }
    }, {
      key: "setApplication",
      value: function setApplication(app) {
        this.application = app;
      }
    }, {
      key: "init",
      value: function init() {
        this.application.setAsRoot();

        if (this.getOption('autostart')) {
          this.platform.startLoop();
        }
      }
    }, {
      key: "destroy",
      value: function destroy() {
        this.platform.stopLoop();
        this.platform.destroy();
        this.ctx.destroy();
        this.textureManager.destroy();

        this._renderer.destroy();
      }
    }, {
      key: "stop",
      value: function stop() {
        this.platform.stopLoop();
      }
    }, {
      key: "resume",
      value: function resume() {
        this.platform.startLoop();
      }
    }, {
      key: "getCanvas",
      value: function getCanvas() {
        return this._mode ? this.c2d.canvas : this.gl.canvas;
      }
    }, {
      key: "getRenderPrecision",
      value: function getRenderPrecision() {
        return this._options.precision;
      }
      /**
       * Marks a texture for updating it's source upon the next drawFrame.
       * @param texture
       */

    }, {
      key: "addUpdateSourceTexture",
      value: function addUpdateSourceTexture(texture) {
        if (this._updatingFrame) {
          // When called from the upload loop, we must immediately load the texture in order to avoid a 'flash'.
          texture._performUpdateSource();
        } else {
          this._updateSourceTextures.add(texture);
        }
      }
    }, {
      key: "removeUpdateSourceTexture",
      value: function removeUpdateSourceTexture(texture) {
        if (this._updateSourceTextures) {
          this._updateSourceTextures.delete(texture);
        }
      }
    }, {
      key: "hasUpdateSourceTexture",
      value: function hasUpdateSourceTexture(texture) {
        return this._updateSourceTextures && this._updateSourceTextures.has(texture);
      }
    }, {
      key: "drawFrame",
      value: function drawFrame() {
        var _this3 = this;

        this.startTime = this.currentTime;
        this.currentTime = this.platform.getHrTime();

        if (this._options.fixedDt) {
          this.dt = this._options.fixedDt;
        } else {
          this.dt = !this.startTime ? .02 : .001 * (this.currentTime - this.startTime);
        }

        this.emit('frameStart');

        if (this._updateSourceTextures.size) {
          this._updateSourceTextures.forEach(function (texture) {
            _newArrowCheck(this, _this3);

            texture._performUpdateSource();
          }.bind(this));

          this._updateSourceTextures = new Set();
        }

        this.emit('update');
        var changes = this.ctx.hasRenderUpdates(); // Update may cause textures to be loaded in sync, so by processing them here we may be able to show them
        // during the current frame already.

        this.textureThrottler.processSome();

        if (changes) {
          this._updatingFrame = true;
          this.ctx.update();
          this.ctx.render();
          this._updatingFrame = false;
        }

        this.platform.nextFrame(changes);
        this.emit('frameEnd');
        this.frameCounter++;
      }
    }, {
      key: "isUpdatingFrame",
      value: function isUpdatingFrame() {
        return this._updatingFrame;
      }
    }, {
      key: "renderFrame",
      value: function renderFrame() {
        this.ctx.frame();
      }
    }, {
      key: "forceRenderUpdate",
      value: function forceRenderUpdate() {
        // Enforce re-rendering.
        if (this.root) {
          this.root.core._parent.setHasRenderUpdates(1);
        }
      }
    }, {
      key: "setClearColor",
      value: function setClearColor(clearColor) {
        this.forceRenderUpdate();

        if (clearColor === null) {
          // Do not clear.
          this._clearColor = null;
        } else if (Array.isArray(clearColor)) {
          this._clearColor = clearColor;
        } else {
          this._clearColor = StageUtils.getRgbaComponentsNormalized(clearColor);
        }
      }
    }, {
      key: "getClearColor",
      value: function getClearColor() {
        return this._clearColor;
      }
    }, {
      key: "createElement",
      value: function createElement(settings) {
        if (settings) {
          return this.element(settings);
        } else {
          return new Element(this);
        }
      }
    }, {
      key: "createShader",
      value: function createShader(settings) {
        return Shader.create(this, settings);
      }
    }, {
      key: "element",
      value: function element(settings) {
        if (settings.isElement) return settings;
        var element;

        if (settings.type) {
          element = new settings.type(this);
        } else {
          element = new Element(this);
        }

        element.patch(settings);
        return element;
      }
    }, {
      key: "c",
      value: function c(settings) {
        return this.element(settings);
      }
    }, {
      key: "addMemoryUsage",
      value: function addMemoryUsage(delta) {
        this._usedMemory += delta;

        if (this._lastGcFrame !== this.frameCounter) {
          if (this._usedMemory > this.getOption('memoryPressure')) {
            this.gc(false);

            if (this._usedMemory > this.getOption('memoryPressure') - 2e6) {
              // Too few released. Aggressive cleanup.
              this.gc(true);
            }
          }
        }
      }
    }, {
      key: "gc",
      value: function gc(aggressive) {
        if (this._lastGcFrame !== this.frameCounter) {
          this._lastGcFrame = this.frameCounter;
          var memoryUsageBefore = this._usedMemory;
          this.gcTextureMemory(aggressive);
          this.gcRenderTextureMemory(aggressive);
          this.renderer.gc(aggressive);
          console.log(`GC${aggressive ? "[aggressive]" : ""}! Frame ${this._lastGcFrame} Freed ${((memoryUsageBefore - this._usedMemory) / 1e6).toFixed(2)}MP from GPU memory. Remaining: ${(this._usedMemory / 1e6).toFixed(2)}MP`);
          var other = this._usedMemory - this.textureManager.usedMemory - this.ctx.usedMemory;
          console.log(` Textures: ${(this.textureManager.usedMemory / 1e6).toFixed(2)}MP, Render Textures: ${(this.ctx.usedMemory / 1e6).toFixed(2)}MP, Renderer caches: ${(other / 1e6).toFixed(2)}MP`);
        }
      }
    }, {
      key: "gcTextureMemory",
      value: function gcTextureMemory() {
        var aggressive = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

        if (aggressive && this.ctx.root.visible) {
          // Make sure that ALL textures are cleaned;
          this.ctx.root.visible = false;
          this.textureManager.gc();
          this.ctx.root.visible = true;
        } else {
          this.textureManager.gc();
        }
      }
    }, {
      key: "gcRenderTextureMemory",
      value: function gcRenderTextureMemory() {
        var aggressive = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

        if (aggressive && this.root.visible) {
          // Make sure that ALL render textures are cleaned;
          this.root.visible = false;
          this.ctx.freeUnusedRenderTextures(0);
          this.root.visible = true;
        } else {
          this.ctx.freeUnusedRenderTextures(0);
        }
      }
    }, {
      key: "getDrawingCanvas",
      value: function getDrawingCanvas() {
        return this.platform.getDrawingCanvas();
      }
    }, {
      key: "update",
      value: function update() {
        this.ctx.update();
      }
    }, {
      key: "renderer",
      get: function get() {
        return this._renderer;
      }
    }, {
      key: "mode",

      /**
       * Returns the rendering mode.
       * @returns {number}
       *  0: WebGL
       *  1: Canvas2d
       */
      get: function get() {
        return this._mode;
      }
    }, {
      key: "root",
      get: function get() {
        return this.application;
      }
    }, {
      key: "w",
      get: function get() {
        return this._options.w;
      }
    }, {
      key: "h",
      get: function get() {
        return this._options.h;
      }
    }, {
      key: "coordsWidth",
      get: function get() {
        return this.w / this._options.precision;
      }
    }, {
      key: "coordsHeight",
      get: function get() {
        return this.h / this._options.precision;
      }
    }, {
      key: "usedMemory",
      get: function get() {
        return this._usedMemory;
      }
    }], [{
      key: "isWebglSupported",
      value: function isWebglSupported() {
        if (Utils.isNode) {
          return true;
        }

        try {
          return !!window.WebGLRenderingContext;
        } catch (e) {
          return false;
        }
      }
    }]);

    return Stage;
  }(EventEmitter);

  var Application =
  /*#__PURE__*/
  function (_Component) {
    _inherits(Application, _Component);

    function Application() {
      var _this2 = this;

      var _this;

      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var properties = arguments.length > 1 ? arguments[1] : undefined;

      _classCallCheck(this, Application);

      // Save options temporarily to avoid having to pass it through the constructor.
      Application._temp_options = options; // Booting flag is used to postpone updateFocusSettings;

      Application.booting = true;
      var stage = new Stage(options.stage);
      _this = _possibleConstructorReturn(this, _getPrototypeOf(Application).call(this, stage, properties));
      Application.booting = false;
      _this.__updateFocusCounter = 0;
      _this.__keypressTimers = new Map(); // We must construct while the application is not yet attached.
      // That's why we 'init' the stage later (which actually emits the attach event).

      _this.stage.init(); // Initially, the focus settings are updated after both the stage and application are constructed.


      _this.updateFocusSettings();

      _this.__keymap = _this.getOption('keys');

      if (_this.__keymap) {
        _this.stage.platform.registerKeydownHandler(function (e) {
          _newArrowCheck(this, _this2);

          _this._receiveKeydown(e);
        }.bind(this));

        _this.stage.platform.registerKeyupHandler(function (e) {
          _newArrowCheck(this, _this2);

          _this._receiveKeyup(e);
        }.bind(this));
      }

      return _this;
    }

    _createClass(Application, [{
      key: "getOption",
      value: function getOption(name) {
        return this.__options[name];
      }
    }, {
      key: "_setOptions",
      value: function _setOptions(o) {
        var _this3 = this;

        this.__options = {};

        var opt = function opt(name, def) {
          _newArrowCheck(this, _this3);

          var value = o[name];

          if (value === undefined) {
            this.__options[name] = def;
          } else {
            this.__options[name] = value;
          }
        }.bind(this);

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
    }, {
      key: "__construct",
      value: function __construct() {
        this.stage.setApplication(this);

        this._setOptions(Application._temp_options);

        delete Application._temp_options;

        _get(_getPrototypeOf(Application.prototype), "__construct", this).call(this);
      }
    }, {
      key: "__init",
      value: function __init() {
        _get(_getPrototypeOf(Application.prototype), "__init", this).call(this);

        this.__updateFocus();
      }
    }, {
      key: "updateFocusPath",
      value: function updateFocusPath() {
        this.__updateFocus();
      }
    }, {
      key: "__updateFocus",
      value: function __updateFocus() {
        var notOverridden = this.__updateFocusRec();

        if (!Application.booting && notOverridden) {
          this.updateFocusSettings();
        }
      }
    }, {
      key: "__updateFocusRec",
      value: function __updateFocusRec() {
        var updateFocusId = ++this.__updateFocusCounter;
        this.__updateFocusId = updateFocusId;

        var newFocusPath = this.__getFocusPath();

        var newFocusedComponent = newFocusPath[newFocusPath.length - 1];
        var prevFocusedComponent = this._focusPath ? this._focusPath[this._focusPath.length - 1] : undefined;

        if (!prevFocusedComponent) {
          // Focus events.
          this._focusPath = [];

          for (var i = 0, n = newFocusPath.length; i < n; i++) {
            this._focusPath.push(newFocusPath[i]);

            this._focusPath[i]._focus(newFocusedComponent, undefined);

            var focusOverridden = this.__updateFocusId !== updateFocusId;

            if (focusOverridden) {
              return false;
            }
          }

          return true;
        } else {
          var m = Math.min(this._focusPath.length, newFocusPath.length);
          var index;

          for (index = 0; index < m; index++) {
            if (this._focusPath[index] !== newFocusPath[index]) {
              break;
            }
          }

          if (this._focusPath.length !== newFocusPath.length || index !== newFocusPath.length) {
            if (this.__options.debug) {
              console.log('FOCUS ' + newFocusedComponent.getLocationString());
            } // Unfocus events.


            for (var _i = this._focusPath.length - 1; _i >= index; _i--) {
              var unfocusedElement = this._focusPath.pop();

              unfocusedElement._unfocus(newFocusedComponent, prevFocusedComponent);

              var _focusOverridden = this.__updateFocusId !== updateFocusId;

              if (_focusOverridden) {
                return false;
              }
            } // Focus events.


            for (var _i2 = index, _n = newFocusPath.length; _i2 < _n; _i2++) {
              this._focusPath.push(newFocusPath[_i2]);

              this._focusPath[_i2]._focus(newFocusedComponent, prevFocusedComponent);

              var _focusOverridden2 = this.__updateFocusId !== updateFocusId;

              if (_focusOverridden2) {
                return false;
              }
            } // Focus changed events.


            for (var _i3 = 0; _i3 < index; _i3++) {
              this._focusPath[_i3]._focusChange(newFocusedComponent, prevFocusedComponent);
            }
          }
        }

        return true;
      }
    }, {
      key: "updateFocusSettings",
      value: function updateFocusSettings() {
        var focusedComponent = this._focusPath[this._focusPath.length - 1]; // Get focus settings. These can be used for dynamic application-wide settings that depend on the
        // focus directly (such as the application background).

        var focusSettings = {};
        var defaultSetFocusSettings = Component.prototype._setFocusSettings;

        for (var i = 0, n = this._focusPath.length; i < n; i++) {
          if (this._focusPath[i]._setFocusSettings !== defaultSetFocusSettings) {
            this._focusPath[i]._setFocusSettings(focusSettings);
          }
        }

        var defaultHandleFocusSettings = Component.prototype._handleFocusSettings;

        for (var _i4 = 0, _n2 = this._focusPath.length; _i4 < _n2; _i4++) {
          if (this._focusPath[_i4]._handleFocusSettings !== defaultHandleFocusSettings) {
            this._focusPath[_i4]._handleFocusSettings(focusSettings, this.__prevFocusSettings, focusedComponent);
          }
        }

        this.__prevFocusSettings = focusSettings;
      }
    }, {
      key: "_handleFocusSettings",
      value: function _handleFocusSettings(settings, prevSettings, focused, prevFocused) {// Override to handle focus-based settings.
      }
    }, {
      key: "__getFocusPath",
      value: function __getFocusPath() {
        var path = [this];
        var current = this;

        do {
          var nextFocus = current._getFocused();

          if (!nextFocus || nextFocus === current) {
            // Found!;
            break;
          }

          var ptr = nextFocus.cparent;

          if (ptr === current) {
            path.push(nextFocus);
          } else {
            // Not an immediate child: include full path to descendant.
            var newParts = [nextFocus];

            do {
              if (!ptr) {
                current._throwError("Return value for _getFocused must be an attached descendant component but its '" + nextFocus.getLocationString() + "'");
              }

              newParts.push(ptr);
              ptr = ptr.cparent;
            } while (ptr !== current); // Add them reversed.


            for (var i = 0, n = newParts.length; i < n; i++) {
              path.push(newParts[n - i - 1]);
            }
          }

          current = nextFocus;
        } while (true);

        return path;
      }
    }, {
      key: "focusTopDownEvent",

      /**
       * Injects an event in the state machines, top-down from application to focused component.
       */
      value: function focusTopDownEvent(events) {
        var path = this.focusPath;
        var n = path.length; // Multiple events.

        for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
          args[_key - 1] = arguments[_key];
        }

        for (var i = 0; i < n; i++) {
          var event = path[i]._getMostSpecificHandledMember(events);

          if (event !== undefined) {
            var _path$i;

            var returnValue = (_path$i = path[i])[event].apply(_path$i, args);

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

    }, {
      key: "focusBottomUpEvent",
      value: function focusBottomUpEvent(events) {
        var path = this.focusPath;
        var n = path.length; // Multiple events.

        for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
          args[_key2 - 1] = arguments[_key2];
        }

        for (var i = n - 1; i >= 0; i--) {
          var event = path[i]._getMostSpecificHandledMember(events);

          if (event !== undefined) {
            var _path$i2;

            var returnValue = (_path$i2 = path[i])[event].apply(_path$i2, args);

            if (returnValue !== false) {
              return true;
            }
          }
        }

        return false;
      }
    }, {
      key: "_receiveKeydown",
      value: function _receiveKeydown(e) {
        var obj = e;
        var key = this.__keymap[e.keyCode];
        var path = this.focusPath;

        if (key) {
          var hasTimer = this.__keypressTimers.has(key); // prevent event from getting fired when the timeout is still active


          if (path[path.length - 1].longpress && hasTimer) {
            return;
          }
        }

        if (key) {
          if (!this.stage.application.focusTopDownEvent([`_capture${key}`, "_captureKey"], obj)) {
            this.stage.application.focusBottomUpEvent([`_handle${key}`, "_handleKey"], obj);
          }
        } else {
          if (!this.stage.application.focusTopDownEvent(["_captureKey"], obj)) {
            this.stage.application.focusBottomUpEvent(["_handleKey"], obj);
          }
        }

        this.updateFocusPath();
        var consumer = path[path.length - 1];

        if (key && consumer.longpress) {
          this._startLongpressTimer(key, consumer);
        }
      }
      /**
       * Keyup listener
       * To take away some confusion we add `Release` to the event to prevent ending up with method names like:
       *  _handleLeftUp / _handleUpUp / _handleEnterUp etc
       *
       * @param e
       * @private
       */

    }, {
      key: "_receiveKeyup",
      value: function _receiveKeyup(e) {
        var obj = e;
        var key = this.__keymap[e.keyCode];

        if (key) {
          if (!this.stage.application.focusTopDownEvent([`_capture${key}Release`, "_captureKeyRelease"], obj)) {
            this.stage.application.focusBottomUpEvent([`_handle${key}Release`, "_handleKeyRelease"], obj);
          }
        } else {
          if (!this.stage.application.focusTopDownEvent(["_captureKeyRelease"], obj)) {
            this.stage.application.focusBottomUpEvent(["_handleKeyRelease"], obj);
          }
        }

        this.updateFocusPath();

        if (key) {
          if (this.__keypressTimers.has(key)) {
            // keyup has fired before end of timeout so we clear it
            clearTimeout(this.__keypressTimers.get(key)); // delete so we can register it again

            this.__keypressTimers.delete(key);
          }
        }
      }
      /**
       * Registers and starts a timer for the pressed key. Timer will be cleared when the key is released
       * before the timer goes off.
       *
       * If key is not release (keyup) the longpress handler will be fired.
       * Configuration can be via the Components template:
       *
       * static _template() {
       *     return {
       *         w:100, h:100,
       *         longpress:{up:700, down:500}
       *     }
       * }     *
       * // this will get called when up has been pressed for 700ms
       * _handleUpLong() {
       *
       * }
       *
       * @param key
       * @param element
       * @private
       */

    }, {
      key: "_startLongpressTimer",
      value: function _startLongpressTimer(key, element) {
        var _this4 = this;

        var config = element.longpress;
        var lookup = key.toLowerCase();

        if (config[lookup]) {
          var timeout = config[lookup];

          if (!Utils.isNumber(timeout)) {
            element._throwError("config value for longpress must be a number");
          } else {
            this.__keypressTimers.set(key, setTimeout(function () {
              _newArrowCheck(this, _this4);

              if (!this.stage.application.focusTopDownEvent([`_capture${key}Long`, "_captureKey"], {})) {
                this.stage.application.focusBottomUpEvent([`_handle${key}Long`, "_handleKey"], {});
              }

              this.__keypressTimers.delete(key);
            }.bind(this), timeout || 500
            /* prevent 0ms */
            ));
          }
        }

        return;
      }
    }, {
      key: "destroy",
      value: function destroy() {
        if (!this._destroyed) {
          this._destroy();

          this.stage.destroy();
          this._destroyed = true;
        }
      }
    }, {
      key: "_destroy",
      value: function _destroy() {
        // This forces the _detach, _disabled and _active events to be called.
        this.stage.setApplication(undefined);

        this._updateAttachedFlag();

        this._updateEnabledFlag();

        if (this.__keypressTimers.size) {
          var _iteratorNormalCompletion = true;
          var _didIteratorError = false;
          var _iteratorError = undefined;

          try {
            for (var _iterator = this.__keypressTimers.values()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
              var timer = _step.value;
              clearTimeout(timer);
            }
          } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion && _iterator.return != null) {
                _iterator.return();
              }
            } finally {
              if (_didIteratorError) {
                throw _iteratorError;
              }
            }
          }

          this.__keypressTimers.clear();
        }
      }
    }, {
      key: "getCanvas",
      value: function getCanvas() {
        return this.stage.getCanvas();
      }
    }, {
      key: "focusPath",
      get: function get$$1() {
        return this._focusPath;
      }
    }]);

    return Application;
  }(Component);

  var StaticCanvasTexture =
  /*#__PURE__*/
  function (_Texture) {
    _inherits(StaticCanvasTexture, _Texture);

    function StaticCanvasTexture(stage) {
      var _this;

      _classCallCheck(this, StaticCanvasTexture);

      _this = _possibleConstructorReturn(this, _getPrototypeOf(StaticCanvasTexture).call(this, stage));
      _this._factory = undefined;
      _this._lookupId = undefined;
      return _this;
    }

    _createClass(StaticCanvasTexture, [{
      key: "_getIsValid",
      value: function _getIsValid() {
        return !!this._factory;
      }
    }, {
      key: "_getLookupId",
      value: function _getLookupId() {
        return this._lookupId;
      }
    }, {
      key: "_getSourceLoader",
      value: function _getSourceLoader() {
        var _this2 = this;

        var f = this._factory;
        return function (cb) {
          var _this3 = this;

          _newArrowCheck(this, _this2);

          return f(function (err, canvas) {
            _newArrowCheck(this, _this3);

            if (err) {
              return cb(err);
            }

            cb(null, this.stage.platform.getTextureOptionsForDrawingCanvas(canvas));
          }.bind(this), this.stage);
        }.bind(this);
      }
    }, {
      key: "content",
      set: function set(_ref) {
        var factory = _ref.factory,
            _ref$lookupId = _ref.lookupId,
            lookupId = _ref$lookupId === void 0 ? undefined : _ref$lookupId;
        this._factory = factory;
        this._lookupId = lookupId;

        this._changed();
      }
    }]);

    return StaticCanvasTexture;
  }(Texture);

  var Tools =
  /*#__PURE__*/
  function () {
    function Tools() {
      _classCallCheck(this, Tools);
    }

    _createClass(Tools, null, [{
      key: "getCanvasTexture",
      value: function getCanvasTexture(canvasFactory, lookupId) {
        return {
          type: StaticCanvasTexture,
          content: {
            factory: canvasFactory,
            lookupId: lookupId
          }
        };
      }
    }, {
      key: "getRoundRect",
      value: function getRoundRect(w, h, radius, strokeWidth, strokeColor, fill, fillColor) {
        var _this = this;

        if (!Array.isArray(radius)) {
          // upper-left, upper-right, bottom-right, bottom-left.
          radius = [radius, radius, radius, radius];
        }

        var factory = function factory(cb, stage) {
          _newArrowCheck(this, _this);

          if (Utils.isSpark) {
            stage.platform.createRoundRect(cb, stage, w, h, radius, strokeWidth, strokeColor, fill, fillColor);
          } else {
            cb(null, this.createRoundRect(stage, w, h, radius, strokeWidth, strokeColor, fill, fillColor));
          }
        }.bind(this);

        var id = 'rect' + [w, h, strokeWidth, strokeColor, fill ? 1 : 0, fillColor].concat(radius).join(",");
        return Tools.getCanvasTexture(factory, id);
      }
    }, {
      key: "createRoundRect",
      value: function createRoundRect(stage, w, h, radius, strokeWidth, strokeColor, fill, fillColor) {
        if (fill === undefined) fill = true;
        if (strokeWidth === undefined) strokeWidth = 0;
        var canvas = stage.platform.getDrawingCanvas();
        var ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        canvas.width = w + strokeWidth + 2;
        canvas.height = h + strokeWidth + 2;
        ctx.beginPath();
        var x = 0.5 * strokeWidth + 1,
            y = 0.5 * strokeWidth + 1;
        ctx.moveTo(x + radius[0], y);
        ctx.lineTo(x + w - radius[1], y);
        ctx.arcTo(x + w, y, x + w, y + radius[1], radius[1]);
        ctx.lineTo(x + w, y + h - radius[2]);
        ctx.arcTo(x + w, y + h, x + w - radius[2], y + h, radius[2]);
        ctx.lineTo(x + radius[3], y + h);
        ctx.arcTo(x, y + h, x, y + h - radius[3], radius[3]);
        ctx.lineTo(x, y + radius[0]);
        ctx.arcTo(x, y, x + radius[0], y, radius[0]);
        ctx.closePath();

        if (fill) {
          if (Utils.isNumber(fillColor)) {
            ctx.fillStyle = StageUtils.getRgbaString(fillColor);
          } else {
            ctx.fillStyle = "white";
          }

          ctx.fill();
        }

        if (strokeWidth) {
          if (Utils.isNumber(strokeColor)) {
            ctx.strokeStyle = StageUtils.getRgbaString(strokeColor);
          } else {
            ctx.strokeStyle = "white";
          }

          ctx.lineWidth = strokeWidth;
          ctx.stroke();
        }

        return canvas;
      }
    }, {
      key: "getShadowRect",
      value: function getShadowRect(w, h) {
        var _this2 = this;

        var radius = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
        var blur = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 5;
        var margin = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : blur * 2;

        if (!Array.isArray(radius)) {
          // upper-left, upper-right, bottom-right, bottom-left.
          radius = [radius, radius, radius, radius];
        }

        var factory = function factory(cb, stage) {
          _newArrowCheck(this, _this2);

          if (Utils.isSpark) {
            stage.platform.createShadowRect(cb, stage, w, h, radius, blur, margin);
          } else {
            cb(null, this.createShadowRect(stage, w, h, radius, blur, margin));
          }
        }.bind(this);

        var id = 'shadow' + [w, h, blur, margin].concat(radius).join(",");
        return Tools.getCanvasTexture(factory, id);
      }
    }, {
      key: "createShadowRect",
      value: function createShadowRect(stage, w, h, radius, blur, margin) {
        var canvas = stage.platform.getDrawingCanvas();
        var ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        canvas.width = w + margin * 2;
        canvas.height = h + margin * 2; // WpeWebKit bug: we experienced problems without this with shadows in noncompositedwebgl mode.

        ctx.globalAlpha = 0.01;
        ctx.fillRect(0, 0, 0.01, 0.01);
        ctx.globalAlpha = 1.0;
        ctx.shadowColor = StageUtils.getRgbaString(0xFFFFFFFF);
        ctx.fillStyle = StageUtils.getRgbaString(0xFFFFFFFF);
        ctx.shadowBlur = blur;
        ctx.shadowOffsetX = w + 10 + margin;
        ctx.shadowOffsetY = margin;
        ctx.beginPath();
        var x = -(w + 10);
        var y = 0;
        ctx.moveTo(x + radius[0], y);
        ctx.lineTo(x + w - radius[1], y);
        ctx.arcTo(x + w, y, x + w, y + radius[1], radius[1]);
        ctx.lineTo(x + w, y + h - radius[2]);
        ctx.arcTo(x + w, y + h, x + w - radius[2], y + h, radius[2]);
        ctx.lineTo(x + radius[3], y + h);
        ctx.arcTo(x, y + h, x, y + h - radius[3], radius[3]);
        ctx.lineTo(x, y + radius[0]);
        ctx.arcTo(x, y, x + radius[0], y, radius[0]);
        ctx.closePath();
        ctx.fill();
        return canvas;
      }
    }, {
      key: "getSvgTexture",
      value: function getSvgTexture(url, w, h) {
        var _this3 = this;

        var factory = function factory(cb, stage) {
          _newArrowCheck(this, _this3);

          if (Utils.isSpark) {
            stage.platform.createSvg(cb, stage, url, w, h);
          } else {
            this.createSvg(cb, stage, url, w, h);
          }
        }.bind(this);

        var id = 'svg' + [w, h, url].join(",");
        return Tools.getCanvasTexture(factory, id);
      }
    }, {
      key: "createSvg",
      value: function createSvg(cb, stage, url, w, h) {
        var _this4 = this;

        var canvas = stage.platform.getDrawingCanvas();
        var ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        var img = new Image();

        img.onload = function () {
          _newArrowCheck(this, _this4);

          canvas.width = w;
          canvas.height = h;
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          cb(null, canvas);
        }.bind(this);

        img.onError = function (err) {
          _newArrowCheck(this, _this4);

          cb(err);
        }.bind(this);

        img.src = url;
      }
    }]);

    return Tools;
  }();

  var ObjMerger =
  /*#__PURE__*/
  function () {
    function ObjMerger() {
      _classCallCheck(this, ObjMerger);
    }

    _createClass(ObjMerger, null, [{
      key: "isMf",
      value: function isMf(f) {
        return Utils.isFunction(f) && f.__mf;
      }
    }, {
      key: "mf",
      value: function mf(f) {
        // Set as merge function.
        f.__mf = true;
        return f;
      }
    }, {
      key: "merge",
      value: function merge(a, b) {
        var aks = Object.keys(a);
        var bks = Object.keys(b);

        if (!bks.length) {
          return a;
        } // Create index array for all elements.


        var ai = {};
        var bi = {};

        for (var i = 0, n = bks.length; i < n; i++) {
          var key = bks[i];
          ai[key] = -1;
          bi[key] = i;
        }

        for (var _i = 0, _n = aks.length; _i < _n; _i++) {
          var _key = aks[_i];
          ai[_key] = _i;

          if (bi[_key] === undefined) {
            bi[_key] = -1;
          }
        }

        var aksl = aks.length;
        var result = {};

        for (var _i2 = 0, _n2 = bks.length; _i2 < _n2; _i2++) {
          var _key2 = bks[_i2]; // Prepend all items in a that are not in b - before the now added b attribute.

          var aIndex = ai[_key2];
          var _curIndex = aIndex;

          while (--_curIndex >= 0) {
            var akey = aks[_curIndex];

            if (bi[akey] !== -1) {
              // Already found? Stop processing.
              // Not yet found but exists in b? Also stop processing: wait until we find it in b.
              break;
            }
          }

          while (++_curIndex < aIndex) {
            var _akey = aks[_curIndex];
            result[_akey] = a[_akey];
          }

          var bv = b[_key2];
          var av = a[_key2];
          var r = void 0;

          if (this.isMf(bv)) {
            r = bv(av);
          } else {
            if (!Utils.isObjectLiteral(av) || !Utils.isObjectLiteral(bv)) {
              r = bv;
            } else {
              r = ObjMerger.merge(av, bv);
            }
          } // When marked as undefined, property is deleted.


          if (r !== undefined) {
            result[_key2] = r;
          }
        } // Append remaining final items in a.


        var curIndex = aksl;

        while (--curIndex >= 0) {
          var _akey2 = aks[curIndex];

          if (bi[_akey2] !== -1) {
            break;
          }
        }

        while (++curIndex < aksl) {
          var _akey3 = aks[curIndex];
          result[_akey3] = a[_akey3];
        }

        return result;
      }
    }]);

    return ObjMerger;
  }();

  var ObjectListProxy =
  /*#__PURE__*/
  function (_ObjectList) {
    _inherits(ObjectListProxy, _ObjectList);

    function ObjectListProxy(target) {
      var _this;

      _classCallCheck(this, ObjectListProxy);

      _this = _possibleConstructorReturn(this, _getPrototypeOf(ObjectListProxy).call(this));
      _this._target = target;
      return _this;
    }

    _createClass(ObjectListProxy, [{
      key: "onAdd",
      value: function onAdd(item, index) {
        this._target.addAt(item, index);
      }
    }, {
      key: "onRemove",
      value: function onRemove(item, index) {
        this._target.removeAt(index);
      }
    }, {
      key: "onSync",
      value: function onSync(removed, added, order) {
        this._target._setByArray(order);
      }
    }, {
      key: "onSet",
      value: function onSet(item, index) {
        this._target.setAt(item, index);
      }
    }, {
      key: "onMove",
      value: function onMove(item, fromIndex, toIndex) {
        this._target.setAt(item, toIndex);
      }
    }, {
      key: "createItem",
      value: function createItem(object) {
        return this._target.createItem(object);
      }
    }, {
      key: "isItem",
      value: function isItem(object) {
        return this._target.isItem(object);
      }
    }]);

    return ObjectListProxy;
  }(ObjectList);

  var ObjectListWrapper =
  /*#__PURE__*/
  function (_ObjectListProxy) {
    _inherits(ObjectListWrapper, _ObjectListProxy);

    function ObjectListWrapper(target, wrap) {
      var _this;

      _classCallCheck(this, ObjectListWrapper);

      _this = _possibleConstructorReturn(this, _getPrototypeOf(ObjectListWrapper).call(this, target));
      _this._wrap = wrap;
      return _this;
    }

    _createClass(ObjectListWrapper, [{
      key: "wrap",
      value: function wrap(item) {
        var wrapper = this._wrap(item);

        item._wrapper = wrapper;
        return wrapper;
      }
    }, {
      key: "onAdd",
      value: function onAdd(item, index) {
        item = this.wrap(item);

        _get(_getPrototypeOf(ObjectListWrapper.prototype), "onAdd", this).call(this, item, index);
      }
    }, {
      key: "onRemove",
      value: function onRemove(item, index) {
        _get(_getPrototypeOf(ObjectListWrapper.prototype), "onRemove", this).call(this, item, index);
      }
    }, {
      key: "onSync",
      value: function onSync(removed, added, order) {
        var _this2 = this;

        added.forEach(function (a) {
          _newArrowCheck(this, _this2);

          return this.wrap(a);
        }.bind(this));
        order = order.map(function (a) {
          _newArrowCheck(this, _this2);

          return a._wrapper;
        }.bind(this));

        _get(_getPrototypeOf(ObjectListWrapper.prototype), "onSync", this).call(this, removed, added, order);
      }
    }, {
      key: "onSet",
      value: function onSet(item, index) {
        item = this.wrap(item);

        _get(_getPrototypeOf(ObjectListWrapper.prototype), "onSet", this).call(this, item, index);
      }
    }, {
      key: "onMove",
      value: function onMove(item, fromIndex, toIndex) {
        _get(_getPrototypeOf(ObjectListWrapper.prototype), "onMove", this).call(this, item, fromIndex, toIndex);
      }
    }]);

    return ObjectListWrapper;
  }(ObjectListProxy);

  var NoiseTexture =
  /*#__PURE__*/
  function (_Texture) {
    _inherits(NoiseTexture, _Texture);

    function NoiseTexture() {
      _classCallCheck(this, NoiseTexture);

      return _possibleConstructorReturn(this, _getPrototypeOf(NoiseTexture).apply(this, arguments));
    }

    _createClass(NoiseTexture, [{
      key: "_getLookupId",
      value: function _getLookupId() {
        return '__noise';
      }
    }, {
      key: "_getSourceLoader",
      value: function _getSourceLoader() {
        var gl = this.stage.gl;
        return function (cb) {
          var noise = new Uint8Array(128 * 128 * 4);

          for (var i = 0; i < 128 * 128 * 4; i += 4) {
            var v = Math.floor(Math.random() * 256);
            noise[i] = v;
            noise[i + 1] = v;
            noise[i + 2] = v;
            noise[i + 3] = 255;
          }

          var texParams = {};

          if (gl) {
            texParams[gl.TEXTURE_WRAP_S] = gl.REPEAT;
            texParams[gl.TEXTURE_WRAP_T] = gl.REPEAT;
            texParams[gl.TEXTURE_MIN_FILTER] = gl.NEAREST;
            texParams[gl.TEXTURE_MAG_FILTER] = gl.NEAREST;
          }

          cb(null, {
            source: noise,
            w: 128,
            h: 128,
            texParams: texParams
          });
        };
      }
    }]);

    return NoiseTexture;
  }(Texture);

  var HtmlTexture =
  /*#__PURE__*/
  function (_Texture) {
    _inherits(HtmlTexture, _Texture);

    function HtmlTexture(stage) {
      var _this;

      _classCallCheck(this, HtmlTexture);

      _this = _possibleConstructorReturn(this, _getPrototypeOf(HtmlTexture).call(this, stage));
      _this._htmlElement = undefined;
      _this._scale = 1;
      return _this;
    }

    _createClass(HtmlTexture, [{
      key: "_getIsValid",
      value: function _getIsValid() {
        return this.htmlElement;
      }
    }, {
      key: "_getLookupId",
      value: function _getLookupId() {
        return this._scale + ":" + this._htmlElement.innerHTML;
      }
    }, {
      key: "_getSourceLoader",
      value: function _getSourceLoader() {
        var htmlElement = this._htmlElement;
        var scale = this._scale;
        return function (cb) {
          var _this2 = this;

          if (!window.html2canvas) {
            return cb(new Error("Please include html2canvas (https://html2canvas.hertzen.com/)"));
          }

          var area = HtmlTexture.getPreloadArea();
          area.appendChild(htmlElement);
          html2canvas(htmlElement, {
            backgroundColor: null,
            scale: scale
          }).then(function (canvas) {
            area.removeChild(htmlElement);

            if (canvas.height === 0) {
              return cb(new Error("Canvas height is 0"));
            }

            cb(null, {
              source: canvas,
              width: canvas.width,
              height: canvas.height
            });
          }).catch(function (e) {
            _newArrowCheck(this, _this2);

            console.error(e);
          }.bind(this));
        };
      }
    }, {
      key: "htmlElement",
      set: function set(v) {
        this._htmlElement = v;

        this._changed();
      },
      get: function get() {
        return this._htmlElement;
      }
    }, {
      key: "scale",
      set: function set(v) {
        this._scale = v;

        this._changed();
      },
      get: function get() {
        return this._scale;
      }
    }, {
      key: "html",
      set: function set(v) {
        if (!v) {
          this.htmlElement = undefined;
        } else {
          var d = document.createElement('div');
          d.innerHTML = "<div>" + v + "</div>";
          this.htmlElement = d.firstElementChild;
        }
      },
      get: function get() {
        return this._htmlElement.innerHTML;
      }
    }], [{
      key: "getPreloadArea",
      value: function getPreloadArea() {
        if (!this._preloadArea) {
          // Preload area must be included in document body and must be visible to trigger html element rendering.
          this._preloadArea = document.createElement('div');

          if (this._preloadArea.attachShadow) {
            // Use a shadow DOM if possible to prevent styling from interfering.
            this._preloadArea.attachShadow({
              mode: 'closed'
            });
          }

          this._preloadArea.style.opacity = 0;
          this._preloadArea.style.pointerEvents = 'none';
          this._preloadArea.style.position = 'fixed';
          this._preloadArea.style.display = 'block';
          this._preloadArea.style.top = '100vh';
          this._preloadArea.style.overflow = 'hidden';
          document.body.appendChild(this._preloadArea);
        }

        return this._preloadArea;
      }
    }]);

    return HtmlTexture;
  }(Texture);

  var StaticTexture =
  /*#__PURE__*/
  function (_Texture) {
    _inherits(StaticTexture, _Texture);

    function StaticTexture(stage, options) {
      var _this;

      _classCallCheck(this, StaticTexture);

      _this = _possibleConstructorReturn(this, _getPrototypeOf(StaticTexture).call(this, stage));
      _this._options = options;
      return _this;
    }

    _createClass(StaticTexture, [{
      key: "_getIsValid",
      value: function _getIsValid() {
        return !!this._options;
      }
    }, {
      key: "_getSourceLoader",
      value: function _getSourceLoader() {
        var _this2 = this;

        return function (cb) {
          _newArrowCheck(this, _this2);

          cb(null, this._options);
        }.bind(this);
      }
    }, {
      key: "options",
      set: function set(v) {
        if (this._options !== v) {
          this._options = v;

          this._changed();
        }
      },
      get: function get() {
        return this._options;
      }
    }]);

    return StaticTexture;
  }(Texture);

  var ListComponent =
  /*#__PURE__*/
  function (_Component) {
    _inherits(ListComponent, _Component);

    function ListComponent(stage) {
      var _this;

      _classCallCheck(this, ListComponent);

      _this = _possibleConstructorReturn(this, _getPrototypeOf(ListComponent).call(this, stage));
      _this._wrapper = _get(_getPrototypeOf(ListComponent.prototype), "_children", _assertThisInitialized(_this)).a({});
      _this._reloadVisibleElements = false;
      _this._visibleItems = new Set();
      _this._index = 0;
      _this._started = false;
      /**
       * The transition definition that is being used when scrolling the items.
       * @type TransitionSettings
       */

      _this._scrollTransitionSettings = _this.stage.transitions.createSettings({});
      /**
       * The scroll area size in pixels per item.
       */

      _this._itemSize = 100;
      _this._viewportScrollOffset = 0;
      _this._itemScrollOffset = 0;
      /**
       * Should the list jump when scrolling between end to start, or should it be continuous, like a carrousel?
       */

      _this._roll = false;
      /**
       * Allows restricting the start scroll position.
       */

      _this._rollMin = 0;
      /**
       * Allows restricting the end scroll position.
       */

      _this._rollMax = 0;
      /**
       * Definition for a custom animation that is applied when an item is (partially) selected.
       * @type AnimationSettings
       */

      _this._progressAnimation = null;
      /**
       * Inverts the scrolling direction.
       * @type {boolean}
       * @private
       */

      _this._invertDirection = false;
      /**
       * Layout the items horizontally or vertically?
       * @type {boolean}
       * @private
       */

      _this._horizontal = true;
      _this.itemList = new ListItems(_assertThisInitialized(_this));
      return _this;
    }

    _createClass(ListComponent, [{
      key: "_allowChildrenAccess",
      value: function _allowChildrenAccess() {
        return false;
      }
    }, {
      key: "start",
      value: function start() {
        var _this2 = this;

        this._wrapper.transition(this.property, this._scrollTransitionSettings);

        this._scrollTransition = this._wrapper.transition(this.property);

        this._scrollTransition.on('progress', function (p) {
          _newArrowCheck(this, _this2);

          return this.update();
        }.bind(this));

        this.setIndex(0, true, true);
        this._started = true;
        this.update();
      }
    }, {
      key: "setIndex",
      value: function setIndex(index) {
        var immediate = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
        var closest = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
        var nElements = this.length;
        if (!nElements) return;
        this.emit('unfocus', this.getElement(this.realIndex), this._index, this.realIndex);

        if (closest) {
          // Scroll to same offset closest to the index.
          var offset = Utils.getModuloIndex(index, nElements);
          var o = Utils.getModuloIndex(this.index, nElements);
          var diff = offset - o;

          if (diff > 0.5 * nElements) {
            diff -= nElements;
          } else if (diff < -0.5 * nElements) {
            diff += nElements;
          }

          this._index += diff;
        } else {
          this._index = index;
        }

        if (this._roll || this.viewportSize > this._itemSize * nElements) {
          this._index = Utils.getModuloIndex(this._index, nElements);
        }

        var direction = this._horizontal ^ this._invertDirection ? -1 : 1;
        var value = direction * this._index * this._itemSize;

        if (this._roll) {
          var min, max, scrollDelta;

          if (direction == 1) {
            max = (nElements - 1) * this._itemSize;
            scrollDelta = this._viewportScrollOffset * this.viewportSize - this._itemScrollOffset * this._itemSize;
            max -= scrollDelta;
            min = this.viewportSize - (this._itemSize + scrollDelta);
            if (this._rollMin) min -= this._rollMin;
            if (this._rollMax) max += this._rollMax;
            value = Math.max(Math.min(value, max), min);
          } else {
            max = nElements * this._itemSize - this.viewportSize;
            scrollDelta = this._viewportScrollOffset * this.viewportSize - this._itemScrollOffset * this._itemSize;
            max += scrollDelta;
            var _min = scrollDelta;
            if (this._rollMin) _min -= this._rollMin;
            if (this._rollMax) max += this._rollMax;
            value = Math.min(Math.max(-max, value), -_min);
          }
        }

        this._scrollTransition.start(value);

        if (immediate) {
          this._scrollTransition.finish();
        }

        this.emit('focus', this.getElement(this.realIndex), this._index, this.realIndex);
      }
    }, {
      key: "getAxisPosition",
      value: function getAxisPosition() {
        var target = -this._scrollTransition._targetValue;
        var direction = this._horizontal ^ this._invertDirection ? -1 : 1;
        var value = -direction * this._index * this._itemSize;
        return this._viewportScrollOffset * this.viewportSize + (value - target);
      }
    }, {
      key: "update",
      value: function update() {
        if (!this._started) return;
        var nElements = this.length;
        if (!nElements) return;
        var direction = this._horizontal ^ this._invertDirection ? -1 : 1; // Map position to index value.

        var v = this._horizontal ? this._wrapper.x : this._wrapper.y;
        var viewportSize = this.viewportSize;
        var scrollDelta = this._viewportScrollOffset * viewportSize - this._itemScrollOffset * this._itemSize;
        v += scrollDelta;
        var s, e, ps, pe;

        if (direction == -1) {
          s = Math.floor(-v / this._itemSize);
          ps = 1 - (-v / this._itemSize - s);
          e = Math.floor((viewportSize - v) / this._itemSize);
          pe = (viewportSize - v) / this._itemSize - e;
        } else {
          s = Math.ceil(v / this._itemSize);
          ps = 1 + v / this._itemSize - s;
          e = Math.ceil((v - viewportSize) / this._itemSize);
          pe = e - (v - viewportSize) / this._itemSize;
        }

        if (this._roll || viewportSize > this._itemSize * nElements) {
          // Don't show additional items.
          if (e >= nElements) {
            e = nElements - 1;
            pe = 1;
          }

          if (s >= nElements) {
            s = nElements - 1;
            ps = 1;
          }

          if (e <= -1) {
            e = 0;
            pe = 1;
          }

          if (s <= -1) {
            s = 0;
            ps = 1;
          }
        }

        var offset = -direction * s * this._itemSize;
        var item;

        for (var index = s; direction == -1 ? index <= e : index >= e; direction == -1 ? index++ : index--) {
          var realIndex = Utils.getModuloIndex(index, nElements);
          var element = this.getElement(realIndex);
          item = element.parent;

          this._visibleItems.delete(item);

          if (this._horizontal) {
            item.x = offset + scrollDelta;
          } else {
            item.y = offset + scrollDelta;
          }

          var wasVisible = item.visible;
          item.visible = true;

          if (!wasVisible || this._reloadVisibleElements) {
            // Turned visible.
            this.emit('visible', index, realIndex);
          }

          if (this._progressAnimation) {
            var p = 1;

            if (index == s) {
              p = ps;
            } else if (index == e) {
              p = pe;
            } // Use animation to progress.


            this._progressAnimation.apply(element, p);
          }

          offset += this._itemSize;
        } // Handle item visibility.


        var self = this;

        this._visibleItems.forEach(function (invisibleItem) {
          invisibleItem.visible = false;

          self._visibleItems.delete(invisibleItem);
        });

        for (var _index = s; direction == -1 ? _index <= e : _index >= e; direction == -1 ? _index++ : _index--) {
          var _realIndex = Utils.getModuloIndex(_index, nElements);

          this._visibleItems.add(this.getWrapper(_realIndex));
        }

        this._reloadVisibleElements = false;
      }
    }, {
      key: "setPrevious",
      value: function setPrevious() {
        this.setIndex(this._index - 1);
      }
    }, {
      key: "setNext",
      value: function setNext() {
        this.setIndex(this._index + 1);
      }
    }, {
      key: "getWrapper",
      value: function getWrapper(index) {
        return this._wrapper.children[index];
      }
    }, {
      key: "getElement",
      value: function getElement(index) {
        var e = this._wrapper.children[index];
        return e ? e.children[0] : null;
      }
    }, {
      key: "reload",
      value: function reload() {
        this._reloadVisibleElements = true;
        this.update();
      }
    }, {
      key: "items",
      get: function get$$1() {
        return this.itemList.get();
      },
      set: function set(children) {
        this.itemList.patch(children);
      }
    }, {
      key: "element",
      get: function get$$1() {
        var e = this._wrapper.children[this.realIndex];
        return e ? e.children[0] : null;
      }
    }, {
      key: "length",
      get: function get$$1() {
        return this._wrapper.children.length;
      }
    }, {
      key: "property",
      get: function get$$1() {
        return this._horizontal ? 'x' : 'y';
      }
    }, {
      key: "viewportSize",
      get: function get$$1() {
        return this._horizontal ? this.w : this.h;
      }
    }, {
      key: "index",
      get: function get$$1() {
        return this._index;
      }
    }, {
      key: "realIndex",
      get: function get$$1() {
        return Utils.getModuloIndex(this._index, this.length);
      }
    }, {
      key: "itemSize",
      get: function get$$1() {
        return this._itemSize;
      },
      set: function set(v) {
        this._itemSize = v;
        this.update();
      }
    }, {
      key: "viewportScrollOffset",
      get: function get$$1() {
        return this._viewportScrollOffset;
      },
      set: function set(v) {
        this._viewportScrollOffset = v;
        this.update();
      }
    }, {
      key: "itemScrollOffset",
      get: function get$$1() {
        return this._itemScrollOffset;
      },
      set: function set(v) {
        this._itemScrollOffset = v;
        this.update();
      }
    }, {
      key: "scrollTransitionSettings",
      get: function get$$1() {
        return this._scrollTransitionSettings;
      },
      set: function set(v) {
        this._scrollTransitionSettings.patch(v);
      }
    }, {
      key: "scrollTransition",
      set: function set(v) {
        this._scrollTransitionSettings.patch(v);
      },
      get: function get$$1() {
        return this._scrollTransition;
      }
    }, {
      key: "progressAnimation",
      get: function get$$1() {
        return this._progressAnimation;
      },
      set: function set(v) {
        if (Utils.isObjectLiteral(v)) {
          this._progressAnimation = this.stage.animations.createSettings(v);
        } else {
          this._progressAnimation = v;
        }

        this.update();
      }
    }, {
      key: "roll",
      get: function get$$1() {
        return this._roll;
      },
      set: function set(v) {
        this._roll = v;
        this.update();
      }
    }, {
      key: "rollMin",
      get: function get$$1() {
        return this._rollMin;
      },
      set: function set(v) {
        this._rollMin = v;
        this.update();
      }
    }, {
      key: "rollMax",
      get: function get$$1() {
        return this._rollMax;
      },
      set: function set(v) {
        this._rollMax = v;
        this.update();
      }
    }, {
      key: "invertDirection",
      get: function get$$1() {
        return this._invertDirection;
      },
      set: function set(v) {
        if (!this._started) {
          this._invertDirection = v;
        }
      }
    }, {
      key: "horizontal",
      get: function get$$1() {
        return this._horizontal;
      },
      set: function set(v) {
        if (v !== this._horizontal) {
          if (!this._started) {
            this._horizontal = v;
          }
        }
      }
    }]);

    return ListComponent;
  }(Component);

  var ListItems =
  /*#__PURE__*/
  function (_ObjectListWrapper) {
    _inherits(ListItems, _ObjectListWrapper);

    function ListItems(list) {
      var _this4 = this;

      var _this3;

      _classCallCheck(this, ListItems);

      var wrap = function wrap(item) {
        _newArrowCheck(this, _this4);

        var parent = item.stage.createElement();
        parent.add(item);
        parent.visible = false;
        return parent;
      }.bind(this);

      _this3 = _possibleConstructorReturn(this, _getPrototypeOf(ListItems).call(this, list._wrapper._children, wrap));
      _this3.list = list;
      return _this3;
    }

    _createClass(ListItems, [{
      key: "onAdd",
      value: function onAdd(item, index) {
        _get(_getPrototypeOf(ListItems.prototype), "onAdd", this).call(this, item, index);

        this.checkStarted(index);
      }
    }, {
      key: "checkStarted",
      value: function checkStarted(index) {
        this.list._reloadVisibleElements = true;

        if (!this.list._started) {
          this.list.start();
        } else {
          if (this.list.length === 1) {
            this.list.setIndex(0, true, true);
          } else {
            if (this.list._index >= this.list.length) {
              this.list.setIndex(0);
            }
          }

          this.list.update();
        }
      }
    }, {
      key: "onRemove",
      value: function onRemove(item, index) {
        _get(_getPrototypeOf(ListItems.prototype), "onRemove", this).call(this, item, index);

        var ri = this.list.realIndex;

        if (ri === index) {
          if (ri === this.list.length) {
            ri--;
          }

          if (ri >= 0) {
            this.list.setIndex(ri);
          }
        } else if (ri > index) {
          this.list.setIndex(ri - 1);
        }

        this.list._reloadVisibleElements = true;
      }
    }, {
      key: "onSet",
      value: function onSet(item, index) {
        _get(_getPrototypeOf(ListItems.prototype), "onSet", this).call(this, item, index);

        this.checkStarted(index);
      }
    }, {
      key: "onSync",
      value: function onSync(removed, added, order) {
        _get(_getPrototypeOf(ListItems.prototype), "onSync", this).call(this, removed, added, order);

        this.checkStarted(0);
      }
    }, {
      key: "_signalProxy",
      get: function get$$1() {
        return true;
      }
    }]);

    return ListItems;
  }(ObjectListWrapper);

  var LinearBlurShader =
  /*#__PURE__*/
  function (_DefaultShader) {
    _inherits(LinearBlurShader, _DefaultShader);

    function LinearBlurShader(context) {
      var _this;

      _classCallCheck(this, LinearBlurShader);

      _this = _possibleConstructorReturn(this, _getPrototypeOf(LinearBlurShader).call(this, context));
      _this._direction = new Float32Array([1, 0]);
      _this._kernelRadius = 1;
      return _this;
    }

    _createClass(LinearBlurShader, [{
      key: "useDefault",
      value: function useDefault() {
        return this._kernelRadius === 0;
      }
    }, {
      key: "setupUniforms",
      value: function setupUniforms(operation) {
        _get(_getPrototypeOf(LinearBlurShader.prototype), "setupUniforms", this).call(this, operation);

        this._setUniform("direction", this._direction, this.gl.uniform2fv);

        this._setUniform("kernelRadius", this._kernelRadius, this.gl.uniform1i);

        var w = operation.getRenderWidth();
        var h = operation.getRenderHeight();

        this._setUniform("resolution", new Float32Array([w, h]), this.gl.uniform2fv);
      }
    }, {
      key: "x",
      get: function get$$1() {
        return this._direction[0];
      },
      set: function set(v) {
        this._direction[0] = v;
        this.redraw();
      }
    }, {
      key: "y",
      get: function get$$1() {
        return this._direction[1];
      },
      set: function set(v) {
        this._direction[1] = v;
        this.redraw();
      }
    }, {
      key: "kernelRadius",
      get: function get$$1() {
        return this._kernelRadius;
      },
      set: function set(v) {
        this._kernelRadius = v;
        this.redraw();
      }
    }]);

    return LinearBlurShader;
  }(DefaultShader);
  LinearBlurShader.fragmentShaderSource = `
    #ifdef GL_ES
    precision lowp float;
    #endif
    uniform vec2 resolution;
    varying vec2 vTextureCoord;
    varying vec4 vColor;
    uniform sampler2D uSampler;
    uniform vec2 direction;
    uniform int kernelRadius;
    
    vec4 blur1(sampler2D image, vec2 uv, vec2 resolution, vec2 direction) {
        vec4 color = vec4(0.0);
        vec2 off1 = vec2(1.3333333333333333) * direction;
        color += texture2D(image, uv) * 0.29411764705882354;
        color += texture2D(image, uv + (off1 / resolution)) * 0.35294117647058826;
        color += texture2D(image, uv - (off1 / resolution)) * 0.35294117647058826;
        return color; 
    }
    
    vec4 blur2(sampler2D image, vec2 uv, vec2 resolution, vec2 direction) {
        vec4 color = vec4(0.0);
        vec2 off1 = vec2(1.3846153846) * direction;
        vec2 off2 = vec2(3.2307692308) * direction;
        color += texture2D(image, uv) * 0.2270270270;
        color += texture2D(image, uv + (off1 / resolution)) * 0.3162162162;
        color += texture2D(image, uv - (off1 / resolution)) * 0.3162162162;
        color += texture2D(image, uv + (off2 / resolution)) * 0.0702702703;
        color += texture2D(image, uv - (off2 / resolution)) * 0.0702702703;
        return color;
    }
    
    vec4 blur3(sampler2D image, vec2 uv, vec2 resolution, vec2 direction) {
        vec4 color = vec4(0.0);
        vec2 off1 = vec2(1.411764705882353) * direction;
        vec2 off2 = vec2(3.2941176470588234) * direction;
        vec2 off3 = vec2(5.176470588235294) * direction;
        color += texture2D(image, uv) * 0.1964825501511404;
        color += texture2D(image, uv + (off1 / resolution)) * 0.2969069646728344;
        color += texture2D(image, uv - (off1 / resolution)) * 0.2969069646728344;
        color += texture2D(image, uv + (off2 / resolution)) * 0.09447039785044732;
        color += texture2D(image, uv - (off2 / resolution)) * 0.09447039785044732;
        color += texture2D(image, uv + (off3 / resolution)) * 0.010381362401148057;
        color += texture2D(image, uv - (off3 / resolution)) * 0.010381362401148057;
        return color;
    }    

    void main(void){
        if (kernelRadius == 1) {
            gl_FragColor = blur1(uSampler, vTextureCoord, resolution, direction) * vColor;
        } else if (kernelRadius == 2) {
            gl_FragColor = blur2(uSampler, vTextureCoord, resolution, direction) * vColor;
        } else {
            gl_FragColor = blur3(uSampler, vTextureCoord, resolution, direction) * vColor;
        }
    }
`;

  /**
   * 4x4 box blur shader which works in conjunction with a 50% rescale.
   */

  var BoxBlurShader =
  /*#__PURE__*/
  function (_DefaultShader) {
    _inherits(BoxBlurShader, _DefaultShader);

    function BoxBlurShader() {
      _classCallCheck(this, BoxBlurShader);

      return _possibleConstructorReturn(this, _getPrototypeOf(BoxBlurShader).apply(this, arguments));
    }

    _createClass(BoxBlurShader, [{
      key: "setupUniforms",
      value: function setupUniforms(operation) {
        _get(_getPrototypeOf(BoxBlurShader.prototype), "setupUniforms", this).call(this, operation);

        var dx = 1.0 / operation.getTextureWidth(0);
        var dy = 1.0 / operation.getTextureHeight(0);

        this._setUniform("stepTextureCoord", new Float32Array([dx, dy]), this.gl.uniform2fv);
      }
    }]);

    return BoxBlurShader;
  }(DefaultShader);
  BoxBlurShader.vertexShaderSource = `
    #ifdef GL_ES
    precision lowp float;
    #endif
    uniform vec2 stepTextureCoord;
    attribute vec2 aVertexPosition;
    attribute vec2 aTextureCoord;
    attribute vec4 aColor;
    uniform vec2 projection;
    varying vec4 vColor;
    varying vec2 vTextureCoordUl;
    varying vec2 vTextureCoordUr;
    varying vec2 vTextureCoordBl;
    varying vec2 vTextureCoordBr;
    void main(void){
        gl_Position = vec4(aVertexPosition.x * projection.x - 1.0, aVertexPosition.y * -abs(projection.y) + 1.0, 0.0, 1.0);
        vTextureCoordUl = aTextureCoord - stepTextureCoord;
        vTextureCoordBr = aTextureCoord + stepTextureCoord;
        vTextureCoordUr = vec2(vTextureCoordBr.x, vTextureCoordUl.y);
        vTextureCoordBl = vec2(vTextureCoordUl.x, vTextureCoordBr.y);
        vColor = aColor;
        gl_Position.y = -sign(projection.y) * gl_Position.y;
    }
`;
  BoxBlurShader.fragmentShaderSource = `
    #ifdef GL_ES
    precision lowp float;
    #endif
    varying vec2 vTextureCoordUl;
    varying vec2 vTextureCoordUr;
    varying vec2 vTextureCoordBl;
    varying vec2 vTextureCoordBr;
    varying vec4 vColor;
    uniform sampler2D uSampler;
    void main(void){
        vec4 color = 0.25 * (texture2D(uSampler, vTextureCoordUl) + texture2D(uSampler, vTextureCoordUr) + texture2D(uSampler, vTextureCoordBl) + texture2D(uSampler, vTextureCoordBr));
        gl_FragColor = color * vColor;
    }
`;

  var BlurShader =
  /*#__PURE__*/
  function (_DefaultShader) {
    _inherits(BlurShader, _DefaultShader);

    function BlurShader(context) {
      var _this;

      _classCallCheck(this, BlurShader);

      _this = _possibleConstructorReturn(this, _getPrototypeOf(BlurShader).call(this, context));
      _this._kernelRadius = 1;
      return _this;
    }

    _createClass(BlurShader, [{
      key: "useDefault",
      value: function useDefault() {
        return this._amount === 0;
      }
    }, {
      key: "_beforeDrawEl",
      value: function _beforeDrawEl(_ref) {
        var target = _ref.target;
        target.ctx.filter = "blur(" + this._kernelRadius + "px)";
      }
    }, {
      key: "_afterDrawEl",
      value: function _afterDrawEl(_ref2) {
        var target = _ref2.target;
        target.ctx.filter = "none";
      }
    }, {
      key: "kernelRadius",
      get: function get() {
        return this._kernelRadius;
      },
      set: function set(v) {
        this._kernelRadius = v;
        this.redraw();
      }
    }]);

    return BlurShader;
  }(DefaultShader$1);

  var FastBlurComponent =
  /*#__PURE__*/
  function (_Component) {
    _inherits(FastBlurComponent, _Component);

    function FastBlurComponent() {
      _classCallCheck(this, FastBlurComponent);

      return _possibleConstructorReturn(this, _getPrototypeOf(FastBlurComponent).apply(this, arguments));
    }

    _createClass(FastBlurComponent, [{
      key: "_onResize",
      value: function _onResize() {
        this.wrap.w = this.renderWidth;
        this.wrap.h = this.renderHeight;
      }
    }, {
      key: "_build",
      value: function _build() {
        this.patch({
          Wrap: {
            type: this.stage.gl ? WebGLFastBlurComponent : C2dFastBlurComponent
          }
        });
      }
    }, {
      key: "wrap",
      get: function get$$1() {
        return this.tag("Wrap");
      }
    }, {
      key: "content",
      set: function set$$1(v) {
        return this.wrap.content = v;
      },
      get: function get$$1() {
        return this.wrap.content;
      }
    }, {
      key: "padding",
      set: function set$$1(v) {
        this.wrap._paddingX = v;
        this.wrap._paddingY = v;

        this.wrap._updateBlurSize();
      }
    }, {
      key: "paddingX",
      set: function set$$1(v) {
        this.wrap._paddingX = v;

        this.wrap._updateBlurSize();
      }
    }, {
      key: "paddingY",
      set: function set$$1(v) {
        this.wrap._paddingY = v;

        this.wrap._updateBlurSize();
      }
    }, {
      key: "amount",
      set: function set$$1(v) {
        return this.wrap.amount = v;
      },
      get: function get$$1() {
        return this.wrap.amount;
      }
    }, {
      key: "_signalProxy",
      get: function get$$1() {
        return true;
      }
    }], [{
      key: "_template",
      value: function _template() {
        return {};
      }
    }]);

    return FastBlurComponent;
  }(Component);

  var C2dFastBlurComponent =
  /*#__PURE__*/
  function (_Component2) {
    _inherits(C2dFastBlurComponent, _Component2);

    _createClass(C2dFastBlurComponent, null, [{
      key: "_template",
      value: function _template() {
        return {
          forceZIndexContext: true,
          rtt: true,
          Textwrap: {
            shader: {
              type: BlurShader
            },
            Content: {}
          }
        };
      }
    }]);

    function C2dFastBlurComponent(stage) {
      var _this;

      _classCallCheck(this, C2dFastBlurComponent);

      _this = _possibleConstructorReturn(this, _getPrototypeOf(C2dFastBlurComponent).call(this, stage));
      _this._textwrap = _this.sel("Textwrap");
      _this._wrapper = _this.sel("Textwrap>Content");
      _this._amount = 0;
      _this._paddingX = 0;
      _this._paddingY = 0;
      return _this;
    }

    _createClass(C2dFastBlurComponent, [{
      key: "_updateBlurSize",
      value: function _updateBlurSize() {
        var w = this.renderWidth;
        var h = this.renderHeight;
        var paddingX = this._paddingX;
        var paddingY = this._paddingY;
        this._wrapper.x = paddingX;
        this._textwrap.x = -paddingX;
        this._wrapper.y = paddingY;
        this._textwrap.y = -paddingY;
        this._textwrap.w = w + paddingX * 2;
        this._textwrap.h = h + paddingY * 2;
      }
    }, {
      key: "content",
      get: function get$$1() {
        return this.sel('Textwrap>Content');
      },
      set: function set$$1(v) {
        this.sel('Textwrap>Content').patch(v, true);
      }
    }, {
      key: "padding",
      set: function set$$1(v) {
        this._paddingX = v;
        this._paddingY = v;

        this._updateBlurSize();
      }
    }, {
      key: "paddingX",
      set: function set$$1(v) {
        this._paddingX = v;

        this._updateBlurSize();
      }
    }, {
      key: "paddingY",
      set: function set$$1(v) {
        this._paddingY = v;

        this._updateBlurSize();
      }
    }, {
      key: "amount",
      get: function get$$1() {
        return this._amount;
      }
      /**
       * Sets the amount of blur. A value between 0 and 4. Goes up exponentially for blur.
       * Best results for non-fractional values.
       * @param v;
       */
      ,
      set: function set$$1(v) {
        this._amount = v;
        this._textwrap.shader.kernelRadius = C2dFastBlurComponent._amountToKernelRadius(v);
      }
    }, {
      key: "_signalProxy",
      get: function get$$1() {
        return true;
      }
    }], [{
      key: "getSpline",
      value: function getSpline() {
        if (!this._multiSpline) {
          this._multiSpline = new MultiSpline();

          this._multiSpline.parse(false, {
            0: 0,
            0.25: 1.5,
            0.5: 5.5,
            0.75: 18,
            1: 39
          });
        }

        return this._multiSpline;
      }
    }, {
      key: "_amountToKernelRadius",
      value: function _amountToKernelRadius(v) {
        return C2dFastBlurComponent.getSpline().getValue(Math.min(1, v * 0.25));
      }
    }]);

    return C2dFastBlurComponent;
  }(Component);

  var WebGLFastBlurComponent =
  /*#__PURE__*/
  function (_Component3) {
    _inherits(WebGLFastBlurComponent, _Component3);

    _createClass(WebGLFastBlurComponent, [{
      key: "_signalProxy",
      get: function get$$1() {
        return true;
      }
    }], [{
      key: "_template",
      value: function _template() {
        var onUpdate = function onUpdate(element, elementCore) {
          if (elementCore._recalc & 2 + 128) {
            var w = elementCore.w;
            var h = elementCore.h;
            var cur = elementCore;

            do {
              cur = cur._children[0];
              cur._element.w = w;
              cur._element.h = h;
            } while (cur._children);
          }
        };

        return {
          Textwrap: {
            rtt: true,
            forceZIndexContext: true,
            renderOffscreen: true,
            Content: {}
          },
          Layers: {
            L0: {
              rtt: true,
              onUpdate: onUpdate,
              renderOffscreen: true,
              visible: false,
              Content: {
                shader: {
                  type: BoxBlurShader
                }
              }
            },
            L1: {
              rtt: true,
              onUpdate: onUpdate,
              renderOffscreen: true,
              visible: false,
              Content: {
                shader: {
                  type: BoxBlurShader
                }
              }
            },
            L2: {
              rtt: true,
              onUpdate: onUpdate,
              renderOffscreen: true,
              visible: false,
              Content: {
                shader: {
                  type: BoxBlurShader
                }
              }
            },
            L3: {
              rtt: true,
              onUpdate: onUpdate,
              renderOffscreen: true,
              visible: false,
              Content: {
                shader: {
                  type: BoxBlurShader
                }
              }
            }
          },
          Result: {
            shader: {
              type: FastBlurOutputShader
            },
            visible: false
          }
        };
      }
    }]);

    function WebGLFastBlurComponent(stage) {
      var _this2;

      _classCallCheck(this, WebGLFastBlurComponent);

      _this2 = _possibleConstructorReturn(this, _getPrototypeOf(WebGLFastBlurComponent).call(this, stage));
      _this2._textwrap = _this2.sel("Textwrap");
      _this2._wrapper = _this2.sel("Textwrap>Content");
      _this2._layers = _this2.sel("Layers");
      _this2._output = _this2.sel("Result");
      _this2._amount = 0;
      _this2._paddingX = 0;
      _this2._paddingY = 0;
      return _this2;
    }

    _createClass(WebGLFastBlurComponent, [{
      key: "_buildLayers",
      value: function _buildLayers() {
        var _this3 = this;

        var filterShaderSettings = [{
          x: 1,
          y: 0,
          kernelRadius: 1
        }, {
          x: 0,
          y: 1,
          kernelRadius: 1
        }, {
          x: 1.5,
          y: 0,
          kernelRadius: 1
        }, {
          x: 0,
          y: 1.5,
          kernelRadius: 1
        }];
        var filterShaders = filterShaderSettings.map(function (s) {
          _newArrowCheck(this, _this3);

          var shader = Shader.create(this.stage, Object.assign({
            type: LinearBlurShader
          }, s));
          return shader;
        }.bind(this));

        this._setLayerTexture(this.getLayerContents(0), this._textwrap.getTexture(), []);

        this._setLayerTexture(this.getLayerContents(1), this.getLayer(0).getTexture(), [filterShaders[0], filterShaders[1]]); // Notice that 1.5 filters should be applied before 1.0 filters.


        this._setLayerTexture(this.getLayerContents(2), this.getLayer(1).getTexture(), [filterShaders[0], filterShaders[1], filterShaders[2], filterShaders[3]]);

        this._setLayerTexture(this.getLayerContents(3), this.getLayer(2).getTexture(), [filterShaders[0], filterShaders[1], filterShaders[2], filterShaders[3]]);
      }
    }, {
      key: "_setLayerTexture",
      value: function _setLayerTexture(element, texture, steps) {
        if (!steps.length) {
          element.texture = texture;
        } else {
          var step = steps.pop();
          var child = element.stage.c({
            rtt: true,
            shader: step
          }); // Recurse.

          this._setLayerTexture(child, texture, steps);

          element.childList.add(child);
        }

        return element;
      }
    }, {
      key: "getLayer",
      value: function getLayer(i) {
        return this._layers.sel("L" + i);
      }
    }, {
      key: "getLayerContents",
      value: function getLayerContents(i) {
        return this.getLayer(i).sel("Content");
      }
    }, {
      key: "_onResize",
      value: function _onResize() {
        this._updateBlurSize();
      }
    }, {
      key: "_updateBlurSize",
      value: function _updateBlurSize() {
        var w = this.renderWidth;
        var h = this.renderHeight;
        var paddingX = this._paddingX;
        var paddingY = this._paddingY;
        var fw = w + paddingX * 2;
        var fh = h + paddingY * 2;
        this._textwrap.w = fw;
        this._wrapper.x = paddingX;
        this.getLayer(0).w = this.getLayerContents(0).w = fw / 2;
        this.getLayer(1).w = this.getLayerContents(1).w = fw / 4;
        this.getLayer(2).w = this.getLayerContents(2).w = fw / 8;
        this.getLayer(3).w = this.getLayerContents(3).w = fw / 16;
        this._output.x = -paddingX;
        this._textwrap.x = -paddingX;
        this._output.w = fw;
        this._textwrap.h = fh;
        this._wrapper.y = paddingY;
        this.getLayer(0).h = this.getLayerContents(0).h = fh / 2;
        this.getLayer(1).h = this.getLayerContents(1).h = fh / 4;
        this.getLayer(2).h = this.getLayerContents(2).h = fh / 8;
        this.getLayer(3).h = this.getLayerContents(3).h = fh / 16;
        this._output.y = -paddingY;
        this._textwrap.y = -paddingY;
        this._output.h = fh;
        this.w = w;
        this.h = h;
      }
      /**
       * Sets the amount of blur. A value between 0 and 4. Goes up exponentially for blur.
       * Best results for non-fractional values.
       * @param v;
       */

    }, {
      key: "_update",
      value: function _update() {
        var v = Math.min(4, Math.max(0, this._amount));

        if (v === 0) {
          this._textwrap.renderToTexture = false;
          this._output.shader.otherTextureSource = null;
          this._output.visible = false;
        } else {
          this._textwrap.renderToTexture = true;
          this._output.visible = true;
          this.getLayer(0).visible = v > 0;
          this.getLayer(1).visible = v > 1;
          this.getLayer(2).visible = v > 2;
          this.getLayer(3).visible = v > 3;

          if (v <= 1) {
            this._output.texture = this._textwrap.getTexture();
            this._output.shader.otherTextureSource = this.getLayer(0).getTexture();
            this._output.shader.a = v;
          } else if (v <= 2) {
            this._output.texture = this.getLayer(0).getTexture();
            this._output.shader.otherTextureSource = this.getLayer(1).getTexture();
            this._output.shader.a = v - 1;
          } else if (v <= 3) {
            this._output.texture = this.getLayer(1).getTexture();
            this._output.shader.otherTextureSource = this.getLayer(2).getTexture();
            this._output.shader.a = v - 2;
          } else if (v <= 4) {
            this._output.texture = this.getLayer(2).getTexture();
            this._output.shader.otherTextureSource = this.getLayer(3).getTexture();
            this._output.shader.a = v - 3;
          }
        }
      }
    }, {
      key: "_firstActive",
      value: function _firstActive() {
        this._buildLayers();
      }
    }, {
      key: "content",
      get: function get$$1() {
        return this.sel('Textwrap>Content');
      },
      set: function set$$1(v) {
        this.sel('Textwrap>Content').patch(v, true);
      }
    }, {
      key: "padding",
      set: function set$$1(v) {
        this._paddingX = v;
        this._paddingY = v;

        this._updateBlurSize();
      }
    }, {
      key: "paddingX",
      set: function set$$1(v) {
        this._paddingX = v;

        this._updateBlurSize();
      }
    }, {
      key: "paddingY",
      set: function set$$1(v) {
        this._paddingY = v;

        this._updateBlurSize();
      }
    }, {
      key: "amount",
      set: function set$$1(v) {
        this._amount = v;

        this._update();
      },
      get: function get$$1() {
        return this._amount;
      }
    }, {
      key: "shader",
      set: function set$$1(s) {
        _set(_getPrototypeOf(WebGLFastBlurComponent.prototype), "shader", s, this, true);

        if (!this.renderToTexture) {
          console.warn("Please enable renderToTexture to use with a shader.");
        }
      }
    }]);

    return WebGLFastBlurComponent;
  }(Component);
  /**
   * Shader that combines two textures into one output.
   */


  var FastBlurOutputShader =
  /*#__PURE__*/
  function (_DefaultShader) {
    _inherits(FastBlurOutputShader, _DefaultShader);

    function FastBlurOutputShader(ctx) {
      var _this4;

      _classCallCheck(this, FastBlurOutputShader);

      _this4 = _possibleConstructorReturn(this, _getPrototypeOf(FastBlurOutputShader).call(this, ctx));
      _this4._a = 0;
      _this4._otherTextureSource = null;
      return _this4;
    }

    _createClass(FastBlurOutputShader, [{
      key: "setupUniforms",
      value: function setupUniforms(operation) {
        _get(_getPrototypeOf(FastBlurOutputShader.prototype), "setupUniforms", this).call(this, operation);

        this._setUniform("a", this._a, this.gl.uniform1f);

        this._setUniform("uSampler2", 1, this.gl.uniform1i);
      }
    }, {
      key: "beforeDraw",
      value: function beforeDraw(operation) {
        var glTexture = this._otherTextureSource ? this._otherTextureSource.nativeTexture : null;
        var gl = this.gl;
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, glTexture);
        gl.activeTexture(gl.TEXTURE0);
      }
    }, {
      key: "a",
      get: function get$$1() {
        return this._a;
      },
      set: function set$$1(v) {
        this._a = v;
        this.redraw();
      }
    }, {
      key: "otherTextureSource",
      set: function set$$1(v) {
        this._otherTextureSource = v;
        this.redraw();
      }
    }]);

    return FastBlurOutputShader;
  }(DefaultShader);

  FastBlurOutputShader.fragmentShaderSource = `
    #ifdef GL_ES
    precision lowp float;
    #endif
    varying vec2 vTextureCoord;
    varying vec4 vColor;
    uniform sampler2D uSampler;
    uniform sampler2D uSampler2;
    uniform float a;
    void main(void){
        if (a == 1.0) {
            gl_FragColor = texture2D(uSampler2, vTextureCoord) * vColor;
        } else {
            gl_FragColor = ((1.0 - a) * texture2D(uSampler, vTextureCoord) + (a * texture2D(uSampler2, vTextureCoord))) * vColor;
        }
    }
`;

  var BloomComponent =
  /*#__PURE__*/
  function (_Component) {
    _inherits(BloomComponent, _Component);

    _createClass(BloomComponent, [{
      key: "_signalProxy",
      get: function get() {
        return true;
      }
    }], [{
      key: "_template",
      value: function _template() {
        var onUpdate = function onUpdate(element, elementCore) {
          if (elementCore._recalc & 2 + 128) {
            var w = elementCore.w;
            var h = elementCore.h;
            var cur = elementCore;

            do {
              cur = cur._children[0];
              cur._element.w = w;
              cur._element.h = h;
            } while (cur._children);
          }
        };

        return {
          Textwrap: {
            rtt: true,
            forceZIndexContext: true,
            renderOffscreen: true,
            BloomBase: {
              shader: {
                type: BloomBaseShader
              },
              Content: {}
            }
          },
          Layers: {
            L0: {
              rtt: true,
              onUpdate: onUpdate,
              scale: 2,
              pivot: 0,
              visible: false,
              Content: {
                shader: {
                  type: BoxBlurShader
                }
              }
            },
            L1: {
              rtt: true,
              onUpdate: onUpdate,
              scale: 4,
              pivot: 0,
              visible: false,
              Content: {
                shader: {
                  type: BoxBlurShader
                }
              }
            },
            L2: {
              rtt: true,
              onUpdate: onUpdate,
              scale: 8,
              pivot: 0,
              visible: false,
              Content: {
                shader: {
                  type: BoxBlurShader
                }
              }
            },
            L3: {
              rtt: true,
              onUpdate: onUpdate,
              scale: 16,
              pivot: 0,
              visible: false,
              Content: {
                shader: {
                  type: BoxBlurShader
                }
              }
            }
          }
        };
      }
    }]);

    function BloomComponent(stage) {
      var _this;

      _classCallCheck(this, BloomComponent);

      _this = _possibleConstructorReturn(this, _getPrototypeOf(BloomComponent).call(this, stage));
      _this._textwrap = _this.sel("Textwrap");
      _this._wrapper = _this.sel("Textwrap.Content");
      _this._layers = _this.sel("Layers");
      _this._amount = 0;
      _this._paddingX = 0;
      _this._paddingY = 0;
      return _this;
    }

    _createClass(BloomComponent, [{
      key: "_build",
      value: function _build() {
        var _this2 = this;

        var filterShaderSettings = [{
          x: 1,
          y: 0,
          kernelRadius: 3
        }, {
          x: 0,
          y: 1,
          kernelRadius: 3
        }, {
          x: 1.5,
          y: 0,
          kernelRadius: 3
        }, {
          x: 0,
          y: 1.5,
          kernelRadius: 3
        }];
        var filterShaders = filterShaderSettings.map(function (s) {
          _newArrowCheck(this, _this2);

          var shader = this.stage.createShader(Object.assign({
            type: LinearBlurShader
          }, s));
          return shader;
        }.bind(this));

        this._setLayerTexture(this.getLayerContents(0), this._textwrap.getTexture(), []);

        this._setLayerTexture(this.getLayerContents(1), this.getLayer(0).getTexture(), [filterShaders[0], filterShaders[1]]); // Notice that 1.5 filters should be applied before 1.0 filters.


        this._setLayerTexture(this.getLayerContents(2), this.getLayer(1).getTexture(), [filterShaders[0], filterShaders[1], filterShaders[2], filterShaders[3]]);

        this._setLayerTexture(this.getLayerContents(3), this.getLayer(2).getTexture(), [filterShaders[0], filterShaders[1], filterShaders[2], filterShaders[3]]);
      }
    }, {
      key: "_setLayerTexture",
      value: function _setLayerTexture(element, texture, steps) {
        if (!steps.length) {
          element.texture = texture;
        } else {
          var step = steps.pop();
          var child = element.stage.c({
            rtt: true,
            shader: step
          }); // Recurse.

          this._setLayerTexture(child, texture, steps);

          element.childList.add(child);
        }

        return element;
      }
    }, {
      key: "getLayer",
      value: function getLayer(i) {
        return this._layers.sel("L" + i);
      }
    }, {
      key: "getLayerContents",
      value: function getLayerContents(i) {
        return this.getLayer(i).sel("Content");
      }
    }, {
      key: "_onResize",
      value: function _onResize() {
        this._updateBlurSize();
      }
    }, {
      key: "_updateBlurSize",
      value: function _updateBlurSize() {
        var w = this.renderWidth;
        var h = this.renderHeight;
        var paddingX = this._paddingX;
        var paddingY = this._paddingY;
        var fw = w + paddingX * 2;
        var fh = h + paddingY * 2;
        this._textwrap.w = fw;
        this._wrapper.x = paddingX;
        this.getLayer(0).w = this.getLayerContents(0).w = fw / 2;
        this.getLayer(1).w = this.getLayerContents(1).w = fw / 4;
        this.getLayer(2).w = this.getLayerContents(2).w = fw / 8;
        this.getLayer(3).w = this.getLayerContents(3).w = fw / 16;
        this._textwrap.x = -paddingX;
        this._textwrap.h = fh;
        this._wrapper.y = paddingY;
        this.getLayer(0).h = this.getLayerContents(0).h = fh / 2;
        this.getLayer(1).h = this.getLayerContents(1).h = fh / 4;
        this.getLayer(2).h = this.getLayerContents(2).h = fh / 8;
        this.getLayer(3).h = this.getLayerContents(3).h = fh / 16;
        this._textwrap.y = -paddingY;
        this.w = w;
        this.h = h;
      }
      /**
       * Sets the amount of blur. A value between 0 and 4. Goes up exponentially for blur.
       * Best results for non-fractional values.
       * @param v;
       */

    }, {
      key: "_update",
      value: function _update() {
        var v = Math.min(4, Math.max(0, this._amount));

        if (v > 0) {
          this.getLayer(0).visible = v > 0;
          this.getLayer(1).visible = v > 1;
          this.getLayer(2).visible = v > 2;
          this.getLayer(3).visible = v > 3;
        }
      }
    }, {
      key: "_firstActive",
      value: function _firstActive() {
        this._build();
      }
    }, {
      key: "content",
      get: function get() {
        return this.sel('Textwrap.Content');
      },
      set: function set$$1(v) {
        this.sel('Textwrap.Content').patch(v);
      }
    }, {
      key: "padding",
      set: function set$$1(v) {
        this._paddingX = v;
        this._paddingY = v;

        this._updateBlurSize();
      }
    }, {
      key: "paddingX",
      set: function set$$1(v) {
        this._paddingX = v;

        this._updateBlurSize();
      }
    }, {
      key: "paddingY",
      set: function set$$1(v) {
        this._paddingY = v;

        this._updateBlurSize();
      }
    }, {
      key: "amount",
      set: function set$$1(v) {
        this._amount = v;

        this._update();
      },
      get: function get() {
        return this._amount;
      }
    }, {
      key: "shader",
      set: function set$$1(s) {
        _set(_getPrototypeOf(BloomComponent.prototype), "shader", s, this, true);

        if (!this.renderToTexture) {
          console.warn("Please enable renderToTexture to use with a shader.");
        }
      }
    }]);

    return BloomComponent;
  }(Component);

  var BloomBaseShader =
  /*#__PURE__*/
  function (_DefaultShader) {
    _inherits(BloomBaseShader, _DefaultShader);

    function BloomBaseShader() {
      _classCallCheck(this, BloomBaseShader);

      return _possibleConstructorReturn(this, _getPrototypeOf(BloomBaseShader).apply(this, arguments));
    }

    return BloomBaseShader;
  }(DefaultShader);

  BloomBaseShader.fragmentShaderSource = `
    #ifdef GL_ES
    precision lowp float;
    #endif
    varying vec2 vTextureCoord;
    varying vec4 vColor;
    uniform sampler2D uSampler;
    void main(void){
        vec4 color = texture2D(uSampler, vTextureCoord) * vColor;
        float m = max(max(color.r, color.g), color.b);
        float c = max(0.0, (m - 0.80)) * 5.0;
        color = color * c;
        gl_FragColor = color;
    }
`;

  var SmoothScaleComponent =
  /*#__PURE__*/
  function (_Component) {
    _inherits(SmoothScaleComponent, _Component);

    _createClass(SmoothScaleComponent, null, [{
      key: "_template",
      value: function _template() {
        return {
          ContentWrap: {
            renderOffscreen: true,
            forceZIndexContext: true,
            onAfterUpdate: SmoothScaleComponent._updateDimensions,
            Content: {}
          },
          Scale: {
            visible: false
          }
        };
      }
    }]);

    function SmoothScaleComponent(stage) {
      var _this;

      _classCallCheck(this, SmoothScaleComponent);

      _this = _possibleConstructorReturn(this, _getPrototypeOf(SmoothScaleComponent).call(this, stage));
      _this._smoothScale = 1;
      _this._iterations = 0;
      return _this;
    }

    _createClass(SmoothScaleComponent, [{
      key: "_setIterations",
      value: function _setIterations(its) {
        if (this._iterations !== its) {
          var scalers = this.sel("Scale").childList;
          var content = this.sel("ContentWrap");

          while (scalers.length < its) {
            var first = scalers.length === 0;
            var texture = first ? content.getTexture() : scalers.last.getTexture();
            scalers.a({
              rtt: true,
              renderOffscreen: true,
              texture: texture
            });
          }

          SmoothScaleComponent._updateDimensions(this.tag("ContentWrap"), true);

          var useScalers = its > 0;
          this.patch({
            ContentWrap: {
              renderToTexture: useScalers
            },
            Scale: {
              visible: useScalers
            }
          });

          for (var i = 0, n = scalers.length; i < n; i++) {
            scalers.getAt(i).patch({
              visible: i < its,
              renderOffscreen: i !== its - 1
            });
          }

          this._iterations = its;
        }
      }
    }, {
      key: "content",
      get: function get() {
        return this.tag('Content');
      },
      set: function set(v) {
        this.tag('Content').patch(v, true);
      }
    }, {
      key: "smoothScale",
      get: function get() {
        return this._smoothScale;
      },
      set: function set(v) {
        if (this._smoothScale !== v) {
          var its = 0;

          while (v < 0.5 && its < 12) {
            its++;
            v = v * 2;
          }

          this.scale = v;

          this._setIterations(its);

          this._smoothScale = v;
        }
      }
    }, {
      key: "_signalProxy",
      get: function get() {
        return true;
      }
    }], [{
      key: "_updateDimensions",
      value: function _updateDimensions(contentWrap, force) {
        var content = contentWrap.children[0];
        var w = content.renderWidth;
        var h = content.renderHeight;

        if (w !== contentWrap.w || h !== contentWrap.h || force) {
          contentWrap.w = w;
          contentWrap.h = h;
          var scalers = contentWrap.parent.tag("Scale").children;

          for (var i = 0, n = scalers.length; i < n; i++) {
            w = w * 0.5;
            h = h * 0.5;
            scalers[i].w = w;
            scalers[i].h = h;
          }
        }
      }
    }]);

    return SmoothScaleComponent;
  }(Component);

  var BorderComponent =
  /*#__PURE__*/
  function (_Component) {
    _inherits(BorderComponent, _Component);

    _createClass(BorderComponent, [{
      key: "_signalProxy",
      get: function get() {
        return true;
      }
    }], [{
      key: "_template",
      value: function _template() {
        return {
          Content: {},
          Borders: {
            Top: {
              rect: true,
              visible: false,
              mountY: 1
            },
            Right: {
              rect: true,
              visible: false
            },
            Bottom: {
              rect: true,
              visible: false
            },
            Left: {
              rect: true,
              visible: false,
              mountX: 1
            }
          }
        };
      }
    }]);

    function BorderComponent(stage) {
      var _this;

      _classCallCheck(this, BorderComponent);

      _this = _possibleConstructorReturn(this, _getPrototypeOf(BorderComponent).call(this, stage));
      _this._borderTop = _this.tag("Top");
      _this._borderRight = _this.tag("Right");
      _this._borderBottom = _this.tag("Bottom");
      _this._borderLeft = _this.tag("Left");

      _this.onAfterUpdate = function (element) {
        var content = element.childList.first;
        var w = element.core.w || content.renderWidth;
        var h = element.core.h || content.renderHeight;
        element._borderTop.w = w;
        element._borderBottom.y = h;
        element._borderBottom.w = w;
        element._borderLeft.h = h + element._borderTop.h + element._borderBottom.h;
        element._borderLeft.y = -element._borderTop.h;
        element._borderRight.x = w;
        element._borderRight.h = h + element._borderTop.h + element._borderBottom.h;
        element._borderRight.y = -element._borderTop.h;
      };

      _this.borderWidth = 1;
      return _this;
    }

    _createClass(BorderComponent, [{
      key: "content",
      get: function get() {
        return this.sel('Content');
      },
      set: function set(v) {
        this.sel('Content').patch(v, true);
      }
    }, {
      key: "borderWidth",
      get: function get() {
        return this.borderWidthTop;
      },
      set: function set(v) {
        this.borderWidthTop = v;
        this.borderWidthRight = v;
        this.borderWidthBottom = v;
        this.borderWidthLeft = v;
      }
    }, {
      key: "borderWidthTop",
      get: function get() {
        return this._borderTop.h;
      },
      set: function set(v) {
        this._borderTop.h = v;
        this._borderTop.visible = v > 0;
      }
    }, {
      key: "borderWidthRight",
      get: function get() {
        return this._borderRight.w;
      },
      set: function set(v) {
        this._borderRight.w = v;
        this._borderRight.visible = v > 0;
      }
    }, {
      key: "borderWidthBottom",
      get: function get() {
        return this._borderBottom.h;
      },
      set: function set(v) {
        this._borderBottom.h = v;
        this._borderBottom.visible = v > 0;
      }
    }, {
      key: "borderWidthLeft",
      get: function get() {
        return this._borderLeft.w;
      },
      set: function set(v) {
        this._borderLeft.w = v;
        this._borderLeft.visible = v > 0;
      }
    }, {
      key: "colorBorder",
      get: function get() {
        return this.colorBorderTop;
      },
      set: function set(v) {
        this.colorBorderTop = v;
        this.colorBorderRight = v;
        this.colorBorderBottom = v;
        this.colorBorderLeft = v;
      }
    }, {
      key: "colorBorderTop",
      get: function get() {
        return this._borderTop.color;
      },
      set: function set(v) {
        this._borderTop.color = v;
      }
    }, {
      key: "colorBorderRight",
      get: function get() {
        return this._borderRight.color;
      },
      set: function set(v) {
        this._borderRight.color = v;
      }
    }, {
      key: "colorBorderBottom",
      get: function get() {
        return this._borderBottom.color;
      },
      set: function set(v) {
        this._borderBottom.color = v;
      }
    }, {
      key: "colorBorderLeft",
      get: function get() {
        return this._borderLeft.color;
      },
      set: function set(v) {
        this._borderLeft.color = v;
      }
    }, {
      key: "borderTop",
      get: function get() {
        return this._borderTop;
      },
      set: function set(settings) {
        this.borderTop.patch(settings);
      }
    }, {
      key: "borderRight",
      get: function get() {
        return this._borderRight;
      },
      set: function set(settings) {
        this.borderRight.patch(settings);
      }
    }, {
      key: "borderBottom",
      get: function get() {
        return this._borderBottom;
      },
      set: function set(settings) {
        this.borderBottom.patch(settings);
      }
    }, {
      key: "borderLeft",
      get: function get() {
        return this._borderLeft;
      },
      set: function set(settings) {
        this.borderLeft.patch(settings);
      }
    }, {
      key: "borders",
      set: function set(settings) {
        this.borderTop = settings;
        this.borderLeft = settings;
        this.borderBottom = settings;
        this.borderRight = settings;
      }
    }]);

    return BorderComponent;
  }(Component);

  var WebGLGrayscaleShader =
  /*#__PURE__*/
  function (_WebGLDefaultShader) {
    _inherits(WebGLGrayscaleShader, _WebGLDefaultShader);

    function WebGLGrayscaleShader(context) {
      var _this;

      _classCallCheck(this, WebGLGrayscaleShader);

      _this = _possibleConstructorReturn(this, _getPrototypeOf(WebGLGrayscaleShader).call(this, context));
      _this._amount = 1;
      return _this;
    }

    _createClass(WebGLGrayscaleShader, [{
      key: "useDefault",
      value: function useDefault() {
        return this._amount === 0;
      }
    }, {
      key: "setupUniforms",
      value: function setupUniforms(operation) {
        _get(_getPrototypeOf(WebGLGrayscaleShader.prototype), "setupUniforms", this).call(this, operation);

        this._setUniform("amount", this._amount, this.gl.uniform1f);
      }
    }, {
      key: "amount",
      set: function set(v) {
        this._amount = v;
        this.redraw();
      },
      get: function get$$1() {
        return this._amount;
      }
    }], [{
      key: "getC2d",
      value: function getC2d() {
        return C2dGrayscaleShader;
      }
    }]);

    return WebGLGrayscaleShader;
  }(DefaultShader);
  WebGLGrayscaleShader.fragmentShaderSource = `
    #ifdef GL_ES
    precision lowp float;
    #endif
    varying vec2 vTextureCoord;
    varying vec4 vColor;
    uniform sampler2D uSampler;
    uniform float amount;
    void main(void){
        vec4 color = texture2D(uSampler, vTextureCoord) * vColor;
        float grayness = 0.2 * color.r + 0.6 * color.g + 0.2 * color.b;
        gl_FragColor = vec4(amount * vec3(grayness, grayness, grayness) + (1.0 - amount) * color.rgb, color.a);
    }
`;
  var C2dGrayscaleShader =
  /*#__PURE__*/
  function (_C2dDefaultShader) {
    _inherits(C2dGrayscaleShader, _C2dDefaultShader);

    function C2dGrayscaleShader(context) {
      var _this2;

      _classCallCheck(this, C2dGrayscaleShader);

      _this2 = _possibleConstructorReturn(this, _getPrototypeOf(C2dGrayscaleShader).call(this, context));
      _this2._amount = 1;
      return _this2;
    }

    _createClass(C2dGrayscaleShader, [{
      key: "useDefault",
      value: function useDefault() {
        return this._amount === 0;
      }
    }, {
      key: "_beforeDrawEl",
      value: function _beforeDrawEl(_ref) {
        var target = _ref.target;
        target.ctx.filter = "grayscale(" + this._amount + ")";
      }
    }, {
      key: "_afterDrawEl",
      value: function _afterDrawEl(_ref2) {
        var target = _ref2.target;
        target.ctx.filter = "none";
      }
    }, {
      key: "amount",
      set: function set(v) {
        this._amount = v;
        this.redraw();
      },
      get: function get$$1() {
        return this._amount;
      }
    }], [{
      key: "getWebGL",
      value: function getWebGL() {
        return WebGLGrayscaleShader;
      }
    }]);

    return C2dGrayscaleShader;
  }(DefaultShader$1);

  /**
   * This shader can be used to fix a problem that is known as 'gradient banding'.
   */

  var DitheringShader =
  /*#__PURE__*/
  function (_DefaultShader) {
    _inherits(DitheringShader, _DefaultShader);

    function DitheringShader(ctx) {
      var _this;

      _classCallCheck(this, DitheringShader);

      _this = _possibleConstructorReturn(this, _getPrototypeOf(DitheringShader).call(this, ctx));
      _this._noiseTexture = new NoiseTexture(ctx.stage);
      _this._graining = 1 / 256;
      _this._random = false;
      return _this;
    }

    _createClass(DitheringShader, [{
      key: "setExtraAttribsInBuffer",
      value: function setExtraAttribsInBuffer(operation) {
        // Make sure that the noise texture is uploaded to the GPU.
        this._noiseTexture.load();

        var offset = operation.extraAttribsDataByteOffset / 4;
        var floats = operation.quads.floats;
        var length = operation.length;

        for (var i = 0; i < length; i++) {
          // Calculate noise texture coordinates so that it spans the full element.
          var brx = operation.getElementWidth(i) / this._noiseTexture.getRenderWidth();

          var bry = operation.getElementHeight(i) / this._noiseTexture.getRenderHeight();

          var ulx = 0;
          var uly = 0;

          if (this._random) {
            ulx = Math.random();
            uly = Math.random();
            brx += ulx;
            bry += uly;

            if (Math.random() < 0.5) {
              // Flip for more randomness.
              var t = ulx;
              ulx = brx;
              brx = t;
            }

            if (Math.random() < 0.5) {
              // Flip for more randomness.
              var _t = uly;
              uly = bry;
              bry = _t;
            }
          } // Specify all corner points.


          floats[offset] = ulx;
          floats[offset + 1] = uly;
          floats[offset + 2] = brx;
          floats[offset + 3] = uly;
          floats[offset + 4] = brx;
          floats[offset + 5] = bry;
          floats[offset + 6] = ulx;
          floats[offset + 7] = bry;
          offset += 8;
        }
      }
    }, {
      key: "beforeDraw",
      value: function beforeDraw(operation) {
        var gl = this.gl;
        gl.vertexAttribPointer(this._attrib("aNoiseTextureCoord"), 2, gl.FLOAT, false, 8, this.getVertexAttribPointerOffset(operation));
        var glTexture = this._noiseTexture.source.nativeTexture;
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, glTexture);
        gl.activeTexture(gl.TEXTURE0);
      }
    }, {
      key: "getExtraAttribBytesPerVertex",
      value: function getExtraAttribBytesPerVertex() {
        return 8;
      }
    }, {
      key: "setupUniforms",
      value: function setupUniforms(operation) {
        _get(_getPrototypeOf(DitheringShader.prototype), "setupUniforms", this).call(this, operation);

        this._setUniform("uNoiseSampler", 1, this.gl.uniform1i);

        this._setUniform("graining", 2 * this._graining, this.gl.uniform1f);
      }
    }, {
      key: "enableAttribs",
      value: function enableAttribs() {
        _get(_getPrototypeOf(DitheringShader.prototype), "enableAttribs", this).call(this);

        var gl = this.gl;
        gl.enableVertexAttribArray(this._attrib("aNoiseTextureCoord"));
      }
    }, {
      key: "disableAttribs",
      value: function disableAttribs() {
        _get(_getPrototypeOf(DitheringShader.prototype), "disableAttribs", this).call(this);

        var gl = this.gl;
        gl.disableVertexAttribArray(this._attrib("aNoiseTextureCoord"));
      }
    }, {
      key: "useDefault",
      value: function useDefault() {
        return this._graining === 0;
      }
    }, {
      key: "afterDraw",
      value: function afterDraw(operation) {
        if (this._random) {
          this.redraw();
        }
      }
    }, {
      key: "graining",
      set: function set(v) {
        this._graining = v;
        this.redraw();
      }
    }, {
      key: "random",
      set: function set(v) {
        this._random = v;
        this.redraw();
      }
    }]);

    return DitheringShader;
  }(DefaultShader);
  DitheringShader.vertexShaderSource = `
    #ifdef GL_ES
    precision lowp float;
    #endif
    attribute vec2 aVertexPosition;
    attribute vec2 aTextureCoord;
    attribute vec2 aNoiseTextureCoord;
    attribute vec4 aColor;
    uniform vec2 projection;
    varying vec2 vTextureCoord;
    varying vec2 vNoiseTextureCoord;
    varying vec4 vColor;
    void main(void){
        gl_Position = vec4(aVertexPosition.x * projection.x - 1.0, aVertexPosition.y * -abs(projection.y) + 1.0, 0.0, 1.0);
        vTextureCoord = aTextureCoord;
        vNoiseTextureCoord = aNoiseTextureCoord;
        vColor = aColor;
        gl_Position.y = -sign(projection.y) * gl_Position.y;
    }
`;
  DitheringShader.fragmentShaderSource = `
    #ifdef GL_ES
    precision lowp float;
    #endif
    varying vec2 vTextureCoord;
    varying vec2 vNoiseTextureCoord;
    varying vec4 vColor;
    uniform sampler2D uSampler;
    uniform sampler2D uNoiseSampler;
    uniform float graining;
    void main(void){
        vec4 noise = texture2D(uNoiseSampler, vNoiseTextureCoord);
        vec4 color = texture2D(uSampler, vTextureCoord);
        gl_FragColor = (color * vColor) + graining * (noise.r - 0.5);
    }
`;

  var CircularPushShader =
  /*#__PURE__*/
  function (_DefaultShader) {
    _inherits(CircularPushShader, _DefaultShader);

    function CircularPushShader(ctx) {
      var _this;

      _classCallCheck(this, CircularPushShader);

      _this = _possibleConstructorReturn(this, _getPrototypeOf(CircularPushShader).call(this, ctx));
      _this._inputValue = 0;
      _this._maxDerivative = 0.01;
      _this._normalizedValue = 0; // The offset between buckets. A value between 0 and 1.

      _this._offset = 0;
      _this._amount = 0.1;
      _this._aspectRatio = 1;
      _this._offsetX = 0;
      _this._offsetY = 0;
      _this.buckets = 100;
      return _this;
    }

    _createClass(CircularPushShader, [{
      key: "_getValues",
      value: function _getValues(n) {
        var v = [];

        for (var i = 0; i < n; i++) {
          v.push(this._inputValue);
        }

        return v;
      }
      /**
       * Progresses the shader with the specified (fractional) number of buckets.
       * @param {number} o;
       *   A number from 0 to 1 (1 = all buckets).
       */

    }, {
      key: "progress",
      value: function progress(o) {
        this._offset += o * this._buckets;
        var full = Math.floor(this._offset);
        this._offset -= full;

        this._shiftBuckets(full);

        this.redraw();
      }
    }, {
      key: "_shiftBuckets",
      value: function _shiftBuckets(n) {
        for (var i = this._buckets - 1; i >= 0; i--) {
          var targetIndex = i - n;

          if (targetIndex < 0) {
            this._normalizedValue = Math.min(this._normalizedValue + this._maxDerivative, Math.max(this._normalizedValue - this._maxDerivative, this._inputValue));
            this._values[i] = 255 * this._normalizedValue;
          } else {
            this._values[i] = this._values[targetIndex];
          }
        }
      }
    }, {
      key: "setupUniforms",
      value: function setupUniforms(operation) {
        _get(_getPrototypeOf(CircularPushShader.prototype), "setupUniforms", this).call(this, operation);

        this._setUniform("aspectRatio", this._aspectRatio, this.gl.uniform1f);

        this._setUniform("offsetX", this._offsetX, this.gl.uniform1f);

        this._setUniform("offsetY", this._offsetY, this.gl.uniform1f);

        this._setUniform("amount", this._amount, this.gl.uniform1f);

        this._setUniform("offset", this._offset, this.gl.uniform1f);

        this._setUniform("buckets", this._buckets, this.gl.uniform1f);

        this._setUniform("uValueSampler", 1, this.gl.uniform1i);
      }
    }, {
      key: "useDefault",
      value: function useDefault() {
        return this._amount === 0;
      }
    }, {
      key: "beforeDraw",
      value: function beforeDraw(operation) {
        var gl = this.gl;
        gl.activeTexture(gl.TEXTURE1);

        if (!this._valuesTexture) {
          this._valuesTexture = gl.createTexture();
          gl.bindTexture(gl.TEXTURE_2D, this._valuesTexture);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

          if (Utils.isNode) {
            gl.pixelStorei(gl.UNPACK_FLIP_BLUE_RED, false);
          }

          gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
        } else {
          gl.bindTexture(gl.TEXTURE_2D, this._valuesTexture);
        } // Upload new values.


        gl.texImage2D(gl.TEXTURE_2D, 0, gl.ALPHA, this._buckets, 1, 0, gl.ALPHA, gl.UNSIGNED_BYTE, this._values);
        gl.activeTexture(gl.TEXTURE0);
      }
    }, {
      key: "cleanup",
      value: function cleanup() {
        if (this._valuesTexture) {
          this.gl.deleteTexture(this._valuesTexture);
        }
      }
    }, {
      key: "aspectRatio",
      get: function get$$1() {
        return this._aspectRatio;
      },
      set: function set(v) {
        this._aspectRatio = v;
        this.redraw();
      }
    }, {
      key: "offsetX",
      get: function get$$1() {
        return this._offsetX;
      },
      set: function set(v) {
        this._offsetX = v;
        this.redraw();
      }
    }, {
      key: "offsetY",
      get: function get$$1() {
        return this._offsetY;
      },
      set: function set(v) {
        this._offsetY = v;
        this.redraw();
      }
    }, {
      key: "amount",
      set: function set(v) {
        this._amount = v;
        this.redraw();
      },
      get: function get$$1() {
        return this._amount;
      }
    }, {
      key: "inputValue",
      set: function set(v) {
        this._inputValue = v;
      },
      get: function get$$1() {
        return this._inputValue;
      }
    }, {
      key: "maxDerivative",
      set: function set(v) {
        this._maxDerivative = v;
      },
      get: function get$$1() {
        return this._maxDerivative;
      }
    }, {
      key: "buckets",
      set: function set(v) {
        if (v > 100) {
          console.warn("CircularPushShader: supports max 100 buckets");
          v = 100;
        } // This should be set before starting.


        this._buckets = v; // Init values array in the correct length.

        this._values = new Uint8Array(this._getValues(v));
        this.redraw();
      },
      get: function get$$1() {
        return this._buckets;
      }
    }, {
      key: "offset",
      set: function set(v) {
        this._offset = v;
        this.redraw();
      }
    }]);

    return CircularPushShader;
  }(DefaultShader);
  CircularPushShader.vertexShaderSource = `
    #ifdef GL_ES
    precision lowp float;
    #endif
    attribute vec2 aVertexPosition;
    attribute vec2 aTextureCoord;
    attribute vec4 aColor;
    uniform vec2 projection;
    uniform float offsetX;
    uniform float offsetY;
    uniform float aspectRatio;
    varying vec2 vTextureCoord;
    varying vec2 vPos;
    varying vec4 vColor;
    void main(void){
        gl_Position = vec4(aVertexPosition.x * projection.x - 1.0, aVertexPosition.y * -abs(projection.y) + 1.0, 0.0, 1.0);
        vTextureCoord = aTextureCoord;
        vPos = vTextureCoord * 2.0 - 1.0;
        vPos.y = vPos.y * aspectRatio;
        vPos.y = vPos.y + offsetY;
        vPos.x = vPos.x + offsetX;
        vColor = aColor;
        gl_Position.y = -sign(projection.y) * gl_Position.y;
    }
`;
  CircularPushShader.fragmentShaderSource = `
    #ifdef GL_ES
    precision lowp float;
    #endif
    varying vec2 vTextureCoord;
    varying vec4 vColor;
    varying vec2 vPos;
    uniform float amount;
    uniform float offset;
    uniform float values[100];
    uniform float buckets;
    uniform sampler2D uSampler;
    uniform sampler2D uValueSampler;
    void main(void){
        float l = length(vPos);
        float m = (l * buckets * 0.678 - offset) / buckets;
        float f = texture2D(uValueSampler, vec2(m, 0.0)).a * amount;
        vec2 unit = vPos / l;
        gl_FragColor = texture2D(uSampler, vTextureCoord - f * unit) * vColor;
    }
`;

  var InversionShader =
  /*#__PURE__*/
  function (_DefaultShader) {
    _inherits(InversionShader, _DefaultShader);

    function InversionShader(context) {
      var _this;

      _classCallCheck(this, InversionShader);

      _this = _possibleConstructorReturn(this, _getPrototypeOf(InversionShader).call(this, context));
      _this._amount = 1;
      return _this;
    }

    _createClass(InversionShader, [{
      key: "useDefault",
      value: function useDefault() {
        return this._amount === 0;
      }
    }, {
      key: "setupUniforms",
      value: function setupUniforms(operation) {
        _get(_getPrototypeOf(InversionShader.prototype), "setupUniforms", this).call(this, operation);

        this._setUniform("amount", this._amount, this.gl.uniform1f);
      }
    }, {
      key: "amount",
      set: function set(v) {
        this._amount = v;
        this.redraw();
      },
      get: function get$$1() {
        return this._amount;
      }
    }]);

    return InversionShader;
  }(DefaultShader);
  InversionShader.fragmentShaderSource = `
    #ifdef GL_ES
    precision lowp float;
    #endif
    varying vec2 vTextureCoord;
    varying vec4 vColor;
    uniform sampler2D uSampler;
    uniform float amount;
    void main(void){
        vec4 color = texture2D(uSampler, vTextureCoord);
        color.rgb = color.rgb * (1.0 - amount) + amount * (1.0 * color.a - color.rgb); 
        gl_FragColor = color * vColor;
    }
`;

  var OutlineShader =
  /*#__PURE__*/
  function (_DefaultShader) {
    _inherits(OutlineShader, _DefaultShader);

    function OutlineShader(ctx) {
      var _this;

      _classCallCheck(this, OutlineShader);

      _this = _possibleConstructorReturn(this, _getPrototypeOf(OutlineShader).call(this, ctx));
      _this._width = 5;
      _this._col = 0xFFFFFFFF;
      _this._color = [1, 1, 1, 1];
      return _this;
    }

    _createClass(OutlineShader, [{
      key: "useDefault",
      value: function useDefault() {
        return this._width === 0 || this._col[3] === 0;
      }
    }, {
      key: "setupUniforms",
      value: function setupUniforms(operation) {
        _get(_getPrototypeOf(OutlineShader.prototype), "setupUniforms", this).call(this, operation);

        var gl = this.gl;

        this._setUniform("color", new Float32Array(this._color), gl.uniform4fv);
      }
    }, {
      key: "enableAttribs",
      value: function enableAttribs() {
        _get(_getPrototypeOf(OutlineShader.prototype), "enableAttribs", this).call(this);

        this.gl.enableVertexAttribArray(this._attrib("aCorner"));
      }
    }, {
      key: "disableAttribs",
      value: function disableAttribs() {
        _get(_getPrototypeOf(OutlineShader.prototype), "disableAttribs", this).call(this);

        this.gl.disableVertexAttribArray(this._attrib("aCorner"));
      }
    }, {
      key: "setExtraAttribsInBuffer",
      value: function setExtraAttribsInBuffer(operation) {
        var offset = operation.extraAttribsDataByteOffset / 4;
        var floats = operation.quads.floats;
        var length = operation.length;

        for (var i = 0; i < length; i++) {
          var elementCore = operation.getElementCore(i); // We are setting attributes such that if the value is < 0 or > 1, a border should be drawn.

          var ddw = this._width / elementCore.w;
          var dw = ddw / (1 - 2 * ddw);
          var ddh = this._width / elementCore.h;
          var dh = ddh / (1 - 2 * ddh); // Specify all corner points.

          floats[offset] = -dw;
          floats[offset + 1] = -dh;
          floats[offset + 2] = 1 + dw;
          floats[offset + 3] = -dh;
          floats[offset + 4] = 1 + dw;
          floats[offset + 5] = 1 + dh;
          floats[offset + 6] = -dw;
          floats[offset + 7] = 1 + dh;
          offset += 8;
        }
      }
    }, {
      key: "beforeDraw",
      value: function beforeDraw(operation) {
        var gl = this.gl;
        gl.vertexAttribPointer(this._attrib("aCorner"), 2, gl.FLOAT, false, 8, this.getVertexAttribPointerOffset(operation));
      }
    }, {
      key: "getExtraAttribBytesPerVertex",
      value: function getExtraAttribBytesPerVertex() {
        return 8;
      }
    }, {
      key: "width",
      set: function set(v) {
        this._width = v;
        this.redraw();
      }
    }, {
      key: "color",
      get: function get$$1() {
        return this._col;
      },
      set: function set(v) {
        if (this._col !== v) {
          var col = StageUtils.getRgbaComponentsNormalized(v);
          col[0] = col[0] * col[3];
          col[1] = col[1] * col[3];
          col[2] = col[2] * col[3];
          this._color = col;
          this.redraw();
          this._col = v;
        }
      }
    }]);

    return OutlineShader;
  }(DefaultShader);
  OutlineShader.vertexShaderSource = `
    #ifdef GL_ES
    precision lowp float;
    #endif
    attribute vec2 aVertexPosition;
    attribute vec2 aTextureCoord;
    attribute vec4 aColor;
    attribute vec2 aCorner;
    uniform vec2 projection;
    varying vec2 vTextureCoord;
    varying vec2 vCorner;
    varying vec4 vColor;
    void main(void){
        gl_Position = vec4(aVertexPosition.x * projection.x - 1.0, aVertexPosition.y * -abs(projection.y) + 1.0, 0.0, 1.0);
        vTextureCoord = aTextureCoord;
        vCorner = aCorner;
        vColor = aColor;
        gl_Position.y = -sign(projection.y) * gl_Position.y;
    }
`;
  OutlineShader.fragmentShaderSource = `
    #ifdef GL_ES
    precision lowp float;
    #endif
    varying vec2 vTextureCoord;
    varying vec4 vColor;
    varying vec2 vCorner;
    uniform vec4 color;
    uniform sampler2D uSampler;
    void main(void){
        vec2 m = min(vCorner, 1.0 - vCorner);
        float value = step(0.0, min(m.x, m.y));
        gl_FragColor = mix(color, texture2D(uSampler, vTextureCoord) * vColor, value);
    }
`;

  /**
   * @see https://github.com/pixijs/pixi-filters/tree/master/filters/pixelate/src
   */

  var PixelateShader =
  /*#__PURE__*/
  function (_DefaultShader) {
    _inherits(PixelateShader, _DefaultShader);

    function PixelateShader(ctx) {
      var _this;

      _classCallCheck(this, PixelateShader);

      _this = _possibleConstructorReturn(this, _getPrototypeOf(PixelateShader).call(this, ctx));
      _this._size = new Float32Array([4, 4]);
      return _this;
    }

    _createClass(PixelateShader, [{
      key: "useDefault",
      value: function useDefault() {
        return this._size[0] === 0 && this._size[1] === 0;
      }
    }, {
      key: "setupUniforms",
      value: function setupUniforms(operation) {
        _get(_getPrototypeOf(PixelateShader.prototype), "setupUniforms", this).call(this, operation);

        var gl = this.gl;

        this._setUniform("size", new Float32Array(this._size), gl.uniform2fv);
      }
    }, {
      key: "getExtraAttribBytesPerVertex",
      value: function getExtraAttribBytesPerVertex() {
        return 8;
      }
    }, {
      key: "enableAttribs",
      value: function enableAttribs() {
        _get(_getPrototypeOf(PixelateShader.prototype), "enableAttribs", this).call(this);

        this.gl.enableVertexAttribArray(this._attrib("aTextureRes"));
      }
    }, {
      key: "disableAttribs",
      value: function disableAttribs() {
        _get(_getPrototypeOf(PixelateShader.prototype), "disableAttribs", this).call(this);

        this.gl.disableVertexAttribArray(this._attrib("aTextureRes"));
      }
    }, {
      key: "setExtraAttribsInBuffer",
      value: function setExtraAttribsInBuffer(operation) {
        var offset = operation.extraAttribsDataByteOffset / 4;
        var floats = operation.quads.floats;
        var length = operation.length;

        for (var i = 0; i < length; i++) {
          var w = operation.quads.getTextureWidth(operation.index + i);
          var h = operation.quads.getTextureHeight(operation.index + i);
          floats[offset] = w;
          floats[offset + 1] = h;
          floats[offset + 2] = w;
          floats[offset + 3] = h;
          floats[offset + 4] = w;
          floats[offset + 5] = h;
          floats[offset + 6] = w;
          floats[offset + 7] = h;
          offset += 8;
        }
      }
    }, {
      key: "beforeDraw",
      value: function beforeDraw(operation) {
        var gl = this.gl;
        gl.vertexAttribPointer(this._attrib("aTextureRes"), 2, gl.FLOAT, false, this.getExtraAttribBytesPerVertex(), this.getVertexAttribPointerOffset(operation));
      }
    }, {
      key: "x",
      get: function get$$1() {
        return this._size[0];
      },
      set: function set(v) {
        this._size[0] = v;
        this.redraw();
      }
    }, {
      key: "y",
      get: function get$$1() {
        return this._size[1];
      },
      set: function set(v) {
        this._size[1] = v;
        this.redraw();
      }
    }, {
      key: "size",
      get: function get$$1() {
        return this._size[0];
      },
      set: function set(v) {
        this._size[0] = v;
        this._size[1] = v;
        this.redraw();
      }
    }], [{
      key: "getWebGLImpl",
      value: function getWebGLImpl() {
        return WebGLPixelateShaderImpl;
      }
    }]);

    return PixelateShader;
  }(DefaultShader);
  PixelateShader.vertexShaderSource = `
    #ifdef GL_ES
    precision lowp float;
    #endif
    attribute vec2 aVertexPosition;
    attribute vec2 aTextureCoord;
    attribute vec4 aColor;
    attribute vec2 aTextureRes;
    uniform vec2 projection;
    varying vec2 vTextureCoord;
    varying vec4 vColor;
    varying vec2 vTextureRes;
    void main(void){
        gl_Position = vec4(aVertexPosition.x * projection.x - 1.0, aVertexPosition.y * -abs(projection.y) + 1.0, 0.0, 1.0);
        vTextureCoord = aTextureCoord;
        vColor = aColor;
        vTextureRes = aTextureRes;
        gl_Position.y = -sign(projection.y) * gl_Position.y;
    }
`;
  PixelateShader.fragmentShaderSource = `
    #ifdef GL_ES
    precision lowp float;
    #endif
    varying vec2 vTextureCoord;
    varying vec4 vColor;
    varying vec2 vTextureRes;

    uniform vec2 size;
    uniform sampler2D uSampler;
    
    vec2 mapCoord( vec2 coord )
    {
        coord *= vTextureRes.xy;
        return coord;
    }
    
    vec2 unmapCoord( vec2 coord )
    {
        coord /= vTextureRes.xy;
        return coord;
    }
    
    vec2 pixelate(vec2 coord, vec2 size)
    {
        return floor( coord / size ) * size;
    }
    
    void main(void)
    {
        vec2 coord = mapCoord(vTextureCoord);
        coord = pixelate(coord, size);
        coord = unmapCoord(coord);
        gl_FragColor = texture2D(uSampler, coord) * vColor;
    }
`;

  var RadialFilterShader =
  /*#__PURE__*/
  function (_DefaultShader) {
    _inherits(RadialFilterShader, _DefaultShader);

    function RadialFilterShader(context) {
      var _this;

      _classCallCheck(this, RadialFilterShader);

      _this = _possibleConstructorReturn(this, _getPrototypeOf(RadialFilterShader).call(this, context));
      _this._radius = 0;
      _this._cutoff = 1;
      return _this;
    }

    _createClass(RadialFilterShader, [{
      key: "useDefault",
      value: function useDefault() {
        return this._radius === 0;
      }
    }, {
      key: "setupUniforms",
      value: function setupUniforms(operation) {
        _get(_getPrototypeOf(RadialFilterShader.prototype), "setupUniforms", this).call(this, operation); // We substract half a pixel to get a better cutoff effect.


        this._setUniform("radius", 2 * (this._radius - 0.5) / operation.getRenderWidth(), this.gl.uniform1f);

        this._setUniform("cutoff", 0.5 * operation.getRenderWidth() / this._cutoff, this.gl.uniform1f);
      }
    }, {
      key: "radius",
      set: function set(v) {
        this._radius = v;
        this.redraw();
      },
      get: function get$$1() {
        return this._radius;
      }
    }, {
      key: "cutoff",
      set: function set(v) {
        this._cutoff = v;
        this.redraw();
      },
      get: function get$$1() {
        return this._cutoff;
      }
    }]);

    return RadialFilterShader;
  }(DefaultShader);
  RadialFilterShader.vertexShaderSource = `
    #ifdef GL_ES
    precision lowp float;
    #endif
    attribute vec2 aVertexPosition;
    attribute vec2 aTextureCoord;
    attribute vec4 aColor;
    uniform vec2 projection;
    varying vec2 pos;
    varying vec2 vTextureCoord;
    varying vec4 vColor;
    void main(void){
        gl_Position = vec4(aVertexPosition.x * projection.x - 1.0, aVertexPosition.y * -abs(projection.y) + 1.0, 0.0, 1.0);
        vTextureCoord = aTextureCoord;
        vColor = aColor;
        gl_Position.y = -sign(projection.y) * gl_Position.y;
        pos = gl_Position.xy;
    }
`;
  RadialFilterShader.fragmentShaderSource = `
    #ifdef GL_ES
    precision lowp float;
    #endif
    varying vec2 vTextureCoord;
    varying vec2 pos;
    varying vec4 vColor;
    uniform sampler2D uSampler;
    uniform float radius;
    uniform float cutoff;
    void main(void){
        vec4 color = texture2D(uSampler, vTextureCoord);
        float f = max(0.0, min(1.0, 1.0 - (length(pos) - radius) * cutoff));
        gl_FragColor = texture2D(uSampler, vTextureCoord) * vColor * f;
    }
`;

  var RoundedRectangleShader =
  /*#__PURE__*/
  function (_DefaultShader) {
    _inherits(RoundedRectangleShader, _DefaultShader);

    function RoundedRectangleShader(context) {
      var _this;

      _classCallCheck(this, RoundedRectangleShader);

      _this = _possibleConstructorReturn(this, _getPrototypeOf(RoundedRectangleShader).call(this, context));
      _this._radius = 1;
      return _this;
    }

    _createClass(RoundedRectangleShader, [{
      key: "setupUniforms",
      value: function setupUniforms(operation) {
        _get(_getPrototypeOf(RoundedRectangleShader.prototype), "setupUniforms", this).call(this, operation);

        var owner = operation.shaderOwner;
        var renderPrecision = this.ctx.stage.getRenderPrecision();

        this._setUniform('radius', (this._radius + .5) * renderPrecision, this.gl.uniform1f);

        this._setUniform('resolution', new Float32Array([owner._w * renderPrecision, owner._h * renderPrecision]), this.gl.uniform2fv);
      }
    }, {
      key: "radius",
      set: function set(v) {
        if (v < 1) {
          v = 1;
        }

        this._radius = v;
        this.redraw();
      }
    }]);

    return RoundedRectangleShader;
  }(DefaultShader);
  RoundedRectangleShader.vertexShaderSource = `
    #ifdef GL_ES
    precision lowp float;
    #endif
    attribute vec2 aVertexPosition;
    attribute vec2 aTextureCoord;
    
    attribute vec4 aColor;
    uniform vec2 projection;
    varying vec2 vTextureCoord;
    varying vec4 vColor;
    
    void main(void){
        gl_Position = vec4(aVertexPosition.x * projection.x - 1.0, aVertexPosition.y * -abs(projection.y) + 1.0, 0.0, 1.0);
        vTextureCoord = aTextureCoord;
        vColor = aColor;
        gl_Position.y = -sign(projection.y) * gl_Position.y;
    }
`;
  RoundedRectangleShader.fragmentShaderSource = `
    #ifdef GL_ES
    precision lowp float;
    #endif
    #define PI 3.14159265359
    varying vec2 vTextureCoord;
    varying vec4 vColor;
    uniform sampler2D uSampler;
    uniform vec2 resolution;
    uniform float radius;
    float roundBox(vec2 p, vec2 b, float r) {
        float d = length(max(abs(p)-b+r, 0.1))-r;
        return smoothstep(0.0, 1.0, d);
    }
    void main() {
        vec4 color = texture2D(uSampler, vTextureCoord) * vColor;
        vec2 halfRes = 0.5 * resolution.xy;
        float b = roundBox(vTextureCoord.xy * resolution - halfRes, halfRes, radius);
        gl_FragColor = mix(color, vec4(0.0), b);
    }
`;

  var RadialGradientShader =
  /*#__PURE__*/
  function (_DefaultShader) {
    _inherits(RadialGradientShader, _DefaultShader);

    function RadialGradientShader(context) {
      var _this;

      _classCallCheck(this, RadialGradientShader);

      _this = _possibleConstructorReturn(this, _getPrototypeOf(RadialGradientShader).call(this, context));
      _this._x = 0;
      _this._y = 0;
      _this.color = 0xFFFF0000;
      _this._radiusX = 100;
      _this._radiusY = 100;
      return _this;
    }

    _createClass(RadialGradientShader, [{
      key: "setupUniforms",
      value: function setupUniforms(operation) {
        _get(_getPrototypeOf(RadialGradientShader.prototype), "setupUniforms", this).call(this, operation); // We substract half a pixel to get a better cutoff effect.


        var rtc = operation.getNormalRenderTextureCoords(this._x, this._y);

        this._setUniform("center", new Float32Array(rtc), this.gl.uniform2fv);

        this._setUniform("radius", 2 * this._radiusX / operation.getRenderWidth(), this.gl.uniform1f); // Radial gradient shader is expected to be used on a single element. That element's alpha is used.


        this._setUniform("alpha", operation.getElementCore(0).renderContext.alpha, this.gl.uniform1f);

        this._setUniform("color", this._rawColor, this.gl.uniform4fv);

        this._setUniform("aspectRatio", this._radiusX / this._radiusY * operation.getRenderHeight() / operation.getRenderWidth(), this.gl.uniform1f);
      }
    }, {
      key: "x",
      set: function set(v) {
        this._x = v;
        this.redraw();
      }
    }, {
      key: "y",
      set: function set(v) {
        this._y = v;
        this.redraw();
      }
    }, {
      key: "radiusX",
      set: function set(v) {
        this._radiusX = v;
        this.redraw();
      },
      get: function get$$1() {
        return this._radiusX;
      }
    }, {
      key: "radiusY",
      set: function set(v) {
        this._radiusY = v;
        this.redraw();
      },
      get: function get$$1() {
        return this._radiusY;
      }
    }, {
      key: "radius",
      set: function set(v) {
        this.radiusX = v;
        this.radiusY = v;
      }
    }, {
      key: "color",
      get: function get$$1() {
        return this._color;
      },
      set: function set(v) {
        if (this._color !== v) {
          var col = StageUtils.getRgbaComponentsNormalized(v);
          col[0] = col[0] * col[3];
          col[1] = col[1] * col[3];
          col[2] = col[2] * col[3];
          this._rawColor = new Float32Array(col);
          this.redraw();
          this._color = v;
        }
      }
    }]);

    return RadialGradientShader;
  }(DefaultShader);
  RadialGradientShader.vertexShaderSource = `
    #ifdef GL_ES
    precision lowp float;
    #endif
    attribute vec2 aVertexPosition;
    attribute vec2 aTextureCoord;
    attribute vec4 aColor;
    uniform vec2 projection;
    uniform vec2 center;
    uniform float aspectRatio;
    varying vec2 pos;
    varying vec2 vTextureCoord;
    varying vec4 vColor;
    void main(void){
        gl_Position = vec4(aVertexPosition.x * projection.x - 1.0, aVertexPosition.y * -abs(projection.y) + 1.0, 0.0, 1.0);
        vTextureCoord = aTextureCoord;
        vColor = aColor;
        gl_Position.y = -sign(projection.y) * gl_Position.y;
        pos = gl_Position.xy - center;
        pos.y = pos.y * aspectRatio;
    }
`;
  RadialGradientShader.fragmentShaderSource = `
    #ifdef GL_ES
    precision lowp float;
    #endif
    varying vec2 vTextureCoord;
    varying vec4 vColor;
    varying vec2 pos;
    uniform sampler2D uSampler;
    uniform float radius;
    uniform vec4 color;
    uniform float alpha;
    void main(void){
        float dist = length(pos);
        gl_FragColor = mix(color * alpha, texture2D(uSampler, vTextureCoord) * vColor, min(1.0, dist / radius));
    }
`;

  var Light3dShader =
  /*#__PURE__*/
  function (_DefaultShader) {
    _inherits(Light3dShader, _DefaultShader);

    function Light3dShader(ctx) {
      var _this;

      _classCallCheck(this, Light3dShader);

      _this = _possibleConstructorReturn(this, _getPrototypeOf(Light3dShader).call(this, ctx));
      _this._strength = 0.5;
      _this._ambient = 0.5;
      _this._fudge = 0.4;
      _this._rx = 0;
      _this._ry = 0;
      _this._z = 0;
      _this._pivotX = NaN;
      _this._pivotY = NaN;
      _this._pivotZ = 0;
      _this._lightY = 0;
      _this._lightZ = 0;
      return _this;
    }

    _createClass(Light3dShader, [{
      key: "setupUniforms",
      value: function setupUniforms(operation) {
        _get(_getPrototypeOf(Light3dShader.prototype), "setupUniforms", this).call(this, operation);

        var vr = operation.shaderOwner;
        var element = vr.element;
        var pivotX = isNaN(this._pivotX) ? element.pivotX * vr.w : this._pivotX;
        var pivotY = isNaN(this._pivotY) ? element.pivotY * vr.h : this._pivotY;
        var coords = vr.getRenderTextureCoords(pivotX, pivotY); // Counter normal rotation.

        var rz = -Math.atan2(vr._renderContext.tc, vr._renderContext.ta);
        var gl = this.gl;

        this._setUniform("pivot", new Float32Array([coords[0], coords[1], this._pivotZ]), gl.uniform3fv);

        this._setUniform("rot", new Float32Array([this._rx, this._ry, rz]), gl.uniform3fv);

        this._setUniform("z", this._z, gl.uniform1f);

        this._setUniform("lightY", this.lightY, gl.uniform1f);

        this._setUniform("lightZ", this.lightZ, gl.uniform1f);

        this._setUniform("strength", this._strength, gl.uniform1f);

        this._setUniform("ambient", this._ambient, gl.uniform1f);

        this._setUniform("fudge", this._fudge, gl.uniform1f);
      }
    }, {
      key: "useDefault",
      value: function useDefault() {
        return this._rx === 0 && this._ry === 0 && this._z === 0 && this._strength === 0 && this._ambient === 1;
      }
    }, {
      key: "strength",
      set: function set(v) {
        this._strength = v;
        this.redraw();
      },
      get: function get$$1() {
        return this._strength;
      }
    }, {
      key: "ambient",
      set: function set(v) {
        this._ambient = v;
        this.redraw();
      },
      get: function get$$1() {
        return this._ambient;
      }
    }, {
      key: "fudge",
      set: function set(v) {
        this._fudge = v;
        this.redraw();
      },
      get: function get$$1() {
        return this._fudge;
      }
    }, {
      key: "rx",
      get: function get$$1() {
        return this._rx;
      },
      set: function set(v) {
        this._rx = v;
        this.redraw();
      }
    }, {
      key: "ry",
      get: function get$$1() {
        return this._ry;
      },
      set: function set(v) {
        this._ry = v;
        this.redraw();
      }
    }, {
      key: "z",
      get: function get$$1() {
        return this._z;
      },
      set: function set(v) {
        this._z = v;
        this.redraw();
      }
    }, {
      key: "pivotX",
      get: function get$$1() {
        return this._pivotX;
      },
      set: function set(v) {
        this._pivotX = v + 1;
        this.redraw();
      }
    }, {
      key: "pivotY",
      get: function get$$1() {
        return this._pivotY;
      },
      set: function set(v) {
        this._pivotY = v + 1;
        this.redraw();
      }
    }, {
      key: "lightY",
      get: function get$$1() {
        return this._lightY;
      },
      set: function set(v) {
        this._lightY = v;
        this.redraw();
      }
    }, {
      key: "pivotZ",
      get: function get$$1() {
        return this._pivotZ;
      },
      set: function set(v) {
        this._pivotZ = v;
        this.redraw();
      }
    }, {
      key: "lightZ",
      get: function get$$1() {
        return this._lightZ;
      },
      set: function set(v) {
        this._lightZ = v;
        this.redraw();
      }
    }]);

    return Light3dShader;
  }(DefaultShader);
  Light3dShader.vertexShaderSource = `
    #ifdef GL_ES
    precision lowp float;
    #endif
    attribute vec2 aVertexPosition;
    attribute vec2 aTextureCoord;
    attribute vec4 aColor;
    uniform vec2 projection;
    varying vec2 vTextureCoord;
    varying vec4 vColor;

    uniform float fudge;
    uniform float strength;
    uniform float ambient;
    uniform float z;
    uniform float lightY;
    uniform float lightZ;
    uniform vec3 pivot;
    uniform vec3 rot;
    varying vec3 pos;

    void main(void) {
        pos = vec3(aVertexPosition.xy, z);
        
        pos -= pivot;
        
        // Undo XY rotation
        mat2 iRotXy = mat2( cos(rot.z), sin(rot.z), 
                           -sin(rot.z), cos(rot.z));
        pos.xy = iRotXy * pos.xy;
        
        // Perform 3d rotations
        gl_Position.x = cos(rot.x) * pos.x - sin(rot.x) * pos.z;
        gl_Position.y = pos.y;
        gl_Position.z = sin(rot.x) * pos.x + cos(rot.x) * pos.z;
        
        pos.x = gl_Position.x;
        pos.y = cos(rot.y) * gl_Position.y - sin(rot.y) * gl_Position.z;
        pos.z = sin(rot.y) * gl_Position.y + cos(rot.y) * gl_Position.z;
        
        // Redo XY rotation
        iRotXy[0][1] = -iRotXy[0][1];
        iRotXy[1][0] = -iRotXy[1][0];
        pos.xy = iRotXy * pos.xy; 

        // Undo translate to pivot position
        pos.xyz += pivot;

        pos = vec3(pos.x * projection.x - 1.0, pos.y * -abs(projection.y) + 1.0, pos.z * projection.x);
        
        // Set depth perspective
        float perspective = 1.0 + fudge * pos.z;

        pos.z += lightZ * projection.x;

        // Map coords to gl coordinate space.
        // Set z to 0 because we don't want to perform z-clipping
        gl_Position = vec4(pos.xy, 0.0, perspective);

        // Correct light source position.
        pos.y += lightY * abs(projection.y);

        vTextureCoord = aTextureCoord;
        vColor = aColor;
        
        gl_Position.y = -sign(projection.y) * gl_Position.y;
    }
`;
  Light3dShader.fragmentShaderSource = `
    #ifdef GL_ES
    precision lowp float;
    #endif
    varying vec2 vTextureCoord;
    varying vec4 vColor;
    varying vec3 pos;
    uniform sampler2D uSampler;
    uniform float ambient;
    uniform float strength;
    void main(void){
        vec4 rgba = texture2D(uSampler, vTextureCoord);
        float d = length(pos);
        float n = 1.0 / max(0.1, d);
        rgba.rgb = rgba.rgb * (strength * n + ambient);
        gl_FragColor = rgba * vColor;
    }
`;

  var lightning = {
    Application,
    Component,
    Base,
    Utils,
    StageUtils,
    Element,
    Tools,
    Stage,
    ElementCore,
    ElementTexturizer,
    Texture,
    EventEmitter,
    shaders: {
      Grayscale: WebGLGrayscaleShader,
      BoxBlur: BoxBlurShader,
      Dithering: DitheringShader,
      CircularPush: CircularPushShader,
      Inversion: InversionShader,
      LinearBlur: LinearBlurShader,
      Outline: OutlineShader,
      Pixelate: PixelateShader,
      RadialFilter: RadialFilterShader,
      RoundedRectangle: RoundedRectangleShader,
      RadialGradient: RadialGradientShader,
      Light3d: Light3dShader,
      WebGLShader,
      WebGLDefaultShader: DefaultShader,
      C2dShader,
      C2dDefaultShader: DefaultShader$1,
      c2d: {
        Grayscale: C2dGrayscaleShader,
        Blur: BlurShader
      }
    },
    textures: {
      RectangleTexture,
      NoiseTexture,
      TextTexture,
      ImageTexture,
      HtmlTexture,
      StaticTexture,
      StaticCanvasTexture,
      SourceTexture
    },
    components: {
      FastBlurComponent,
      BloomComponent,
      SmoothScaleComponent,
      BorderComponent,
      ListComponent
    },
    tools: {
      ObjMerger,
      ObjectListProxy,
      ObjectListWrapper
    }
  };

  if (Utils.isWeb) {
    window.lng = lightning;
  }

  return lightning;

})));
