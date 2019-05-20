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
import { Vec2 } from "./Vec2";

export class Vec2Const {
    public static lawOfCosAngle(a: number, b: number, c: number): number {
        const v1: number = (a * a + b * b - c * c) / (2 * a * b);
        const v2: number = Math.acos(v1);
        return v2;
    }
    private static _RadsToDeg: number = 180 / Math.PI;

    public _x: number;
    public _y: number;
    public get x(): number { return this._x; }
    public get y(): number { return this._y; }

    constructor(x: number = 0, y: number = 0) {
        this._x = x;
        this._y = y;
    }

    public clone(): Vec2 { return new Vec2(this._x, this._y); }

    /**
     * Add, sub, mul and div
     */
    public add(pos: Vec2Const): Vec2 { return new Vec2(this._x + pos._x, this._y + pos._y); }
    public addXY(x: number, y: number): Vec2 { return new Vec2(this._x + x, this._y + y); }

    public sub(pos: Vec2Const): Vec2 { return new Vec2(this._x - pos._x, this._y - pos._y); }
    public subXY(x: number, y: number): Vec2 { return new Vec2(this._x - x, this._y - y); }

    public mul(vec: Vec2Const): Vec2 { return new Vec2(this._x * vec._x, this._y * vec._y); }
    public mulXY(x: number, y: number): Vec2 { return new Vec2(this._x * x, this._y * y); }

    public div(vec: Vec2Const): Vec2 { return new Vec2(this._x / vec._x, this._y / vec._y); }
    public divXY(x: number, y: number): Vec2 { return new Vec2(this._x / x, this._y / y); }

    /**
     * Scale
     */
    public scale(s: number): Vec2 { return new Vec2(this._x * s, this._y * s); }

    public rescale(newLength: number): Vec2 {
        const nf: number = newLength / Math.sqrt(this._x * this._x + this._y * this._y);
        return new Vec2(this._x * nf, this._y * nf);
    }

    /**
     * Normalize
     */
    public normalize(mag: number = 1): Vec2 {
        const nf: number = mag / Math.sqrt(this._x * this._x + this._y * this._y);
        return new Vec2(this._x * nf, this._y * nf);
    }

    /**
     * Distance
     */
    public get length(): number { return Math.sqrt(this._x * this._x + this._y * this._y); }
    public get lengthSqr(): number { return this._x * this._x + this._y * this._y; }
    public distance(vec: Vec2Const): number {
        const xd: number = this._x - vec._x;
        const yd: number = this._y - vec._y;
        return Math.sqrt(xd * xd + yd * yd);
    }
    public distanceXY(x: number, y: number): number {
        const xd: number = this._x - x;
        const yd: number = this._y - y;
        return Math.sqrt(xd * xd + yd * yd);
    }
    public distanceSqr(vec: Vec2Const): number {
        const xd: number = this._x - vec._x;
        const yd: number = this._y - vec._y;
        return xd * xd + yd * yd;
    }
    public distanceXYSqr(x: number, y: number): number {
        const xd: number = this._x - x;
        const yd: number = this._y - y;
        return xd * xd + yd * yd;
    }

    /**
     * Queries.
     */
    public equals(vec: Vec2Const): boolean { return this._x === vec._x && this._y === vec._y; }
    public equalsXY(x: number, y: number): boolean { return this._x === x && this._y === y; }
    public isNormalized(): boolean { return Math.abs((this._x * this._x + this._y * this._y) - 1) < Vec2.EPSILONSQR; }
    public isZero(): boolean { return this._x === 0 && this._y === 0; }
    public isNear(vec2: Vec2Const): boolean { return this.distanceSqr(vec2) < Vec2.EPSILONSQR; }
    public isNearXY(x: number, y: number): boolean { return this.distanceXYSqr(x, y) < Vec2.EPSILONSQR; }
    public isWithin(vec2: Vec2Const, epsilon: number): boolean { return this.distanceSqr(vec2) < epsilon * epsilon; }
    public isWithinXY(x: number, y: number, epsilon: number): boolean { return this.distanceXYSqr(x, y) < epsilon * epsilon; }
    public isValid(): boolean { return !isNaN(this._x) && !isNaN(this._y) && isFinite(this._x) && isFinite(this._y); }
    public getDegrees(): number { return this.getRads() * Vec2Const._RadsToDeg; }
    public getRads(): number { return Math.atan2(this._y, this._x); }
    public getRadsFullAngle(): number { return (this.getRads() + 2 * Math.PI) % (2 * Math.PI); }
    public getMinRadsBetween(vec: Vec2Const): number { return Math.acos(this.normalize().dot(vec.normalize())); }
    public getRadsBetween(vec: Vec2Const): number { return vec.getRads() - this.getRads(); }

