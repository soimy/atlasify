# AGENTS.md - Atlasify

> Guidelines for AI coding agents working in this repository.

## Project Overview

Atlasify is an open-source texture atlas packer that packs graphical assets (sprite images, textures, bitmap fonts, TTF fonts, SVG) into GPU-friendly texture atlases using MaxRects algorithm. Outputs atlas images and spritesheet catalogs (JSON/XML).

**Tech Stack**: TypeScript, Node.js, Jimp (image processing), maxrects-packer, Mustache (templates)

### Architecture Pipeline
1. **Controllers**: CLI (implemented), GUI (WIP), WebAPI (planned)
2. **Generators**: Read input → produce `Buffer` + `Metric` arrays
3. **Post-Processor**: `Sheet` object manipulation (TrimAlpha, Extrude, Rotation)
4. **Core**: Orchestrates pipeline, calls Packer, generates spritesheet data
5. **Packer**: [maxrects-packer](https://github.com/soimy/maxrects-packer) for positioning
6. **Exporter**: Mustache templates for various game engine formats

## Build/Lint/Test Commands

```bash
pnpm install          # Install dependencies
pnpm build            # Build TypeScript to JavaScript
pnpm build:clean      # Clean and build
pnpm lint             # Lint source files
pnpm clean            # Clean build artifacts
pnpm test             # Run integration test
```

### Running Tests

No Jest/Vitest/Mocha configured. Tests run via CLI execution:

```bash
# Full integration test
pnpm test

# Manual CLI test
node bin/cli.js --group-folder -astr -p 2 -m 1024,1024 --extrude 1 --trim --search-dummy --debug ./test/atlas
```

## Code Style Guidelines

### TypeScript Configuration

- **Strict mode**: `strict: true`, `noImplicitAny: true`, `strictNullChecks: true`
- **Module**: NodeNext (ESM-compatible)
- **Output**: `./lib` with declarations in `./lib/types`

### ESLint

Uses `eslint-config-love` + Prettier. Magic numbers allowed (`'no-magic-numbers': 'off'`).

### Import Order

```typescript
import { MaxRectsPacker, type IOption } from "maxrects-packer";  // 1. External packages
import path from "node:path";                                      // 2. Node.js (use node: prefix)
import { Sheet } from "./geom/sheet";                             // 3. Local modules
```

### Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| Classes | PascalCase | `Atlasify`, `Sheet`, `Vec2` |
| Interfaces | PascalCase, `I` prefix for internal | `IAtl`, `IOption` |
| Public types | PascalCase | `Atlas`, `Spritesheet` |
| Methods | camelCase | `addURLs`, `trimAlpha` |
| Private members | `_` prefix | `_sheets`, `_dirty` |
| Constants | UPPER_SNAKE_CASE | `ZERO`, `EPSILON` |

### Class Structure Order

1. Public properties → 2. Constructor → 3. Public methods → 4. Private methods → 5. Private properties → 6. Getters/setters

```typescript
export class Example {
    public name: string = "";
    constructor(options: Options) { }
    public async doWork(): Promise<void> { }
    private helper(): void { }
    private _internal: number = 0;
    get value(): number { return this._internal; }
}
```

### Type Annotations

- Explicit return types for public methods
- Use `type` imports: `import type { IOption } from "maxrects-packer"`
- Interfaces for object shapes, types for unions/primitives
- Avoid `any` - use proper types or generics

### Error Handling

```typescript
try {
    const image = await Jimp.read(img);
} catch (err) {
    console.error(`Error reading image ${img}:`, err);
    throw err;
}
```

### Async Patterns

- Use `async/await` for async operations
- Return `Promise.resolve()` for early exits
- Use `Promise.all()` for parallel operations

## Project Structure

```
atlasify/
├── src/                    # TypeScript source
│   ├── atlasify.ts        # Main entry point
│   ├── exporter.ts        # Template-based export
│   └── geom/              # Geometry classes (Sheet, Vec2)
├── bin/cli.js             # Commander-based CLI
├── lib/                    # Compiled output (git-ignored)
├── templates/              # Mustache export templates
└── test/                   # Test assets
```

## Key Patterns

### Options Pattern
```typescript
const opts = new AtlasifyOptions(1024, 1024, 2);
opts.extrude = 1;
opts.trimAlpha = true;
```

### Factory Pattern
```typescript
static Factory(data: { width: number; height: number }): Sheet {
    return new Sheet(data.width, data.height).parse(data);
}
```

### Dirty Flag Pattern
```typescript
private _dirty = 0;
public async pack(): Promise<this> {
    if (this._dirty === 0) return Promise.resolve(this);
    // ... packing logic
    this._dirty = 0;
}
```

## Common Tasks

### Adding Export Format
1. Create template in `templates/`
2. Add entry to `templates/list.json`

### Image Processing
- Operations in `Sheet` class (`src/geom/sheet.ts`)
- Uses Jimp for manipulation
- Call `trimAlpha()` before `extrude()` when both needed

## Supported Export Formats

Atlasify supports these game engine formats out-of-the-box via Mustache templates:

- bmfont/xml, json (font), jsonHash, jsonArray (TexturePacker)
- Cocos2d, Phaser3, Spine, Starling, UIKit, Unreal

## Module Usage Example

```typescript
import { Atlasify, Options } from "atlasify";

const opts = new Options("sprite.png", 1024, 1024);
opts.extrude = 1;
opts.trimAlpha = true;

const packer = new Atlasify(opts);
packer.addURLs(["a.png", "b.png"]).then(result => {
    // Do file I/O with results
});
```

## Copilot Instructions

See `.github/instructions/unittestMcp.instructions.md` for unit test workflow guidance.