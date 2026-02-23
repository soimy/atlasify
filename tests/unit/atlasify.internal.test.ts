import { describe, expect, it, vi } from "vitest";
import Jimp from "jimp";
import path from "path";
import { Atlasify, Options, Sheet } from "../../src/atlasify.ts";

describe("Atlasify internals", () => {
  it("handles metric dedupe and dummy branches", () => {
    const options = new Options("atlas", 64, 64, 0, "JsonHash");
    options.searchDummy = true;
    const atlasify = new Atlasify(options);

    const image = new Jimp(2, 2, 0xff00ffff);
    const metric = (atlasify as any).metricFromImage.bind(atlasify);

    metric(image.clone(), "a.png");
    expect((atlasify as any)._sheets.length).toBe(1);
    expect((atlasify as any)._dirty).toBe(1);

    // Same name + same content should early return and not increase dirty.
    metric(image.clone(), "a.png");
    expect((atlasify as any)._dirty).toBe(1);

    // Different name + same content should be recorded as dummy.
    metric(image.clone(), "b.png");
    expect((atlasify as any)._sheets.length).toBe(1);
    expect((atlasify as any)._sheets[0].dummy).toContain("b.png");
    expect((atlasify as any)._dirty).toBe(2);

    // Already existing dummy should early return.
    metric(image.clone(), "b.png");
    expect((atlasify as any)._dirty).toBe(2);
  });

  it("covers trim/extrude/group-folder and pack callback", async () => {
    const options = new Options("atlas-no-ext", 64, 64, 2, "JsonHash");
    options.extrude = 1;
    options.groupFolder = true;
    const atlasify = new Atlasify(options);

    const image = new Jimp(4, 4, 0x00000000);
    image.setPixelColor(Jimp.rgbaToInt(255, 255, 255, 255), 1, 1);
    image.setPixelColor(Jimp.rgbaToInt(255, 255, 255, 255), 2, 2);

    (atlasify as any).metricFromImage(image, `x${path.sep}leaf${path.sep}img.png`);
    const sheet = (atlasify as any)._sheets[0] as Sheet;
    expect(sheet.trimmed).toBe(true);
    expect(sheet.tag).toBe("leaf");
    expect(sheet.width).toBeGreaterThan(2);

    const callback = vi.fn();
    await atlasify.pack(callback);
    expect(callback).toHaveBeenCalled();
    expect(atlasify.atlas[0].ext).toBe("png");
  });

  it("covers save overload branches and next()", async () => {
    const atlasify = new Atlasify(new Options("save.png", 32, 32, 0, "JsonHash"));
    (atlasify as any)._atlas = [{ id: 0, width: 1, height: 1, name: "a", ext: "png", image: new Jimp(1, 1, 0xffffffff) }];
    (atlasify as any)._spritesheets = [];

    const compact = await atlasify.save();
    expect(typeof compact).toBe("string");
    const pretty = await atlasify.save(true);
    expect(pretty).toContain("\n");

    await expect(atlasify.save(true, 42 as any)).rejects.toThrow("wrong argument type");
    expect(typeof atlasify.next()).toBe("number");
  });
});
