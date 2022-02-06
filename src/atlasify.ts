import { MaxRectsPacker, IOption, IBin } from "maxrects-packer";
import Jimp from "jimp";
import path from "path";
import pixelMatch from "pixelmatch";
import { Sheet } from "./geom/sheet";
import { Exporter } from "./exporter";
import { writeFile, readFileSync } from "fs";

let appInfo = require('../package.json');

/**
 * Options class for atlasify and maxrects-packer
 *
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
     * Controlling packer border to edge
     *
     * @type {number}
     * @memberof Options
     */
    public border: number = 0;

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
     * Group sheets packing based on folder
     *
     * @type {boolean}
     * @memberof Options
     */
    public groupFolder: boolean = false;
    public exclusiveTag?: boolean;

    /**
     * Remove surrounding transparent pixels
     *
     * @type {boolean}
     * @memberof Options
     */
    public trimAlpha: boolean = false;

    /**
     * Trim alpha with tolerence value
     *
     * @type {number}
     * @memberof Options
     */
    public alphaTolerence: number = 0;

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
     * Search duplicated dummy sprites to reduce atlas element
     *
     * @type {boolean}
     * @memberof Options
     */
    public searchDummy: boolean = false;

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

export interface IAtl {
    options: Options;
    packer: IBin[];
    spritesheets: Spritesheet[];
    atlas: {image: string, ext: string, width: number, height: number, name: string, id?: number, tag?: string, format?: string}[];
    imagePaths: string[];
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
        this._sheets = [];
        if (options.seperateFolder) options.tag = true;
        if (options.groupFolder) {
            options.tag = true;
            options.exclusiveTag = false;
        }
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
    public addURLs (paths: string[], callback?: (err?: Error, atlas?: Atlas[], spritesheets?: Spritesheet[]) => void): Promise<Atlasify> {
        this._inputPaths = this._inputPaths.concat(paths);
        let loader: Promise<void>[] = paths.map(async img => {
            return Jimp.read(img).then(image => this.metricFromImage(image, img));
        });

        return Promise.all(loader)
            .then(() => {
                return this.pack(callback);
            })
            .catch(err => {
                console.error("File load error : " + err);
                if (callback) callback(err);
                return Promise.reject(err);
            });
    }

    private metricFromImage (image: Jimp, imgPath: string): void {
        const sheet: Sheet = new Sheet(image.bitmap.width, image.bitmap.height);
        sheet.name = path.basename(imgPath);
        sheet.url = imgPath;
        sheet.data = image;

        // post-processing
        if (this.options.extrude > 0) {
            sheet.trimAlpha(this.options.alphaTolerence); // need to trim before extrude
            sheet.extrude(this.options.extrude);
        } else if (this.options.trimAlpha) {
            sheet.trimAlpha(this.options.alphaTolerence);
        }
        if (this.options.seperateFolder || this.options.groupFolder) {
            const tag = this.getLeafFolder(imgPath);
            if (tag) sheet.tag = tag;
        }

        // search if image already exist
        let isNew = true;
        for (const i in this._sheets) {
            const s = this._sheets[i];
            if (!s.data) continue; // skip empty sheet
            if (s.name === sheet.name) {
                isNew = false;
                if (s.width === sheet.width &&
                    s.height === sheet.height &&
                    this.options.searchDummy && // do pHash compare only on same size image
                    s.hash === sheet.hash) {
                    // deep pixel compare
                    let diff = pixelMatch(s.data.bitmap.data, sheet.data.bitmap.data, null, s.width, s.height);
                    if (diff === 0) return; // early exit if no change
                }
                // input image has changed, need process
                this._sheets[i] = sheet;
                break;
            } else if (this.options.searchDummy && s.width === sheet.width &&
                s.height === sheet.height &&
                s.hash === sheet.hash) {
                // deep pixel compare
                let diff = pixelMatch(s.data.bitmap.data, sheet.data.bitmap.data, null, s.width, s.height);
                if (diff !== 0) break; // different image
                if (s.dummy.includes(sheet.name)) return; // already in dummy list, early exit
                // This is the dummy sheet with different name
                isNew = false;
                s.dummy.push(sheet.name);
                break;
            }
        }
        // if no early exit, set dirty status
        this._dirty ++;

        // push to _sheets if is new sheet
        if (isNew) {
            this._sheets.push(sheet);
            if (this.options.instant) {
                this._packer.add(sheet);
            }
        }
    }

