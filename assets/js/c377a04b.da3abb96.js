"use strict";(self.webpackChunkwebsite=self.webpackChunkwebsite||[]).push([[971],{3905:function(e,t,a){a.d(t,{Zo:function(){return u},kt:function(){return d}});var n=a(7294);function l(e,t,a){return t in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a,e}function r(e,t){var a=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),a.push.apply(a,n)}return a}function i(e){for(var t=1;t<arguments.length;t++){var a=null!=arguments[t]?arguments[t]:{};t%2?r(Object(a),!0).forEach((function(t){l(e,t,a[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(a)):r(Object(a)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(a,t))}))}return e}function o(e,t){if(null==e)return{};var a,n,l=function(e,t){if(null==e)return{};var a,n,l={},r=Object.keys(e);for(n=0;n<r.length;n++)a=r[n],t.indexOf(a)>=0||(l[a]=e[a]);return l}(e,t);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);for(n=0;n<r.length;n++)a=r[n],t.indexOf(a)>=0||Object.prototype.propertyIsEnumerable.call(e,a)&&(l[a]=e[a])}return l}var s=n.createContext({}),p=function(e){var t=n.useContext(s),a=t;return e&&(a="function"==typeof e?e(t):i(i({},t),e)),a},u=function(e){var t=p(e.components);return n.createElement(s.Provider,{value:t},e.children)},m={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},c=n.forwardRef((function(e,t){var a=e.components,l=e.mdxType,r=e.originalType,s=e.parentName,u=o(e,["components","mdxType","originalType","parentName"]),c=p(a),d=l,f=c["".concat(s,".").concat(d)]||c[d]||m[d]||r;return a?n.createElement(f,i(i({ref:t},u),{},{components:a})):n.createElement(f,i({ref:t},u))}));function d(e,t){var a=arguments,l=t&&t.mdxType;if("string"==typeof e||l){var r=a.length,i=new Array(r);i[0]=c;var o={};for(var s in t)hasOwnProperty.call(t,s)&&(o[s]=t[s]);o.originalType=e,o.mdxType="string"==typeof e?e:l,i[1]=o;for(var p=2;p<r;p++)i[p]=a[p];return n.createElement.apply(null,i)}return n.createElement.apply(null,a)}c.displayName="MDXCreateElement"},1269:function(e,t,a){a.r(t),a.d(t,{frontMatter:function(){return o},contentTitle:function(){return s},metadata:function(){return p},toc:function(){return u},default:function(){return c}});var n=a(7462),l=a(3366),r=(a(7294),a(3905)),i=["components"],o={id:"index",title:"atlasify",slug:"/",sidebar_label:"Readme",sidebar_position:0,custom_edit_url:null},s="![Atlasify](https://github.com/soimy/atlasify/blob/master/media/title.png?raw=true)",p={unversionedId:"index",id:"index",title:"atlasify",description:"npm version",source:"@site/docs/index.md",sourceDirName:".",slug:"/",permalink:"/atlasify/docs/",editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"index",title:"atlasify",slug:"/",sidebar_label:"Readme",sidebar_position:0,custom_edit_url:null},sidebar:"tutorialSidebar",next:{title:"Exports",permalink:"/atlasify/docs/modules"}},u=[{value:"What is Atlasify",id:"what-is-atlasify",children:[],level:2},{value:"Why Atlasify",id:"why-atlasify",children:[],level:2},{value:"The architecture",id:"the-architecture",children:[{value:"Controller",id:"controller",children:[],level:3},{value:"Generators",id:"generators",children:[],level:3},{value:"Post-Processor",id:"post-processor",children:[],level:3},{value:"Core",id:"core",children:[],level:3},{value:"Packer",id:"packer",children:[],level:3},{value:"Exporter",id:"exporter",children:[],level:3},{value:"Engine plugins",id:"engine-plugins",children:[],level:3}],level:2},{value:"Installation",id:"installation",children:[],level:2},{value:"Usage (CLI)",id:"usage-cli",children:[],level:2},{value:"Module quick start",id:"module-quick-start",children:[],level:2},{value:"API Reference",id:"api-reference",children:[],level:2}],m={toc:u};function c(e){var t=e.components,a=(0,l.Z)(e,i);return(0,r.kt)("wrapper",(0,n.Z)({},m,a,{components:t,mdxType:"MDXLayout"}),(0,r.kt)("h1",{id:"atlasify"},(0,r.kt)("img",{parentName:"h1",src:"https://github.com/soimy/atlasify/blob/master/media/title.png?raw=true",alt:"Atlasify"})),(0,r.kt)("p",null,(0,r.kt)("img",{parentName:"p",src:"https://badge.fury.io/js/atlasify.svg",alt:"npm version"}),"\n",(0,r.kt)("img",{parentName:"p",src:"https://shields-staging.herokuapp.com/npm/types/atlasify.svg",alt:"npm type definitions"})),(0,r.kt)("h2",{id:"what-is-atlasify"},"What is Atlasify"),(0,r.kt)("p",null,"Atlasify is an open-source app designed to pack graphical assets like"),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},"sprite images"),(0,r.kt)("li",{parentName:"ul"},"textures"),(0,r.kt)("li",{parentName:"ul"},"Bitmap fonts"),(0,r.kt)("li",{parentName:"ul"},"True-type fonts"),(0,r.kt)("li",{parentName:"ul"},"Vector graphics (SVG)")),(0,r.kt)("p",null,"into a single/several GPU friendly texture atlas to reduce draw call, and a spritesheet catalog ",(0,r.kt)("inlineCode",{parentName:"p"},"json\\xml")," to locate those assets."),(0,r.kt)("p",null,(0,r.kt)("img",{parentName:"p",src:"https://github.com/soimy/atlasify/blob/master/assets/demo.jpg?raw=true",alt:"demo"})),(0,r.kt)("h2",{id:"why-atlasify"},"Why Atlasify"),(0,r.kt)("p",null,"Yes, there are many excellent packing tools like Texture packer etc. already. But the goal of Atlasify is being able to managing, generating and packing all kinds of graphical assets like above into a single atlas in one application."),(0,r.kt)("p",null,"Together with proper render pipeline, this will be a perfect solution for rendering GPU accelerated vector and true-type text on any game engine."),(0,r.kt)("p",null,"And most of all, it will be ",(0,r.kt)("strong",{parentName:"p"},"free and open source"),"."),(0,r.kt)("h2",{id:"the-architecture"},"The architecture"),(0,r.kt)("p",null,(0,r.kt)("img",{parentName:"p",src:"https://github.com/soimy/atlasify/blob/master/assets/architecture.png?raw=true",alt:"Architecture"})),(0,r.kt)("blockquote",null,(0,r.kt)("p",{parentName:"blockquote"},"Proposal Map, modules marked as \u2611\ufe0f is implemented.")),(0,r.kt)("p",null,"Atlasify's pipeline contain these kinds of modules:"),(0,r.kt)("h3",{id:"controller"},"Controller"),(0,r.kt)("p",null,"Controllers get input assets and settings from user, and start the whole packing process. Controllers will have the following forms:"),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("strong",{parentName:"li"},"GUI")," Of cause! Will be Electron based, cross-platform, separated module. (Working in progress)"),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("strong",{parentName:"li"},"WebAPI")," More accessible from the internet. (Planned)"),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("strong",{parentName:"li"},"CLI")," Command-line interface for terminal user & CI automation. (Implemented)")),(0,r.kt)("h3",{id:"generators"},"Generators"),(0,r.kt)("p",null,"Reading different input data and generate Array of ",(0,r.kt)("inlineCode",{parentName:"p"},"Buffer")," & ",(0,r.kt)("inlineCode",{parentName:"p"},"Metric")," for the core controller. ",(0,r.kt)("inlineCode",{parentName:"p"},"Buffer"),"containing image data and ",(0,r.kt)("inlineCode",{parentName:"p"},"Metric")," containing sizing & spacing of the ",(0,r.kt)("inlineCode",{parentName:"p"},"Buffer"),". Currently scheduled generators:"),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},"PNG/Jpeg image reader Through file I/O & ",(0,r.kt)("a",{parentName:"li",href:"https://github.com/oliver-moran/jimp"},"Jimp")),(0,r.kt)("li",{parentName:"ul"},"Multi-signed distance field font renderer ",(0,r.kt)("a",{parentName:"li",href:"https://github.com/soimy/msdf-bmfont-xml"},"msdf-bmfont-xml"),(0,r.kt)("blockquote",{parentName:"li"},(0,r.kt)("p",{parentName:"blockquote"},(0,r.kt)("inlineCode",{parentName:"p"},"msdf-bmfont-xml")," will be depreciated when Atlasify is finished. I'm planning to rewrite msdf generator as a separate module using Rust.")))),(0,r.kt)("h3",{id:"post-processor"},"Post-Processor"),(0,r.kt)("p",null,"Store ",(0,r.kt)("inlineCode",{parentName:"p"},"Buffer")," & ",(0,r.kt)("inlineCode",{parentName:"p"},"Metric")," as ",(0,r.kt)("inlineCode",{parentName:"p"},"Sheet")," object and do the following manipulation based on settings:"),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},"TrimAlpha"),(0,r.kt)("li",{parentName:"ul"},"Extrude edge pixels"),(0,r.kt)("li",{parentName:"ul"},"Split/Composite ARGB channels"),(0,r.kt)("li",{parentName:"ul"},"Rotation")),(0,r.kt)("h3",{id:"core"},"Core"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"https://github.com/soimy/atlasify"},"Core module")," to control the whole pipeline:"),(0,r.kt)("ol",null,(0,r.kt)("li",{parentName:"ol"},"Aquire settings from front-end(CLI, GUI)"),(0,r.kt)("li",{parentName:"ol"},"Store array of ",(0,r.kt)("inlineCode",{parentName:"li"},"Buffer")," & ",(0,r.kt)("inlineCode",{parentName:"li"},"Metric")," from generator;"),(0,r.kt)("li",{parentName:"ol"},"Doing ",(0,r.kt)("inlineCode",{parentName:"li"},"Buffer")," post-processing like ",(0,r.kt)("inlineCode",{parentName:"li"},"TrimAlpha")," & ",(0,r.kt)("inlineCode",{parentName:"li"},"Extrude Edge"),";"),(0,r.kt)("li",{parentName:"ol"},"Calling Packer to process the ",(0,r.kt)("inlineCode",{parentName:"li"},"Metric")," and composing the ",(0,r.kt)("inlineCode",{parentName:"li"},"Buffer")," onto the atlas;"),(0,r.kt)("li",{parentName:"ol"},"Generate the ",(0,r.kt)("inlineCode",{parentName:"li"},"spritesheet"),"data object;"),(0,r.kt)("li",{parentName:"ol"},"Calling the Exporter to compile the ",(0,r.kt)("inlineCode",{parentName:"li"},"spritesheet")," onto different templates;")),(0,r.kt)("h3",{id:"packer"},"Packer"),(0,r.kt)("p",null,"Atlasify uses ",(0,r.kt)("a",{parentName:"p",href:"https://github.com/soimy/maxrects-packer"},"maxrects-packer")," to calculate sheets position & rotation on the atlas using Maximum Rectangle Algorithm (Same as TexturePacker)."),(0,r.kt)("h3",{id:"exporter"},"Exporter"),(0,r.kt)("p",null,"Almost every game engine has it's own data structure to represent the spritesheets, Exporters use ",(0,r.kt)("a",{parentName:"p",href:"http://mustache.github.com/"},"mustache.js")," template system, so it's highly customizable through modifying ",(0,r.kt)("inlineCode",{parentName:"p"},"mst")," template files. Atlasify supports these types out-of-the-box:"),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},"bmfont/xml"),(0,r.kt)("li",{parentName:"ul"},"json (font)"),(0,r.kt)("li",{parentName:"ul"},"jsonHash (TexturePacker)"),(0,r.kt)("li",{parentName:"ul"},"jsonArray (TexturePacker)"),(0,r.kt)("li",{parentName:"ul"},"Cocos2d"),(0,r.kt)("li",{parentName:"ul"},"Phaser3"),(0,r.kt)("li",{parentName:"ul"},"Spine"),(0,r.kt)("li",{parentName:"ul"},"Starling"),(0,r.kt)("li",{parentName:"ul"},"UIKit"),(0,r.kt)("li",{parentName:"ul"},"Unreal")),(0,r.kt)("h3",{id:"engine-plugins"},"Engine plugins"),(0,r.kt)("p",null,'Atlasify extends the "standard" TexturePacker data structure to better utilize the power of GPU accelerated asset rendering like ',(0,r.kt)("inlineCode",{parentName:"p"},"multi-channel")," & ",(0,r.kt)("inlineCode",{parentName:"p"},"multi-page"),", and most importantly, MSDF (multi-signed distance field) based vector object. Many game engine don't support these feature yet, so it's important to implement plugins as separated modules for them. (Coming soon)"),(0,r.kt)("hr",null),(0,r.kt)("h2",{id:"installation"},"Installation"),(0,r.kt)("p",null,"For now only CLI controller and core module is implemented. In order to reduce package size, GUI will be a ",(0,r.kt)("a",{parentName:"p",href:"https://github.com/soimy/atlasify-gui"},"separate Repo")," and platform dependent installer will be publish in the Release section of ",(0,r.kt)("a",{parentName:"p",href:"https://github.com/soimy/atlasify"},"Main Repo")),(0,r.kt)("p",null,"To install the CLI, run the following command in terminal:"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-bash"},"npm i -g atlasify\n")),(0,r.kt)("h2",{id:"usage-cli"},"Usage (CLI)"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-console"},"$ atlasify --help\n\nUsage: cli [options] <image-files/folder>\n\nCLI tools to packing and compositing image files into atlas using MaxRects packing algorithm\n\nOptions:\n  -V, --version            output the version number\n  -o, --output <filename>  output atlas filename (Default: sprite.png)\n      --load <filename>    load saved project atl file\n  -m, --size <w,h>         ouput texture atlas size (Default: 2048,2048)\n  -p, --padding <n>        padding between images (Default: 0)\n  -b, --border <n>         space to atlas edge (Default: 0)\n  -a, --auto-size          shrink atlas to the smallest possible square (Default: false)\n  -t, --pot                atlas size shall be power of 2 (Default: false)\n  -s, --square             atlas size shall be square (Default: false)\n  -r, --rot                allow 90-degree rotation while packing (Default: false)\n      --trim [n]           remove surrounding transparent pixels with optional tolerence [n] (Default: false)\n      --extrude <n>        extrude edge pixels (Default: 0)\n      --debug              draw debug gizmo on atlas (Default: false)\n      --instant            instant packing is quicker and skip sorting (Default: false)\n      --seperate-folder    Seperate bin based on folder (Default: false)\n      --group-folder       Group bin based on folder (Default: false)\n      --save               Save configuration for reuse (Default: false)\n  -h, --help               output usage information\n\n")),(0,r.kt)("blockquote",null,(0,r.kt)("p",{parentName:"blockquote"},"Important: Atlasify is in ",(0,r.kt)("strong",{parentName:"p"},"VERY EARLY STAGE"),", any interface or API might change")),(0,r.kt)("p",null,"Examples: Packing all assets inside ",(0,r.kt)("inlineCode",{parentName:"p"},"./assets/actor")," folder into an autosize atlas with max-size 1024x1024, trim image alpha and extrude 1px on edge pixels, 2px padding and save to ",(0,r.kt)("inlineCode",{parentName:"p"},"sprite.png")," & save project file for later reuse."),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-console"},"$ atlasify -o sprite.png -ast -p 2 -m 1024,1024 --extrude 1 --trim --save ./assets/actor\n\nSaved atlas: sprite.png\nSaved spritesheet: sprite.json\nSaved configuration: sprite.atl\n")),(0,r.kt)("p",null,"Examples: Load previous project files and add all assets inside ",(0,r.kt)("inlineCode",{parentName:"p"},"./assets/ui")," folder into the same atlas with same settings except no edge pixel extrude and no trim alpha."),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-console"},"$ atlasify --load ./sprite.atl --extrude 0 --no-trim ./assets/ui\n\nLoading project file: ./sprite.atl\nLoad completed\nSaved atlas: sprite.png\nSaved spritesheet: sprite.json\nSaved configuration: sprite.atl\n")),(0,r.kt)("h2",{id:"module-quick-start"},"Module quick start"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-javascript"},'import { Atlasify, Option } from "atlasify";\nconst opts = new Options("sprite.png", 1024, 1024);\nopts.extrude = 1;\nopts.trimAlpha = true;\nimageFiles = [\n    "a.png",\n    "b.png",\n    "c.jpg"\n]\n\nconst packer = new Atlasify(opts);\npacker.addURLs(imageFiles).then(result => {\n    // Do your fileIO with results\n});\n')),(0,r.kt)("p",null,"Please refer to ",(0,r.kt)("inlineCode",{parentName:"p"},"./bin/cli.js")," & test files(WIP) for further examples."),(0,r.kt)("h2",{id:"api-reference"},"API Reference"),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("a",{parentName:"li",href:"https://soimy.github.io/atlasify/docs/classes/Atlasify"},"Atlasify")),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("a",{parentName:"li",href:"https://soimy.github.io/atlasify/docs/classes/Sheet"},"Sheet")),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("a",{parentName:"li",href:"https://soimy.github.io/atlasify/docs/classes/Exporter"},"Exporter"))))}c.isMDXComponent=!0}}]);