import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Atlasify, AtlasifyOptions, Options } from './atlasify';
import { Jimp } from 'jimp';
import path from 'node:path';
import fs from 'node:fs';

describe('AtlasifyOptions', () => {
    describe('constructor', () => {
        it('creates options with default values', () => {
            const opts = new AtlasifyOptions();
            expect(opts.width).toBe(2048);
            expect(opts.height).toBe(2048);
            expect(opts.padding).toBe(2);
            expect(opts.extrude).toBe(0);
            expect(opts.trimAlpha).toBe(true);
            expect(opts.name).toBe('atlas');
            expect(opts.type).toBe('JsonHash');
        });

        it('creates options with custom dimensions', () => {
            const opts = new AtlasifyOptions(1024, 512);
            expect(opts.width).toBe(1024);
            expect(opts.height).toBe(512);
        });

        it('creates options with all parameters', () => {
            const opts = new AtlasifyOptions(
                1024, 512, 4, 2, false, 10, false, true, true, 'sprite', 'XML'
            );
            expect(opts.width).toBe(1024);
            expect(opts.height).toBe(512);
            expect(opts.padding).toBe(4);
            expect(opts.extrude).toBe(2);
            expect(opts.trimAlpha).toBe(false);
            expect(opts.alphaTolerence).toBe(10);
            expect(opts.searchDummy).toBe(false);
            expect(opts.seperateFolder).toBe(true);
            expect(opts.groupFolder).toBe(true);
            expect(opts.name).toBe('sprite');
            expect(opts.type).toBe('XML');
        });

        it('has correct IOption defaults', () => {
            const opts = new AtlasifyOptions();
            expect(opts.smart).toBe(true);
            expect(opts.pot).toBe(true);
            expect(opts.square).toBe(false);
            expect(opts.allowRotation).toBe(false);
            expect(opts.border).toBe(0);
            expect(opts.instant).toBe(false);
            expect(opts.debug).toBe(false);
        });
    });
});

describe('Options export', () => {
    it('Options is alias for AtlasifyOptions', () => {
        expect(Options).toBe(AtlasifyOptions);
    });
});

