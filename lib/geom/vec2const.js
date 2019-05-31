"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
const vec2_1 = require("./vec2");
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
    clone() { return new vec2_1.Vec2(this._x, this._y); }
    /**
     * Add, sub, mul and div
     */
    add(pos) { return new vec2_1.Vec2(this._x + pos._x, this._y + pos._y); }
    addXY(x, y) { return new vec2_1.Vec2(this._x + x, this._y + y); }
    sub(pos) { return new vec2_1.Vec2(this._x - pos._x, this._y - pos._y); }
    subXY(x, y) { return new vec2_1.Vec2(this._x - x, this._y - y); }
    mul(vec) { return new vec2_1.Vec2(this._x * vec._x, this._y * vec._y); }
    mulXY(x, y) { return new vec2_1.Vec2(this._x * x, this._y * y); }
    div(vec) { return new vec2_1.Vec2(this._x / vec._x, this._y / vec._y); }
    divXY(x, y) { return new vec2_1.Vec2(this._x / x, this._y / y); }
    /**
     * Scale
     */
    scale(s) { return new vec2_1.Vec2(this._x * s, this._y * s); }
    rescale(newLength) {
        const nf = newLength / Math.sqrt(this._x * this._x + this._y * this._y);
        return new vec2_1.Vec2(this._x * nf, this._y * nf);
    }
    /**
     * Normalize
     */
    normalize(mag = 1) {
        const nf = mag / Math.sqrt(this._x * this._x + this._y * this._y);
        return new vec2_1.Vec2(this._x * nf, this._y * nf);
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
    isNormalized() { return Math.abs((this._x * this._x + this._y * this._y) - 1) < vec2_1.Vec2.EPSILONSQR; }
    isZero() { return this._x === 0 && this._y === 0; }
    isNear(vec2) { return this.distanceSqr(vec2) < vec2_1.Vec2.EPSILONSQR; }
    isNearXY(x, y) { return this.distanceXYSqr(x, y) < vec2_1.Vec2.EPSILONSQR; }
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
        return new vec2_1.Vec2(this._x * c - this._y * s, this._x * s + this._y * c);
    }
    normalRight() { return new vec2_1.Vec2(-this._y, this._x); }
    normalLeft() { return new vec2_1.Vec2(this._y, -this._x); }
    negate() { return new vec2_1.Vec2(-this._x, -this._y); }
    /**
     * Spinor rotation
     */
    rotateSpinorXY(x, y) { return new vec2_1.Vec2(this._x * x - this._y * y, this._x * y + this._y * x); }
    rotateSpinor(vec) { return new vec2_1.Vec2(this._x * vec._x - this._y * vec._y, this._x * vec._y + this._y * vec._x); }
    spinorBetween(vec) {
        const d = this.lengthSqr;
        const r = (vec._x * this._x + vec._y * this._y) / d;
        const i = (vec._y * this._x - vec._x * this._y) / d;
        return new vec2_1.Vec2(r, i);
    }
    /**
     * Lerp / slerp
     * Note: Slerp is not well tested yet.
     */
    lerp(to, t) { return new vec2_1.Vec2(this._x + t * (to._x - this._x), this._y + t * (to._y - this._y)); }
    slerp(vec, t) {
        const cosTheta = this.dot(vec);
        const theta = Math.acos(cosTheta);
        const sinTheta = Math.sin(theta);
        if (sinTheta <= vec2_1.Vec2.EPSILON) {
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
        return new vec2_1.Vec2(this._x - d * normal._x, this._y - d * normal._y);
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
    getMin(p) { return new vec2_1.Vec2(Math.min(p._x, this._x), Math.min(p._y, this._y)); }
    getMax(p) { return new vec2_1.Vec2(Math.max(p._x, this._x), Math.max(p._y, this._y)); }
}
Vec2Const._RadsToDeg = 180 / Math.PI;
exports.Vec2Const = Vec2Const;
//# sourceMappingURL=vec2const.js.map