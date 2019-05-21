import { Vec2Const } from "./Vec2Const";
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
export declare class Vec2 extends Vec2Const {
    static ZERO: Vec2Const;
    static EPSILON: number;
    static EPSILONSQR: number;
    static createRandomDir(): Vec2;
    /**
     * Helpers
     */
    static swap(a: Vec2, b: Vec2): void;
    constructor(x?: number, y?: number);
    /**
     * Copy / assignment
     */
    x: number;
    y: number;
    copy(pos: Vec2Const): Vec2;
    copyXY(x: number, y: number): Vec2;
    zero(): Vec2;
    /**
     * Add
     */
    addSelf(pos: Vec2Const): Vec2;
    addXYSelf(x: number, y: number): Vec2;
    /**
     * Sub
     */
    subSelf(pos: Vec2Const): Vec2;
    subXYSelf(x: number, y: number): Vec2;
    /**
     * Mul
     */
    mulSelf(vec: Vec2Const): Vec2;
    mulXYSelf(x: number, y: number): Vec2;
    /**
     * Div
     */
    divSelf(vec: Vec2Const): Vec2;
    divXYSelf(x: number, y: number): Vec2;
    /**
     * Scale
     */
    scaleSelf(s: number): Vec2;
    rescaleSelf(newLength: number): Vec2;
    /**
     * Normalize
     */
    normalizeSelf(): Vec2;
    /**
     * Rotate
     */
    rotateSelf(rads: number): Vec2;
    normalRightSelf(): Vec2;
    normalLeftSelf(): Vec2;
    negateSelf(): Vec2;
    /**
     * Spinor
     */
    rotateSpinorSelf(vec: Vec2Const): Vec2;
    /**
     * lerp
     */
    lerpSelf(to: Vec2Const, t: number): Vec2;
}
