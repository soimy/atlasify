"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const maxrects_packer_1 = require("maxrects-packer");
const vec2_1 = require("./vec2");
const jimp_1 = __importDefault(require("jimp"));
class Sheet extends maxrects_packer_1.Rectangle {
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
    constructor(width = 0, height = 0, x = 0, y = 0, rot = false) {
        super();
        this.width = width;
        this.height = height;
        this.x = x;
        this.y = y;
        this.rot = rot;
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
        this.name = "";
        /**
         * alpha trimmed
         *
         * @type {boolean}
         * @memberof Sheet
         */
        this.trimmed = false;
        /**
         * for controlling mustache template trailing comma, don't touch
         *
         * @type {boolean}
         * @memberof Sheet
         */
        this.last = false;
        this._border = 0;
        this.frame = new maxrects_packer_1.Rectangle(width, height);
        this.sourceFrame = new maxrects_packer_1.Rectangle(width, height);
        this.anchor = new vec2_1.Vec2(width / 2, height / 2);
        this.nineSliceFrame = new maxrects_packer_1.Rectangle(width, height);
        this.data = new jimp_1.default(width, height);
    }
    /**
     * Crop surrounding transparent pixels
     *
     * @param {number} [tolerance=0] treat alpha less than this as transparent
     * @returns {void}
     * @memberof Sheet
     */
    trimAlpha(tolerance = 0) {
        if (this.trimmed)
            return;
        let top = this.alphaScanner(true, true, tolerance);
        if (top === this.data.bitmap.height) { // blank image
            this.trimmed = true;
            this.sourceFrame.x = 0;
            this.sourceFrame.y = 0;
            this.frame.width = this.width = 1;
            this.frame.height = this.height = 1;
        }
        else {
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
    extrude(border) {
        this._border = border;
        this.frame.x += border;
        this.frame.y += border;
        this.width += border * 2;
        this.height += border * 2;
        const extrudedImage = new jimp_1.default(this.width, this.height);
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
    rotate() {
        // TODO
        this.rot = true;
    }
    alphaScanner(forward = true, horizontal = true, tolerance = 0x00) {
        const bitmapData = this.data.bitmap.data;
        const scanline = (position, horizontal = true) => {
            let index = horizontal ? this.getChannelIndex(0, position) : this.getChannelIndex(position, 0);
            const boundary = horizontal ? index + this.data.bitmap.width * 4 : bitmapData.length;
            const increment = horizontal ? 4 : this.data.bitmap.width * 4;
            while (index < boundary) {
                if (bitmapData[index] > tolerance)
                    return true;
                index += increment;
            }
            return false;
        };
        const boundary = horizontal ? this.data.bitmap.height : this.data.bitmap.width;
        let progress = 0;
        let position = 0;
        while (progress < boundary) {
            position = forward ? progress : boundary - progress - 1;
            if (scanline(position, horizontal))
                break;
            progress++;
        }
        return progress;
    }
    getChannelIndex(x, y, offset = 3) { return (y * this.width + x) * 4 + offset; }
}
exports.Sheet = Sheet;
//# sourceMappingURL=sheet.js.map