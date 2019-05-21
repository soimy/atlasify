"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Rectangle_1 = require("maxrects-packer/lib/geom/Rectangle");
const Vec2_1 = require("./Vec2");
const jimp_1 = __importDefault(require("jimp"));
class Sheet extends Rectangle_1.Rectangle {
    constructor(name, x, y, width, height, rot = false) {
        super();
        this.name = name;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.rot = rot;
        this.trimmed = false;
        this.sourceFrame = new Rectangle_1.Rectangle(0, 0, width, height);
        this.anchor = new Vec2_1.Vec2(width / 2, height / 2);
        this.nineSliceFrame = new Rectangle_1.Rectangle(0, 0, width, height);
        this.data = new jimp_1.default(width, height);
    }
}
exports.Sheet = Sheet;
//# sourceMappingURL=Sheet.js.map