    /**
     * Dot product
     */
    public dot(vec: Vec2Const): number { return this._x * vec._x + this._y * vec._y; }
    public dotXY(x: number, y: number): number { return this._x * x + this._y * y; }

    /**
     * Cross determinant
     */
    public crossDet(vec: Vec2Const): number { return this._x * vec._y - this._y * vec._x; }
    public crossDetXY(x: number, y: number): number { return this._x * y - this._y * x; }

    /**
     * Rotate
     */
    public rotate(rads: number): Vec2 {
        const s: number = Math.sin(rads);
        const c: number = Math.cos(rads);
        return new Vec2(this._x * c - this._y * s, this._x * s + this._y * c);
    }
    public normalRight(): Vec2 { return new Vec2(-this._y, this._x); }
    public normalLeft(): Vec2 { return new Vec2(this._y, -this._x); }
    public negate(): Vec2 { return new Vec2( -this._x, -this._y); }

    /**
     * Spinor rotation
     */
    public rotateSpinorXY(x: number, y: number): Vec2 { return new Vec2(this._x * x - this._y * y, this._x * y + this._y * x); }
    public rotateSpinor(vec: Vec2Const): Vec2 { return new Vec2(this._x * vec._x - this._y * vec._y, this._x * vec._y + this._y * vec._x); }
    public spinorBetween(vec: Vec2Const): Vec2 {
        const d: number = this.lengthSqr;
        const r: number = (vec._x * this._x + vec._y * this._y) / d;
        const i: number = (vec._y * this._x - vec._x * this._y) / d;
        return new Vec2(r, i);
    }

    /**
     * Lerp / slerp
     * Note: Slerp is not well tested yet.
     */
    public lerp(to: Vec2Const, t: number): Vec2 { return new Vec2(this._x + t * (to._x - this._x), this._y + t * (to._y - this._y)); }

    public slerp(vec: Vec2Const, t: number): Vec2 {
        const cosTheta: number = this.dot(vec);
        const theta: number = Math.acos(cosTheta);
        const sinTheta: number = Math.sin(theta);
        if (sinTheta <= Vec2.EPSILON) {
            return vec.clone();
        }
        const w1: number = Math.sin((1 - t) * theta) / sinTheta;
        const w2: number = Math.sin(t * theta) / sinTheta;
        return this.scale(w1).add(vec.scale(w2));
    }

    /**
     * Reflect
     */
    public reflect(normal: Vec2Const): Vec2 {
        const d: number = 2 * (this._x * normal._x + this._y * normal._y);
        return new Vec2(this._x - d * normal._x, this._y - d * normal._y);
    }

    /**
     * Mirror
     */
    public mirror(normal: Vec2Const): Vec2 {
        return this.reflect(normal).scale(-1);
        // return this.rotate(2 * this.getRadsBetween(normal));
    }

    /**
     * String
     */
    public toString(): string { return "[" + this._x + ", " + this._y + "]"; }

    public getMin(p: Vec2Const): Vec2 { return new Vec2(Math.min(p._x, this._x), Math.min(p._y, this._y)); }
    public getMax(p: Vec2Const): Vec2 { return new Vec2(Math.max(p._x, this._x), Math.max(p._y, this._y)); }
}