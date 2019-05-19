"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const maxrects_packer_1 = require("maxrects-packer");
const Rectangle_1 = require("maxrects-packer/lib/geom/Rectangle");
const jimp_1 = __importDefault(require("jimp"));
const path_1 = __importDefault(require("path"));
/**
 * Options class for composor and maxrects-packer
 *
 * @property {boolean} options.square use square size (default is true)
 * @property {boolean} options.pot use power of 2 sizing (default is true)
 * @property {boolean} options.square use square size (default is false)
 * @property {boolean} options.allowRotation allow rotation wihile packing (default is false)
 *
 * @export
 * @interface Option
 * @export
 * @class Options
 * @implements {IOption}
 */
class Options {
    /**
     * Creates an instance of Options.
     * @param {string} [name='sprite'] output filename of atlas/spreadsheet (default is 'sprite.png')
     * @param {number} [width=2048] ouput texture atlas width (defaut: 2048)
     * @param {number} [height=2048] ouput texture atlas height (defaut: 2048)
     * @param {number} [padding=0] padding between images (Default: 0)
     * @memberof Options
     */
    constructor(name = 'sprite', width = 2048, height = 2048, padding = 0) {
        this.name = name;
        this.width = width;
        this.height = height;
        this.padding = padding;
        this.smart = true;
        this.pot = true;
        this.square = false;
        this.allowRotation = false;
        this.trimAlpha = false; // TODO
    }
}
exports.Options = Options;
class Atlasify {
    constructor(options) {
        this.options = options;
        this.imageFilePaths = [];
        this.rects = [];
        this.packer = new maxrects_packer_1.MaxRectsPacker(options.width, options.height, options.padding, options);
    }
    load(paths) {
        this.imageFilePaths = paths;
        const loader = paths.map((img) => __awaiter(this, void 0, void 0, function* () {
            return jimp_1.default.read(img)
                .then(image => {
                const rect = new Rectangle_1.Rectangle(0, 0, image.bitmap.width, image.bitmap.height);
                rect.data = image;
                this.rects.push(rect);
            })
                .catch(err => {
                console.error("File read error : " + err);
            });
        }));
        Promise.all(loader)
            .then(() => {
            this.packer.addArray(this.rects);
            this.packer.bins.forEach((bin, index) => {
                const ext = path_1.default.extname(this.options.name);
                const basename = path_1.default.basename(this.options.name, ext);
                const binName = this.packer.bins.length > 1 ? `${basename}.${index}${ext}` : `${basename}${ext}`;
                const fillColor = (ext === ".png" || ext === ".PNG") ? 0x00000000 : 0x000000ff;
                const image = new jimp_1.default(bin.width, bin.height, fillColor);
                bin.rects.forEach(rect => {
                    const buffer = rect.data;
                    if (rect.rot)
                        buffer.rotate(90);
                    image.composite(buffer, rect.x, rect.y);
                });
                image.write(binName, () => {
                    console.log('Wrote atlas image : ' + binName);
                });
            });
        })
            .catch(err => {
            console.error("File load error : " + err);
        });
    }
}
exports.Atlasify = Atlasify;
//# sourceMappingURL=atlasify.js.map