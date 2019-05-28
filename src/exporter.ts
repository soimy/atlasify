import Mustache from "mustache";
import { join } from "path";
import { existsSync, readFileSync } from "fs";
import { Bin } from "maxrects-packer";

let list = require('../templates/list.json');

export class Exporter {
    static template: string;

    public static setExportFormat (name: string): boolean {
        name = name.toLowerCase();
        let templatePath: string = name;
        for (let t of list) {
            if (t.type.toLowerCase() === name) {
                templatePath = join(__dirname, t.template);
                break;
            }
        }
        if (!existsSync(templatePath)) {
            console.error(`Spritesheet template [${templatePath}] not found.`);
            return false;
        }
        this.template = readFileSync(templatePath).toString();
        return true;
    }

    public static compile (bin: Bin): string {
        if (!this.template) {
            // Apply default template if not set by setExportFormat
            this.template = readFileSync(join(__dirname,'JsonHash')).toString();
        }
        return Mustache.render(this.template, bin);
    }

}
