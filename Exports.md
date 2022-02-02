# atlasify

## Table of contents

### Classes

- [Atlasify](../wiki/Atlasify)
- [Options](../wiki/Options)
- [Sheet](../wiki/Sheet)

### Interfaces

- [IAtl](../wiki/IAtl)

### Type aliases

- [Atlas](../wiki/Exports#atlas)
- [Base64Data](../wiki/Exports#base64data)
- [Spritesheet](../wiki/Exports#spritesheet)

## Type aliases

### Atlas

Ƭ **Atlas**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `ext` | `string` |
| `format?` | `string` |
| `height` | `number` |
| `id?` | `number` |
| `image` | `Jimp` |
| `name` | `string` |
| `tag?` | `string` |
| `width` | `number` |

#### Defined in

[src/atlasify.ts:142](https://github.com/soimy/atlasify/blob/c9f928b/src/atlasify.ts#L142)

___

### Base64Data

Ƭ **Base64Data**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `data` | `string` |
| `prefix` | `string` |

#### Defined in

[src/atlasify.ts:169](https://github.com/soimy/atlasify/blob/c9f928b/src/atlasify.ts#L169)

___

### Spritesheet

Ƭ **Spritesheet**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `appInfo?` | `any` |
| `base64Data?` | [`Base64Data`](../wiki/Exports#base64data) |
| `ext` | `string` |
| `format` | `string` |
| `height` | `number` |
| `id?` | `number` |
| `imageFormat` | `string` |
| `imageName` | `string` |
| `name` | `string` |
| `rects` | `object`[] |
| `scale` | `number` |
| `tag?` | `string` |
| `width` | `number` |

#### Defined in

[src/atlasify.ts:153](https://github.com/soimy/atlasify/blob/c9f928b/src/atlasify.ts#L153)
