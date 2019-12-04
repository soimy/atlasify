import { Rectangle } from "maxrects-packer";
import { Vec2 } from "./vec2";
import Jimp from "jimp";

export class Sheet extends Rectangle {

    /**
     * sprite name, normally filename before packing
     *
     * if `Atlasify.Options.basenameOnly = true` there will be no extension.
     *
     * if `Atlasify.Options.appendPath = true` name will include relative path.
     *
     * @type {string}
     * @memberof Sheet
     */
    public name: string = "";

    /**
     * path/url to the source image
     *
     * @type {string}
     * @memberof Sheet
     */
    public url: string = "";

    /**
     * frame rectangle to be rendered to final atlas
     *
     * @type {Rectangle}
     * @memberof Sheet
     */
    public frame: Rectangle;

    /**
     * orignal source rectangle
     *
     * `x` and `y` refer to the negative offset from the frame rectangle
     *
     * @type {Rectangle}
     * @memberof Sheet
     */
    public sourceFrame: Rectangle;

    /**
     * anchor/pivot point
     *
     * @type {Vec2}
     * @memberof Sheet
     */
    public anchor: Vec2;

    /**
     * 9-sliced center rectangle
     *
     * @type {Rectangle}
     * @memberof Sheet
     */
    public nineSliceFrame: Rectangle;

    /**
     * alpha trimmed
     *
     * @type {boolean}
     * @memberof Sheet
     */
    public trimmed: boolean = false;

    /**
     * tag of group packing
     *
     * @type {string}
     * @memberof Sheet
     */
    public tag?: string;

    /**
     * Dummy tag which represent a clone of other sheet
     *
     * @type {boolean}
     * @memberof Sheet
     */
    public dummy: string[] = [];

    /**
     * for controlling mustache template trailing comma, don't touch
     *
     * @type {boolean}
     * @memberof Sheet
     */
    public last: boolean = false;

    /**
     * Creates an instance of Sheet extends `Rectangle`
     * from {@link https://github.com/soimy/maxrects-packer | MaxrectsPacker}
     *
     * @param {number} [width=0] width of sheet
     * @param {number} [height=0] height of sheet
     * @param {number} [x=0] position x of sheet
     * @param {number} [y=0] position y of sheet
     * @param {boolean} [rot=false] whether sheet is rotated
     * @memberof Sheet
     */
    constructor (
        width: number = 0,
        height: number = 0,
        x: number = 0,
        y: number = 0,
        rot: boolean = false
    ) {
        super();
        this._x = x;
        this._y = y;
        this._width = width;
        this._height = height;
        this._rot = rot;
        this.frame = new Rectangle(width, height);
        this.sourceFrame = new Rectangle(width, height);
        this.anchor = new Vec2(width / 2, height / 2);
        this.nineSliceFrame = new Rectangle(width, height);
        this.data = new Jimp(width, height);
    }

    /**
     * Return a serialized json object
     *
     * @returns {object}
     * @memberof Sheet
     */
    public serialize (): object {
        let json: object = {
            name: this.name,
            url: this.url,
            width: this.width,
            height: this.height,
            x: this.x,
            y: this.y,
            trimmed: this.trimmed,
            frame: {
                width: this.frame.width,
                height: this.frame.height,
                x: this.frame.x,
                y: this.frame.y
            },
            sourceFrame: {
                width: this.sourceFrame.width,
                height: this.sourceFrame.height,
                x: this.sourceFrame.x,
                y: this.sourceFrame.y
            },
            anchor: {
                x: this.anchor.x,
                y: this.anchor.y
            },
            nineSliceFrame: {
                width: this.nineSliceFrame.width,
                height: this.nineSliceFrame.height,
                x: this.nineSliceFrame.x,
                y: this.nineSliceFrame.y
            },
            dummy: this.dummy,
            _border: this._border,
            _rotated: this._rotated,
            _rot: this._rot,
            rot: this.rot
        };
        if (this.tag) json = { ...json, tag: this.tag };
        return json;
    }

    /**
     * Load sheet settings from json object
     *
     * @param {object} data
     * @memberof Sheet
     */
    public parse (data: object, target: object = this): this {
        // TODO: Need test !
        Object.keys(data).forEach(key => {
            if (typeof(data[key]) === "object" && data[key] !== null && this[key]) {
                this.parse(data[key], this[key]);
            } else {
                try {
                    target[key] = data[key];
                } catch (err) {
                    console.error(err);
                }
            }
        });
        return this;
    }

    public static Factory (data: any): Sheet {
        const sheet = new Sheet(data.width, data.height);
        return sheet.parse(data);
    }

    /**
     * Crop surrounding transparent pixels
     *
     * @param {number} [tolerance=0] treat alpha less than this as transparent
     * @returns {void}
     * @memberof Sheet
     */
    public trimAlpha (tolerance: number = 0): void {
        // if sheet is already trimmed, or sheet has no alpha, early quit
        if (this.trimmed || !this.data.hasAlpha()) return;
        let top = this.alphaScanner(true, true, tolerance);
        if (top === this.data.bitmap.height) {// blank image
            this.trimmed = true;
            this.sourceFrame.x = 0;
            this.sourceFrame.y = 0;
            this.frame.width = this.width = 1;
            this.frame.height = this.height = 1;
        } else {
            let bottom = this.alphaScanner(false, true, tolerance);
            let left = this.alphaScanner(true, false, tolerance);
            let right = this.alphaScanner(false, false, tolerance);
            if (left || top || right || bottom) {
                this.trimmed = true;
                this.sourceFrame.x = left;
                this.sourceFrame.y = top;
                this.frame.width = this.width = this.data.bitmap.width - right - left;
                this.frame.height = this.height = this.data.bitmap.height - bottom - top;
            }
        }
        this.data.crop(this.sourceFrame.x, this.sourceFrame.y, this.width, this.height);
        this._imageDirty ++;
    }