describe('Atlasify', () => {
    let atlasify: Atlasify;
    let opts: AtlasifyOptions;

    beforeEach(() => {
        opts = new AtlasifyOptions(256, 256, 1, 0, false);
        atlasify = new Atlasify(opts);
    });

    describe('constructor', () => {
        it('creates instance with options', () => {
            expect(atlasify.options).toBe(opts);
        });

        it('sets tag option when seperateFolder is true', () => {
            const opts = new AtlasifyOptions(256, 256, 1, 0, false, 0, true, true, false);
            const atlasify = new Atlasify(opts);
            expect(atlasify.options.tag).toBe(true);
        });

        it('sets tag and exclusiveTag for groupFolder', () => {
            const opts = new AtlasifyOptions(256, 256, 1, 0, false, 0, true, false, true);
            const atlasify = new Atlasify(opts);
            expect(atlasify.options.tag).toBe(true);
            expect(atlasify.options.exclusiveTag).toBe(false);
        });
    });

    describe('atlas and spritesheets getters', () => {
        it('atlas returns empty array initially', () => {
            expect(atlasify.atlas).toEqual([]);
        });

        it('spritesheets returns empty array initially', () => {
            expect(atlasify.spritesheets).toEqual([]);
        });
    });

    describe('exporter getter', () => {
        it('returns Exporter instance', () => {
            expect(atlasify.exporter).toBeDefined();
            expect(typeof atlasify.exporter.compile).toBe('function');
        });
    });

    describe('pack', () => {
        it('resolves immediately when nothing dirty', async () => {
            const result = await atlasify.pack();
            expect(result).toBe(atlasify);
        });

        it('calls callback when provided and dirty', async () => {
            const testDir = path.join(__dirname, '../test');
            const imgPath = path.join(testDir, 'temp_pack_cb.png');
            
            try {
                const img = new Jimp({ width: 32, height: 32, color: 0xff0000ff });
                await img.write(imgPath as `${string}.${string}`);
                
                const callback = vi.fn();
                await atlasify.addURLs([imgPath], callback);
                
                expect(callback).toHaveBeenCalledWith(undefined, expect.any(Array), expect.any(Array));
            } finally {
                try { fs.unlinkSync(imgPath); } catch {}
            }
        });
    });

    describe('next', () => {
        it('returns current bin index', () => {
            const index = atlasify.next();
            expect(typeof index).toBe('number');
            expect(index).toBeGreaterThanOrEqual(0);
        });
    });

    describe('addURLs', () => {
        it('rejects with error for invalid paths', async () => {
            await expect(atlasify.addURLs(['/nonexistent/path.png']))
                .rejects.toThrow();
        });

        it('calls error callback for invalid paths', async () => {
            const callback = vi.fn();
            await expect(atlasify.addURLs(['/nonexistent/path.png'], callback))
                .rejects.toThrow();
            expect(callback).toHaveBeenCalledWith(expect.any(Error));
        });
    });

    describe('save', () => {
        it('returns serialized JSON string without path', async () => {
            const result = await atlasify.save();
            expect(typeof result).toBe('string');
            const parsed = JSON.parse(result as string);
            expect(parsed.options).toBeDefined();
            expect(parsed.packer).toBeDefined();
        });

        it('returns human-readable JSON when requested', async () => {
            const result = await atlasify.save(true);
            expect(typeof result).toBe('string');
            expect((result as string).includes('\n')).toBe(true);
        });

        it('includes options in serialized output', async () => {
            const result = await atlasify.save();
            const parsed = JSON.parse(result as string);
            expect(parsed.options.width).toBe(256);
            expect(parsed.options.height).toBe(256);
        });
    });

    describe('integration with real images', () => {
        const testDir = path.join(__dirname, '../test');
        const img1Path = path.join(testDir, 'temp_test1.png');
        const img2Path = path.join(testDir, 'temp_test2.png');
        const img3Path = path.join(testDir, 'temp_test3.png');

        afterEach(() => {
            try { fs.unlinkSync(img1Path); } catch {}
            try { fs.unlinkSync(img2Path); } catch {}
            try { fs.unlinkSync(img3Path); } catch {}
        });

        it('packs programmatic images', async () => {
            const opts = new AtlasifyOptions(256, 256, 1, 0, false);
            opts.searchDummy = false;
            const atlasify = new Atlasify(opts);
            
            const img1 = new Jimp({ width: 32, height: 32, color: 0xff0000ff });
            const img2 = new Jimp({ width: 32, height: 32, color: 0x00ff00ff });
            
            await img1.write(img1Path as `${string}.${string}`);
            await img2.write(img2Path as `${string}.${string}`);
            
            await atlasify.addURLs([img1Path, img2Path]);
            
            expect(atlasify.atlas.length).toBeGreaterThan(0);
            expect(atlasify.spritesheets.length).toBeGreaterThan(0);
            expect(atlasify.spritesheets[0].rects.length).toBe(2);
        });

        it('handles duplicate detection when searchDummy enabled', async () => {
            const opts = new AtlasifyOptions(256, 256, 1, 0, false);
            opts.searchDummy = true;
            const atlasify = new Atlasify(opts);
            
            const img = new Jimp({ width: 32, height: 32, color: 0xff0000ff });
            
            await img.write(img1Path as `${string}.${string}`);
            await img.write(img2Path as `${string}.${string}`);
            
            await atlasify.addURLs([img1Path, img2Path]);
            
            expect(atlasify.spritesheets.length).toBeGreaterThan(0);
        });

        it('applies trimAlpha when enabled', async () => {
            const opts = new AtlasifyOptions(256, 256, 1, 0, true);
            const atlasify = new Atlasify(opts);
            
            const img = new Jimp({ width: 32, height: 32, color: 0x00000000 });
            for (let x = 8; x < 24; x++) {
                for (let y = 8; y < 24; y++) {
                    img.setPixelColor(0xff0000ff, x, y);
                }
            }
            
            await img.write(img1Path as `${string}.${string}`);
            
            await atlasify.addURLs([img1Path]);
            
            expect(atlasify.spritesheets.length).toBeGreaterThan(0);
            const rect = atlasify.spritesheets[0].rects[0];
            expect(rect.trimmed).toBe(true);
        });

        it('applies extrude when configured', async () => {
            const opts = new AtlasifyOptions(256, 256, 1, 2, false);
            const atlasify = new Atlasify(opts);
            
            const img = new Jimp({ width: 32, height: 32, color: 0xff0000ff });
            
            await img.write(img1Path as `${string}.${string}`);
            
            await atlasify.addURLs([img1Path]);
            
            expect(atlasify.spritesheets.length).toBeGreaterThan(0);
        });

        it('handles instant packing mode', async () => {
            const opts = new AtlasifyOptions(256, 256, 1, 0, false);
            opts.instant = true;
            const atlasify = new Atlasify(opts);
            
            const img1 = new Jimp({ width: 32, height: 32, color: 0xff0000ff });
            const img2 = new Jimp({ width: 32, height: 32, color: 0x00ff00ff });
            
            await img1.write(img1Path as `${string}.${string}`);
            await img2.write(img2Path as `${string}.${string}`);
            
            await atlasify.addURLs([img1Path]);
            await atlasify.addURLs([img2Path]);
            
            expect(atlasify.atlas.length).toBeGreaterThan(0);
        });

        it('handles debug mode rendering', async () => {
            const opts = new AtlasifyOptions(256, 256, 1, 0, false);
            opts.debug = true;
            const atlasify = new Atlasify(opts);
            
            const img = new Jimp({ width: 32, height: 32, color: 0xff0000ff });
            await img.write(img1Path as `${string}.${string}`);
            
            await atlasify.addURLs([img1Path]);
            
            expect(atlasify.atlas.length).toBeGreaterThan(0);
        });

        it('handles non-png extension format', async () => {
            const opts = new AtlasifyOptions(256, 256, 1, 0, false);
            opts.name = 'sprite.jpg';
            const atlasify = new Atlasify(opts);
            
            const img = new Jimp({ width: 32, height: 32, color: 0xff0000ff });
            await img.write(img1Path as `${string}.${string}`);
            
            await atlasify.addURLs([img1Path]);
            
            expect(atlasify.spritesheets[0].imageName).toContain('.jpg');
        });

        it('adds dummy entries when same image with different name is found', async () => {
            const opts = new AtlasifyOptions(256, 256, 1, 0, false);
            opts.searchDummy = true;
            const atlasify = new Atlasify(opts);
            
            const img = new Jimp({ width: 32, height: 32, color: 0xff0000ff });
            await img.write(img1Path as `${string}.${string}`);
            await img.write(img2Path as `${string}.${string}`);
            
            await atlasify.addURLs([img1Path, img2Path]);
            
            expect(atlasify.spritesheets.length).toBeGreaterThan(0);
            const totalRects = atlasify.spritesheets[0].rects.length;
            expect(totalRects).toBeGreaterThanOrEqual(2);
        });

        it('replaces existing sheet when same name image changes', async () => {
            const opts = new AtlasifyOptions(256, 256, 1, 0, false);
            opts.searchDummy = false;
            const atlasify = new Atlasify(opts);
            
            const img1 = new Jimp({ width: 32, height: 32, color: 0xff0000ff });
            await img1.write(img1Path as `${string}.${string}`);
            await atlasify.addURLs([img1Path]);
            
            const img2 = new Jimp({ width: 32, height: 32, color: 0x00ff00ff });
            await img2.write(img1Path as `${string}.${string}`);
            await atlasify.addURLs([img1Path]);
            
            expect(atlasify.spritesheets.length).toBeGreaterThan(0);
        });

        it('skips unchanged image when same name and content', async () => {
            const opts = new AtlasifyOptions(256, 256, 1, 0, false);
            opts.searchDummy = true;
            const atlasify = new Atlasify(opts);
            
            const img = new Jimp({ width: 32, height: 32, color: 0xff0000ff });
            await img.write(img1Path as `${string}.${string}`);
            
            await atlasify.addURLs([img1Path]);
            await atlasify.addURLs([img1Path]);
            
            expect(atlasify.spritesheets[0].rects.length).toBe(1);
        });
    });

    describe('folder tagging', () => {
        const testDir = path.join(__dirname, '../test');
        const subDir = path.join(testDir, 'subFolder');
        const imgPath = path.join(subDir, 'temp_tag.png');

        beforeEach(() => {
            if (!fs.existsSync(subDir)) {
                fs.mkdirSync(subDir, { recursive: true });
            }
        });

        afterEach(() => {
            try { fs.unlinkSync(imgPath); } catch {}
            try { fs.rmdirSync(subDir); } catch {}
        });

        it('adds tag when seperateFolder is enabled', async () => {
            const opts = new AtlasifyOptions(256, 256, 1, 0, false, 0, true, true, false);
            const atlasify = new Atlasify(opts);
            
            const img = new Jimp({ width: 32, height: 32, color: 0xff0000ff });
            await img.write(imgPath as `${string}.${string}`);
            
            await atlasify.addURLs([imgPath]);
            
            expect(atlasify.spritesheets.length).toBeGreaterThan(0);
        });

        it('adds tag when groupFolder is enabled', async () => {
            const opts = new AtlasifyOptions(256, 256, 1, 0, false, 0, true, false, true);
            const atlasify = new Atlasify(opts);
            
            const img = new Jimp({ width: 32, height: 32, color: 0xff0000ff });
            await img.write(imgPath as `${string}.${string}`);
            
            await atlasify.addURLs([imgPath]);
            
            expect(atlasify.spritesheets.length).toBeGreaterThan(0);
        });
    });

    describe('save to file', () => {
        const testDir = path.join(__dirname, '../test');
        const atlPath = path.join(testDir, 'temp_save.atl');
        const imgPath = path.join(testDir, 'temp_save_img.png');

        afterEach(() => {
            try { fs.unlinkSync(atlPath); } catch {}
            try { fs.unlinkSync(imgPath); } catch {}
        });

        it('saves to file successfully', async () => {
            const opts = new AtlasifyOptions(256, 256, 1, 0, false);
            const atlasify = new Atlasify(opts);
            
            const img = new Jimp({ width: 32, height: 32, color: 0xff0000ff });
            await img.write(imgPath as `${string}.${string}`);
            await atlasify.addURLs([imgPath]);
            
            const result = await atlasify.save(false, atlPath);
            
            expect(result).toBe(true);
            expect(fs.existsSync(atlPath)).toBe(true);
        });

        it('returns false on save error', async () => {
            const invalidPath = '/nonexistent/dir/file.atl';
            const result = await atlasify.save(false, invalidPath);
            expect(result).toBe(false);
        });
    });

    describe('load', () => {
        const testDir = path.join(__dirname, '../test');
        const atlPath = path.join(testDir, 'temp_load.atl');
        const imgPath = path.join(testDir, 'temp_load_img.png');

        afterEach(() => {
            try { fs.unlinkSync(atlPath); } catch {}
            try { fs.unlinkSync(imgPath); } catch {}
        });

        it('loads saved project successfully', async () => {
            const opts = new AtlasifyOptions(256, 256, 1, 0, false);
            opts.searchDummy = false;
            const atlasify = new Atlasify(opts);
            
            const img = new Jimp({ width: 32, height: 32, color: 0xff0000ff });
            await img.write(imgPath as `${string}.${string}`);
            await atlasify.addURLs([imgPath]);
            await atlasify.save(false, atlPath);
            
            const loaded = await Atlasify.Load(atlPath);
            
            expect(loaded.options.width).toBe(256);
            expect(loaded.spritesheets.length).toBeGreaterThan(0);
        });

        it('applies option overrides when loading', async () => {
            const opts = new AtlasifyOptions(256, 256, 1, 0, false);
            const atlasify = new Atlasify(opts);
            
            const img = new Jimp({ width: 32, height: 32, color: 0xff0000ff });
            await img.write(imgPath as `${string}.${string}`);
            await atlasify.addURLs([imgPath]);
            await atlasify.save(false, atlPath);
            
            const loaded = await Atlasify.Load(atlPath, { width: 512 });
            
            expect(loaded.options.width).toBe(512);
        });

        it('instance load method works', async () => {
            const opts = new AtlasifyOptions(256, 256, 1, 0, false);
            opts.searchDummy = false;
            const atlasify = new Atlasify(opts);
            
            const img = new Jimp({ width: 32, height: 32, color: 0xff0000ff });
            await img.write(imgPath as `${string}.${string}`);
            await atlasify.addURLs([imgPath]);
            await atlasify.save(false, atlPath);
            
            const newAtlasify = new Atlasify(new AtlasifyOptions());
            await newAtlasify.load(atlPath);
            
            expect(newAtlasify.spritesheets.length).toBeGreaterThan(0);
        });

        it('handles load with trimAlpha option', async () => {
            const opts = new AtlasifyOptions(256, 256, 1, 0, true);
            opts.searchDummy = false;
            const atlasify = new Atlasify(opts);
            
            const img = new Jimp({ width: 32, height: 32, color: 0x00000000 });
            for (let x = 8; x < 24; x++) {
                for (let y = 8; y < 24; y++) {
                    img.setPixelColor(0xff0000ff, x, y);
                }
            }
            await img.write(imgPath as `${string}.${string}`);
            await atlasify.addURLs([imgPath]);
            await atlasify.save(false, atlPath);
            
            const loaded = await Atlasify.Load(atlPath);
            expect(loaded.spritesheets.length).toBeGreaterThan(0);
        });

        it('handles load with extrude option', async () => {
            const opts = new AtlasifyOptions(256, 256, 1, 2, true);
            opts.searchDummy = false;
            const atlasify = new Atlasify(opts);
            
            const img = new Jimp({ width: 32, height: 32, color: 0xff0000ff });
            await img.write(imgPath as `${string}.${string}`);
            await atlasify.addURLs([imgPath]);
            await atlasify.save(false, atlPath);
            
            const loaded = await Atlasify.Load(atlPath);
            expect(loaded.spritesheets.length).toBeGreaterThan(0);
        });
    });

    describe('Load static method', () => {
        it('throws error for non-existent file', async () => {
            await expect(Atlasify.Load('/nonexistent/path.atl'))
                .rejects.toThrow();
        });
    });

    describe('multiple bins and tags', () => {
        const testDir = path.join(__dirname, '../test');
        const img1Path = path.join(testDir, 'temp_bin1.png');
        const img2Path = path.join(testDir, 'temp_bin2.png');
        const sub1Dir = path.join(testDir, 'folder1');
        const sub2Dir = path.join(testDir, 'folder2');
        const tagImg1Path = path.join(sub1Dir, 'temp_tag1.png');
        const tagImg2Path = path.join(sub2Dir, 'temp_tag2.png');

        beforeEach(() => {
            if (!fs.existsSync(sub1Dir)) fs.mkdirSync(sub1Dir, { recursive: true });
            if (!fs.existsSync(sub2Dir)) fs.mkdirSync(sub2Dir, { recursive: true });
        });

        afterEach(() => {
            try { fs.unlinkSync(img1Path); } catch {}
            try { fs.unlinkSync(img2Path); } catch {}
            try { fs.unlinkSync(tagImg1Path); } catch {}
            try { fs.unlinkSync(tagImg2Path); } catch {}
            try { fs.rmdirSync(sub1Dir); } catch {}
            try { fs.rmdirSync(sub2Dir); } catch {}
        });

        it('handles multiple images filling to next bin', async () => {
            const opts = new AtlasifyOptions(64, 64, 1, 0, false);
            opts.searchDummy = false;
            const atlasify = new Atlasify(opts);
            
            const img1 = new Jimp({ width: 50, height: 50, color: 0xff0000ff });
            const img2 = new Jimp({ width: 50, height: 50, color: 0x00ff00ff });
            
            await img1.write(img1Path as `${string}.${string}`);
            await img2.write(img2Path as `${string}.${string}`);
            
            await atlasify.addURLs([img1Path, img2Path]);
            
            expect(atlasify.atlas.length).toBeGreaterThan(0);
        });

        it('handles tag-based separation with seperateFolder', async () => {
            const opts = new AtlasifyOptions(256, 256, 1, 0, false, 0, true, true, false);
            const atlasify = new Atlasify(opts);
            
            const img1 = new Jimp({ width: 32, height: 32, color: 0xff0000ff });
            const img2 = new Jimp({ width: 32, height: 32, color: 0x00ff00ff });
            
            await img1.write(tagImg1Path as `${string}.${string}`);
            await img2.write(tagImg2Path as `${string}.${string}`);
            
            await atlasify.addURLs([tagImg1Path, tagImg2Path]);
            
            expect(atlasify.atlas.length).toBeGreaterThan(0);
        });

        it('uses next() to manually advance bins', async () => {
            const opts = new AtlasifyOptions(256, 256, 1, 0, false);
            opts.searchDummy = false;
            const atlasify = new Atlasify(opts);
            
            const img1 = new Jimp({ width: 32, height: 32, color: 0xff0000ff });
            const img2 = new Jimp({ width: 32, height: 32, color: 0x00ff00ff });
            
            await img1.write(img1Path as `${string}.${string}`);
            await img2.write(img2Path as `${string}.${string}`);
            
            await atlasify.addURLs([img1Path]);
            atlasify.next();
            await atlasify.addURLs([img2Path]);
            
            expect(atlasify.atlas.length).toBeGreaterThanOrEqual(1);
        });
    });

    describe('atlas id pruning', () => {
        const testDir = path.join(__dirname, '../test');
        const sub1Dir = path.join(testDir, 'tagA');
        const sub2Dir = path.join(testDir, 'tagB');
        const img1Path = path.join(sub1Dir, 'img1.png');
        const img2Path = path.join(sub1Dir, 'img2.png');
        const img3Path = path.join(sub2Dir, 'img3.png');

        beforeEach(() => {
            if (!fs.existsSync(sub1Dir)) fs.mkdirSync(sub1Dir, { recursive: true });
            if (!fs.existsSync(sub2Dir)) fs.mkdirSync(sub2Dir, { recursive: true });
        });

        afterEach(() => {
            try { fs.unlinkSync(img1Path); } catch {}
            try { fs.unlinkSync(img2Path); } catch {}
            try { fs.unlinkSync(img3Path); } catch {}
            try { fs.rmdirSync(sub1Dir); } catch {}
            try { fs.rmdirSync(sub2Dir); } catch {}
        });

        it('prunes single-tag ids and appends multi-tag ids to name', async () => {
            const opts = new AtlasifyOptions(48, 48, 1, 0, false, 0, true, true, false);
            opts.searchDummy = false;
            const atlasify = new Atlasify(opts);
            
            const img1 = new Jimp({ width: 40, height: 40, color: 0xff0000ff });
            const img2 = new Jimp({ width: 40, height: 40, color: 0x00ff00ff });
            
            await img1.write(img1Path as `${string}.${string}`);
            await img2.write(img2Path as `${string}.${string}`);
            
            await atlasify.addURLs([img1Path, img2Path]);
            
            expect(atlasify.atlas.length).toBeGreaterThan(0);
        });
    });
});
