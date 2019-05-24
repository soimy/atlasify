import Jimp from 'jimp';

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
        this.data = new Jimp(width, height);
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
            return Jimp.read(img)
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
                const image = new Jimp(bin.width, bin.height, fillColor);
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
