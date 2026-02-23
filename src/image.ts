import { createHash } from "crypto";
import sharp from "sharp";

export const MIME_PNG = "image/png";

export function rgbaToInt(r: number, g: number, b: number, a: number): number {
    return ((r & 0xff) << 24) + ((g & 0xff) << 16) + ((b & 0xff) << 8) + (a & 0xff);
}

type ImageReadable = string | Buffer | ArrayBuffer | Uint8Array;

export class Image {
    public static MIME_PNG = MIME_PNG;
    public bitmap: { width: number; height: number; data: Buffer };

    constructor(width: number, height: number, color: number = 0x00000000) {
        const data = Buffer.alloc(width * height * 4);
        const r = (color >>> 24) & 0xff;
        const g = (color >>> 16) & 0xff;
        const b = (color >>> 8) & 0xff;
        const a = color & 0xff;
        for (let i = 0; i < data.length; i += 4) {
            data[i] = r;
            data[i + 1] = g;
            data[i + 2] = b;
            data[i + 3] = a;
        }
        this.bitmap = { width, height, data };
    }

    public static async read(input: ImageReadable): Promise<Image> {
        const source = input instanceof ArrayBuffer ? Buffer.from(input) : input;
        const { data, info } = await sharp(source).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
        return Image.fromRaw(info.width, info.height, Buffer.from(data));
    }

    public clone(): Image {
        return Image.fromRaw(this.bitmap.width, this.bitmap.height, Buffer.from(this.bitmap.data));
    }

    public hasAlpha(): boolean {
        for (let i = 3; i < this.bitmap.data.length; i += 4) {
            if (this.bitmap.data[i] < 255) return true;
        }
        return false;
    }

    public setPixelColor(hex: number, x: number, y: number): this {
        if (!this.inside(x, y)) return this;
        const offset = (y * this.bitmap.width + x) * 4;
        this.bitmap.data[offset] = (hex >>> 24) & 0xff;
        this.bitmap.data[offset + 1] = (hex >>> 16) & 0xff;
        this.bitmap.data[offset + 2] = (hex >>> 8) & 0xff;
        this.bitmap.data[offset + 3] = hex & 0xff;
        return this;
    }

    public composite(src: Image, x: number = 0, y: number = 0): this {
        return this.blit(src, x, y);
    }

    public blit(src: Image, dx: number, dy: number, sx: number = 0, sy: number = 0, w: number = src.bitmap.width, h: number = src.bitmap.height): this {
        for (let py = 0; py < h; py++) {
            for (let px = 0; px < w; px++) {
                const tx = dx + px;
                const ty = dy + py;
                const rx = sx + px;
                const ry = sy + py;
                if (!this.inside(tx, ty) || !src.inside(rx, ry)) continue;
                const srcOffset = (ry * src.bitmap.width + rx) * 4;
                const dstOffset = (ty * this.bitmap.width + tx) * 4;
                this.bitmap.data[dstOffset] = src.bitmap.data[srcOffset];
                this.bitmap.data[dstOffset + 1] = src.bitmap.data[srcOffset + 1];
                this.bitmap.data[dstOffset + 2] = src.bitmap.data[srcOffset + 2];
                this.bitmap.data[dstOffset + 3] = src.bitmap.data[srcOffset + 3];
            }
        }
        return this;
    }

    public crop(x: number, y: number, w: number, h: number): this {
        const out = Buffer.alloc(w * h * 4);
        for (let py = 0; py < h; py++) {
            for (let px = 0; px < w; px++) {
                const sx = x + px;
                const sy = y + py;
                if (!this.inside(sx, sy)) continue;
                const srcOffset = (sy * this.bitmap.width + sx) * 4;
                const dstOffset = (py * w + px) * 4;
                out[dstOffset] = this.bitmap.data[srcOffset];
                out[dstOffset + 1] = this.bitmap.data[srcOffset + 1];
                out[dstOffset + 2] = this.bitmap.data[srcOffset + 2];
                out[dstOffset + 3] = this.bitmap.data[srcOffset + 3];
            }
        }
        this.bitmap = { width: w, height: h, data: out };
        return this;
    }

    public resize(width: number, height: number): this {
        const out = Buffer.alloc(width * height * 4);
        const sxRatio = this.bitmap.width / width;
        const syRatio = this.bitmap.height / height;
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const sx = Math.min(this.bitmap.width - 1, Math.floor(x * sxRatio));
                const sy = Math.min(this.bitmap.height - 1, Math.floor(y * syRatio));
                const srcOffset = (sy * this.bitmap.width + sx) * 4;
                const dstOffset = (y * width + x) * 4;
                out[dstOffset] = this.bitmap.data[srcOffset];
                out[dstOffset + 1] = this.bitmap.data[srcOffset + 1];
                out[dstOffset + 2] = this.bitmap.data[srcOffset + 2];
                out[dstOffset + 3] = this.bitmap.data[srcOffset + 3];
            }
        }
        this.bitmap = { width, height, data: out };
        return this;
    }

    public hash(): string {
        return createHash("sha1")
            .update(this.bitmap.data)
            .update(`${this.bitmap.width}x${this.bitmap.height}`)
            .digest("hex");
    }

    public async getBase64(mime: string): Promise<string> {
        const mediaType = mime || MIME_PNG;
        const prefix = `data:${mediaType};base64,`;
        const encoded = await sharp(this.bitmap.data, {
            raw: {
                width: this.bitmap.width,
                height: this.bitmap.height,
                channels: 4
            }
        }).png().toBuffer();
        return `${prefix}${encoded.toString("base64")}`;
    }

    public async getBase64Async(mime: string): Promise<string> {
        return this.getBase64(mime);
    }

    private inside(x: number, y: number): boolean {
        return x >= 0 && y >= 0 && x < this.bitmap.width && y < this.bitmap.height;
    }

    private static fromRaw(width: number, height: number, data: Buffer): Image {
        const image = new Image(width, height);
        image.bitmap = { width, height, data };
        return image;
    }
}
