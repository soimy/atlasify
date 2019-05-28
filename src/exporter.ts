import Mustache from "mustache";
import { join } from "path";
import { existsSync, readFileSync } from "fs";

let list = require('../templates/list.json');

export class Exporter {

    public static setExportFormat (name: string): boolean {
        name = name.toLowerCase();
        let templatePath: string = name;
        for (let t of list) {
            if (t.type.toLowerCase() === name) {
                templatePath = join(__dirname, "../templates", t.template);
                this.ext = t.fileExt;
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

    public static getExtension(): string {
        return this.ext;
    }

    public static compile (view: any): string {
        if (!this.template) {
            // Apply default template if not set by setExportFormat
            this.template = readFileSync(join(__dirname, "../templates", "JsonHash")).toString();
        }
        return Mustache.render(this.template, view);
    }

    private static template: string;
    private static ext: string;
}
