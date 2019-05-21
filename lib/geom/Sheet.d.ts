import { Rectangle } from "maxrects-packer/lib/geom/Rectangle";
import { Vec2 } from "./Vec2";
import Jimp from "jimp";
export declare class Sheet extends Rectangle {
    name: string;
    x: number;
    y: number;
    width: number;
    height: number;
    rot: boolean;
    sourceFrame: Rectangle;
    anchor: Vec2;
    nineSliceFrame: Rectangle;
    trimmed: boolean;
    data: Jimp;
    constructor(name: string, x: number, y: number, width: number, height: number, rot?: boolean);
}
