import { MaxRectsPacker, type IOption, type IBin } from "maxrects-packer";
import { Jimp, JimpMime, type JimpInstance } from "jimp";
import path from "node:path";
import pixelMatch from "pixelmatch";
import { Sheet } from "./geom/sheet";
import { Exporter } from "./exporter";
import { writeFile, readFileSync } from "node:fs";

import appInfo from '../package.json';

/**
 * Options class for atlasify and maxrects-packer
 *
 * @class AtlasifyOptions
 * @implements {IOption}
 */
export class AtlasifyOptions implements IOption {
    public smart = true;
    public pot = true;
    public square = false;
    public allowRotation = false;
    public border = 0;
    public instant = false;
    public tag?: boolean;
    public exclusiveTag?: boolean;
    public debug = false;

    constructor (
        public width: number = 2048,
        public height: number = 2048,
        public padding: number = 2,
        public extrude: number = 0,
        public trimAlpha: boolean = true,
        public alphaTolerence: number = 0,
        public searchDummy: boolean = true,
        public seperateFolder: boolean = false,
        public groupFolder: boolean = false,
        public name: string = "atlas",
        public type: string = "JsonHash"
    ) { }
}

export { AtlasifyOptions as Options };

export interface Atlas {
    image: JimpInstance;
    ext: string;
    width: number;
    height: number;
    name: string;
    id?: number;
    tag?: string;
    format?: string; // TODO
}

export interface Spritesheet {
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
    rects: any[];
    appInfo?: { [key: string]: any };
    base64Data?: Base64Data;
}

export interface Base64Data {
    prefix: string;
    data: string;
}

export interface IAtl {
    options: AtlasifyOptions;
    packer: IBin[];
    spritesheets: Spritesheet[];
    atlas: Array<{image: string, ext: string, width: number, height: number, name: string, id?: number, tag?: string, format?: string}>;
    imagePaths: string[];
}

export class Atlasify {

