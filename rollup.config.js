import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import typescript from "rollup-plugin-typescript2";
import builtins from "rollup-plugin-node-builtins";
import globals from "rollup-plugin-node-globals";
import sourceMaps from "rollup-plugin-sourcemaps"
import json from "rollup-plugin-json";
// NOTE: The plugin has two different modes:
// * one to transpile `.ts -> .js`
// * one to create `.ts -> .d.ts` bundles
import { dts } from "rollup-plugin-dts";

const pkg = require("./package.json");

const config = [
    {
        input: "./src/atlasify.ts",
        // NOTE: The first output is your transpiled typescript
        output: [{
            file: pkg.main, 
            name: "Atlasify",
            format: "umd",
            sourcemap: true
        }, 
        { 
            file: pkg.module,
            format: "es",
            sourcemap: true 
        }],
        external: ['jimp'],
        plugins: [
            json(),
            builtins(),
            globals(),
            typescript({ useTsconfigDeclarationDir: true }),
            commonjs(),
            resolve({
                mainFields: ['module', 'main'],
                extensions: [".ts"],
                preferBuiltins: false,
            }),
            sourceMaps(),
        ],
    },
    {
        input: "./src/atlasify.ts",
        // NOTE: The second output is your bundled `.d.ts` file
        output: [{ file: "dist/atlasify-core.d.ts", format: "es" }],

        plugins: [ dts() ],
    },
];

export default config;