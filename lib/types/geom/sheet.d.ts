import { Rectangle } from "maxrects-packer";
import { Vec2 } from "./vec2";
import Jimp from "jimp";
export declare class Sheet extends Rectangle {
    width: number;
    height: number;
    x: number;
    y: number;
    rot: boolean;
    /**
     * sprite name, normally filename before packing
     * if `Atlasify.Options.basenameOnly = true` there will be no extension.
     * if `Atlasify.Options.appendPath = true` name will include relative path.
     * @type {string}
     * @memberof Sheet
     */
    name: string;
    /**
     * frame rectangle to be rendered to final atlas
     * @type {Rectangle}
     * @memberof Sheet
     */
    frame: Rectangle;
    /**
     * orignal source rectangle
     * @type {Rectangle}
     * @memberof Sheet
     */
    sourceFrame: Rectangle;
    /**
     * anchor/pivot point
     * @type {Vec2}
     * @memberof Sheet
     */
    anchor: Vec2;
    /**
     * 9-sliced center rectangle
     * @type {Rectangle}
     * @memberof Sheet
     */
    nineSliceFrame: Rectangle;
    /**
     * alpha trimmed
     * @type {boolean}
     * @memberof Sheet
     */
    trimmed: boolean;
    /**
     * image data object
     * @type {Jimp}
     * @memberof Sheet
     */
    data: Jimp;
    /**
     * for controlling mustache template trailing comma, don't touch
     * @type {boolean}
     * @memberof Sheet
     */
    last: boolean;
    constructor(width?: number, height?: number, x?: number, y?: number, rot?: boolean);
    trimAlpha(): void;
    extrude(border: number): void;
    rotate(): void;
    private alphaScanner;
    private getChannelIndex;
}
