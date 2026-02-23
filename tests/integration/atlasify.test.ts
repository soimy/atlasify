import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { cp, mkdtemp, rm, writeFile } from "fs/promises";
import path from "path";
import { tmpdir } from "os";
import { Atlasify, Options } from "../../src/atlasify.ts";
import { Image } from "../../src/image.ts";

describe("Atlasify integration", () => {
  let tempDir = "";

  beforeAll(async () => {
    tempDir = await mkdtemp(path.join(tmpdir(), "atlasify-vitest-"));
  });

  afterAll(async () => {
    if (tempDir) {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  it("packs fixture images and emits spritesheet data", async () => {
    const fixturePaths = [
      path.resolve("assets/atlas/ui/circle.png"),
      path.resolve("assets/atlas/items/coinGold.png"),
      path.resolve("assets/atlas/actor/k-bone.png")
    ];

    const options = new Options("atlas.png", 256, 256, 2, "JsonHash");
    options.trimAlpha = true;

    const atlasify = new Atlasify(options);
    await atlasify.addURLs(fixturePaths);

    expect(atlasify.atlas.length).toBeGreaterThan(0);
    expect(atlasify.spritesheets.length).toBeGreaterThan(0);
    expect((atlasify.spritesheets[0].rects as object[]).length).toBe(3);
    expect(atlasify.spritesheets[0].imageName).toBe("atlas.png");

    const output = atlasify.exporter.compile(atlasify.spritesheets[0]);
    expect(output).toContain("atlas.png");
    expect(output).toContain("frames");
  });

  it("supports duplicate search and save/load cycle", async () => {
    const srcImage = path.resolve("assets/atlas/ui/circle.png");
    const imageA = path.join(tempDir, "same-a.png");
    const imageB = path.join(tempDir, "same-b.png");
    const projectFile = path.join(tempDir, "project.atl.json");

    await cp(srcImage, imageA);
    await cp(srcImage, imageB);

    const options = new Options("dummy.png", 64, 64, 0, "JsonHash");
    options.searchDummy = true;

    const atlasify = new Atlasify(options);
    await atlasify.addURLs([imageA, imageB]);

    const rects = atlasify.spritesheets[0].rects as Array<{ name: string }>;
    expect(rects.length).toBe(2);
    expect(rects.map((r) => r.name).sort()).toEqual(["same-a.png", "same-b.png"]);

    const serialized = (await atlasify.save(true)) as string;
    await writeFile(projectFile, serialized, "utf-8");

    const loaded = await Atlasify.Load(projectFile, { trimAlpha: false });
    expect(loaded.atlas.length).toBe(atlasify.atlas.length);
    expect(loaded.spritesheets.length).toBe(atlasify.spritesheets.length);
  });

  it("covers constructor flags and early pack return", async () => {
    const separated = new Options("a.png", 64, 64, 0, "JsonHash");
    separated.separateFolder = true;
    const a = new Atlasify(separated);
    expect(a.options.tag).toBe(true);

    const grouped = new Options("b.png", 64, 64, 0, "JsonHash");
    grouped.groupFolder = true;
    const b = new Atlasify(grouped);
    expect(b.options.tag).toBe(true);
    expect(b.options.exclusiveTag).toBe(false);

    const packed = await b.pack();
    expect(packed).toBe(b);
    expect(b.atlas.length).toBe(0);
  });

  it("covers addURLs error callback branch", async () => {
    const atlasify = new Atlasify(new Options("err.png", 64, 64, 0, "JsonHash"));
    const callback = vi.fn();

    await expect(
      atlasify.addURLs([path.join(tempDir, "not-exists.png")], callback)
    ).rejects.toBeTruthy();

    expect(callback).toHaveBeenCalled();
    const firstCall = callback.mock.calls[0];
    expect(firstCall[0]).toBeTruthy();
  });

  it("covers save overload errors and private helpers", async () => {
    const atlasify = new Atlasify(new Options("helpers.png", 64, 64, 0, "JsonHash"));
    const onePixel = new Image(1, 1, 0xffffffff);

    const leaf = (atlasify as any).getLeafFolder(path.join("root", "leaf", "x.png"));
    expect(leaf).toBe("leaf");

    (atlasify as any)._atlas = [
      { id: 0, name: "sheetA", tag: "a", width: 1, height: 1, ext: "png", image: onePixel.clone() },
      { id: 1, name: "sheetB", tag: "b", width: 1, height: 1, ext: "png", image: onePixel.clone() }
    ];
    (atlasify as any)._spritesheets = [
      { id: 0, name: "metaA", tag: "a", imageName: "metaA.png" },
      { id: 1, name: "metaB", tag: "b", imageName: "metaB.png" }
    ];
    (atlasify as any).pruneTagIndex({ a: 0, b: 1, _: 0 });

    expect((atlasify as any)._atlas[0].id).toBeUndefined();
    expect((atlasify as any)._atlas[1].name).toContain(".1");
    expect((atlasify as any)._spritesheets[0].id).toBeUndefined();
    expect((atlasify as any)._spritesheets[1].imageName).toContain(".1.png");

    await expect(atlasify.save(true, 123 as any)).rejects.toThrow("wrong argument type");
  });
});
