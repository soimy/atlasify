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
    frame: Rectangle;
    sourceFrame: Rectangle;
    anchor: Vec2;
    nineSliceFrame: Rectangle;
    trimmed: boolean;
    data: Jimp;
    last: boolean;
    constructor(width?: number, height?: number, x?: number, y?: number, rot?: boolean);
    trimAlpha(): void;
    extrude(border: number): void;
    rotate(): void;
}
