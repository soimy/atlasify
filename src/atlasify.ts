import { MaxRectsPacker, IOption } from "maxrects-packer";
import Jimp from "jimp";
import path from "path";
import fs from "fs";
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

    public smart: boolean = true;
    public pot: boolean = true;
    public square: boolean = false;
    public allowRotation: boolean = false;
    public trimAlpha: boolean = false;
    public extrudeEdge: number = 0; // TODO
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

export interface ITemplateView {
    imageName: string;
    width: number;
    height: number;
    format: string;
    scale: number;
    rects: Sheet[];
    appInfo: any;
    base64Data?: IBase64Data;
}

export interface IBase64Data {
    prefix: string;
    data: string;
}

export class Atlasify {

   /**
    * Creates an instance of Atlasify.
    * @param {Options} options Atlasify Options class
    * @memberof Atlasify
    */
    constructor (public options: Options) {
        this.imageFilePaths = [];
        this.rects = [];
        this.packer = new MaxRectsPacker<Sheet>(options.width, options.height, options.padding, options);
    }

   /**
    * Load arrays of pathalike images url and do packing
    * @param {string[]} paths pathalike urls
    * @memberof Atlasify
    */
    public load (paths: string[]): void {
        this.imageFilePaths = paths;
        const output = new Exporter();
        output.setExportFormat(this.options.type);
        const loader: Promise<void>[] = paths.map(async img => {
            return Jimp.read(img)
                .then(image => {
                    const sheet: Sheet = new Sheet(image.bitmap.width, image.bitmap.height);
                    sheet.data = image;
                    sheet.name = path.basename(img);
                    if (this.options.trimAlpha) sheet.trimAlpha();
                    this.rects.push(sheet);
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

                this.packer.addArray(this.rects);
                this.packer.bins.forEach((bin, index: number) => {
                    const binName: string = this.packer.bins.length > 1 ? `${basename}.${index}${ext}` : `${basename}${ext}`;
                    const image = new Jimp(bin.width, bin.height, fillColor);
                    // Add tag to the last sheet to control mustache trailing comma
                    bin.rects[bin.rects.length - 1].last = true;
                    bin.rects.forEach(rect => {
                        const sheet = rect as Sheet;
                        const buffer: Jimp = sheet.data;
                        if (sheet.rot) buffer.rotate(90);
                        if (this.options.debug) {
                            const debugFrame = new Jimp(sheet.frame.width, sheet.frame.height, this.debugColor);
                            image.blit(debugFrame, sheet.x, sheet.y);
                        }
                        image.blit(buffer, sheet.x, sheet.y, sheet.frame.x, sheet.frame.y, sheet.frame.width, sheet.frame.height);
                    });
                    image.write(binName, () => {
                        console.log('Wrote atlas image : ' + binName);
                    });
                    const view: ITemplateView = {
                        imageName: binName,
                        width: bin.width,
                        height: bin.height,
                        format: "RGBA8888",
                        scale: 1,
                        rects: bin.rects as Sheet[],
                        appInfo: appInfo
                    };
                    fs.writeFileSync(`${basename}.json`, output.compile(view));
                    console.log('Wrote spritesheet : ' + basename + "." + output.getExtension());
                });
            })
            .catch(err => {
                console.error("File load error : " + err);
            });
    }

    private imageFilePaths: string[];
    private rects: Sheet[];
    private packer: MaxRectsPacker;
    private debugColor: number = 0xff000088;
}
