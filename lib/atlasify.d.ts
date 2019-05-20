import { IOption } from "maxrects-packer";
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
export declare class Options implements IOption {
    name: string;
    width: number;
    height: number;
    padding: number;
    smart: boolean;
    pot: boolean;
    square: boolean;
    allowRotation: boolean;
    trimAlpha: boolean;
    extrudeEdge: number;
    /**
     * Creates an instance of Options.
     * @param {string} [name='sprite'] output filename of atlas/spreadsheet (default is 'sprite.png')
     * @param {number} [width=2048] ouput texture atlas width (defaut: 2048)
     * @param {number} [height=2048] ouput texture atlas height (defaut: 2048)
     * @param {number} [padding=0] padding between images (Default: 0)
     * @memberof Options
     */
    constructor(name?: string, width?: number, height?: number, padding?: number);
}
export declare class Atlasify {
    options: Options;
    constructor(options: Options);
    load(paths: string[]): void;
    private imageFilePaths;
    private rects;
    private packer;
}
