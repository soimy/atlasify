import { Rectangle } from "maxrects-packer";
import { Vec2 } from "./vec2";
import Jimp from "jimp";
export declare class Sheet extends Rectangle {
    width: number;
    height: number;
    x: number;
    y: number;
    /**
     * sprite name, normally filename before packing
     *
     * if `Atlasify.Options.basenameOnly = true` there will be no extension.
     *
     * if `Atlasify.Options.appendPath = true` name will include relative path.
     *
     * @type {string}
     * @memberof Sheet
     */
    name: string;
    /**
     * frame rectangle to be rendered to final atlas
     *
     * @type {Rectangle}
     * @memberof Sheet
     */
    frame: Rectangle;
    /**
     * orignal source rectangle
     *
     * `x` and `y` refer to the negative offset from the frame rectangle
     *
     * @type {Rectangle}
     * @memberof Sheet
     */
    sourceFrame: Rectangle;
    /**
     * anchor/pivot point
     *
     * @type {Vec2}
     * @memberof Sheet
     */
    anchor: Vec2;
    /**
     * 9-sliced center rectangle
     *
     * @type {Rectangle}
     * @memberof Sheet
     */
    nineSliceFrame: Rectangle;
    /**
     * alpha trimmed
     *
     * @type {boolean}
     * @memberof Sheet
     */
    trimmed: boolean;
    /**
     * image data object
     *
     * @type {Jimp}
     * @memberof Sheet
     */
    data: Jimp;
    /**
     * for controlling mustache template trailing comma, don't touch
     *
     * @type {boolean}
     * @memberof Sheet
     */
    last: boolean;
    /**
     * Creates an instance of Sheet extends `MaxrectsPacker.Rectangle`
     *
     * @param {number} [width=0] width of sheet
     * @param {number} [height=0] height of sheet
     * @param {number} [x=0] position x of sheet
     * @param {number} [y=0] position y of sheet
     * @param {boolean} [rot=false] whether sheet is rotated
     * @memberof Sheet
     */
    constructor(width?: number, height?: number, x?: number, y?: number, rot?: boolean);
    /**
     * Crop surrounding transparent pixels
     *
     * @param {number} [tolerance=0] treat alpha less than this as transparent
     * @returns {void}
     * @memberof Sheet
     */
    trimAlpha(tolerance?: number): void;
    /**
     * Extrude edge pixels. Should `trimAlpha` first
     *
     * @param {number} border extrude pixels
     * @memberof Sheet
     */
    extrude(border: number): void;
    /**
     * Rotate image data 90-degree CW, and swap width/height
     *
     * note: rotate is done automaticly when `Sheet.rot` set to `true`, normally
     * you don't need to do this manually unless you know what you are doing.
     *
     * @memberof Sheet
     */
    rotate(): void;
    private _border;
    private _rotated;
    /**
     * Status from packer whether `Sheet` should be rotated.
     *
     * note: if `rot` set to `true`, image data will be rotated automaticlly,
     * and `width/height` is swaped.
     *
     * @type {boolean}
     * @memberof Sheet
     */
    rot: boolean;
    private alphaScanner;
    private getChannelIndex;
}
