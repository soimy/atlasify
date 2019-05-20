import { Rectangle } from "maxrects-packer/lib/geom/Rectangle";
import { Vec2 } from "./Vec2";
import Jimp from "jimp";

export class Rect extends Rectangle {

    public sourceFrame: Rectangle;
    public anchor: Vec2;
    public nineSliceFrame: Rectangle;
    public trimmed: boolean = false;
    public data: Jimp;

    constructor (
        public name: string,
        public x: number,
        public y: number,
        public width: number,
        public height: number,
        public rot: boolean = false
    ) {
        super();
        this.sourceFrame = new Rectangle(0, 0, width, height);
        this.anchor = new Vec2(width / 2, height / 2);
        this.nineSliceFrame = new Rectangle(0, 0, width, height);
        this.data = new Jimp(width, height);
    }
}