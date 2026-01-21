import { describe, it, expect } from 'vitest';
import { Vec2 } from './vec2';

const Vec2Const = Object.getPrototypeOf(Vec2.prototype).constructor as typeof Vec2;

describe('Vec2Const', () => {
    describe('constructor and properties', () => {
        it('creates vector with default values (0, 0)', () => {
            const v = new Vec2Const();
            expect(v.x).toBe(0);
            expect(v.y).toBe(0);
        });

        it('creates vector with specified values', () => {
            const v = new Vec2Const(3, 4);
            expect(v.x).toBe(3);
            expect(v.y).toBe(4);
        });

        it('exposes internal _x and _y', () => {
            const v = new Vec2Const(5, 6);
            expect(v._x).toBe(5);
            expect(v._y).toBe(6);
        });
    });

    describe('lawOfCosAngle', () => {
        it('calculates angle for 3-4-5 triangle', () => {
            const angle = Vec2Const.lawOfCosAngle(3, 4, 5);
            expect(angle).toBeCloseTo(Math.PI / 2, 5);
        });

        it('calculates angle for equilateral triangle', () => {
            const angle = Vec2Const.lawOfCosAngle(1, 1, 1);
            expect(angle).toBeCloseTo(Math.PI / 3, 5);
        });
    });

    describe('clone', () => {
        it('creates independent copy', () => {
            const v1 = new Vec2Const(3, 4);
            const v2 = v1.clone();
            expect(v2.x).toBe(3);
            expect(v2.y).toBe(4);
            expect(v2).not.toBe(v1);
        });
    });

    describe('arithmetic operations (immutable)', () => {
        it('add returns new vector', () => {
            const v1 = new Vec2Const(1, 2);
            const v2 = new Vec2Const(3, 4);
            const result = v1.add(v2);
            expect(result.x).toBe(4);
            expect(result.y).toBe(6);
            expect(v1.x).toBe(1);
        });

        it('addXY returns new vector', () => {
            const v = new Vec2Const(1, 2);
            const result = v.addXY(3, 4);
            expect(result.x).toBe(4);
            expect(result.y).toBe(6);
        });

        it('sub returns new vector', () => {
            const v1 = new Vec2Const(5, 7);
            const v2 = new Vec2Const(2, 3);
            const result = v1.sub(v2);
            expect(result.x).toBe(3);
            expect(result.y).toBe(4);
        });

        it('subXY returns new vector', () => {
            const v = new Vec2Const(5, 7);
            const result = v.subXY(2, 3);
            expect(result.x).toBe(3);
            expect(result.y).toBe(4);
        });

        it('mul returns component-wise product', () => {
            const v1 = new Vec2Const(2, 3);
            const v2 = new Vec2Const(4, 5);
            const result = v1.mul(v2);
            expect(result.x).toBe(8);
            expect(result.y).toBe(15);
        });

        it('mulXY returns component-wise product', () => {
            const v = new Vec2Const(2, 3);
            const result = v.mulXY(4, 5);
            expect(result.x).toBe(8);
            expect(result.y).toBe(15);
        });

        it('div returns component-wise division', () => {
            const v1 = new Vec2Const(8, 15);
            const v2 = new Vec2Const(2, 3);
            const result = v1.div(v2);
            expect(result.x).toBe(4);
            expect(result.y).toBe(5);
        });

        it('divXY returns component-wise division', () => {
            const v = new Vec2Const(8, 15);
            const result = v.divXY(2, 3);
            expect(result.x).toBe(4);
            expect(result.y).toBe(5);
        });
    });

    describe('scale operations', () => {
        it('scale multiplies both components', () => {
            const v = new Vec2Const(3, 4);
            const result = v.scale(2);
            expect(result.x).toBe(6);
            expect(result.y).toBe(8);
        });

        it('rescale changes length while preserving direction', () => {
            const v = new Vec2Const(3, 4);
            const result = v.rescale(10);
            expect(result.x).toBeCloseTo(6, 5);
            expect(result.y).toBeCloseTo(8, 5);
        });
    });

    describe('normalize', () => {
        it('returns unit vector', () => {
            const v = new Vec2Const(3, 4);
            const result = v.normalize();
            expect(result.x).toBeCloseTo(0.6, 5);
            expect(result.y).toBeCloseTo(0.8, 5);
        });

        it('normalize with custom magnitude', () => {
            const v = new Vec2Const(3, 4);
            const result = v.normalize(10);
            expect(result.x).toBeCloseTo(6, 5);
            expect(result.y).toBeCloseTo(8, 5);
        });
    });

    describe('length and distance', () => {
        it('length returns magnitude', () => {
            const v = new Vec2Const(3, 4);
            expect(v.length).toBe(5);
        });

        it('lengthSqr returns squared magnitude', () => {
            const v = new Vec2Const(3, 4);
            expect(v.lengthSqr).toBe(25);
        });

        it('distance calculates between two vectors', () => {
            const v1 = new Vec2Const(0, 0);
            const v2 = new Vec2Const(3, 4);
            expect(v1.distance(v2)).toBe(5);
        });

        it('distanceXY calculates to point', () => {
            const v = new Vec2Const(0, 0);
            expect(v.distanceXY(3, 4)).toBe(5);
        });

        it('distanceSqr returns squared distance', () => {
            const v1 = new Vec2Const(0, 0);
            const v2 = new Vec2Const(3, 4);
            expect(v1.distanceSqr(v2)).toBe(25);
        });

        it('distanceXYSqr returns squared distance to point', () => {
            const v = new Vec2Const(0, 0);
            expect(v.distanceXYSqr(3, 4)).toBe(25);
        });
    });

    describe('equality and queries', () => {
        it('equals returns true for identical vectors', () => {
            const v1 = new Vec2Const(3, 4);
            const v2 = new Vec2Const(3, 4);
            expect(v1.equals(v2)).toBe(true);
        });

        it('equals returns false for different vectors', () => {
            const v1 = new Vec2Const(3, 4);
            const v2 = new Vec2Const(3, 5);
            expect(v1.equals(v2)).toBe(false);
        });

        it('equalsXY compares to coordinates', () => {
            const v = new Vec2Const(3, 4);
            expect(v.equalsXY(3, 4)).toBe(true);
            expect(v.equalsXY(3, 5)).toBe(false);
        });

        it('isNormalized returns true for unit vector', () => {
            const v = new Vec2Const(1, 0);
            expect(v.isNormalized()).toBe(true);
        });

        it('isNormalized returns false for non-unit vector', () => {
            const v = new Vec2Const(3, 4);
            expect(v.isNormalized()).toBe(false);
        });

        it('isZero returns true for zero vector', () => {
            const v = new Vec2Const(0, 0);
            expect(v.isZero()).toBe(true);
        });

        it('isZero returns false for non-zero vector', () => {
            const v = new Vec2Const(1, 0);
            expect(v.isZero()).toBe(false);
        });

        it('isNear returns true for very close vectors', () => {
            const v1 = new Vec2Const(1, 1);
            const v2 = new Vec2Const(1 + 1e-8, 1 + 1e-8);
            expect(v1.isNear(v2)).toBe(true);
        });

        it('isNearXY compares to coordinates', () => {
            const v = new Vec2Const(1, 1);
            expect(v.isNearXY(1 + 1e-8, 1 + 1e-8)).toBe(true);
        });

        it('isWithin checks custom epsilon', () => {
            const v1 = new Vec2Const(0, 0);
            const v2 = new Vec2Const(0.5, 0);
            expect(v1.isWithin(v2, 1)).toBe(true);
            expect(v1.isWithin(v2, 0.1)).toBe(false);
        });

        it('isWithinXY checks custom epsilon', () => {
            const v = new Vec2Const(0, 0);
            expect(v.isWithinXY(0.5, 0, 1)).toBe(true);
            expect(v.isWithinXY(0.5, 0, 0.1)).toBe(false);
        });

        it('isValid returns true for finite numbers', () => {
            const v = new Vec2Const(3, 4);
            expect(v.isValid()).toBe(true);
        });

        it('isValid returns false for NaN', () => {
            const v = new Vec2Const(NaN, 4);
            expect(v.isValid()).toBe(false);
        });

        it('isValid returns false for Infinity', () => {
            const v = new Vec2Const(Infinity, 4);
            expect(v.isValid()).toBe(false);
        });
    });

    describe('angle operations', () => {
        it('getDegrees returns angle in degrees', () => {
            const v = new Vec2Const(1, 0);
            expect(v.getDegrees()).toBeCloseTo(0, 5);
            
            const v2 = new Vec2Const(0, 1);
            expect(v2.getDegrees()).toBeCloseTo(90, 5);
        });

        it('getRads returns angle in radians', () => {
            const v = new Vec2Const(1, 0);
            expect(v.getRads()).toBeCloseTo(0, 5);
            
            const v2 = new Vec2Const(0, 1);
            expect(v2.getRads()).toBeCloseTo(Math.PI / 2, 5);
        });

        it('getRadsFullAngle returns positive angle', () => {
            const v = new Vec2Const(0, -1);
            expect(v.getRadsFullAngle()).toBeCloseTo(3 * Math.PI / 2, 5);
        });

        it('getMinRadsBetween returns smallest angle', () => {
            const v1 = new Vec2Const(1, 0);
            const v2 = new Vec2Const(0, 1);
            expect(v1.getMinRadsBetween(v2)).toBeCloseTo(Math.PI / 2, 5);
        });

        it('getRadsBetween returns signed angle', () => {
            const v1 = new Vec2Const(1, 0);
            const v2 = new Vec2Const(0, 1);
            expect(v1.getRadsBetween(v2)).toBeCloseTo(Math.PI / 2, 5);
        });
    });

    describe('dot and cross products', () => {
        it('dot returns dot product', () => {
            const v1 = new Vec2Const(1, 2);
            const v2 = new Vec2Const(3, 4);
            expect(v1.dot(v2)).toBe(11);
        });

        it('dotXY returns dot product with coordinates', () => {
            const v = new Vec2Const(1, 2);
            expect(v.dotXY(3, 4)).toBe(11);
        });

        it('crossDet returns 2D cross product (determinant)', () => {
            const v1 = new Vec2Const(1, 0);
            const v2 = new Vec2Const(0, 1);
            expect(v1.crossDet(v2)).toBe(1);
        });

        it('crossDetXY returns cross product with coordinates', () => {
            const v = new Vec2Const(1, 0);
            expect(v.crossDetXY(0, 1)).toBe(1);
        });
    });

    describe('rotation operations', () => {
        it('rotate rotates vector by radians', () => {
            const v = new Vec2Const(1, 0);
            const result = v.rotate(Math.PI / 2);
            expect(result.x).toBeCloseTo(0, 5);
            expect(result.y).toBeCloseTo(1, 5);
        });

        it('normalRight returns perpendicular vector (90 CW)', () => {
            const v = new Vec2Const(1, 0);
            const result = v.normalRight();
            expect(result.x).toBeCloseTo(0, 5);
            expect(result.y).toBeCloseTo(1, 5);
        });

        it('normalLeft returns perpendicular vector (90 CCW)', () => {
            const v = new Vec2Const(1, 0);
            const result = v.normalLeft();
            expect(result.x).toBeCloseTo(0, 5);
            expect(result.y).toBeCloseTo(-1, 5);
        });

        it('negate returns opposite vector', () => {
            const v = new Vec2Const(3, 4);
            const result = v.negate();
            expect(result.x).toBe(-3);
            expect(result.y).toBe(-4);
        });
    });

    describe('spinor operations', () => {
        it('rotateSpinorXY rotates using spinor components', () => {
            const v = new Vec2Const(1, 0);
            const result = v.rotateSpinorXY(0, 1);
            expect(result.x).toBeCloseTo(0, 5);
            expect(result.y).toBeCloseTo(1, 5);
        });

        it('rotateSpinor rotates using spinor vector', () => {
            const v = new Vec2Const(1, 0);
            const spinor = new Vec2Const(0, 1);
            const result = v.rotateSpinor(spinor);
            expect(result.x).toBeCloseTo(0, 5);
            expect(result.y).toBeCloseTo(1, 5);
        });

        it('spinorBetween calculates rotation spinor', () => {
            const v1 = new Vec2Const(1, 0);
            const v2 = new Vec2Const(0, 1);
            const spinor = v1.spinorBetween(v2);
            expect(spinor.x).toBeCloseTo(0, 5);
            expect(spinor.y).toBeCloseTo(1, 5);
        });
    });

    describe('interpolation', () => {
        it('lerp interpolates between vectors', () => {
            const v1 = new Vec2Const(0, 0);
            const v2 = new Vec2Const(10, 10);
            const result = v1.lerp(v2, 0.5);
            expect(result.x).toBe(5);
            expect(result.y).toBe(5);
        });

        it('lerp at t=0 returns start', () => {
            const v1 = new Vec2Const(0, 0);
            const v2 = new Vec2Const(10, 10);
            const result = v1.lerp(v2, 0);
            expect(result.x).toBe(0);
            expect(result.y).toBe(0);
        });

        it('lerp at t=1 returns end', () => {
            const v1 = new Vec2Const(0, 0);
            const v2 = new Vec2Const(10, 10);
            const result = v1.lerp(v2, 1);
            expect(result.x).toBe(10);
            expect(result.y).toBe(10);
        });

        it('slerp interpolates along arc', () => {
            const v1 = new Vec2Const(1, 0);
            const v2 = new Vec2Const(0, 1);
            const result = v1.slerp(v2, 0.5);
            const expectedAngle = Math.PI / 4;
            expect(result.x).toBeCloseTo(Math.cos(expectedAngle), 4);
            expect(result.y).toBeCloseTo(Math.sin(expectedAngle), 4);
        });

        it('slerp returns target for parallel vectors', () => {
            const v1 = new Vec2Const(1, 0);
            const v2 = new Vec2Const(1, 0);
            const result = v1.slerp(v2, 0.5);
            expect(result.x).toBeCloseTo(1, 5);
            expect(result.y).toBeCloseTo(0, 5);
        });
    });

    describe('reflection and mirror', () => {
        it('reflect returns reflected vector', () => {
            const v = new Vec2Const(1, -1);
            const normal = new Vec2Const(0, 1);
            const result = v.reflect(normal);
            expect(result.x).toBeCloseTo(1, 5);
            expect(result.y).toBeCloseTo(1, 5);
        });

        it('mirror returns mirrored vector', () => {
            const v = new Vec2Const(1, -1);
            const normal = new Vec2Const(0, 1);
            const result = v.mirror(normal);
            expect(result.x).toBeCloseTo(-1, 5);
            expect(result.y).toBeCloseTo(-1, 5);
        });
    });

    describe('utility methods', () => {
        it('toString returns formatted string', () => {
            const v = new Vec2Const(3, 4);
            expect(v.toString()).toBe('[3, 4]');
        });

        it('getMin returns component-wise minimum', () => {
            const v1 = new Vec2Const(1, 5);
            const v2 = new Vec2Const(3, 2);
            const result = v1.getMin(v2);
            expect(result.x).toBe(1);
            expect(result.y).toBe(2);
        });

        it('getMax returns component-wise maximum', () => {
            const v1 = new Vec2Const(1, 5);
            const v2 = new Vec2Const(3, 2);
            const result = v1.getMax(v2);
            expect(result.x).toBe(3);
            expect(result.y).toBe(5);
        });
    });
});
