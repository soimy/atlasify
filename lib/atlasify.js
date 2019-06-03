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
const jimp_1 = __importDefault(require("jimp"));
const path_1 = __importDefault(require("path"));
const sheet_1 = require("./geom/sheet");
const exporter_1 = require("./exporter");
let appInfo = require('../package.json');
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
    constructor(name = 'sprite', width = 2048, height = 2048, padding = 0, type = "JsonHash") {
        this.name = name;
        this.width = width;
        this.height = height;
        this.padding = padding;
        this.type = type;
        /**
         * Atlas will automaticly shrink to the smallest possible square
         *
         * @type {boolean}
         * @memberof Options
         */
        this.smart = true;
        /**
         * Atlas size shall be power of 2
         *
         * @type {boolean}
         * @memberof Options
         */
        this.pot = true;
        /**
         * Atlas size shall be square
         *
         * @type {boolean}
         * @memberof Options
         */
        this.square = false;
        /**
         * Allow 90-degree rotation while packing
         *
         * @type {boolean}
         * @memberof Options
         */
        this.allowRotation = false;
        /**
         * Remove surrounding transparent pixels
         *
         * @type {boolean}
         * @memberof Options
         */
        this.trimAlpha = false;
        /**
         * Extrude amount of edge pixels, will automaticly `trimAlpha` first.
         *
         * @type {number}
         * @memberof Options
         */
        this.extrude = 0;
        /**
         * Draw debug info onto atlas
         *
         * @type {boolean}
         * @memberof Options
         */
        this.debug = false;
    }
}
exports.Options = Options;
class Atlasify {
    /**
     * Creates an instance of Atlasify.
     *
     * @param {Options} options Atlasify Options class
     * @memberof Atlasify
     */
    constructor(options) {
        this.options = options;
        this._debugColor = 0xff000088;
        this._atlas = [];
        this._spritesheets = [];
        this._inputPaths = [];
        this._rects = [];
        this._packer = new maxrects_packer_1.MaxRectsPacker(options.width, options.height, options.padding, options);
        this._exporter = new exporter_1.Exporter();
        this._exporter.setExportFormat(this.options.type);
    }
    /**
     * Load arrays of pathalike images url and do packing
     *
     * @param {string[]} paths
     * @param {(atlas: IAtlas[], spritesheets: ISpritesheet[]) => void} callback
     * @memberof Atlasify
     */
    load(paths, callback) {
        this._inputPaths.concat(paths);
        const loader = paths.map((img) => __awaiter(this, void 0, void 0, function* () {
            return jimp_1.default.read(img)
                .then((image) => {
                const sheet = new sheet_1.Sheet(image.bitmap.width, image.bitmap.height);
                sheet.data = image;
                sheet.name = path_1.default.basename(img);
                if (this.options.extrude > 0) {
                    sheet.trimAlpha(); // need to trim before extrude
                    sheet.extrude(this.options.extrude);
                }
                else if (this.options.trimAlpha) {
                    sheet.trimAlpha();
                }
                this._rects.push(sheet);
            })
                .catch(err => {
                console.error("File read error : " + err);
            });
        }));
        Promise.all(loader)
            .then(() => {
            const ext = path_1.default.extname(this.options.name);
            const basename = path_1.default.basename(this.options.name, ext);
            const fillColor = (ext === ".png" || ext === ".PNG") ? 0x00000000 : 0x000000ff;
            this._packer.addArray(this._rects);
            this._packer.bins.forEach((bin, index) => {
                const binName = this._packer.bins.length > 1 ? `${basename}.${index}${ext}` : `${basename}${ext}`;
                const image = new jimp_1.default(bin.width, bin.height, fillColor);
                // Add tag to the last sheet to control mustache trailing comma
                bin.rects[bin.rects.length - 1].last = true;
                bin.rects.forEach(rect => {
                    const sheet = rect;
                    const buffer = sheet.data;
                    sheet.frame.x += sheet.x;
                    sheet.frame.y += sheet.y;
                    if (this.options.debug) {
                        const debugFrame = new jimp_1.default(sheet.frame.width, sheet.frame.height, this._debugColor);
                        image.blit(debugFrame, sheet.frame.x, sheet.frame.y);
                    }
                    image.blit(buffer, sheet.x, sheet.y);
                });
                this._atlas.push({
                    id: index,
                    width: bin.width,
                    height: bin.height,
                    image: image,
                    name: binName,
                    format: ext
                });
                // prepare spritesheet data
                const view = {
                    id: index,
                    name: basename,
                    imageName: binName,
                    width: bin.width,
                    height: bin.height,
                    format: "RGBA8888",
                    scale: 1,
                    rects: bin.rects.map(rect => { return rect.serialize(); }),
                    appInfo: appInfo
                };
                this._spritesheets.push(view);
            });
            callback(this._atlas, this._spritesheets);
        })
            .catch(err => {
            console.error("File load error : " + err);
        });
    }
    get atlas() { return this._atlas; }
    get spritesheets() { return this._spritesheets; }
    get exporter() { return this._exporter; }
}
exports.Atlasify = Atlasify;
var sheet_2 = require("./geom/sheet");
exports.Sheet = sheet_2.Sheet;
//# sourceMappingURL=atlasify.js.map