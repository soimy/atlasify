import { Rectangle } from "maxrects-packer";
import { Vec2 } from "./Vec2";
import Jimp from "jimp";

export class Sheet extends Rectangle {

    /**
     * sprite name, normally filename before packing
     * if `Atlasify.Options.basenameOnly = true` there will be no extension.
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
        let left = this.alphaScanner();
        if (left === this.width) {// blank image
            this.trimmed = true;
            this.frame.x = 0;
            this.frame.y = 0;
            this.frame.width = this.width = 1;
            this.frame.height = this.height = 1;
        } else {
            let right = this.alphaScanner(false);
            let top = this.alphaScanner(true, false);
            let bottom = this.alphaScanner(false, false);
            if (left || top || right || bottom) {
                this.trimmed = true;
                this.frame.x = left;
                this.frame.y = top;
                this.frame.width = this.width = this.data.bitmap.width - left - right;
                this.frame.height = this.height = this.data.bitmap.height - top - bottom;
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
        let x = horizontal ? forward ? 0 : this.width - 1 : 0;
        let y = horizontal ? 0 : forward ? 0 : this.height - 1;
        const bitmapData = this.data.bitmap.data;
        const increment = forward ? 1 : -1;
        let alphaIndex = (y * this.width + x) * 4 + 3;

        while (alphaIndex < bitmapData.length) {
            alphaIndex = (y * this.width + x) * 4 + 3;
            if (bitmapData[alphaIndex] !== 0x00) {
                break;
            }
            if (horizontal) x += increment;
            else y += increment;
        }
        return horizontal ? y : x;
    }

}