    public pack (callback?: ((err?: Error, atlas?: Atlas[], spritesheets?: Spritesheet[]) => void)): Promise<this> {

        if (this._dirty === 0) return Promise.resolve(this); // early quick if nothing changed

        let ext: string = path.extname(this.options.name);
        const basename: string = path.basename(this.options.name, ext);
        if (ext === "") ext = "png"; // assign default format PNG
        else ext = ext.slice(1).toLowerCase(); // trim . of extname
        const fillColor: number = (ext === "png") ? 0x00000000 : 0x000000ff;
        const tagCount: { [index: string]: number; } = {};
        if (!this.options.instant) {
            this._packer.reset();
            this._packer.addArray(this._sheets);
        } else {
            this._packer.repack(false);
        }

        this._packer.bins.forEach((bin, index: number) => {
            // Count tags
            let tag = bin.tag ? bin.tag : "_";
            if (!tagCount.hasOwnProperty(tag)) tagCount[tag] = 0; // create index key if not exist
            else tagCount[tag]++;

            if (!bin.dirty) return; // early return if bin is not changed

            let binName = basename;
            if (bin.tag) binName = `${bin.tag}-${binName}`;

            this._atlas[index] = {
                id: tagCount[tag],
                width: bin.width,
                height: bin.height,
                image: new Jimp(bin.width, bin.height, fillColor),
                name: binName,
                format: "RGBA8888",
                ext: ext
            };
            if (bin.tag) this._atlas[index].tag = bin.tag;

            const image = this._atlas[index].image;

            const serializedSheet: any[] = [];
            // Render rects onto atlas
            bin.rects.forEach(rect => {
                const sheet = rect;
                const buffer: Jimp = sheet.data;
                // sheet.frame.x += sheet.x;
                // sheet.frame.y += sheet.y;
                if (this.options.debug) {
                    const debugFrame = new Jimp(sheet.frame.width, sheet.frame.height, this._debugColor);
                    image.blit(debugFrame, sheet.frame.x, sheet.frame.y);
                }
                image.composite(buffer, sheet.x, sheet.y);

                // share rects iteration to add serialized sheets
                serializedSheet.push(rect.serialize());
                if (rect.dummy.length > 0) {
                    rect.dummy.forEach(n => {
                        serializedSheet.push({ ...rect.serialize(), name: n });
                    });
                }
            });
            // Add tag to the last sheet to control mustache trailing comma
            serializedSheet[serializedSheet.length - 1].last = true;

            // prepare spritesheet data
            this._spritesheets[index] = {
                id: tagCount[tag],
                name: binName,
                imageName: `${binName}.${ext}`,
                imageFormat: "RGBA8888",
                width: bin.width,
                height: bin.height,
                scale: 1,
                rects: serializedSheet,
                format: this.options.type,
                ext: this._exporter.getExtension(),
                appInfo: appInfo
            };
            if (bin.tag) this._spritesheets[index].tag = bin.tag;

        });
        // remove id if tag count < 2
        this.pruneTagIndex(tagCount);
        this._dirty = 0; // set clean
        if (callback) callback(undefined, this._atlas, this._spritesheets);
        return Promise.resolve(this);
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

    /**
     * Async serialize current project & settings to string
     *
     * @param {boolean} [humanReadable=false]
     * @returns {Promise<string>}
     * @memberof Atlasify
     */
    public async save (humanReadable?: boolean): Promise<string>;
    /**
     * Asycn save current project & settings to file
     *
     * @param {boolean} [humanReadable=false]
     * @param {string} [pathalike]
     * @returns {Promise<boolean>}
     * @memberof Atlasify
     */
    public async save (humanReadable?: boolean, pathalike?: string): Promise<boolean>;
    /**
     * Asycn save current project & settings to file and return serialized string
     *
     * @param {boolean} [humanReadable=false]
     * @param {string} [pathalike]
     * @returns {Promise<string}>}
     * @memberof Atlasify
     */
    public async save (...args: any[]): Promise<any> {
        const atlasBase64 = await Promise.all(this._atlas.map(async a => a.image.getBase64Async(Jimp.MIME_PNG)));
        const atl: IAtl = {
            options: this.options,
            packer: this._packer.save(),
            spritesheets: this._spritesheets,
            atlas: this._atlas.map((a, i) => {
                return {
                    id: a.id ? a.id : 0,
                    width: a.width,
                    height: a.height,
                    name: a.name,
                    format: "RGBA8888", // TODO
                    ext: a.ext,
                    image: atlasBase64[i]
                };
            }),
            imagePaths: this._inputPaths
        };
        let humanReadable: boolean = false;
        let pathalike: string | undefined;
        if (args.length === 0) {
            humanReadable = false;
        } else if (args.length === 1) {
            if (typeof(args[0]) === "boolean") {
                humanReadable = args[0];
            } else if (typeof(args[0] === "string")) {
                pathalike = args[0];
            } else {
                throw new Error("Atlasify.save(): wrong argument type");
            }
        } else if (args.length > 1) {
            if (typeof(args[0]) === "boolean" && typeof(args[1]) === "string") {
                humanReadable = args[0];
                pathalike = args[1];
            } else {
                throw new Error("Atlasify.save(): wrong argument type");
            }
        }
        const result = humanReadable ? JSON.stringify(atl, null, 2) : JSON.stringify(atl);
        if (pathalike) {
            writeFile(pathalike, result, err => {
                if (err) {
                    console.error(`Saving atl file encountered error: ${err}`);
                    return false;
                } else {
                    console.log(`Saved configuration: ${pathalike}`);
                    return true;
                }
            });
        }
        return result;
    }

    public static async Load (pathalike: string, overrides: any = null): Promise<Atlasify> {
        const factory = new Atlasify(new Options());
        return factory.load(pathalike, overrides);
    }

    public async load (pathalike: string, overrides: any = null): Promise<Atlasify> {
        const atl: IAtl = JSON.parse(readFileSync(pathalike, 'utf-8'));
        this._sheets = [];
        this.options = { ...atl.options, ...overrides }; // combining saved options and cli options
        this._packer = new MaxRectsPacker<Sheet>(this.options.width, this.options.height, this.options.padding, this.options);
        this._exporter = new Exporter();
        this._exporter.setExportFormat(this.options.type);

        // Load packer
        this._packer.load(atl.packer);
        // Load spritesheets
        this._spritesheets = atl.spritesheets;
        // load atlas
        this._atlas = await Promise.all(atl.atlas.map(async (a, i) => {
            // async overwrite atlas base64 string image with Jimp object
            return { ...a, image: await Jimp.read(Buffer.from(a.image.replace(/^data:image\/png;base64,/, ""), 'base64')) };
        }));
        // Load sheets
        const loaders: Promise<Jimp>[] = [];
        this._spritesheets.forEach((spritesheet, i) => {
            spritesheet.rects.forEach(r => {
                const sheet = Sheet.Factory(r);

                const loader = Jimp.read(sheet.url);
                loader
                    .then(image => {
                        const reloaded = new Sheet(image.bitmap.width, image.bitmap.height);
                        reloaded.data = image;
                        // post-processing
                        // Note: only use saved options which sync saved sheet metrics
                        // option overriding will be done in deep repack using inputPath
                        if (atl.options.extrude > 0) {
                            reloaded.trimAlpha(atl.options.alphaTolerence); // need to trim before extrude
                            reloaded.extrude(atl.options.extrude);
                        } else if (atl.options.trimAlpha) {
                            reloaded.trimAlpha(atl.options.alphaTolerence);
                        }
                        // unrotate sheets for stable result
                        if (sheet.rot) sheet.rot = false;

                        sheet.data = reloaded.data;

                        // manage option overrides
                        if (!this.options.seperateFolder && sheet.tag) delete sheet.tag;
                    })
                    .catch(error => {
                        console.error(error);
                        console.log("Fall back to pre-rendered atlas");
                        sheet.data = new Jimp(sheet.width, sheet.height)
                            .blit(this._atlas[i].image, 0, 0, sheet.x, sheet.y, sheet.width, sheet.height);
                        // unrotate sheets for stable result
                        if (sheet.rot) sheet.rot = false;
                    });
                this._sheets.push(sheet);
                this._packer.bins[i].rects.push(sheet);
                loaders.push(loader);
            });
        });

        // TODO: Load imagePaths

        await Promise.all(loaders);
        console.log("Load completed");
        return this;
    }

    private _inputPaths: string[];
    private _sheets: Sheet[];
    private _packer: MaxRectsPacker<Sheet>;
    private _debugColor: number = 0xff000088;

    private _atlas: Atlas[] = [];
    private _dirty: number = 0;

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
            if (tagCount[tag] < 1 && a.hasOwnProperty("id")) delete a.id;
            if (a.hasOwnProperty("id")) {
                a.name = `${a.name}.${a.id}`; // append index to image filename
            }
        }
        for (let s of this._spritesheets) {
            const tag = s.tag ? s.tag : "_";
            if (tagCount[tag] < 1 && s.hasOwnProperty("id")) delete s.id;
            if (s.hasOwnProperty("id")) {
                s.name = `${s.name}.${s.id}`; // append index to spritesheet filename
                const ext = path.extname(s.imageName);
                s.imageName = `${s.name}${ext}`;
            }
        }
    }
}

export { Sheet } from './geom/sheet';
export { Exporter } from './exporter';
