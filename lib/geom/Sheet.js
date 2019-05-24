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
        this.name = "";
        this.trimmed = false;
        this.sourceFrame = new maxrects_packer_1.Rectangle(0, 0, width, height);
        this.anchor = new Vec2_1.Vec2(width / 2, height / 2);
        this.nineSliceFrame = new maxrects_packer_1.Rectangle(0, 0, width, height);
        this.data = new jimp_1.default(width, height);
    }
    trimAlpha() {
        // TODO
        this.trimmed = true;
    }
    rotate() {
        this.rot = true;
    }
}
exports.Sheet = Sheet;
//# sourceMappingURL=Sheet.js.map