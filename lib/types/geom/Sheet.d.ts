import { Rectangle } from "maxrects-packer";
import { Vec2 } from "./Vec2";
import Jimp from "jimp";
export declare class Sheet extends Rectangle {
    width: number;
    height: number;
    x: number;
    y: number;
    rot: boolean;
    name: string;
    sourceFrame: Rectangle;
    anchor: Vec2;
    nineSliceFrame: Rectangle;
    trimmed: boolean;
    data: Jimp;
    constructor(width?: number, height?: number, x?: number, y?: number, rot?: boolean);
    trimAlpha(): void;
    rotate(): void;
}
