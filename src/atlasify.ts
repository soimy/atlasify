import { MaxRectsPacker, IOption, Bin } from "maxrects-packer";
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
     * Instant mode will skip sorting and pack using given array order
     *
     * @type {boolean}
     * @memberof Options
     */
    public instant: boolean = false;

    /**
     * Seperate sheets packing based on folder
     *
     * @type {boolean}
     * @memberof Options
     */
    public seperateFolder: boolean = false;
    public tag?: boolean;

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

export type Atlas = {
    image: Jimp;
    ext: string;
    width: number;
    height: number;
    name: string;
    id?: number;
    tag?: string;
    format?: string; // TODO
};

export type Spritesheet = {
    name: string;
    id?: number;
    tag?: string;
    imageName: string;
    imageFormat: string;
    width: number;
    height: number;
    format: string;
    ext: string;
    scale: number;
    rects: object[];
    appInfo?: any;
    base64Data?: Base64Data;
};

export type Base64Data = {
    prefix: string;
    data: string;
};

export class Atlasify {

   /**
    * Creates an instance of Atlasify.
    *
    * @param {Options} options Atlasify Options class
    * @memberof Atlasify
    */
    constructor (public options: Options) {
        this._inputPaths = [];
        this._sheets = [];
        if (options.seperateFolder) options.tag = true;
        this._packer = new MaxRectsPacker<Sheet>(options.width, options.height, options.padding, options);
        this._exporter = new Exporter();
        this._exporter.setExportFormat(this.options.type);
    }

    /**
     * Add arrays of pathalike images url and do packing
     *
     * @param {string[]} paths
     * @param {(atlas: Atlas[], spritesheets: Spritesheet[]) => void} callback
     * @memberof Atlasify
     */
    public addURLs (paths: string[], callback?: (err?: Error, atlas?: Atlas[], spritesheets?: Spritesheet[]) => void): Promise<Atlasify | void> {
        this._inputPaths.concat(paths);
        let loader: Promise<void>[] = paths.map(async img => {
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
                    if (this.options.seperateFolder) {
                        const tag = this.getLeafFolder(img);
                        if (tag) sheet.tag = tag;
                    }
                    this._sheets.push(sheet);
                    if (this.options.instant) {
                        this._packer.add(sheet);
                    }
                });
        });

        return Promise.all(loader)
            .then(() => {
                let ext: string = path.extname(this.options.name);
                const basename: string = path.basename(this.options.name, ext);

                if (ext === "") ext = "png"; // assign default format PNG
                else ext = ext.slice(1); // trim . of extname
                ext = ext.toLowerCase();

                const fillColor: number = (ext === "png") ? 0x00000000 : 0x000000ff;
                const tagCount: {[index: string]: number} = {};

                if (!this.options.instant) this._packer.addArray(this._sheets);
                this._packer.bins.forEach((bin, index: number) => {
                    let binName = basename;
                    if (bin.tag) binName = `${bin.tag}-${binName}`;
                    const image = new Jimp(bin.width, bin.height, fillColor);

                    // Count tags
                    let tag = bin.tag ? bin.tag : "_";
                    if (!tagCount[tag]) tagCount[tag] = 0; // create index key if not exist
                    else tagCount[tag] ++;

                    // Add tag to the last sheet to control mustache trailing comma
                    bin.rects[bin.rects.length - 1].last = true;

                    // Render rects onto atlas
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

                    const atlas: Atlas = {
                        id: tagCount[tag],
                        width: bin.width,
                        height: bin.height,
                        image: image,
                        name: binName,
                        format: "RGBA8888", // TODO
                        ext: ext
                    };
                    this._atlas.push(atlas);

                    // prepare spritesheet data
                    const view: Spritesheet = {
                        id: tagCount[tag],
                        name: basename,
                        imageName: binName,
                        imageFormat: "RGBA8888",
                        width: bin.width,
                        height: bin.height,
                        scale: 1,
                        rects: (bin.rects as Sheet[]).map(rect => { return rect.serialize(); }),
                        format: this.options.type,
                        ext: this._exporter.getExtension(),
                        appInfo: appInfo
                    };
                    this._spritesheets.push(view);

                    // add tag if exist
                    if (bin.tag) {
                        atlas.tag = bin.tag;
                        view.tag = bin.tag;
                    }
                });

                // remove id if tag count < 2
                this.pruneTagIndex(tagCount);

                if (callback) callback(undefined, this._atlas, this._spritesheets);
                return Promise.resolve(this);
            })
            .catch(err => {
                console.error("File load error : " + err);
                if (callback) callback(err);
                return Promise.reject(err);
            });
    }

    public addBuffers (buffers: Buffer[], callback: (atlas: Atlas[], spritesheets: Spritesheet[]) => void): void {
        // TODO
    }

    /**
     * Enclose previous packing bin and start a new one.
     *
     * @returns {number}
     * @memberof Atlasify
     */
    public next (): number {
        this._packer.next();
        return this._packer.currentBinIndex;
    }

    private _inputPaths: string[];
    private _sheets: Sheet[];
    private _packer: MaxRectsPacker;
    private _debugColor: number = 0xff000088;

    private _atlas: Atlas[] = [];

    /**
     * Get all atlas/image array
     *
     * note: this will only available with all async image load & packing done.
     *
     * @readonly
     * @type {Atlas[]}
     * @memberof Atlasify
     */
    get atlas (): Atlas[] { return this._atlas; }

    private _spritesheets: Spritesheet[] = [];

    /**
     * Get all serialized spritesheets array.
     *
     * note: this will only available with all async image load & packing done.
     *
     * @readonly
     * @type {Spritesheet[]}
     * @memberof Atlasify
     */
    get spritesheets (): Spritesheet[] { return this._spritesheets; }

    private _exporter: Exporter;
    get exporter (): Exporter { return this._exporter; }

    private getLeafFolder (pathalike: string): string | undefined {
        const leafFolder = path.dirname(pathalike).split(path.sep).pop();
        return leafFolder;
    }

    private pruneTagIndex (tagCount: { [index: string]: number; }) {
        for (let a of this._atlas) {
            const tag = a.tag ? a.tag : "_";
            if (tagCount[tag] < 2 && a.id) delete a.id;
        }
        for (let s of this._spritesheets) {
            const tag = s.tag ? s.tag : "_";
            if (tagCount[tag] < 2 && s.id) delete s.id;
        }
    }
}

export { Sheet } from './geom/sheet';
