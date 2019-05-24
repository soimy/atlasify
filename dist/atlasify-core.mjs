/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */

function __awaiter(thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

class Rectangle {
    constructor(width = 0, height = 0, x = 0, y = 0, rot = false) {
        this.width = width;
        this.height = height;
        this.x = x;
        this.y = y;
        this.rot = rot;
        this.oversized = false;
        this.data = {};
    }
    static Collide(first, second) { return first.collide(second); }
    static Contain(first, second) { return first.contain(second); }
    area() { return this.width * this.height; }
    collide(rect) {
        return (rect.x < this.x + this.width &&
            rect.x + rect.width > this.x &&
            rect.y < this.y + this.height &&
            rect.y + rect.height > this.y);
    }
    contain(rect) {
        return (rect.x >= this.x && rect.y >= this.y &&
            rect.x + rect.width <= this.x + this.width && rect.y + rect.height <= this.y + this.height);
    }
}

class Bin {
}

class MaxRectsBin extends Bin {
    constructor(maxWidth = EDGE_MAX_VALUE, maxHeight = EDGE_MAX_VALUE, padding = 0, options = { smart: true, pot: true, square: true, allowRotation: false }) {
        super();
        this.maxWidth = maxWidth;
        this.maxHeight = maxHeight;
        this.padding = padding;
        this.options = options;
        this.freeRects = [];
        this.rects = [];
        this.verticalExpand = false;
        this.width = this.options.smart ? 0 : maxWidth;
        this.height = this.options.smart ? 0 : maxHeight;
        this.freeRects.push(new Rectangle(this.maxWidth + this.padding, this.maxHeight + this.padding));
        this.stage = new Rectangle(this.width, this.height);
    }
    add(...args) {
        let width;
        let height;
        let data;
        let rect;
        if (args.length === 1) {
            if (typeof args[0] !== 'object')
                throw new Error("MacrectsBin.add(): Wrong parameters");
            rect = args[0];
            width = rect.width;
            height = rect.height;
        }
        else {
            width = args[0];
            height = args[1];
            data = args.length > 2 ? args[2] : null;
        }
        let node = this.findNode(width + this.padding, height + this.padding);
        if (node) {
            this.updateBinSize(node);
            let numRectToProcess = this.freeRects.length;
            let i = 0;
            while (i < numRectToProcess) {
                if (this.splitNode(this.freeRects[i], node)) {
                    this.freeRects.splice(i, 1);
                    numRectToProcess--;
                    i--;
                }
                i++;
            }
            this.pruneFreeList();
            this.verticalExpand = this.width > this.height ? true : false;
            if (!rect) {
                rect = new Rectangle(width, height, node.x, node.y, node.rot);
                rect.data = data;
            }
            else {
                rect.x = node.x;
                rect.y = node.y;
                rect.rot = node.rot;
            }
            this.rects.push(rect);
            return rect;
        }
        else if (!this.verticalExpand) {
            if (this.updateBinSize(new Rectangle(width + this.padding, height + this.padding, this.width + this.padding, 0))
                || this.updateBinSize(new Rectangle(width + this.padding, height + this.padding, 0, this.height + this.padding))) {
                return rect ? this.add(rect) : this.add(width, height, data);
            }
        }
        else {
            if (this.updateBinSize(new Rectangle(width + this.padding, height + this.padding, 0, this.height + this.padding)) || this.updateBinSize(new Rectangle(width + this.padding, height + this.padding, this.width + this.padding, 0))) {
                return rect ? this.add(rect) : this.add(width, height, data);
            }
        }
        return undefined;
    }
    findNode(width, height) {
        let score = Number.MAX_VALUE;
        let areaFit;
        let r;
        let bestNode;
        for (let i in this.freeRects) {
            r = this.freeRects[i];
            if (r.width >= width && r.height >= height) {
                areaFit = r.width * r.height - width * height;
                if (areaFit < score) {
                    bestNode = new Rectangle(width, height, r.x, r.y);
                    score = areaFit;
                }
            }
            if (!this.options.allowRotation)
                continue;
            // Continue to test 90-degree rotated rectangle
            if (r.width >= height && r.height >= width) {
                areaFit = r.width * r.height - height * width;
                if (areaFit < score) {
                    bestNode = new Rectangle(height, width, r.x, r.y, true); // Rotated node
                    score = areaFit;
                }
            }
        }
        return bestNode;
    }
    splitNode(freeRect, usedNode) {
        // Test if usedNode intersect with freeRect
        if (!freeRect.collide(usedNode))
            return false;
        // Do vertical split
        if (usedNode.x < freeRect.x + freeRect.width && usedNode.x + usedNode.width > freeRect.x) {
            // New node at the top side of the used node
            if (usedNode.y > freeRect.y && usedNode.y < freeRect.y + freeRect.height) {
                let newNode = new Rectangle(freeRect.width, usedNode.y - freeRect.y, freeRect.x, freeRect.y);
                this.freeRects.push(newNode);
            }
            // New node at the bottom side of the used node
            if (usedNode.y + usedNode.height < freeRect.y + freeRect.height) {
                let newNode = new Rectangle(freeRect.width, freeRect.y + freeRect.height - (usedNode.y + usedNode.height), freeRect.x, usedNode.y + usedNode.height);
                this.freeRects.push(newNode);
            }
        }
        // Do Horizontal split
        if (usedNode.y < freeRect.y + freeRect.height &&
            usedNode.y + usedNode.height > freeRect.y) {
            // New node at the left side of the used node.
            if (usedNode.x > freeRect.x && usedNode.x < freeRect.x + freeRect.width) {
                let newNode = new Rectangle(usedNode.x - freeRect.x, freeRect.height, freeRect.x, freeRect.y);
                this.freeRects.push(newNode);
            }
            // New node at the right side of the used node.
            if (usedNode.x + usedNode.width < freeRect.x + freeRect.width) {
                let newNode = new Rectangle(freeRect.x + freeRect.width - (usedNode.x + usedNode.width), freeRect.height, usedNode.x + usedNode.width, freeRect.y);
                this.freeRects.push(newNode);
            }
        }
        return true;
    }
    pruneFreeList() {
        // Go through each pair of freeRects and remove any rects that is redundant
        let i = 0;
        let j = 0;
        let len = this.freeRects.length;
        while (i < len) {
            j = i + 1;
            let tmpRect1 = this.freeRects[i];
            while (j < len) {
                let tmpRect2 = this.freeRects[j];
                if (tmpRect2.contain(tmpRect1)) {
                    this.freeRects.splice(i, 1);
                    i--;
                    len--;
                    break;
                }
                if (tmpRect1.contain(tmpRect2)) {
                    this.freeRects.splice(j, 1);
                    j--;
                    len--;
                }
                j++;
            }
            i++;
        }
    }
    updateBinSize(node) {
        if (!this.options.smart)
            return false;
        if (this.stage.contain(node))
            return false;
        let tmpWidth = Math.max(this.width, node.x + node.width - this.padding);
        let tmpHeight = Math.max(this.height, node.y + node.height - this.padding);
        if (this.options.pot) {
            tmpWidth = Math.pow(2, Math.ceil(Math.log(tmpWidth) * Math.LOG2E));
            tmpHeight = Math.pow(2, Math.ceil(Math.log(tmpHeight) * Math.LOG2E));
        }
        if (this.options.square) {
            tmpWidth = tmpHeight = Math.max(tmpWidth, tmpHeight);
        }
        if (tmpWidth > this.maxWidth + this.padding || tmpHeight > this.maxHeight + this.padding) {
            return false;
        }
        this.expandFreeRects(tmpWidth + this.padding, tmpHeight + this.padding);
        this.width = this.stage.width = tmpWidth;
        this.height = this.stage.height = tmpHeight;
        return true;
    }
    expandFreeRects(width, height) {
        this.freeRects.forEach((freeRect, index) => {
            if (freeRect.x + freeRect.width >= Math.min(this.width + this.padding, width)) {
                freeRect.width = width - freeRect.x;
            }
            if (freeRect.y + freeRect.height >= Math.min(this.height + this.padding, height)) {
                freeRect.height = height - freeRect.y;
            }
        }, this);
        this.freeRects.push(new Rectangle(width - this.width - this.padding, height, this.width + this.padding, 0));
        this.freeRects.push(new Rectangle(width, height - this.height - this.padding, 0, this.height + this.padding));
        this.freeRects.forEach((freeRect, index) => {
            if (freeRect.width <= 0 || freeRect.height <= 0) {
                this.freeRects.splice(index, 1);
            }
        }, this);
        this.pruneFreeList();
    }
}

class OversizedElementBin extends Bin {
    constructor(...args) {
        super();
        this.rects = [];
        if (args.length === 1) {
            if (typeof args[0] !== 'object')
                throw new Error("OversizedElementBin: Wrong parameters");
            const rect = args[0];
            this.rects = [rect];
            this.width = rect.width;
            this.height = rect.height;
            this.data = rect.data;
            rect.oversized = true;
        }
        else {
            this.width = args[0];
            this.height = args[1];
            this.data = args.length > 2 ? args[2] : null;
            const rect = new Rectangle(this.width, this.height);
            rect.oversized = true;
            rect.data = this.data;
            this.rects.push(rect);
        }
        this.freeRects = [];
        this.maxWidth = this.width;
        this.maxHeight = this.height;
        this.options = { smart: false, pot: false, square: false };
    }
    add() { return undefined; }
}

const EDGE_MAX_VALUE = 4096;
class MaxRectsPacker {
    /**
     * Creates an instance of MaxRectsPacker.
     * @param {number} width of the output atlas (default is 4096)
     * @param {number} height of the output atlas (default is 4096)
     * @param {number} padding between glyphs/images (default is 0)
     * @param {IOption} [options={}] (Optional) packing options
     * @memberof MaxRectsPacker
     */
    constructor(width = EDGE_MAX_VALUE, height = EDGE_MAX_VALUE, padding = 0, options = { smart: true, pot: true, square: true, allowRotation: false }) {
        this.width = width;
        this.height = height;
        this.padding = padding;
        this.options = options;
        this.bins = [];
    }
    add(...args) {
        let width;
        let height;
        let data;
        if (args.length === 1) {
            if (typeof args[0] !== 'object')
                throw new Error("MacrectsPacker.add(): Wrong parameters");
            const rect = args[0];
            if (rect.width > this.width || rect.height > this.height) {
                this.bins.push(new OversizedElementBin(rect));
            }
            else {
                let added = this.bins.find(bin => bin.add(rect) !== undefined);
                if (!added) {
                    let bin = new MaxRectsBin(this.width, this.height, this.padding, this.options);
                    bin.add(rect);
                    this.bins.push(bin);
                }
            }
        }
        else {
            width = args[0];
            height = args[1];
            data = args.length > 2 ? args[2] : null;
            if (width > this.width || height > this.height) {
                this.bins.push(new OversizedElementBin(width, height, data));
            }
            else {
                let added = this.bins.find(bin => bin.add(width, height, data) !== undefined);
                if (!added) {
                    let bin = new MaxRectsBin(this.width, this.height, this.padding, this.options);
                    bin.add(width, height, data);
                    this.bins.push(bin);
                }
            }
        }
    }
    /**
     * Add an Array of bins/rectangles to the packer.
     * Object structure: { width, height, data }
     * @param {IRectangle[]} rects Array of bin/rectangles
     * @memberof MaxRectsPacker
     */
    addArray(rects) {
        this.sort(rects).forEach(rect => this.add(rect));
    }
    /**
     * Load bins to the packer, overwrite exist bins
     * @param {MaxRectsBin[]} bins MaxRectsBin objects
     * @memberof MaxRectsPacker
     */
    load(bins) {
        bins.forEach((bin, index) => {
            if (bin.maxWidth > this.width || bin.maxHeight > this.height) {
                this.bins.push(new OversizedElementBin(bin.width, bin.height, {}));
            }
            else {
                let newBin = new MaxRectsBin(this.width, this.height, this.padding, bin.options);
                newBin.freeRects.splice(0);
                bin.freeRects.forEach((r, i) => {
                    newBin.freeRects.push(new Rectangle(r.width, r.height, r.x, r.y));
                });
                newBin.width = bin.width;
                newBin.height = bin.height;
                this.bins[index] = newBin;
            }
        }, this);
    }
    /**
     * Output current bins to save
     * @memberof MaxRectsPacker
     */
    save() {
        let saveBins = [];
        this.bins.forEach((bin => {
            let saveBin = {
                width: bin.width,
                height: bin.height,
                maxWidth: bin.maxWidth,
                maxHeight: bin.maxHeight,
                freeRects: [],
                rects: [],
                options: bin.options
            };
            bin.freeRects.forEach(r => {
                saveBin.freeRects.push({
                    x: r.x,
                    y: r.y,
                    width: r.width,
                    height: r.height
                });
            });
            saveBins.push(saveBin);
        }));
        return saveBins;
    }
    sort(rects) {
        return rects.slice().sort((a, b) => Math.max(b.width, b.height) - Math.max(a.width, a.height));
    }
}

function unwrapExports (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

// 7.1.4 ToInteger
var ceil = Math.ceil;
var floor = Math.floor;
var _toInteger = function (it) {
  return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
};

// 7.2.1 RequireObjectCoercible(argument)
var _defined = function (it) {
  if (it == undefined) throw TypeError("Can't call method on  " + it);
  return it;
};

// true  -> String#at
// false -> String#codePointAt
var _stringAt = function (TO_STRING) {
  return function (that, pos) {
    var s = String(_defined(that));
    var i = _toInteger(pos);
    var l = s.length;
    var a, b;
    if (i < 0 || i >= l) return TO_STRING ? '' : undefined;
    a = s.charCodeAt(i);
    return a < 0xd800 || a > 0xdbff || i + 1 === l || (b = s.charCodeAt(i + 1)) < 0xdc00 || b > 0xdfff
      ? TO_STRING ? s.charAt(i) : a
      : TO_STRING ? s.slice(i, i + 2) : (a - 0xd800 << 10) + (b - 0xdc00) + 0x10000;
  };
};

var _library = false;

var _global = createCommonjsModule(function (module) {
// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
var global = module.exports = typeof window != 'undefined' && window.Math == Math
  ? window : typeof self != 'undefined' && self.Math == Math ? self
  // eslint-disable-next-line no-new-func
  : Function('return this')();
if (typeof __g == 'number') __g = global; // eslint-disable-line no-undef
});

var _core = createCommonjsModule(function (module) {
var core = module.exports = { version: '2.6.5' };
if (typeof __e == 'number') __e = core; // eslint-disable-line no-undef
});
var _core_1 = _core.version;

var _isObject = function (it) {
  return typeof it === 'object' ? it !== null : typeof it === 'function';
};

var _anObject = function (it) {
  if (!_isObject(it)) throw TypeError(it + ' is not an object!');
  return it;
};

var _fails = function (exec) {
  try {
    return !!exec();
  } catch (e) {
    return true;
  }
};

// Thank's IE8 for his funny defineProperty
var _descriptors = !_fails(function () {
  return Object.defineProperty({}, 'a', { get: function () { return 7; } }).a != 7;
});

var document = _global.document;
// typeof document.createElement is 'object' in old IE
var is = _isObject(document) && _isObject(document.createElement);
var _domCreate = function (it) {
  return is ? document.createElement(it) : {};
};

var _ie8DomDefine = !_descriptors && !_fails(function () {
  return Object.defineProperty(_domCreate('div'), 'a', { get: function () { return 7; } }).a != 7;
});

// 7.1.1 ToPrimitive(input [, PreferredType])

// instead of the ES6 spec version, we didn't implement @@toPrimitive case
// and the second argument - flag - preferred type is a string
var _toPrimitive = function (it, S) {
  if (!_isObject(it)) return it;
  var fn, val;
  if (S && typeof (fn = it.toString) == 'function' && !_isObject(val = fn.call(it))) return val;
  if (typeof (fn = it.valueOf) == 'function' && !_isObject(val = fn.call(it))) return val;
  if (!S && typeof (fn = it.toString) == 'function' && !_isObject(val = fn.call(it))) return val;
  throw TypeError("Can't convert object to primitive value");
};

var dP = Object.defineProperty;

var f = _descriptors ? Object.defineProperty : function defineProperty(O, P, Attributes) {
  _anObject(O);
  P = _toPrimitive(P, true);
  _anObject(Attributes);
  if (_ie8DomDefine) try {
    return dP(O, P, Attributes);
  } catch (e) { /* empty */ }
  if ('get' in Attributes || 'set' in Attributes) throw TypeError('Accessors not supported!');
  if ('value' in Attributes) O[P] = Attributes.value;
  return O;
};

var _objectDp = {
	f: f
};

var _propertyDesc = function (bitmap, value) {
  return {
    enumerable: !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable: !(bitmap & 4),
    value: value
  };
};

var _hide = _descriptors ? function (object, key, value) {
  return _objectDp.f(object, key, _propertyDesc(1, value));
} : function (object, key, value) {
  object[key] = value;
  return object;
};

var hasOwnProperty = {}.hasOwnProperty;
var _has = function (it, key) {
  return hasOwnProperty.call(it, key);
};

var id = 0;
var px = Math.random();
var _uid = function (key) {
  return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
};

var _shared = createCommonjsModule(function (module) {
var SHARED = '__core-js_shared__';
var store = _global[SHARED] || (_global[SHARED] = {});

(module.exports = function (key, value) {
  return store[key] || (store[key] = value !== undefined ? value : {});
})('versions', []).push({
  version: _core.version,
  mode: 'global',
  copyright: '© 2019 Denis Pushkarev (zloirock.ru)'
});
});

var _functionToString = _shared('native-function-to-string', Function.toString);

var _redefine = createCommonjsModule(function (module) {
var SRC = _uid('src');

var TO_STRING = 'toString';
var TPL = ('' + _functionToString).split(TO_STRING);

_core.inspectSource = function (it) {
  return _functionToString.call(it);
};

(module.exports = function (O, key, val, safe) {
  var isFunction = typeof val == 'function';
  if (isFunction) _has(val, 'name') || _hide(val, 'name', key);
  if (O[key] === val) return;
  if (isFunction) _has(val, SRC) || _hide(val, SRC, O[key] ? '' + O[key] : TPL.join(String(key)));
  if (O === _global) {
    O[key] = val;
  } else if (!safe) {
    delete O[key];
    _hide(O, key, val);
  } else if (O[key]) {
    O[key] = val;
  } else {
    _hide(O, key, val);
  }
// add fake Function#toString for correct work wrapped methods / constructors with methods like LoDash isNative
})(Function.prototype, TO_STRING, function toString() {
  return typeof this == 'function' && this[SRC] || _functionToString.call(this);
});
});

var _aFunction = function (it) {
  if (typeof it != 'function') throw TypeError(it + ' is not a function!');
  return it;
};

// optional / simple context binding

var _ctx = function (fn, that, length) {
  _aFunction(fn);
  if (that === undefined) return fn;
  switch (length) {
    case 1: return function (a) {
      return fn.call(that, a);
    };
    case 2: return function (a, b) {
      return fn.call(that, a, b);
    };
    case 3: return function (a, b, c) {
      return fn.call(that, a, b, c);
    };
  }
  return function (/* ...args */) {
    return fn.apply(that, arguments);
  };
};

var PROTOTYPE = 'prototype';

var $export = function (type, name, source) {
  var IS_FORCED = type & $export.F;
  var IS_GLOBAL = type & $export.G;
  var IS_STATIC = type & $export.S;
  var IS_PROTO = type & $export.P;
  var IS_BIND = type & $export.B;
  var target = IS_GLOBAL ? _global : IS_STATIC ? _global[name] || (_global[name] = {}) : (_global[name] || {})[PROTOTYPE];
  var exports = IS_GLOBAL ? _core : _core[name] || (_core[name] = {});
  var expProto = exports[PROTOTYPE] || (exports[PROTOTYPE] = {});
  var key, own, out, exp;
  if (IS_GLOBAL) source = name;
  for (key in source) {
    // contains in native
    own = !IS_FORCED && target && target[key] !== undefined;
    // export native or passed
    out = (own ? target : source)[key];
    // bind timers to global for call from export context
    exp = IS_BIND && own ? _ctx(out, _global) : IS_PROTO && typeof out == 'function' ? _ctx(Function.call, out) : out;
    // extend global
    if (target) _redefine(target, key, out, type & $export.U);
    // export
    if (exports[key] != out) _hide(exports, key, exp);
    if (IS_PROTO && expProto[key] != out) expProto[key] = out;
  }
};
_global.core = _core;
// type bitmap
$export.F = 1;   // forced
$export.G = 2;   // global
$export.S = 4;   // static
$export.P = 8;   // proto
$export.B = 16;  // bind
$export.W = 32;  // wrap
$export.U = 64;  // safe
$export.R = 128; // real proto method for `library`
var _export = $export;

var _iterators = {};

var toString = {}.toString;

var _cof = function (it) {
  return toString.call(it).slice(8, -1);
};

// fallback for non-array-like ES3 and non-enumerable old V8 strings

// eslint-disable-next-line no-prototype-builtins
var _iobject = Object('z').propertyIsEnumerable(0) ? Object : function (it) {
  return _cof(it) == 'String' ? it.split('') : Object(it);
};

// to indexed object, toObject with fallback for non-array-like ES3 strings


var _toIobject = function (it) {
  return _iobject(_defined(it));
};

// 7.1.15 ToLength

var min = Math.min;
var _toLength = function (it) {
  return it > 0 ? min(_toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
};

var max = Math.max;
var min$1 = Math.min;
var _toAbsoluteIndex = function (index, length) {
  index = _toInteger(index);
  return index < 0 ? max(index + length, 0) : min$1(index, length);
};

// false -> Array#indexOf
// true  -> Array#includes



var _arrayIncludes = function (IS_INCLUDES) {
  return function ($this, el, fromIndex) {
    var O = _toIobject($this);
    var length = _toLength(O.length);
    var index = _toAbsoluteIndex(fromIndex, length);
    var value;
    // Array#includes uses SameValueZero equality algorithm
    // eslint-disable-next-line no-self-compare
    if (IS_INCLUDES && el != el) while (length > index) {
      value = O[index++];
      // eslint-disable-next-line no-self-compare
      if (value != value) return true;
    // Array#indexOf ignores holes, Array#includes - not
    } else for (;length > index; index++) if (IS_INCLUDES || index in O) {
      if (O[index] === el) return IS_INCLUDES || index || 0;
    } return !IS_INCLUDES && -1;
  };
};

var shared = _shared('keys');

var _sharedKey = function (key) {
  return shared[key] || (shared[key] = _uid(key));
};

var arrayIndexOf = _arrayIncludes(false);
var IE_PROTO = _sharedKey('IE_PROTO');

var _objectKeysInternal = function (object, names) {
  var O = _toIobject(object);
  var i = 0;
  var result = [];
  var key;
  for (key in O) if (key != IE_PROTO) _has(O, key) && result.push(key);
  // Don't enum bug & hidden keys
  while (names.length > i) if (_has(O, key = names[i++])) {
    ~arrayIndexOf(result, key) || result.push(key);
  }
  return result;
};

// IE 8- don't enum bug keys
var _enumBugKeys = (
  'constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf'
).split(',');

// 19.1.2.14 / 15.2.3.14 Object.keys(O)



var _objectKeys = Object.keys || function keys(O) {
  return _objectKeysInternal(O, _enumBugKeys);
};

var _objectDps = _descriptors ? Object.defineProperties : function defineProperties(O, Properties) {
  _anObject(O);
  var keys = _objectKeys(Properties);
  var length = keys.length;
  var i = 0;
  var P;
  while (length > i) _objectDp.f(O, P = keys[i++], Properties[P]);
  return O;
};

var document$1 = _global.document;
var _html = document$1 && document$1.documentElement;

// 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])



var IE_PROTO$1 = _sharedKey('IE_PROTO');
var Empty = function () { /* empty */ };
var PROTOTYPE$1 = 'prototype';

// Create object with fake `null` prototype: use iframe Object with cleared prototype
var createDict = function () {
  // Thrash, waste and sodomy: IE GC bug
  var iframe = _domCreate('iframe');
  var i = _enumBugKeys.length;
  var lt = '<';
  var gt = '>';
  var iframeDocument;
  iframe.style.display = 'none';
  _html.appendChild(iframe);
  iframe.src = 'javascript:'; // eslint-disable-line no-script-url
  // createDict = iframe.contentWindow.Object;
  // html.removeChild(iframe);
  iframeDocument = iframe.contentWindow.document;
  iframeDocument.open();
  iframeDocument.write(lt + 'script' + gt + 'document.F=Object' + lt + '/script' + gt);
  iframeDocument.close();
  createDict = iframeDocument.F;
  while (i--) delete createDict[PROTOTYPE$1][_enumBugKeys[i]];
  return createDict();
};

var _objectCreate = Object.create || function create(O, Properties) {
  var result;
  if (O !== null) {
    Empty[PROTOTYPE$1] = _anObject(O);
    result = new Empty();
    Empty[PROTOTYPE$1] = null;
    // add "__proto__" for Object.getPrototypeOf polyfill
    result[IE_PROTO$1] = O;
  } else result = createDict();
  return Properties === undefined ? result : _objectDps(result, Properties);
};

var _wks = createCommonjsModule(function (module) {
var store = _shared('wks');

var Symbol = _global.Symbol;
var USE_SYMBOL = typeof Symbol == 'function';

var $exports = module.exports = function (name) {
  return store[name] || (store[name] =
    USE_SYMBOL && Symbol[name] || (USE_SYMBOL ? Symbol : _uid)('Symbol.' + name));
};

$exports.store = store;
});

var def = _objectDp.f;

var TAG = _wks('toStringTag');

var _setToStringTag = function (it, tag, stat) {
  if (it && !_has(it = stat ? it : it.prototype, TAG)) def(it, TAG, { configurable: true, value: tag });
};

var IteratorPrototype = {};

// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
_hide(IteratorPrototype, _wks('iterator'), function () { return this; });

var _iterCreate = function (Constructor, NAME, next) {
  Constructor.prototype = _objectCreate(IteratorPrototype, { next: _propertyDesc(1, next) });
  _setToStringTag(Constructor, NAME + ' Iterator');
};

// 7.1.13 ToObject(argument)

var _toObject = function (it) {
  return Object(_defined(it));
};

// 19.1.2.9 / 15.2.3.2 Object.getPrototypeOf(O)


var IE_PROTO$2 = _sharedKey('IE_PROTO');
var ObjectProto = Object.prototype;

var _objectGpo = Object.getPrototypeOf || function (O) {
  O = _toObject(O);
  if (_has(O, IE_PROTO$2)) return O[IE_PROTO$2];
  if (typeof O.constructor == 'function' && O instanceof O.constructor) {
    return O.constructor.prototype;
  } return O instanceof Object ? ObjectProto : null;
};

var ITERATOR = _wks('iterator');
var BUGGY = !([].keys && 'next' in [].keys()); // Safari has buggy iterators w/o `next`
var FF_ITERATOR = '@@iterator';
var KEYS = 'keys';
var VALUES = 'values';

var returnThis = function () { return this; };

var _iterDefine = function (Base, NAME, Constructor, next, DEFAULT, IS_SET, FORCED) {
  _iterCreate(Constructor, NAME, next);
  var getMethod = function (kind) {
    if (!BUGGY && kind in proto) return proto[kind];
    switch (kind) {
      case KEYS: return function keys() { return new Constructor(this, kind); };
      case VALUES: return function values() { return new Constructor(this, kind); };
    } return function entries() { return new Constructor(this, kind); };
  };
  var TAG = NAME + ' Iterator';
  var DEF_VALUES = DEFAULT == VALUES;
  var VALUES_BUG = false;
  var proto = Base.prototype;
  var $native = proto[ITERATOR] || proto[FF_ITERATOR] || DEFAULT && proto[DEFAULT];
  var $default = $native || getMethod(DEFAULT);
  var $entries = DEFAULT ? !DEF_VALUES ? $default : getMethod('entries') : undefined;
  var $anyNative = NAME == 'Array' ? proto.entries || $native : $native;
  var methods, key, IteratorPrototype;
  // Fix native
  if ($anyNative) {
    IteratorPrototype = _objectGpo($anyNative.call(new Base()));
    if (IteratorPrototype !== Object.prototype && IteratorPrototype.next) {
      // Set @@toStringTag to native iterators
      _setToStringTag(IteratorPrototype, TAG, true);
      // fix for some old engines
      if (typeof IteratorPrototype[ITERATOR] != 'function') _hide(IteratorPrototype, ITERATOR, returnThis);
    }
  }
  // fix Array#{values, @@iterator}.name in V8 / FF
  if (DEF_VALUES && $native && $native.name !== VALUES) {
    VALUES_BUG = true;
    $default = function values() { return $native.call(this); };
  }
  // Define iterator
  if (BUGGY || VALUES_BUG || !proto[ITERATOR]) {
    _hide(proto, ITERATOR, $default);
  }
  // Plug for library
  _iterators[NAME] = $default;
  _iterators[TAG] = returnThis;
  if (DEFAULT) {
    methods = {
      values: DEF_VALUES ? $default : getMethod(VALUES),
      keys: IS_SET ? $default : getMethod(KEYS),
      entries: $entries
    };
    if (FORCED) for (key in methods) {
      if (!(key in proto)) _redefine(proto, key, methods[key]);
    } else _export(_export.P + _export.F * (BUGGY || VALUES_BUG), NAME, methods);
  }
  return methods;
};

var $at = _stringAt(true);

// 21.1.3.27 String.prototype[@@iterator]()
_iterDefine(String, 'String', function (iterated) {
  this._t = String(iterated); // target
  this._i = 0;                // next index
// 21.1.5.2.1 %StringIteratorPrototype%.next()
}, function () {
  var O = this._t;
  var index = this._i;
  var point;
  if (index >= O.length) return { value: undefined, done: true };
  point = $at(O, index);
  this._i += point.length;
  return { value: point, done: false };
});

// call something on iterator step with safe closing on error

var _iterCall = function (iterator, fn, value, entries) {
  try {
    return entries ? fn(_anObject(value)[0], value[1]) : fn(value);
  // 7.4.6 IteratorClose(iterator, completion)
  } catch (e) {
    var ret = iterator['return'];
    if (ret !== undefined) _anObject(ret.call(iterator));
    throw e;
  }
};

// check on default Array iterator

var ITERATOR$1 = _wks('iterator');
var ArrayProto = Array.prototype;

var _isArrayIter = function (it) {
  return it !== undefined && (_iterators.Array === it || ArrayProto[ITERATOR$1] === it);
};

var _createProperty = function (object, index, value) {
  if (index in object) _objectDp.f(object, index, _propertyDesc(0, value));
  else object[index] = value;
};

// getting tag from 19.1.3.6 Object.prototype.toString()

var TAG$1 = _wks('toStringTag');
// ES3 wrong here
var ARG = _cof(function () { return arguments; }()) == 'Arguments';

// fallback for IE11 Script Access Denied error
var tryGet = function (it, key) {
  try {
    return it[key];
  } catch (e) { /* empty */ }
};

var _classof = function (it) {
  var O, T, B;
  return it === undefined ? 'Undefined' : it === null ? 'Null'
    // @@toStringTag case
    : typeof (T = tryGet(O = Object(it), TAG$1)) == 'string' ? T
    // builtinTag case
    : ARG ? _cof(O)
    // ES3 arguments fallback
    : (B = _cof(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : B;
};

var ITERATOR$2 = _wks('iterator');

var core_getIteratorMethod = _core.getIteratorMethod = function (it) {
  if (it != undefined) return it[ITERATOR$2]
    || it['@@iterator']
    || _iterators[_classof(it)];
};

var ITERATOR$3 = _wks('iterator');
var SAFE_CLOSING = false;

try {
  var riter = [7][ITERATOR$3]();
  riter['return'] = function () { SAFE_CLOSING = true; };
} catch (e) { /* empty */ }

var _iterDetect = function (exec, skipClosing) {
  if (!skipClosing && !SAFE_CLOSING) return false;
  var safe = false;
  try {
    var arr = [7];
    var iter = arr[ITERATOR$3]();
    iter.next = function () { return { done: safe = true }; };
    arr[ITERATOR$3] = function () { return iter; };
    exec(arr);
  } catch (e) { /* empty */ }
  return safe;
};

_export(_export.S + _export.F * !_iterDetect(function (iter) { }), 'Array', {
  // 22.1.2.1 Array.from(arrayLike, mapfn = undefined, thisArg = undefined)
  from: function from(arrayLike /* , mapfn = undefined, thisArg = undefined */) {
    var O = _toObject(arrayLike);
    var C = typeof this == 'function' ? this : Array;
    var aLen = arguments.length;
    var mapfn = aLen > 1 ? arguments[1] : undefined;
    var mapping = mapfn !== undefined;
    var index = 0;
    var iterFn = core_getIteratorMethod(O);
    var length, result, step, iterator;
    if (mapping) mapfn = _ctx(mapfn, aLen > 2 ? arguments[2] : undefined, 2);
    // if object isn't iterable or it's array with default iterator - use simple case
    if (iterFn != undefined && !(C == Array && _isArrayIter(iterFn))) {
      for (iterator = iterFn.call(O), result = new C(); !(step = iterator.next()).done; index++) {
        _createProperty(result, index, mapping ? _iterCall(iterator, mapfn, [step.value, index], true) : step.value);
      }
    } else {
      length = _toLength(O.length);
      for (result = new C(length); length > index; index++) {
        _createProperty(result, index, mapping ? mapfn(O[index], index) : O[index]);
      }
    }
    result.length = index;
    return result;
  }
});

// 21.2.5.3 get RegExp.prototype.flags

var _flags = function () {
  var that = _anObject(this);
  var result = '';
  if (that.global) result += 'g';
  if (that.ignoreCase) result += 'i';
  if (that.multiline) result += 'm';
  if (that.unicode) result += 'u';
  if (that.sticky) result += 'y';
  return result;
};

// 21.2.5.3 get RegExp.prototype.flags()
if (_descriptors && /./g.flags != 'g') _objectDp.f(RegExp.prototype, 'flags', {
  configurable: true,
  get: _flags
});

var TO_STRING = 'toString';
var $toString = /./[TO_STRING];

var define = function (fn) {
  _redefine(RegExp.prototype, TO_STRING, fn, true);
};

// 21.2.5.14 RegExp.prototype.toString()
if (_fails(function () { return $toString.call({ source: 'a', flags: 'b' }) != '/a/b'; })) {
  define(function toString() {
    var R = _anObject(this);
    return '/'.concat(R.source, '/',
      'flags' in R ? R.flags : !_descriptors && R instanceof RegExp ? _flags.call(R) : undefined);
  });
// FF44- RegExp#toString has a wrong name
} else if ($toString.name != TO_STRING) {
  define(function toString() {
    return $toString.call(this);
  });
}

var DateProto = Date.prototype;
var INVALID_DATE = 'Invalid Date';
var TO_STRING$1 = 'toString';
var $toString$1 = DateProto[TO_STRING$1];
var getTime = DateProto.getTime;
if (new Date(NaN) + '' != INVALID_DATE) {
  _redefine(DateProto, TO_STRING$1, function toString() {
    var value = getTime.call(this);
    // eslint-disable-next-line no-self-compare
    return value === value ? $toString$1.call(this) : INVALID_DATE;
  });
}

// 7.2.2 IsArray(argument)

var _isArray = Array.isArray || function isArray(arg) {
  return _cof(arg) == 'Array';
};

var SPECIES = _wks('species');

var _arraySpeciesConstructor = function (original) {
  var C;
  if (_isArray(original)) {
    C = original.constructor;
    // cross-realm fallback
    if (typeof C == 'function' && (C === Array || _isArray(C.prototype))) C = undefined;
    if (_isObject(C)) {
      C = C[SPECIES];
      if (C === null) C = undefined;
    }
  } return C === undefined ? Array : C;
};

// 9.4.2.3 ArraySpeciesCreate(originalArray, length)


var _arraySpeciesCreate = function (original, length) {
  return new (_arraySpeciesConstructor(original))(length);
};

// 0 -> Array#forEach
// 1 -> Array#map
// 2 -> Array#filter
// 3 -> Array#some
// 4 -> Array#every
// 5 -> Array#find
// 6 -> Array#findIndex





var _arrayMethods = function (TYPE, $create) {
  var IS_MAP = TYPE == 1;
  var IS_FILTER = TYPE == 2;
  var IS_SOME = TYPE == 3;
  var IS_EVERY = TYPE == 4;
  var IS_FIND_INDEX = TYPE == 6;
  var NO_HOLES = TYPE == 5 || IS_FIND_INDEX;
  var create = $create || _arraySpeciesCreate;
  return function ($this, callbackfn, that) {
    var O = _toObject($this);
    var self = _iobject(O);
    var f = _ctx(callbackfn, that, 3);
    var length = _toLength(self.length);
    var index = 0;
    var result = IS_MAP ? create($this, length) : IS_FILTER ? create($this, 0) : undefined;
    var val, res;
    for (;length > index; index++) if (NO_HOLES || index in self) {
      val = self[index];
      res = f(val, index, O);
      if (TYPE) {
        if (IS_MAP) result[index] = res;   // map
        else if (res) switch (TYPE) {
          case 3: return true;             // some
          case 5: return val;              // find
          case 6: return index;            // findIndex
          case 2: result.push(val);        // filter
        } else if (IS_EVERY) return false; // every
      }
    }
    return IS_FIND_INDEX ? -1 : IS_SOME || IS_EVERY ? IS_EVERY : result;
  };
};

var _strictMethod = function (method, arg) {
  return !!method && _fails(function () {
    // eslint-disable-next-line no-useless-call
    arg ? method.call(null, function () { /* empty */ }, 1) : method.call(null);
  });
};

var $filter = _arrayMethods(2);

_export(_export.P + _export.F * !_strictMethod([].filter, true), 'Array', {
  // 22.1.3.7 / 15.4.4.20 Array.prototype.filter(callbackfn [, thisArg])
  filter: function filter(callbackfn /* , thisArg */) {
    return $filter(this, callbackfn, arguments[1]);
  }
});

// most Object methods by ES6 should accept primitives



var _objectSap = function (KEY, exec) {
  var fn = (_core.Object || {})[KEY] || Object[KEY];
  var exp = {};
  exp[KEY] = exec(fn);
  _export(_export.S + _export.F * _fails(function () { fn(1); }), 'Object', exp);
};

// 19.1.2.14 Object.keys(O)



_objectSap('keys', function () {
  return function keys(it) {
    return _objectKeys(_toObject(it));
  };
});

// 19.1.2.4 / 15.2.3.6 Object.defineProperty(O, P, Attributes)
_export(_export.S + _export.F * !_descriptors, 'Object', { defineProperty: _objectDp.f });

var f$1 = _wks;

var _wksExt = {
	f: f$1
};

var defineProperty = _objectDp.f;
var _wksDefine = function (name) {
  var $Symbol = _core.Symbol || (_core.Symbol = _global.Symbol || {});
  if (name.charAt(0) != '_' && !(name in $Symbol)) defineProperty($Symbol, name, { value: _wksExt.f(name) });
};

_wksDefine('asyncIterator');

var _meta = createCommonjsModule(function (module) {
var META = _uid('meta');


var setDesc = _objectDp.f;
var id = 0;
var isExtensible = Object.isExtensible || function () {
  return true;
};
var FREEZE = !_fails(function () {
  return isExtensible(Object.preventExtensions({}));
});
var setMeta = function (it) {
  setDesc(it, META, { value: {
    i: 'O' + ++id, // object ID
    w: {}          // weak collections IDs
  } });
};
var fastKey = function (it, create) {
  // return primitive with prefix
  if (!_isObject(it)) return typeof it == 'symbol' ? it : (typeof it == 'string' ? 'S' : 'P') + it;
  if (!_has(it, META)) {
    // can't set metadata to uncaught frozen object
    if (!isExtensible(it)) return 'F';
    // not necessary to add metadata
    if (!create) return 'E';
    // add missing metadata
    setMeta(it);
  // return object ID
  } return it[META].i;
};
var getWeak = function (it, create) {
  if (!_has(it, META)) {
    // can't set metadata to uncaught frozen object
    if (!isExtensible(it)) return true;
    // not necessary to add metadata
    if (!create) return false;
    // add missing metadata
    setMeta(it);
  // return hash weak collections IDs
  } return it[META].w;
};
// add metadata on freeze-family methods calling
var onFreeze = function (it) {
  if (FREEZE && meta.NEED && isExtensible(it) && !_has(it, META)) setMeta(it);
  return it;
};
var meta = module.exports = {
  KEY: META,
  NEED: false,
  fastKey: fastKey,
  getWeak: getWeak,
  onFreeze: onFreeze
};
});
var _meta_1 = _meta.KEY;
var _meta_2 = _meta.NEED;
var _meta_3 = _meta.fastKey;
var _meta_4 = _meta.getWeak;
var _meta_5 = _meta.onFreeze;

var f$2 = Object.getOwnPropertySymbols;

var _objectGops = {
	f: f$2
};

var f$3 = {}.propertyIsEnumerable;

var _objectPie = {
	f: f$3
};

// all enumerable object keys, includes symbols



var _enumKeys = function (it) {
  var result = _objectKeys(it);
  var getSymbols = _objectGops.f;
  if (getSymbols) {
    var symbols = getSymbols(it);
    var isEnum = _objectPie.f;
    var i = 0;
    var key;
    while (symbols.length > i) if (isEnum.call(it, key = symbols[i++])) result.push(key);
  } return result;
};

// 19.1.2.7 / 15.2.3.4 Object.getOwnPropertyNames(O)

var hiddenKeys = _enumBugKeys.concat('length', 'prototype');

var f$4 = Object.getOwnPropertyNames || function getOwnPropertyNames(O) {
  return _objectKeysInternal(O, hiddenKeys);
};

var _objectGopn = {
	f: f$4
};

// fallback for IE11 buggy Object.getOwnPropertyNames with iframe and window

var gOPN = _objectGopn.f;
var toString$1 = {}.toString;

var windowNames = typeof window == 'object' && window && Object.getOwnPropertyNames
  ? Object.getOwnPropertyNames(window) : [];

var getWindowNames = function (it) {
  try {
    return gOPN(it);
  } catch (e) {
    return windowNames.slice();
  }
};

var f$5 = function getOwnPropertyNames(it) {
  return windowNames && toString$1.call(it) == '[object Window]' ? getWindowNames(it) : gOPN(_toIobject(it));
};

var _objectGopnExt = {
	f: f$5
};

var gOPD = Object.getOwnPropertyDescriptor;

var f$6 = _descriptors ? gOPD : function getOwnPropertyDescriptor(O, P) {
  O = _toIobject(O);
  P = _toPrimitive(P, true);
  if (_ie8DomDefine) try {
    return gOPD(O, P);
  } catch (e) { /* empty */ }
  if (_has(O, P)) return _propertyDesc(!_objectPie.f.call(O, P), O[P]);
};

var _objectGopd = {
	f: f$6
};

// ECMAScript 6 symbols shim





var META = _meta.KEY;



















var gOPD$1 = _objectGopd.f;
var dP$1 = _objectDp.f;
var gOPN$1 = _objectGopnExt.f;
var $Symbol = _global.Symbol;
var $JSON = _global.JSON;
var _stringify = $JSON && $JSON.stringify;
var PROTOTYPE$2 = 'prototype';
var HIDDEN = _wks('_hidden');
var TO_PRIMITIVE = _wks('toPrimitive');
var isEnum = {}.propertyIsEnumerable;
var SymbolRegistry = _shared('symbol-registry');
var AllSymbols = _shared('symbols');
var OPSymbols = _shared('op-symbols');
var ObjectProto$1 = Object[PROTOTYPE$2];
var USE_NATIVE = typeof $Symbol == 'function';
var QObject = _global.QObject;
// Don't use setters in Qt Script, https://github.com/zloirock/core-js/issues/173
var setter = !QObject || !QObject[PROTOTYPE$2] || !QObject[PROTOTYPE$2].findChild;

// fallback for old Android, https://code.google.com/p/v8/issues/detail?id=687
var setSymbolDesc = _descriptors && _fails(function () {
  return _objectCreate(dP$1({}, 'a', {
    get: function () { return dP$1(this, 'a', { value: 7 }).a; }
  })).a != 7;
}) ? function (it, key, D) {
  var protoDesc = gOPD$1(ObjectProto$1, key);
  if (protoDesc) delete ObjectProto$1[key];
  dP$1(it, key, D);
  if (protoDesc && it !== ObjectProto$1) dP$1(ObjectProto$1, key, protoDesc);
} : dP$1;

var wrap = function (tag) {
  var sym = AllSymbols[tag] = _objectCreate($Symbol[PROTOTYPE$2]);
  sym._k = tag;
  return sym;
};

var isSymbol = USE_NATIVE && typeof $Symbol.iterator == 'symbol' ? function (it) {
  return typeof it == 'symbol';
} : function (it) {
  return it instanceof $Symbol;
};

var $defineProperty = function defineProperty(it, key, D) {
  if (it === ObjectProto$1) $defineProperty(OPSymbols, key, D);
  _anObject(it);
  key = _toPrimitive(key, true);
  _anObject(D);
  if (_has(AllSymbols, key)) {
    if (!D.enumerable) {
      if (!_has(it, HIDDEN)) dP$1(it, HIDDEN, _propertyDesc(1, {}));
      it[HIDDEN][key] = true;
    } else {
      if (_has(it, HIDDEN) && it[HIDDEN][key]) it[HIDDEN][key] = false;
      D = _objectCreate(D, { enumerable: _propertyDesc(0, false) });
    } return setSymbolDesc(it, key, D);
  } return dP$1(it, key, D);
};
var $defineProperties = function defineProperties(it, P) {
  _anObject(it);
  var keys = _enumKeys(P = _toIobject(P));
  var i = 0;
  var l = keys.length;
  var key;
  while (l > i) $defineProperty(it, key = keys[i++], P[key]);
  return it;
};
var $create = function create(it, P) {
  return P === undefined ? _objectCreate(it) : $defineProperties(_objectCreate(it), P);
};
var $propertyIsEnumerable = function propertyIsEnumerable(key) {
  var E = isEnum.call(this, key = _toPrimitive(key, true));
  if (this === ObjectProto$1 && _has(AllSymbols, key) && !_has(OPSymbols, key)) return false;
  return E || !_has(this, key) || !_has(AllSymbols, key) || _has(this, HIDDEN) && this[HIDDEN][key] ? E : true;
};
var $getOwnPropertyDescriptor = function getOwnPropertyDescriptor(it, key) {
  it = _toIobject(it);
  key = _toPrimitive(key, true);
  if (it === ObjectProto$1 && _has(AllSymbols, key) && !_has(OPSymbols, key)) return;
  var D = gOPD$1(it, key);
  if (D && _has(AllSymbols, key) && !(_has(it, HIDDEN) && it[HIDDEN][key])) D.enumerable = true;
  return D;
};
var $getOwnPropertyNames = function getOwnPropertyNames(it) {
  var names = gOPN$1(_toIobject(it));
  var result = [];
  var i = 0;
  var key;
  while (names.length > i) {
    if (!_has(AllSymbols, key = names[i++]) && key != HIDDEN && key != META) result.push(key);
  } return result;
};
var $getOwnPropertySymbols = function getOwnPropertySymbols(it) {
  var IS_OP = it === ObjectProto$1;
  var names = gOPN$1(IS_OP ? OPSymbols : _toIobject(it));
  var result = [];
  var i = 0;
  var key;
  while (names.length > i) {
    if (_has(AllSymbols, key = names[i++]) && (IS_OP ? _has(ObjectProto$1, key) : true)) result.push(AllSymbols[key]);
  } return result;
};

// 19.4.1.1 Symbol([description])
if (!USE_NATIVE) {
  $Symbol = function Symbol() {
    if (this instanceof $Symbol) throw TypeError('Symbol is not a constructor!');
    var tag = _uid(arguments.length > 0 ? arguments[0] : undefined);
    var $set = function (value) {
      if (this === ObjectProto$1) $set.call(OPSymbols, value);
      if (_has(this, HIDDEN) && _has(this[HIDDEN], tag)) this[HIDDEN][tag] = false;
      setSymbolDesc(this, tag, _propertyDesc(1, value));
    };
    if (_descriptors && setter) setSymbolDesc(ObjectProto$1, tag, { configurable: true, set: $set });
    return wrap(tag);
  };
  _redefine($Symbol[PROTOTYPE$2], 'toString', function toString() {
    return this._k;
  });

  _objectGopd.f = $getOwnPropertyDescriptor;
  _objectDp.f = $defineProperty;
  _objectGopn.f = _objectGopnExt.f = $getOwnPropertyNames;
  _objectPie.f = $propertyIsEnumerable;
  _objectGops.f = $getOwnPropertySymbols;

  if (_descriptors && !_library) {
    _redefine(ObjectProto$1, 'propertyIsEnumerable', $propertyIsEnumerable, true);
  }

  _wksExt.f = function (name) {
    return wrap(_wks(name));
  };
}

_export(_export.G + _export.W + _export.F * !USE_NATIVE, { Symbol: $Symbol });

for (var es6Symbols = (
  // 19.4.2.2, 19.4.2.3, 19.4.2.4, 19.4.2.6, 19.4.2.8, 19.4.2.9, 19.4.2.10, 19.4.2.11, 19.4.2.12, 19.4.2.13, 19.4.2.14
  'hasInstance,isConcatSpreadable,iterator,match,replace,search,species,split,toPrimitive,toStringTag,unscopables'
).split(','), j = 0; es6Symbols.length > j;)_wks(es6Symbols[j++]);

for (var wellKnownSymbols = _objectKeys(_wks.store), k = 0; wellKnownSymbols.length > k;) _wksDefine(wellKnownSymbols[k++]);

_export(_export.S + _export.F * !USE_NATIVE, 'Symbol', {
  // 19.4.2.1 Symbol.for(key)
  'for': function (key) {
    return _has(SymbolRegistry, key += '')
      ? SymbolRegistry[key]
      : SymbolRegistry[key] = $Symbol(key);
  },
  // 19.4.2.5 Symbol.keyFor(sym)
  keyFor: function keyFor(sym) {
    if (!isSymbol(sym)) throw TypeError(sym + ' is not a symbol!');
    for (var key in SymbolRegistry) if (SymbolRegistry[key] === sym) return key;
  },
  useSetter: function () { setter = true; },
  useSimple: function () { setter = false; }
});

_export(_export.S + _export.F * !USE_NATIVE, 'Object', {
  // 19.1.2.2 Object.create(O [, Properties])
  create: $create,
  // 19.1.2.4 Object.defineProperty(O, P, Attributes)
  defineProperty: $defineProperty,
  // 19.1.2.3 Object.defineProperties(O, Properties)
  defineProperties: $defineProperties,
  // 19.1.2.6 Object.getOwnPropertyDescriptor(O, P)
  getOwnPropertyDescriptor: $getOwnPropertyDescriptor,
  // 19.1.2.7 Object.getOwnPropertyNames(O)
  getOwnPropertyNames: $getOwnPropertyNames,
  // 19.1.2.8 Object.getOwnPropertySymbols(O)
  getOwnPropertySymbols: $getOwnPropertySymbols
});

// 24.3.2 JSON.stringify(value [, replacer [, space]])
$JSON && _export(_export.S + _export.F * (!USE_NATIVE || _fails(function () {
  var S = $Symbol();
  // MS Edge converts symbol values to JSON as {}
  // WebKit converts symbol values to JSON as null
  // V8 throws on boxed symbols
  return _stringify([S]) != '[null]' || _stringify({ a: S }) != '{}' || _stringify(Object(S)) != '{}';
})), 'JSON', {
  stringify: function stringify(it) {
    var args = [it];
    var i = 1;
    var replacer, $replacer;
    while (arguments.length > i) args.push(arguments[i++]);
    $replacer = replacer = args[1];
    if (!_isObject(replacer) && it === undefined || isSymbol(it)) return; // IE8 returns string on undefined
    if (!_isArray(replacer)) replacer = function (key, value) {
      if (typeof $replacer == 'function') value = $replacer.call(this, key, value);
      if (!isSymbol(value)) return value;
    };
    args[1] = replacer;
    return _stringify.apply($JSON, args);
  }
});

// 19.4.3.4 Symbol.prototype[@@toPrimitive](hint)
$Symbol[PROTOTYPE$2][TO_PRIMITIVE] || _hide($Symbol[PROTOTYPE$2], TO_PRIMITIVE, $Symbol[PROTOTYPE$2].valueOf);
// 19.4.3.5 Symbol.prototype[@@toStringTag]
_setToStringTag($Symbol, 'Symbol');
// 20.2.1.9 Math[@@toStringTag]
_setToStringTag(Math, 'Math', true);
// 24.3.3 JSON[@@toStringTag]
_setToStringTag(_global.JSON, 'JSON', true);

// 22.1.2.2 / 15.4.3.2 Array.isArray(arg)


_export(_export.S, 'Array', { isArray: _isArray });

// 22.1.3.31 Array.prototype[@@unscopables]
var UNSCOPABLES = _wks('unscopables');
var ArrayProto$1 = Array.prototype;
if (ArrayProto$1[UNSCOPABLES] == undefined) _hide(ArrayProto$1, UNSCOPABLES, {});
var _addToUnscopables = function (key) {
  ArrayProto$1[UNSCOPABLES][key] = true;
};

var _iterStep = function (done, value) {
  return { value: value, done: !!done };
};

// 22.1.3.4 Array.prototype.entries()
// 22.1.3.13 Array.prototype.keys()
// 22.1.3.29 Array.prototype.values()
// 22.1.3.30 Array.prototype[@@iterator]()
var es6_array_iterator = _iterDefine(Array, 'Array', function (iterated, kind) {
  this._t = _toIobject(iterated); // target
  this._i = 0;                   // next index
  this._k = kind;                // kind
// 22.1.5.2.1 %ArrayIteratorPrototype%.next()
}, function () {
  var O = this._t;
  var kind = this._k;
  var index = this._i++;
  if (!O || index >= O.length) {
    this._t = undefined;
    return _iterStep(1);
  }
  if (kind == 'keys') return _iterStep(0, index);
  if (kind == 'values') return _iterStep(0, O[index]);
  return _iterStep(0, [index, O[index]]);
}, 'values');

// argumentsList[@@iterator] is %ArrayProto_values% (9.4.4.6, 9.4.4.7)
_iterators.Arguments = _iterators.Array;

_addToUnscopables('keys');
_addToUnscopables('values');
_addToUnscopables('entries');

var isEnum$1 = _objectPie.f;
var _objectToArray = function (isEntries) {
  return function (it) {
    var O = _toIobject(it);
    var keys = _objectKeys(O);
    var length = keys.length;
    var i = 0;
    var result = [];
    var key;
    while (length > i) if (isEnum$1.call(O, key = keys[i++])) {
      result.push(isEntries ? [key, O[key]] : O[key]);
    } return result;
  };
};

// https://github.com/tc39/proposal-object-values-entries

var $entries = _objectToArray(true);

_export(_export.S, 'Object', {
  entries: function entries(it) {
    return $entries(it);
  }
});

var ITERATOR$4 = _wks('iterator');
var TO_STRING_TAG = _wks('toStringTag');
var ArrayValues = _iterators.Array;

var DOMIterables = {
  CSSRuleList: true, // TODO: Not spec compliant, should be false.
  CSSStyleDeclaration: false,
  CSSValueList: false,
  ClientRectList: false,
  DOMRectList: false,
  DOMStringList: false,
  DOMTokenList: true,
  DataTransferItemList: false,
  FileList: false,
  HTMLAllCollection: false,
  HTMLCollection: false,
  HTMLFormElement: false,
  HTMLSelectElement: false,
  MediaList: true, // TODO: Not spec compliant, should be false.
  MimeTypeArray: false,
  NamedNodeMap: false,
  NodeList: true,
  PaintRequestList: false,
  Plugin: false,
  PluginArray: false,
  SVGLengthList: false,
  SVGNumberList: false,
  SVGPathSegList: false,
  SVGPointList: false,
  SVGStringList: false,
  SVGTransformList: false,
  SourceBufferList: false,
  StyleSheetList: true, // TODO: Not spec compliant, should be false.
  TextTrackCueList: false,
  TextTrackList: false,
  TouchList: false
};

for (var collections = _objectKeys(DOMIterables), i = 0; i < collections.length; i++) {
  var NAME = collections[i];
  var explicit = DOMIterables[NAME];
  var Collection = _global[NAME];
  var proto = Collection && Collection.prototype;
  var key;
  if (proto) {
    if (!proto[ITERATOR$4]) _hide(proto, ITERATOR$4, ArrayValues);
    if (!proto[TO_STRING_TAG]) _hide(proto, TO_STRING_TAG, NAME);
    _iterators[NAME] = ArrayValues;
    if (explicit) for (key in es6_array_iterator) if (!proto[key]) _redefine(proto, key, es6_array_iterator[key], true);
  }
}

var $forEach = _arrayMethods(0);
var STRICT = _strictMethod([].forEach, true);

_export(_export.P + _export.F * !STRICT, 'Array', {
  // 22.1.3.10 / 15.4.4.18 Array.prototype.forEach(callbackfn [, thisArg])
  forEach: function forEach(callbackfn /* , thisArg */) {
    return $forEach(this, callbackfn, arguments[1]);
  }
});

var global$1 = (typeof global !== "undefined" ? global :
            typeof self !== "undefined" ? self :
            typeof window !== "undefined" ? window : {});

var lookup = [];
var revLookup = [];
var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array;
var inited = false;
function init () {
  inited = true;
  var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  for (var i = 0, len = code.length; i < len; ++i) {
    lookup[i] = code[i];
    revLookup[code.charCodeAt(i)] = i;
  }

  revLookup['-'.charCodeAt(0)] = 62;
  revLookup['_'.charCodeAt(0)] = 63;
}

function toByteArray (b64) {
  if (!inited) {
    init();
  }
  var i, j, l, tmp, placeHolders, arr;
  var len = b64.length;

  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4')
  }

  // the number of equal signs (place holders)
  // if there are two placeholders, than the two characters before it
  // represent one byte
  // if there is only one, then the three characters before it represent 2 bytes
  // this is just a cheap hack to not do indexOf twice
  placeHolders = b64[len - 2] === '=' ? 2 : b64[len - 1] === '=' ? 1 : 0;

  // base64 is 4/3 + up to two characters of the original data
  arr = new Arr(len * 3 / 4 - placeHolders);

  // if there are placeholders, only get up to the last complete 4 chars
  l = placeHolders > 0 ? len - 4 : len;

  var L = 0;

  for (i = 0, j = 0; i < l; i += 4, j += 3) {
    tmp = (revLookup[b64.charCodeAt(i)] << 18) | (revLookup[b64.charCodeAt(i + 1)] << 12) | (revLookup[b64.charCodeAt(i + 2)] << 6) | revLookup[b64.charCodeAt(i + 3)];
    arr[L++] = (tmp >> 16) & 0xFF;
    arr[L++] = (tmp >> 8) & 0xFF;
    arr[L++] = tmp & 0xFF;
  }

  if (placeHolders === 2) {
    tmp = (revLookup[b64.charCodeAt(i)] << 2) | (revLookup[b64.charCodeAt(i + 1)] >> 4);
    arr[L++] = tmp & 0xFF;
  } else if (placeHolders === 1) {
    tmp = (revLookup[b64.charCodeAt(i)] << 10) | (revLookup[b64.charCodeAt(i + 1)] << 4) | (revLookup[b64.charCodeAt(i + 2)] >> 2);
    arr[L++] = (tmp >> 8) & 0xFF;
    arr[L++] = tmp & 0xFF;
  }

  return arr
}

function tripletToBase64 (num) {
  return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F]
}

function encodeChunk (uint8, start, end) {
  var tmp;
  var output = [];
  for (var i = start; i < end; i += 3) {
    tmp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2]);
    output.push(tripletToBase64(tmp));
  }
  return output.join('')
}

function fromByteArray (uint8) {
  if (!inited) {
    init();
  }
  var tmp;
  var len = uint8.length;
  var extraBytes = len % 3; // if we have 1 byte left, pad 2 bytes
  var output = '';
  var parts = [];
  var maxChunkLength = 16383; // must be multiple of 3

  // go through the array every three bytes, we'll deal with trailing stuff later
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)));
  }

  // pad the end with zeros, but make sure to not forget the extra bytes
  if (extraBytes === 1) {
    tmp = uint8[len - 1];
    output += lookup[tmp >> 2];
    output += lookup[(tmp << 4) & 0x3F];
    output += '==';
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + (uint8[len - 1]);
    output += lookup[tmp >> 10];
    output += lookup[(tmp >> 4) & 0x3F];
    output += lookup[(tmp << 2) & 0x3F];
    output += '=';
  }

  parts.push(output);

  return parts.join('')
}

var base64 = /*#__PURE__*/Object.freeze({
    toByteArray: toByteArray,
    fromByteArray: fromByteArray
});

function read (buffer, offset, isLE, mLen, nBytes) {
  var e, m;
  var eLen = nBytes * 8 - mLen - 1;
  var eMax = (1 << eLen) - 1;
  var eBias = eMax >> 1;
  var nBits = -7;
  var i = isLE ? (nBytes - 1) : 0;
  var d = isLE ? -1 : 1;
  var s = buffer[offset + i];

  i += d;

  e = s & ((1 << (-nBits)) - 1);
  s >>= (-nBits);
  nBits += eLen;
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1);
  e >>= (-nBits);
  nBits += mLen;
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias;
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen);
    e = e - eBias;
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

function write (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c;
  var eLen = nBytes * 8 - mLen - 1;
  var eMax = (1 << eLen) - 1;
  var eBias = eMax >> 1;
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0);
  var i = isLE ? 0 : (nBytes - 1);
  var d = isLE ? 1 : -1;
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0;

  value = Math.abs(value);

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0;
    e = eMax;
  } else {
    e = Math.floor(Math.log(value) / Math.LN2);
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--;
      c *= 2;
    }
    if (e + eBias >= 1) {
      value += rt / c;
    } else {
      value += rt * Math.pow(2, 1 - eBias);
    }
    if (value * c >= 2) {
      e++;
      c /= 2;
    }

    if (e + eBias >= eMax) {
      m = 0;
      e = eMax;
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen);
      e = e + eBias;
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
      e = 0;
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m;
  eLen += mLen;
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128;
}

var toString$2 = {}.toString;

var isArray = Array.isArray || function (arr) {
  return toString$2.call(arr) == '[object Array]';
};

var INSPECT_MAX_BYTES = 50;

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * Due to various browser bugs, sometimes the Object implementation will be used even
 * when the browser supports typed arrays.
 *
 * Note:
 *
 *   - Firefox 4-29 lacks support for adding new properties to `Uint8Array` instances,
 *     See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
 *
 *   - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
 *
 *   - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
 *     incorrect length in some situations.

 * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they
 * get the Object implementation, which is slower but behaves correctly.
 */
Buffer.TYPED_ARRAY_SUPPORT = global$1.TYPED_ARRAY_SUPPORT !== undefined
  ? global$1.TYPED_ARRAY_SUPPORT
  : true;

function kMaxLength () {
  return Buffer.TYPED_ARRAY_SUPPORT
    ? 0x7fffffff
    : 0x3fffffff
}

function createBuffer (that, length) {
  if (kMaxLength() < length) {
    throw new RangeError('Invalid typed array length')
  }
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    that = new Uint8Array(length);
    that.__proto__ = Buffer.prototype;
  } else {
    // Fallback: Return an object instance of the Buffer class
    if (that === null) {
      that = new Buffer(length);
    }
    that.length = length;
  }

  return that
}

/**
 * The Buffer constructor returns instances of `Uint8Array` that have their
 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
 * returns a single octet.
 *
 * The `Uint8Array` prototype remains unmodified.
 */

function Buffer (arg, encodingOrOffset, length) {
  if (!Buffer.TYPED_ARRAY_SUPPORT && !(this instanceof Buffer)) {
    return new Buffer(arg, encodingOrOffset, length)
  }

  // Common case.
  if (typeof arg === 'number') {
    if (typeof encodingOrOffset === 'string') {
      throw new Error(
        'If encoding is specified then the first argument must be a string'
      )
    }
    return allocUnsafe(this, arg)
  }
  return from(this, arg, encodingOrOffset, length)
}

Buffer.poolSize = 8192; // not used by this implementation

// TODO: Legacy, not needed anymore. Remove in next major version.
Buffer._augment = function (arr) {
  arr.__proto__ = Buffer.prototype;
  return arr
};

function from (that, value, encodingOrOffset, length) {
  if (typeof value === 'number') {
    throw new TypeError('"value" argument must not be a number')
  }

  if (typeof ArrayBuffer !== 'undefined' && value instanceof ArrayBuffer) {
    return fromArrayBuffer(that, value, encodingOrOffset, length)
  }

  if (typeof value === 'string') {
    return fromString(that, value, encodingOrOffset)
  }

  return fromObject(that, value)
}

/**
 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
 * if value is a number.
 * Buffer.from(str[, encoding])
 * Buffer.from(array)
 * Buffer.from(buffer)
 * Buffer.from(arrayBuffer[, byteOffset[, length]])
 **/
Buffer.from = function (value, encodingOrOffset, length) {
  return from(null, value, encodingOrOffset, length)
};

if (Buffer.TYPED_ARRAY_SUPPORT) {
  Buffer.prototype.__proto__ = Uint8Array.prototype;
  Buffer.__proto__ = Uint8Array;
}

function assertSize (size) {
  if (typeof size !== 'number') {
    throw new TypeError('"size" argument must be a number')
  } else if (size < 0) {
    throw new RangeError('"size" argument must not be negative')
  }
}

function alloc (that, size, fill, encoding) {
  assertSize(size);
  if (size <= 0) {
    return createBuffer(that, size)
  }
  if (fill !== undefined) {
    // Only pay attention to encoding if it's a string. This
    // prevents accidentally sending in a number that would
    // be interpretted as a start offset.
    return typeof encoding === 'string'
      ? createBuffer(that, size).fill(fill, encoding)
      : createBuffer(that, size).fill(fill)
  }
  return createBuffer(that, size)
}

/**
 * Creates a new filled Buffer instance.
 * alloc(size[, fill[, encoding]])
 **/
Buffer.alloc = function (size, fill, encoding) {
  return alloc(null, size, fill, encoding)
};

function allocUnsafe (that, size) {
  assertSize(size);
  that = createBuffer(that, size < 0 ? 0 : checked(size) | 0);
  if (!Buffer.TYPED_ARRAY_SUPPORT) {
    for (var i = 0; i < size; ++i) {
      that[i] = 0;
    }
  }
  return that
}

/**
 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
 * */
Buffer.allocUnsafe = function (size) {
  return allocUnsafe(null, size)
};
/**
 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
 */
Buffer.allocUnsafeSlow = function (size) {
  return allocUnsafe(null, size)
};

function fromString (that, string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') {
    encoding = 'utf8';
  }

  if (!Buffer.isEncoding(encoding)) {
    throw new TypeError('"encoding" must be a valid string encoding')
  }

  var length = byteLength(string, encoding) | 0;
  that = createBuffer(that, length);

  var actual = that.write(string, encoding);

  if (actual !== length) {
    // Writing a hex string, for example, that contains invalid characters will
    // cause everything after the first invalid character to be ignored. (e.g.
    // 'abxxcd' will be treated as 'ab')
    that = that.slice(0, actual);
  }

  return that
}

function fromArrayLike (that, array) {
  var length = array.length < 0 ? 0 : checked(array.length) | 0;
  that = createBuffer(that, length);
  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255;
  }
  return that
}

function fromArrayBuffer (that, array, byteOffset, length) {
  array.byteLength; // this throws if `array` is not a valid ArrayBuffer

  if (byteOffset < 0 || array.byteLength < byteOffset) {
    throw new RangeError('\'offset\' is out of bounds')
  }

  if (array.byteLength < byteOffset + (length || 0)) {
    throw new RangeError('\'length\' is out of bounds')
  }

  if (byteOffset === undefined && length === undefined) {
    array = new Uint8Array(array);
  } else if (length === undefined) {
    array = new Uint8Array(array, byteOffset);
  } else {
    array = new Uint8Array(array, byteOffset, length);
  }

  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    that = array;
    that.__proto__ = Buffer.prototype;
  } else {
    // Fallback: Return an object instance of the Buffer class
    that = fromArrayLike(that, array);
  }
  return that
}

function fromObject (that, obj) {
  if (internalIsBuffer(obj)) {
    var len = checked(obj.length) | 0;
    that = createBuffer(that, len);

    if (that.length === 0) {
      return that
    }

    obj.copy(that, 0, 0, len);
    return that
  }

  if (obj) {
    if ((typeof ArrayBuffer !== 'undefined' &&
        obj.buffer instanceof ArrayBuffer) || 'length' in obj) {
      if (typeof obj.length !== 'number' || isnan(obj.length)) {
        return createBuffer(that, 0)
      }
      return fromArrayLike(that, obj)
    }

    if (obj.type === 'Buffer' && isArray(obj.data)) {
      return fromArrayLike(that, obj.data)
    }
  }

  throw new TypeError('First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.')
}

function checked (length) {
  // Note: cannot use `length < kMaxLength()` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= kMaxLength()) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + kMaxLength().toString(16) + ' bytes')
  }
  return length | 0
}
Buffer.isBuffer = isBuffer;
function internalIsBuffer (b) {
  return !!(b != null && b._isBuffer)
}

Buffer.compare = function compare (a, b) {
  if (!internalIsBuffer(a) || !internalIsBuffer(b)) {
    throw new TypeError('Arguments must be Buffers')
  }

  if (a === b) return 0

  var x = a.length;
  var y = b.length;

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i];
      y = b[i];
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
};

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'latin1':
    case 'binary':
    case 'base64':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
};

Buffer.concat = function concat (list, length) {
  if (!isArray(list)) {
    throw new TypeError('"list" argument must be an Array of Buffers')
  }

  if (list.length === 0) {
    return Buffer.alloc(0)
  }

  var i;
  if (length === undefined) {
    length = 0;
    for (i = 0; i < list.length; ++i) {
      length += list[i].length;
    }
  }

  var buffer = Buffer.allocUnsafe(length);
  var pos = 0;
  for (i = 0; i < list.length; ++i) {
    var buf = list[i];
    if (!internalIsBuffer(buf)) {
      throw new TypeError('"list" argument must be an Array of Buffers')
    }
    buf.copy(buffer, pos);
    pos += buf.length;
  }
  return buffer
};

function byteLength (string, encoding) {
  if (internalIsBuffer(string)) {
    return string.length
  }
  if (typeof ArrayBuffer !== 'undefined' && typeof ArrayBuffer.isView === 'function' &&
      (ArrayBuffer.isView(string) || string instanceof ArrayBuffer)) {
    return string.byteLength
  }
  if (typeof string !== 'string') {
    string = '' + string;
  }

  var len = string.length;
  if (len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false;
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'latin1':
      case 'binary':
        return len
      case 'utf8':
      case 'utf-8':
      case undefined:
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) return utf8ToBytes(string).length // assume utf8
        encoding = ('' + encoding).toLowerCase();
        loweredCase = true;
    }
  }
}
Buffer.byteLength = byteLength;

function slowToString (encoding, start, end) {
  var loweredCase = false;

  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
  // property of a typed array.

  // This behaves neither like String nor Uint8Array in that we set start/end
  // to their upper/lower bounds if the value passed is out of range.
  // undefined is handled specially as per ECMA-262 6th Edition,
  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
  if (start === undefined || start < 0) {
    start = 0;
  }
  // Return early if start > this.length. Done here to prevent potential uint32
  // coercion fail below.
  if (start > this.length) {
    return ''
  }

  if (end === undefined || end > this.length) {
    end = this.length;
  }

  if (end <= 0) {
    return ''
  }

  // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
  end >>>= 0;
  start >>>= 0;

  if (end <= start) {
    return ''
  }

  if (!encoding) encoding = 'utf8';

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'latin1':
      case 'binary':
        return latin1Slice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase();
        loweredCase = true;
    }
  }
}

// The property is used by `Buffer.isBuffer` and `is-buffer` (in Safari 5-7) to detect
// Buffer instances.
Buffer.prototype._isBuffer = true;

function swap (b, n, m) {
  var i = b[n];
  b[n] = b[m];
  b[m] = i;
}

Buffer.prototype.swap16 = function swap16 () {
  var len = this.length;
  if (len % 2 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 16-bits')
  }
  for (var i = 0; i < len; i += 2) {
    swap(this, i, i + 1);
  }
  return this
};

Buffer.prototype.swap32 = function swap32 () {
  var len = this.length;
  if (len % 4 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 32-bits')
  }
  for (var i = 0; i < len; i += 4) {
    swap(this, i, i + 3);
    swap(this, i + 1, i + 2);
  }
  return this
};

Buffer.prototype.swap64 = function swap64 () {
  var len = this.length;
  if (len % 8 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 64-bits')
  }
  for (var i = 0; i < len; i += 8) {
    swap(this, i, i + 7);
    swap(this, i + 1, i + 6);
    swap(this, i + 2, i + 5);
    swap(this, i + 3, i + 4);
  }
  return this
};

Buffer.prototype.toString = function toString () {
  var length = this.length | 0;
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
};

Buffer.prototype.equals = function equals (b) {
  if (!internalIsBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
};

Buffer.prototype.inspect = function inspect () {
  var str = '';
  var max = INSPECT_MAX_BYTES;
  if (this.length > 0) {
    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ');
    if (this.length > max) str += ' ... ';
  }
  return '<Buffer ' + str + '>'
};

Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
  if (!internalIsBuffer(target)) {
    throw new TypeError('Argument must be a Buffer')
  }

  if (start === undefined) {
    start = 0;
  }
  if (end === undefined) {
    end = target ? target.length : 0;
  }
  if (thisStart === undefined) {
    thisStart = 0;
  }
  if (thisEnd === undefined) {
    thisEnd = this.length;
  }

  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
    throw new RangeError('out of range index')
  }

  if (thisStart >= thisEnd && start >= end) {
    return 0
  }
  if (thisStart >= thisEnd) {
    return -1
  }
  if (start >= end) {
    return 1
  }

  start >>>= 0;
  end >>>= 0;
  thisStart >>>= 0;
  thisEnd >>>= 0;

  if (this === target) return 0

  var x = thisEnd - thisStart;
  var y = end - start;
  var len = Math.min(x, y);

  var thisCopy = this.slice(thisStart, thisEnd);
  var targetCopy = target.slice(start, end);

  for (var i = 0; i < len; ++i) {
    if (thisCopy[i] !== targetCopy[i]) {
      x = thisCopy[i];
      y = targetCopy[i];
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
};

// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
//
// Arguments:
// - buffer - a Buffer to search
// - val - a string, Buffer, or number
// - byteOffset - an index into `buffer`; will be clamped to an int32
// - encoding - an optional encoding, relevant is val is a string
// - dir - true for indexOf, false for lastIndexOf
function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
  // Empty buffer means no match
  if (buffer.length === 0) return -1

  // Normalize byteOffset
  if (typeof byteOffset === 'string') {
    encoding = byteOffset;
    byteOffset = 0;
  } else if (byteOffset > 0x7fffffff) {
    byteOffset = 0x7fffffff;
  } else if (byteOffset < -0x80000000) {
    byteOffset = -0x80000000;
  }
  byteOffset = +byteOffset;  // Coerce to Number.
  if (isNaN(byteOffset)) {
    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
    byteOffset = dir ? 0 : (buffer.length - 1);
  }

  // Normalize byteOffset: negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = buffer.length + byteOffset;
  if (byteOffset >= buffer.length) {
    if (dir) return -1
    else byteOffset = buffer.length - 1;
  } else if (byteOffset < 0) {
    if (dir) byteOffset = 0;
    else return -1
  }

  // Normalize val
  if (typeof val === 'string') {
    val = Buffer.from(val, encoding);
  }

  // Finally, search either indexOf (if dir is true) or lastIndexOf
  if (internalIsBuffer(val)) {
    // Special case: looking for empty string/buffer always fails
    if (val.length === 0) {
      return -1
    }
    return arrayIndexOf$1(buffer, val, byteOffset, encoding, dir)
  } else if (typeof val === 'number') {
    val = val & 0xFF; // Search for a byte value [0-255]
    if (Buffer.TYPED_ARRAY_SUPPORT &&
        typeof Uint8Array.prototype.indexOf === 'function') {
      if (dir) {
        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
      } else {
        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
      }
    }
    return arrayIndexOf$1(buffer, [ val ], byteOffset, encoding, dir)
  }

  throw new TypeError('val must be string, number or Buffer')
}

function arrayIndexOf$1 (arr, val, byteOffset, encoding, dir) {
  var indexSize = 1;
  var arrLength = arr.length;
  var valLength = val.length;

  if (encoding !== undefined) {
    encoding = String(encoding).toLowerCase();
    if (encoding === 'ucs2' || encoding === 'ucs-2' ||
        encoding === 'utf16le' || encoding === 'utf-16le') {
      if (arr.length < 2 || val.length < 2) {
        return -1
      }
      indexSize = 2;
      arrLength /= 2;
      valLength /= 2;
      byteOffset /= 2;
    }
  }

  function read (buf, i) {
    if (indexSize === 1) {
      return buf[i]
    } else {
      return buf.readUInt16BE(i * indexSize)
    }
  }

  var i;
  if (dir) {
    var foundIndex = -1;
    for (i = byteOffset; i < arrLength; i++) {
      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
        if (foundIndex === -1) foundIndex = i;
        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
      } else {
        if (foundIndex !== -1) i -= i - foundIndex;
        foundIndex = -1;
      }
    }
  } else {
    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength;
    for (i = byteOffset; i >= 0; i--) {
      var found = true;
      for (var j = 0; j < valLength; j++) {
        if (read(arr, i + j) !== read(val, j)) {
          found = false;
          break
        }
      }
      if (found) return i
    }
  }

  return -1
}

Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
  return this.indexOf(val, byteOffset, encoding) !== -1
};

Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
};

Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
};

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0;
  var remaining = buf.length - offset;
  if (!length) {
    length = remaining;
  } else {
    length = Number(length);
    if (length > remaining) {
      length = remaining;
    }
  }

  // must be an even number of digits
  var strLen = string.length;
  if (strLen % 2 !== 0) throw new TypeError('Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2;
  }
  for (var i = 0; i < length; ++i) {
    var parsed = parseInt(string.substr(i * 2, 2), 16);
    if (isNaN(parsed)) return i
    buf[offset + i] = parsed;
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function latin1Write (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8';
    length = this.length;
    offset = 0;
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset;
    length = this.length;
    offset = 0;
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset | 0;
    if (isFinite(length)) {
      length = length | 0;
      if (encoding === undefined) encoding = 'utf8';
    } else {
      encoding = length;
      length = undefined;
    }
  // legacy write(string, encoding, offset, length) - remove in v0.13
  } else {
    throw new Error(
      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
    )
  }

  var remaining = this.length - offset;
  if (length === undefined || length > remaining) length = remaining;

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('Attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8';

  var loweredCase = false;
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
        return asciiWrite(this, string, offset, length)

      case 'latin1':
      case 'binary':
        return latin1Write(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase();
        loweredCase = true;
    }
  }
};

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
};

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return fromByteArray(buf)
  } else {
    return fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  end = Math.min(buf.length, end);
  var res = [];

  var i = start;
  while (i < end) {
    var firstByte = buf[i];
    var codePoint = null;
    var bytesPerSequence = (firstByte > 0xEF) ? 4
      : (firstByte > 0xDF) ? 3
      : (firstByte > 0xBF) ? 2
      : 1;

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint;

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte;
          }
          break
        case 2:
          secondByte = buf[i + 1];
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F);
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint;
            }
          }
          break
        case 3:
          secondByte = buf[i + 1];
          thirdByte = buf[i + 2];
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F);
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint;
            }
          }
          break
        case 4:
          secondByte = buf[i + 1];
          thirdByte = buf[i + 2];
          fourthByte = buf[i + 3];
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F);
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint;
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD;
      bytesPerSequence = 1;
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000;
      res.push(codePoint >>> 10 & 0x3FF | 0xD800);
      codePoint = 0xDC00 | codePoint & 0x3FF;
    }

    res.push(codePoint);
    i += bytesPerSequence;
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000;

function decodeCodePointsArray (codePoints) {
  var len = codePoints.length;
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = '';
  var i = 0;
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    );
  }
  return res
}

function asciiSlice (buf, start, end) {
  var ret = '';
  end = Math.min(buf.length, end);

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i] & 0x7F);
  }
  return ret
}

function latin1Slice (buf, start, end) {
  var ret = '';
  end = Math.min(buf.length, end);

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i]);
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length;

  if (!start || start < 0) start = 0;
  if (!end || end < 0 || end > len) end = len;

  var out = '';
  for (var i = start; i < end; ++i) {
    out += toHex(buf[i]);
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end);
  var res = '';
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256);
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length;
  start = ~~start;
  end = end === undefined ? len : ~~end;

  if (start < 0) {
    start += len;
    if (start < 0) start = 0;
  } else if (start > len) {
    start = len;
  }

  if (end < 0) {
    end += len;
    if (end < 0) end = 0;
  } else if (end > len) {
    end = len;
  }

  if (end < start) end = start;

  var newBuf;
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    newBuf = this.subarray(start, end);
    newBuf.__proto__ = Buffer.prototype;
  } else {
    var sliceLen = end - start;
    newBuf = new Buffer(sliceLen, undefined);
    for (var i = 0; i < sliceLen; ++i) {
      newBuf[i] = this[i + start];
    }
  }

  return newBuf
};

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset | 0;
  byteLength = byteLength | 0;
  if (!noAssert) checkOffset(offset, byteLength, this.length);

  var val = this[offset];
  var mul = 1;
  var i = 0;
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul;
  }

  return val
};

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset | 0;
  byteLength = byteLength | 0;
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length);
  }

  var val = this[offset + --byteLength];
  var mul = 1;
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul;
  }

  return val
};

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length);
  return this[offset]
};

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length);
  return this[offset] | (this[offset + 1] << 8)
};

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length);
  return (this[offset] << 8) | this[offset + 1]
};

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length);

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
};

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length);

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
};

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset | 0;
  byteLength = byteLength | 0;
  if (!noAssert) checkOffset(offset, byteLength, this.length);

  var val = this[offset];
  var mul = 1;
  var i = 0;
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul;
  }
  mul *= 0x80;

  if (val >= mul) val -= Math.pow(2, 8 * byteLength);

  return val
};

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset | 0;
  byteLength = byteLength | 0;
  if (!noAssert) checkOffset(offset, byteLength, this.length);

  var i = byteLength;
  var mul = 1;
  var val = this[offset + --i];
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul;
  }
  mul *= 0x80;

  if (val >= mul) val -= Math.pow(2, 8 * byteLength);

  return val
};

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length);
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
};

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length);
  var val = this[offset] | (this[offset + 1] << 8);
  return (val & 0x8000) ? val | 0xFFFF0000 : val
};

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length);
  var val = this[offset + 1] | (this[offset] << 8);
  return (val & 0x8000) ? val | 0xFFFF0000 : val
};

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length);

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
};

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length);

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
};

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length);
  return read(this, offset, true, 23, 4)
};

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length);
  return read(this, offset, false, 23, 4)
};

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length);
  return read(this, offset, true, 52, 8)
};

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length);
  return read(this, offset, false, 52, 8)
};

function checkInt (buf, value, offset, ext, max, min) {
  if (!internalIsBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value;
  offset = offset | 0;
  byteLength = byteLength | 0;
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1;
    checkInt(this, value, offset, byteLength, maxBytes, 0);
  }

  var mul = 1;
  var i = 0;
  this[offset] = value & 0xFF;
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF;
  }

  return offset + byteLength
};

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value;
  offset = offset | 0;
  byteLength = byteLength | 0;
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1;
    checkInt(this, value, offset, byteLength, maxBytes, 0);
  }

  var i = byteLength - 1;
  var mul = 1;
  this[offset + i] = value & 0xFF;
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF;
  }

  return offset + byteLength
};

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0);
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value);
  this[offset] = (value & 0xff);
  return offset + 1
};

function objectWriteUInt16 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffff + value + 1;
  for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; ++i) {
    buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
      (littleEndian ? i : 1 - i) * 8;
  }
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0);
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff);
    this[offset + 1] = (value >>> 8);
  } else {
    objectWriteUInt16(this, value, offset, true);
  }
  return offset + 2
};

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0);
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8);
    this[offset + 1] = (value & 0xff);
  } else {
    objectWriteUInt16(this, value, offset, false);
  }
  return offset + 2
};

function objectWriteUInt32 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffffffff + value + 1;
  for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; ++i) {
    buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff;
  }
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0);
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset + 3] = (value >>> 24);
    this[offset + 2] = (value >>> 16);
    this[offset + 1] = (value >>> 8);
    this[offset] = (value & 0xff);
  } else {
    objectWriteUInt32(this, value, offset, true);
  }
  return offset + 4
};

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0);
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24);
    this[offset + 1] = (value >>> 16);
    this[offset + 2] = (value >>> 8);
    this[offset + 3] = (value & 0xff);
  } else {
    objectWriteUInt32(this, value, offset, false);
  }
  return offset + 4
};

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1);

    checkInt(this, value, offset, byteLength, limit - 1, -limit);
  }

  var i = 0;
  var mul = 1;
  var sub = 0;
  this[offset] = value & 0xFF;
  while (++i < byteLength && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
      sub = 1;
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF;
  }

  return offset + byteLength
};

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1);

    checkInt(this, value, offset, byteLength, limit - 1, -limit);
  }

  var i = byteLength - 1;
  var mul = 1;
  var sub = 0;
  this[offset + i] = value & 0xFF;
  while (--i >= 0 && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
      sub = 1;
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF;
  }

  return offset + byteLength
};

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80);
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value);
  if (value < 0) value = 0xff + value + 1;
  this[offset] = (value & 0xff);
  return offset + 1
};

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000);
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff);
    this[offset + 1] = (value >>> 8);
  } else {
    objectWriteUInt16(this, value, offset, true);
  }
  return offset + 2
};

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000);
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8);
    this[offset + 1] = (value & 0xff);
  } else {
    objectWriteUInt16(this, value, offset, false);
  }
  return offset + 2
};

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000);
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff);
    this[offset + 1] = (value >>> 8);
    this[offset + 2] = (value >>> 16);
    this[offset + 3] = (value >>> 24);
  } else {
    objectWriteUInt32(this, value, offset, true);
  }
  return offset + 4
};

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000);
  if (value < 0) value = 0xffffffff + value + 1;
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24);
    this[offset + 1] = (value >>> 16);
    this[offset + 2] = (value >>> 8);
    this[offset + 3] = (value & 0xff);
  } else {
    objectWriteUInt32(this, value, offset, false);
  }
  return offset + 4
};

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
  if (offset < 0) throw new RangeError('Index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38);
  }
  write(buf, value, offset, littleEndian, 23, 4);
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
};

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
};

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308);
  }
  write(buf, value, offset, littleEndian, 52, 8);
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
};

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
};

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!start) start = 0;
  if (!end && end !== 0) end = this.length;
  if (targetStart >= target.length) targetStart = target.length;
  if (!targetStart) targetStart = 0;
  if (end > 0 && end < start) end = start;

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length;
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start;
  }

  var len = end - start;
  var i;

  if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (i = len - 1; i >= 0; --i) {
      target[i + targetStart] = this[i + start];
    }
  } else if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
    // ascending copy from start
    for (i = 0; i < len; ++i) {
      target[i + targetStart] = this[i + start];
    }
  } else {
    Uint8Array.prototype.set.call(
      target,
      this.subarray(start, start + len),
      targetStart
    );
  }

  return len
};

// Usage:
//    buffer.fill(number[, offset[, end]])
//    buffer.fill(buffer[, offset[, end]])
//    buffer.fill(string[, offset[, end]][, encoding])
Buffer.prototype.fill = function fill (val, start, end, encoding) {
  // Handle string cases:
  if (typeof val === 'string') {
    if (typeof start === 'string') {
      encoding = start;
      start = 0;
      end = this.length;
    } else if (typeof end === 'string') {
      encoding = end;
      end = this.length;
    }
    if (val.length === 1) {
      var code = val.charCodeAt(0);
      if (code < 256) {
        val = code;
      }
    }
    if (encoding !== undefined && typeof encoding !== 'string') {
      throw new TypeError('encoding must be a string')
    }
    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
      throw new TypeError('Unknown encoding: ' + encoding)
    }
  } else if (typeof val === 'number') {
    val = val & 255;
  }

  // Invalid ranges are not set to a default, so can range check early.
  if (start < 0 || this.length < start || this.length < end) {
    throw new RangeError('Out of range index')
  }

  if (end <= start) {
    return this
  }

  start = start >>> 0;
  end = end === undefined ? this.length : end >>> 0;

  if (!val) val = 0;

  var i;
  if (typeof val === 'number') {
    for (i = start; i < end; ++i) {
      this[i] = val;
    }
  } else {
    var bytes = internalIsBuffer(val)
      ? val
      : utf8ToBytes(new Buffer(val, encoding).toString());
    var len = bytes.length;
    for (i = 0; i < end - start; ++i) {
      this[i + start] = bytes[i % len];
    }
  }

  return this
};

// HELPER FUNCTIONS
// ================

var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g;

function base64clean (str) {
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = stringtrim(str).replace(INVALID_BASE64_RE, '');
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '=';
  }
  return str
}

function stringtrim (str) {
  if (str.trim) return str.trim()
  return str.replace(/^\s+|\s+$/g, '')
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (string, units) {
  units = units || Infinity;
  var codePoint;
  var length = string.length;
  var leadSurrogate = null;
  var bytes = [];

  for (var i = 0; i < length; ++i) {
    codePoint = string.charCodeAt(i);

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
          continue
        }

        // valid lead
        leadSurrogate = codePoint;

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
        leadSurrogate = codePoint;
        continue
      }

      // valid surrogate pair
      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000;
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
    }

    leadSurrogate = null;

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint);
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      );
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      );
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      );
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = [];
  for (var i = 0; i < str.length; ++i) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF);
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo;
  var byteArray = [];
  for (var i = 0; i < str.length; ++i) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i);
    hi = c >> 8;
    lo = c % 256;
    byteArray.push(lo);
    byteArray.push(hi);
  }

  return byteArray
}


function base64ToBytes (str) {
  return toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; ++i) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i];
  }
  return i
}

function isnan (val) {
  return val !== val // eslint-disable-line no-self-compare
}


// the following is from is-buffer, also by Feross Aboukhadijeh and with same lisence
// The _isBuffer check is for Safari 5-7 support, because it's missing
// Object.prototype.constructor. Remove this eventually
function isBuffer(obj) {
  return obj != null && (!!obj._isBuffer || isFastBuffer(obj) || isSlowBuffer(obj))
}

function isFastBuffer (obj) {
  return !!obj.constructor && typeof obj.constructor.isBuffer === 'function' && obj.constructor.isBuffer(obj)
}

// For Node v0.10 support. Remove this eventually.
function isSlowBuffer (obj) {
  return typeof obj.readFloatLE === 'function' && typeof obj.slice === 'function' && isFastBuffer(obj.slice(0, 0))
}

// shim for using process in browser
// based off https://github.com/defunctzombie/node-process/blob/master/browser.js

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
var cachedSetTimeout = defaultSetTimout;
var cachedClearTimeout = defaultClearTimeout;
if (typeof global$1.setTimeout === 'function') {
    cachedSetTimeout = setTimeout;
}
if (typeof global$1.clearTimeout === 'function') {
    cachedClearTimeout = clearTimeout;
}

function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}
function nextTick(fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
}
// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};

// from https://github.com/kumavis/browser-process-hrtime/blob/master/index.js
var performance = global$1.performance || {};
var performanceNow =
  performance.now        ||
  performance.mozNow     ||
  performance.msNow      ||
  performance.oNow       ||
  performance.webkitNow  ||
  function(){ return (new Date()).getTime() };

require("core-js/modules/es6.array.is-array");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.addConstants = addConstants;
exports.addJimpMethods = addJimpMethods;
exports.jimpEvMethod = jimpEvMethod;
exports.jimpEvChange = jimpEvChange;
Object.defineProperty(exports, "addType", {
  enumerable: true,
  get: function get() {
    return MIME.addType;
  }
});
exports.default = void 0;

require("core-js/modules/es6.function.bind");

require("core-js/modules/es6.reflect.construct");

require("core-js/modules/es7.symbol.async-iterator");

require("core-js/modules/es6.symbol");

require("core-js/modules/es6.regexp.replace");

require("core-js/modules/es6.number.constructor");

require("core-js/modules/es6.array.iterator");

require("core-js/modules/es7.object.entries");

require("core-js/modules/web.dom.iterable");

require("core-js/modules/es6.array.for-each");

require("core-js/modules/es6.object.define-property");

require("core-js/modules/es6.object.create");

require("core-js/modules/es6.object.set-prototype-of");

require("core-js/modules/es6.object.assign");

require("core-js/modules/es6.promise");

require("core-js/modules/es6.array.find");

require("core-js/modules/es6.typed.uint8-clamped-array");

require("core-js/modules/es6.regexp.match");

require("core-js/modules/es6.typed.uint8-array");

require("core-js/modules/es6.regexp.to-string");

require("core-js/modules/es6.date.to-string");

require("core-js/modules/es6.array.index-of");

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var _events = _interopRequireDefault(require("events"));

var _utils = require("@jimp/utils");

var _anyBase = _interopRequireDefault(require("any-base"));

var _mkdirp = _interopRequireDefault(require("mkdirp"));

var _pixelmatch = _interopRequireDefault(require("pixelmatch"));

var _tinycolor = _interopRequireDefault(require("tinycolor2"));

var _phash = _interopRequireDefault(require("./modules/phash"));

var _request = _interopRequireDefault(require("./request"));

var _composite = _interopRequireDefault(require("./composite"));

var _promisify = _interopRequireDefault(require("./utils/promisify"));

var MIME = _interopRequireWildcard(require("./utils/mime"));

var _imageBitmap = require("./utils/image-bitmap");

var constants = _interopRequireWildcard(require("./constants"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _construct(Parent, args, Class) { if (isNativeReflectConstruct()) { _construct = Reflect.construct; } else { _construct = function _construct(Parent, args, Class) { var a = [null]; a.push.apply(a, args); var Constructor = Function.bind.apply(Parent, a); var instance = new Constructor(); if (Class) _setPrototypeOf(instance, Class.prototype); return instance; }; } return _construct.apply(null, arguments); }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var alphabet = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$_'; // an array storing the maximum string length of hashes at various bases
// 0 and 1 do not exist as possible hash lengths

var maxHashLength = [NaN, NaN];

for (var i$1 = 2; i$1 < 65; i$1++) {
  var maxHash = (0, _anyBase.default)(_anyBase.default.BIN, alphabet.slice(0, i$1))(new Array(64 + 1).join('1'));
  maxHashLength.push(maxHash.length);
} // no operation


function noop() {} // error checking methods


function isArrayBuffer(test) {
  return Object.prototype.toString.call(test).toLowerCase().indexOf('arraybuffer') > -1;
} // Prepare a Buffer object from the arrayBuffer. Necessary in the browser > node conversion,
// But this function is not useful when running in node directly


function bufferFromArrayBuffer(arrayBuffer) {
  var buffer = Buffer.alloc(arrayBuffer.byteLength);
  var view = new Uint8Array(arrayBuffer);

  for (var _i = 0; _i < buffer.length; ++_i) {
    buffer[_i] = view[_i];
  }

  return buffer;
}

function loadFromURL(options, cb) {
  (0, _request.default)(options, function (err, response, data) {
    if (err) {
      return cb(err);
    }

    if (_typeof(data) === 'object' && isBuffer(data)) {
      return cb(null, data);
    }

    var msg = 'Could not load Buffer from <' + options.url + '> ' + '(HTTP: ' + response.statusCode + ')';
    return new Error(msg);
  });
}

function loadBufferFromPath(src, cb) {
  if (_fs.default && typeof _fs.default.readFile === 'function' && !src.match(/^(http|ftp)s?:\/\/./)) {
    _fs.default.readFile(src, cb);
  } else {
    loadFromURL({
      url: src
    }, cb);
  }
}

function isRawRGBAData(obj) {
  return obj && _typeof(obj) === 'object' && typeof obj.width === 'number' && typeof obj.height === 'number' && (isBuffer(obj.data) || obj.data instanceof Uint8Array || typeof Uint8ClampedArray === 'function' && obj.data instanceof Uint8ClampedArray) && (obj.data.length === obj.width * obj.height * 4 || obj.data.length === obj.width * obj.height * 3);
}

function makeRGBABufferFromRGB(buffer) {
  if (buffer.length % 3 !== 0) {
    throw new Error('Buffer length is incorrect');
  }

  var rgbaBuffer = Buffer.allocUnsafe(buffer.length / 3 * 4);
  var j = 0;

  for (var _i2 = 0; _i2 < buffer.length; _i2++) {
    rgbaBuffer[j] = buffer[_i2];

    if ((_i2 + 1) % 3 === 0) {
      rgbaBuffer[++j] = 255;
    }

    j++;
  }

  return rgbaBuffer;
}

var emptyBitmap = {
  data: null,
  width: null,
  height: null
};
/**
 * Jimp constructor (from a file)
 * @param path a path to the image
 * @param {function(Error, Jimp)} cb (optional) a function to call when the image is parsed to a bitmap
 */

/**
 * Jimp constructor (from a url with options)
 * @param options { url, otherOptions}
 * @param {function(Error, Jimp)} cb (optional) a function to call when the image is parsed to a bitmap
 */

/**
 * Jimp constructor (from another Jimp image or raw image data)
 * @param image a Jimp image to clone
 * @param {function(Error, Jimp)} cb a function to call when the image is parsed to a bitmap
 */

/**
 * Jimp constructor (from a Buffer)
 * @param data a Buffer containing the image data
 * @param {function(Error, Jimp)} cb a function to call when the image is parsed to a bitmap
 */

/**
 * Jimp constructor (to generate a new image)
 * @param w the width of the image
 * @param h the height of the image
 * @param {function(Error, Jimp)} cb (optional) a function to call when the image is parsed to a bitmap
 */

/**
 * Jimp constructor (to generate a new image)
 * @param w the width of the image
 * @param h the height of the image
 * @param background color to fill the image with
 * @param {function(Error, Jimp)} cb (optional) a function to call when the image is parsed to a bitmap
 */

var Jimp =
/*#__PURE__*/
function (_EventEmitter) {
  _inherits(Jimp, _EventEmitter);

  // An object representing a bitmap in memory, comprising:
  //  - data: a buffer of the bitmap data
  //  - width: the width of the image in pixels
  //  - height: the height of the image in pixels
  // Default colour to use for new pixels
  // Default MIME is PNG
  // Exif data for the image
  // Whether Transparency supporting formats will be exported as RGB or RGBA
  function Jimp() {
    var _this;

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _classCallCheck(this, Jimp);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(Jimp).call(this));

    _defineProperty(_assertThisInitialized(_assertThisInitialized(_this)), "bitmap", emptyBitmap);

    _defineProperty(_assertThisInitialized(_assertThisInitialized(_this)), "_background", 0x00000000);

    _defineProperty(_assertThisInitialized(_assertThisInitialized(_this)), "_originalMime", Jimp.MIME_PNG);

    _defineProperty(_assertThisInitialized(_assertThisInitialized(_this)), "_exif", null);

    _defineProperty(_assertThisInitialized(_assertThisInitialized(_this)), "_rgba", true);

    _defineProperty(_assertThisInitialized(_assertThisInitialized(_this)), "writeAsync", function (path) {
      return (0, _promisify.default)(_this.write, _assertThisInitialized(_assertThisInitialized(_this)), path);
    });

    _defineProperty(_assertThisInitialized(_assertThisInitialized(_this)), "getBase64Async", function (mime) {
      return (0, _promisify.default)(_this.getBase64, _assertThisInitialized(_assertThisInitialized(_this)), mime);
    });

    _defineProperty(_assertThisInitialized(_assertThisInitialized(_this)), "getBuffer", _imageBitmap.getBuffer);

    _defineProperty(_assertThisInitialized(_assertThisInitialized(_this)), "getBufferAsync", _imageBitmap.getBufferAsync);

    _defineProperty(_assertThisInitialized(_assertThisInitialized(_this)), "getPixelColour", _this.getPixelColor);

    _defineProperty(_assertThisInitialized(_assertThisInitialized(_this)), "setPixelColour", _this.setPixelColor);

    var jimpInstance = _assertThisInitialized(_assertThisInitialized(_this));

    var cb = noop;

    if (isArrayBuffer(args[0])) {
      args[0] = bufferFromArrayBuffer(args[0]);
    }

    function finish() {
      for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      var err = args[0];
      var evData = err || {};
      evData.methodName = 'constructor';
      setTimeout(function () {
        var _cb;

        // run on next tick.
        if (err && cb === noop) {
          jimpInstance.emitError('constructor', err);
        } else if (!err) {
          jimpInstance.emitMulti('constructor', 'initialized');
        }

        (_cb = cb).call.apply(_cb, [jimpInstance].concat(args));
      }, 1);
    }

    if (typeof args[0] === 'number' && typeof args[1] === 'number' || parseInt(args[0], 10) && parseInt(args[1], 10)) {
      // create a new image
      var w = parseInt(args[0], 10);
      var h = parseInt(args[1], 10);
      cb = args[2]; // with a hex color

      if (typeof args[2] === 'number') {
        _this._background = args[2];
        cb = args[3];
      } // with a css color


      if (typeof args[2] === 'string') {
        _this._background = Jimp.cssColorToHex(args[2]);
        cb = args[3];
      }

      if (typeof cb === 'undefined') {
        cb = noop;
      }

      if (typeof cb !== 'function') {
        return _possibleConstructorReturn(_this, _utils.throwError.call(_assertThisInitialized(_assertThisInitialized(_this)), 'cb must be a function', finish));
      }

      _this.bitmap = {
        data: Buffer.alloc(w * h * 4),
        width: w,
        height: h
      };

      for (var _i3 = 0; _i3 < _this.bitmap.data.length; _i3 += 4) {
        _this.bitmap.data.writeUInt32BE(_this._background, _i3);
      }

      finish(null, _assertThisInitialized(_assertThisInitialized(_this)));
    } else if (_typeof(args[0]) === 'object' && args[0].url) {
      cb = args[1] || noop;

      if (typeof cb !== 'function') {
        return _possibleConstructorReturn(_this, _utils.throwError.call(_assertThisInitialized(_assertThisInitialized(_this)), 'cb must be a function', finish));
      }

      loadFromURL(args[0], function (err, data) {
        if (err) {
          return _utils.throwError.call(_assertThisInitialized(_assertThisInitialized(_this)), err, finish);
        }

        _this.parseBitmap(data, args[0].url, finish);
      });
    } else if (args[0] instanceof Jimp) {
      // clone an existing Jimp
      var original = args[0];
      cb = args[1];

      if (typeof cb === 'undefined') {
        cb = noop;
      }

      if (typeof cb !== 'function') {
        return _possibleConstructorReturn(_this, _utils.throwError.call(_assertThisInitialized(_assertThisInitialized(_this)), 'cb must be a function', finish));
      }

      _this.bitmap = {
        data: Buffer.from(original.bitmap.data),
        width: original.bitmap.width,
        height: original.bitmap.height
      };
      _this._quality = original._quality;
      _this._deflateLevel = original._deflateLevel;
      _this._deflateStrategy = original._deflateStrategy;
      _this._filterType = original._filterType;
      _this._rgba = original._rgba;
      _this._background = original._background;
      _this._originalMime = original._originalMime;
      finish(null, _assertThisInitialized(_assertThisInitialized(_this)));
    } else if (isRawRGBAData(args[0])) {
      var imageData = args[0];
      cb = args[1] || noop;
      var isRGBA = imageData.width * imageData.height * 4 === imageData.data.length;
      var buffer = isRGBA ? Buffer.from(imageData.data) : makeRGBABufferFromRGB(imageData.data);
      _this.bitmap = {
        data: buffer,
        width: imageData.width,
        height: imageData.height
      };
      finish(null, _assertThisInitialized(_assertThisInitialized(_this)));
    } else if (typeof args[0] === 'string') {
      // read from a path
      var path = args[0];
      cb = args[1];

      if (typeof cb === 'undefined') {
        cb = noop;
      }

      if (typeof cb !== 'function') {
        return _possibleConstructorReturn(_this, _utils.throwError.call(_assertThisInitialized(_assertThisInitialized(_this)), 'cb must be a function', finish));
      }

      loadBufferFromPath(path, function (err, data) {
        if (err) {
          return _utils.throwError.call(_assertThisInitialized(_assertThisInitialized(_this)), err, finish);
        }

        _this.parseBitmap(data, path, finish);
      });
    } else if (_typeof(args[0]) === 'object' && isBuffer(args[0])) {
      // read from a buffer
      var data = args[0];
      cb = args[1];

      if (typeof cb !== 'function') {
        return _possibleConstructorReturn(_this, _utils.throwError.call(_assertThisInitialized(_assertThisInitialized(_this)), 'cb must be a function', finish));
      }

      _this.parseBitmap(data, null, finish);
    } else {
      // Allow client libs to add new ways to build a Jimp object.
      // Extra constructors must be added by `Jimp.appendConstructorOption()`
      cb = args[args.length - 1];

      if (typeof cb !== 'function') {
        // TODO: try to solve the args after cb problem.
        cb = args[args.length - 2];

        if (typeof cb !== 'function') {
          cb = noop;
        }
      }

      var extraConstructor = Jimp.__extraConstructors.find(function (c) {
        return c.test.apply(c, args);
      });

      if (extraConstructor) {
        new Promise(function (resolve, reject) {
          var _extraConstructor$run;

          return (_extraConstructor$run = extraConstructor.run).call.apply(_extraConstructor$run, [_assertThisInitialized(_assertThisInitialized(_this)), resolve, reject].concat(args));
        }).then(function () {
          return finish(null, _assertThisInitialized(_assertThisInitialized(_this)));
        }).catch(finish);
      } else {
        return _possibleConstructorReturn(_this, _utils.throwError.call(_assertThisInitialized(_assertThisInitialized(_this)), 'No matching constructor overloading was found. ' + 'Please see the docs for how to call the Jimp constructor.', finish));
      }
    }

    return _this;
  }
  /**
   * Parse a bitmap with the loaded image types.
   *
   * @param {Buffer} data raw image data
   * @param {string} path optional path to file
   * @param {function(Error, Jimp)} cb (optional) a callback for when complete
   * @memberof Jimp
   */


  _createClass(Jimp, [{
    key: "parseBitmap",
    value: function parseBitmap(data, path, finish) {
      _imageBitmap.parseBitmap.call(this, data, null, finish);
    }
    /**
     * Sets the type of the image (RGB or RGBA) when saving in a format that supports transparency (default is RGBA)
     * @param {boolean} bool A Boolean, true to use RGBA or false to use RGB
     * @param {function(Error, Jimp)} cb (optional) a callback for when complete
     * @returns {Jimp} this for chaining of methods
     */

  }, {
    key: "rgba",
    value: function rgba(bool, cb) {
      if (typeof bool !== 'boolean') {
        return _utils.throwError.call(this, 'bool must be a boolean, true for RGBA or false for RGB', cb);
      }

      this._rgba = bool;

      if ((0, _utils.isNodePattern)(cb)) {
        cb.call(this, null, this);
      }

      return this;
    }
    /**
     * Emit for multiple listeners
     * @param {string} methodName name of the method to emit an error for
     * @param {string} eventName name of the eventName to emit an error for
     * @param {object} data to emit
     */

  }, {
    key: "emitMulti",
    value: function emitMulti(methodName, eventName) {
      var data = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      data = Object.assign(data, {
        methodName: methodName,
        eventName: eventName
      });
      this.emit('any', data);

      if (methodName) {
        this.emit(methodName, data);
      }

      this.emit(eventName, data);
    }
  }, {
    key: "emitError",
    value: function emitError(methodName, err) {
      this.emitMulti(methodName, 'error', err);
    }
    /**
     * Get the current height of the image
     * @return {number} height of the image
     */

  }, {
    key: "getHeight",
    value: function getHeight() {
      return this.bitmap.height;
    }
    /**
     * Get the current width of the image
     * @return {number} width of the image
     */

  }, {
    key: "getWidth",
    value: function getWidth() {
      return this.bitmap.width;
    }
    /**
     * Nicely format Jimp object when sent to the console e.g. console.log(image)
     * @returns {string} pretty printed
     */

  }, {
    key: "inspect",
    value: function inspect() {
      return '<Jimp ' + (this.bitmap === emptyBitmap ? 'pending...' : this.bitmap.width + 'x' + this.bitmap.height) + '>';
    }
    /**
     * Nicely format Jimp object when converted to a string
     * @returns {string} pretty printed
     */

  }, {
    key: "toString",
    value: function toString() {
      return '[object Jimp]';
    }
    /**
     * Returns the original MIME of the image (default: "image/png")
     * @returns {string} the MIME
     */

  }, {
    key: "getMIME",
    value: function getMIME() {
      var mime = this._originalMime || Jimp.MIME_PNG;
      return mime;
    }
    /**
     * Returns the appropriate file extension for the original MIME of the image (default: "png")
     * @returns {string} the file extension
     */

  }, {
    key: "getExtension",
    value: function getExtension() {
      var mime = this.getMIME();
      return MIME.getExtension(mime);
    }
    /**
     * Writes the image to a file
     * @param {string} path a path to the destination file
     * @param {function(Error, Jimp)} cb (optional) a function to call when the image is saved to disk
     * @returns {Jimp} this for chaining of methods
     */

  }, {
    key: "write",
    value: function write(path, cb) {
      var _this2 = this;

      if (!_fs.default || !_fs.default.createWriteStream) {
        throw new Error('Cant access the filesystem. You can use the getBase64 method.');
      }

      if (typeof path !== 'string') {
        return _utils.throwError.call(this, 'path must be a string', cb);
      }

      if (typeof cb === 'undefined') {
        cb = noop;
      }

      if (typeof cb !== 'function') {
        return _utils.throwError.call(this, 'cb must be a function', cb);
      }

      var mime = MIME.getType(path) || this.getMIME();

      var pathObj = _path.default.parse(path);

      if (pathObj.dir) {
        _mkdirp.default.sync(pathObj.dir);
      }

      this.getBuffer(mime, function (err, buffer) {
        if (err) {
          return _utils.throwError.call(_this2, err, cb);
        }

        var stream = _fs.default.createWriteStream(path);

        stream.on('open', function () {
          stream.write(buffer);
          stream.end();
        }).on('error', function (err) {
          return _utils.throwError.call(_this2, err, cb);
        });
        stream.on('finish', function () {
          cb.call(_this2, null, _this2);
        });
      });
      return this;
    }
  }, {
    key: "getBase64",

    /**
     * Converts the image to a base 64 string
     * @param {string} mime the mime type of the image data to be created
     * @param {function(Error, Jimp)} cb a Node-style function to call with the buffer as the second argument
     * @returns {Jimp} this for chaining of methods
     */
    value: function getBase64(mime, cb) {
      if (mime === Jimp.AUTO) {
        // allow auto MIME detection
        mime = this.getMIME();
      }

      if (typeof mime !== 'string') {
        return _utils.throwError.call(this, 'mime must be a string', cb);
      }

      if (typeof cb !== 'function') {
        return _utils.throwError.call(this, 'cb must be a function', cb);
      }

      this.getBuffer(mime, function (err, data) {
        if (err) {
          return _utils.throwError.call(this, err, cb);
        }

        var src = 'data:' + mime + ';base64,' + data.toString('base64');
        cb.call(this, null, src);
      });
      return this;
    }
  }, {
    key: "hash",

    /**
     * Generates a perceptual hash of the image <https://en.wikipedia.org/wiki/Perceptual_hashing>. And pads the string. Can configure base.
     * @param {number} base (optional) a number between 2 and 64 representing the base for the hash (e.g. 2 is binary, 10 is decimal, 16 is hex, 64 is base 64). Defaults to 64.
     * @param {function(Error, Jimp)} cb (optional) a callback for when complete
     * @returns {string} a string representing the hash
     */
    value: function hash(base, cb) {
      base = base || 64;

      if (typeof base === 'function') {
        cb = base;
        base = 64;
      }

      if (typeof base !== 'number') {
        return _utils.throwError.call(this, 'base must be a number', cb);
      }

      if (base < 2 || base > 64) {
        return _utils.throwError.call(this, 'base must be a number between 2 and 64', cb);
      }

      var hash = this.pHash();
      hash = (0, _anyBase.default)(_anyBase.default.BIN, alphabet.slice(0, base))(hash);

      while (hash.length < maxHashLength[base]) {
        hash = '0' + hash; // pad out with leading zeros
      }

      if ((0, _utils.isNodePattern)(cb)) {
        cb.call(this, null, hash);
      }

      return hash;
    }
    /**
     * Calculates the perceptual hash
     * @returns {number} the perceptual hash
     */

  }, {
    key: "pHash",
    value: function pHash() {
      var pHash = new _phash.default();
      return pHash.getHash(this);
    }
    /**
     * Calculates the hamming distance of the current image and a hash based on their perceptual hash
     * @param {hash} compareHash hash to compare to
     * @returns {number} a number ranging from 0 to 1, 0 means they are believed to be identical
     */

  }, {
    key: "distanceFromHash",
    value: function distanceFromHash(compareHash) {
      var pHash = new _phash.default();
      var currentHash = pHash.getHash(this);
      return pHash.distance(currentHash, compareHash);
    }
    /**
     * Converts the image to a buffer
     * @param {string} mime the mime type of the image buffer to be created
     * @param {function(Error, Jimp)} cb a Node-style function to call with the buffer as the second argument
     * @returns {Jimp} this for chaining of methods
     */

  }, {
    key: "getPixelIndex",

    /**
     * Returns the offset of a pixel in the bitmap buffer
     * @param {number} x the x coordinate
     * @param {number} y the y coordinate
     * @param {string} edgeHandling (optional) define how to sum pixels from outside the border
     * @param {number} cb (optional) a callback for when complete
     * @returns {number} the index of the pixel or -1 if not found
     */
    value: function getPixelIndex(x, y, edgeHandling, cb) {
      var xi;
      var yi;

      if (typeof edgeHandling === 'function' && typeof cb === 'undefined') {
        cb = edgeHandling;
        edgeHandling = null;
      }

      if (!edgeHandling) {
        edgeHandling = Jimp.EDGE_EXTEND;
      }

      if (typeof x !== 'number' || typeof y !== 'number') {
        return _utils.throwError.call(this, 'x and y must be numbers', cb);
      } // round input


      x = Math.round(x);
      y = Math.round(y);
      xi = x;
      yi = y;

      if (edgeHandling === Jimp.EDGE_EXTEND) {
        if (x < 0) xi = 0;
        if (x >= this.bitmap.width) xi = this.bitmap.width - 1;
        if (y < 0) yi = 0;
        if (y >= this.bitmap.height) yi = this.bitmap.height - 1;
      }

      if (edgeHandling === Jimp.EDGE_WRAP) {
        if (x < 0) {
          xi = this.bitmap.width + x;
        }

        if (x >= this.bitmap.width) {
          xi = x % this.bitmap.width;
        }

        if (y < 0) {
          xi = this.bitmap.height + y;
        }

        if (y >= this.bitmap.height) {
          yi = y % this.bitmap.height;
        }
      }

      var i = this.bitmap.width * yi + xi << 2; // if out of bounds index is -1

      if (xi < 0 || xi >= this.bitmap.width) {
        i = -1;
      }

      if (yi < 0 || yi >= this.bitmap.height) {
        i = -1;
      }

      if ((0, _utils.isNodePattern)(cb)) {
        cb.call(this, null, i);
      }

      return i;
    }
    /**
     * Returns the hex colour value of a pixel
     * @param {number} x the x coordinate
     * @param {number} y the y coordinate
     * @param {function(Error, Jimp)} cb (optional) a callback for when complete
     * @returns {number} the color of the pixel
     */

  }, {
    key: "getPixelColor",
    value: function getPixelColor(x, y, cb) {
      if (typeof x !== 'number' || typeof y !== 'number') return _utils.throwError.call(this, 'x and y must be numbers', cb); // round input

      x = Math.round(x);
      y = Math.round(y);
      var idx = this.getPixelIndex(x, y);
      var hex = this.bitmap.data.readUInt32BE(idx);

      if ((0, _utils.isNodePattern)(cb)) {
        cb.call(this, null, hex);
      }

      return hex;
    }
  }, {
    key: "setPixelColor",

    /**
     * Returns the hex colour value of a pixel
     * @param {number} hex color to set
     * @param {number} x the x coordinate
     * @param {number} y the y coordinate
     * @param {function(Error, Jimp)} cb (optional) a callback for when complete
     * @returns {number} the index of the pixel or -1 if not found
     */
    value: function setPixelColor(hex, x, y, cb) {
      if (typeof hex !== 'number' || typeof x !== 'number' || typeof y !== 'number') return _utils.throwError.call(this, 'hex, x and y must be numbers', cb); // round input

      x = Math.round(x);
      y = Math.round(y);
      var idx = this.getPixelIndex(x, y);
      this.bitmap.data.writeUInt32BE(hex, idx);

      if ((0, _utils.isNodePattern)(cb)) {
        cb.call(this, null, this);
      }

      return this;
    }
  }, {
    key: "hasAlpha",

    /**
     * Determine if the image contains opaque pixels.
     * @return {boolean} hasAlpha whether the image contains opaque pixels
     */
    value: function hasAlpha() {
      for (var yIndex = 0; yIndex < this.bitmap.height; yIndex++) {
        for (var xIndex = 0; xIndex < this.bitmap.width; xIndex++) {
          var idx = this.bitmap.width * yIndex + xIndex << 2;
          var alpha = this.bitmap.data[idx + 3];

          if (alpha !== 0xff) {
            return true;
          }
        }
      }

      return false;
    }
  }]);

  return Jimp;
}(_events.default);

function addConstants(constants) {
  var jimpInstance = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : Jimp;
  Object.entries(constants).forEach(function (_ref) {
    var _ref2 = _slicedToArray(_ref, 2),
        name = _ref2[0],
        value = _ref2[1];

    jimpInstance[name] = value;
  });
}

function addJimpMethods(methods) {
  var jimpInstance = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : Jimp;
  Object.entries(methods).forEach(function (_ref3) {
    var _ref4 = _slicedToArray(_ref3, 2),
        name = _ref4[0],
        value = _ref4[1];

    jimpInstance.prototype[name] = value;
  });
}

addConstants(constants);
addJimpMethods({
  composite: _composite.default
});
Jimp.__extraConstructors = [];
/**
 * Allow client libs to add new ways to build a Jimp object.
 * @param {string} name identify the extra constructor.
 * @param {function} test a function that returns true when it accepts the arguments passed to the main constructor.
 * @param {function} run where the magic happens.
 */

Jimp.appendConstructorOption = function (name, test, run) {
  Jimp.__extraConstructors.push({
    name: name,
    test: test,
    run: run
  });
};
/**
 * Read an image from a file or a Buffer. Takes the same args as the constructor
 * @returns {Promise} a promise
 */


Jimp.read = function () {
  for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
    args[_key3] = arguments[_key3];
  }

  return new Promise(function (resolve, reject) {
    _construct(Jimp, args.concat([function (err, image) {
      if (err) reject(err);else resolve(image);
    }]));
  });
};

Jimp.create = Jimp.read;
/**
 * A static helper method that converts RGBA values to a single integer value
 * @param {number} r the red value (0-255)
 * @param {number} g the green value (0-255)
 * @param {number} b the blue value (0-255)
 * @param {number} a the alpha value (0-255)
 * @param {function(Error, Jimp)} cb (optional) A callback for when complete
 * @returns {number} an single integer colour value
 */

Jimp.rgbaToInt = function (r, g, b, a, cb) {
  if (typeof r !== 'number' || typeof g !== 'number' || typeof b !== 'number' || typeof a !== 'number') {
    return _utils.throwError.call(this, 'r, g, b and a must be numbers', cb);
  }

  if (r < 0 || r > 255) {
    return _utils.throwError.call(this, 'r must be between 0 and 255', cb);
  }

  if (g < 0 || g > 255) {
    _utils.throwError.call(this, 'g must be between 0 and 255', cb);
  }

  if (b < 0 || b > 255) {
    return _utils.throwError.call(this, 'b must be between 0 and 255', cb);
  }

  if (a < 0 || a > 255) {
    return _utils.throwError.call(this, 'a must be between 0 and 255', cb);
  }

  r = Math.round(r);
  b = Math.round(b);
  g = Math.round(g);
  a = Math.round(a);
  var i = r * Math.pow(256, 3) + g * Math.pow(256, 2) + b * Math.pow(256, 1) + a * Math.pow(256, 0);

  if ((0, _utils.isNodePattern)(cb)) {
    cb.call(this, null, i);
  }

  return i;
};
/**
 * A static helper method that converts RGBA values to a single integer value
 * @param {number} i a single integer value representing an RGBA colour (e.g. 0xFF0000FF for red)
 * @param {function(Error, Jimp)} cb (optional) A callback for when complete
 * @returns {object} an object with the properties r, g, b and a representing RGBA values
 */


Jimp.intToRGBA = function (i, cb) {
  if (typeof i !== 'number') {
    return _utils.throwError.call(this, 'i must be a number', cb);
  }

  var rgba = {};
  rgba.r = Math.floor(i / Math.pow(256, 3));
  rgba.g = Math.floor((i - rgba.r * Math.pow(256, 3)) / Math.pow(256, 2));
  rgba.b = Math.floor((i - rgba.r * Math.pow(256, 3) - rgba.g * Math.pow(256, 2)) / Math.pow(256, 1));
  rgba.a = Math.floor((i - rgba.r * Math.pow(256, 3) - rgba.g * Math.pow(256, 2) - rgba.b * Math.pow(256, 1)) / Math.pow(256, 0));

  if ((0, _utils.isNodePattern)(cb)) {
    cb.call(this, null, rgba);
  }

  return rgba;
};
/**
 * Converts a css color (Hex, 8-digit (RGBA) Hex, RGB, RGBA, HSL, HSLA, HSV, HSVA, Named) to a hex number
 * @param {string} cssColor a number
 * @returns {number} a hex number representing a color
 */


Jimp.cssColorToHex = function (cssColor) {
  cssColor = cssColor || 0; // 0, null, undefined, NaN

  if (typeof cssColor === 'number') return Number(cssColor);
  return parseInt((0, _tinycolor.default)(cssColor).toHex8(), 16);
};
/**
 * Limits a number to between 0 or 255
 * @param {number} n a number
 * @returns {number} the number limited to between 0 or 255
 */


Jimp.limit255 = function (n) {
  n = Math.max(n, 0);
  n = Math.min(n, 255);
  return n;
};
/**
 * Diffs two images and returns
 * @param {Jimp} img1 a Jimp image to compare
 * @param {Jimp} img2 a Jimp image to compare
 * @param {number} threshold (optional) a number, 0 to 1, the smaller the value the more sensitive the comparison (default: 0.1)
 * @returns {object} an object { percent: percent similar, diff: a Jimp image highlighting differences }
 */


Jimp.diff = function (img1, img2) {
  var threshold = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0.1;
  if (!(img1 instanceof Jimp) || !(img2 instanceof Jimp)) return _utils.throwError.call(this, 'img1 and img2 must be an Jimp images');
  var bmp1 = img1.bitmap;
  var bmp2 = img2.bitmap;

  if (bmp1.width !== bmp2.width || bmp1.height !== bmp2.height) {
    if (bmp1.width * bmp1.height > bmp2.width * bmp2.height) {
      // img1 is bigger
      img1 = img1.cloneQuiet().resize(bmp2.width, bmp2.height);
    } else {
      // img2 is bigger (or they are the same in area)
      img2 = img2.cloneQuiet().resize(bmp1.width, bmp1.height);
    }
  }

  if (typeof threshold !== 'number' || threshold < 0 || threshold > 1) {
    return _utils.throwError.call(this, 'threshold must be a number between 0 and 1');
  }

  var diff = new Jimp(bmp1.width, bmp1.height, 0xffffffff);
  var numDiffPixels = (0, _pixelmatch.default)(bmp1.data, bmp2.data, diff.bitmap.data, diff.bitmap.width, diff.bitmap.height, {
    threshold: threshold
  });
  return {
    percent: numDiffPixels / (diff.bitmap.width * diff.bitmap.height),
    image: diff
  };
};
/**
 * Calculates the hamming distance of two images based on their perceptual hash
 * @param {Jimp} img1 a Jimp image to compare
 * @param {Jimp} img2 a Jimp image to compare
 * @returns {number} a number ranging from 0 to 1, 0 means they are believed to be identical
 */


Jimp.distance = function (img1, img2) {
  var phash = new _phash.default();
  var hash1 = phash.getHash(img1);
  var hash2 = phash.getHash(img2);
  return phash.distance(hash1, hash2);
};
/**
 * Calculates the hamming distance of two images based on their perceptual hash
 * @param {hash} hash1 a pHash
 * @param {hash} hash2 a pHash
 * @returns {number} a number ranging from 0 to 1, 0 means they are believed to be identical
 */


Jimp.compareHashes = function (hash1, hash2) {
  var phash = new _phash.default();
  return phash.distance(hash1, hash2);
};
/**
 * Compute color difference
 * 0 means no difference, 1 means maximum difference.
 * @param {number} rgba1:    first color to compare.
 * @param {number} rgba2:    second color to compare.
 * Both parameters must be an color object {r:val, g:val, b:val, a:val}
 * Where `a` is optional and `val` is an integer between 0 and 255.
 * @returns {number} float between 0 and 1.
 */


Jimp.colorDiff = function (rgba1, rgba2) {
  var pow = function pow(n) {
    return Math.pow(n, 2);
  };

  var max = Math.max;
  var maxVal = 255 * 255 * 3;

  if (rgba1.a !== 0 && !rgba1.a) {
    rgba1.a = 255;
  }

  if (rgba2.a !== 0 && !rgba2.a) {
    rgba2.a = 255;
  }

  return (max(pow(rgba1.r - rgba2.r), pow(rgba1.r - rgba2.r - rgba1.a + rgba2.a)) + max(pow(rgba1.g - rgba2.g), pow(rgba1.g - rgba2.g - rgba1.a + rgba2.a)) + max(pow(rgba1.b - rgba2.b), pow(rgba1.b - rgba2.b - rgba1.a + rgba2.a))) / maxVal;
};
/**
 * Helper to create Jimp methods that emit events before and after its execution.
 * @param {string} methodName   The name to be appended to Jimp prototype.
 * @param {string} evName       The event name to be called.
 *                     It will be prefixed by `before-` and emitted when on method call.
 *                     It will be appended by `ed` and emitted after the method run.
 * @param {function} method       A function implementing the method itself.
 * It will also create a quiet version that will not emit events, to not
 * mess the user code with many `changed` event calls. You can call with
 * `methodName + "Quiet"`.
 *
 * The emitted event comes with a object parameter to the listener with the
 * `methodName` as one attribute.
 */


function jimpEvMethod(methodName, evName, method) {
  var evNameBefore = 'before-' + evName;
  var evNameAfter = evName.replace(/e$/, '') + 'ed';

  Jimp.prototype[methodName] = function () {
    var wrappedCb;

    for (var _len4 = arguments.length, args = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
      args[_key4] = arguments[_key4];
    }

    var cb = args[method.length - 1];
    var jimpInstance = this;

    if (typeof cb === 'function') {
      wrappedCb = function wrappedCb() {
        for (var _len5 = arguments.length, args = new Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
          args[_key5] = arguments[_key5];
        }

        var err = args[0],
            data = args[1];

        if (err) {
          jimpInstance.emitError(methodName, err);
        } else {
          jimpInstance.emitMulti(methodName, evNameAfter, _defineProperty({}, methodName, data));
        }

        cb.apply(this, args);
      };

      args[args.length - 1] = wrappedCb;
    } else {
      wrappedCb = false;
    }

    this.emitMulti(methodName, evNameBefore);
    var result;

    try {
      result = method.apply(this, args);

      if (!wrappedCb) {
        this.emitMulti(methodName, evNameAfter, _defineProperty({}, methodName, result));
      }
    } catch (error) {
      error.methodName = methodName;
      this.emitError(methodName, error);
    }

    return result;
  };

  Jimp.prototype[methodName + 'Quiet'] = method;
}
/**
 * Creates a new image that is a clone of this one.
 * @param {function(Error, Jimp)} cb (optional) A callback for when complete
 * @returns the new image
 */


jimpEvMethod('clone', 'clone', function (cb) {
  var clone = new Jimp(this);

  if ((0, _utils.isNodePattern)(cb)) {
    cb.call(clone, null, clone);
  }

  return clone;
});
/**
 * Simplify jimpEvMethod call for the common `change` evName.
 * @param {string} methodName name of the method
 * @param {function} method to watch changes for
 */

function jimpEvChange(methodName, method) {
  jimpEvMethod(methodName, 'change', method);
}
/**
 * Sets the type of the image (RGB or RGBA) when saving as PNG format (default is RGBA)
 * @param b A Boolean, true to use RGBA or false to use RGB
 * @param {function(Error, Jimp)} cb (optional) a callback for when complete
 * @returns {Jimp} this for chaining of methods
 */


jimpEvChange('background', function (hex, cb) {
  if (typeof hex !== 'number') {
    return _utils.throwError.call(this, 'hex must be a hexadecimal rgba value', cb);
  }

  this._background = hex;

  if ((0, _utils.isNodePattern)(cb)) {
    cb.call(this, null, this);
  }

  return this;
});
/**
 * Scans through a region of the bitmap, calling a function for each pixel.
 * @param {number} x the x coordinate to begin the scan at
 * @param {number} y the y coordinate to begin the scan at
 * @param w the width of the scan region
 * @param h the height of the scan region
 * @param f a function to call on even pixel; the (x, y) position of the pixel
 * and the index of the pixel in the bitmap buffer are passed to the function
 * @param {function(Error, Jimp)} cb (optional) a callback for when complete
 * @returns {Jimp} this for chaining of methods
 */

jimpEvChange('scan', function (x, y, w, h, f, cb) {
  if (typeof x !== 'number' || typeof y !== 'number') {
    return _utils.throwError.call(this, 'x and y must be numbers', cb);
  }

  if (typeof w !== 'number' || typeof h !== 'number') {
    return _utils.throwError.call(this, 'w and h must be numbers', cb);
  }

  if (typeof f !== 'function') {
    return _utils.throwError.call(this, 'f must be a function', cb);
  }

  var result = (0, _utils.scan)(this, x, y, w, h, f);

  if ((0, _utils.isNodePattern)(cb)) {
    cb.call(this, null, result);
  }

  return result;
});

var _default = Jimp;
exports.default = _default;

var dist = /*#__PURE__*/Object.freeze({

});

var dist$1 = createCommonjsModule(function (module, exports) {

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = configure;





























var _core = _interopRequireWildcard(dist);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function configure(configuration) {
  var jimpInstance = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _core.default;
  var jimpConfig = {
    hasAlpha: {},
    encoders: {},
    decoders: {},
    class: {},
    constants: {}
  };

  function addToConfig(newConfig) {
    Object.entries(newConfig).forEach(function (_ref) {
      var _ref2 = _slicedToArray(_ref, 2),
          key = _ref2[0],
          value = _ref2[1];

      jimpConfig[key] = _objectSpread({}, jimpConfig[key], value);
    });
  }

  function addImageType(typeModule) {
    var type = typeModule();

    if (Array.isArray(type.mime)) {
      _core.addType.apply(void 0, _toConsumableArray(type.mime));
    } else {
      Object.entries(type.mime).forEach(function (mimeType) {
        return _core.addType.apply(void 0, _toConsumableArray(mimeType));
      });
    }

    delete type.mime;
    addToConfig(type);
  }

  function addPlugin(pluginModule) {
    var plugin = pluginModule(_core.jimpEvChange) || {};

    if (!plugin.class && !plugin.constants) {
      // Default to class function
      addToConfig({
        class: plugin
      });
    } else {
      addToConfig(plugin);
    }
  }

  if (configuration.types) {
    configuration.types.forEach(addImageType);
    jimpInstance.decoders = _objectSpread({}, jimpInstance.decoders, jimpConfig.decoders);
    jimpInstance.encoders = _objectSpread({}, jimpInstance.encoders, jimpConfig.encoders);
    jimpInstance.hasAlpha = _objectSpread({}, jimpInstance.hasAlpha, jimpConfig.hasAlpha);
  }

  if (configuration.plugins) {
    configuration.plugins.forEach(addPlugin);
  }

  (0, _core.addJimpMethods)(jimpConfig.class, jimpInstance);
  (0, _core.addConstants)(jimpConfig.constants, jimpInstance);
  return _core.default;
}

module.exports = exports.default;

});

var configure = unwrapExports(dist$1);

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof$1 = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.clone = clone;
exports.addLast = addLast;
exports.addFirst = addFirst;
exports.removeLast = removeLast;
exports.removeFirst = removeFirst;
exports.insert = insert;
exports.removeAt = removeAt;
exports.replaceAt = replaceAt;
exports.getIn = getIn;
exports.set = set;
exports.setIn = setIn;
exports.update = update;
exports.updateIn = updateIn;
exports.merge = merge;
exports.mergeDeep = mergeDeep;
exports.mergeIn = mergeIn;
exports.omit = omit;
exports.addDefaults = addDefaults;

// ===============================================
// ### Helpers
// ===============================================


function throwStr(msg) {
  throw new Error(msg);
}

function getKeysAndSymbols(obj) {
  var keys = Object.keys(obj);
  if (Object.getOwnPropertySymbols) {
    return keys.concat(Object.getOwnPropertySymbols(obj));
  }
  return keys;
}

var hasOwnProperty$1 = {}.hasOwnProperty;

function clone(obj) {
  if (Array.isArray(obj)) return obj.slice();
  var keys = getKeysAndSymbols(obj);
  var out = {};
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    out[key] = obj[key];
  }
  return out;
}

function doMerge(fAddDefaults, fDeep, first) {
  var out = first;
  !(out != null) && throwStr('At least one object should be provided to merge()');
  var fChanged = false;

  for (var _len = arguments.length, rest = Array(_len > 3 ? _len - 3 : 0), _key = 3; _key < _len; _key++) {
    rest[_key - 3] = arguments[_key];
  }

  for (var idx = 0; idx < rest.length; idx++) {
    var obj = rest[idx];
    if (obj == null) continue;
    var keys = getKeysAndSymbols(obj);
    if (!keys.length) continue;
    for (var j = 0; j <= keys.length; j++) {
      var key = keys[j];
      if (fAddDefaults && out[key] !== undefined) continue;
      var nextVal = obj[key];
      if (fDeep && isObject(out[key]) && isObject(nextVal)) {
        nextVal = doMerge(fAddDefaults, fDeep, out[key], nextVal);
      }
      if (nextVal === undefined || nextVal === out[key]) continue;
      if (!fChanged) {
        fChanged = true;
        out = clone(out);
      }
      out[key] = nextVal;
    }
  }
  return out;
}

function isObject(o) {
  var type = typeof o === 'undefined' ? 'undefined' : _typeof$1(o);
  return o != null && type === 'object';
}

// _deepFreeze = (obj) ->
//   Object.freeze obj
//   for key in Object.getOwnPropertyNames obj
//     val = obj[key]
//     if isObject(val) and not Object.isFrozen val
//       _deepFreeze val
//   obj

// ===============================================
// -- ### Arrays
// ===============================================

// -- #### addLast()
// -- Returns a new array with an appended item or items.
// --
// -- Usage: `addLast<T>(array: Array<T>, val: Array<T>|T): Array<T>`
// --
// -- ```js
// -- arr = ['a', 'b']
// -- arr2 = addLast(arr, 'c')
// -- // ['a', 'b', 'c']
// -- arr2 === arr
// -- // false
// -- arr3 = addLast(arr, ['c', 'd'])
// -- // ['a', 'b', 'c', 'd']
// -- ```
// `array.concat(val)` also handles the scalar case,
// but is apparently very slow
function addLast(array, val) {
  if (Array.isArray(val)) return array.concat(val);
  return array.concat([val]);
}

// -- #### addFirst()
// -- Returns a new array with a prepended item or items.
// --
// -- Usage: `addFirst<T>(array: Array<T>, val: Array<T>|T): Array<T>`
// --
// -- ```js
// -- arr = ['a', 'b']
// -- arr2 = addFirst(arr, 'c')
// -- // ['c', 'a', 'b']
// -- arr2 === arr
// -- // false
// -- arr3 = addFirst(arr, ['c', 'd'])
// -- // ['c', 'd', 'a', 'b']
// -- ```
function addFirst(array, val) {
  if (Array.isArray(val)) return val.concat(array);
  return [val].concat(array);
}

// -- #### removeLast()
// -- Returns a new array removing the last item.
// --
// -- Usage: `removeLast<T>(array: Array<T>): Array<T>`
// --
// -- ```js
// -- arr = ['a', 'b']
// -- arr2 = removeLast(arr)
// -- // ['a']
// -- arr2 === arr
// -- // false
// --
// -- // The same array is returned if there are no changes:
// -- arr3 = []
// -- removeLast(arr3) === arr3
// -- // true
// -- ```
function removeLast(array) {
  if (!array.length) return array;
  return array.slice(0, array.length - 1);
}

// -- #### removeFirst()
// -- Returns a new array removing the first item.
// --
// -- Usage: `removeFirst<T>(array: Array<T>): Array<T>`
// --
// -- ```js
// -- arr = ['a', 'b']
// -- arr2 = removeFirst(arr)
// -- // ['b']
// -- arr2 === arr
// -- // false
// --
// -- // The same array is returned if there are no changes:
// -- arr3 = []
// -- removeFirst(arr3) === arr3
// -- // true
// -- ```
function removeFirst(array) {
  if (!array.length) return array;
  return array.slice(1);
}

// -- #### insert()
// -- Returns a new array obtained by inserting an item or items
// -- at a specified index.
// --
// -- Usage: `insert<T>(array: Array<T>, idx: number, val: Array<T>|T): Array<T>`
// --
// -- ```js
// -- arr = ['a', 'b', 'c']
// -- arr2 = insert(arr, 1, 'd')
// -- // ['a', 'd', 'b', 'c']
// -- arr2 === arr
// -- // false
// -- insert(arr, 1, ['d', 'e'])
// -- // ['a', 'd', 'e', 'b', 'c']
// -- ```
function insert(array, idx, val) {
  return array.slice(0, idx).concat(Array.isArray(val) ? val : [val]).concat(array.slice(idx));
}

// -- #### removeAt()
// -- Returns a new array obtained by removing an item at
// -- a specified index.
// --
// -- Usage: `removeAt<T>(array: Array<T>, idx: number): Array<T>`
// --
// -- ```js
// -- arr = ['a', 'b', 'c']
// -- arr2 = removeAt(arr, 1)
// -- // ['a', 'c']
// -- arr2 === arr
// -- // false
// --
// -- // The same array is returned if there are no changes:
// -- removeAt(arr, 4) === arr
// -- // true
// -- ```
function removeAt(array, idx) {
  if (idx >= array.length || idx < 0) return array;
  return array.slice(0, idx).concat(array.slice(idx + 1));
}

// -- #### replaceAt()
// -- Returns a new array obtained by replacing an item at
// -- a specified index. If the provided item is the same as
// -- (*referentially equal to*) the previous item at that position,
// -- the original array is returned.
// --
// -- Usage: `replaceAt<T>(array: Array<T>, idx: number, newItem: T): Array<T>`
// --
// -- ```js
// -- arr = ['a', 'b', 'c']
// -- arr2 = replaceAt(arr, 1, 'd')
// -- // ['a', 'd', 'c']
// -- arr2 === arr
// -- // false
// --
// -- // The same object is returned if there are no changes:
// -- replaceAt(arr, 1, 'b') === arr
// -- // true
// -- ```
function replaceAt(array, idx, newItem) {
  if (array[idx] === newItem) return array;
  var len = array.length;
  var result = Array(len);
  for (var i = 0; i < len; i++) {
    result[i] = array[i];
  }
  result[idx] = newItem;
  return result;
}

// ===============================================
// -- ### Collections (objects and arrays)
// ===============================================
// -- The following types are used throughout this section
// -- ```js
// -- type ArrayOrObject = Array<any>|Object;
// -- type Key = number|string;
// -- ```

// -- #### getIn()
// -- Returns a value from an object at a given path. Works with
// -- nested arrays and objects. If the path does not exist, it returns
// -- `undefined`.
// --
// -- Usage: `getIn(obj: ?ArrayOrObject, path: Array<Key>): any`
// --
// -- ```js
// -- obj = { a: 1, b: 2, d: { d1: 3, d2: 4 }, e: ['a', 'b', 'c'] }
// -- getIn(obj, ['d', 'd1'])
// -- // 3
// -- getIn(obj, ['e', 1])
// -- // 'b'
// -- ```
function getIn(obj, path) {
  !Array.isArray(path) && throwStr('A path array should be provided when calling getIn()');
  if (obj == null) return undefined;
  var ptr = obj;
  for (var i = 0; i < path.length; i++) {
    var key = path[i];
    ptr = ptr != null ? ptr[key] : undefined;
    if (ptr === undefined) return ptr;
  }
  return ptr;
}

// -- #### set()
// -- Returns a new object with a modified attribute.
// -- If the provided value is the same as (*referentially equal to*)
// -- the previous value, the original object is returned.
// --
// -- Usage: `set<T>(obj: ?T, key: Key, val: any): T`
// --
// -- ```js
// -- obj = { a: 1, b: 2, c: 3 }
// -- obj2 = set(obj, 'b', 5)
// -- // { a: 1, b: 5, c: 3 }
// -- obj2 === obj
// -- // false
// --
// -- // The same object is returned if there are no changes:
// -- set(obj, 'b', 2) === obj
// -- // true
// -- ```
function set(obj, key, val) {
  var fallback = typeof key === 'number' ? [] : {};
  var finalObj = obj == null ? fallback : obj;
  if (finalObj[key] === val) return finalObj;
  var obj2 = clone(finalObj);
  obj2[key] = val;
  return obj2;
}

// -- #### setIn()
// -- Returns a new object with a modified **nested** attribute.
// --
// -- Notes:
// --
// -- * If the provided value is the same as (*referentially equal to*)
// -- the previous value, the original object is returned.
// -- * If the path does not exist, it will be created before setting
// -- the new value.
// --
// -- Usage: `setIn<T: ArrayOrObject>(obj: T, path: Array<Key>, val: any): T`
// --
// -- ```js
// -- obj = { a: 1, b: 2, d: { d1: 3, d2: 4 }, e: { e1: 'foo', e2: 'bar' } }
// -- obj2 = setIn(obj, ['d', 'd1'], 4)
// -- // { a: 1, b: 2, d: { d1: 4, d2: 4 }, e: { e1: 'foo', e2: 'bar' } }
// -- obj2 === obj
// -- // false
// -- obj2.d === obj.d
// -- // false
// -- obj2.e === obj.e
// -- // true
// --
// -- // The same object is returned if there are no changes:
// -- obj3 = setIn(obj, ['d', 'd1'], 3)
// -- // { a: 1, b: 2, d: { d1: 3, d2: 4 }, e: { e1: 'foo', e2: 'bar' } }
// -- obj3 === obj
// -- // true
// -- obj3.d === obj.d
// -- // true
// -- obj3.e === obj.e
// -- // true
// --
// -- // ... unknown paths create intermediate keys. Numeric segments are treated as array indices:
// -- setIn({ a: 3 }, ['unknown', 0, 'path'], 4)
// -- // { a: 3, unknown: [{ path: 4 }] }
// -- ```
function doSetIn(obj, path, val, idx) {
  var newValue = void 0;
  var key = path[idx];
  if (idx === path.length - 1) {
    newValue = val;
  } else {
    var nestedObj = isObject(obj) && isObject(obj[key]) ? obj[key] : typeof path[idx + 1] === 'number' ? [] : {};
    newValue = doSetIn(nestedObj, path, val, idx + 1);
  }
  return set(obj, key, newValue);
}

function setIn(obj, path, val) {
  if (!path.length) return val;
  return doSetIn(obj, path, val, 0);
}

// -- #### update()
// -- Returns a new object with a modified attribute,
// -- calculated via a user-provided callback based on the current value.
// -- If the calculated value is the same as (*referentially equal to*)
// -- the previous value, the original object is returned.
// --
// -- Usage: `update<T: ArrayOrObject>(obj: T, key: Key,
// -- fnUpdate: (prevValue: any) => any): T`
// --
// -- ```js
// -- obj = { a: 1, b: 2, c: 3 }
// -- obj2 = update(obj, 'b', (val) => val + 1)
// -- // { a: 1, b: 3, c: 3 }
// -- obj2 === obj
// -- // false
// --
// -- // The same object is returned if there are no changes:
// -- update(obj, 'b', (val) => val) === obj
// -- // true
// -- ```
function update(obj, key, fnUpdate) {
  var prevVal = obj == null ? undefined : obj[key];
  var nextVal = fnUpdate(prevVal);
  return set(obj, key, nextVal);
}

// -- #### updateIn()
// -- Returns a new object with a modified **nested** attribute,
// -- calculated via a user-provided callback based on the current value.
// -- If the calculated value is the same as (*referentially equal to*)
// -- the previous value, the original object is returned.
// --
// -- Usage: `updateIn<T: ArrayOrObject>(obj: T, path: Array<Key>,
// -- fnUpdate: (prevValue: any) => any): T`
// --
// -- ```js
// -- obj = { a: 1, d: { d1: 3, d2: 4 } }
// -- obj2 = updateIn(obj, ['d', 'd1'], (val) => val + 1)
// -- // { a: 1, d: { d1: 4, d2: 4 } }
// -- obj2 === obj
// -- // false
// --
// -- // The same object is returned if there are no changes:
// -- obj3 = updateIn(obj, ['d', 'd1'], (val) => val)
// -- // { a: 1, d: { d1: 3, d2: 4 } }
// -- obj3 === obj
// -- // true
// -- ```
function updateIn(obj, path, fnUpdate) {
  var prevVal = getIn(obj, path);
  var nextVal = fnUpdate(prevVal);
  return setIn(obj, path, nextVal);
}

// -- #### merge()
// -- Returns a new object built as follows: the overlapping keys from the
// -- second one overwrite the corresponding entries from the first one.
// -- Similar to `Object.assign()`, but immutable.
// --
// -- Usage:
// --
// -- * `merge(obj1: Object, obj2: ?Object): Object`
// -- * `merge(obj1: Object, ...objects: Array<?Object>): Object`
// --
// -- The unmodified `obj1` is returned if `obj2` does not *provide something
// -- new to* `obj1`, i.e. if either of the following
// -- conditions are true:
// --
// -- * `obj2` is `null` or `undefined`
// -- * `obj2` is an object, but it is empty
// -- * All attributes of `obj2` are `undefined`
// -- * All attributes of `obj2` are referentially equal to the
// --   corresponding attributes of `obj1`
// --
// -- Note that `undefined` attributes in `obj2` do not modify the
// -- corresponding attributes in `obj1`.
// --
// -- ```js
// -- obj1 = { a: 1, b: 2, c: 3 }
// -- obj2 = { c: 4, d: 5 }
// -- obj3 = merge(obj1, obj2)
// -- // { a: 1, b: 2, c: 4, d: 5 }
// -- obj3 === obj1
// -- // false
// --
// -- // The same object is returned if there are no changes:
// -- merge(obj1, { c: 3 }) === obj1
// -- // true
// -- ```
function merge(a, b, c, d, e, f) {
  for (var _len2 = arguments.length, rest = Array(_len2 > 6 ? _len2 - 6 : 0), _key2 = 6; _key2 < _len2; _key2++) {
    rest[_key2 - 6] = arguments[_key2];
  }

  return rest.length ? doMerge.call.apply(doMerge, [null, false, false, a, b, c, d, e, f].concat(rest)) : doMerge(false, false, a, b, c, d, e, f);
}

// -- #### mergeDeep()
// -- Returns a new object built as follows: the overlapping keys from the
// -- second one overwrite the corresponding entries from the first one.
// -- If both the first and second entries are objects they are merged recursively.
// -- Similar to `Object.assign()`, but immutable, and deeply merging.
// --
// -- Usage:
// --
// -- * `mergeDeep(obj1: Object, obj2: ?Object): Object`
// -- * `mergeDeep(obj1: Object, ...objects: Array<?Object>): Object`
// --
// -- The unmodified `obj1` is returned if `obj2` does not *provide something
// -- new to* `obj1`, i.e. if either of the following
// -- conditions are true:
// --
// -- * `obj2` is `null` or `undefined`
// -- * `obj2` is an object, but it is empty
// -- * All attributes of `obj2` are `undefined`
// -- * All attributes of `obj2` are referentially equal to the
// --   corresponding attributes of `obj1`
// --
// -- Note that `undefined` attributes in `obj2` do not modify the
// -- corresponding attributes in `obj1`.
// --
// -- ```js
// -- obj1 = { a: 1, b: 2, c: { a: 1 } }
// -- obj2 = { b: 3, c: { b: 2 } }
// -- obj3 = mergeDeep(obj1, obj2)
// -- // { a: 1, b: 3, c: { a: 1, b: 2 }  }
// -- obj3 === obj1
// -- // false
// --
// -- // The same object is returned if there are no changes:
// -- mergeDeep(obj1, { c: { a: 1 } }) === obj1
// -- // true
// -- ```
function mergeDeep(a, b, c, d, e, f) {
  for (var _len3 = arguments.length, rest = Array(_len3 > 6 ? _len3 - 6 : 0), _key3 = 6; _key3 < _len3; _key3++) {
    rest[_key3 - 6] = arguments[_key3];
  }

  return rest.length ? doMerge.call.apply(doMerge, [null, false, true, a, b, c, d, e, f].concat(rest)) : doMerge(false, true, a, b, c, d, e, f);
}

// -- #### mergeIn()
// -- Similar to `merge()`, but merging the value at a given nested path.
// -- Note that the returned type is the same as that of the first argument.
// --
// -- Usage:
// --
// -- * `mergeIn<T: ArrayOrObject>(obj1: T, path: Array<Key>, obj2: ?Object): T`
// -- * `mergeIn<T: ArrayOrObject>(obj1: T, path: Array<Key>,
// -- ...objects: Array<?Object>): T`
// --
// -- ```js
// -- obj1 = { a: 1, d: { b: { d1: 3, d2: 4 } } }
// -- obj2 = { d3: 5 }
// -- obj3 = mergeIn(obj1, ['d', 'b'], obj2)
// -- // { a: 1, d: { b: { d1: 3, d2: 4, d3: 5 } } }
// -- obj3 === obj1
// -- // false
// --
// -- // The same object is returned if there are no changes:
// -- mergeIn(obj1, ['d', 'b'], { d2: 4 }) === obj1
// -- // true
// -- ```
function mergeIn(a, path, b, c, d, e, f) {
  var prevVal = getIn(a, path);
  if (prevVal == null) prevVal = {};
  var nextVal = void 0;

  for (var _len4 = arguments.length, rest = Array(_len4 > 7 ? _len4 - 7 : 0), _key4 = 7; _key4 < _len4; _key4++) {
    rest[_key4 - 7] = arguments[_key4];
  }

  if (rest.length) {
    nextVal = doMerge.call.apply(doMerge, [null, false, false, prevVal, b, c, d, e, f].concat(rest));
  } else {
    nextVal = doMerge(false, false, prevVal, b, c, d, e, f);
  }
  return setIn(a, path, nextVal);
}

// -- #### omit()
// -- Returns an object excluding one or several attributes.
// --
// -- Usage: `omit(obj: Object, attrs: Array<string>|string): Object`
//
// -- ```js
// -- obj = { a: 1, b: 2, c: 3, d: 4 }
// -- omit(obj, 'a')
// -- // { b: 2, c: 3, d: 4 }
// -- omit(obj, ['b', 'c'])
// -- // { a: 1, d: 4 }
// --
// -- // The same object is returned if there are no changes:
// -- omit(obj, 'z') === obj1
// -- // true
// -- ```
function omit(obj, attrs) {
  var omitList = Array.isArray(attrs) ? attrs : [attrs];
  var fDoSomething = false;
  for (var i = 0; i < omitList.length; i++) {
    if (hasOwnProperty$1.call(obj, omitList[i])) {
      fDoSomething = true;
      break;
    }
  }
  if (!fDoSomething) return obj;
  var out = {};
  var keys = getKeysAndSymbols(obj);
  for (var _i = 0; _i < keys.length; _i++) {
    var key = keys[_i];
    if (omitList.indexOf(key) >= 0) continue;
    out[key] = obj[key];
  }
  return out;
}

// -- #### addDefaults()
// -- Returns a new object built as follows: `undefined` keys in the first one
// -- are filled in with the corresponding values from the second one
// -- (even if they are `null`).
// --
// -- Usage:
// --
// -- * `addDefaults(obj: Object, defaults: Object): Object`
// -- * `addDefaults(obj: Object, ...defaultObjects: Array<?Object>): Object`
// --
// -- ```js
// -- obj1 = { a: 1, b: 2, c: 3 }
// -- obj2 = { c: 4, d: 5, e: null }
// -- obj3 = addDefaults(obj1, obj2)
// -- // { a: 1, b: 2, c: 3, d: 5, e: null }
// -- obj3 === obj1
// -- // false
// --
// -- // The same object is returned if there are no changes:
// -- addDefaults(obj1, { c: 4 }) === obj1
// -- // true
// -- ```
function addDefaults(a, b, c, d, e, f) {
  for (var _len5 = arguments.length, rest = Array(_len5 > 6 ? _len5 - 6 : 0), _key5 = 6; _key5 < _len5; _key5++) {
    rest[_key5 - 6] = arguments[_key5];
  }

  return rest.length ? doMerge.call.apply(doMerge, [null, true, false, a, b, c, d, e, f].concat(rest)) : doMerge(true, false, a, b, c, d, e, f);
}

// ===============================================
// ### Public API
// ===============================================
var timm = {
  clone: clone,
  addLast: addLast,
  addFirst: addFirst,
  removeLast: removeLast,
  removeFirst: removeFirst,
  insert: insert,
  removeAt: removeAt,
  replaceAt: replaceAt,

  getIn: getIn,
  // eslint-disable-next-line object-shorthand
  set: set, // so that flow doesn't complain
  setIn: setIn,
  update: update,
  updateIn: updateIn,
  merge: merge,
  mergeDeep: mergeDeep,
  mergeIn: mergeIn,
  omit: omit,
  addDefaults: addDefaults
};

exports.default = timm;

var timm$1 = /*#__PURE__*/Object.freeze({

});

/*
  Copyright (c) 2008, Adobe Systems Incorporated
  All rights reserved.

  Redistribution and use in source and binary forms, with or without 
  modification, are permitted provided that the following conditions are
  met:

  * Redistributions of source code must retain the above copyright notice, 
    this list of conditions and the following disclaimer.
  
  * Redistributions in binary form must reproduce the above copyright
    notice, this list of conditions and the following disclaimer in the 
    documentation and/or other materials provided with the distribution.
  
  * Neither the name of Adobe Systems Incorporated nor the names of its 
    contributors may be used to endorse or promote products derived from 
    this software without specific prior written permission.

  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS
  IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
  THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
  PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR 
  CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
  EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
  PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
  PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
  LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
  SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/
/*
JPEG encoder ported to JavaScript and optimized by Andreas Ritter, www.bytestrom.eu, 11/2009

Basic GUI blocking jpeg encoder
*/

var btoa = btoa || function(buf) {
  return new Buffer(buf).toString('base64');
};

function JPEGEncoder(quality) {
	var ffloor = Math.floor;
	var YTable = new Array(64);
	var UVTable = new Array(64);
	var fdtbl_Y = new Array(64);
	var fdtbl_UV = new Array(64);
	var YDC_HT;
	var UVDC_HT;
	var YAC_HT;
	var UVAC_HT;
	
	var bitcode = new Array(65535);
	var category = new Array(65535);
	var outputfDCTQuant = new Array(64);
	var DU = new Array(64);
	var byteout = [];
	var bytenew = 0;
	var bytepos = 7;
	
	var YDU = new Array(64);
	var UDU = new Array(64);
	var VDU = new Array(64);
	var clt = new Array(256);
	var RGB_YUV_TABLE = new Array(2048);
	var currentQuality;
	
	var ZigZag = [
			 0, 1, 5, 6,14,15,27,28,
			 2, 4, 7,13,16,26,29,42,
			 3, 8,12,17,25,30,41,43,
			 9,11,18,24,31,40,44,53,
			10,19,23,32,39,45,52,54,
			20,22,33,38,46,51,55,60,
			21,34,37,47,50,56,59,61,
			35,36,48,49,57,58,62,63
		];
	
	var std_dc_luminance_nrcodes = [0,0,1,5,1,1,1,1,1,1,0,0,0,0,0,0,0];
	var std_dc_luminance_values = [0,1,2,3,4,5,6,7,8,9,10,11];
	var std_ac_luminance_nrcodes = [0,0,2,1,3,3,2,4,3,5,5,4,4,0,0,1,0x7d];
	var std_ac_luminance_values = [
			0x01,0x02,0x03,0x00,0x04,0x11,0x05,0x12,
			0x21,0x31,0x41,0x06,0x13,0x51,0x61,0x07,
			0x22,0x71,0x14,0x32,0x81,0x91,0xa1,0x08,
			0x23,0x42,0xb1,0xc1,0x15,0x52,0xd1,0xf0,
			0x24,0x33,0x62,0x72,0x82,0x09,0x0a,0x16,
			0x17,0x18,0x19,0x1a,0x25,0x26,0x27,0x28,
			0x29,0x2a,0x34,0x35,0x36,0x37,0x38,0x39,
			0x3a,0x43,0x44,0x45,0x46,0x47,0x48,0x49,
			0x4a,0x53,0x54,0x55,0x56,0x57,0x58,0x59,
			0x5a,0x63,0x64,0x65,0x66,0x67,0x68,0x69,
			0x6a,0x73,0x74,0x75,0x76,0x77,0x78,0x79,
			0x7a,0x83,0x84,0x85,0x86,0x87,0x88,0x89,
			0x8a,0x92,0x93,0x94,0x95,0x96,0x97,0x98,
			0x99,0x9a,0xa2,0xa3,0xa4,0xa5,0xa6,0xa7,
			0xa8,0xa9,0xaa,0xb2,0xb3,0xb4,0xb5,0xb6,
			0xb7,0xb8,0xb9,0xba,0xc2,0xc3,0xc4,0xc5,
			0xc6,0xc7,0xc8,0xc9,0xca,0xd2,0xd3,0xd4,
			0xd5,0xd6,0xd7,0xd8,0xd9,0xda,0xe1,0xe2,
			0xe3,0xe4,0xe5,0xe6,0xe7,0xe8,0xe9,0xea,
			0xf1,0xf2,0xf3,0xf4,0xf5,0xf6,0xf7,0xf8,
			0xf9,0xfa
		];
	
	var std_dc_chrominance_nrcodes = [0,0,3,1,1,1,1,1,1,1,1,1,0,0,0,0,0];
	var std_dc_chrominance_values = [0,1,2,3,4,5,6,7,8,9,10,11];
	var std_ac_chrominance_nrcodes = [0,0,2,1,2,4,4,3,4,7,5,4,4,0,1,2,0x77];
	var std_ac_chrominance_values = [
			0x00,0x01,0x02,0x03,0x11,0x04,0x05,0x21,
			0x31,0x06,0x12,0x41,0x51,0x07,0x61,0x71,
			0x13,0x22,0x32,0x81,0x08,0x14,0x42,0x91,
			0xa1,0xb1,0xc1,0x09,0x23,0x33,0x52,0xf0,
			0x15,0x62,0x72,0xd1,0x0a,0x16,0x24,0x34,
			0xe1,0x25,0xf1,0x17,0x18,0x19,0x1a,0x26,
			0x27,0x28,0x29,0x2a,0x35,0x36,0x37,0x38,
			0x39,0x3a,0x43,0x44,0x45,0x46,0x47,0x48,
			0x49,0x4a,0x53,0x54,0x55,0x56,0x57,0x58,
			0x59,0x5a,0x63,0x64,0x65,0x66,0x67,0x68,
			0x69,0x6a,0x73,0x74,0x75,0x76,0x77,0x78,
			0x79,0x7a,0x82,0x83,0x84,0x85,0x86,0x87,
			0x88,0x89,0x8a,0x92,0x93,0x94,0x95,0x96,
			0x97,0x98,0x99,0x9a,0xa2,0xa3,0xa4,0xa5,
			0xa6,0xa7,0xa8,0xa9,0xaa,0xb2,0xb3,0xb4,
			0xb5,0xb6,0xb7,0xb8,0xb9,0xba,0xc2,0xc3,
			0xc4,0xc5,0xc6,0xc7,0xc8,0xc9,0xca,0xd2,
			0xd3,0xd4,0xd5,0xd6,0xd7,0xd8,0xd9,0xda,
			0xe2,0xe3,0xe4,0xe5,0xe6,0xe7,0xe8,0xe9,
			0xea,0xf2,0xf3,0xf4,0xf5,0xf6,0xf7,0xf8,
			0xf9,0xfa
		];
	
	function initQuantTables(sf){
			var YQT = [
				16, 11, 10, 16, 24, 40, 51, 61,
				12, 12, 14, 19, 26, 58, 60, 55,
				14, 13, 16, 24, 40, 57, 69, 56,
				14, 17, 22, 29, 51, 87, 80, 62,
				18, 22, 37, 56, 68,109,103, 77,
				24, 35, 55, 64, 81,104,113, 92,
				49, 64, 78, 87,103,121,120,101,
				72, 92, 95, 98,112,100,103, 99
			];
			
			for (var i = 0; i < 64; i++) {
				var t = ffloor((YQT[i]*sf+50)/100);
				if (t < 1) {
					t = 1;
				} else if (t > 255) {
					t = 255;
				}
				YTable[ZigZag[i]] = t;
			}
			var UVQT = [
				17, 18, 24, 47, 99, 99, 99, 99,
				18, 21, 26, 66, 99, 99, 99, 99,
				24, 26, 56, 99, 99, 99, 99, 99,
				47, 66, 99, 99, 99, 99, 99, 99,
				99, 99, 99, 99, 99, 99, 99, 99,
				99, 99, 99, 99, 99, 99, 99, 99,
				99, 99, 99, 99, 99, 99, 99, 99,
				99, 99, 99, 99, 99, 99, 99, 99
			];
			for (var j = 0; j < 64; j++) {
				var u = ffloor((UVQT[j]*sf+50)/100);
				if (u < 1) {
					u = 1;
				} else if (u > 255) {
					u = 255;
				}
				UVTable[ZigZag[j]] = u;
			}
			var aasf = [
				1.0, 1.387039845, 1.306562965, 1.175875602,
				1.0, 0.785694958, 0.541196100, 0.275899379
			];
			var k = 0;
			for (var row = 0; row < 8; row++)
			{
				for (var col = 0; col < 8; col++)
				{
					fdtbl_Y[k]  = (1.0 / (YTable [ZigZag[k]] * aasf[row] * aasf[col] * 8.0));
					fdtbl_UV[k] = (1.0 / (UVTable[ZigZag[k]] * aasf[row] * aasf[col] * 8.0));
					k++;
				}
			}
		}
		
		function computeHuffmanTbl(nrcodes, std_table){
			var codevalue = 0;
			var pos_in_table = 0;
			var HT = new Array();
			for (var k = 1; k <= 16; k++) {
				for (var j = 1; j <= nrcodes[k]; j++) {
					HT[std_table[pos_in_table]] = [];
					HT[std_table[pos_in_table]][0] = codevalue;
					HT[std_table[pos_in_table]][1] = k;
					pos_in_table++;
					codevalue++;
				}
				codevalue*=2;
			}
			return HT;
		}
		
		function initHuffmanTbl()
		{
			YDC_HT = computeHuffmanTbl(std_dc_luminance_nrcodes,std_dc_luminance_values);
			UVDC_HT = computeHuffmanTbl(std_dc_chrominance_nrcodes,std_dc_chrominance_values);
			YAC_HT = computeHuffmanTbl(std_ac_luminance_nrcodes,std_ac_luminance_values);
			UVAC_HT = computeHuffmanTbl(std_ac_chrominance_nrcodes,std_ac_chrominance_values);
		}
	
		function initCategoryNumber()
		{
			var nrlower = 1;
			var nrupper = 2;
			for (var cat = 1; cat <= 15; cat++) {
				//Positive numbers
				for (var nr = nrlower; nr<nrupper; nr++) {
					category[32767+nr] = cat;
					bitcode[32767+nr] = [];
					bitcode[32767+nr][1] = cat;
					bitcode[32767+nr][0] = nr;
				}
				//Negative numbers
				for (var nrneg =-(nrupper-1); nrneg<=-nrlower; nrneg++) {
					category[32767+nrneg] = cat;
					bitcode[32767+nrneg] = [];
					bitcode[32767+nrneg][1] = cat;
					bitcode[32767+nrneg][0] = nrupper-1+nrneg;
				}
				nrlower <<= 1;
				nrupper <<= 1;
			}
		}
		
		function initRGBYUVTable() {
			for(var i = 0; i < 256;i++) {
				RGB_YUV_TABLE[i]      		=  19595 * i;
				RGB_YUV_TABLE[(i+ 256)>>0] 	=  38470 * i;
				RGB_YUV_TABLE[(i+ 512)>>0] 	=   7471 * i + 0x8000;
				RGB_YUV_TABLE[(i+ 768)>>0] 	= -11059 * i;
				RGB_YUV_TABLE[(i+1024)>>0] 	= -21709 * i;
				RGB_YUV_TABLE[(i+1280)>>0] 	=  32768 * i + 0x807FFF;
				RGB_YUV_TABLE[(i+1536)>>0] 	= -27439 * i;
				RGB_YUV_TABLE[(i+1792)>>0] 	= - 5329 * i;
			}
		}
		
		// IO functions
		function writeBits(bs)
		{
			var value = bs[0];
			var posval = bs[1]-1;
			while ( posval >= 0 ) {
				if (value & (1 << posval) ) {
					bytenew |= (1 << bytepos);
				}
				posval--;
				bytepos--;
				if (bytepos < 0) {
					if (bytenew == 0xFF) {
						writeByte(0xFF);
						writeByte(0);
					}
					else {
						writeByte(bytenew);
					}
					bytepos=7;
					bytenew=0;
				}
			}
		}
	
		function writeByte(value)
		{
			//byteout.push(clt[value]); // write char directly instead of converting later
      byteout.push(value);
		}
	
		function writeWord(value)
		{
			writeByte((value>>8)&0xFF);
			writeByte((value   )&0xFF);
		}
		
		// DCT & quantization core
		function fDCTQuant(data, fdtbl)
		{
			var d0, d1, d2, d3, d4, d5, d6, d7;
			/* Pass 1: process rows. */
			var dataOff=0;
			var i;
			var I8 = 8;
			var I64 = 64;
			for (i=0; i<I8; ++i)
			{
				d0 = data[dataOff];
				d1 = data[dataOff+1];
				d2 = data[dataOff+2];
				d3 = data[dataOff+3];
				d4 = data[dataOff+4];
				d5 = data[dataOff+5];
				d6 = data[dataOff+6];
				d7 = data[dataOff+7];
				
				var tmp0 = d0 + d7;
				var tmp7 = d0 - d7;
				var tmp1 = d1 + d6;
				var tmp6 = d1 - d6;
				var tmp2 = d2 + d5;
				var tmp5 = d2 - d5;
				var tmp3 = d3 + d4;
				var tmp4 = d3 - d4;
	
				/* Even part */
				var tmp10 = tmp0 + tmp3;	/* phase 2 */
				var tmp13 = tmp0 - tmp3;
				var tmp11 = tmp1 + tmp2;
				var tmp12 = tmp1 - tmp2;
	
				data[dataOff] = tmp10 + tmp11; /* phase 3 */
				data[dataOff+4] = tmp10 - tmp11;
	
				var z1 = (tmp12 + tmp13) * 0.707106781; /* c4 */
				data[dataOff+2] = tmp13 + z1; /* phase 5 */
				data[dataOff+6] = tmp13 - z1;
	
				/* Odd part */
				tmp10 = tmp4 + tmp5; /* phase 2 */
				tmp11 = tmp5 + tmp6;
				tmp12 = tmp6 + tmp7;
	
				/* The rotator is modified from fig 4-8 to avoid extra negations. */
				var z5 = (tmp10 - tmp12) * 0.382683433; /* c6 */
				var z2 = 0.541196100 * tmp10 + z5; /* c2-c6 */
				var z4 = 1.306562965 * tmp12 + z5; /* c2+c6 */
				var z3 = tmp11 * 0.707106781; /* c4 */
	
				var z11 = tmp7 + z3;	/* phase 5 */
				var z13 = tmp7 - z3;
	
				data[dataOff+5] = z13 + z2;	/* phase 6 */
				data[dataOff+3] = z13 - z2;
				data[dataOff+1] = z11 + z4;
				data[dataOff+7] = z11 - z4;
	
				dataOff += 8; /* advance pointer to next row */
			}
	
			/* Pass 2: process columns. */
			dataOff = 0;
			for (i=0; i<I8; ++i)
			{
				d0 = data[dataOff];
				d1 = data[dataOff + 8];
				d2 = data[dataOff + 16];
				d3 = data[dataOff + 24];
				d4 = data[dataOff + 32];
				d5 = data[dataOff + 40];
				d6 = data[dataOff + 48];
				d7 = data[dataOff + 56];
				
				var tmp0p2 = d0 + d7;
				var tmp7p2 = d0 - d7;
				var tmp1p2 = d1 + d6;
				var tmp6p2 = d1 - d6;
				var tmp2p2 = d2 + d5;
				var tmp5p2 = d2 - d5;
				var tmp3p2 = d3 + d4;
				var tmp4p2 = d3 - d4;
	
				/* Even part */
				var tmp10p2 = tmp0p2 + tmp3p2;	/* phase 2 */
				var tmp13p2 = tmp0p2 - tmp3p2;
				var tmp11p2 = tmp1p2 + tmp2p2;
				var tmp12p2 = tmp1p2 - tmp2p2;
	
				data[dataOff] = tmp10p2 + tmp11p2; /* phase 3 */
				data[dataOff+32] = tmp10p2 - tmp11p2;
	
				var z1p2 = (tmp12p2 + tmp13p2) * 0.707106781; /* c4 */
				data[dataOff+16] = tmp13p2 + z1p2; /* phase 5 */
				data[dataOff+48] = tmp13p2 - z1p2;
	
				/* Odd part */
				tmp10p2 = tmp4p2 + tmp5p2; /* phase 2 */
				tmp11p2 = tmp5p2 + tmp6p2;
				tmp12p2 = tmp6p2 + tmp7p2;
	
				/* The rotator is modified from fig 4-8 to avoid extra negations. */
				var z5p2 = (tmp10p2 - tmp12p2) * 0.382683433; /* c6 */
				var z2p2 = 0.541196100 * tmp10p2 + z5p2; /* c2-c6 */
				var z4p2 = 1.306562965 * tmp12p2 + z5p2; /* c2+c6 */
				var z3p2 = tmp11p2 * 0.707106781; /* c4 */
	
				var z11p2 = tmp7p2 + z3p2;	/* phase 5 */
				var z13p2 = tmp7p2 - z3p2;
	
				data[dataOff+40] = z13p2 + z2p2; /* phase 6 */
				data[dataOff+24] = z13p2 - z2p2;
				data[dataOff+ 8] = z11p2 + z4p2;
				data[dataOff+56] = z11p2 - z4p2;
	
				dataOff++; /* advance pointer to next column */
			}
	
			// Quantize/descale the coefficients
			var fDCTQuant;
			for (i=0; i<I64; ++i)
			{
				// Apply the quantization and scaling factor & Round to nearest integer
				fDCTQuant = data[i]*fdtbl[i];
				outputfDCTQuant[i] = (fDCTQuant > 0.0) ? ((fDCTQuant + 0.5)|0) : ((fDCTQuant - 0.5)|0);
				//outputfDCTQuant[i] = fround(fDCTQuant);

			}
			return outputfDCTQuant;
		}
		
		function writeAPP0()
		{
			writeWord(0xFFE0); // marker
			writeWord(16); // length
			writeByte(0x4A); // J
			writeByte(0x46); // F
			writeByte(0x49); // I
			writeByte(0x46); // F
			writeByte(0); // = "JFIF",'\0'
			writeByte(1); // versionhi
			writeByte(1); // versionlo
			writeByte(0); // xyunits
			writeWord(1); // xdensity
			writeWord(1); // ydensity
			writeByte(0); // thumbnwidth
			writeByte(0); // thumbnheight
		}
	
		function writeSOF0(width, height)
		{
			writeWord(0xFFC0); // marker
			writeWord(17);   // length, truecolor YUV JPG
			writeByte(8);    // precision
			writeWord(height);
			writeWord(width);
			writeByte(3);    // nrofcomponents
			writeByte(1);    // IdY
			writeByte(0x11); // HVY
			writeByte(0);    // QTY
			writeByte(2);    // IdU
			writeByte(0x11); // HVU
			writeByte(1);    // QTU
			writeByte(3);    // IdV
			writeByte(0x11); // HVV
			writeByte(1);    // QTV
		}
	
		function writeDQT()
		{
			writeWord(0xFFDB); // marker
			writeWord(132);	   // length
			writeByte(0);
			for (var i=0; i<64; i++) {
				writeByte(YTable[i]);
			}
			writeByte(1);
			for (var j=0; j<64; j++) {
				writeByte(UVTable[j]);
			}
		}
	
		function writeDHT()
		{
			writeWord(0xFFC4); // marker
			writeWord(0x01A2); // length
	
			writeByte(0); // HTYDCinfo
			for (var i=0; i<16; i++) {
				writeByte(std_dc_luminance_nrcodes[i+1]);
			}
			for (var j=0; j<=11; j++) {
				writeByte(std_dc_luminance_values[j]);
			}
	
			writeByte(0x10); // HTYACinfo
			for (var k=0; k<16; k++) {
				writeByte(std_ac_luminance_nrcodes[k+1]);
			}
			for (var l=0; l<=161; l++) {
				writeByte(std_ac_luminance_values[l]);
			}
	
			writeByte(1); // HTUDCinfo
			for (var m=0; m<16; m++) {
				writeByte(std_dc_chrominance_nrcodes[m+1]);
			}
			for (var n=0; n<=11; n++) {
				writeByte(std_dc_chrominance_values[n]);
			}
	
			writeByte(0x11); // HTUACinfo
			for (var o=0; o<16; o++) {
				writeByte(std_ac_chrominance_nrcodes[o+1]);
			}
			for (var p=0; p<=161; p++) {
				writeByte(std_ac_chrominance_values[p]);
			}
		}
	
		function writeSOS()
		{
			writeWord(0xFFDA); // marker
			writeWord(12); // length
			writeByte(3); // nrofcomponents
			writeByte(1); // IdY
			writeByte(0); // HTY
			writeByte(2); // IdU
			writeByte(0x11); // HTU
			writeByte(3); // IdV
			writeByte(0x11); // HTV
			writeByte(0); // Ss
			writeByte(0x3f); // Se
			writeByte(0); // Bf
		}
		
		function processDU(CDU, fdtbl, DC, HTDC, HTAC){
			var EOB = HTAC[0x00];
			var M16zeroes = HTAC[0xF0];
			var pos;
			var I16 = 16;
			var I63 = 63;
			var I64 = 64;
			var DU_DCT = fDCTQuant(CDU, fdtbl);
			//ZigZag reorder
			for (var j=0;j<I64;++j) {
				DU[ZigZag[j]]=DU_DCT[j];
			}
			var Diff = DU[0] - DC; DC = DU[0];
			//Encode DC
			if (Diff==0) {
				writeBits(HTDC[0]); // Diff might be 0
			} else {
				pos = 32767+Diff;
				writeBits(HTDC[category[pos]]);
				writeBits(bitcode[pos]);
			}
			//Encode ACs
			var end0pos = 63; // was const... which is crazy
			for (; (end0pos>0)&&(DU[end0pos]==0); end0pos--) {}			//end0pos = first element in reverse order !=0
			if ( end0pos == 0) {
				writeBits(EOB);
				return DC;
			}
			var i = 1;
			var lng;
			while ( i <= end0pos ) {
				var startpos = i;
				for (; (DU[i]==0) && (i<=end0pos); ++i) {}
				var nrzeroes = i-startpos;
				if ( nrzeroes >= I16 ) {
					lng = nrzeroes>>4;
					for (var nrmarker=1; nrmarker <= lng; ++nrmarker)
						writeBits(M16zeroes);
					nrzeroes = nrzeroes&0xF;
				}
				pos = 32767+DU[i];
				writeBits(HTAC[(nrzeroes<<4)+category[pos]]);
				writeBits(bitcode[pos]);
				i++;
			}
			if ( end0pos != I63 ) {
				writeBits(EOB);
			}
			return DC;
		}

		function initCharLookupTable(){
			var sfcc = String.fromCharCode;
			for(var i=0; i < 256; i++){ ///// ACHTUNG // 255
				clt[i] = sfcc(i);
			}
		}
		
		this.encode = function(image,quality) // image data object
		{
			var time_start = new Date().getTime();
			
			if(quality) setQuality(quality);
			
			// Initialize bit writer
			byteout = new Array();
			bytenew=0;
			bytepos=7;
	
			// Add JPEG headers
			writeWord(0xFFD8); // SOI
			writeAPP0();
			writeDQT();
			writeSOF0(image.width,image.height);
			writeDHT();
			writeSOS();

	
			// Encode 8x8 macroblocks
			var DCY=0;
			var DCU=0;
			var DCV=0;
			
			bytenew=0;
			bytepos=7;
			
			
			this.encode.displayName = "_encode_";

			var imageData = image.data;
			var width = image.width;
			var height = image.height;

			var quadWidth = width*4;
			
			var x, y = 0;
			var r, g, b;
			var start,p, col,row,pos;
			while(y < height){
				x = 0;
				while(x < quadWidth){
				start = quadWidth * y + x;
				p = start;
				col = -1;
				row = 0;
				
				for(pos=0; pos < 64; pos++){
					row = pos >> 3;// /8
					col = ( pos & 7 ) * 4; // %8
					p = start + ( row * quadWidth ) + col;		
					
					if(y+row >= height){ // padding bottom
						p-= (quadWidth*(y+1+row-height));
					}

					if(x+col >= quadWidth){ // padding right	
						p-= ((x+col) - quadWidth +4);
					}
					
					r = imageData[ p++ ];
					g = imageData[ p++ ];
					b = imageData[ p++ ];
					
					
					/* // calculate YUV values dynamically
					YDU[pos]=((( 0.29900)*r+( 0.58700)*g+( 0.11400)*b))-128; //-0x80
					UDU[pos]=(((-0.16874)*r+(-0.33126)*g+( 0.50000)*b));
					VDU[pos]=((( 0.50000)*r+(-0.41869)*g+(-0.08131)*b));
					*/
					
					// use lookup table (slightly faster)
					YDU[pos] = ((RGB_YUV_TABLE[r]             + RGB_YUV_TABLE[(g +  256)>>0] + RGB_YUV_TABLE[(b +  512)>>0]) >> 16)-128;
					UDU[pos] = ((RGB_YUV_TABLE[(r +  768)>>0] + RGB_YUV_TABLE[(g + 1024)>>0] + RGB_YUV_TABLE[(b + 1280)>>0]) >> 16)-128;
					VDU[pos] = ((RGB_YUV_TABLE[(r + 1280)>>0] + RGB_YUV_TABLE[(g + 1536)>>0] + RGB_YUV_TABLE[(b + 1792)>>0]) >> 16)-128;

				}
				
				DCY = processDU(YDU, fdtbl_Y, DCY, YDC_HT, YAC_HT);
				DCU = processDU(UDU, fdtbl_UV, DCU, UVDC_HT, UVAC_HT);
				DCV = processDU(VDU, fdtbl_UV, DCV, UVDC_HT, UVAC_HT);
				x+=32;
				}
				y+=8;
			}
			
			
			////////////////////////////////////////////////////////////////
	
			// Do the bit alignment of the EOI marker
			if ( bytepos >= 0 ) {
				var fillbits = [];
				fillbits[1] = bytepos+1;
				fillbits[0] = (1<<(bytepos+1))-1;
				writeBits(fillbits);
			}
	
			writeWord(0xFFD9); //EOI

      //return new Uint8Array(byteout);
      return new Buffer(byteout);

			var jpegDataUri = 'data:image/jpeg;base64,' + btoa(byteout.join(''));
			
			byteout = [];
			
			// benchmarking
			var duration = new Date().getTime() - time_start;
    		//console.log('Encoding time: '+ duration + 'ms');
    		//
			
			return jpegDataUri			
	};
	
	function setQuality(quality){
		if (quality <= 0) {
			quality = 1;
		}
		if (quality > 100) {
			quality = 100;
		}
		
		if(currentQuality == quality) return // don't recalc if unchanged
		
		var sf = 0;
		if (quality < 50) {
			sf = Math.floor(5000 / quality);
		} else {
			sf = Math.floor(200 - quality*2);
		}
		
		initQuantTables(sf);
		currentQuality = quality;
		//console.log('Quality set to: '+quality +'%');
	}
	
	function init(){
		var time_start = new Date().getTime();
		if(!quality) quality = 50;
		// Create tables
		initCharLookupTable();
		initHuffmanTbl();
		initCategoryNumber();
		initRGBYUVTable();
		
		setQuality(quality);
		var duration = new Date().getTime() - time_start;
    	//console.log('Initialization '+ duration + 'ms');
	}
	
	init();
	
}module.exports = encode;

function encode(imgData, qu) {
  if (typeof qu === 'undefined') qu = 50;
  var encoder = new JPEGEncoder(qu);
	var data = encoder.encode(imgData, qu);
  return {
    data: data,
    width: imgData.width,
    height: imgData.height
  };
}

var encoder = /*#__PURE__*/Object.freeze({

});

/* -*- tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- /
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */
/*
   Copyright 2011 notmasteryet

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/

// - The JPEG specification can be found in the ITU CCITT Recommendation T.81
//   (www.w3.org/Graphics/JPEG/itu-t81.pdf)
// - The JFIF specification can be found in the JPEG File Interchange Format
//   (www.w3.org/Graphics/JPEG/jfif3.pdf)
// - The Adobe Application-Specific JPEG markers in the Supporting the DCT Filters
//   in PostScript Level 2, Technical Note #5116
//   (partners.adobe.com/public/developer/en/ps/sdk/5116.DCT_Filter.pdf)

var JpegImage = (function jpegImage() {
  var dctZigZag = new Int32Array([
     0,
     1,  8,
    16,  9,  2,
     3, 10, 17, 24,
    32, 25, 18, 11, 4,
     5, 12, 19, 26, 33, 40,
    48, 41, 34, 27, 20, 13,  6,
     7, 14, 21, 28, 35, 42, 49, 56,
    57, 50, 43, 36, 29, 22, 15,
    23, 30, 37, 44, 51, 58,
    59, 52, 45, 38, 31,
    39, 46, 53, 60,
    61, 54, 47,
    55, 62,
    63
  ]);

  var dctCos1  =  4017;   // cos(pi/16)
  var dctSin1  =   799;   // sin(pi/16)
  var dctCos3  =  3406;   // cos(3*pi/16)
  var dctSin3  =  2276;   // sin(3*pi/16)
  var dctCos6  =  1567;   // cos(6*pi/16)
  var dctSin6  =  3784;   // sin(6*pi/16)
  var dctSqrt2 =  5793;   // sqrt(2)
  var dctSqrt1d2 = 2896;  // sqrt(2) / 2

  function constructor() {
  }

  function buildHuffmanTable(codeLengths, values) {
    var k = 0, code = [], i, j, length = 16;
    while (length > 0 && !codeLengths[length - 1])
      length--;
    code.push({children: [], index: 0});
    var p = code[0], q;
    for (i = 0; i < length; i++) {
      for (j = 0; j < codeLengths[i]; j++) {
        p = code.pop();
        p.children[p.index] = values[k];
        while (p.index > 0) {
          p = code.pop();
        }
        p.index++;
        code.push(p);
        while (code.length <= i) {
          code.push(q = {children: [], index: 0});
          p.children[p.index] = q.children;
          p = q;
        }
        k++;
      }
      if (i + 1 < length) {
        // p here points to last code
        code.push(q = {children: [], index: 0});
        p.children[p.index] = q.children;
        p = q;
      }
    }
    return code[0].children;
  }

  function decodeScan(data, offset,
                      frame, components, resetInterval,
                      spectralStart, spectralEnd,
                      successivePrev, successive) {
    var precision = frame.precision;
    var samplesPerLine = frame.samplesPerLine;
    var scanLines = frame.scanLines;
    var mcusPerLine = frame.mcusPerLine;
    var progressive = frame.progressive;
    var maxH = frame.maxH, maxV = frame.maxV;

    var startOffset = offset, bitsData = 0, bitsCount = 0;
    function readBit() {
      if (bitsCount > 0) {
        bitsCount--;
        return (bitsData >> bitsCount) & 1;
      }
      bitsData = data[offset++];
      if (bitsData == 0xFF) {
        var nextByte = data[offset++];
        if (nextByte) {
          throw new Error("unexpected marker: " + ((bitsData << 8) | nextByte).toString(16));
        }
        // unstuff 0
      }
      bitsCount = 7;
      return bitsData >>> 7;
    }
    function decodeHuffman(tree) {
      var node = tree, bit;
      while ((bit = readBit()) !== null) {
        node = node[bit];
        if (typeof node === 'number')
          return node;
        if (typeof node !== 'object')
          throw new Error("invalid huffman sequence");
      }
      return null;
    }
    function receive(length) {
      var n = 0;
      while (length > 0) {
        var bit = readBit();
        if (bit === null) return;
        n = (n << 1) | bit;
        length--;
      }
      return n;
    }
    function receiveAndExtend(length) {
      var n = receive(length);
      if (n >= 1 << (length - 1))
        return n;
      return n + (-1 << length) + 1;
    }
    function decodeBaseline(component, zz) {
      var t = decodeHuffman(component.huffmanTableDC);
      var diff = t === 0 ? 0 : receiveAndExtend(t);
      zz[0]= (component.pred += diff);
      var k = 1;
      while (k < 64) {
        var rs = decodeHuffman(component.huffmanTableAC);
        var s = rs & 15, r = rs >> 4;
        if (s === 0) {
          if (r < 15)
            break;
          k += 16;
          continue;
        }
        k += r;
        var z = dctZigZag[k];
        zz[z] = receiveAndExtend(s);
        k++;
      }
    }
    function decodeDCFirst(component, zz) {
      var t = decodeHuffman(component.huffmanTableDC);
      var diff = t === 0 ? 0 : (receiveAndExtend(t) << successive);
      zz[0] = (component.pred += diff);
    }
    function decodeDCSuccessive(component, zz) {
      zz[0] |= readBit() << successive;
    }
    var eobrun = 0;
    function decodeACFirst(component, zz) {
      if (eobrun > 0) {
        eobrun--;
        return;
      }
      var k = spectralStart, e = spectralEnd;
      while (k <= e) {
        var rs = decodeHuffman(component.huffmanTableAC);
        var s = rs & 15, r = rs >> 4;
        if (s === 0) {
          if (r < 15) {
            eobrun = receive(r) + (1 << r) - 1;
            break;
          }
          k += 16;
          continue;
        }
        k += r;
        var z = dctZigZag[k];
        zz[z] = receiveAndExtend(s) * (1 << successive);
        k++;
      }
    }
    var successiveACState = 0, successiveACNextValue;
    function decodeACSuccessive(component, zz) {
      var k = spectralStart, e = spectralEnd, r = 0;
      while (k <= e) {
        var z = dctZigZag[k];
        var direction = zz[z] < 0 ? -1 : 1;
        switch (successiveACState) {
        case 0: // initial state
          var rs = decodeHuffman(component.huffmanTableAC);
          var s = rs & 15, r = rs >> 4;
          if (s === 0) {
            if (r < 15) {
              eobrun = receive(r) + (1 << r);
              successiveACState = 4;
            } else {
              r = 16;
              successiveACState = 1;
            }
          } else {
            if (s !== 1)
              throw new Error("invalid ACn encoding");
            successiveACNextValue = receiveAndExtend(s);
            successiveACState = r ? 2 : 3;
          }
          continue;
        case 1: // skipping r zero items
        case 2:
          if (zz[z])
            zz[z] += (readBit() << successive) * direction;
          else {
            r--;
            if (r === 0)
              successiveACState = successiveACState == 2 ? 3 : 0;
          }
          break;
        case 3: // set value for a zero item
          if (zz[z])
            zz[z] += (readBit() << successive) * direction;
          else {
            zz[z] = successiveACNextValue << successive;
            successiveACState = 0;
          }
          break;
        case 4: // eob
          if (zz[z])
            zz[z] += (readBit() << successive) * direction;
          break;
        }
        k++;
      }
      if (successiveACState === 4) {
        eobrun--;
        if (eobrun === 0)
          successiveACState = 0;
      }
    }
    function decodeMcu(component, decode, mcu, row, col) {
      var mcuRow = (mcu / mcusPerLine) | 0;
      var mcuCol = mcu % mcusPerLine;
      var blockRow = mcuRow * component.v + row;
      var blockCol = mcuCol * component.h + col;
      decode(component, component.blocks[blockRow][blockCol]);
    }
    function decodeBlock(component, decode, mcu) {
      var blockRow = (mcu / component.blocksPerLine) | 0;
      var blockCol = mcu % component.blocksPerLine;
      decode(component, component.blocks[blockRow][blockCol]);
    }

    var componentsLength = components.length;
    var component, i, j, k, n;
    var decodeFn;
    if (progressive) {
      if (spectralStart === 0)
        decodeFn = successivePrev === 0 ? decodeDCFirst : decodeDCSuccessive;
      else
        decodeFn = successivePrev === 0 ? decodeACFirst : decodeACSuccessive;
    } else {
      decodeFn = decodeBaseline;
    }

    var mcu = 0, marker;
    var mcuExpected;
    if (componentsLength == 1) {
      mcuExpected = components[0].blocksPerLine * components[0].blocksPerColumn;
    } else {
      mcuExpected = mcusPerLine * frame.mcusPerColumn;
    }
    if (!resetInterval) resetInterval = mcuExpected;

    var h, v;
    while (mcu < mcuExpected) {
      // reset interval stuff
      for (i = 0; i < componentsLength; i++)
        components[i].pred = 0;
      eobrun = 0;

      if (componentsLength == 1) {
        component = components[0];
        for (n = 0; n < resetInterval; n++) {
          decodeBlock(component, decodeFn, mcu);
          mcu++;
        }
      } else {
        for (n = 0; n < resetInterval; n++) {
          for (i = 0; i < componentsLength; i++) {
            component = components[i];
            h = component.h;
            v = component.v;
            for (j = 0; j < v; j++) {
              for (k = 0; k < h; k++) {
                decodeMcu(component, decodeFn, mcu, j, k);
              }
            }
          }
          mcu++;

          // If we've reached our expected MCU's, stop decoding
          if (mcu === mcuExpected) break;
        }
      }

      // find marker
      bitsCount = 0;
      marker = (data[offset] << 8) | data[offset + 1];
      if (marker < 0xFF00) {
        throw new Error("marker was not found");
      }

      if (marker >= 0xFFD0 && marker <= 0xFFD7) { // RSTx
        offset += 2;
      }
      else
        break;
    }

    return offset - startOffset;
  }

  function buildComponentData(frame, component) {
    var lines = [];
    var blocksPerLine = component.blocksPerLine;
    var blocksPerColumn = component.blocksPerColumn;
    var samplesPerLine = blocksPerLine << 3;
    var R = new Int32Array(64), r = new Uint8Array(64);

    // A port of poppler's IDCT method which in turn is taken from:
    //   Christoph Loeffler, Adriaan Ligtenberg, George S. Moschytz,
    //   "Practical Fast 1-D DCT Algorithms with 11 Multiplications",
    //   IEEE Intl. Conf. on Acoustics, Speech & Signal Processing, 1989,
    //   988-991.
    function quantizeAndInverse(zz, dataOut, dataIn) {
      var qt = component.quantizationTable;
      var v0, v1, v2, v3, v4, v5, v6, v7, t;
      var p = dataIn;
      var i;

      // dequant
      for (i = 0; i < 64; i++)
        p[i] = zz[i] * qt[i];

      // inverse DCT on rows
      for (i = 0; i < 8; ++i) {
        var row = 8 * i;

        // check for all-zero AC coefficients
        if (p[1 + row] == 0 && p[2 + row] == 0 && p[3 + row] == 0 &&
            p[4 + row] == 0 && p[5 + row] == 0 && p[6 + row] == 0 &&
            p[7 + row] == 0) {
          t = (dctSqrt2 * p[0 + row] + 512) >> 10;
          p[0 + row] = t;
          p[1 + row] = t;
          p[2 + row] = t;
          p[3 + row] = t;
          p[4 + row] = t;
          p[5 + row] = t;
          p[6 + row] = t;
          p[7 + row] = t;
          continue;
        }

        // stage 4
        v0 = (dctSqrt2 * p[0 + row] + 128) >> 8;
        v1 = (dctSqrt2 * p[4 + row] + 128) >> 8;
        v2 = p[2 + row];
        v3 = p[6 + row];
        v4 = (dctSqrt1d2 * (p[1 + row] - p[7 + row]) + 128) >> 8;
        v7 = (dctSqrt1d2 * (p[1 + row] + p[7 + row]) + 128) >> 8;
        v5 = p[3 + row] << 4;
        v6 = p[5 + row] << 4;

        // stage 3
        t = (v0 - v1+ 1) >> 1;
        v0 = (v0 + v1 + 1) >> 1;
        v1 = t;
        t = (v2 * dctSin6 + v3 * dctCos6 + 128) >> 8;
        v2 = (v2 * dctCos6 - v3 * dctSin6 + 128) >> 8;
        v3 = t;
        t = (v4 - v6 + 1) >> 1;
        v4 = (v4 + v6 + 1) >> 1;
        v6 = t;
        t = (v7 + v5 + 1) >> 1;
        v5 = (v7 - v5 + 1) >> 1;
        v7 = t;

        // stage 2
        t = (v0 - v3 + 1) >> 1;
        v0 = (v0 + v3 + 1) >> 1;
        v3 = t;
        t = (v1 - v2 + 1) >> 1;
        v1 = (v1 + v2 + 1) >> 1;
        v2 = t;
        t = (v4 * dctSin3 + v7 * dctCos3 + 2048) >> 12;
        v4 = (v4 * dctCos3 - v7 * dctSin3 + 2048) >> 12;
        v7 = t;
        t = (v5 * dctSin1 + v6 * dctCos1 + 2048) >> 12;
        v5 = (v5 * dctCos1 - v6 * dctSin1 + 2048) >> 12;
        v6 = t;

        // stage 1
        p[0 + row] = v0 + v7;
        p[7 + row] = v0 - v7;
        p[1 + row] = v1 + v6;
        p[6 + row] = v1 - v6;
        p[2 + row] = v2 + v5;
        p[5 + row] = v2 - v5;
        p[3 + row] = v3 + v4;
        p[4 + row] = v3 - v4;
      }

      // inverse DCT on columns
      for (i = 0; i < 8; ++i) {
        var col = i;

        // check for all-zero AC coefficients
        if (p[1*8 + col] == 0 && p[2*8 + col] == 0 && p[3*8 + col] == 0 &&
            p[4*8 + col] == 0 && p[5*8 + col] == 0 && p[6*8 + col] == 0 &&
            p[7*8 + col] == 0) {
          t = (dctSqrt2 * dataIn[i+0] + 8192) >> 14;
          p[0*8 + col] = t;
          p[1*8 + col] = t;
          p[2*8 + col] = t;
          p[3*8 + col] = t;
          p[4*8 + col] = t;
          p[5*8 + col] = t;
          p[6*8 + col] = t;
          p[7*8 + col] = t;
          continue;
        }

        // stage 4
        v0 = (dctSqrt2 * p[0*8 + col] + 2048) >> 12;
        v1 = (dctSqrt2 * p[4*8 + col] + 2048) >> 12;
        v2 = p[2*8 + col];
        v3 = p[6*8 + col];
        v4 = (dctSqrt1d2 * (p[1*8 + col] - p[7*8 + col]) + 2048) >> 12;
        v7 = (dctSqrt1d2 * (p[1*8 + col] + p[7*8 + col]) + 2048) >> 12;
        v5 = p[3*8 + col];
        v6 = p[5*8 + col];

        // stage 3
        t = (v0 - v1 + 1) >> 1;
        v0 = (v0 + v1 + 1) >> 1;
        v1 = t;
        t = (v2 * dctSin6 + v3 * dctCos6 + 2048) >> 12;
        v2 = (v2 * dctCos6 - v3 * dctSin6 + 2048) >> 12;
        v3 = t;
        t = (v4 - v6 + 1) >> 1;
        v4 = (v4 + v6 + 1) >> 1;
        v6 = t;
        t = (v7 + v5 + 1) >> 1;
        v5 = (v7 - v5 + 1) >> 1;
        v7 = t;

        // stage 2
        t = (v0 - v3 + 1) >> 1;
        v0 = (v0 + v3 + 1) >> 1;
        v3 = t;
        t = (v1 - v2 + 1) >> 1;
        v1 = (v1 + v2 + 1) >> 1;
        v2 = t;
        t = (v4 * dctSin3 + v7 * dctCos3 + 2048) >> 12;
        v4 = (v4 * dctCos3 - v7 * dctSin3 + 2048) >> 12;
        v7 = t;
        t = (v5 * dctSin1 + v6 * dctCos1 + 2048) >> 12;
        v5 = (v5 * dctCos1 - v6 * dctSin1 + 2048) >> 12;
        v6 = t;

        // stage 1
        p[0*8 + col] = v0 + v7;
        p[7*8 + col] = v0 - v7;
        p[1*8 + col] = v1 + v6;
        p[6*8 + col] = v1 - v6;
        p[2*8 + col] = v2 + v5;
        p[5*8 + col] = v2 - v5;
        p[3*8 + col] = v3 + v4;
        p[4*8 + col] = v3 - v4;
      }

      // convert to 8-bit integers
      for (i = 0; i < 64; ++i) {
        var sample = 128 + ((p[i] + 8) >> 4);
        dataOut[i] = sample < 0 ? 0 : sample > 0xFF ? 0xFF : sample;
      }
    }

    var i, j;
    for (var blockRow = 0; blockRow < blocksPerColumn; blockRow++) {
      var scanLine = blockRow << 3;
      for (i = 0; i < 8; i++)
        lines.push(new Uint8Array(samplesPerLine));
      for (var blockCol = 0; blockCol < blocksPerLine; blockCol++) {
        quantizeAndInverse(component.blocks[blockRow][blockCol], r, R);

        var offset = 0, sample = blockCol << 3;
        for (j = 0; j < 8; j++) {
          var line = lines[scanLine + j];
          for (i = 0; i < 8; i++)
            line[sample + i] = r[offset++];
        }
      }
    }
    return lines;
  }

  function clampTo8bit(a) {
    return a < 0 ? 0 : a > 255 ? 255 : a;
  }

  constructor.prototype = {
    load: function load(path) {
      var xhr = new XMLHttpRequest();
      xhr.open("GET", path, true);
      xhr.responseType = "arraybuffer";
      xhr.onload = (function() {
        // TODO catch parse error
        var data = new Uint8Array(xhr.response || xhr.mozResponseArrayBuffer);
        this.parse(data);
        if (this.onload)
          this.onload();
      }).bind(this);
      xhr.send(null);
    },
    parse: function parse(data) {
      var offset = 0, length = data.length;
      function readUint16() {
        var value = (data[offset] << 8) | data[offset + 1];
        offset += 2;
        return value;
      }
      function readDataBlock() {
        var length = readUint16();
        var array = data.subarray(offset, offset + length - 2);
        offset += array.length;
        return array;
      }
      function prepareComponents(frame) {
        var maxH = 0, maxV = 0;
        var component, componentId;
        for (componentId in frame.components) {
          if (frame.components.hasOwnProperty(componentId)) {
            component = frame.components[componentId];
            if (maxH < component.h) maxH = component.h;
            if (maxV < component.v) maxV = component.v;
          }
        }
        var mcusPerLine = Math.ceil(frame.samplesPerLine / 8 / maxH);
        var mcusPerColumn = Math.ceil(frame.scanLines / 8 / maxV);
        for (componentId in frame.components) {
          if (frame.components.hasOwnProperty(componentId)) {
            component = frame.components[componentId];
            var blocksPerLine = Math.ceil(Math.ceil(frame.samplesPerLine / 8) * component.h / maxH);
            var blocksPerColumn = Math.ceil(Math.ceil(frame.scanLines  / 8) * component.v / maxV);
            var blocksPerLineForMcu = mcusPerLine * component.h;
            var blocksPerColumnForMcu = mcusPerColumn * component.v;
            var blocks = [];
            for (var i = 0; i < blocksPerColumnForMcu; i++) {
              var row = [];
              for (var j = 0; j < blocksPerLineForMcu; j++)
                row.push(new Int32Array(64));
              blocks.push(row);
            }
            component.blocksPerLine = blocksPerLine;
            component.blocksPerColumn = blocksPerColumn;
            component.blocks = blocks;
          }
        }
        frame.maxH = maxH;
        frame.maxV = maxV;
        frame.mcusPerLine = mcusPerLine;
        frame.mcusPerColumn = mcusPerColumn;
      }
      var jfif = null;
      var adobe = null;
      var frame, resetInterval;
      var quantizationTables = [], frames = [];
      var huffmanTablesAC = [], huffmanTablesDC = [];
      var fileMarker = readUint16();
      if (fileMarker != 0xFFD8) { // SOI (Start of Image)
        throw new Error("SOI not found");
      }

      fileMarker = readUint16();
      while (fileMarker != 0xFFD9) { // EOI (End of image)
        var i, j;
        switch(fileMarker) {
          case 0xFF00: break;
          case 0xFFE0: // APP0 (Application Specific)
          case 0xFFE1: // APP1
          case 0xFFE2: // APP2
          case 0xFFE3: // APP3
          case 0xFFE4: // APP4
          case 0xFFE5: // APP5
          case 0xFFE6: // APP6
          case 0xFFE7: // APP7
          case 0xFFE8: // APP8
          case 0xFFE9: // APP9
          case 0xFFEA: // APP10
          case 0xFFEB: // APP11
          case 0xFFEC: // APP12
          case 0xFFED: // APP13
          case 0xFFEE: // APP14
          case 0xFFEF: // APP15
          case 0xFFFE: // COM (Comment)
            var appData = readDataBlock();

            if (fileMarker === 0xFFE0) {
              if (appData[0] === 0x4A && appData[1] === 0x46 && appData[2] === 0x49 &&
                appData[3] === 0x46 && appData[4] === 0) { // 'JFIF\x00'
                jfif = {
                  version: { major: appData[5], minor: appData[6] },
                  densityUnits: appData[7],
                  xDensity: (appData[8] << 8) | appData[9],
                  yDensity: (appData[10] << 8) | appData[11],
                  thumbWidth: appData[12],
                  thumbHeight: appData[13],
                  thumbData: appData.subarray(14, 14 + 3 * appData[12] * appData[13])
                };
              }
            }
            // TODO APP1 - Exif
            if (fileMarker === 0xFFEE) {
              if (appData[0] === 0x41 && appData[1] === 0x64 && appData[2] === 0x6F &&
                appData[3] === 0x62 && appData[4] === 0x65 && appData[5] === 0) { // 'Adobe\x00'
                adobe = {
                  version: appData[6],
                  flags0: (appData[7] << 8) | appData[8],
                  flags1: (appData[9] << 8) | appData[10],
                  transformCode: appData[11]
                };
              }
            }
            break;

          case 0xFFDB: // DQT (Define Quantization Tables)
            var quantizationTablesLength = readUint16();
            var quantizationTablesEnd = quantizationTablesLength + offset - 2;
            while (offset < quantizationTablesEnd) {
              var quantizationTableSpec = data[offset++];
              var tableData = new Int32Array(64);
              if ((quantizationTableSpec >> 4) === 0) { // 8 bit values
                for (j = 0; j < 64; j++) {
                  var z = dctZigZag[j];
                  tableData[z] = data[offset++];
                }
              } else if ((quantizationTableSpec >> 4) === 1) { //16 bit
                for (j = 0; j < 64; j++) {
                  var z = dctZigZag[j];
                  tableData[z] = readUint16();
                }
              } else
                throw new Error("DQT: invalid table spec");
              quantizationTables[quantizationTableSpec & 15] = tableData;
            }
            break;

          case 0xFFC0: // SOF0 (Start of Frame, Baseline DCT)
          case 0xFFC1: // SOF1 (Start of Frame, Extended DCT)
          case 0xFFC2: // SOF2 (Start of Frame, Progressive DCT)
            readUint16(); // skip data length
            frame = {};
            frame.extended = (fileMarker === 0xFFC1);
            frame.progressive = (fileMarker === 0xFFC2);
            frame.precision = data[offset++];
            frame.scanLines = readUint16();
            frame.samplesPerLine = readUint16();
            frame.components = {};
            frame.componentsOrder = [];
            var componentsCount = data[offset++], componentId;
            for (i = 0; i < componentsCount; i++) {
              componentId = data[offset];
              var h = data[offset + 1] >> 4;
              var v = data[offset + 1] & 15;
              var qId = data[offset + 2];
              frame.componentsOrder.push(componentId);
              frame.components[componentId] = {
                h: h,
                v: v,
                quantizationIdx: qId
              };
              offset += 3;
            }
            prepareComponents(frame);
            frames.push(frame);
            break;

          case 0xFFC4: // DHT (Define Huffman Tables)
            var huffmanLength = readUint16();
            for (i = 2; i < huffmanLength;) {
              var huffmanTableSpec = data[offset++];
              var codeLengths = new Uint8Array(16);
              var codeLengthSum = 0;
              for (j = 0; j < 16; j++, offset++)
                codeLengthSum += (codeLengths[j] = data[offset]);
              var huffmanValues = new Uint8Array(codeLengthSum);
              for (j = 0; j < codeLengthSum; j++, offset++)
                huffmanValues[j] = data[offset];
              i += 17 + codeLengthSum;

              ((huffmanTableSpec >> 4) === 0 ?
                huffmanTablesDC : huffmanTablesAC)[huffmanTableSpec & 15] =
                buildHuffmanTable(codeLengths, huffmanValues);
            }
            break;

          case 0xFFDD: // DRI (Define Restart Interval)
            readUint16(); // skip data length
            resetInterval = readUint16();
            break;

          case 0xFFDA: // SOS (Start of Scan)
            var scanLength = readUint16();
            var selectorsCount = data[offset++];
            var components = [], component;
            for (i = 0; i < selectorsCount; i++) {
              component = frame.components[data[offset++]];
              var tableSpec = data[offset++];
              component.huffmanTableDC = huffmanTablesDC[tableSpec >> 4];
              component.huffmanTableAC = huffmanTablesAC[tableSpec & 15];
              components.push(component);
            }
            var spectralStart = data[offset++];
            var spectralEnd = data[offset++];
            var successiveApproximation = data[offset++];
            var processed = decodeScan(data, offset,
              frame, components, resetInterval,
              spectralStart, spectralEnd,
              successiveApproximation >> 4, successiveApproximation & 15);
            offset += processed;
            break;

          case 0xFFFF: // Fill bytes
            if (data[offset] !== 0xFF) { // Avoid skipping a valid marker.
              offset--;
            }
            break;

          default:
            if (data[offset - 3] == 0xFF &&
                data[offset - 2] >= 0xC0 && data[offset - 2] <= 0xFE) {
              // could be incorrect encoding -- last 0xFF byte of the previous
              // block was eaten by the encoder
              offset -= 3;
              break;
            }
            throw new Error("unknown JPEG marker " + fileMarker.toString(16));
        }
        fileMarker = readUint16();
      }
      if (frames.length != 1)
        throw new Error("only single frame JPEGs supported");

      // set each frame's components quantization table
      for (var i = 0; i < frames.length; i++) {
        var cp = frames[i].components;
        for (var j in cp) {
          cp[j].quantizationTable = quantizationTables[cp[j].quantizationIdx];
          delete cp[j].quantizationIdx;
        }
      }

      this.width = frame.samplesPerLine;
      this.height = frame.scanLines;
      this.jfif = jfif;
      this.adobe = adobe;
      this.components = [];
      for (var i = 0; i < frame.componentsOrder.length; i++) {
        var component = frame.components[frame.componentsOrder[i]];
        this.components.push({
          lines: buildComponentData(frame, component),
          scaleX: component.h / frame.maxH,
          scaleY: component.v / frame.maxV
        });
      }
    },
    getData: function getData(width, height) {
      var scaleX = this.width / width, scaleY = this.height / height;

      var component1, component2, component3, component4;
      var component1Line, component2Line, component3Line, component4Line;
      var x, y;
      var offset = 0;
      var Y, Cb, Cr, K, C, M, Ye, R, G, B;
      var colorTransform;
      var dataLength = width * height * this.components.length;
      var data = new Uint8Array(dataLength);
      switch (this.components.length) {
        case 1:
          component1 = this.components[0];
          for (y = 0; y < height; y++) {
            component1Line = component1.lines[0 | (y * component1.scaleY * scaleY)];
            for (x = 0; x < width; x++) {
              Y = component1Line[0 | (x * component1.scaleX * scaleX)];

              data[offset++] = Y;
            }
          }
          break;
        case 2:
          // PDF might compress two component data in custom colorspace
          component1 = this.components[0];
          component2 = this.components[1];
          for (y = 0; y < height; y++) {
            component1Line = component1.lines[0 | (y * component1.scaleY * scaleY)];
            component2Line = component2.lines[0 | (y * component2.scaleY * scaleY)];
            for (x = 0; x < width; x++) {
              Y = component1Line[0 | (x * component1.scaleX * scaleX)];
              data[offset++] = Y;
              Y = component2Line[0 | (x * component2.scaleX * scaleX)];
              data[offset++] = Y;
            }
          }
          break;
        case 3:
          // The default transform for three components is true
          colorTransform = true;
          // The adobe transform marker overrides any previous setting
          if (this.adobe && this.adobe.transformCode)
            colorTransform = true;
          else if (typeof this.colorTransform !== 'undefined')
            colorTransform = !!this.colorTransform;

          component1 = this.components[0];
          component2 = this.components[1];
          component3 = this.components[2];
          for (y = 0; y < height; y++) {
            component1Line = component1.lines[0 | (y * component1.scaleY * scaleY)];
            component2Line = component2.lines[0 | (y * component2.scaleY * scaleY)];
            component3Line = component3.lines[0 | (y * component3.scaleY * scaleY)];
            for (x = 0; x < width; x++) {
              if (!colorTransform) {
                R = component1Line[0 | (x * component1.scaleX * scaleX)];
                G = component2Line[0 | (x * component2.scaleX * scaleX)];
                B = component3Line[0 | (x * component3.scaleX * scaleX)];
              } else {
                Y = component1Line[0 | (x * component1.scaleX * scaleX)];
                Cb = component2Line[0 | (x * component2.scaleX * scaleX)];
                Cr = component3Line[0 | (x * component3.scaleX * scaleX)];

                R = clampTo8bit(Y + 1.402 * (Cr - 128));
                G = clampTo8bit(Y - 0.3441363 * (Cb - 128) - 0.71413636 * (Cr - 128));
                B = clampTo8bit(Y + 1.772 * (Cb - 128));
              }

              data[offset++] = R;
              data[offset++] = G;
              data[offset++] = B;
            }
          }
          break;
        case 4:
          if (!this.adobe)
            throw new Error('Unsupported color mode (4 components)');
          // The default transform for four components is false
          colorTransform = false;
          // The adobe transform marker overrides any previous setting
          if (this.adobe && this.adobe.transformCode)
            colorTransform = true;
          else if (typeof this.colorTransform !== 'undefined')
            colorTransform = !!this.colorTransform;

          component1 = this.components[0];
          component2 = this.components[1];
          component3 = this.components[2];
          component4 = this.components[3];
          for (y = 0; y < height; y++) {
            component1Line = component1.lines[0 | (y * component1.scaleY * scaleY)];
            component2Line = component2.lines[0 | (y * component2.scaleY * scaleY)];
            component3Line = component3.lines[0 | (y * component3.scaleY * scaleY)];
            component4Line = component4.lines[0 | (y * component4.scaleY * scaleY)];
            for (x = 0; x < width; x++) {
              if (!colorTransform) {
                C = component1Line[0 | (x * component1.scaleX * scaleX)];
                M = component2Line[0 | (x * component2.scaleX * scaleX)];
                Ye = component3Line[0 | (x * component3.scaleX * scaleX)];
                K = component4Line[0 | (x * component4.scaleX * scaleX)];
              } else {
                Y = component1Line[0 | (x * component1.scaleX * scaleX)];
                Cb = component2Line[0 | (x * component2.scaleX * scaleX)];
                Cr = component3Line[0 | (x * component3.scaleX * scaleX)];
                K = component4Line[0 | (x * component4.scaleX * scaleX)];

                C = 255 - clampTo8bit(Y + 1.402 * (Cr - 128));
                M = 255 - clampTo8bit(Y - 0.3441363 * (Cb - 128) - 0.71413636 * (Cr - 128));
                Ye = 255 - clampTo8bit(Y + 1.772 * (Cb - 128));
              }
              data[offset++] = 255-C;
              data[offset++] = 255-M;
              data[offset++] = 255-Ye;
              data[offset++] = 255-K;
            }
          }
          break;
        default:
          throw new Error('Unsupported color mode');
      }
      return data;
    },
    copyToImageData: function copyToImageData(imageData) {
      var width = imageData.width, height = imageData.height;
      var imageDataArray = imageData.data;
      var data = this.getData(width, height);
      var i = 0, j = 0, x, y;
      var Y, K, C, M, R, G, B;
      switch (this.components.length) {
        case 1:
          for (y = 0; y < height; y++) {
            for (x = 0; x < width; x++) {
              Y = data[i++];

              imageDataArray[j++] = Y;
              imageDataArray[j++] = Y;
              imageDataArray[j++] = Y;
              imageDataArray[j++] = 255;
            }
          }
          break;
        case 3:
          for (y = 0; y < height; y++) {
            for (x = 0; x < width; x++) {
              R = data[i++];
              G = data[i++];
              B = data[i++];

              imageDataArray[j++] = R;
              imageDataArray[j++] = G;
              imageDataArray[j++] = B;
              imageDataArray[j++] = 255;
            }
          }
          break;
        case 4:
          for (y = 0; y < height; y++) {
            for (x = 0; x < width; x++) {
              C = data[i++];
              M = data[i++];
              Y = data[i++];
              K = data[i++];

              R = 255 - clampTo8bit(C * (1 - K / 255) + K);
              G = 255 - clampTo8bit(M * (1 - K / 255) + K);
              B = 255 - clampTo8bit(Y * (1 - K / 255) + K);

              imageDataArray[j++] = R;
              imageDataArray[j++] = G;
              imageDataArray[j++] = B;
              imageDataArray[j++] = 255;
            }
          }
          break;
        default:
          throw new Error('Unsupported color mode');
      }
    }
  };

  return constructor;
})();
module.exports = decode;

function decode(jpegData, opts) {
  var defaultOpts = {
    useTArray: false,
    colorTransform: true
  };
  if (opts) {
    if (typeof opts === 'object') {
      opts = {
        useTArray: (typeof opts.useTArray === 'undefined' ?
                    defaultOpts.useTArray : opts.useTArray),
        colorTransform: (typeof opts.colorTransform === 'undefined' ?
                         defaultOpts.colorTransform : opts.colorTransform)
      };
    } else {
      // backwards compatiblity, before 0.3.5, we only had the useTArray param
      opts = defaultOpts;
      opts.useTArray = true;
    }
  } else {
    opts = defaultOpts;
  }

  var arr = new Uint8Array(jpegData);
  var decoder = new JpegImage();
  decoder.parse(arr);
  decoder.colorTransform = opts.colorTransform;

  var image = {
    width: decoder.width,
    height: decoder.height,
    data: opts.useTArray ?
      new Uint8Array(decoder.width * decoder.height * 4) :
      new Buffer(decoder.width * decoder.height * 4)
  };

  decoder.copyToImageData(image);

  return image;
}

var decoder = /*#__PURE__*/Object.freeze({

});

var jpegJs = {
  encode: encoder,
  decode: decoder
};

var dist$2 = createCommonjsModule(function (module, exports) {



Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isNodePattern = isNodePattern;
exports.throwError = throwError;
exports.scan = scan;

function isNodePattern(cb) {
  if (typeof cb === 'undefined') {
    return false;
  }

  if (typeof cb !== 'function') {
    throw new TypeError('Callback must be a function');
  }

  return true;
}

function throwError(error, cb) {
  if (typeof error === 'string') {
    error = new Error(error);
  }

  if (typeof cb === 'function') {
    return cb.call(this, error);
  }

  throw error;
}

function scan(image, x, y, w, h, f) {
  // round input
  x = Math.round(x);
  y = Math.round(y);
  w = Math.round(w);
  h = Math.round(h);

  for (var _y = y; _y < y + h; _y++) {
    for (var _x = x; _x < x + w; _x++) {
      var idx = image.bitmap.width * _y + _x << 2;
      f.call(image, _x, _y, idx);
    }
  }

  return image;
}

});

unwrapExports(dist$2);
var dist_1 = dist$2.isNodePattern;
var dist_2 = dist$2.throwError;
var dist_3 = dist$2.scan;

var dist$3 = createCommonjsModule(function (module, exports) {

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;



var _jpegJs = _interopRequireDefault(jpegJs);



function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var MIME_TYPE = 'image/jpeg';

var _default = function _default() {
  return {
    mime: _defineProperty({}, MIME_TYPE, ['jpeg', 'jpg', 'jpe']),
    constants: {
      MIME_JPEG: MIME_TYPE
    },
    decoders: _defineProperty({}, MIME_TYPE, _jpegJs.default.decode),
    encoders: _defineProperty({}, MIME_TYPE, function (image) {
      return _jpegJs.default.encode(image.bitmap, image._quality).data;
    }),
    class: {
      // The quality to be used when saving JPEG images
      _quality: 100,

      /**
       * Sets the quality of the image when saving as JPEG format (default is 100)
       * @param {number} n The quality to use 0-100
       * @param {function(Error, Jimp)} cb (optional) a callback for when complete
       * @returns {Jimp} this for chaining of methods
       */
      quality: function quality(n, cb) {
        if (typeof n !== 'number') {
          return dist$2.throwError.call(this, 'n must be a number', cb);
        }

        if (n < 0 || n > 100) {
          return dist$2.throwError.call(this, 'n must be a number 0 - 100', cb);
        }

        this._quality = Math.round(n);

        if ((0, dist$2.isNodePattern)(cb)) {
          cb.call(this, null, this);
        }

        return this;
      }
    }
  };
};

exports.default = _default;
module.exports = exports.default;

});

unwrapExports(dist$3);

var util = require('util');
var Stream = require('stream');
var Parser = require('./parser-async');
var Packer = require('./packer-async');
var PNGSync = require('./png-sync');


var PNG = exports.PNG = function(options) {
  Stream.call(this);

  options = options || {}; // eslint-disable-line no-param-reassign

  // coerce pixel dimensions to integers (also coerces undefined -> 0):
  this.width = options.width | 0;
  this.height = options.height | 0;

  this.data = this.width > 0 && this.height > 0 ?
    new Buffer(4 * this.width * this.height) : null;

  if (options.fill && this.data) {
    this.data.fill(0);
  }

  this.gamma = 0;
  this.readable = this.writable = true;

  this._parser = new Parser(options);

  this._parser.on('error', this.emit.bind(this, 'error'));
  this._parser.on('close', this._handleClose.bind(this));
  this._parser.on('metadata', this._metadata.bind(this));
  this._parser.on('gamma', this._gamma.bind(this));
  this._parser.on('parsed', function(data) {
    this.data = data;
    this.emit('parsed', data);
  }.bind(this));

  this._packer = new Packer(options);
  this._packer.on('data', this.emit.bind(this, 'data'));
  this._packer.on('end', this.emit.bind(this, 'end'));
  this._parser.on('close', this._handleClose.bind(this));
  this._packer.on('error', this.emit.bind(this, 'error'));

};
util.inherits(PNG, Stream);

PNG.sync = PNGSync;

PNG.prototype.pack = function() {

  if (!this.data || !this.data.length) {
    this.emit('error', 'No data provided');
    return this;
  }

  nextTick(function() {
    this._packer.pack(this.data, this.width, this.height, this.gamma);
  }.bind(this));

  return this;
};


PNG.prototype.parse = function(data, callback) {

  if (callback) {
    var onParsed, onError;

    onParsed = function(parsedData) {
      this.removeListener('error', onError);

      this.data = parsedData;
      callback(null, this);
    }.bind(this);

    onError = function(err) {
      this.removeListener('parsed', onParsed);

      callback(err, null);
    }.bind(this);

    this.once('parsed', onParsed);
    this.once('error', onError);
  }

  this.end(data);
  return this;
};

PNG.prototype.write = function(data) {
  this._parser.write(data);
  return true;
};

PNG.prototype.end = function(data) {
  this._parser.end(data);
};

PNG.prototype._metadata = function(metadata) {
  this.width = metadata.width;
  this.height = metadata.height;

  this.emit('metadata', metadata);
};

PNG.prototype._gamma = function(gamma) {
  this.gamma = gamma;
};

PNG.prototype._handleClose = function() {
  if (!this._parser.writable && !this._packer.readable) {
    this.emit('close');
  }
};


PNG.bitblt = function(src, dst, srcX, srcY, width, height, deltaX, deltaY) { // eslint-disable-line max-params
  // coerce pixel dimensions to integers (also coerces undefined -> 0):
  /* eslint-disable no-param-reassign */
  srcX |= 0;
  srcY |= 0;
  width |= 0;
  height |= 0;
  deltaX |= 0;
  deltaY |= 0;
  /* eslint-enable no-param-reassign */

  if (srcX > src.width || srcY > src.height || srcX + width > src.width || srcY + height > src.height) {
    throw new Error('bitblt reading outside image');
  }

  if (deltaX > dst.width || deltaY > dst.height || deltaX + width > dst.width || deltaY + height > dst.height) {
    throw new Error('bitblt writing outside image');
  }

  for (var y = 0; y < height; y++) {
    src.data.copy(dst.data,
      ((deltaY + y) * dst.width + deltaX) << 2,
      ((srcY + y) * src.width + srcX) << 2,
      ((srcY + y) * src.width + srcX + width) << 2
    );
  }
};


PNG.prototype.bitblt = function(dst, srcX, srcY, width, height, deltaX, deltaY) { // eslint-disable-line max-params

  PNG.bitblt(this, dst, srcX, srcY, width, height, deltaX, deltaY);
  return this;
};

PNG.adjustGamma = function(src) {
  if (src.gamma) {
    for (var y = 0; y < src.height; y++) {
      for (var x = 0; x < src.width; x++) {
        var idx = (src.width * y + x) << 2;

        for (var i = 0; i < 3; i++) {
          var sample = src.data[idx + i] / 255;
          sample = Math.pow(sample, 1 / 2.2 / src.gamma);
          src.data[idx + i] = Math.round(sample * 255);
        }
      }
    }
    src.gamma = 0;
  }
};

PNG.prototype.adjustGamma = function() {
  PNG.adjustGamma(this);
};

var png = /*#__PURE__*/Object.freeze({

});

var dist$4 = createCommonjsModule(function (module, exports) {

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;







function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var MIME_TYPE = 'image/png'; // PNG filter types

var PNG_FILTER_AUTO = -1;
var PNG_FILTER_NONE = 0;
var PNG_FILTER_SUB = 1;
var PNG_FILTER_UP = 2;
var PNG_FILTER_AVERAGE = 3;
var PNG_FILTER_PATH = 4;

var _default = function _default() {
  return {
    mime: _defineProperty({}, MIME_TYPE, ['png']),
    constants: {
      MIME_PNG: MIME_TYPE,
      PNG_FILTER_AUTO: PNG_FILTER_AUTO,
      PNG_FILTER_NONE: PNG_FILTER_NONE,
      PNG_FILTER_SUB: PNG_FILTER_SUB,
      PNG_FILTER_UP: PNG_FILTER_UP,
      PNG_FILTER_AVERAGE: PNG_FILTER_AVERAGE,
      PNG_FILTER_PATH: PNG_FILTER_PATH
    },
    hasAlpha: _defineProperty({}, MIME_TYPE, true),
    decoders: _defineProperty({}, MIME_TYPE, png.PNG.sync.read),
    encoders: _defineProperty({}, MIME_TYPE, function (data) {
      var png$1 = new png.PNG({
        width: data.bitmap.width,
        height: data.bitmap.height
      });
      png$1.data = data.bitmap.data;
      return png.PNG.sync.write(png$1, {
        width: data.bitmap.width,
        height: data.bitmap.height,
        deflateLevel: data._deflateLevel,
        deflateStrategy: data._deflateStrategy,
        filterType: data._filterType,
        colorType: typeof data._colorType === 'number' ? data._colorType : data._rgba ? 6 : 2,
        inputHasAlpha: data._rgba
      });
    }),
    class: {
      _deflateLevel: 9,
      _deflateStrategy: 3,
      _filterType: PNG_FILTER_AUTO,
      _colorType: null,

      /**
       * Sets the deflate level used when saving as PNG format (default is 9)
       * @param {number} l Deflate level to use 0-9. 0 is no compression. 9 (default) is maximum compression.
       * @param {function(Error, Jimp)} cb (optional) a callback for when complete
       * @returns {Jimp} this for chaining of methods
       */
      deflateLevel: function deflateLevel(l, cb) {
        if (typeof l !== 'number') {
          return dist$2.throwError.call(this, 'l must be a number', cb);
        }

        if (l < 0 || l > 9) {
          return dist$2.throwError.call(this, 'l must be a number 0 - 9', cb);
        }

        this._deflateLevel = Math.round(l);

        if ((0, dist$2.isNodePattern)(cb)) {
          cb.call(this, null, this);
        }

        return this;
      },

      /**
       * Sets the deflate strategy used when saving as PNG format (default is 3)
       * @param {number} s Deflate strategy to use 0-3.
       * @param {function(Error, Jimp)} cb (optional) a callback for when complete
       * @returns {Jimp} this for chaining of methods
       */
      deflateStrategy: function deflateStrategy(s, cb) {
        if (typeof s !== 'number') {
          return dist$2.throwError.call(this, 's must be a number', cb);
        }

        if (s < 0 || s > 3) {
          return dist$2.throwError.call(this, 's must be a number 0 - 3', cb);
        }

        this._deflateStrategy = Math.round(s);

        if ((0, dist$2.isNodePattern)(cb)) {
          cb.call(this, null, this);
        }

        return this;
      },

      /**
       * Sets the filter type used when saving as PNG format (default is automatic filters)
       * @param {number} f The quality to use -1-4.
       * @param {function(Error, Jimp)} cb (optional) a callback for when complete
       * @returns {Jimp} this for chaining of methods
       */
      filterType: function filterType(f, cb) {
        if (typeof f !== 'number') {
          return dist$2.throwError.call(this, 'n must be a number', cb);
        }

        if (f < -1 || f > 4) {
          return dist$2.throwError.call(this, 'n must be -1 (auto) or a number 0 - 4', cb);
        }

        this._filterType = Math.round(f);

        if ((0, dist$2.isNodePattern)(cb)) {
          cb.call(this, null, this);
        }

        return this;
      },

      /**
       * Sets the color type used when saving as PNG format
       * @param {number} s color type to use 0, 2, 4, 6.
       * @param {function(Error, Jimp)} cb (optional) a callback for when complete
       * @returns {Jimp} this for chaining of methods
       */
      colorType: function colorType(s, cb) {
        if (typeof s !== 'number') {
          return dist$2.throwError.call(this, 's must be a number', cb);
        }

        if (s !== 0 && s !== 2 && s !== 4 && s !== 6) {
          return dist$2.throwError.call(this, 's must be a number 0, 2, 4, 6.', cb);
        }

        this._colorType = Math.round(s);

        if ((0, dist$2.isNodePattern)(cb)) {
          cb.call(this, null, this);
        }

        return this;
      }
    }
  };
};

exports.default = _default;
module.exports = exports.default;

});

unwrapExports(dist$4);

/**
 * @author shaozilee
 *
 * BMP format encoder,encode 24bit BMP
 * Not support quality compression
 *
 */

function BmpEncoder(imgData){
	this.buffer = imgData.data;
	this.width = imgData.width;
	this.height = imgData.height;
	this.extraBytes = this.width%4;
	this.rgbSize = this.height*(3*this.width+this.extraBytes);
	this.headerInfoSize = 40;

	this.data = [];
	/******************header***********************/
	this.flag = "BM";
	this.reserved = 0;
	this.offset = 54;
	this.fileSize = this.rgbSize+this.offset;
	this.planes = 1;
	this.bitPP = 24;
	this.compress = 0;
	this.hr = 0;
	this.vr = 0;
	this.colors = 0;
	this.importantColors = 0;
}

BmpEncoder.prototype.encode = function() {
	var tempBuffer = new Buffer(this.offset+this.rgbSize);
	this.pos = 0;
	tempBuffer.write(this.flag,this.pos,2);this.pos+=2;
	tempBuffer.writeUInt32LE(this.fileSize,this.pos);this.pos+=4;
	tempBuffer.writeUInt32LE(this.reserved,this.pos);this.pos+=4;
	tempBuffer.writeUInt32LE(this.offset,this.pos);this.pos+=4;

	tempBuffer.writeUInt32LE(this.headerInfoSize,this.pos);this.pos+=4;
	tempBuffer.writeUInt32LE(this.width,this.pos);this.pos+=4;
	tempBuffer.writeInt32LE(-this.height,this.pos);this.pos+=4;
	tempBuffer.writeUInt16LE(this.planes,this.pos);this.pos+=2;
	tempBuffer.writeUInt16LE(this.bitPP,this.pos);this.pos+=2;
	tempBuffer.writeUInt32LE(this.compress,this.pos);this.pos+=4;
	tempBuffer.writeUInt32LE(this.rgbSize,this.pos);this.pos+=4;
	tempBuffer.writeUInt32LE(this.hr,this.pos);this.pos+=4;
	tempBuffer.writeUInt32LE(this.vr,this.pos);this.pos+=4;
	tempBuffer.writeUInt32LE(this.colors,this.pos);this.pos+=4;
	tempBuffer.writeUInt32LE(this.importantColors,this.pos);this.pos+=4;

	var i=0;
	var rowBytes = 3*this.width+this.extraBytes;

	for (var y = 0; y <this.height; y++){
		for (var x = 0; x < this.width; x++){
			var p = this.pos+y*rowBytes+x*3;
			i++;//a
			tempBuffer[p]= this.buffer[i++];//b
			tempBuffer[p+1] = this.buffer[i++];//g
			tempBuffer[p+2]  = this.buffer[i++];//r
		}
		if(this.extraBytes>0){
			var fillOffset = this.pos+y*rowBytes+this.width*3;
			tempBuffer.fill(0,fillOffset,fillOffset+this.extraBytes);
		}
	}

	return tempBuffer;
};

module.exports = function(imgData, quality) {
  if (typeof quality === 'undefined') quality = 100;
 	var encoder = new BmpEncoder(imgData);
	var data = encoder.encode();
  return {
    data: data,
    width: imgData.width,
    height: imgData.height
  };
};

var encoder$1 = /*#__PURE__*/Object.freeze({

});

/**
 * @author shaozilee
 *
 * Bmp format decoder,support 1bit 4bit 8bit 24bit bmp
 *
 */

function BmpDecoder(buffer,is_with_alpha) {
  this.pos = 0;
  this.buffer = buffer;
  this.is_with_alpha = !!is_with_alpha;
  this.bottom_up = true;
  this.flag = this.buffer.toString("utf-8", 0, this.pos += 2);
  if (this.flag != "BM") throw new Error("Invalid BMP File");
  this.parseHeader();
  this.parseRGBA();
}

BmpDecoder.prototype.parseHeader = function() {
  this.fileSize = this.buffer.readUInt32LE(this.pos);
  this.pos += 4;
  this.reserved = this.buffer.readUInt32LE(this.pos);
  this.pos += 4;
  this.offset = this.buffer.readUInt32LE(this.pos);
  this.pos += 4;
  this.headerSize = this.buffer.readUInt32LE(this.pos);
  this.pos += 4;
  this.width = this.buffer.readUInt32LE(this.pos);
  this.pos += 4;
  this.height = this.buffer.readInt32LE(this.pos);
  this.pos += 4;
  this.planes = this.buffer.readUInt16LE(this.pos);
  this.pos += 2;
  this.bitPP = this.buffer.readUInt16LE(this.pos);
  this.pos += 2;
  this.compress = this.buffer.readUInt32LE(this.pos);
  this.pos += 4;
  this.rawSize = this.buffer.readUInt32LE(this.pos);
  this.pos += 4;
  this.hr = this.buffer.readUInt32LE(this.pos);
  this.pos += 4;
  this.vr = this.buffer.readUInt32LE(this.pos);
  this.pos += 4;
  this.colors = this.buffer.readUInt32LE(this.pos);
  this.pos += 4;
  this.importantColors = this.buffer.readUInt32LE(this.pos);
  this.pos += 4;

  if(this.bitPP === 16 && this.is_with_alpha){
    this.bitPP = 15;
  }
  if (this.bitPP < 15) {
    var len = this.colors === 0 ? 1 << this.bitPP : this.colors;
    this.palette = new Array(len);
    for (var i = 0; i < len; i++) {
      var blue = this.buffer.readUInt8(this.pos++);
      var green = this.buffer.readUInt8(this.pos++);
      var red = this.buffer.readUInt8(this.pos++);
      var quad = this.buffer.readUInt8(this.pos++);
      this.palette[i] = {
        red: red,
        green: green,
        blue: blue,
        quad: quad
      };
    }
  }
  if(this.height < 0) {
    this.height *= -1;
    this.bottom_up = false;
  }

};

BmpDecoder.prototype.parseRGBA = function() {
    var bitn = "bit" + this.bitPP;
    var len = this.width * this.height * 4;
    this.data = new Buffer(len);
    this[bitn]();
};

BmpDecoder.prototype.bit1 = function() {
  var xlen = Math.ceil(this.width / 8);
  var mode = xlen%4;
  var y = this.height >= 0 ? this.height - 1 : -this.height;
  for (var y = this.height - 1; y >= 0; y--) {
    var line = this.bottom_up ? y : this.height - 1 - y;
    for (var x = 0; x < xlen; x++) {
      var b = this.buffer.readUInt8(this.pos++);
      var location = line * this.width * 4 + x*8*4;
      for (var i = 0; i < 8; i++) {
        if(x*8+i<this.width){
          var rgb = this.palette[((b>>(7-i))&0x1)];

          this.data[location+i*4] = 0;
          this.data[location+i*4 + 1] = rgb.blue;
          this.data[location+i*4 + 2] = rgb.green;
          this.data[location+i*4 + 3] = rgb.red;

        }else{
          break;
        }
      }
    }

    if (mode != 0){
      this.pos+=(4 - mode);
    }
  }
};

BmpDecoder.prototype.bit4 = function() {
    //RLE-4
    if(this.compress == 2){
        this.data.fill(0xff);

        var location = 0;
        var lines = this.bottom_up?this.height-1:0;
        var low_nibble = false;//for all count of pixel

        while(location<this.data.length){
            var a = this.buffer.readUInt8(this.pos++);
            var b = this.buffer.readUInt8(this.pos++);
            //absolute mode
            if(a == 0){
                if(b == 0){//line end
                    if(this.bottom_up){
                        lines--;
                    }else{
                        lines++;
                    }
                    location = lines*this.width*4;
                    low_nibble = false;
                    continue;
                }else if(b == 1){//image end
                    break;
                }else if(b ==2){
                    //offset x,y
                    var x = this.buffer.readUInt8(this.pos++);
                    var y = this.buffer.readUInt8(this.pos++);
                    if(this.bottom_up){
                        lines-=y;
                    }else{
                        lines+=y;
                    }

                    location +=(y*this.width*4+x*4);
                }else{
                    var c = this.buffer.readUInt8(this.pos++);
                    for(var i=0;i<b;i++){
                        if (low_nibble) {
                            setPixelData.call(this, (c & 0x0f));
                        } else {
                            setPixelData.call(this, (c & 0xf0)>>4);
                        }

                        if ((i & 1) && (i+1 < b)){
                            c = this.buffer.readUInt8(this.pos++);
                        }

                        low_nibble = !low_nibble;
                    }

                    if ((((b+1) >> 1) & 1 ) == 1){
                        this.pos++;
                    }
                }

            }else{//encoded mode
                for (var i = 0; i < a; i++) {
                    if (low_nibble) {
                        setPixelData.call(this, (b & 0x0f));
                    } else {
                        setPixelData.call(this, (b & 0xf0)>>4);
                    }
                    low_nibble = !low_nibble;
                }
            }

        }




        function setPixelData(rgbIndex){
            var rgb = this.palette[rgbIndex];
            this.data[location] = 0;
            this.data[location + 1] = rgb.blue;
            this.data[location + 2] = rgb.green;
            this.data[location + 3] = rgb.red;
            location+=4;
        }
    }else{

      var xlen = Math.ceil(this.width/2);
      var mode = xlen%4;
      for (var y = this.height - 1; y >= 0; y--) {
        var line = this.bottom_up ? y : this.height - 1 - y;
        for (var x = 0; x < xlen; x++) {
          var b = this.buffer.readUInt8(this.pos++);
          var location = line * this.width * 4 + x*2*4;

          var before = b>>4;
          var after = b&0x0F;

          var rgb = this.palette[before];
          this.data[location] = 0;
          this.data[location + 1] = rgb.blue;
          this.data[location + 2] = rgb.green;
          this.data[location + 3] = rgb.red;


          if(x*2+1>=this.width)break;

          rgb = this.palette[after];

          this.data[location+4] = 0;
          this.data[location+4 + 1] = rgb.blue;
          this.data[location+4 + 2] = rgb.green;
          this.data[location+4 + 3] = rgb.red;

        }

        if (mode != 0){
          this.pos+=(4 - mode);
        }
      }

    }

};

BmpDecoder.prototype.bit8 = function() {
    //RLE-8
    if(this.compress == 1){
        this.data.fill(0xff);

        var location = 0;
        var lines = this.bottom_up?this.height-1:0;

        while(location<this.data.length){
            var a = this.buffer.readUInt8(this.pos++);
            var b = this.buffer.readUInt8(this.pos++);
            //absolute mode
            if(a == 0){
                if(b == 0){//line end
                    if(this.bottom_up){
                        lines--;
                    }else{
                        lines++;
                    }
                    location = lines*this.width*4;
                    continue;
                }else if(b == 1){//image end
                    break;
                }else if(b ==2){
                    //offset x,y
                    var x = this.buffer.readUInt8(this.pos++);
                    var y = this.buffer.readUInt8(this.pos++);
                    if(this.bottom_up){
                        lines-=y;
                    }else{
                        lines+=y;
                    }

                    location +=(y*this.width*4+x*4);
                }else{
                    for(var i=0;i<b;i++){
                        var c = this.buffer.readUInt8(this.pos++);
                        setPixelData.call(this, c);
                    }
                    if(b&1 == 1){
                        this.pos++;
                    }

                }

            }else{//encoded mode
                for (var i = 0; i < a; i++) {
                    setPixelData.call(this, b);
                }
            }

        }




        function setPixelData(rgbIndex){
            var rgb = this.palette[rgbIndex];
            this.data[location] = 0;
            this.data[location + 1] = rgb.blue;
            this.data[location + 2] = rgb.green;
            this.data[location + 3] = rgb.red;
            location+=4;
        }
    }else {
        var mode = this.width % 4;
        for (var y = this.height - 1; y >= 0; y--) {
            var line = this.bottom_up ? y : this.height - 1 - y;
            for (var x = 0; x < this.width; x++) {
                var b = this.buffer.readUInt8(this.pos++);
                var location = line * this.width * 4 + x * 4;
                if (b < this.palette.length) {
                    var rgb = this.palette[b];

                    this.data[location] = 0;
                    this.data[location + 1] = rgb.blue;
                    this.data[location + 2] = rgb.green;
                    this.data[location + 3] = rgb.red;

                } else {
                    this.data[location] = 0;
                    this.data[location + 1] = 0xFF;
                    this.data[location + 2] = 0xFF;
                    this.data[location + 3] = 0xFF;
                }
            }
            if (mode != 0) {
                this.pos += (4 - mode);
            }
        }
    }
};

BmpDecoder.prototype.bit15 = function() {
  var dif_w =this.width % 3;
  var _11111 = parseInt("11111", 2),_1_5 = _11111;
  for (var y = this.height - 1; y >= 0; y--) {
    var line = this.bottom_up ? y : this.height - 1 - y;
    for (var x = 0; x < this.width; x++) {

      var B = this.buffer.readUInt16LE(this.pos);
      this.pos+=2;
      var blue = (B & _1_5) / _1_5 * 255 | 0;
      var green = (B >> 5 & _1_5 ) / _1_5 * 255 | 0;
      var red = (B >> 10 & _1_5) / _1_5 * 255 | 0;
      var alpha = (B>>15)?0xFF:0x00;

      var location = line * this.width * 4 + x * 4;

      this.data[location] = alpha;
      this.data[location + 1] = blue;
      this.data[location + 2] = green;
      this.data[location + 3] = red;
    }
    //skip extra bytes
    this.pos += dif_w;
  }
};

BmpDecoder.prototype.bit16 = function() {
  var dif_w =(this.width % 2)*2;
  //default xrgb555
  this.maskRed = 0x7C00;
  this.maskGreen = 0x3E0;
  this.maskBlue =0x1F;
  this.mask0 = 0;

  if(this.compress == 3){
    this.maskRed = this.buffer.readUInt32LE(this.pos);
    this.pos+=4;
    this.maskGreen = this.buffer.readUInt32LE(this.pos);
    this.pos+=4;
    this.maskBlue = this.buffer.readUInt32LE(this.pos);
    this.pos+=4;
    this.mask0 = this.buffer.readUInt32LE(this.pos);
    this.pos+=4;
  }


  var ns=[0,0,0];
  for (var i=0;i<16;i++){
    if ((this.maskRed>>i)&0x01) ns[0]++;
    if ((this.maskGreen>>i)&0x01) ns[1]++;
    if ((this.maskBlue>>i)&0x01) ns[2]++;
  }
  ns[1]+=ns[0]; ns[2]+=ns[1];	ns[0]=8-ns[0]; ns[1]-=8; ns[2]-=8;

  for (var y = this.height - 1; y >= 0; y--) {
    var line = this.bottom_up ? y : this.height - 1 - y;
    for (var x = 0; x < this.width; x++) {

      var B = this.buffer.readUInt16LE(this.pos);
      this.pos+=2;

      var blue = (B&this.maskBlue)<<ns[0];
      var green = (B&this.maskGreen)>>ns[1];
      var red = (B&this.maskRed)>>ns[2];

      var location = line * this.width * 4 + x * 4;

      this.data[location] = 0;
      this.data[location + 1] = blue;
      this.data[location + 2] = green;
      this.data[location + 3] = red;
    }
    //skip extra bytes
    this.pos += dif_w;
  }
};

BmpDecoder.prototype.bit24 = function() {
  for (var y = this.height - 1; y >= 0; y--) {
    var line = this.bottom_up ? y : this.height - 1 - y;
    for (var x = 0; x < this.width; x++) {
      //Little Endian rgb
      var blue = this.buffer.readUInt8(this.pos++);
      var green = this.buffer.readUInt8(this.pos++);
      var red = this.buffer.readUInt8(this.pos++);
      var location = line * this.width * 4 + x * 4;
      this.data[location] = 0;
      this.data[location + 1] = blue;
      this.data[location + 2] = green;
      this.data[location + 3] = red;
    }
    //skip extra bytes
    this.pos += (this.width % 4);
  }

};

/**
 * add 32bit decode func
 * @author soubok
 */
BmpDecoder.prototype.bit32 = function() {
  //BI_BITFIELDS
  if(this.compress == 3){
    this.maskRed = this.buffer.readUInt32LE(this.pos);
    this.pos+=4;
    this.maskGreen = this.buffer.readUInt32LE(this.pos);
    this.pos+=4;
    this.maskBlue = this.buffer.readUInt32LE(this.pos);
    this.pos+=4;
    this.mask0 = this.buffer.readUInt32LE(this.pos);
    this.pos+=4;
      for (var y = this.height - 1; y >= 0; y--) {
          var line = this.bottom_up ? y : this.height - 1 - y;
          for (var x = 0; x < this.width; x++) {
              //Little Endian rgba
              var alpha = this.buffer.readUInt8(this.pos++);
              var blue = this.buffer.readUInt8(this.pos++);
              var green = this.buffer.readUInt8(this.pos++);
              var red = this.buffer.readUInt8(this.pos++);
              var location = line * this.width * 4 + x * 4;
              this.data[location] = alpha;
              this.data[location + 1] = blue;
              this.data[location + 2] = green;
              this.data[location + 3] = red;
          }
      }

  }else{
      for (var y = this.height - 1; y >= 0; y--) {
          var line = this.bottom_up ? y : this.height - 1 - y;
          for (var x = 0; x < this.width; x++) {
              //Little Endian argb
              var blue = this.buffer.readUInt8(this.pos++);
              var green = this.buffer.readUInt8(this.pos++);
              var red = this.buffer.readUInt8(this.pos++);
              var alpha = this.buffer.readUInt8(this.pos++);
              var location = line * this.width * 4 + x * 4;
              this.data[location] = alpha;
              this.data[location + 1] = blue;
              this.data[location + 2] = green;
              this.data[location + 3] = red;
          }
      }

  }




};

BmpDecoder.prototype.getData = function() {
  return this.data;
};

module.exports = function(bmpData) {
  var decoder = new BmpDecoder(bmpData);
  return decoder;
};

var decoder$1 = /*#__PURE__*/Object.freeze({

});

/**
 * @author shaozilee
 *
 * support 1bit 4bit 8bit 24bit decode
 * encode with 24bit
 * 
 */



var bmpJs = {
  encode: encoder$1,
  decode: decoder$1
};

var dist$5 = createCommonjsModule(function (module, exports) {

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;



var _bmpJs = _interopRequireDefault(bmpJs);



function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var MIME_TYPE = 'image/bmp';
var MIME_TYPE_SECOND = 'image/x-ms-bmp';

function toAGBR(image) {
  return (0, dist$2.scan)(image, 0, 0, image.bitmap.width, image.bitmap.height, function (x, y, index) {
    var red = this.bitmap.data[index + 0];
    var green = this.bitmap.data[index + 1];
    var blue = this.bitmap.data[index + 2];
    var alpha = this.bitmap.data[index + 3];
    this.bitmap.data[index + 0] = alpha;
    this.bitmap.data[index + 1] = blue;
    this.bitmap.data[index + 2] = green;
    this.bitmap.data[index + 3] = red;
  }).bitmap;
}

function fromAGBR(bitmap) {
  return (0, dist$2.scan)({
    bitmap: bitmap
  }, 0, 0, bitmap.width, bitmap.height, function (x, y, index) {
    var alpha = this.bitmap.data[index + 0];
    var blue = this.bitmap.data[index + 1];
    var green = this.bitmap.data[index + 2];
    var red = this.bitmap.data[index + 3];
    this.bitmap.data[index + 0] = red;
    this.bitmap.data[index + 1] = green;
    this.bitmap.data[index + 2] = blue;
    this.bitmap.data[index + 3] = bitmap.is_with_alpha ? alpha : 0xff;
  }).bitmap;
}

var decode = function decode(data) {
  return fromAGBR(_bmpJs.default.decode(data));
};

var encode = function encode(image) {
  return _bmpJs.default.encode(toAGBR(image)).data;
};

var _default = function _default() {
  var _decoders, _encoders;

  return {
    mime: _defineProperty({}, MIME_TYPE, ['bmp']),
    constants: {
      MIME_BMP: MIME_TYPE,
      MIME_X_MS_BMP: MIME_TYPE_SECOND
    },
    decoders: (_decoders = {}, _defineProperty(_decoders, MIME_TYPE, decode), _defineProperty(_decoders, MIME_TYPE_SECOND, decode), _decoders),
    encoders: (_encoders = {}, _defineProperty(_encoders, MIME_TYPE, encode), _defineProperty(_encoders, MIME_TYPE_SECOND, encode), _encoders)
  };
};

exports.default = _default;
module.exports = exports.default;

});

unwrapExports(dist$5);

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("core-js/modules/es6.object.define-property");

var _utif = _interopRequireDefault$1(require("utif"));

function _interopRequireDefault$1(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty$1(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var MIME_TYPE = 'image/tiff';

var _default$1 = function _default() {
  return {
    mime: _defineProperty$1({}, MIME_TYPE, ['tiff', 'tif']),
    constants: {
      MIME_TIFF: MIME_TYPE
    },
    decoders: _defineProperty$1({}, MIME_TYPE, function (data) {
      var ifds = _utif.default.decode(data);

      var page = ifds[0];

      _utif.default.decodeImages(data, ifds);

      var rgba = _utif.default.toRGBA8(page);

      return {
        data: Buffer.from(rgba),
        width: page.t256[0],
        height: page.t257[0]
      };
    }),
    encoders: _defineProperty$1({}, MIME_TYPE, function (image) {
      var tiff = _utif.default.encodeImage(image.bitmap.data, image.bitmap.width, image.bitmap.height);

      return Buffer.from(tiff);
    })
  };
};

exports.default = _default$1;
module.exports = exports.default;

var dist$6 = /*#__PURE__*/Object.freeze({

});

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("core-js/modules/es6.object.define-property");

var _omggif = _interopRequireDefault$2(require("omggif"));

function _interopRequireDefault$2(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty$2(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var MIME_TYPE$1 = 'image/gif';

var _default$2 = function _default() {
  return {
    mime: _defineProperty$2({}, MIME_TYPE$1, ['gif']),
    constants: {
      MIME_GIF: MIME_TYPE$1
    },
    decoders: _defineProperty$2({}, MIME_TYPE$1, function (data) {
      var gifObj = new _omggif.default.GifReader(data);
      var gifData = Buffer.alloc(gifObj.width * gifObj.height * 4);
      gifObj.decodeAndBlitFrameRGBA(0, gifData);
      return {
        data: gifData,
        width: gifObj.width,
        height: gifObj.height
      };
    })
  };
};

exports.default = _default$2;
module.exports = exports.default;

var dist$7 = /*#__PURE__*/Object.freeze({

});

var dist$8 = createCommonjsModule(function (module, exports) {



Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;



var _jpeg = _interopRequireDefault(dist$3);

var _png = _interopRequireDefault(dist$4);

var _bmp = _interopRequireDefault(dist$5);

var _tiff = _interopRequireDefault(dist$6);

var _gif = _interopRequireDefault(dist$7);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = function _default() {
  return (0, timm$1.mergeDeep)((0, _jpeg.default)(), (0, _png.default)(), (0, _bmp.default)(), (0, _tiff.default)(), (0, _gif.default)());
};

exports.default = _default;
module.exports = exports.default;

});

var types = unwrapExports(dist$8);

var $map = _arrayMethods(1);

_export(_export.P + _export.F * !_strictMethod([].map, true), 'Array', {
  // 22.1.3.15 / 15.4.4.19 Array.prototype.map(callbackfn [, thisArg])
  map: function map(callbackfn /* , thisArg */) {
    return $map(this, callbackfn, arguments[1]);
  }
});

var dist$9 = createCommonjsModule(function (module, exports) {



Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;



/**
 * Apply a ordered dithering effect
 * @param {function(Error, Jimp)} cb (optional) a callback for when complete
 * @returns {Jimp} this for chaining of methods
 */
function dither(cb) {
  var rgb565Matrix = [1, 9, 3, 11, 13, 5, 15, 7, 4, 12, 2, 10, 16, 8, 14, 6];
  this.scanQuiet(0, 0, this.bitmap.width, this.bitmap.height, function (x, y, idx) {
    var thresholdId = ((y & 3) << 2) + x % 4;
    var dither = rgb565Matrix[thresholdId];
    this.bitmap.data[idx] = Math.min(this.bitmap.data[idx] + dither, 0xff);
    this.bitmap.data[idx + 1] = Math.min(this.bitmap.data[idx + 1] + dither, 0xff);
    this.bitmap.data[idx + 2] = Math.min(this.bitmap.data[idx + 2] + dither, 0xff);
  });

  if ((0, dist$2.isNodePattern)(cb)) {
    cb.call(this, null, this);
  }

  return this;
}

var _default = function _default() {
  return {
    dither565: dither,
    dither16: dither
  };
};

exports.default = _default;
module.exports = exports.default;

});

unwrapExports(dist$9);

require("core-js/modules/es6.object.define-property");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _utils$1 = require("@jimp/utils");

var _resize = _interopRequireDefault$3(require("./modules/resize"));

var _resize2 = _interopRequireDefault$3(require("./modules/resize2"));

function _interopRequireDefault$3(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default$3 = function _default() {
  return {
    constants: {
      RESIZE_NEAREST_NEIGHBOR: 'nearestNeighbor',
      RESIZE_BILINEAR: 'bilinearInterpolation',
      RESIZE_BICUBIC: 'bicubicInterpolation',
      RESIZE_HERMITE: 'hermiteInterpolation',
      RESIZE_BEZIER: 'bezierInterpolation'
    },
    class: {
      /**
       * Resizes the image to a set width and height using a 2-pass bilinear algorithm
       * @param {number} w the width to resize the image to (or Jimp.AUTO)
       * @param {number} h the height to resize the image to (or Jimp.AUTO)
       * @param {string} mode (optional) a scaling method (e.g. Jimp.RESIZE_BEZIER)
       * @param {function(Error, Jimp)} cb (optional) a callback for when complete
       * @returns {Jimp} this for chaining of methods
       */
      resize: function resize(w, h, mode, cb) {
        if (typeof w !== 'number' || typeof h !== 'number') {
          return _utils$1.throwError.call(this, 'w and h must be numbers', cb);
        }

        if (typeof mode === 'function' && typeof cb === 'undefined') {
          cb = mode;
          mode = null;
        }

        if (w === this.constructor.AUTO && h === this.constructor.AUTO) {
          return _utils$1.throwError.call(this, 'w and h cannot both be set to auto', cb);
        }

        if (w === this.constructor.AUTO) {
          w = this.bitmap.width * (h / this.bitmap.height);
        }

        if (h === this.constructor.AUTO) {
          h = this.bitmap.height * (w / this.bitmap.width);
        }

        if (w < 0 || h < 0) {
          return _utils$1.throwError.call(this, 'w and h must be positive numbers', cb);
        } // round inputs


        w = Math.round(w);
        h = Math.round(h);

        if (typeof _resize2.default[mode] === 'function') {
          var dst = {
            data: Buffer.alloc(w * h * 4),
            width: w,
            height: h
          };

          _resize2.default[mode](this.bitmap, dst);

          this.bitmap = dst;
        } else {
          var image = this;
          var resize = new _resize.default(this.bitmap.width, this.bitmap.height, w, h, true, true, function (buffer) {
            image.bitmap.data = Buffer.from(buffer);
            image.bitmap.width = w;
            image.bitmap.height = h;
          });
          resize.resize(this.bitmap.data);
        }

        if ((0, _utils$1.isNodePattern)(cb)) {
          cb.call(this, null, this);
        }

        return this;
      }
    }
  };
};

exports.default = _default$3;
module.exports = exports.default;

var dist$a = /*#__PURE__*/Object.freeze({

});

var dist$b = createCommonjsModule(function (module, exports) {



Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;







function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var _default = function _default() {
  return {
    /**
     * Blits a source image on to this image
     * @param {Jimp} src the source Jimp instance
     * @param {number} x the x position to blit the image
     * @param {number} y the y position to blit the image
     * @param {number} srcx (optional) the x position from which to crop the source image
     * @param {number} srcy (optional) the y position from which to crop the source image
     * @param {number} srcw (optional) the width to which to crop the source image
     * @param {number} srch (optional) the height to which to crop the source image
     * @param {function(Error, Jimp)} cb (optional) a callback for when complete
     * @returns {Jimp} this for chaining of methods
     */
    blit: function blit(src, x, y, srcx, srcy, srcw, srch, cb) {
      if (!(src instanceof this.constructor)) {
        return dist$2.throwError.call(this, 'The source must be a Jimp image', cb);
      }

      if (typeof x !== 'number' || typeof y !== 'number') {
        return dist$2.throwError.call(this, 'x and y must be numbers', cb);
      }

      if (typeof srcx === 'function') {
        cb = srcx;
        srcx = 0;
        srcy = 0;
        srcw = src.bitmap.width;
        srch = src.bitmap.height;
      } else if (_typeof(srcx) === _typeof(srcy) && _typeof(srcy) === _typeof(srcw) && _typeof(srcw) === _typeof(srch)) {
        srcx = srcx || 0;
        srcy = srcy || 0;
        srcw = srcw || src.bitmap.width;
        srch = srch || src.bitmap.height;
      } else {
        return dist$2.throwError.call(this, 'srcx, srcy, srcw, srch must be numbers', cb);
      } // round input


      x = Math.round(x);
      y = Math.round(y); // round input

      srcx = Math.round(srcx);
      srcy = Math.round(srcy);
      srcw = Math.round(srcw);
      srch = Math.round(srch);
      var maxWidth = this.bitmap.width;
      var maxHeight = this.bitmap.height;
      var baseImage = this;
      src.scanQuiet(srcx, srcy, srcw, srch, function (sx, sy, idx) {
        var xOffset = x + sx - srcx;
        var yOffset = y + sy - srcy;

        if (xOffset >= 0 && yOffset >= 0 && maxWidth - xOffset > 0 && maxHeight - yOffset > 0) {
          var dstIdx = baseImage.getPixelIndex(xOffset, yOffset);
          var _src = {
            r: this.bitmap.data[idx],
            g: this.bitmap.data[idx + 1],
            b: this.bitmap.data[idx + 2],
            a: this.bitmap.data[idx + 3]
          };
          var dst = {
            r: baseImage.bitmap.data[dstIdx],
            g: baseImage.bitmap.data[dstIdx + 1],
            b: baseImage.bitmap.data[dstIdx + 2],
            a: baseImage.bitmap.data[dstIdx + 3]
          };
          baseImage.bitmap.data[dstIdx] = (_src.a * (_src.r - dst.r) - dst.r + 255 >> 8) + dst.r;
          baseImage.bitmap.data[dstIdx + 1] = (_src.a * (_src.g - dst.g) - dst.g + 255 >> 8) + dst.g;
          baseImage.bitmap.data[dstIdx + 2] = (_src.a * (_src.b - dst.b) - dst.b + 255 >> 8) + dst.b;
          baseImage.bitmap.data[dstIdx + 3] = this.constructor.limit255(dst.a + _src.a);
        }
      });

      if ((0, dist$2.isNodePattern)(cb)) {
        cb.call(this, null, this);
      }

      return this;
    }
  };
};

exports.default = _default;
module.exports = exports.default;

});

unwrapExports(dist$b);

require("core-js/modules/es6.object.define-property");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _utils$2 = require("@jimp/utils");
/**
 * Rotates an image clockwise by an arbitrary number of degrees. NB: 'this' must be a Jimp object.
 * @param {number} deg the number of degrees to rotate the image by
 * @param {string|boolean} mode (optional) resize mode or a boolean, if false then the width and height of the image will not be changed
 */


function advancedRotate(deg, mode) {
  deg %= 360;
  var rad = deg * Math.PI / 180;
  var cosine = Math.cos(rad);
  var sine = Math.sin(rad); // the final width and height will change if resize == true

  var w = this.bitmap.width;
  var h = this.bitmap.height;

  if (mode === true || typeof mode === 'string') {
    // resize the image to it maximum dimension and blit the existing image
    // onto the center so that when it is rotated the image is kept in bounds
    // http://stackoverflow.com/questions/3231176/how-to-get-size-of-a-rotated-rectangle
    // Plus 1 border pixel to ensure to show all rotated result for some cases.
    w = Math.ceil(Math.abs(this.bitmap.width * cosine) + Math.abs(this.bitmap.height * sine)) + 1;
    h = Math.ceil(Math.abs(this.bitmap.width * sine) + Math.abs(this.bitmap.height * cosine)) + 1; // Ensure destination to have even size to a better result.

    if (w % 2 !== 0) {
      w++;
    }

    if (h % 2 !== 0) {
      h++;
    }

    var c = this.cloneQuiet();
    this.scanQuiet(0, 0, this.bitmap.width, this.bitmap.height, function (x, y, idx) {
      this.bitmap.data.writeUInt32BE(this._background, idx);
    });
    var max = Math.max(w, h, this.bitmap.width, this.bitmap.height);
    this.resize(max, max, mode);
    this.blit(c, this.bitmap.width / 2 - c.bitmap.width / 2, this.bitmap.height / 2 - c.bitmap.height / 2);
  }

  var bW = this.bitmap.width;
  var bH = this.bitmap.height;
  var dstBuffer = Buffer.alloc(this.bitmap.data.length);

  function createTranslationFunction(deltaX, deltaY) {
    return function (x, y) {
      return {
        x: x + deltaX,
        y: y + deltaY
      };
    };
  }

  var translate2Cartesian = createTranslationFunction(-(bW / 2), -(bH / 2));
  var translate2Screen = createTranslationFunction(bW / 2 + 0.5, bH / 2 + 0.5);

  for (var y = 1; y <= bH; y++) {
    for (var x = 1; x <= bW; x++) {
      var cartesian = translate2Cartesian(x, y);
      var source = translate2Screen(cosine * cartesian.x - sine * cartesian.y, cosine * cartesian.y + sine * cartesian.x);
      var dstIdx = bW * (y - 1) + x - 1 << 2;

      if (source.x >= 0 && source.x < bW && source.y >= 0 && source.y < bH) {
        var srcIdx = (bW * (source.y | 0) + source.x | 0) << 2;
        var pixelRGBA = this.bitmap.data.readUInt32BE(srcIdx);
        dstBuffer.writeUInt32BE(pixelRGBA, dstIdx);
      } else {
        // reset off-image pixels
        dstBuffer.writeUInt32BE(this._background, dstIdx);
      }
    }
  }

  this.bitmap.data = dstBuffer;

  if (mode === true || typeof mode === 'string') {
    // now crop the image to the final size
    var _x = bW / 2 - w / 2;

    var _y = bH / 2 - h / 2;

    this.crop(_x, _y, w, h);
  }
}

var _default$4 = function _default() {
  return {
    /**
     * Rotates the image clockwise by a number of degrees. By default the width and height of the image will be resized appropriately.
     * @param {number} deg the number of degrees to rotate the image by
     * @param {string|boolean} mode (optional) resize mode or a boolean, if false then the width and height of the image will not be changed
     * @param {function(Error, Jimp)} cb (optional) a callback for when complete
     * @returns {Jimp} this for chaining of methods
     */
    rotate: function rotate(deg, mode, cb) {
      // enable overloading
      if (typeof mode === 'undefined' || mode === null) {
        // e.g. image.resize(120);
        // e.g. image.resize(120, null, cb);
        // e.g. image.resize(120, undefined, cb);
        mode = true;
      }

      if (typeof mode === 'function' && typeof cb === 'undefined') {
        // e.g. image.resize(120, cb);
        cb = mode;
        mode = true;
      }

      if (typeof deg !== 'number') {
        return _utils$2.throwError.call(this, 'deg must be a number', cb);
      }

      if (typeof mode !== 'boolean' && typeof mode !== 'string') {
        return _utils$2.throwError.call(this, 'mode must be a boolean or a string', cb);
      }

      advancedRotate.call(this, deg, mode, cb);

      if ((0, _utils$2.isNodePattern)(cb)) {
        cb.call(this, null, this);
      }

      return this;
    }
  };
};

exports.default = _default$4;
module.exports = exports.default;

var dist$c = /*#__PURE__*/Object.freeze({

});

require("core-js/modules/es6.object.define-property");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("core-js/modules/es6.string.iterator");

require("core-js/modules/es6.array.from");

require("core-js/modules/es6.regexp.to-string");

require("core-js/modules/es6.date.to-string");

require("core-js/modules/es7.symbol.async-iterator");

require("core-js/modules/es6.symbol");

require("core-js/modules/web.dom.iterable");

require("core-js/modules/es6.array.for-each");

require("core-js/modules/es6.array.map");

require("core-js/modules/es6.array.is-array");

var _tinycolor$1 = _interopRequireDefault$4(require("tinycolor2"));

var _utils$3 = require("@jimp/utils");

function _interopRequireDefault$4(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function applyKernel(im, kernel, x, y) {
  var value = [0, 0, 0];
  var size = (kernel.length - 1) / 2;

  for (var kx = 0; kx < kernel.length; kx += 1) {
    for (var ky = 0; ky < kernel[kx].length; ky += 1) {
      var idx = im.getPixelIndex(x + kx - size, y + ky - size);
      value[0] += im.bitmap.data[idx] * kernel[kx][ky];
      value[1] += im.bitmap.data[idx + 1] * kernel[kx][ky];
      value[2] += im.bitmap.data[idx + 2] * kernel[kx][ky];
    }
  }

  return value;
}

var isDef = function isDef(v) {
  return typeof v !== 'undefined' && v !== null;
};

function greyscale(cb) {
  this.scanQuiet(0, 0, this.bitmap.width, this.bitmap.height, function (x, y, idx) {
    var grey = parseInt(0.2126 * this.bitmap.data[idx] + 0.7152 * this.bitmap.data[idx + 1] + 0.0722 * this.bitmap.data[idx + 2], 10);
    this.bitmap.data[idx] = grey;
    this.bitmap.data[idx + 1] = grey;
    this.bitmap.data[idx + 2] = grey;
  });

  if ((0, _utils$3.isNodePattern)(cb)) {
    cb.call(this, null, this);
  }

  return this;
}

function mix(clr, clr2) {
  var p = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 50;
  return {
    r: (clr2.r - clr.r) * (p / 100) + clr.r,
    g: (clr2.g - clr.g) * (p / 100) + clr.g,
    b: (clr2.b - clr.b) * (p / 100) + clr.b
  };
}

function colorFn(actions, cb) {
  var _this = this;

  if (!actions || !Array.isArray(actions)) {
    return _utils$3.throwError.call(this, 'actions must be an array', cb);
  }

  actions = actions.map(function (action) {
    if (action.apply === 'xor' || action.apply === 'mix') {
      action.params[0] = (0, _tinycolor$1.default)(action.params[0]).toRgb();
    }

    return action;
  });
  this.scanQuiet(0, 0, this.bitmap.width, this.bitmap.height, function (x, y, idx) {
    var clr = {
      r: _this.bitmap.data[idx],
      g: _this.bitmap.data[idx + 1],
      b: _this.bitmap.data[idx + 2]
    };

    var colorModifier = function colorModifier(i, amount) {
      return _this.constructor.limit255(clr[i] + amount);
    };

    actions.forEach(function (action) {
      if (action.apply === 'mix') {
        clr = mix(clr, action.params[0], action.params[1]);
      } else if (action.apply === 'tint') {
        clr = mix(clr, {
          r: 255,
          g: 255,
          b: 255
        }, action.params[0]);
      } else if (action.apply === 'shade') {
        clr = mix(clr, {
          r: 0,
          g: 0,
          b: 0
        }, action.params[0]);
      } else if (action.apply === 'xor') {
        clr = {
          r: clr.r ^ action.params[0].r,
          g: clr.g ^ action.params[0].g,
          b: clr.b ^ action.params[0].b
        };
      } else if (action.apply === 'red') {
        clr.r = colorModifier('r', action.params[0]);
      } else if (action.apply === 'green') {
        clr.g = colorModifier('g', action.params[0]);
      } else if (action.apply === 'blue') {
        clr.b = colorModifier('b', action.params[0]);
      } else {
        var _clr;

        if (action.apply === 'hue') {
          action.apply = 'spin';
        }

        clr = (0, _tinycolor$1.default)(clr);

        if (!clr[action.apply]) {
          return _utils$3.throwError.call(_this, 'action ' + action.apply + ' not supported', cb);
        }

        clr = (_clr = clr)[action.apply].apply(_clr, _toConsumableArray(action.params)).toRgb();
      }
    });
    _this.bitmap.data[idx] = clr.r;
    _this.bitmap.data[idx + 1] = clr.g;
    _this.bitmap.data[idx + 2] = clr.b;
  });

  if ((0, _utils$3.isNodePattern)(cb)) {
    cb.call(this, null, this);
  }

  return this;
}

var _default$5 = function _default() {
  return {
    /**
     * Adjusts the brightness of the image
     * @param {number} val the amount to adjust the brightness, a number between -1 and +1
     * @param {function(Error, Jimp)} cb (optional) a callback for when complete
     * @returns {Jimp }this for chaining of methods
     */
    brightness: function brightness(val, cb) {
      if (typeof val !== 'number') {
        return _utils$3.throwError.call(this, 'val must be numbers', cb);
      }

      if (val < -1 || val > +1) {
        return _utils$3.throwError.call(this, 'val must be a number between -1 and +1', cb);
      }

      this.scanQuiet(0, 0, this.bitmap.width, this.bitmap.height, function (x, y, idx) {
        if (val < 0.0) {
          this.bitmap.data[idx] = this.bitmap.data[idx] * (1 + val);
          this.bitmap.data[idx + 1] = this.bitmap.data[idx + 1] * (1 + val);
          this.bitmap.data[idx + 2] = this.bitmap.data[idx + 2] * (1 + val);
        } else {
          this.bitmap.data[idx] = this.bitmap.data[idx] + (255 - this.bitmap.data[idx]) * val;
          this.bitmap.data[idx + 1] = this.bitmap.data[idx + 1] + (255 - this.bitmap.data[idx + 1]) * val;
          this.bitmap.data[idx + 2] = this.bitmap.data[idx + 2] + (255 - this.bitmap.data[idx + 2]) * val;
        }
      });

      if ((0, _utils$3.isNodePattern)(cb)) {
        cb.call(this, null, this);
      }

      return this;
    },

    /**
     * Adjusts the contrast of the image
     * @param {number} val the amount to adjust the contrast, a number between -1 and +1
     * @param {function(Error, Jimp)} cb (optional) a callback for when complete
     * @returns {Jimp }this for chaining of methods
     */
    contrast: function contrast(val, cb) {
      if (typeof val !== 'number') {
        return _utils$3.throwError.call(this, 'val must be numbers', cb);
      }

      if (val < -1 || val > +1) {
        return _utils$3.throwError.call(this, 'val must be a number between -1 and +1', cb);
      }

      var factor = (val + 1) / (1 - val);

      function adjust(value) {
        value = Math.floor(factor * (value - 127) + 127);
        return value < 0 ? 0 : value > 255 ? 255 : value;
      }

      this.scanQuiet(0, 0, this.bitmap.width, this.bitmap.height, function (x, y, idx) {
        this.bitmap.data[idx] = adjust(this.bitmap.data[idx]);
        this.bitmap.data[idx + 1] = adjust(this.bitmap.data[idx + 1]);
        this.bitmap.data[idx + 2] = adjust(this.bitmap.data[idx + 2]);
      });

      if ((0, _utils$3.isNodePattern)(cb)) {
        cb.call(this, null, this);
      }

      return this;
    },

    /**
     * Apply a posterize effect
     * @param {number} n the amount to adjust the contrast, minimum threshold is two
     * @param {function(Error, Jimp)} cb (optional) a callback for when complete
     * @returns {Jimp }this for chaining of methods
     */
    posterize: function posterize(n, cb) {
      if (typeof n !== 'number') {
        return _utils$3.throwError.call(this, 'n must be numbers', cb);
      }

      if (n < 2) {
        n = 2;
      } // minimum of 2 levels


      this.scanQuiet(0, 0, this.bitmap.width, this.bitmap.height, function (x, y, idx) {
        this.bitmap.data[idx] = Math.floor(this.bitmap.data[idx] / 255 * (n - 1)) / (n - 1) * 255;
        this.bitmap.data[idx + 1] = Math.floor(this.bitmap.data[idx + 1] / 255 * (n - 1)) / (n - 1) * 255;
        this.bitmap.data[idx + 2] = Math.floor(this.bitmap.data[idx + 2] / 255 * (n - 1)) / (n - 1) * 255;
      });

      if ((0, _utils$3.isNodePattern)(cb)) {
        cb.call(this, null, this);
      }

      return this;
    },

    /**
     * Removes colour from the image using ITU Rec 709 luminance values
     * @param {function(Error, Jimp)} cb (optional) a callback for when complete
     * @returns {Jimp }this for chaining of methods
     */
    greyscale: greyscale,
    // Alias of greyscale for our American friends
    grayscale: greyscale,

    /**
     * Multiplies the opacity of each pixel by a factor between 0 and 1
     * @param {number} f A number, the factor by which to multiply the opacity of each pixel
     * @param {function(Error, Jimp)} cb (optional) a callback for when complete
     * @returns {Jimp }this for chaining of methods
     */
    opacity: function opacity(f, cb) {
      if (typeof f !== 'number') return _utils$3.throwError.call(this, 'f must be a number', cb);
      if (f < 0 || f > 1) return _utils$3.throwError.call(this, 'f must be a number from 0 to 1', cb);
      this.scanQuiet(0, 0, this.bitmap.width, this.bitmap.height, function (x, y, idx) {
        var v = this.bitmap.data[idx + 3] * f;
        this.bitmap.data[idx + 3] = v;
      });

      if ((0, _utils$3.isNodePattern)(cb)) {
        cb.call(this, null, this);
      }

      return this;
    },

    /**
     * Applies a sepia tone to the image
     * @param {function(Error, Jimp)} cb (optional) a callback for when complete
     * @returns {Jimp }this for chaining of methods
     */
    sepia: function sepia(cb) {
      this.scanQuiet(0, 0, this.bitmap.width, this.bitmap.height, function (x, y, idx) {
        var red = this.bitmap.data[idx];
        var green = this.bitmap.data[idx + 1];
        var blue = this.bitmap.data[idx + 2];
        red = red * 0.393 + green * 0.769 + blue * 0.189;
        green = red * 0.349 + green * 0.686 + blue * 0.168;
        blue = red * 0.272 + green * 0.534 + blue * 0.131;
        this.bitmap.data[idx] = red < 255 ? red : 255;
        this.bitmap.data[idx + 1] = green < 255 ? green : 255;
        this.bitmap.data[idx + 2] = blue < 255 ? blue : 255;
      });

      if ((0, _utils$3.isNodePattern)(cb)) {
        cb.call(this, null, this);
      }

      return this;
    },

    /**
     * Fades each pixel by a factor between 0 and 1
     * @param {number} f A number from 0 to 1. 0 will haven no effect. 1 will turn the image completely transparent.
     * @param {function(Error, Jimp)} cb (optional) a callback for when complete
     * @returns {Jimp }this for chaining of methods
     */
    fade: function fade(f, cb) {
      if (typeof f !== 'number') {
        return _utils$3.throwError.call(this, 'f must be a number', cb);
      }

      if (f < 0 || f > 1) {
        return _utils$3.throwError.call(this, 'f must be a number from 0 to 1', cb);
      } // this method is an alternative to opacity (which may be deprecated)


      this.opacity(1 - f);

      if ((0, _utils$3.isNodePattern)(cb)) {
        cb.call(this, null, this);
      }

      return this;
    },

    /**
     * Adds each element of the image to its local neighbors, weighted by the kernel
     * @param {array} kernel a matrix to weight the neighbors sum
     * @param {string} edgeHandling (optional) define how to sum pixels from outside the border
     * @param {function(Error, Jimp)} cb (optional) a callback for when complete
     * @returns {Jimp }this for chaining of methods
     */
    convolution: function convolution(kernel, edgeHandling, cb) {
      if (typeof edgeHandling === 'function' && typeof cb === 'undefined') {
        cb = edgeHandling;
        edgeHandling = null;
      }

      if (!edgeHandling) {
        edgeHandling = this.constructor.EDGE_EXTEND;
      }

      var newData = Buffer.from(this.bitmap.data);
      var kRows = kernel.length;
      var kCols = kernel[0].length;
      var rowEnd = Math.floor(kRows / 2);
      var colEnd = Math.floor(kCols / 2);
      var rowIni = -rowEnd;
      var colIni = -colEnd;
      var weight;
      var rSum;
      var gSum;
      var bSum;
      var ri;
      var gi;
      var bi;
      var xi;
      var yi;
      var idxi;
      this.scanQuiet(0, 0, this.bitmap.width, this.bitmap.height, function (x, y, idx) {
        bSum = 0;
        gSum = 0;
        rSum = 0;

        for (var row = rowIni; row <= rowEnd; row++) {
          for (var col = colIni; col <= colEnd; col++) {
            xi = x + col;
            yi = y + row;
            weight = kernel[row + rowEnd][col + colEnd];
            idxi = this.getPixelIndex(xi, yi, edgeHandling);

            if (idxi === -1) {
              bi = 0;
              gi = 0;
              ri = 0;
            } else {
              ri = this.bitmap.data[idxi + 0];
              gi = this.bitmap.data[idxi + 1];
              bi = this.bitmap.data[idxi + 2];
            }

            rSum += weight * ri;
            gSum += weight * gi;
            bSum += weight * bi;
          }
        }

        if (rSum < 0) {
          rSum = 0;
        }

        if (gSum < 0) {
          gSum = 0;
        }

        if (bSum < 0) {
          bSum = 0;
        }

        if (rSum > 255) {
          rSum = 255;
        }

        if (gSum > 255) {
          gSum = 255;
        }

        if (bSum > 255) {
          bSum = 255;
        }

        newData[idx + 0] = rSum;
        newData[idx + 1] = gSum;
        newData[idx + 2] = bSum;
      });
      this.bitmap.data = newData;

      if ((0, _utils$3.isNodePattern)(cb)) {
        cb.call(this, null, this);
      }

      return this;
    },

    /**
     * Set the alpha channel on every pixel to fully opaque
     * @param {function(Error, Jimp)} cb (optional) a callback for when complete
     * @returns {Jimp }this for chaining of methods
     */
    opaque: function opaque(cb) {
      this.scanQuiet(0, 0, this.bitmap.width, this.bitmap.height, function (x, y, idx) {
        this.bitmap.data[idx + 3] = 255;
      });

      if ((0, _utils$3.isNodePattern)(cb)) {
        cb.call(this, null, this);
      }

      return this;
    },

    /**
     * Pixelates the image or a region
     * @param {number} size the size of the pixels
     * @param {number} x (optional) the x position of the region to pixelate
     * @param {number} y (optional) the y position of the region to pixelate
     * @param {number} w (optional) the width of the region to pixelate
     * @param {number} h (optional) the height of the region to pixelate
     * @param {function(Error, Jimp)} cb (optional) a callback for when complete
     * @returns {Jimp }this for chaining of methods
     */
    pixelate: function pixelate(size, x, y, w, h, cb) {
      if (typeof x === 'function') {
        cb = x;
        h = null;
        w = null;
        y = null;
        x = null;
      } else {
        if (typeof size !== 'number') {
          return _utils$3.throwError.call(this, 'size must be a number', cb);
        }

        if (isDef(x) && typeof x !== 'number') {
          return _utils$3.throwError.call(this, 'x must be a number', cb);
        }

        if (isDef(y) && typeof y !== 'number') {
          return _utils$3.throwError.call(this, 'y must be a number', cb);
        }

        if (isDef(w) && typeof w !== 'number') {
          return _utils$3.throwError.call(this, 'w must be a number', cb);
        }

        if (isDef(h) && typeof h !== 'number') {
          return _utils$3.throwError.call(this, 'h must be a number', cb);
        }
      }

      var kernel = [[1 / 16, 2 / 16, 1 / 16], [2 / 16, 4 / 16, 2 / 16], [1 / 16, 2 / 16, 1 / 16]];
      x = x || 0;
      y = y || 0;
      w = isDef(w) ? w : this.bitmap.width - x;
      h = isDef(h) ? h : this.bitmap.height - y;
      var source = this.cloneQuiet();
      this.scanQuiet(x, y, w, h, function (xx, yx, idx) {
        xx = size * Math.floor(xx / size);
        yx = size * Math.floor(yx / size);
        var value = applyKernel(source, kernel, xx, yx);
        this.bitmap.data[idx] = value[0];
        this.bitmap.data[idx + 1] = value[1];
        this.bitmap.data[idx + 2] = value[2];
      });

      if ((0, _utils$3.isNodePattern)(cb)) {
        cb.call(this, null, this);
      }

      return this;
    },

    /**
     * Applies a convolution kernel to the image or a region
     * @param {array} kernel the convolution kernel
     * @param {number} x (optional) the x position of the region to apply convolution to
     * @param {number} y (optional) the y position of the region to apply convolution to
     * @param {number} w (optional) the width of the region to apply convolution to
     * @param {number} h (optional) the height of the region to apply convolution to
     * @param {function(Error, Jimp)} cb (optional) a callback for when complete
     * @returns {Jimp }this for chaining of methods
     */
    convolute: function convolute(kernel, x, y, w, h, cb) {
      if (!Array.isArray(kernel)) return _utils$3.throwError.call(this, 'the kernel must be an array', cb);

      if (typeof x === 'function') {
        cb = x;
        x = null;
        y = null;
        w = null;
        h = null;
      } else {
        if (isDef(x) && typeof x !== 'number') {
          return _utils$3.throwError.call(this, 'x must be a number', cb);
        }

        if (isDef(y) && typeof y !== 'number') {
          return _utils$3.throwError.call(this, 'y must be a number', cb);
        }

        if (isDef(w) && typeof w !== 'number') {
          return _utils$3.throwError.call(this, 'w must be a number', cb);
        }

        if (isDef(h) && typeof h !== 'number') {
          return _utils$3.throwError.call(this, 'h must be a number', cb);
        }
      }

      var ksize = (kernel.length - 1) / 2;
      x = isDef(x) ? x : ksize;
      y = isDef(y) ? y : ksize;
      w = isDef(w) ? w : this.bitmap.width - x;
      h = isDef(h) ? h : this.bitmap.height - y;
      var source = this.cloneQuiet();
      this.scanQuiet(x, y, w, h, function (xx, yx, idx) {
        var value = applyKernel(source, kernel, xx, yx);
        this.bitmap.data[idx] = this.constructor.limit255(value[0]);
        this.bitmap.data[idx + 1] = this.constructor.limit255(value[1]);
        this.bitmap.data[idx + 2] = this.constructor.limit255(value[2]);
      });

      if ((0, _utils$3.isNodePattern)(cb)) {
        cb.call(this, null, this);
      }

      return this;
    },

    /**
     * Apply multiple color modification rules
     * @param {array} actions list of color modification rules, in following format: { apply: '<rule-name>', params: [ <rule-parameters> ]  }
     * @param {function(Error, Jimp)} cb (optional) a callback for when complete
     * @returns {Jimp }this for chaining of methods
     */
    color: colorFn,
    colour: colorFn
  };
};

exports.default = _default$5;
module.exports = exports.default;

var dist$d = /*#__PURE__*/Object.freeze({

});

var __dirname = '/Users/sym/Repo/atlasify/node_modules/@jimp/plugin-print/dist';

require("core-js/modules/es6.object.define-property");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("core-js/modules/es6.array.from");

require("core-js/modules/es7.symbol.async-iterator");

require("core-js/modules/es6.symbol");

require("core-js/modules/es6.array.is-array");

require("core-js/modules/es7.object.entries");

require("core-js/modules/es6.regexp.to-string");

require("core-js/modules/es6.date.to-string");

require("core-js/modules/es6.promise");

require("core-js/modules/es6.array.iterator");

require("core-js/modules/es6.string.iterator");

require("core-js/modules/es6.array.map");

require("core-js/modules/web.dom.iterable");

require("core-js/modules/es6.array.for-each");

require("core-js/modules/es6.regexp.split");

var _path$1 = _interopRequireDefault$5(require("path"));

var _loadBmfont = _interopRequireDefault$5(require("load-bmfont"));

var _utils$4 = require("@jimp/utils");

var _measureText = require("./measure-text");

function _interopRequireDefault$5(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof$2(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof$2 = function _typeof(obj) { return typeof obj; }; } else { _typeof$2 = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof$2(obj); }

function _toConsumableArray$1(arr) { return _arrayWithoutHoles$1(arr) || _iterableToArray$1(arr) || _nonIterableSpread$1(); }

function _nonIterableSpread$1() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray$1(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles$1(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function xOffsetBasedOnAlignment(constants, font, line, maxWidth, alignment) {
  if (alignment === constants.HORIZONTAL_ALIGN_LEFT) {
    return 0;
  }

  if (alignment === constants.HORIZONTAL_ALIGN_CENTER) {
    return (maxWidth - (0, _measureText.measureText)(font, line)) / 2;
  }

  return maxWidth - (0, _measureText.measureText)(font, line);
}

function drawCharacter(image, font, x, y, char) {
  if (char.width > 0 && char.height > 0) {
    var characterPage = font.pages[char.page];
    image.blit(characterPage, x + char.xoffset, y + char.yoffset, char.x, char.y, char.width, char.height);
  }

  return image;
}

function printText(font, x, y, text, defaultCharWidth) {
  for (var i = 0; i < text.length; i++) {
    var char = void 0;

    if (font.chars[text[i]]) {
      char = text[i];
    } else if (/\s/.test(text[i])) {
      char = '';
    } else {
      char = '?';
    }

    var fontChar = font.chars[char] || {};
    var fontKerning = font.kernings[char];
    drawCharacter(this, font, x, y, fontChar || {});
    var kerning = fontKerning && fontKerning[text[i + 1]] ? fontKerning[text[i + 1]] : 0;
    x += kerning + (fontChar.xadvance || defaultCharWidth);
  }
}

function splitLines(font, text, maxWidth) {
  var words = text.split(' ');
  var lines = [];
  var currentLine = [];
  var longestLine = 0;
  words.forEach(function (word) {
    var line = _toConsumableArray$1(currentLine).concat([word]).join(' ');

    var length = (0, _measureText.measureText)(font, line);

    if (length <= maxWidth) {
      if (length > longestLine) {
        longestLine = length;
      }

      currentLine.push(word);
    } else {
      lines.push(currentLine);
      currentLine = [word];
    }
  });
  lines.push(currentLine);
  return {
    lines: lines,
    longestLine: longestLine
  };
}

function loadPages(Jimp, dir, pages) {
  var newPages = pages.map(function (page) {
    return Jimp.read(dir + '/' + page);
  });
  return Promise.all(newPages);
}

var dir = "".concat(__dirname, "/../");

var _default$6 = function _default() {
  return {
    constants: {
      measureText: _measureText.measureText,
      measureTextHeight: _measureText.measureTextHeight,
      FONT_SANS_8_BLACK: _path$1.default.join(dir, 'fonts/open-sans/open-sans-8-black/open-sans-8-black.fnt'),
      FONT_SANS_10_BLACK: _path$1.default.join(dir, 'fonts/open-sans/open-sans-10-black/open-sans-10-black.fnt'),
      FONT_SANS_12_BLACK: _path$1.default.join(dir, 'fonts/open-sans/open-sans-12-black/open-sans-12-black.fnt'),
      FONT_SANS_14_BLACK: _path$1.default.join(dir, 'fonts/open-sans/open-sans-14-black/open-sans-14-black.fnt'),
      FONT_SANS_16_BLACK: _path$1.default.join(dir, 'fonts/open-sans/open-sans-16-black/open-sans-16-black.fnt'),
      FONT_SANS_32_BLACK: _path$1.default.join(dir, 'fonts/open-sans/open-sans-32-black/open-sans-32-black.fnt'),
      FONT_SANS_64_BLACK: _path$1.default.join(dir, 'fonts/open-sans/open-sans-64-black/open-sans-64-black.fnt'),
      FONT_SANS_128_BLACK: _path$1.default.join(dir, 'fonts/open-sans/open-sans-128-black/open-sans-128-black.fnt'),
      FONT_SANS_8_WHITE: _path$1.default.join(dir, 'fonts/open-sans/open-sans-8-white/open-sans-8-white.fnt'),
      FONT_SANS_16_WHITE: _path$1.default.join(dir, 'fonts/open-sans/open-sans-16-white/open-sans-16-white.fnt'),
      FONT_SANS_32_WHITE: _path$1.default.join(dir, 'fonts/open-sans/open-sans-32-white/open-sans-32-white.fnt'),
      FONT_SANS_64_WHITE: _path$1.default.join(dir, 'fonts/open-sans/open-sans-64-white/open-sans-64-white.fnt'),
      FONT_SANS_128_WHITE: _path$1.default.join(dir, 'fonts/open-sans/open-sans-128-white/open-sans-128-white.fnt'),

      /**
       * Loads a bitmap font from a file
       * @param {string} file the file path of a .fnt file
       * @param {function(Error, Jimp)} cb (optional) a function to call when the font is loaded
       * @returns {Promise} a promise
       */
      loadFont: function loadFont(file, cb) {
        var _this = this;

        if (typeof file !== 'string') return _utils$4.throwError.call(this, 'file must be a string', cb);
        return new Promise(function (resolve, reject) {
          cb = cb || function (err, font) {
            if (err) reject(err);else resolve(font);
          };

          (0, _loadBmfont.default)(file, function (err, font) {
            var chars = {};
            var kernings = {};

            if (err) {
              return _utils$4.throwError.call(_this, err, cb);
            }

            for (var i = 0; i < font.chars.length; i++) {
              chars[String.fromCharCode(font.chars[i].id)] = font.chars[i];
            }

            for (var _i = 0; _i < font.kernings.length; _i++) {
              var firstString = String.fromCharCode(font.kernings[_i].first);
              kernings[firstString] = kernings[firstString] || {};
              kernings[firstString][String.fromCharCode(font.kernings[_i].second)] = font.kernings[_i].amount;
            }

            loadPages(_this, _path$1.default.dirname(file), font.pages).then(function (pages) {
              cb(null, {
                chars: chars,
                kernings: kernings,
                pages: pages,
                common: font.common,
                info: font.info
              });
            });
          });
        });
      }
    },
    class: {
      /**
       * Draws a text on a image on a given boundary
       * @param {Jimp} font a bitmap font loaded from `Jimp.loadFont` command
       * @param {number} x the x position to start drawing the text
       * @param {number} y the y position to start drawing the text
       * @param {any} text the text to draw (string or object with `text`, `alignmentX`, and/or `alignmentY`)
       * @param {number} maxWidth (optional) the boundary width to draw in
       * @param {number} maxHeight (optional) the boundary height to draw in
       * @param {function(Error, Jimp)} cb (optional) a function to call when the text is written
       * @returns {Jimp} this for chaining of methods
       */
      print: function print(font, x, y, text, maxWidth, maxHeight, cb) {
        var _this2 = this;

        if (typeof maxWidth === 'function' && typeof cb === 'undefined') {
          cb = maxWidth;
          maxWidth = Infinity;
        }

        if (typeof maxWidth === 'undefined') {
          maxWidth = Infinity;
        }

        if (typeof maxHeight === 'function' && typeof cb === 'undefined') {
          cb = maxHeight;
          maxHeight = Infinity;
        }

        if (typeof maxHeight === 'undefined') {
          maxHeight = Infinity;
        }

        if (_typeof$2(font) !== 'object') {
          return _utils$4.throwError.call(this, 'font must be a Jimp loadFont', cb);
        }

        if (typeof x !== 'number' || typeof y !== 'number' || typeof maxWidth !== 'number') {
          return _utils$4.throwError.call(this, 'x, y and maxWidth must be numbers', cb);
        }

        if (typeof maxWidth !== 'number') {
          return _utils$4.throwError.call(this, 'maxWidth must be a number', cb);
        }

        if (typeof maxHeight !== 'number') {
          return _utils$4.throwError.call(this, 'maxHeight must be a number', cb);
        }

        var alignmentX;
        var alignmentY;

        if (_typeof$2(text) === 'object' && text.text !== null && text.text !== undefined) {
          alignmentX = text.alignmentX || this.constructor.HORIZONTAL_ALIGN_LEFT;
          alignmentY = text.alignmentY || this.constructor.VERTICAL_ALIGN_TOP;
          var _text = text;
          text = _text.text;
        } else {
          alignmentX = this.constructor.HORIZONTAL_ALIGN_LEFT;
          alignmentY = this.constructor.VERTICAL_ALIGN_TOP;
          text = text.toString();
        }

        if (maxHeight !== Infinity && alignmentY === this.constructor.VERTICAL_ALIGN_BOTTOM) {
          y += maxHeight - (0, _measureText.measureTextHeight)(font, text, maxWidth);
        } else if (maxHeight !== Infinity && alignmentY === this.constructor.VERTICAL_ALIGN_MIDDLE) {
          y += maxHeight / 2 - (0, _measureText.measureTextHeight)(font, text, maxWidth) / 2;
        }

        var defaultCharWidth = Object.entries(font.chars)[0][1].xadvance;

        var _splitLines = splitLines(font, text, maxWidth),
            lines = _splitLines.lines,
            longestLine = _splitLines.longestLine;

        lines.forEach(function (line) {
          var lineString = line.join(' ');
          var alignmentWidth = xOffsetBasedOnAlignment(_this2.constructor, font, lineString, maxWidth, alignmentX);
          printText.call(_this2, font, x + alignmentWidth, y, lineString, defaultCharWidth);
          y += font.common.lineHeight;
        });

        if ((0, _utils$4.isNodePattern)(cb)) {
          cb.call(this, null, this, {
            x: x + longestLine,
            y: y
          });
        }

        return this;
      }
    }
  };
};

exports.default = _default$6;
module.exports = exports.default;

var dist$e = /*#__PURE__*/Object.freeze({

});

var blurTables = createCommonjsModule(function (module, exports) {



Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.shgTable = exports.mulTable = void 0;
var mulTable = [1, 57, 41, 21, 203, 34, 97, 73, 227, 91, 149, 62, 105, 45, 39, 137, 241, 107, 3, 173, 39, 71, 65, 238, 219, 101, 187, 87, 81, 151, 141, 133, 249, 117, 221, 209, 197, 187, 177, 169, 5, 153, 73, 139, 133, 127, 243, 233, 223, 107, 103, 99, 191, 23, 177, 171, 165, 159, 77, 149, 9, 139, 135, 131, 253, 245, 119, 231, 224, 109, 211, 103, 25, 195, 189, 23, 45, 175, 171, 83, 81, 79, 155, 151, 147, 9, 141, 137, 67, 131, 129, 251, 123, 30, 235, 115, 113, 221, 217, 53, 13, 51, 50, 49, 193, 189, 185, 91, 179, 175, 43, 169, 83, 163, 5, 79, 155, 19, 75, 147, 145, 143, 35, 69, 17, 67, 33, 65, 255, 251, 247, 243, 239, 59, 29, 229, 113, 111, 219, 27, 213, 105, 207, 51, 201, 199, 49, 193, 191, 47, 93, 183, 181, 179, 11, 87, 43, 85, 167, 165, 163, 161, 159, 157, 155, 77, 19, 75, 37, 73, 145, 143, 141, 35, 138, 137, 135, 67, 33, 131, 129, 255, 63, 250, 247, 61, 121, 239, 237, 117, 29, 229, 227, 225, 111, 55, 109, 216, 213, 211, 209, 207, 205, 203, 201, 199, 197, 195, 193, 48, 190, 47, 93, 185, 183, 181, 179, 178, 176, 175, 173, 171, 85, 21, 167, 165, 41, 163, 161, 5, 79, 157, 78, 154, 153, 19, 75, 149, 74, 147, 73, 144, 143, 71, 141, 140, 139, 137, 17, 135, 134, 133, 66, 131, 65, 129, 1];
exports.mulTable = mulTable;
var shgTable = [0, 9, 10, 10, 14, 12, 14, 14, 16, 15, 16, 15, 16, 15, 15, 17, 18, 17, 12, 18, 16, 17, 17, 19, 19, 18, 19, 18, 18, 19, 19, 19, 20, 19, 20, 20, 20, 20, 20, 20, 15, 20, 19, 20, 20, 20, 21, 21, 21, 20, 20, 20, 21, 18, 21, 21, 21, 21, 20, 21, 17, 21, 21, 21, 22, 22, 21, 22, 22, 21, 22, 21, 19, 22, 22, 19, 20, 22, 22, 21, 21, 21, 22, 22, 22, 18, 22, 22, 21, 22, 22, 23, 22, 20, 23, 22, 22, 23, 23, 21, 19, 21, 21, 21, 23, 23, 23, 22, 23, 23, 21, 23, 22, 23, 18, 22, 23, 20, 22, 23, 23, 23, 21, 22, 20, 22, 21, 22, 24, 24, 24, 24, 24, 22, 21, 24, 23, 23, 24, 21, 24, 23, 24, 22, 24, 24, 22, 24, 24, 22, 23, 24, 24, 24, 20, 23, 22, 23, 24, 24, 24, 24, 24, 24, 24, 23, 21, 23, 22, 23, 24, 24, 24, 22, 24, 24, 24, 23, 22, 24, 24, 25, 23, 25, 25, 23, 24, 25, 25, 24, 22, 25, 25, 25, 24, 23, 24, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 23, 25, 23, 24, 25, 25, 25, 25, 25, 25, 25, 25, 25, 24, 22, 25, 25, 23, 25, 25, 20, 24, 25, 24, 25, 25, 22, 24, 25, 24, 25, 24, 25, 25, 24, 25, 25, 25, 25, 22, 25, 25, 25, 24, 25, 24, 25, 18];
exports.shgTable = shgTable;

});

unwrapExports(blurTables);
var blurTables_1 = blurTables.shgTable;
var blurTables_2 = blurTables.mulTable;

var dist$f = createCommonjsModule(function (module, exports) {



Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;





/*
    Superfast Blur (0.5)
    http://www.quasimondo.com/BoxBlurForCanvas/FastBlur.js

    Copyright (c) 2011 Mario Klingemann

    Permission is hereby granted, free of charge, to any person
    obtaining a copy of this software and associated documentation
    files (the "Software"), to deal in the Software without
    restriction, including without limitation the rights to use,
    copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the
    Software is furnished to do so, subject to the following
    conditions:

    The above copyright notice and this permission notice shall be
    included in all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
    EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
    OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
    NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
    HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
    WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
    FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
    OTHER DEALINGS IN THE SOFTWARE.
*/
var _default = function _default() {
  return {
    /**
     * A fast blur algorithm that produces similar effect to a Gaussian blur - but MUCH quicker
     * @param {number} r the pixel radius of the blur
     * @param {function(Error, Jimp)} cb (optional) a callback for when complete
     * @returns {Jimp} this for chaining of methods
     */
    blur: function blur(r, cb) {
      if (typeof r !== 'number') return dist$2.throwError.call(this, 'r must be a number', cb);
      if (r < 1) return dist$2.throwError.call(this, 'r must be greater than 0', cb);
      var rsum;
      var gsum;
      var bsum;
      var asum;
      var x;
      var y;
      var i;
      var p;
      var p1;
      var p2;
      var yp;
      var yi;
      var yw;
      var pa;
      var wm = this.bitmap.width - 1;
      var hm = this.bitmap.height - 1; // const wh = this.bitmap.width * this.bitmap.height;

      var rad1 = r + 1;
      var mulSum = blurTables.mulTable[r];
      var shgSum = blurTables.shgTable[r];
      var red = [];
      var green = [];
      var blue = [];
      var alpha = [];
      var vmin = [];
      var vmax = [];
      var iterations = 2;

      while (iterations-- > 0) {
        yi = 0;
        yw = 0;

        for (y = 0; y < this.bitmap.height; y++) {
          rsum = this.bitmap.data[yw] * rad1;
          gsum = this.bitmap.data[yw + 1] * rad1;
          bsum = this.bitmap.data[yw + 2] * rad1;
          asum = this.bitmap.data[yw + 3] * rad1;

          for (i = 1; i <= r; i++) {
            p = yw + ((i > wm ? wm : i) << 2);
            rsum += this.bitmap.data[p++];
            gsum += this.bitmap.data[p++];
            bsum += this.bitmap.data[p++];
            asum += this.bitmap.data[p];
          }

          for (x = 0; x < this.bitmap.width; x++) {
            red[yi] = rsum;
            green[yi] = gsum;
            blue[yi] = bsum;
            alpha[yi] = asum;

            if (y === 0) {
              vmin[x] = ((p = x + rad1) < wm ? p : wm) << 2;
              vmax[x] = (p = x - r) > 0 ? p << 2 : 0;
            }

            p1 = yw + vmin[x];
            p2 = yw + vmax[x];
            rsum += this.bitmap.data[p1++] - this.bitmap.data[p2++];
            gsum += this.bitmap.data[p1++] - this.bitmap.data[p2++];
            bsum += this.bitmap.data[p1++] - this.bitmap.data[p2++];
            asum += this.bitmap.data[p1] - this.bitmap.data[p2];
            yi++;
          }

          yw += this.bitmap.width << 2;
        }

        for (x = 0; x < this.bitmap.width; x++) {
          yp = x;
          rsum = red[yp] * rad1;
          gsum = green[yp] * rad1;
          bsum = blue[yp] * rad1;
          asum = alpha[yp] * rad1;

          for (i = 1; i <= r; i++) {
            yp += i > hm ? 0 : this.bitmap.width;
            rsum += red[yp];
            gsum += green[yp];
            bsum += blue[yp];
            asum += alpha[yp];
          }

          yi = x << 2;

          for (y = 0; y < this.bitmap.height; y++) {
            pa = asum * mulSum >>> shgSum;
            this.bitmap.data[yi + 3] = pa; // normalize alpha

            if (pa > 255) {
              this.bitmap.data[yi + 3] = 255;
            }

            if (pa > 0) {
              pa = 255 / pa;
              this.bitmap.data[yi] = (rsum * mulSum >>> shgSum) * pa;
              this.bitmap.data[yi + 1] = (gsum * mulSum >>> shgSum) * pa;
              this.bitmap.data[yi + 2] = (bsum * mulSum >>> shgSum) * pa;
            } else {
              this.bitmap.data[yi + 2] = 0;
              this.bitmap.data[yi + 1] = 0;
              this.bitmap.data[yi] = 0;
            }

            if (x === 0) {
              vmin[y] = ((p = y + rad1) < hm ? p : hm) * this.bitmap.width;
              vmax[y] = (p = y - r) > 0 ? p * this.bitmap.width : 0;
            }

            p1 = x + vmin[y];
            p2 = x + vmax[y];
            rsum += red[p1] - red[p2];
            gsum += green[p1] - green[p2];
            bsum += blue[p1] - blue[p2];
            asum += alpha[p1] - alpha[p2];
            yi += this.bitmap.width << 2;
          }
        }
      }

      if ((0, dist$2.isNodePattern)(cb)) {
        cb.call(this, null, this);
      }

      return this;
    }
  };
};

exports.default = _default;
module.exports = exports.default;

});

unwrapExports(dist$f);

require("core-js/modules/es6.object.define-property");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = pluginCrop;

require("core-js/modules/es7.symbol.async-iterator");

require("core-js/modules/es6.symbol");

var _utils$5 = require("@jimp/utils");

function _typeof$3(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof$3 = function _typeof(obj) { return typeof obj; }; } else { _typeof$3 = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof$3(obj); }

function pluginCrop(event) {
  /**
   * Crops the image at a given point to a give size
   * @param {number} x the x coordinate to crop form
   * @param {number} y the y coordinate to crop form
   * @param w the width of the crop region
   * @param h the height of the crop region
   * @param {function(Error, Jimp)} cb (optional) a callback for when complete
   * @returns {Jimp} this for chaining of methods
   */
  event('crop', function (x, y, w, h, cb) {
    if (typeof x !== 'number' || typeof y !== 'number') return _utils$5.throwError.call(this, 'x and y must be numbers', cb);
    if (typeof w !== 'number' || typeof h !== 'number') return _utils$5.throwError.call(this, 'w and h must be numbers', cb); // round input

    x = Math.round(x);
    y = Math.round(y);
    w = Math.round(w);
    h = Math.round(h);

    if (x === 0 && w === this.bitmap.width) {
      // shortcut
      var start = w * y + x << 2;
      var end = start + h * w << 2 + 1;
      this.bitmap.data = this.bitmap.data.slice(start, end);
    } else {
      var bitmap = Buffer.allocUnsafe(w * h * 4);
      var offset = 0;
      this.scanQuiet(x, y, w, h, function (x, y, idx) {
        var data = this.bitmap.data.readUInt32BE(idx, true);
        bitmap.writeUInt32BE(data, offset, true);
        offset += 4;
      });
      this.bitmap.data = bitmap;
    }

    this.bitmap.width = w;
    this.bitmap.height = h;

    if ((0, _utils$5.isNodePattern)(cb)) {
      cb.call(this, null, this);
    }

    return this;
  });
  return {
    class: {
      /**
       * Autocrop same color borders from this image
       * @param {number} tolerance (optional): a percent value of tolerance for pixels color difference (default: 0.0002%)
       * @param {boolean} cropOnlyFrames (optional): flag to crop only real frames: all 4 sides of the image must have some border (default: true)
       * @param {function(Error, Jimp)} cb (optional): a callback for when complete (default: no callback)
       * @returns {Jimp} this for chaining of methods
       */
      autocrop: function autocrop() {
        var w = this.bitmap.width;
        var h = this.bitmap.height;
        var minPixelsPerSide = 1; // to avoid cropping completely the image, resulting in an invalid 0 sized image

        var cb; // callback

        var leaveBorder = 0; // Amount of pixels in border to leave

        var tolerance = 0.0002; // percent of color difference tolerance (default value)

        var cropOnlyFrames = true; // flag to force cropping only if the image has a real "frame"
        // i.e. all 4 sides have some border (default value)

        var cropSymmetric = false; // flag to force cropping top be symmetric.
        // i.e. north and south / east and west are cropped by the same value
        // parse arguments

        for (var a = 0, len = arguments.length; a < len; a++) {
          if (typeof (a < 0 || arguments.length <= a ? undefined : arguments[a]) === 'number') {
            // tolerance value passed
            tolerance = a < 0 || arguments.length <= a ? undefined : arguments[a];
          }

          if (typeof (a < 0 || arguments.length <= a ? undefined : arguments[a]) === 'boolean') {
            // cropOnlyFrames value passed
            cropOnlyFrames = a < 0 || arguments.length <= a ? undefined : arguments[a];
          }

          if (typeof (a < 0 || arguments.length <= a ? undefined : arguments[a]) === 'function') {
            // callback value passed
            cb = a < 0 || arguments.length <= a ? undefined : arguments[a];
          }

          if (_typeof$3(a < 0 || arguments.length <= a ? undefined : arguments[a]) === 'object') {
            // config object passed
            var config = a < 0 || arguments.length <= a ? undefined : arguments[a];

            if (typeof config.tolerance !== 'undefined') {
              tolerance = config.tolerance;
            }

            if (typeof config.cropOnlyFrames !== 'undefined') {
              cropOnlyFrames = config.cropOnlyFrames;
            }

            if (typeof config.cropSymmetric !== 'undefined') {
              cropSymmetric = config.cropSymmetric;
            }

            if (typeof config.leaveBorder !== 'undefined') {
              leaveBorder = config.leaveBorder;
            }
          }
        }
        /**
         * All borders must be of the same color as the top left pixel, to be cropped.
         * It should be possible to crop borders each with a different color,
         * but since there are many ways for corners to intersect, it would
         * introduce unnecessary complexity to the algorithm.
         */
        // scan each side for same color borders


        var colorTarget = this.getPixelColor(0, 0); // top left pixel color is the target color

        var rgba1 = this.constructor.intToRGBA(colorTarget); // for north and east sides

        var northPixelsToCrop = 0;
        var eastPixelsToCrop = 0;
        var southPixelsToCrop = 0;
        var westPixelsToCrop = 0; // north side (scan rows from north to south)

        colorTarget = this.getPixelColor(0, 0);

        north: for (var y = 0; y < h - minPixelsPerSide; y++) {
          for (var x = 0; x < w; x++) {
            var colorXY = this.getPixelColor(x, y);
            var rgba2 = this.constructor.intToRGBA(colorXY);

            if (this.constructor.colorDiff(rgba1, rgba2) > tolerance) {
              // this pixel is too distant from the first one: abort this side scan
              break north;
            }
          } // this row contains all pixels with the same color: increment this side pixels to crop


          northPixelsToCrop++;
        } // east side (scan columns from east to west)


        colorTarget = this.getPixelColor(w, 0);

        east: for (var _x = 0; _x < w - minPixelsPerSide; _x++) {
          for (var _y = 0 + northPixelsToCrop; _y < h; _y++) {
            var _colorXY = this.getPixelColor(_x, _y);

            var _rgba = this.constructor.intToRGBA(_colorXY);

            if (this.constructor.colorDiff(rgba1, _rgba) > tolerance) {
              // this pixel is too distant from the first one: abort this side scan
              break east;
            }
          } // this column contains all pixels with the same color: increment this side pixels to crop


          eastPixelsToCrop++;
        } // south side (scan rows from south to north)


        colorTarget = this.getPixelColor(0, h);

        south: for (var _y2 = h - 1; _y2 >= northPixelsToCrop + minPixelsPerSide; _y2--) {
          for (var _x2 = w - eastPixelsToCrop - 1; _x2 >= 0; _x2--) {
            var _colorXY2 = this.getPixelColor(_x2, _y2);

            var _rgba2 = this.constructor.intToRGBA(_colorXY2);

            if (this.constructor.colorDiff(rgba1, _rgba2) > tolerance) {
              // this pixel is too distant from the first one: abort this side scan
              break south;
            }
          } // this row contains all pixels with the same color: increment this side pixels to crop


          southPixelsToCrop++;
        } // west side (scan columns from west to east)


        colorTarget = this.getPixelColor(w, h);

        west: for (var _x3 = w - 1; _x3 >= 0 + eastPixelsToCrop + minPixelsPerSide; _x3--) {
          for (var _y3 = h - 1; _y3 >= 0 + northPixelsToCrop; _y3--) {
            var _colorXY3 = this.getPixelColor(_x3, _y3);

            var _rgba3 = this.constructor.intToRGBA(_colorXY3);

            if (this.constructor.colorDiff(rgba1, _rgba3) > tolerance) {
              // this pixel is too distant from the first one: abort this side scan
              break west;
            }
          } // this column contains all pixels with the same color: increment this side pixels to crop


          westPixelsToCrop++;
        } // decide if a crop is needed


        var doCrop = false; // apply leaveBorder

        westPixelsToCrop = westPixelsToCrop - leaveBorder;
        eastPixelsToCrop = eastPixelsToCrop - leaveBorder;
        northPixelsToCrop = northPixelsToCrop - leaveBorder;
        southPixelsToCrop = southPixelsToCrop - leaveBorder;

        if (cropSymmetric) {
          var horizontal = Math.min(eastPixelsToCrop, westPixelsToCrop);
          var vertical = Math.min(northPixelsToCrop, southPixelsToCrop);
          westPixelsToCrop = horizontal;
          eastPixelsToCrop = horizontal;
          northPixelsToCrop = vertical;
          southPixelsToCrop = vertical;
        } // safety checks


        var widthOfRemainingPixels = w - (westPixelsToCrop + eastPixelsToCrop);
        var heightOfRemainingPixels = h - (southPixelsToCrop + northPixelsToCrop); // make sure that crops are > 0

        westPixelsToCrop = westPixelsToCrop >= 0 ? westPixelsToCrop : 0;
        eastPixelsToCrop = eastPixelsToCrop >= 0 ? eastPixelsToCrop : 0;
        northPixelsToCrop = northPixelsToCrop >= 0 ? northPixelsToCrop : 0;
        southPixelsToCrop = southPixelsToCrop >= 0 ? southPixelsToCrop : 0;

        if (cropOnlyFrames) {
          // crop image if all sides should be cropped
          doCrop = eastPixelsToCrop !== 0 && northPixelsToCrop !== 0 && westPixelsToCrop !== 0 && southPixelsToCrop !== 0;
        } else {
          // crop image if at least one side should be cropped
          doCrop = eastPixelsToCrop !== 0 || northPixelsToCrop !== 0 || westPixelsToCrop !== 0 || southPixelsToCrop !== 0;
        }

        if (doCrop) {
          // do the real crop
          this.crop(eastPixelsToCrop, northPixelsToCrop, widthOfRemainingPixels, heightOfRemainingPixels);
        }

        if ((0, _utils$5.isNodePattern)(cb)) {
          cb.call(this, null, this);
        }

        return this;
      }
    }
  };
}

module.exports = exports.default;

var dist$g = /*#__PURE__*/Object.freeze({

});

// 22.1.3.9 Array.prototype.findIndex(predicate, thisArg = undefined)

var $find = _arrayMethods(6);
var KEY = 'findIndex';
var forced = true;
// Shouldn't skip holes
if (KEY in []) Array(1)[KEY](function () { forced = false; });
_export(_export.P + _export.F * forced, 'Array', {
  findIndex: function findIndex(callbackfn /* , that = undefined */) {
    return $find(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
  }
});
_addToUnscopables(KEY);

var _arrayFill = function fill(value /* , start = 0, end = @length */) {
  var O = _toObject(this);
  var length = _toLength(O.length);
  var aLen = arguments.length;
  var index = _toAbsoluteIndex(aLen > 1 ? arguments[1] : undefined, length);
  var end = aLen > 2 ? arguments[2] : undefined;
  var endPos = end === undefined ? length : _toAbsoluteIndex(end, length);
  while (endPos > index) O[index++] = value;
  return O;
};

// 22.1.3.6 Array.prototype.fill(value, start = 0, end = this.length)


_export(_export.P, 'Array', { fill: _arrayFill });

_addToUnscopables('fill');

var dist$h = createCommonjsModule(function (module, exports) {



Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;







/* eslint-disable no-labels */

/**
 * Get an image's histogram
 * @return {object} An object with an array of color occurrence counts for each channel (r,g,b)
 */
function histogram() {
  var histogram = {
    r: new Array(256).fill(0),
    g: new Array(256).fill(0),
    b: new Array(256).fill(0)
  };
  this.scanQuiet(0, 0, this.bitmap.width, this.bitmap.height, function (x, y, index) {
    histogram.r[this.bitmap.data[index + 0]]++;
    histogram.g[this.bitmap.data[index + 1]]++;
    histogram.b[this.bitmap.data[index + 2]]++;
  });
  return histogram;
}
/**
 * Normalize values
 * @param  {integer} value Pixel channel value.
 * @param  {integer} min   Minimum value for channel
 * @param  {integer} max   Maximum value for channel
 * @return {integer} normalized values
 */


var _normalize = function normalize(value, min, max) {
  return (value - min) * 255 / (max - min);
};

var getBounds = function getBounds(histogramChannel) {
  return [histogramChannel.findIndex(function (value) {
    return value > 0;
  }), 255 - histogramChannel.slice().reverse().findIndex(function (value) {
    return value > 0;
  })];
};
/**
 * Normalizes the image
 * @param {function(Error, Jimp)} cb (optional) a callback for when complete
 * @returns {Jimp} this for chaining of methods
 */


var _default = function _default() {
  return {
    normalize: function normalize(cb) {
      var h = histogram.call(this); // store bounds (minimum and maximum values)

      var bounds = {
        r: getBounds(h.r),
        g: getBounds(h.g),
        b: getBounds(h.b)
      }; // apply value transformations

      this.scanQuiet(0, 0, this.bitmap.width, this.bitmap.height, function (x, y, idx) {
        var r = this.bitmap.data[idx + 0];
        var g = this.bitmap.data[idx + 1];
        var b = this.bitmap.data[idx + 2];
        this.bitmap.data[idx + 0] = _normalize(r, bounds.r[0], bounds.r[1]);
        this.bitmap.data[idx + 1] = _normalize(g, bounds.g[0], bounds.g[1]);
        this.bitmap.data[idx + 2] = _normalize(b, bounds.b[0], bounds.b[1]);
      });

      if ((0, dist$2.isNodePattern)(cb)) {
        cb.call(this, null, this);
      }

      return this;
    }
  };
};

exports.default = _default;
module.exports = exports.default;

});

unwrapExports(dist$h);

var dist$i = createCommonjsModule(function (module, exports) {



Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;



/**
 * Inverts the image
 * @param {function(Error, Jimp)} cb (optional) a callback for when complete
 * @returns {Jimp} this for chaining of methods
 */
var _default = function _default() {
  return {
    invert: function invert(cb) {
      this.scanQuiet(0, 0, this.bitmap.width, this.bitmap.height, function (x, y, idx) {
        this.bitmap.data[idx] = 255 - this.bitmap.data[idx];
        this.bitmap.data[idx + 1] = 255 - this.bitmap.data[idx + 1];
        this.bitmap.data[idx + 2] = 255 - this.bitmap.data[idx + 2];
      });

      if ((0, dist$2.isNodePattern)(cb)) {
        cb.call(this, null, this);
      }

      return this;
    }
  };
};

exports.default = _default;
module.exports = exports.default;

});

unwrapExports(dist$i);

var dist$j = createCommonjsModule(function (module, exports) {



Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;



/**
 * Applies a true Gaussian blur to the image (warning: this is VERY slow)
 * @param {number} r the pixel radius of the blur
 * @param {function(Error, Jimp)} cb (optional) a callback for when complete
 * @returns {Jimp} this for chaining of methods
 */
var _default = function _default() {
  return {
    gaussian: function gaussian(r, cb) {
      // http://blog.ivank.net/fastest-gaussian-blur.html
      if (typeof r !== 'number') {
        return dist$2.throwError.call(this, 'r must be a number', cb);
      }

      if (r < 1) {
        return dist$2.throwError.call(this, 'r must be greater than 0', cb);
      }

      var rs = Math.ceil(r * 2.57); // significant radius

      var range = rs * 2 + 1;
      var rr2 = r * r * 2;
      var rr2pi = rr2 * Math.PI;
      var weights = [];

      for (var y = 0; y < range; y++) {
        weights[y] = [];

        for (var x = 0; x < range; x++) {
          var dsq = Math.pow(x - rs, 2) + Math.pow(y - rs, 2);
          weights[y][x] = Math.exp(-dsq / rr2) / rr2pi;
        }
      }

      for (var _y = 0; _y < this.bitmap.height; _y++) {
        for (var _x = 0; _x < this.bitmap.width; _x++) {
          var red = 0;
          var green = 0;
          var blue = 0;
          var alpha = 0;
          var wsum = 0;

          for (var iy = 0; iy < range; iy++) {
            for (var ix = 0; ix < range; ix++) {
              var x1 = Math.min(this.bitmap.width - 1, Math.max(0, ix + _x - rs));
              var y1 = Math.min(this.bitmap.height - 1, Math.max(0, iy + _y - rs));
              var weight = weights[iy][ix];

              var _idx = y1 * this.bitmap.width + x1 << 2;

              red += this.bitmap.data[_idx] * weight;
              green += this.bitmap.data[_idx + 1] * weight;
              blue += this.bitmap.data[_idx + 2] * weight;
              alpha += this.bitmap.data[_idx + 3] * weight;
              wsum += weight;
            }

            var idx = _y * this.bitmap.width + _x << 2;
            this.bitmap.data[idx] = Math.round(red / wsum);
            this.bitmap.data[idx + 1] = Math.round(green / wsum);
            this.bitmap.data[idx + 2] = Math.round(blue / wsum);
            this.bitmap.data[idx + 3] = Math.round(alpha / wsum);
          }
        }
      }

      if ((0, dist$2.isNodePattern)(cb)) {
        cb.call(this, null, this);
      }

      return this;
    }
  };
};

exports.default = _default;
module.exports = exports.default;

});

unwrapExports(dist$j);

require("core-js/modules/es6.object.define-property");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _utils$6 = require("@jimp/utils");

/**
 * Flip the image horizontally
 * @param {boolean} horizontal a Boolean, if true the image will be flipped horizontally
 * @param {boolean} vertical a Boolean, if true the image will be flipped vertically
 * @param {function(Error, Jimp)} cb (optional) a callback for when complete
 * @returns {Jimp} this for chaining of methods
 */
function flipFn(horizontal, vertical, cb) {
  if (typeof horizontal !== 'boolean' || typeof vertical !== 'boolean') return _utils$6.throwError.call(this, 'horizontal and vertical must be Booleans', cb);

  if (horizontal && vertical) {
    // shortcut
    return this.rotate(180, true, cb);
  }

  var bitmap = Buffer.alloc(this.bitmap.data.length);
  this.scanQuiet(0, 0, this.bitmap.width, this.bitmap.height, function (x, y, idx) {
    var _x = horizontal ? this.bitmap.width - 1 - x : x;

    var _y = vertical ? this.bitmap.height - 1 - y : y;

    var _idx = this.bitmap.width * _y + _x << 2;

    var data = this.bitmap.data.readUInt32BE(idx);
    bitmap.writeUInt32BE(data, _idx);
  });
  this.bitmap.data = Buffer.from(bitmap);

  if ((0, _utils$6.isNodePattern)(cb)) {
    cb.call(this, null, this);
  }

  return this;
}

var _default$7 = function _default() {
  return {
    flip: flipFn,
    mirror: flipFn
  };
};

exports.default = _default$7;
module.exports = exports.default;

var dist$k = /*#__PURE__*/Object.freeze({

});

var dist$l = createCommonjsModule(function (module, exports) {



Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;



/**
 * Masks a source image on to this image using average pixel colour. A completely black pixel on the mask will turn a pixel in the image completely transparent.
 * @param {Jimp} src the source Jimp instance
 * @param {number} x the horizontal position to blit the image
 * @param {number} y the vertical position to blit the image
 * @param {function(Error, Jimp)} cb (optional) a callback for when complete
 * @returns {Jimp} this for chaining of methods
 */
var _default = function _default() {
  return {
    mask: function mask(src) {
      var x = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      var y = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
      var cb = arguments.length > 3 ? arguments[3] : undefined;

      if (!(src instanceof this.constructor)) {
        return dist$2.throwError.call(this, 'The source must be a Jimp image', cb);
      }

      if (typeof x !== 'number' || typeof y !== 'number') {
        return dist$2.throwError.call(this, 'x and y must be numbers', cb);
      } // round input


      x = Math.round(x);
      y = Math.round(y);
      var w = this.bitmap.width;
      var h = this.bitmap.height;
      var baseImage = this;
      src.scanQuiet(0, 0, src.bitmap.width, src.bitmap.height, function (sx, sy, idx) {
        var destX = x + sx;
        var destY = y + sy;

        if (destX >= 0 && destY >= 0 && destX < w && destY < h) {
          var dstIdx = baseImage.getPixelIndex(destX, destY);
          var data = this.bitmap.data;
          var avg = (data[idx + 0] + data[idx + 1] + data[idx + 2]) / 3;
          baseImage.bitmap.data[dstIdx + 3] *= avg / 255;
        }
      });

      if ((0, dist$2.isNodePattern)(cb)) {
        cb.call(this, null, this);
      }

      return this;
    }
  };
};

exports.default = _default;
module.exports = exports.default;

});

unwrapExports(dist$l);

var dist$m = createCommonjsModule(function (module, exports) {



Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;



var _default = function _default() {
  return {
    /**
     * Uniformly scales the image by a factor.
     * @param {number} f the factor to scale the image by
     * @param {string} mode (optional) a scaling method (e.g. Jimp.RESIZE_BEZIER)
     * @param {function(Error, Jimp)} cb (optional) a callback for when complete
     * @returns {Jimp} this for chaining of methods
     */
    scale: function scale(f, mode, cb) {
      if (typeof f !== 'number') {
        return dist$2.throwError.call(this, 'f must be a number', cb);
      }

      if (f < 0) {
        return dist$2.throwError.call(this, 'f must be a positive number', cb);
      }

      if (typeof mode === 'function' && typeof cb === 'undefined') {
        cb = mode;
        mode = null;
      }

      var w = this.bitmap.width * f;
      var h = this.bitmap.height * f;
      this.resize(w, h, mode);

      if ((0, dist$2.isNodePattern)(cb)) {
        cb.call(this, null, this);
      }

      return this;
    },

    /**
     * Scale the image to the largest size that fits inside the rectangle that has the given width and height.
     * @param {number} w the width to resize the image to
     * @param {number} h the height to resize the image to
     * @param {string} mode (optional) a scaling method (e.g. Jimp.RESIZE_BEZIER)
     * @param {function(Error, Jimp)} cb (optional) a callback for when complete
     * @returns {Jimp} this for chaining of methods
     */
    scaleToFit: function scaleToFit(w, h, mode, cb) {
      if (typeof w !== 'number' || typeof h !== 'number') {
        return dist$2.throwError.call(this, 'w and h must be numbers', cb);
      }

      if (typeof mode === 'function' && typeof cb === 'undefined') {
        cb = mode;
        mode = null;
      }

      var f = w / h > this.bitmap.width / this.bitmap.height ? h / this.bitmap.height : w / this.bitmap.width;
      this.scale(f, mode);

      if ((0, dist$2.isNodePattern)(cb)) {
        cb.call(this, null, this);
      }

      return this;
    }
  };
};

exports.default = _default;
module.exports = exports.default;

});

unwrapExports(dist$m);

var dist$n = createCommonjsModule(function (module, exports) {



Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;







function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

/**
 * Displaces the image based on the provided displacement map
 * @param {object} map the source Jimp instance
 * @param {number} offset the maximum displacement value
 * @param {function(Error, Jimp)} cb (optional) a callback for when complete
 * @returns {Jimp} this for chaining of methods
 */
var _default = function _default() {
  return {
    displace: function displace(map, offset, cb) {
      if (_typeof(map) !== 'object' || map.constructor !== this.constructor) {
        return dist$2.throwError.call(this, 'The source must be a Jimp image', cb);
      }

      if (typeof offset !== 'number') {
        return dist$2.throwError.call(this, 'factor must be a number', cb);
      }

      var source = this.cloneQuiet();
      this.scanQuiet(0, 0, this.bitmap.width, this.bitmap.height, function (x, y, idx) {
        var displacement = map.bitmap.data[idx] / 256 * offset;
        displacement = Math.round(displacement);
        var ids = this.getPixelIndex(x + displacement, y);
        this.bitmap.data[ids] = source.bitmap.data[idx];
        this.bitmap.data[ids + 1] = source.bitmap.data[idx + 1];
        this.bitmap.data[ids + 2] = source.bitmap.data[idx + 2];
      });

      if ((0, dist$2.isNodePattern)(cb)) {
        cb.call(this, null, this);
      }

      return this;
    }
  };
};

exports.default = _default;
module.exports = exports.default;

});

unwrapExports(dist$n);

var dist$o = createCommonjsModule(function (module, exports) {



Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;



/**
 * Scale the image to the given width and height keeping the aspect ratio. Some parts of the image may be letter boxed.
 * @param {number} w the width to resize the image to
 * @param {number} h the height to resize the image to
 * @param {number} alignBits (optional) A bitmask for horizontal and vertical alignment
 * @param {string} mode (optional) a scaling method (e.g. Jimp.RESIZE_BEZIER)
 * @param {function(Error, Jimp)} cb (optional) a callback for when complete
 * @returns {Jimp} this for chaining of methods
 */
var _default = function _default() {
  return {
    contain: function contain(w, h, alignBits, mode, cb) {
      if (typeof w !== 'number' || typeof h !== 'number') {
        return dist$2.throwError.call(this, 'w and h must be numbers', cb);
      } // permit any sort of optional parameters combination


      if (typeof alignBits === 'string') {
        if (typeof mode === 'function' && typeof cb === 'undefined') cb = mode;
        mode = alignBits;
        alignBits = null;
      }

      if (typeof alignBits === 'function') {
        if (typeof cb === 'undefined') cb = alignBits;
        mode = null;
        alignBits = null;
      }

      if (typeof mode === 'function' && typeof cb === 'undefined') {
        cb = mode;
        mode = null;
      }

      alignBits = alignBits || this.constructor.HORIZONTAL_ALIGN_CENTER | this.constructor.VERTICAL_ALIGN_MIDDLE;
      var hbits = alignBits & (1 << 3) - 1;
      var vbits = alignBits >> 3; // check if more flags than one is in the bit sets

      if (!(hbits !== 0 && !(hbits & hbits - 1) || vbits !== 0 && !(vbits & vbits - 1))) {
        return dist$2.throwError.call(this, 'only use one flag per alignment direction', cb);
      }

      var alignH = hbits >> 1; // 0, 1, 2

      var alignV = vbits >> 1; // 0, 1, 2

      var f = w / h > this.bitmap.width / this.bitmap.height ? h / this.bitmap.height : w / this.bitmap.width;
      var c = this.cloneQuiet().scale(f, mode);
      this.resize(w, h, mode);
      this.scanQuiet(0, 0, this.bitmap.width, this.bitmap.height, function (x, y, idx) {
        this.bitmap.data.writeUInt32BE(this._background, idx);
      });
      this.blit(c, (this.bitmap.width - c.bitmap.width) / 2 * alignH, (this.bitmap.height - c.bitmap.height) / 2 * alignV);

      if ((0, dist$2.isNodePattern)(cb)) {
        cb.call(this, null, this);
      }

      return this;
    }
  };
};

exports.default = _default;
module.exports = exports.default;

});

unwrapExports(dist$o);

var dist$p = createCommonjsModule(function (module, exports) {



Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;



/**
 * Scale the image so the given width and height keeping the aspect ratio. Some parts of the image may be clipped.
 * @param {number} w the width to resize the image to
 * @param {number} h the height to resize the image to
 * @param {number} alignBits (optional) A bitmask for horizontal and vertical alignment
 * @param {string} mode (optional) a scaling method (e.g. Jimp.RESIZE_BEZIER)
 * @param {function(Error, Jimp)} cb (optional) a callback for when complete
 * @returns {Jimp} this for chaining of methods
 */
var _default = function _default() {
  return {
    cover: function cover(w, h, alignBits, mode, cb) {
      if (typeof w !== 'number' || typeof h !== 'number') {
        return dist$2.throwError.call(this, 'w and h must be numbers', cb);
      }

      if (alignBits && typeof alignBits === 'function' && typeof cb === 'undefined') {
        cb = alignBits;
        alignBits = null;
        mode = null;
      } else if (typeof mode === 'function' && typeof cb === 'undefined') {
        cb = mode;
        mode = null;
      }

      alignBits = alignBits || this.constructor.HORIZONTAL_ALIGN_CENTER | this.constructor.VERTICAL_ALIGN_MIDDLE;
      var hbits = alignBits & (1 << 3) - 1;
      var vbits = alignBits >> 3; // check if more flags than one is in the bit sets

      if (!(hbits !== 0 && !(hbits & hbits - 1) || vbits !== 0 && !(vbits & vbits - 1))) return dist$2.throwError.call(this, 'only use one flag per alignment direction', cb);
      var alignH = hbits >> 1; // 0, 1, 2

      var alignV = vbits >> 1; // 0, 1, 2

      var f = w / h > this.bitmap.width / this.bitmap.height ? w / this.bitmap.width : h / this.bitmap.height;
      this.scale(f, mode);
      this.crop((this.bitmap.width - w) / 2 * alignH, (this.bitmap.height - h) / 2 * alignV, w, h);

      if ((0, dist$2.isNodePattern)(cb)) {
        cb.call(this, null, this);
      }

      return this;
    }
  };
};

exports.default = _default;
module.exports = exports.default;

});

unwrapExports(dist$p);

var dist$q = createCommonjsModule(function (module, exports) {



Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;





















var _pluginDither = _interopRequireDefault(dist$9);

var _pluginResize = _interopRequireDefault(dist$a);

var _pluginBlit = _interopRequireDefault(dist$b);

var _pluginRotate = _interopRequireDefault(dist$c);

var _pluginColor = _interopRequireDefault(dist$d);

var _pluginPrint = _interopRequireDefault(dist$e);

var _pluginBlur = _interopRequireDefault(dist$f);

var _pluginCrop = _interopRequireDefault(dist$g);

var _pluginNormalize = _interopRequireDefault(dist$h);

var _pluginInvert = _interopRequireDefault(dist$i);

var _pluginGaussian = _interopRequireDefault(dist$j);

var _pluginFlip = _interopRequireDefault(dist$k);

var _pluginMask = _interopRequireDefault(dist$l);

var _pluginScale = _interopRequireDefault(dist$m);

var _pluginDisplace = _interopRequireDefault(dist$n);

var _pluginContain = _interopRequireDefault(dist$o);

var _pluginCover = _interopRequireDefault(dist$p);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

var plugins = [_pluginDither.default, _pluginResize.default, _pluginBlit.default, _pluginRotate.default, _pluginColor.default, _pluginPrint.default, _pluginBlur.default, _pluginCrop.default, _pluginNormalize.default, _pluginInvert.default, _pluginGaussian.default, _pluginFlip.default, _pluginMask.default, _pluginScale.default, _pluginDisplace.default, _pluginContain.default, _pluginCover.default];

var _default = function _default(jimpEvChange) {
  var initializedPlugins = plugins.map(function (pluginModule) {
    var plugin = pluginModule(jimpEvChange) || {};

    if (!plugin.class && !plugin.constants) {
      // Default to class function
      plugin = {
        class: plugin
      };
    }

    return plugin;
  });
  return timm$1.mergeDeep.apply(void 0, _toConsumableArray(initializedPlugins));
};

exports.default = _default;
module.exports = exports.default;

});

var plugins = unwrapExports(dist$q);

var Jimp$1 = configure({
  types: [types],
  plugins: [plugins]
});

// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length - 1; i >= 0; i--) {
    var last = parts[i];
    if (last === '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// Split a filename into [root, dir, basename, ext], unix version
// 'root' is just a slash, or nothing.
var splitPathRe =
    /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
var splitPath = function(filename) {
  return splitPathRe.exec(filename).slice(1);
};

// path.resolve([from ...], to)
// posix version
function resolve() {
  var resolvedPath = '',
      resolvedAbsolute = false;

  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    var path = (i >= 0) ? arguments[i] : '/';

    // Skip empty and invalid entries
    if (typeof path !== 'string') {
      throw new TypeError('Arguments to path.resolve must be strings');
    } else if (!path) {
      continue;
    }

    resolvedPath = path + '/' + resolvedPath;
    resolvedAbsolute = path.charAt(0) === '/';
  }

  // At this point the path should be resolved to a full absolute path, but
  // handle relative paths to be safe (might happen when process.cwd() fails)

  // Normalize the path
  resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
}
// path.normalize(path)
// posix version
function normalize(path) {
  var isPathAbsolute = isAbsolute(path),
      trailingSlash = substr(path, -1) === '/';

  // Normalize the path
  path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isPathAbsolute).join('/');

  if (!path && !isPathAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }

  return (isPathAbsolute ? '/' : '') + path;
}
// posix version
function isAbsolute(path) {
  return path.charAt(0) === '/';
}

// posix version
function join() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return normalize(filter(paths, function(p, index) {
    if (typeof p !== 'string') {
      throw new TypeError('Arguments to path.join must be strings');
    }
    return p;
  }).join('/'));
}


// path.relative(from, to)
// posix version
function relative(from, to) {
  from = resolve(from).substr(1);
  to = resolve(to).substr(1);

  function trim(arr) {
    var start = 0;
    for (; start < arr.length; start++) {
      if (arr[start] !== '') break;
    }

    var end = arr.length - 1;
    for (; end >= 0; end--) {
      if (arr[end] !== '') break;
    }

    if (start > end) return [];
    return arr.slice(start, end - start + 1);
  }

  var fromParts = trim(from.split('/'));
  var toParts = trim(to.split('/'));

  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i;
      break;
    }
  }

  var outputParts = [];
  for (var i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push('..');
  }

  outputParts = outputParts.concat(toParts.slice(samePartsLength));

  return outputParts.join('/');
}

var sep = '/';
var delimiter = ':';

function dirname(path) {
  var result = splitPath(path),
      root = result[0],
      dir = result[1];

  if (!root && !dir) {
    // No dirname whatsoever
    return '.';
  }

  if (dir) {
    // It has a dirname, strip trailing slash
    dir = dir.substr(0, dir.length - 1);
  }

  return root + dir;
}

function basename(path, ext) {
  var f = splitPath(path)[2];
  // TODO: make this comparison case-insensitive on windows?
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
}


function extname(path) {
  return splitPath(path)[3];
}
var path = {
  extname: extname,
  basename: basename,
  dirname: dirname,
  sep: sep,
  delimiter: delimiter,
  relative: relative,
  join: join,
  isAbsolute: isAbsolute,
  normalize: normalize,
  resolve: resolve
};
function filter (xs, f) {
    if (xs.filter) return xs.filter(f);
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (f(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// String.prototype.substr - negative index don't work in IE8
var substr = 'ab'.substr(-1) === 'b' ?
    function (str, start, len) { return str.substr(start, len) } :
    function (str, start, len) {
        if (start < 0) start = str.length + start;
        return str.substr(start, len);
    }
;

/**
 * A 2d Vector class to perform constant operations. Use this class to make sure that objects stay consts, e.g.
 * public function getPos():Vec2Const { return _pos; } // pos is not allowed to change outside of bot.
 *
 * Many method has a postfix of XY - this allows you to operate on the components directly i.e.
 * instead of writing add(new Vec2(1, 2)) you can directly write addXY(1, 2);
 *
 * For performance reasons I am not using an interface for read only specification since internally it should be possible
 * to use direct access to x and y. Externally x and y is obtained via getters which are a bit slower than direct access of
 * a public constiable. I suggest you stick with this during development. If there is a bottleneck you can just remove the get
 * accessors and directly expose _x and _y (rename it to x and replace all _x and _y to this.x, this.y internally).
 *
 * The class in not commented properly yet - just subdivided into logical chunks.
 *
 * @author playchilla.com
 *
 * License: Use it as you wish and if you like it - link back!
 */
class Vec2Const {
    constructor(x = 0, y = 0) {
        this._x = x;
        this._y = y;
    }
    static lawOfCosAngle(a, b, c) {
        const v1 = (a * a + b * b - c * c) / (2 * a * b);
        const v2 = Math.acos(v1);
        return v2;
    }
    get x() { return this._x; }
    get y() { return this._y; }
    clone() { return new Vec2(this._x, this._y); }
    /**
     * Add, sub, mul and div
     */
    add(pos) { return new Vec2(this._x + pos._x, this._y + pos._y); }
    addXY(x, y) { return new Vec2(this._x + x, this._y + y); }
    sub(pos) { return new Vec2(this._x - pos._x, this._y - pos._y); }
    subXY(x, y) { return new Vec2(this._x - x, this._y - y); }
    mul(vec) { return new Vec2(this._x * vec._x, this._y * vec._y); }
    mulXY(x, y) { return new Vec2(this._x * x, this._y * y); }
    div(vec) { return new Vec2(this._x / vec._x, this._y / vec._y); }
    divXY(x, y) { return new Vec2(this._x / x, this._y / y); }
    /**
     * Scale
     */
    scale(s) { return new Vec2(this._x * s, this._y * s); }
    rescale(newLength) {
        const nf = newLength / Math.sqrt(this._x * this._x + this._y * this._y);
        return new Vec2(this._x * nf, this._y * nf);
    }
    /**
     * Normalize
     */
    normalize(mag = 1) {
        const nf = mag / Math.sqrt(this._x * this._x + this._y * this._y);
        return new Vec2(this._x * nf, this._y * nf);
    }
    /**
     * Distance
     */
    get length() { return Math.sqrt(this._x * this._x + this._y * this._y); }
    get lengthSqr() { return this._x * this._x + this._y * this._y; }
    distance(vec) {
        const xd = this._x - vec._x;
        const yd = this._y - vec._y;
        return Math.sqrt(xd * xd + yd * yd);
    }
    distanceXY(x, y) {
        const xd = this._x - x;
        const yd = this._y - y;
        return Math.sqrt(xd * xd + yd * yd);
    }
    distanceSqr(vec) {
        const xd = this._x - vec._x;
        const yd = this._y - vec._y;
        return xd * xd + yd * yd;
    }
    distanceXYSqr(x, y) {
        const xd = this._x - x;
        const yd = this._y - y;
        return xd * xd + yd * yd;
    }
    /**
     * Queries.
     */
    equals(vec) { return this._x === vec._x && this._y === vec._y; }
    equalsXY(x, y) { return this._x === x && this._y === y; }
    isNormalized() { return Math.abs((this._x * this._x + this._y * this._y) - 1) < Vec2.EPSILONSQR; }
    isZero() { return this._x === 0 && this._y === 0; }
    isNear(vec2) { return this.distanceSqr(vec2) < Vec2.EPSILONSQR; }
    isNearXY(x, y) { return this.distanceXYSqr(x, y) < Vec2.EPSILONSQR; }
    isWithin(vec2, epsilon) { return this.distanceSqr(vec2) < epsilon * epsilon; }
    isWithinXY(x, y, epsilon) { return this.distanceXYSqr(x, y) < epsilon * epsilon; }
    isValid() { return !isNaN(this._x) && !isNaN(this._y) && isFinite(this._x) && isFinite(this._y); }
    getDegrees() { return this.getRads() * Vec2Const._RadsToDeg; }
    getRads() { return Math.atan2(this._y, this._x); }
    getRadsFullAngle() { return (this.getRads() + 2 * Math.PI) % (2 * Math.PI); }
    getMinRadsBetween(vec) { return Math.acos(this.normalize().dot(vec.normalize())); }
    getRadsBetween(vec) { return vec.getRads() - this.getRads(); }
    /**
     * Dot product
     */
    dot(vec) { return this._x * vec._x + this._y * vec._y; }
    dotXY(x, y) { return this._x * x + this._y * y; }
    /**
     * Cross determinant
     */
    crossDet(vec) { return this._x * vec._y - this._y * vec._x; }
    crossDetXY(x, y) { return this._x * y - this._y * x; }
    /**
     * Rotate
     */
    rotate(rads) {
        const s = Math.sin(rads);
        const c = Math.cos(rads);
        return new Vec2(this._x * c - this._y * s, this._x * s + this._y * c);
    }
    normalRight() { return new Vec2(-this._y, this._x); }
    normalLeft() { return new Vec2(this._y, -this._x); }
    negate() { return new Vec2(-this._x, -this._y); }
    /**
     * Spinor rotation
     */
    rotateSpinorXY(x, y) { return new Vec2(this._x * x - this._y * y, this._x * y + this._y * x); }
    rotateSpinor(vec) { return new Vec2(this._x * vec._x - this._y * vec._y, this._x * vec._y + this._y * vec._x); }
    spinorBetween(vec) {
        const d = this.lengthSqr;
        const r = (vec._x * this._x + vec._y * this._y) / d;
        const i = (vec._y * this._x - vec._x * this._y) / d;
        return new Vec2(r, i);
    }
    /**
     * Lerp / slerp
     * Note: Slerp is not well tested yet.
     */
    lerp(to, t) { return new Vec2(this._x + t * (to._x - this._x), this._y + t * (to._y - this._y)); }
    slerp(vec, t) {
        const cosTheta = this.dot(vec);
        const theta = Math.acos(cosTheta);
        const sinTheta = Math.sin(theta);
        if (sinTheta <= Vec2.EPSILON) {
            return vec.clone();
        }
        const w1 = Math.sin((1 - t) * theta) / sinTheta;
        const w2 = Math.sin(t * theta) / sinTheta;
        return this.scale(w1).add(vec.scale(w2));
    }
    /**
     * Reflect
     */
    reflect(normal) {
        const d = 2 * (this._x * normal._x + this._y * normal._y);
        return new Vec2(this._x - d * normal._x, this._y - d * normal._y);
    }
    /**
     * Mirror
     */
    mirror(normal) {
        return this.reflect(normal).scale(-1);
        // return this.rotate(2 * this.getRadsBetween(normal));
    }
    /**
     * String
     */
    toString() { return "[" + this._x + ", " + this._y + "]"; }
    getMin(p) { return new Vec2(Math.min(p._x, this._x), Math.min(p._y, this._y)); }
    getMax(p) { return new Vec2(Math.max(p._x, this._x), Math.max(p._y, this._y)); }
}
Vec2Const._RadsToDeg = 180 / Math.PI;

/**
 * A 2d Vector class to that is mutable.
 *
 * Due to the lack of AS3 operator overloading most methods exists in different names,
 * all methods that ends with Self actually modifies the object itself (including obvious ones copy, copyXY and zero).
 * For example v1 += v2; is written as v1.addSelf(v2);
 *
 * The class in not commented properly yet - just subdivided into logical chunks.
 *
 * @author playchilla.com
 *
 * License: Use it as you wish and if you like it - link back!
 */
class Vec2 extends Vec2Const {
    constructor(x = 0, y = 0) { super(x, y); }
    static createRandomDir() {
        const rads = Math.random() * Math.PI * 2;
        return new Vec2(Math.cos(rads), Math.sin(rads));
    }
    /**
     * Helpers
     */
    static swap(a, b) {
        const x = a._x;
        const y = a._y;
        a._x = b._x;
        a._y = b._y;
        b._x = x;
        b._y = y;
    }
    /**
     * Copy / assignment
     */
    set x(x) { this._x = x; }
    get x() { return this._x; }
    set y(y) { this._y = y; }
    get y() { return this._y; }
    copy(pos) {
        this._x = pos._x;
        this._y = pos._y;
        return this;
    }
    copyXY(x, y) {
        this._x = x;
        this._y = y;
        return this;
    }
    zero() {
        this._x = 0;
        this._y = 0;
        return this;
    }
    /**
     * Add
     */
    addSelf(pos) {
        this._x += pos._x;
        this._y += pos._y;
        return this;
    }
    addXYSelf(x, y) {
        this._x += x;
        this._y += y;
        return this;
    }
    /**
     * Sub
     */
    subSelf(pos) {
        this._x -= pos._x;
        this._y -= pos._y;
        return this;
    }
    subXYSelf(x, y) {
        this._x -= x;
        this._y -= y;
        return this;
    }
    /**
     * Mul
     */
    mulSelf(vec) {
        this._x *= vec._x;
        this._y *= vec._y;
        return this;
    }
    mulXYSelf(x, y) {
        this._x *= x;
        this._y *= y;
        return this;
    }
    /**
     * Div
     */
    divSelf(vec) {
        this._x /= vec._x;
        this._y /= vec._y;
        return this;
    }
    divXYSelf(x, y) {
        this._x /= x;
        this._y /= y;
        return this;
    }
    /**
     * Scale
     */
    scaleSelf(s) {
        this._x *= s;
        this._y *= s;
        return this;
    }
    rescaleSelf(newLength) {
        const nf = newLength / Math.sqrt(this._x * this._x + this._y * this._y);
        this._x *= nf;
        this._y *= nf;
        return this;
    }
    /**
     * Normalize
     */
    normalizeSelf() {
        const nf = 1 / Math.sqrt(this._x * this._x + this._y * this._y);
        this._x *= nf;
        this._y *= nf;
        return this;
    }
    /**
     * Rotate
     */
    rotateSelf(rads) {
        const s = Math.sin(rads);
        const c = Math.cos(rads);
        const xr = this._x * c - this._y * s;
        this._y = this._x * s + this._y * c;
        this._x = xr;
        return this;
    }
    normalRightSelf() {
        const xr = this._x;
        this._x = -this._y;
        this._y = xr;
        return this;
    }
    normalLeftSelf() {
        const xr = this._x;
        this._x = this._y;
        this._y = -xr;
        return this;
    }
    negateSelf() {
        this._x = -this._x;
        this._y = -this._y;
        return this;
    }
    /**
     * Spinor
     */
    rotateSpinorSelf(vec) {
        const xr = this._x * vec._x - this._y * vec._y;
        this._y = this._x * vec._y + this._y * vec._x;
        this._x = xr;
        return this;
    }
    /**
     * lerp
     */
    lerpSelf(to, t) {
        this._x = this._x + t * (to._x - this._x);
        this._y = this._y + t * (to._y - this._y);
        return this;
    }
}
Vec2.ZERO = new Vec2Const();
Vec2.EPSILON = 0.0000001;
Vec2.EPSILONSQR = Vec2.EPSILON * Vec2.EPSILON;

class Sheet extends Rectangle {
    constructor(width = 0, height = 0, x = 0, y = 0, rot = false) {
        super();
        this.width = width;
        this.height = height;
        this.x = x;
        this.y = y;
        this.rot = rot;
        this.name = "";
        this.trimmed = false;
        this.sourceFrame = new Rectangle(0, 0, width, height);
        this.anchor = new Vec2(width / 2, height / 2);
        this.nineSliceFrame = new Rectangle(0, 0, width, height);
        this.data = new Jimp$1(width, height);
    }
    trimAlpha() {
        // TODO
        this.trimmed = true;
    }
    rotate() {
        this.rot = true;
    }
}

/**
 * Options class for composor and maxrects-packer
 *
 * @property {boolean} options.square use square size (default is true)
 * @property {boolean} options.pot use power of 2 sizing (default is true)
 * @property {boolean} options.square use square size (default is false)
 * @property {boolean} options.allowRotation allow rotation wihile packing (default is false)
 *
 * @export
 * @interface Option
 * @export
 * @class Options
 * @implements {IOption}
 */
class Options {
    /**
     * Creates an instance of Options.
     * @param {string} [name='sprite'] output filename of atlas/spreadsheet (default is 'sprite.png')
     * @param {number} [width=2048] ouput texture atlas width (defaut: 2048)
     * @param {number} [height=2048] ouput texture atlas height (defaut: 2048)
     * @param {number} [padding=0] padding between images (Default: 0)
     * @memberof Options
     */
    constructor(name = 'sprite', width = 2048, height = 2048, padding = 0) {
        this.name = name;
        this.width = width;
        this.height = height;
        this.padding = padding;
        this.smart = true;
        this.pot = true;
        this.square = false;
        this.allowRotation = false;
        this.trimAlpha = false; // TODO
        this.extrudeEdge = 0; // TODO
    }
}
class Atlasify {
    /**
     * Creates an instance of Atlasify.
     * @param {Options} options Atlasify Options class
     * @memberof Atlasify
     */
    constructor(options) {
        this.options = options;
        this.imageFilePaths = [];
        this.rects = [];
        this.packer = new MaxRectsPacker(options.width, options.height, options.padding, options);
    }
    /**
     * Load arrays of pathalike images url and do packing
     * @param {string[]} paths pathalike urls
     * @memberof Atlasify
     */
    load(paths) {
        this.imageFilePaths = paths;
        const loader = paths.map((img) => __awaiter(this, void 0, void 0, function* () {
            return Jimp$1.read(img)
                .then(image => {
                const sheet = new Sheet(image.bitmap.width, image.bitmap.height);
                sheet.data = image;
                sheet.name = path.basename(img);
                this.rects.push(sheet);
            })
                .catch(err => {
                console.error("File read error : " + err);
            });
        }));
        Promise.all(loader)
            .then(() => {
            const ext = path.extname(this.options.name);
            const basename = path.basename(this.options.name, ext);
            const fillColor = (ext === ".png" || ext === ".PNG") ? 0x00000000 : 0x000000ff;
            this.packer.addArray(this.rects);
            this.packer.bins.forEach((bin, index) => {
                const binName = this.packer.bins.length > 1 ? `${basename}.${index}${ext}` : `${basename}${ext}`;
                const image = new Jimp$1(bin.width, bin.height, fillColor);
                bin.rects.forEach(rect => {
                    const buffer = rect.data;
                    if (rect.rot)
                        buffer.rotate(90);
                    image.composite(buffer, rect.x, rect.y);
                });
                image.write(binName, () => {
                    console.log('Wrote atlas image : ' + binName);
                });
            });
            // fs.writeFileSync(`${basename}.json`, JSON.stringify(this.packer));
        })
            .catch(err => {
            console.error("File load error : " + err);
        });
    }
}

export { Atlasify, Options };
//# sourceMappingURL=atlasify-core.mjs.map
