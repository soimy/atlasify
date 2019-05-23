#!/usr/bin/env node

const pjson = require('../package.json');
const commander = require('commander');
const fs = require('fs');
const path = require('path');
const utils = require('./utils');
const atlasify = require('../lib/atlasify').Atlasify;
const option = require('../lib/atlasify').Options;
const ext = ["jpg", "jpeg", "png"];

let imageFiles = [];

const cli = new commander.Command();
cli
    .version('MaxRectsPacker v' + pjson.version)
    .usage('[options] <image-files/folder>')
    .arguments('<image-files/folder>')
    .description('CLI tools to packing and compositing image files into atlas using MaxRects packing algorithm')
    .option('-o, --output <filename>', 'output atlas filename (Default: sprite.png)', 'sprite.png')
    .option('-m, --size <w,h>', 'ouput texture atlas size (defaut: 2048,2048)', v => { return v.split(',') }, [2048, 2048])
    .option('-p, --padding <n>', 'padding between images (Default: 0)', 0)
    .option('-a, --auto-size', 'shrink atlas to the smallest possible square (Default: true)', true)
    .option('-t, --pot', 'atlas size shall be power of 2 (Default: true)', true)
    .option('-s, --square', 'atlas size shall be square (Default: false)', false)
    .option('-r, --rot', 'allow 90-degree rotation while packing (Default: false)', false)
    
    cli
    .command("*")
    .action((...filesOrFolder) => {
        let inputFiles = [];
        filesOrFolder.forEach(filePath => {
            if (typeof(filePath) === "object") return;
            if (fs.statSync(filePath).isDirectory()) {
                inputFiles = inputFiles.concat(utils.getAllFiles(filePath));
            } else 
                inputFiles.push(filePath);
        });
        for (let inputFile of inputFiles) {
            const extname = path.extname(inputFile).slice(1).toLowerCase();
            if (fs.existsSync(inputFile) && ext.includes(extname)) {
                console.log("+" + extname + " : " + inputFile);
                imageFiles.push(inputFile);
            }
        }
        console.log("Total " + imageFiles.length + " files added.");
    })

cli.parse(process.argv);

//
//  Initialize options
//
let opt = cli.opts();
utils.roundAllValue(opt); // Cast string parameters to number
if (!imageFiles) {
    args.outputHelp();
    process.exit(1);
}

//
// Set default value
// Because commander.js not parse default boolean parameter
//
opt.autoSize = utils.valueQueue([opt.autoSize, true]);
opt.pot = utils.valueQueue([opt.pot, true]);
opt.square = utils.valueQueue([opt.square, false]);
opt.rot = utils.valueQueue([opt.rot, false]);

//
// Load images into Rectangle objects
//
const atlasifyOptions = new option(opt.output, opt.size[0], opt.size[1], opt.padding);
atlasifyOptions.name = opt.output;
atlasifyOptions.smart = opt.autoSize;
atlasifyOptions.pot = opt.pot;
atlasifyOptions.square = opt.square;
atlasifyOptions.allowRotation = opt.rot;

//
// Display options
//
const keys = Object.keys(atlasifyOptions);
const padding = utils.longestLength(keys) + 2;
console.log("\nUsing following settings");
console.log("========================================");
keys.forEach(key => {
    console.log(utils.pad(key, padding) + ": " + atlasifyOptions[key]);
});
console.log("========================================");

const atlas = new atlasify(atlasifyOptions);
atlas.load(imageFiles);