import { describe, it, expect, beforeEach } from 'vitest';
import { Sheet } from './sheet';
import { Jimp } from 'jimp';

describe('Sheet', () => {
    describe('constructor', () => {
        it('creates sheet with default values', () => {
            const sheet = new Sheet();
            expect(sheet.width).toBe(0);
            expect(sheet.height).toBe(0);
            expect(sheet.x).toBe(0);
            expect(sheet.y).toBe(0);
            expect(sheet.rot).toBe(false);
        });

        it('creates sheet with specified dimensions', () => {
            const sheet = new Sheet(100, 200);
            expect(sheet.width).toBe(100);
            expect(sheet.height).toBe(200);
        });

        it('creates sheet with position and rotation', () => {
            const sheet = new Sheet(100, 200, 10, 20, true);
            expect(sheet.x).toBe(10);
            expect(sheet.y).toBe(20);
            expect(sheet.rot).toBe(true);
        });

        it('initializes frame rectangle', () => {
            const sheet = new Sheet(100, 200);
            expect(sheet.frame.width).toBe(100);
            expect(sheet.frame.height).toBe(200);
        });

        it('initializes sourceFrame rectangle', () => {
            const sheet = new Sheet(100, 200);
            expect(sheet.sourceFrame.width).toBe(100);
            expect(sheet.sourceFrame.height).toBe(200);
        });

        it('initializes anchor at center', () => {
            const sheet = new Sheet(100, 200);
            expect(sheet.anchor.x).toBe(50);
            expect(sheet.anchor.y).toBe(100);
        });

        it('initializes empty name and url', () => {
            const sheet = new Sheet(100, 200);
            expect(sheet.name).toBe('');
            expect(sheet.url).toBe('');
        });

        it('initializes trimmed as false', () => {
            const sheet = new Sheet(100, 200);
            expect(sheet.trimmed).toBe(false);
        });

        it('initializes empty dummy array', () => {
            const sheet = new Sheet(100, 200);
            expect(sheet.dummy).toEqual([]);
        });

        it('initializes last as false', () => {
            const sheet = new Sheet(100, 200);
            expect(sheet.last).toBe(false);
        });
    });

    describe('x and y setters', () => {
        it('x setter updates frame.x with border offset', () => {
            const sheet = new Sheet(100, 100);
            sheet.x = 50;
            expect(sheet.x).toBe(50);
            expect(sheet.frame.x).toBe(50);
        });

        it('y setter updates frame.y with border offset', () => {
            const sheet = new Sheet(100, 100);
            sheet.y = 50;
            expect(sheet.y).toBe(50);
            expect(sheet.frame.y).toBe(50);
        });
    });

    describe('serialize', () => {
        it('returns object with all properties', () => {
            const sheet = new Sheet(100, 200, 10, 20);
            sheet.name = 'test.png';
            sheet.url = '/path/to/test.png';
            const json = sheet.serialize() as Record<string, unknown>;
            
            expect(json.name).toBe('test.png');
            expect(json.url).toBe('/path/to/test.png');
            expect(json.width).toBe(100);
            expect(json.height).toBe(200);
            expect(json.x).toBe(10);
            expect(json.y).toBe(20);
        });

        it('includes tag when present', () => {
            const sheet = new Sheet(100, 200);
            sheet.tag = 'actor';
            const json = sheet.serialize() as Record<string, unknown>;
            expect(json.tag).toBe('actor');
        });

        it('excludes tag when not set', () => {
            const sheet = new Sheet(100, 200);
            const json = sheet.serialize() as Record<string, unknown>;
            expect(json).not.toHaveProperty('tag');
        });

        it('includes frame data', () => {
            const sheet = new Sheet(100, 200);
            const json = sheet.serialize() as Record<string, { width: number; height: number }>;
            expect(json.frame.width).toBe(100);
            expect(json.frame.height).toBe(200);
        });

        it('includes sourceFrame data', () => {
            const sheet = new Sheet(100, 200);
            const json = sheet.serialize() as Record<string, { width: number; height: number }>;
            expect(json.sourceFrame.width).toBe(100);
            expect(json.sourceFrame.height).toBe(200);
        });

        it('includes anchor data', () => {
            const sheet = new Sheet(100, 200);
            const json = sheet.serialize() as Record<string, { x: number; y: number }>;
            expect(json.anchor.x).toBe(50);
            expect(json.anchor.y).toBe(100);
        });
    });

    describe('parse', () => {
        it('restores simple properties', () => {
            const sheet = new Sheet(100, 200);
            sheet.parse({ name: 'restored.png', url: '/restored/path.png' });
            expect(sheet.name).toBe('restored.png');
            expect(sheet.url).toBe('/restored/path.png');
        });

        it('restores nested frame properties', () => {
            const sheet = new Sheet(100, 200);
            sheet.parse({ frame: { width: 50, height: 60 } });
            expect(sheet.frame.width).toBe(50);
            expect(sheet.frame.height).toBe(60);
        });

        it('returns this for chaining', () => {
            const sheet = new Sheet(100, 200);
            const result = sheet.parse({ name: 'test' });
            expect(result).toBe(sheet);
        });
    });

    describe('Factory', () => {
        it('creates sheet from data object', () => {
            const data = { width: 100, height: 200, name: 'factory.png' };
            const sheet = Sheet.Factory(data);
            expect(sheet.width).toBe(100);
            expect(sheet.height).toBe(200);
            expect(sheet.name).toBe('factory.png');
        });
    });

    describe('data and hash', () => {
        it('sets and gets image data', () => {
            const sheet = new Sheet(10, 10);
            const img = new Jimp({ width: 10, height: 10 });
            sheet.data = img;
            expect(sheet.data).toBe(img);
        });

        it('hash changes when data changes', () => {
            const sheet = new Sheet(10, 10);
            const hash1 = sheet.hash;
            
            const newImg = new Jimp({ width: 10, height: 10, color: 0xff0000ff });
            sheet.data = newImg;
            const hash2 = sheet.hash;
            
            expect(hash1).not.toBe(hash2);
        });
    });

    describe('trimAlpha', () => {
        it('trims transparent pixels from image', async () => {
            const sheet = new Sheet(10, 10);
            const img = new Jimp({ width: 10, height: 10, color: 0x00000000 });
            
            for (let x = 2; x < 8; x++) {
                for (let y = 2; y < 8; y++) {
                    img.setPixelColor(0xff0000ff, x, y);
                }
            }
            sheet.data = img;
            
            sheet.trimAlpha();
            
            expect(sheet.trimmed).toBe(true);
            expect(sheet.width).toBe(6);
            expect(sheet.height).toBe(6);
            expect(sheet.sourceFrame.x).toBe(2);
            expect(sheet.sourceFrame.y).toBe(2);
        });

        it('handles fully transparent image', () => {
            const sheet = new Sheet(10, 10);
            const img = new Jimp({ width: 10, height: 10, color: 0x00000000 });
            sheet.data = img;
            
            sheet.trimAlpha();
            
            expect(sheet.trimmed).toBe(true);
            expect(sheet.width).toBe(1);
            expect(sheet.height).toBe(1);
        });

        it('skips if already trimmed', () => {
            const sheet = new Sheet(10, 10);
            const img = new Jimp({ width: 10, height: 10, color: 0x00000000 });
            for (let x = 2; x < 8; x++) {
                for (let y = 2; y < 8; y++) {
                    img.setPixelColor(0xff0000ff, x, y);
                }
            }
            sheet.data = img;
            
            sheet.trimAlpha();
            const width1 = sheet.width;
            
            sheet.trimAlpha();
            const width2 = sheet.width;
            
            expect(width1).toBe(width2);
        });

        it('respects tolerance parameter', () => {
            const sheet = new Sheet(10, 10);
            const img = new Jimp({ width: 10, height: 10, color: 0x00000000 });
            
            for (let x = 0; x < 10; x++) {
                for (let y = 0; y < 10; y++) {
                    img.setPixelColor(0xff000010, x, y);
                }
            }
            for (let x = 3; x < 7; x++) {
                for (let y = 3; y < 7; y++) {
                    img.setPixelColor(0xff0000ff, x, y);
                }
            }
            sheet.data = img;
            
            sheet.trimAlpha(0x20);
            
            expect(sheet.trimmed).toBe(true);
            expect(sheet.width).toBe(4);
        });
    });

    describe('extrude', () => {
        it('increases dimensions by border * 2', () => {
            const sheet = new Sheet(10, 10);
            const img = new Jimp({ width: 10, height: 10, color: 0xff0000ff });
            sheet.data = img;
            
            sheet.extrude(2);
            
            expect(sheet.width).toBe(14);
            expect(sheet.height).toBe(14);
        });

        it('offsets frame position by border', () => {
            const sheet = new Sheet(10, 10);
            const img = new Jimp({ width: 10, height: 10, color: 0xff0000ff });
            sheet.data = img;
            
            sheet.extrude(3);
            
            expect(sheet.frame.x).toBe(3);
            expect(sheet.frame.y).toBe(3);
        });

        it('preserves original frame size', () => {
            const sheet = new Sheet(10, 10);
            const img = new Jimp({ width: 10, height: 10, color: 0xff0000ff });
            sheet.data = img;
            
            sheet.extrude(2);
            
            expect(sheet.frame.width).toBe(10);
            expect(sheet.frame.height).toBe(10);
        });
    });

    describe('rotate', () => {
        it('swaps frame dimensions', () => {
            const sheet = new Sheet(100, 200);
            const img = new Jimp({ width: 100, height: 200, color: 0xff0000ff });
            sheet.data = img;
            
            sheet.rotate();
            
            expect(sheet.frame.width).toBe(200);
            expect(sheet.frame.height).toBe(100);
        });

        it('swaps bitmap dimensions', () => {
            const sheet = new Sheet(100, 200);
            const img = new Jimp({ width: 100, height: 200, color: 0xff0000ff });
            sheet.data = img;
            
            sheet.rotate();
            
            expect(sheet.data.bitmap.width).toBe(200);
            expect(sheet.data.bitmap.height).toBe(100);
        });
    });

    describe('rot setter (auto-rotation)', () => {
        it('auto-rotates when rot set to true', () => {
            const sheet = new Sheet(100, 200);
            const img = new Jimp({ width: 100, height: 200, color: 0xff0000ff });
            sheet.data = img;
            
            sheet.rot = true;
            
            expect(sheet.rot).toBe(true);
            expect(sheet.frame.width).toBe(200);
            expect(sheet.frame.height).toBe(100);
        });

        it('does not re-rotate if already rotated', () => {
            const sheet = new Sheet(100, 200);
            const img = new Jimp({ width: 100, height: 200, color: 0xff0000ff });
            sheet.data = img;
            
            sheet.rot = true;
            const width1 = sheet.frame.width;
            
            sheet.rot = true;
            const width2 = sheet.frame.width;
            
            expect(width1).toBe(width2);
        });

        it('rotates back when rot set to false', () => {
            const sheet = new Sheet(100, 200);
            const img = new Jimp({ width: 100, height: 200, color: 0xff0000ff });
            sheet.data = img;
            
            sheet.rot = true;
            sheet.rot = false;
            
            expect(sheet.frame.width).toBe(100);
            expect(sheet.frame.height).toBe(200);
        });
    });
});
