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
     * image data object
     *
     * @type {Jimp}
     * @memberof Sheet
     */
    public data: Jimp;

    /**
     * for controlling mustache template trailing comma, don't touch
     *
     * @type {boolean}
     * @memberof Sheet
     */
    public last: boolean = false;

    /**
     * Creates an instance of Sheet extends `MaxrectsPacker.Rectangle`
     *
     * @param {number} [width=0] width of sheet
     * @param {number} [height=0] height of sheet
     * @param {number} [x=0] position x of sheet
     * @param {number} [y=0] position y of sheet
     * @param {boolean} [rot=false] whether sheet is rotated
     * @memberof Sheet
     */
    constructor (
        public width: number = 0,
        public height: number = 0,
        public x: number = 0,
        public y: number = 0,
        rot: boolean = false
    ) {
        super();
        this.frame = new Rectangle(width, height);
        this.sourceFrame = new Rectangle(width, height);
        this.anchor = new Vec2(width / 2, height / 2);
        this.nineSliceFrame = new Rectangle(width, height);
        this.data = new Jimp(width, height);
    }

    public serialize (): object {
        return {
            name: this.name,
            width: this.width,
            height: this.height,
            x: this.x,
            y: this.y,
            rot: this.rot,
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
            }
        };
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
        extrudedImage.blit(this.data, border, border);
        this.data = extrudedImage;

        // top extruded border
        const topExtrude = this.data.clone()
            .crop(border, border, this.frame.width, 1)
            .resize(this.frame.width, border);
        this.data.blit(topExtrude, border, 0);
        // bottom extruded border
        const bottomExtrude = this.data.clone()
            .crop(border, border + this.frame.height - 1, this.frame.width, 1)
            .resize(this.frame.width, border);
        this.data.blit(bottomExtrude, border, border + this.frame.height);
        // left extruded border
        const leftExtrude = this.data.clone()
            .crop(border, border, 1, this.frame.height)
            .resize(border, this.frame.height);
        this.data.blit(leftExtrude, 0, border);
        // right extruded border
        const rightExtrude = this.data.clone()
            .crop(border + this.frame.width - 1, border, 1, this.frame.height)
            .resize(border, this.frame.height);
        this.data.blit(rightExtrude, border + this.frame.width, border);
    }

    /**
     * Rotate image data 90-degree CW, and swap width/height
     *
     * note: rotate is done automaticly when `Sheet.rot` set to `true`, normally
     * you don't need to do this manually unless you know what you are doing.
     *
     * @memberof Sheet
     */
    public rotate (): void {
        this.data.rotate(90);
        [this.frame.width, this.frame.height] = [this.frame.height, this.frame.width];
        [this.width, this.height] = [this.height, this.width];
    }

    private _border: number = 0;
    private _rotated: boolean = false;

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
        if (!this.rot) return; // if rot is set to false, do nothing.

        if (!this._rotated) this._rotated = true;
        else return; // if already rotated, skip rotate and swap.

        this.rotate();
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
