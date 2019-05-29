"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mustache_1 = __importDefault(require("mustache"));
const path_1 = require("path");
const fs_1 = require("fs");
let list = require('../templates/list.json');
class Exporter {
    constructor() {
        this.template = "";
        this.ext = "json";
    }
    setExportFormat(name) {
        name = name.toLowerCase();
        let templatePath = name;
        for (let t of list) {
            if (t.type.toLowerCase() === name) {
                templatePath = path_1.join(__dirname, "../templates", t.template);
                this.ext = t.fileExt;
                break;
            }
        }
        if (!fs_1.existsSync(templatePath)) {
            console.error(`Spritesheet template [${templatePath}] not found.`);
            return false;
        }
        this.template = fs_1.readFileSync(templatePath).toString();
        return true;
    }
    getExtension() {
        return this.ext;
    }
    compile(view) {
        if (!this.template) {
            // Apply default template if not set by setExportFormat
            this.template = fs_1.readFileSync(path_1.join(__dirname, "../templates", "JsonHash")).toString();
        }
        return mustache_1.default.render(this.template, view);
    }
}
exports.Exporter = Exporter;
//# sourceMappingURL=exporter.js.map