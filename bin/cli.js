#!/usr/bin/env node

const pjson = require('../package.json');
const commander = require('commander');
const fs = require('fs');
const path = require('path');
const utils = require('./utils');
const core = require('../lib/atlasify');
const ext = ["jpg", "jpeg", "png"];

let imageFiles = [];

const cli = new commander.Command();
cli
    .version('MaxRectsPacker v' + pjson.version)
    .usage('[options] <image-files/folder>')
    .arguments('<image-files/folder>')
    .description('CLI tools to packing and compositing image files into atlas using MaxRects packing algorithm')
    .option('-o, --output <filename>', 'output atlas filename (Default: sprite.png)', 'sprite.png')
    .option('    --load <filename>', 'load saved project atl file')
    .option('-m, --size <w,h>', 'ouput texture atlas size (defaut: 2048,2048)', v => { return v.split(',') }, [2048, 2048])
    .option('-p, --padding <n>', 'padding between images (Default: 0)', 0)
    .option('-b, --border <n>', 'space to atlas edge (Default: 0)', 0)
    .option('-a, --auto-size', 'shrink atlas to the smallest possible square (Default: false)', false)
    .option('-t, --pot', 'atlas size shall be power of 2 (Default: false)', false)
    .option('-s, --square', 'atlas size shall be square (Default: false)', false)
    .option('-r, --rot', 'allow 90-degree rotation while packing (Default: false)', false)
    .option('    --trim [n]', 'remove surrounding transparent pixels with optional tolerence [n] (Default: false)', false)
    .option('    --extrude <n>', 'extrude edge pixels (Default: 0)', 0)
    .option('    --debug', 'draw debug gizmo on atlas (Default: false)', false)
    .option('    --instant', 'instant packing is quicker and skip sorting (Default: false)', false)
    .option('    --seperate-folder', 'Seperate bin based on folder (Default: false)', false)
    .option('    --save', 'Save configuration for reuse (Default: false)', false)
    
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
opt.autoSize = utils.valueQueue([opt.autoSize, false]);
opt.pot = utils.valueQueue([opt.pot, false]);
opt.square = utils.valueQueue([opt.square, false]);
opt.rot = utils.valueQueue([opt.rot, false]);
opt.trim = utils.valueQueue([opt.trim, false]);
opt.debug = utils.valueQueue([opt.debug, false]);
opt.instant = utils.valueQueue([opt.instant, false]);
opt.seperateFolder = utils.valueQueue([opt.seperateFolder, false]);
opt.save = utils.valueQueue([opt.save, false]);

//
// Load images into Rectangle objects
//
const atlasifyOptions = new core.Options(opt.output, opt.size[0], opt.size[1], opt.padding);
atlasifyOptions.name = opt.output;
atlasifyOptions.smart = opt.autoSize;
atlasifyOptions.pot = opt.pot;
atlasifyOptions.square = opt.square;
atlasifyOptions.allowRotation = opt.rot;
atlasifyOptions.border = opt.border;
atlasifyOptions.trimAlpha = opt.extrude > 0 ? true : opt.trim !== false ? true : false;
atlasifyOptions.alphaTolerence = utils.isNumeric(opt.trim) ? opt.trim : 0;
atlasifyOptions.debug = opt.debug;
atlasifyOptions.extrude = opt.extrude;
atlasifyOptions.instant = opt.instant;
atlasifyOptions.seperateFolder = opt.seperateFolder;

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

const atlas = new core.Atlasify(atlasifyOptions);
imageFiles.sort((a, b) => {
    const af = utils.getLeafFolder(a);
    const bf = utils.getLeafFolder(b);
    return af > bf ? 1 : -1;
});

if (opt.load) {
    console.log(`Loading project file: ${opt.load}`);
    atlas.load(opt.load, atlasifyOptions, false)
        .then(atlas => atlas.addURLs(imageFiles).then(result => fileIO(result)));
} else atlas.addURLs(imageFiles).then(result => fileIO(result));

function fileIO(result) {
    for (let a of result.atlas) {
        const imageName = a.id ? `${a.name}.${a.id}.${a.ext}` : `${a.name}.${a.ext}`
        a.image.writeAsync(imageName)
        .then(() => {
            console.log(`Saved atlas: ${imageName}`);
        })
        .catch(err => {
            console.error(`Failed saving atlas ${imageName}: ${err}`);
        });
    }
    for (let s of result.spritesheets) {
        const sheetName = s.id ? `${s.name}.${s.id}.${s.ext}` : `${s.name}.${s.ext}`;
        fs.writeFile(sheetName, result.exporter.compile(s), 'utf-8', err => {
            if(err) console.error(`Failed saving spritesheet ${sheetName}: ${err}`);
            else console.log(`Saved spritesheet: ${sheetName}`);
        });
    }
    if (opt.save) {
        let atlPath = result.options.name;
        const dir = path.dirname(atlPath);
        atlPath = path.basename(atlPath, path.extname(atlPath)) + ".atl";
        atlPath = path.join(dir, atlPath);
        result.save(true).then(atl => {
            fs.writeFile(atlPath, atl, 'utf-8', err => {
                if(err) console.error(`Failed saving configuration ${atlPath}: ${err}`);
                else console.log(`Saved configuration: ${atlPath}`);
            });
        })
        .catch(console.error);
    }
}
