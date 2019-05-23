import { Rectangle } from "maxrects-packer/lib/geom/Rectangle";
import { Vec2 } from "./Vec2";
import Jimp from "jimp";

export class Sheet extends Rectangle {

    public name: string = "";
    public sourceFrame: Rectangle;
    public anchor: Vec2;
    public nineSliceFrame: Rectangle;
    public trimmed: boolean = false;
    public data: Jimp;

    constructor (
        public width: number = 0,
        public height: number = 0,
        public x: number = 0,
        public y: number = 0,
        public rot: boolean = false
    ) {
        super();
        this.sourceFrame = new Rectangle(0, 0, width, height);
        this.anchor = new Vec2(width / 2, height / 2);
        this.nineSliceFrame = new Rectangle(0, 0, width, height);
        this.data = new Jimp(width, height);
    }

    public trimAlpha (): void {
        // TODO
        this.trimmed = true;
    }

    public rotate (): void {
        this.rot = true;
    }
}