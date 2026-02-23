import { afterEach, describe, expect, it, vi } from "vitest";
import { Exporter } from "../../src/exporter.ts";

describe("Exporter", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("loads a predefined template and extension", () => {
    const exporter = new Exporter();
    expect(exporter.setExportFormat("JsonHash")).toBe(true);
    expect(exporter.getExtension()).toBe("json");

    const rendered = exporter.compile({
      imageName: "atlas.png",
      width: 128,
      height: 128,
      rects: []
    });
    expect(rendered).toContain("atlas.png");
  });

  it("reports invalid format and keeps compile behavior explicit", () => {
    const exporter = new Exporter();
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);

    expect(exporter.setExportFormat("missing-template")).toBe(false);
    expect(errorSpy).toHaveBeenCalled();
    expect(() =>
      exporter.compile({
        imageName: "sheet.png",
        width: 32,
        height: 32,
        rects: []
      })
    ).toThrow();
  });
});
