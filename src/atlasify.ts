import { MaxRectsPacker, IOption } from "maxrects-packer";
import Jimp from "jimp";
import path from "path";
import { Sheet } from "./geom/sheet";
import { Exporter } from "./exporter";

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
export class Options implements IOption {

    /**
     * Atlas will automaticly shrink to the smallest possible square
     *
     * @type {boolean}
     * @memberof Options
     */
    public smart: boolean = true;

    /**
     * Atlas size shall be power of 2
     *
     * @type {boolean}
     * @memberof Options
     */
    public pot: boolean = true;

    /**
     * Atlas size shall be square
     *
     * @type {boolean}
     * @memberof Options
     */
    public square: boolean = false;

    /**
     * Allow 90-degree rotation while packing
     *
     * @type {boolean}
     * @memberof Options
     */
    public allowRotation: boolean = false;

    /**
     * Remove surrounding transparent pixels
     *
     * @type {boolean}
     * @memberof Options
     */
    public trimAlpha: boolean = false;

    /**
     * Extrude amount of edge pixels, will automaticly `trimAlpha` first.
     *
     * @type {number}
     * @memberof Options
     */
    public extrude: number = 0;

    /**
     * Draw debug info onto atlas
     *
     * @type {boolean}
     * @memberof Options
     */
    public debug: boolean = false;

   /**
    * Creates an instance of Options.
    * @param {string} [name='sprite'] output filename of atlas/spreadsheet (default is 'sprite.png')
    * @param {number} [width=2048] ouput texture atlas width (defaut: 2048)
    * @param {number} [height=2048] ouput texture atlas height (defaut: 2048)
    * @param {number} [padding=0] padding between images (Default: 0)
    * @memberof Options
    */
    constructor (
        public name: string = 'sprite',
        public width: number = 2048,
        public height: number = 2048,
        public padding: number = 0,
        public type: string = "JsonHash"
    ) { }
}

export interface ISpritesheet {
    name: string;
    id: number;
    imageName: string;
    width: number;
    height: number;
    format: string;
    scale: number;
    rects: object[];
    appInfo?: any;
    base64Data?: IBase64Data;
}

export interface IBase64Data {
    prefix: string;
    data: string;
}

export interface IAtlas {
    id: number;
    image: Jimp;
    width: number;
    height: number;
    name: string;
    folder?: string;
    format?: string;
}

export class Atlasify {

   /**
    * Creates an instance of Atlasify.
    *
    * @param {Options} options Atlasify Options class
    * @memberof Atlasify
    */
    constructor (public options: Options) {
        this._inputPaths = [];
        this._rects = [];
        this._packer = new MaxRectsPacker<Sheet>(options.width, options.height, options.padding, options);
        this._exporter = new Exporter();
        this._exporter.setExportFormat(this.options.type);
    }

    /**
     * Load arrays of pathalike images url and do packing
     *
     * @param {string[]} paths
     * @param {(atlas: IAtlas[], spritesheets: ISpritesheet[]) => void} callback
     * @memberof Atlasify
     */
    public load (paths: string[], callback: (atlas: IAtlas[], spritesheets: ISpritesheet[]) => void): void {
        this._inputPaths.concat(paths);
        const loader: Promise<void>[] = paths.map(async img => {
            return Jimp.read(img)
                .then((image: Jimp) => {
                    const sheet: Sheet = new Sheet(image.bitmap.width, image.bitmap.height);
                    sheet.data = image;
                    sheet.name = path.basename(img);
                    if (this.options.extrude > 0) {
                        sheet.trimAlpha(); // need to trim before extrude
                        sheet.extrude(this.options.extrude);
                    } else if (this.options.trimAlpha) {
                        sheet.trimAlpha();
                    }
                    this._rects.push(sheet);
                })
                .catch(err => {
                    console.error("File read error : " + err);
                });
        });
        Promise.all(loader)
            .then(() => {
                const ext: string = path.extname(this.options.name);
                const basename: string = path.basename(this.options.name, ext);
                const fillColor: number = (ext === ".png" || ext === ".PNG") ? 0x00000000 : 0x000000ff;

                this._packer.addArray(this._rects);
                this._packer.bins.forEach((bin, index: number) => {
                    const binName: string = this._packer.bins.length > 1 ? `${basename}.${index}${ext}` : `${basename}${ext}`;
                    const image = new Jimp(bin.width, bin.height, fillColor);
                    // Add tag to the last sheet to control mustache trailing comma
                    bin.rects[bin.rects.length - 1].last = true;
                    bin.rects.forEach(rect => {
                        const sheet = rect as Sheet;
                        const buffer: Jimp = sheet.data;
                        sheet.frame.x += sheet.x;
                        sheet.frame.y += sheet.y;
                        if (this.options.debug) {
                            const debugFrame = new Jimp(sheet.frame.width, sheet.frame.height, this._debugColor);
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
                    const view: ISpritesheet = {
                        id: index,
                        name: basename,
                        imageName: binName,
                        width: bin.width,
                        height: bin.height,
                        format: "RGBA8888",
                        scale: 1,
                        rects: (bin.rects as Sheet[]).map(rect => { return rect.serialize(); }),
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

    private _inputPaths: string[];
    private _rects: Sheet[];
    private _packer: MaxRectsPacker;
    private _debugColor: number = 0xff000088;

    private _atlas: IAtlas[] = [];

    /**
     * Get all atlas/image array
     *
     * note: this will only available with all async image load & packing done.
     *
     * @readonly
     * @type {IAtlas[]}
     * @memberof Atlasify
     */
    get atlas (): IAtlas[] { return this._atlas; }

    private _spritesheets: ISpritesheet[] = [];

    /**
     * Get all serialized spritesheets array.
     *
     * note: this will only available with all async image load & packing done.
     *
     * @readonly
     * @type {ISpritesheet[]}
     * @memberof Atlasify
     */
    get spritesheets (): ISpritesheet[] { return this._spritesheets; }

    private _exporter: Exporter;
    get exporter (): Exporter { return this._exporter; }
}

export { Sheet } from './geom/sheet';
