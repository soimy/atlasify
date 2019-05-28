import { Rectangle } from "maxrects-packer";
import { Vec2 } from "./Vec2";
import Jimp from "jimp";

export class Sheet extends Rectangle {

    public name: string = "";
    public frame: Rectangle;
    public sourceFrame: Rectangle;
    public anchor: Vec2;
    public nineSliceFrame: Rectangle;
    public trimmed: boolean = false;
    public data: Jimp;
    public last: boolean = false; // For controlling mustache trailing comma

    constructor (
        public width: number = 0,
        public height: number = 0,
        public x: number = 0,
        public y: number = 0,
        public rot: boolean = false
    ) {
        super();
        this.frame = new Rectangle(width, height);
        this.sourceFrame = new Rectangle(width, height);
        this.anchor = new Vec2(width / 2, height / 2);
        this.nineSliceFrame = new Rectangle(width, height);
        this.data = new Jimp(width, height);
    }

    public trimAlpha (): void {
        // TODO
        this.trimmed = true;
    }

    public extrude (border: number): void {
        // TODO
    }

    public rotate (): void {
        this.rot = true;
    }
}
