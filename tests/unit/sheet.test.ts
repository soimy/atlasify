import { describe, expect, it } from "vitest";
import { Image, rgbaToInt } from "../../src/image.ts";
import { Sheet } from "../../src/geom/sheet.ts";

describe("Sheet", () => {
  it("serializes and parses sheet metadata", () => {
    const sheet = new Sheet(8, 8, 1, 2);
    sheet.name = "hero.png";
    sheet.url = "/tmp/hero.png";
    sheet.tag = "actor";
    sheet.anchor.copyXY(2, 3);
    sheet.frame.x = 5;
    sheet.frame.y = 6;

    const serialized = sheet.serialize() as any;
    const restored = Sheet.Factory(serialized);

    expect(restored.name).toBe("hero.png");
    expect(restored.url).toBe("/tmp/hero.png");
    expect(restored.tag).toBe("actor");
    expect(restored.anchor.x).toBe(2);
    expect(restored.anchor.y).toBe(3);
    expect(restored.frame.x).toBe(5);
    expect(restored.frame.y).toBe(6);
  });

  it("trims transparent border and extrudes edge", () => {
    const image = new Image(4, 4, 0x00000000);
    image.setPixelColor(rgbaToInt(255, 0, 0, 255), 1, 1);
    image.setPixelColor(rgbaToInt(0, 255, 0, 255), 2, 2);

    const sheet = new Sheet(4, 4);
    sheet.data = image;
    sheet.trimAlpha();

    expect(sheet.trimmed).toBe(true);
    expect(sheet.sourceFrame.x).toBe(1);
    expect(sheet.sourceFrame.y).toBe(1);
    expect(sheet.frame.width).toBe(2);
    expect(sheet.frame.height).toBe(2);

    sheet.extrude(1);
    expect(sheet.width).toBe(4);
    expect(sheet.height).toBe(4);
    expect(sheet.frame.x).toBe(1);
    expect(sheet.frame.y).toBe(1);
  });

  it("rotates bitmap and frame", () => {
    const sheet = new Sheet(2, 3);
    const image = new Image(2, 3, 0xff0000ff);
    sheet.data = image;

    sheet.rotate(true);
    expect(sheet.data.bitmap.width).toBe(3);
    expect(sheet.data.bitmap.height).toBe(2);
    expect(sheet.frame.width).toBe(3);
    expect(sheet.frame.height).toBe(2);
  });
});
