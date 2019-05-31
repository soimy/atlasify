import { Rectangle } from "maxrects-packer";
import { Vec2 } from "./vec2";
import Jimp from "jimp";

export class Sheet extends Rectangle {

    /**
     * sprite name, normally filename before packing
     * if `Atlasify.Options.basenameOnly = true` there will be no extension.
     * if `Atlasify.Options.appendPath = true` name will include relative path.
     * @type {string}
     * @memberof Sheet
     */
    public name: string = "";

    /**
     * frame rectangle to be rendered to final atlas
     * @type {Rectangle}
     * @memberof Sheet
     */
    public frame: Rectangle;

    /**
     * orignal source rectangle
     * @type {Rectangle}
     * @memberof Sheet
     */
    public sourceFrame: Rectangle;

    /**
     * anchor/pivot point
     * @type {Vec2}
     * @memberof Sheet
     */
    public anchor: Vec2;

    /**
     * 9-sliced center rectangle
     * @type {Rectangle}
     * @memberof Sheet
     */
    public nineSliceFrame: Rectangle;

    /**
     * alpha trimmed
     * @type {boolean}
     * @memberof Sheet
     */
    public trimmed: boolean = false;

    /**
     * image data object
     * @type {Jimp}
     * @memberof Sheet
     */
    public data: Jimp;

    /**
     * for controlling mustache template trailing comma, don't touch
     * @type {boolean}
     * @memberof Sheet
     */
    public last: boolean = false;

    constructor (
        public width: number = 0,
        public height: number = 0,
        public x: number = 0,
        public y: number = 0,
        public rot: boolean = false
    ) {
        super();
        this.frame = new Rectangle(width, height);
        this.sourceFrame = new Rectangle(width, height);
        this.anchor = new Vec2(width / 2, height / 2);
        this.nineSliceFrame = new Rectangle(width, height);
        this.data = new Jimp(width, height);
    }

    public trimAlpha (): void {
        if (this.trimmed) return;
        let top = this.alphaScanner();
        if (top === this.data.bitmap.height) {// blank image
            this.trimmed = true;
            this.frame.x = 0;
            this.frame.y = 0;
            this.frame.width = this.width = 1;
            this.frame.height = this.height = 1;
        } else {
            let bottom = this.alphaScanner(false);
            let left = this.alphaScanner(true, false);
            let right = this.alphaScanner(false, false);
            if (left || top || right || bottom) {
                this.trimmed = true;
                this.frame.x = left;
                this.frame.y = top;
                this.frame.width = this.width = this.data.bitmap.width - right - left;
                this.frame.height = this.height = this.data.bitmap.height - bottom - top;
            }
        }
    }

    public extrude (border: number): void {
        // TODO
    }

    public rotate (): void {
        // TODO
        this.rot = true;
    }

    private alphaScanner (forward: boolean = true, horizontal: boolean = true): number {
        const bitmapData = this.data.bitmap.data;
        const scanline = (position: number, horizontal: boolean = true) => {
            let index = horizontal ? this.getChannelIndex(0, position) : this.getChannelIndex(position, 0);
            const boundary = horizontal ? index + this.data.bitmap.width * 4 : bitmapData.length;
            const increment = horizontal ? 4 : this.data.bitmap.width * 4;
            while (index < boundary) {
                if (bitmapData[index] !== 0x00) return true;
                index += increment;
            }
            return false;
        };
        const boundary = horizontal ? this.data.bitmap.height : this.data.bitmap.width;
        let progress = 0;
        let position = 0;
        while (progress < boundary) {
            position = forward ? progress : boundary - progress;
            if (scanline(position, horizontal)) break;
            progress ++;
        }
        return progress;
    }

    private getChannelIndex (x: number, y: number, offset: number = 3): number { return (y * this.width + x) * 4 + offset; }
}
