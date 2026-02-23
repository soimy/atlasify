import { describe, expect, it } from "vitest";
import { Vec2 } from "../../src/geom/vec2.ts";
import { Vec2Const } from "../../src/geom/vec2const.ts";

describe("Vec2Const", () => {
  it("supports core immutable math operations", () => {
    const v = new Vec2Const(3, 4);
    const u = new Vec2Const(1, 2);

    expect(v.length).toBe(5);
    expect(v.add(u)).toEqual(expect.objectContaining({ x: 4, y: 6 }));
    expect(v.sub(u)).toEqual(expect.objectContaining({ x: 2, y: 2 }));
    expect(v.mulXY(2, 3)).toEqual(expect.objectContaining({ x: 6, y: 12 }));
    expect(v.divXY(3, 2)).toEqual(expect.objectContaining({ x: 1, y: 2 }));
    const normalized = v.normalize();
    expect(normalized.x).toBeCloseTo(0.6, 10);
    expect(normalized.y).toBeCloseTo(0.8, 10);
    expect(v.dot(u)).toBe(11);
    expect(v.crossDet(u)).toBe(2);
  });

  it("handles angle and spinor helpers", () => {
    const v = new Vec2Const(1, 0);
    const u = new Vec2Const(0, 1);

    expect(Vec2Const.lawOfCosAngle(3, 4, 5)).toBeCloseTo(Math.PI / 2);
    expect(v.getRadsBetween(u)).toBeCloseTo(Math.PI / 2);
    expect(v.rotate(Math.PI / 2).x).toBeCloseTo(0, 10);
    expect(v.rotate(Math.PI / 2).y).toBeCloseTo(1, 10);
    expect(v.spinorBetween(u)).toEqual(expect.objectContaining({ x: 0, y: 1 }));
    expect(v.slerp(u, 0.5).length).toBeCloseTo(1, 6);
  });

  it("covers query and geometry helpers", () => {
    const v = new Vec2Const(2, -3);
    const u = new Vec2Const(-1, 5);

    expect(v.distance(u)).toBeCloseTo(Math.sqrt(73));
    expect(v.distanceXY(-1, 5)).toBeCloseTo(Math.sqrt(73));
    expect(v.distanceSqr(u)).toBe(73);
    expect(v.distanceXYSqr(-1, 5)).toBe(73);

    expect(v.equals(new Vec2Const(2, -3))).toBe(true);
    expect(v.equalsXY(2, -3)).toBe(true);
    expect(v.isZero()).toBe(false);
    expect(new Vec2Const(0, 0).isZero()).toBe(true);
    expect(new Vec2Const(Number.NaN, 1).isValid()).toBe(false);
    expect(new Vec2Const(1, 2).isValid()).toBe(true);

    expect(new Vec2Const(1, 0).isNormalized()).toBe(true);
    expect(new Vec2Const(0.00000001, 0).isNearXY(0, 0)).toBe(true);
    expect(new Vec2Const(1, 1).isWithinXY(1.5, 1.5, 1)).toBe(true);
    expect(new Vec2Const(1, 1).isWithin(new Vec2Const(1.5, 1.5), 1)).toBe(true);
  });

  it("covers transform helpers", () => {
    const v = new Vec2Const(1, 2);
    const normal = new Vec2Const(0, 1);

    expect(v.getDegrees()).toBeCloseTo(v.getRads() * (180 / Math.PI));
    expect(v.getRadsFullAngle()).toBeGreaterThanOrEqual(0);
    expect(v.getMinRadsBetween(new Vec2Const(0, 1))).toBeCloseTo(Math.acos(2 / Math.sqrt(5)));
    expect(v.dotXY(2, 3)).toBe(8);
    expect(v.crossDetXY(2, 3)).toBe(-1);

    expect(v.normalRight()).toEqual(expect.objectContaining({ x: -2, y: 1 }));
    expect(v.normalLeft()).toEqual(expect.objectContaining({ x: 2, y: -1 }));
    expect(v.negate()).toEqual(expect.objectContaining({ x: -1, y: -2 }));
    expect(v.rotateSpinorXY(0, 1)).toEqual(expect.objectContaining({ x: -2, y: 1 }));
    expect(v.rotateSpinor(new Vec2Const(0, 1))).toEqual(expect.objectContaining({ x: -2, y: 1 }));
    expect(v.lerp(new Vec2Const(3, 4), 0.5)).toEqual(expect.objectContaining({ x: 2, y: 3 }));
    expect(v.reflect(normal)).toEqual(expect.objectContaining({ x: 1, y: -2 }));
    expect(v.mirror(normal)).toEqual(expect.objectContaining({ x: -1, y: 2 }));
    expect(v.toString()).toBe("[1, 2]");
    expect(v.getMin(new Vec2Const(0, 3))).toEqual(expect.objectContaining({ x: 0, y: 2 }));
    expect(v.getMax(new Vec2Const(0, 3))).toEqual(expect.objectContaining({ x: 1, y: 3 }));
  });
});

describe("Vec2", () => {
  it("supports mutable operations", () => {
    const v = new Vec2(2, 3);

    v.addXYSelf(1, 2).subXYSelf(1, 1).mulXYSelf(2, 2).divXYSelf(2, 2);
    expect(v).toEqual(expect.objectContaining({ x: 2, y: 4 }));

    v.scaleSelf(2).normalizeSelf();
    expect(v.length).toBeCloseTo(1);

    v.copyXY(1, 0).rotateSelf(Math.PI / 2);
    expect(v.x).toBeCloseTo(0, 10);
    expect(v.y).toBeCloseTo(1, 10);
  });

  it("supports static helpers", () => {
    const a = new Vec2(1, 2);
    const b = new Vec2(3, 4);
    Vec2.swap(a, b);
    expect(a).toEqual(expect.objectContaining({ x: 3, y: 4 }));
    expect(b).toEqual(expect.objectContaining({ x: 1, y: 2 }));

    const random = Vec2.createRandomDir();
    expect(random.length).toBeCloseTo(1, 6);
  });

  it("covers mutable vector helpers", () => {
    const v = new Vec2(3, 4);
    const u = new Vec2(1, 2);

    v.copy(u);
    expect(v.equalsXY(1, 2)).toBe(true);
    v.zero();
    expect(v.equalsXY(0, 0)).toBe(true);

    v.copyXY(3, 4)
      .addSelf(u)
      .subSelf(u)
      .mulSelf(new Vec2(2, 3))
      .divSelf(new Vec2(2, 3));
    expect(v.equalsXY(3, 4)).toBe(true);

    v.rescaleSelf(10);
    expect(v.length).toBeCloseTo(10, 6);
    v.normalRightSelf();
    expect(v.length).toBeCloseTo(10, 6);
    v.normalLeftSelf().negateSelf();
    expect(v.length).toBeCloseTo(10, 6);

    v.copyXY(1, 0).rotateSpinorSelf(new Vec2(0, 1));
    expect(v.x).toBeCloseTo(0, 10);
    expect(v.y).toBeCloseTo(1, 10);

    v.lerpSelf(new Vec2(2, 3), 0.5);
    expect(v.x).toBeCloseTo(1, 10);
    expect(v.y).toBeCloseTo(2, 10);
  });
});
