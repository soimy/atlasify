import Mustache from "mustache";
import { join } from "path";
import { existsSync, readFileSync } from "fs";

let list = require('../templates/list.json');

export interface ExporterView {
    spritesheets: any[];
    meta: {
        app: string;
        version: string;
        image: string;
        format: string;
        size: { w: number, h: number };
        scale: string;
    };
}

export class Exporter {

    public setExportFormat (name: string): boolean {
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

    public getExtension (): string {
        return this.ext;
    }

    public compile (view: ExporterView): string {
        if (!this.template) {
            // Apply default template if not set by setExportFormat
            this.template = readFileSync(join(__dirname, "../templates", "JsonHash")).toString();
        }
        return Mustache.render(this.template, view);
    }

    private template: string = "";
    private ext: string = "json";
}
