import { Vec2Const } from "./vec2const";

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
export class Vec2 extends Vec2Const {
    public static ZERO: Vec2Const = new Vec2Const();
    public static EPSILON: number = 0.0000001;
    public static EPSILONSQR: number = Vec2.EPSILON * Vec2.EPSILON;

    public static createRandomDir (): Vec2 {
        const rads: number = Math.random() * Math.PI * 2;
        return new Vec2(Math.cos(rads), Math.sin(rads));
    }

    /**
     * Helpers
     */
    public static swap (a: Vec2, b: Vec2): void {
        const x: number = a._x;
        const y: number = a._y;
        a._x = b._x;
        a._y = b._y;
        b._x = x;
        b._y = y;
    }

    constructor (x: number = 0, y: number = 0) { super(x, y); }

    /**
     * Copy / assignment
     */
    public set x (x: number) { this._x = x; }
    public get x (): number { return this._x; }
    public set y (y: number) { this._y = y; }
    public get y (): number { return this._y; }

    public copy (pos: Vec2Const): Vec2 {
        this._x = pos._x;
        this._y = pos._y;
        return this;
    }
    public copyXY (x: number, y: number): Vec2 {
        this._x = x;
        this._y = y;
        return this;
    }
    public zero (): Vec2 {
        this._x = 0;
        this._y = 0;
        return this;
    }

    /**
     * Add
     */
    public addSelf (pos: Vec2Const): Vec2 {
        this._x += pos._x;
        this._y += pos._y;
        return this;
    }
    public addXYSelf (x: number, y: number): Vec2 {
        this._x += x;
        this._y += y;
        return this;
    }

    /**
     * Sub
     */
    public subSelf (pos: Vec2Const): Vec2 {
        this._x -= pos._x;
        this._y -= pos._y;
        return this;
    }
    public subXYSelf (x: number, y: number): Vec2 {
        this._x -= x;
        this._y -= y;
        return this;
    }

    /**
     * Mul
     */
    public mulSelf (vec: Vec2Const): Vec2 {
        this._x *= vec._x;
        this._y *= vec._y;
        return this;
    }
    public mulXYSelf (x: number, y: number): Vec2 {
        this._x *= x;
        this._y *= y;
        return this;
    }

    /**
     * Div
     */
    public divSelf (vec: Vec2Const): Vec2 {
        this._x /= vec._x;
        this._y /= vec._y;
        return this;
    }
    public divXYSelf (x: number, y: number): Vec2 {
        this._x /= x;
        this._y /= y;
        return this;
    }

    /**
     * Scale
     */
    public scaleSelf (s: number): Vec2 {
        this._x *= s;
        this._y *= s;
        return this;
    }

    public rescaleSelf (newLength: number): Vec2 {
        const nf: number = newLength / Math.sqrt(this._x * this._x + this._y * this._y);
        this._x *= nf;
        this._y *= nf;
        return this;
    }

    /**
     * Normalize
     */
    public normalizeSelf (): Vec2 {
        const nf: number = 1 / Math.sqrt(this._x * this._x + this._y * this._y);
        this._x *= nf;
        this._y *= nf;
        return this;
    }

    /**
     * Rotate
     */
    public rotateSelf (rads: number): Vec2 {
        const s: number = Math.sin(rads);
        const c: number = Math.cos(rads);
        const xr: number = this._x * c - this._y * s;
        this._y = this._x * s + this._y * c;
        this._x = xr;
        return this;
    }
    public normalRightSelf (): Vec2 {
        const xr: number = this._x;
        this._x = -this._y;
        this._y = xr;
        return this;
    }
    public normalLeftSelf (): Vec2 {
        const xr: number = this._x;
        this._x = this._y;
        this._y = -xr;
        return this;
    }
    public negateSelf (): Vec2 {
        this._x = -this._x;
        this._y = -this._y;
        return this;
    }

    /**
     * Spinor
     */
    public rotateSpinorSelf (vec: Vec2Const): Vec2 {
        const xr: number = this._x * vec._x - this._y * vec._y;
        this._y = this._x * vec._y + this._y * vec._x;
        this._x = xr;
        return this;
    }

    /**
     * lerp
     */
    public lerpSelf (to: Vec2Const, t: number): Vec2 {
        this._x = this._x + t * (to._x - this._x);
        this._y = this._y + t * (to._y - this._y);
        return this;
    }
}