    /**
     * Extrude edge pixels. Should `trimAlpha` first
     *
     * @param {number} border extrude pixels
     * @memberof Sheet
     */
    public extrude (border: number): void {
        this._border = border;
        this.frame.x += border;
        this.frame.y += border;
        this.width += border * 2;
        this.height += border * 2;
        const extrudedImage = new Jimp(this.width, this.height);
        // centered original image
        extrudedImage.composite(this.data, border, border);
        this.data = extrudedImage;

        // top extruded border
        const topExtrude = this.data.clone()
            .crop(border, border, this.frame.width, 1)
            .resize(this.frame.width, border);
        this.data.composite(topExtrude, border, 0);
        // bottom extruded border
        const bottomExtrude = this.data.clone()
            .crop(border, border + this.frame.height - 1, this.frame.width, 1)
            .resize(this.frame.width, border);
        this.data.composite(bottomExtrude, border, border + this.frame.height);
        // left extruded border
        const leftExtrude = this.data.clone()
            .crop(border, border, 1, this.frame.height)
            .resize(border, this.frame.height);
        this.data.composite(leftExtrude, 0, border);
        // right extruded border
        const rightExtrude = this.data.clone()
            .crop(border + this.frame.width - 1, border, 1, this.frame.height)
            .resize(border, this.frame.height);
        this.data.composite(rightExtrude, border + this.frame.width, border);
        this._imageDirty ++;
    }

    /**
     * Rotate image data 90-degree CW, and swap width/height
     *
     * note: rotate is done automaticly when `Sheet.rot` set to `true`, normally
     * you don't need to do this manually unless you know what you are doing.
     *
     * @memberof Sheet
     */
    public rotate (clockwise: boolean = true): void {
        // jimp rotate is buggy, avoid it!
        // this.data.rotate(90 * (clockwise ? 1 : -1));
        const bitmap = this.data.bitmap;
        const rotBuffer: Buffer = Buffer.from(bitmap.data);
        const rotOffsetStep = clockwise ? -4 : 4;
        let rotOffset = clockwise ? rotBuffer.length - 4 : 0;

        for (let x = 0; x < bitmap.width; x++) {
            for (let y = bitmap.height - 1; y >= 0; y--) {
                let srcOffset = (bitmap.width * y + x) << 2;
                let tmp = bitmap.data.readUInt32BE(srcOffset);
                rotBuffer.writeUInt32BE(tmp, rotOffset);
                rotOffset += rotOffsetStep;
            }
        }
        bitmap.data = rotBuffer;
        [bitmap.width, bitmap.height] = [bitmap.height, bitmap.width];

        [this.frame.width, this.frame.height] = [this.frame.height, this.frame.width];
        this._imageDirty ++;
    }

    private _border: number = 0;
    private _rotated: boolean = false;
    private _hash: string = "";
    private _imageDirty: number = 0;

    set x (value: number) {
        super.x = value;
        this.frame.x = this._border + value;
    }
    get x (): number { return super.x; }

    set y (value: number) {
        super.y = value;
        this.frame.y = this._border + value;
    }
    get y (): number { return super.y; }

    //
    // overriding Rectangle.rot getter setter
    //

    /**
     * Status from packer whether `Sheet` should be rotated.
     *
     * note: if `rot` set to `true`, image data will be rotated automaticlly,
     * and `width/height` is swaped.
     *
     * @type {boolean}
     * @memberof Sheet
     */
    get rot (): boolean {
        return super.rot;
    }
    set rot (value: boolean) {
        super.rot = value;

        if (this._rotated === value) return;
        this._rotated = value;
        this.rotate(value);
    }

    /**
     * image data object
     *
     * @type {Jimp}
     * @memberof Sheet
     */

    get data (): Jimp { return super.data; }
    set data (value: Jimp) {
        super.data = value;
        this._imageDirty ++;

        // hash is expensive, so move to manually update hash value
        //
        // if (this.data.bitmap) {
            // this.hash = this.data.hash();
        // }
    }

    /**
     * hash string generated from image, for identifing
     *
     * @type {string}
     * @memberof Sheet
     */
    get hash (): string {
        // update hash only when imagedata is touched
        if (this.data && this._imageDirty > 0) this._hash = this.data.hash();
        this._imageDirty = 0;
        return this._hash;
    }

    private alphaScanner (forward: boolean = true, horizontal: boolean = true, tolerance: number = 0x00): number {
        const bitmapData = this.data.bitmap.data;
        const scanline = (position: number, horizontal: boolean = true) => {
            let index = horizontal ? this.getChannelIndex(0, position) : this.getChannelIndex(position, 0);
            const boundary = horizontal ? index + this.data.bitmap.width * 4 : bitmapData.length;
            const increment = horizontal ? 4 : this.data.bitmap.width * 4;
            while (index < boundary) {
                if (bitmapData[index] > tolerance) return true;
                index += increment;
            }
            return false;
        };
        const boundary = horizontal ? this.data.bitmap.height : this.data.bitmap.width;
        let progress = 0;
        let position = 0;
        while (progress < boundary) {
            position = forward ? progress : boundary - progress - 1;
            if (scanline(position, horizontal)) break;
            progress ++;
        }
        return progress;
    }

    private getChannelIndex (x: number, y: number, offset: number = 3): number { return (y * this.width + x) * 4 + offset; }
}
