"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const maxrects_packer_1 = require("maxrects-packer");
const Vec2_1 = require("./Vec2");
const jimp_1 = __importDefault(require("jimp"));
class Sheet extends maxrects_packer_1.Rectangle {
    constructor(width = 0, height = 0, x = 0, y = 0, rot = false) {
        super();
        this.width = width;
        this.height = height;
        this.x = x;
        this.y = y;
        this.rot = rot;
        /**
         * sprite name, normally filename before packing
         * if `Atlasify.Options.basenameOnly = true` there will be no extension.
         * if `Atlasify.Options.appendPath = true` name will include relative path.
         * @type {string}
         * @memberof Sheet
         */
        this.name = "";
        /**
         * alpha trimmed
         * @type {boolean}
         * @memberof Sheet
         */
        this.trimmed = false;
        /**
         * for controlling mustache template trailing comma, don't touch
         * @type {boolean}
         * @memberof Sheet
         */
        this.last = false;
        this.frame = new maxrects_packer_1.Rectangle(width, height);
        this.sourceFrame = new maxrects_packer_1.Rectangle(width, height);
        this.anchor = new Vec2_1.Vec2(width / 2, height / 2);
        this.nineSliceFrame = new maxrects_packer_1.Rectangle(width, height);
        this.data = new jimp_1.default(width, height);
    }
    trimAlpha() {
        if (this.trimmed)
            return;
        let top = this.alphaScanner();
        if (top === this.data.bitmap.height) { // blank image
            this.trimmed = true;
            this.frame.x = 0;
            this.frame.y = 0;
            this.frame.width = this.width = 1;
            this.frame.height = this.height = 1;
        }
        else {
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
    extrude(border) {
        // TODO
    }
    rotate() {
        // TODO
        this.rot = true;
    }
    alphaScanner(forward = true, horizontal = true) {
        const bitmapData = this.data.bitmap.data;
        const scanline = (position, horizontal = true) => {
            let index = horizontal ? this.getChannelIndex(0, position) : this.getChannelIndex(position, 0);
            const boundary = horizontal ? index + this.data.bitmap.width * 4 : bitmapData.length;
            const increment = horizontal ? 4 : this.data.bitmap.width * 4;
            while (index < boundary) {
                if (bitmapData[index] !== 0x00)
                    return true;
                index += increment;
            }
            return false;
        };
        const boundary = horizontal ? this.data.bitmap.height : this.data.bitmap.width;
        let progress = 0;
        let position = 0;
        while (progress < boundary) {
            position = forward ? progress : boundary - progress;
            if (scanline(position, horizontal))
                break;
            progress++;
        }
        return progress;
    }
    getChannelIndex(x, y, offset = 3) { return (y * this.width + x) * 4 + offset; }
}
exports.Sheet = Sheet;
//# sourceMappingURL=Sheet.js.map