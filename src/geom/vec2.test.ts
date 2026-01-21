import { describe, it, expect } from 'vitest';
import { Vec2 } from './vec2';

describe('Vec2', () => {
    describe('static properties', () => {
        it('ZERO is immutable zero vector', () => {
            expect(Vec2.ZERO.x).toBe(0);
            expect(Vec2.ZERO.y).toBe(0);
        });

        it('EPSILON is small positive number', () => {
            expect(Vec2.EPSILON).toBeGreaterThan(0);
            expect(Vec2.EPSILON).toBeLessThan(0.001);
        });

        it('EPSILONSQR is EPSILON squared', () => {
            expect(Vec2.EPSILONSQR).toBeCloseTo(Vec2.EPSILON * Vec2.EPSILON, 15);
        });
    });

    describe('static methods', () => {
        it('createRandomDir returns unit vector', () => {
            const v = Vec2.createRandomDir();
            expect(v.length).toBeCloseTo(1, 5);
        });

        it('swap exchanges values between vectors', () => {
            const a = new Vec2(1, 2);
            const b = new Vec2(3, 4);
            Vec2.swap(a, b);
            expect(a.x).toBe(3);
            expect(a.y).toBe(4);
            expect(b.x).toBe(1);
            expect(b.y).toBe(2);
        });
    });

    describe('constructor', () => {
        it('creates vector with default values (0, 0)', () => {
            const v = new Vec2();
            expect(v.x).toBe(0);
            expect(v.y).toBe(0);
        });

        it('creates vector with specified values', () => {
            const v = new Vec2(3, 4);
            expect(v.x).toBe(3);
            expect(v.y).toBe(4);
        });
    });

    describe('mutable setters', () => {
        it('x setter modifies value', () => {
            const v = new Vec2(1, 2);
            v.x = 10;
            expect(v.x).toBe(10);
            expect(v.y).toBe(2);
        });

        it('y setter modifies value', () => {
            const v = new Vec2(1, 2);
            v.y = 20;
            expect(v.x).toBe(1);
            expect(v.y).toBe(20);
        });
    });

    describe('copy operations', () => {
        it('copy copies from another vector', () => {
            const v1 = new Vec2(1, 2);
            const v2 = new Vec2(3, 4);
            const result = v1.copy(v2);
            expect(v1.x).toBe(3);
            expect(v1.y).toBe(4);
            expect(result).toBe(v1);
        });

        it('copyXY copies from coordinates', () => {
            const v = new Vec2(1, 2);
            const result = v.copyXY(5, 6);
            expect(v.x).toBe(5);
            expect(v.y).toBe(6);
            expect(result).toBe(v);
        });

        it('zero sets to (0, 0)', () => {
            const v = new Vec2(3, 4);
            const result = v.zero();
            expect(v.x).toBe(0);
            expect(v.y).toBe(0);
            expect(result).toBe(v);
        });
    });

    describe('mutable arithmetic (Self methods)', () => {
        it('addSelf modifies vector in place', () => {
            const v1 = new Vec2(1, 2);
            const v2 = new Vec2(3, 4);
            const result = v1.addSelf(v2);
            expect(v1.x).toBe(4);
            expect(v1.y).toBe(6);
            expect(result).toBe(v1);
        });

        it('addXYSelf modifies with coordinates', () => {
            const v = new Vec2(1, 2);
            const result = v.addXYSelf(3, 4);
            expect(v.x).toBe(4);
            expect(v.y).toBe(6);
            expect(result).toBe(v);
        });

        it('subSelf modifies vector in place', () => {
            const v1 = new Vec2(5, 7);
            const v2 = new Vec2(2, 3);
            const result = v1.subSelf(v2);
            expect(v1.x).toBe(3);
            expect(v1.y).toBe(4);
            expect(result).toBe(v1);
        });

        it('subXYSelf modifies with coordinates', () => {
            const v = new Vec2(5, 7);
            const result = v.subXYSelf(2, 3);
            expect(v.x).toBe(3);
            expect(v.y).toBe(4);
            expect(result).toBe(v);
        });

        it('mulSelf modifies vector in place', () => {
            const v1 = new Vec2(2, 3);
            const v2 = new Vec2(4, 5);
            const result = v1.mulSelf(v2);
            expect(v1.x).toBe(8);
            expect(v1.y).toBe(15);
            expect(result).toBe(v1);
        });

        it('mulXYSelf modifies with coordinates', () => {
            const v = new Vec2(2, 3);
            const result = v.mulXYSelf(4, 5);
            expect(v.x).toBe(8);
            expect(v.y).toBe(15);
            expect(result).toBe(v);
        });

        it('divSelf modifies vector in place', () => {
            const v1 = new Vec2(8, 15);
            const v2 = new Vec2(2, 3);
            const result = v1.divSelf(v2);
            expect(v1.x).toBe(4);
            expect(v1.y).toBe(5);
            expect(result).toBe(v1);
        });

        it('divXYSelf modifies with coordinates', () => {
            const v = new Vec2(8, 15);
            const result = v.divXYSelf(2, 3);
            expect(v.x).toBe(4);
            expect(v.y).toBe(5);
            expect(result).toBe(v);
        });
    });

    describe('mutable scale operations', () => {
        it('scaleSelf multiplies both components', () => {
            const v = new Vec2(3, 4);
            const result = v.scaleSelf(2);
            expect(v.x).toBe(6);
            expect(v.y).toBe(8);
            expect(result).toBe(v);
        });

        it('rescaleSelf changes length preserving direction', () => {
            const v = new Vec2(3, 4);
            const result = v.rescaleSelf(10);
            expect(v.x).toBeCloseTo(6, 5);
            expect(v.y).toBeCloseTo(8, 5);
            expect(result).toBe(v);
        });

        it('normalizeSelf makes unit vector', () => {
            const v = new Vec2(3, 4);
            const result = v.normalizeSelf();
            expect(v.x).toBeCloseTo(0.6, 5);
            expect(v.y).toBeCloseTo(0.8, 5);
            expect(result).toBe(v);
        });
    });

    describe('mutable rotation operations', () => {
        it('rotateSelf rotates vector by radians', () => {
            const v = new Vec2(1, 0);
            const result = v.rotateSelf(Math.PI / 2);
            expect(v.x).toBeCloseTo(0, 5);
            expect(v.y).toBeCloseTo(1, 5);
            expect(result).toBe(v);
        });

        it('normalRightSelf rotates 90 CW', () => {
            const v = new Vec2(1, 0);
            const result = v.normalRightSelf();
            expect(v.x).toBeCloseTo(0, 5);
            expect(v.y).toBeCloseTo(1, 5);
            expect(result).toBe(v);
        });

        it('normalLeftSelf rotates 90 CCW', () => {
            const v = new Vec2(1, 0);
            const result = v.normalLeftSelf();
            expect(v.x).toBeCloseTo(0, 5);
            expect(v.y).toBeCloseTo(-1, 5);
            expect(result).toBe(v);
        });

        it('negateSelf reverses direction', () => {
            const v = new Vec2(3, 4);
            const result = v.negateSelf();
            expect(v.x).toBe(-3);
            expect(v.y).toBe(-4);
            expect(result).toBe(v);
        });
    });

    describe('mutable spinor and lerp', () => {
        it('rotateSpinorSelf rotates using spinor', () => {
            const v = new Vec2(1, 0);
            const spinor = new Vec2(0, 1);
            const result = v.rotateSpinorSelf(spinor);
            expect(v.x).toBeCloseTo(0, 5);
            expect(v.y).toBeCloseTo(1, 5);
            expect(result).toBe(v);
        });

        it('lerpSelf interpolates in place', () => {
            const v1 = new Vec2(0, 0);
            const v2 = new Vec2(10, 10);
            const result = v1.lerpSelf(v2, 0.5);
            expect(v1.x).toBe(5);
            expect(v1.y).toBe(5);
            expect(result).toBe(v1);
        });
    });

    describe('method chaining', () => {
        it('chains multiple operations', () => {
            const v = new Vec2(1, 0);
            v.scaleSelf(3).addXYSelf(1, 4).normalizeSelf();
            expect(v.length).toBeCloseTo(1, 5);
        });
    });
});