   /**
    * Creates an instance of Atlasify.
    *
    * @param {AtlasifyOptions} options Atlasify Options class
    * @memberof Atlasify
    */
    public options: AtlasifyOptions;
    constructor (options: AtlasifyOptions) {
        this.options = options;
        this._inputPaths = [];
        this._sheets = [];
        if (options.seperateFolder) options.tag = true;
        if (options.groupFolder) {
            options.tag = true;
            options.exclusiveTag = false;
        }
        this._packer = new MaxRectsPacker<Sheet>(this.options.width, this.options.height, this.options.padding, this.options);
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
    public async addURLs (paths: string[], callback?: (err?: Error, atlas?: Atlas[], spritesheets?: Spritesheet[]) => void): Promise<Atlasify> {
        this._inputPaths = this._inputPaths.concat(paths);
        const loader = paths.map(async img => {
            try {
                const image = await Jimp.read(img);
                this.metricFromImage(image as any, img);
            } catch (err) {
                console.error(`Error reading image ${img}:`, err);
                throw err;
            }
        });

        return await Promise.all(loader)
            .then(async () => await this.pack(callback))
            .catch(async err => {
                console.error("File load error : " + err);
                if (callback) callback(err);
                return await Promise.reject(err);
            });
    }

    private metricFromImage (image: JimpInstance, pathalike: string): void {
        const newSheet: Sheet = new Sheet(image.bitmap.width, image.bitmap.height);
        newSheet.name = path.basename(pathalike);
        newSheet.url = pathalike;
        newSheet.data = image;

        // post-processing
        if (this.options.extrude > 0) {
            newSheet.trimAlpha(this.options.alphaTolerence); // need to trim before extrude
            newSheet.extrude(this.options.extrude);
        } else if (this.options.trimAlpha) {
            newSheet.trimAlpha(this.options.alphaTolerence);
        }

        // unrotate sheets for stable result
        newSheet.rot = false;

        if (this.options.seperateFolder || this.options.groupFolder) {
            const tag = this.getLeafFolder(pathalike);
            if (tag) newSheet.tag = tag;
        }

        // search if image already exist
        let isNew = true;
        for (const existingSheet of this._sheets) {
            if (!existingSheet.data) continue; // skip empty sheet
            if (existingSheet.name === newSheet.name) {
                isNew = false;
                if (existingSheet.width === newSheet.width &&
                    existingSheet.height === newSheet.height &&
                    this.options.searchDummy && // do pHash compare only on same size image
                    existingSheet.hash === newSheet.hash) {
                    // deep pixel compare
                    const diff = pixelMatch(existingSheet.data.bitmap.data, newSheet.data.bitmap.data, undefined, existingSheet.width, existingSheet.height);
                    if (diff === 0) return; // early exit if no change
                }
                // input image has changed, need process
                // Replace the existing sheet with the new one
                const index = this._sheets.indexOf(existingSheet);
                if (index > -1) {
                    this._sheets[index] = newSheet;
                }
                break;
            } else if (this.options.searchDummy && existingSheet.width === newSheet.width &&
                existingSheet.height === newSheet.height &&
                existingSheet.hash === newSheet.hash) {
                // deep pixel compare
                const diff = pixelMatch(existingSheet.data.bitmap.data, newSheet.data.bitmap.data, undefined, existingSheet.width, existingSheet.height);
                if (diff !== 0) continue; // different image, continue search
                if (existingSheet.dummy.includes(newSheet.name)) return; // already in dummy list, early exit
                // This is a dummy sheet with a different name
                isNew = false;
                existingSheet.dummy.push(newSheet.name);
                return; // early exit after adding to dummy list
            }
        }
        // if no early exit, set dirty status
        this._dirty ++;

        // push to _sheets if is new sheet
        if (isNew) {
            this._sheets.push(newSheet);
            if (this.options.instant) {
                this._packer.add(newSheet);
            }
        }
    }

    public async pack (callback?: ((err?: Error, atlas?: Atlas[], spritesheets?: Spritesheet[]) => void)): Promise<this> {

        if (this._dirty === 0) return await Promise.resolve(this); // early quick if nothing changed

        let ext: string = path.extname(this.options.name);
        const basename: string = path.basename(this.options.name, ext);
        if (ext === "") ext = "png"; // assign default format PNG
        else ext = ext.slice(1).toLowerCase(); // trim . of extname
        const fillColor: number = (ext === "png") ? 0x00000000 : 0x000000ff;
        const tagCount: Record<string, number> = {};
        if (!this.options.instant) {
            this._packer.reset();
            this._packer.addArray(this._sheets);
        } else {
            this._packer.repack(false);
        }

        this._packer.bins.forEach((bin, index: number) => {
            // Count tags
            const tag = bin.tag ? bin.tag : "_";
            if (!tagCount.hasOwnProperty(tag)) tagCount[tag] = 0; // create index key if not exist
            else tagCount[tag]++;

            if (!bin.dirty) return; // early return if bin is not changed

            let binName = basename;
            if (bin.tag) binName = `${bin.tag}-${binName}`;

            this._atlas[index] = {
                id: tagCount[tag],
                width: bin.width,
                height: bin.height,
                image: new Jimp({ width: bin.width, height: bin.height, color: fillColor }),
                name: binName,
                format: "RGBA8888",
                ext
            };
            if (bin.tag) this._atlas[index].tag = bin.tag;

            const {image} = this._atlas[index];

            const serializedSheet: any[] = [];
            // Render rects onto atlas
            bin.rects.forEach(rect => {
                const sheet = rect;
                const buffer: any = sheet.data;
                // sheet.frame.x += sheet.x;
                // sheet.frame.y += sheet.y;
                if (this.options.debug) {
                    const debugFrame = new Jimp({ width: sheet.frame.width, height: sheet.frame.height, color: this._debugColor });
                    image.blit({ src: debugFrame, x: sheet.frame.x, y: sheet.frame.y });
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
                appInfo
            };
            if (bin.tag) this._spritesheets[index].tag = bin.tag;

        });
        // remove id if tag count < 2
        this.pruneTagIndex(tagCount);
        this._dirty = 0; // set clean
        if (callback) callback(undefined, this._atlas, this._spritesheets);
        return await Promise.resolve(this);
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
    public async save (humanReadable?: boolean, pathalike?: string): Promise<boolean | string>;
    /**
     * Asycn save current project & settings to file
     *
     * @param {boolean} [humanReadable=false]
     * @param {string} [pathalike]
     * @returns {Promise<boolean>}
     * @memberof Atlasify
     */
    public async save (humanReadable: boolean = false, pathalike?: string): Promise<boolean | string> {
        const atlasBase64 = await Promise.all(this._atlas.map(async a => a.image.getBase64(JimpMime.png)));
        const atl: IAtl = {
            options: this.options,
            packer: this._packer.save(),
            spritesheets: this._spritesheets,
            atlas: this._atlas.map((a, i) => ({
                    id: a.id ? a.id : 0,
                    width: a.width,
                    height: a.height,
                    name: a.name,
                    format: "RGBA8888", // TODO
                    ext: a.ext,
                    image: atlasBase64[i]
                })),
            imagePaths: this._inputPaths
        };
        const result = humanReadable ? JSON.stringify(atl, null, 2) : JSON.stringify(atl);
        if (pathalike) {
            return new Promise((resolve) => {
                writeFile(pathalike, result, err => {
                    if (err) {
                        console.error(`Saving atl file encountered error: ${err}`);
                        resolve(false);
                    } else {
                        console.log(`Saved configuration: ${pathalike}`);
                        resolve(true);
                    }
                });
            });
        }
        return result;
    }

    public static async Load (pathalike: string, overrides: Partial<AtlasifyOptions> | null = null): Promise<Atlasify> {
        const factory = new Atlasify(new AtlasifyOptions());
        return await factory.load(pathalike, overrides);
    }

    public async load (pathalike: string, overrides: Partial<AtlasifyOptions> | null = null): Promise<Atlasify> {
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
        this._atlas = await Promise.all(atl.atlas.map(async (a, i) => 
            // async overwrite atlas base64 string image with Jimp object
             ({ ...a, image: await Jimp.read(Buffer.from(a.image.replace(/^data:image\/png;base64,/, ""), 'base64')) })
        )) as any[];
        // Load sheets
        const loaders: Array<Promise<any>> = [];
        this._spritesheets.forEach((spritesheet, i) => {
            spritesheet.rects.forEach((r: any) => {
                const sheet = Sheet.Factory(r);

                const loader = Jimp.read(sheet.url);
                loader
                    .then(image => {
                        const reloaded = new Sheet(image.bitmap.width, image.bitmap.height);
                        reloaded.data = image as any;
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
                        sheet.rot = false;

                        sheet.data = reloaded.data as any;

                        // manage option overrides
                        if (!this.options.seperateFolder && sheet.tag) delete sheet.tag;
                    })
                    .catch(error => {
                        console.error(error);
                        console.log("Fall back to pre-rendered atlas");
                        sheet.data = new Jimp({ width: sheet.width, height: sheet.height }) as any;
                        (sheet.data as any).blit({ src: this._atlas[i].image as any, x: 0, y: 0, srcX: sheet.x, srcY: sheet.y, srcW: sheet.width, srcH: sheet.height });
                        // unrotate sheets for stable result
                        sheet.rot &&= false;
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
    private readonly _debugColor = 0xff000088;

    private _atlas: Atlas[] = [];
    private _dirty = 0;

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

    private pruneTagIndex (tagCount: Record<string, number>) {
        for (const a of this._atlas) {
            const tag = a.tag ? a.tag : "_";
            if (tagCount[tag] < 1 && a.hasOwnProperty("id")) delete a.id;
            if (a.hasOwnProperty("id")) {
                a.name = `${a.name}.${a.id}`; // append index to image filename
            }
        }
        for (const s of this._spritesheets) {
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
