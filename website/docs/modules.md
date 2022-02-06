---
id: "modules"
title: "atlasify"
sidebar_label: "Exports"
sidebar_position: 0.5
custom_edit_url: null
---

## Classes

- [Atlasify](classes/Atlasify)
- [Exporter](classes/Exporter)
- [Options](classes/Options)
- [Sheet](classes/Sheet)

## Interfaces

- [IAtl](interfaces/IAtl)

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

[atlasify.ts:142](https://github.com/soimy/atlasify/blob/c9f928b/src/atlasify.ts#L142)

___

### Base64Data

Ƭ **Base64Data**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `data` | `string` |
| `prefix` | `string` |

#### Defined in

[atlasify.ts:169](https://github.com/soimy/atlasify/blob/c9f928b/src/atlasify.ts#L169)

___

### Spritesheet

Ƭ **Spritesheet**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `appInfo?` | `any` |
| `base64Data?` | [`Base64Data`](modules#base64data) |
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

[atlasify.ts:153](https://github.com/soimy/atlasify/blob/c9f928b/src/atlasify.ts#L153)
