![Atlasify](https://github.com/soimy/atlasify/blob/master/media/title.png?raw=true)

## What is Atlasify

Atlasify is an open-source app designed to pack graphical assets like

- sprite images
- textures
- Bitmap fonts
- True-type fonts
- Vector graphics (SVG)

into a single/several GPU friendly texture atlas to reduce drawcall, and a spritesheet catalog `json\xml` to locate those assets.

![demo](https://github.com/soimy/atlasify/blob/master/assets/demo.jpg?raw=true)

## Why Atlasify

Yes, there are many excellent packing tools like Texture packer etc. already. But the goal of Atlasify is being able to managing, generating and packing all kinds of graphical assets like above into a single atlas in one application. 

Together with proper render pipline, this will be a perfect solution for rendering GPU accelerated vector and true-type text on any game engine.

And most of all, it will be **free and open source**.

## The architecture

Atlasify's pipeline contain four kinds of modules:

### Generators

Reading different input data and generate Array of `Buffer` & `Metric` for the core controller. `Buffer`containing image data and `Metric` containing sizing & spacing of the `Buffer`. Currently scheduled generators:

- PNG/Jpeg image reader Through file I/O & [Jimp](https://github.com/oliver-moran/jimp)
- Multi-signed distance field font renderer [msdf-bmfont-xml](https://github.com/soimy/msdf-bmfont-xml)

### Core

[Core module](https://github.com/soimy/atlasify) to control the whole pipeline:

1. Calling the generators and get the `Buffer` & `Metric`; 
2. Doing `Buffer` post-processing like `TrimAlpha` & `Extrude Edge`;
3. Calling Packer to process the `Metric` and composing the `Buffer` onto the atlas;
4. Generate the `spritesheet`data object;
5. Calling the Exporter to compile the `spritesheet` onto different templates;

### GUI

Of cause, GUI. Will be Electron based, cross-platform. If I have time for that;-)

### Packer

Atlasify uses [maxrects-packer](https://github.com/soimy/maxrects-packer) to calculate sheets position & rotation on the atlas using Maximum Rectangle Algorithm (Same as TexturePacker).

### Exporter

Almost every game engine has it's own data structure to represent the spritesheets, Exportors use [mustache.js](http://mustache.github.com/) template system, so it's highly customizalbe through modifying `mst` template files. Atlasify supports these types out-of-the-box:

- bmfont/xml
- json (font)
- jsonHash (TexturePacker)
- jsonArray (TexturePacker)
- Cocos2d
- Phaser3
- Spine
- Starling
- UIKit
- Unreal

### Engine plugins

Atlasify extends the "standard" TexturePacker data structure to better utilize the power of GPU accelerated asset rendering like `multi-channel` & `multi-page`, and most importantly, MSDF (multi-signed distance field) based vector object. Many game engine don't support these feature yet, so it's important to implement plugins for them. (Coming soon)

# Core module

![npm version](https://badge.fury.io/js/atlasify.svg)
![npm type definitions](https://shields-staging.herokuapp.com/npm/types/atlasify.svg)

CLI and core module for atlasify texture packer
