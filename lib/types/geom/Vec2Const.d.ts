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
export declare class Vec2Const {
    static lawOfCosAngle(a: number, b: number, c: number): number;
    private static _RadsToDeg;
    _x: number;
    _y: number;
    readonly x: number;
    readonly y: number;
    constructor(x?: number, y?: number);
    clone(): Vec2;
    /**
     * Add, sub, mul and div
     */
    add(pos: Vec2Const): Vec2;
    addXY(x: number, y: number): Vec2;
    sub(pos: Vec2Const): Vec2;
    subXY(x: number, y: number): Vec2;
    mul(vec: Vec2Const): Vec2;
    mulXY(x: number, y: number): Vec2;
    div(vec: Vec2Const): Vec2;
    divXY(x: number, y: number): Vec2;
    /**
     * Scale
     */
    scale(s: number): Vec2;
    rescale(newLength: number): Vec2;
    /**
     * Normalize
     */
    normalize(mag?: number): Vec2;
    /**
     * Distance
     */
    readonly length: number;
    readonly lengthSqr: number;
    distance(vec: Vec2Const): number;
    distanceXY(x: number, y: number): number;
    distanceSqr(vec: Vec2Const): number;
    distanceXYSqr(x: number, y: number): number;
    /**
     * Queries.
     */
    equals(vec: Vec2Const): boolean;
    equalsXY(x: number, y: number): boolean;
    isNormalized(): boolean;
    isZero(): boolean;
    isNear(vec2: Vec2Const): boolean;
    isNearXY(x: number, y: number): boolean;
    isWithin(vec2: Vec2Const, epsilon: number): boolean;
    isWithinXY(x: number, y: number, epsilon: number): boolean;
    isValid(): boolean;
    getDegrees(): number;
    getRads(): number;
    getRadsFullAngle(): number;
    getMinRadsBetween(vec: Vec2Const): number;
    getRadsBetween(vec: Vec2Const): number;
    /**
     * Dot product
     */
    dot(vec: Vec2Const): number;
    dotXY(x: number, y: number): number;
    /**
     * Cross determinant
     */
    crossDet(vec: Vec2Const): number;
    crossDetXY(x: number, y: number): number;
    /**
     * Rotate
     */
    rotate(rads: number): Vec2;
    normalRight(): Vec2;
    normalLeft(): Vec2;
    negate(): Vec2;
    /**
     * Spinor rotation
     */
    rotateSpinorXY(x: number, y: number): Vec2;
    rotateSpinor(vec: Vec2Const): Vec2;
    spinorBetween(vec: Vec2Const): Vec2;
    /**
     * Lerp / slerp
     * Note: Slerp is not well tested yet.
     */
    lerp(to: Vec2Const, t: number): Vec2;
    slerp(vec: Vec2Const, t: number): Vec2;
    /**
     * Reflect
     */
    reflect(normal: Vec2Const): Vec2;
    /**
     * Mirror
     */
    mirror(normal: Vec2Const): Vec2;
    /**
     * String
     */
    toString(): string;
    getMin(p: Vec2Const): Vec2;
    getMax(p: Vec2Const): Vec2;
}
