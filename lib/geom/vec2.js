"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vec2const_1 = require("./vec2const");
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
class Vec2 extends vec2const_1.Vec2Const {
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
Vec2.ZERO = new vec2const_1.Vec2Const();
Vec2.EPSILON = 0.0000001;
Vec2.EPSILONSQR = Vec2.EPSILON * Vec2.EPSILON;
exports.Vec2 = Vec2;
//# sourceMappingURL=vec2.js.map