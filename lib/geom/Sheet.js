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
        this.frame = new maxrects_packer_1.Rectangle(width, height);
        this.sourceFrame = new maxrects_packer_1.Rectangle(width, height);
        this.anchor = new Vec2_1.Vec2(width / 2, height / 2);
        this.nineSliceFrame = new maxrects_packer_1.Rectangle(width, height);
        this.data = new jimp_1.default(width, height);
    }
    trimAlpha() {
        if (this.trimmed)
            return;
        let left = this.alphaScanner();
        if (left === this.width) { // blank image
            this.trimmed = true;
            this.frame.x = 0;
            this.frame.y = 0;
            this.frame.width = this.width = 1;
            this.frame.height = this.height = 1;
        }
        else {
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
    extrude(border) {
        // TODO
    }
    rotate() {
        // TODO
        this.rot = true;
    }
    alphaScanner(forward = true, horizontal = true) {
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
            if (horizontal)
                x += increment;
            else
                y += increment;
        }
        return horizontal ? y : x;
    }
}
exports.Sheet = Sheet;
//# sourceMappingURL=Sheet.js.map