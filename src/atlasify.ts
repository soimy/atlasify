import { MaxRectsPacker, IOption } from "maxrects-packer";
import { Rectangle } from "maxrects-packer/lib/geom/Rectangle";
import { IBin, Bin } from "maxrects-packer/lib/abstract_bin";
import Jimp from "jimp";
import path from "path";
import { Vec2 } from "./geom/Vec2";
import { Rect } from "./geom/Rect";

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
    public trimAlpha: boolean = false; // TODO
    public extrudeEdge: number = 0; // TODO

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
        public padding: number = 0
    ) { }
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
        this.packer = new MaxRectsPacker(options.width, options.height, options.padding, options);
    }

   /**
    * Load arrays of pathalike images url and do packing
    * @param {string[]} paths pathalike urls
    * @memberof Atlasify
    */
    public load (paths: string[]): void {
        this.imageFilePaths = paths;
        const loader: Promise<void>[] = paths.map(async img => {
            return Jimp.read(img)
                .then(image => {
                    const rect: Rect = new Rect(path.basename(img), 0, 0, image.bitmap.width, image.bitmap.height);
                    rect.data = image;
                    this.rects.push(rect);
                })
                .catch(err => {
                    console.error("File read error : " + err);
                });
        });
        Promise.all(loader)
            .then(() => {
                this.packer.addArray(this.rects);
                this.packer.bins.forEach((bin: Bin, index: number) => {
                    const ext: string = path.extname(this.options.name);
                    const basename: string = path.basename(this.options.name, ext);
                    const binName: string = this.packer.bins.length > 1 ? `${basename}.${index}${ext}` : `${basename}${ext}`;
                    const fillColor: number = (ext === ".png" || ext === ".PNG") ? 0x00000000 : 0x000000ff;
                    const image = new Jimp(bin.width, bin.height, fillColor);
                    bin.rects.forEach(rect => {
                        const buffer: Jimp = rect.data;
                        if (rect.rot) buffer.rotate(90);
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

    private imageFilePaths: string[];
    private rects: Rectangle[];
    private packer: MaxRectsPacker;
}
