---
id: "Sheet"
title: "Class: Sheet"
sidebar_label: "Sheet"
sidebar_position: 0
custom_edit_url: null
---

## Hierarchy

- `Rectangle`

  ↳ **`Sheet`**

## Constructors

### constructor

• **new Sheet**(`width?`, `height?`, `x?`, `y?`, `rot?`)

Creates an instance of Sheet extends `Rectangle`
from [MaxrectsPacker](https://github.com/soimy/maxrects-packer)

**`memberof`** Sheet

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `width` | `number` | `0` |
| `height` | `number` | `0` |
| `x` | `number` | `0` |
| `y` | `number` | `0` |
| `rot` | `boolean` | `false` |

#### Overrides

Rectangle.constructor

#### Defined in

[geom/sheet.ts:104](https://github.com/soimy/atlasify/blob/c9f928b/src/geom/sheet.ts#L104)

## Properties

### anchor

• **anchor**: `Vec2`

anchor/pivot point

**`memberof`** Sheet

#### Defined in

[geom/sheet.ts:51](https://github.com/soimy/atlasify/blob/c9f928b/src/geom/sheet.ts#L51)

___

### dummy

• **dummy**: `string`[] = `[]`

Dummy tag which represent a clone of other sheet

**`memberof`** Sheet

#### Defined in

[geom/sheet.ts:83](https://github.com/soimy/atlasify/blob/c9f928b/src/geom/sheet.ts#L83)

___

### frame

• **frame**: `Rectangle`

frame rectangle to be rendered to final atlas

**`memberof`** Sheet

#### Defined in

[geom/sheet.ts:33](https://github.com/soimy/atlasify/blob/c9f928b/src/geom/sheet.ts#L33)

___

### last

• **last**: `boolean` = `false`

for controlling mustache template trailing comma, don't touch

**`memberof`** Sheet

#### Defined in

[geom/sheet.ts:91](https://github.com/soimy/atlasify/blob/c9f928b/src/geom/sheet.ts#L91)

___

### name

• **name**: `string` = `""`

sprite name, normally filename before packing

if `Atlasify.Options.basenameOnly = true` there will be no extension.

if `Atlasify.Options.appendPath = true` name will include relative path.

**`memberof`** Sheet

#### Defined in

[geom/sheet.ts:17](https://github.com/soimy/atlasify/blob/c9f928b/src/geom/sheet.ts#L17)

___

### nineSliceFrame

• **nineSliceFrame**: `Rectangle`

9-sliced center rectangle

**`memberof`** Sheet

#### Defined in

[geom/sheet.ts:59](https://github.com/soimy/atlasify/blob/c9f928b/src/geom/sheet.ts#L59)

___

### sourceFrame

• **sourceFrame**: `Rectangle`

orignal source rectangle

`x` and `y` refer to the negative offset from the frame rectangle

**`memberof`** Sheet

#### Defined in

[geom/sheet.ts:43](https://github.com/soimy/atlasify/blob/c9f928b/src/geom/sheet.ts#L43)

___

### tag

• `Optional` **tag**: `string`

tag of group packing

**`memberof`** Sheet

#### Defined in

[geom/sheet.ts:75](https://github.com/soimy/atlasify/blob/c9f928b/src/geom/sheet.ts#L75)

___

### trimmed

• **trimmed**: `boolean` = `false`

alpha trimmed

**`memberof`** Sheet

#### Defined in

[geom/sheet.ts:67](https://github.com/soimy/atlasify/blob/c9f928b/src/geom/sheet.ts#L67)

___

### url

• **url**: `string` = `""`

path/url to the source image

**`memberof`** Sheet

#### Defined in

[geom/sheet.ts:25](https://github.com/soimy/atlasify/blob/c9f928b/src/geom/sheet.ts#L25)

## Accessors

### data

• `get` **data**(): `Jimp`

image data object

**`memberof`** Sheet

#### Returns

`Jimp`

#### Overrides

Rectangle.data

#### Defined in

[geom/sheet.ts:350](https://github.com/soimy/atlasify/blob/c9f928b/src/geom/sheet.ts#L350)

• `set` **data**(`value`): `void`

image data object

**`memberof`** Sheet

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `Jimp` |

#### Returns

`void`

#### Overrides

Rectangle.data

#### Defined in

[geom/sheet.ts:351](https://github.com/soimy/atlasify/blob/c9f928b/src/geom/sheet.ts#L351)

___

### hash

• `get` **hash**(): `string`

hash string generated from image, for identifing

**`memberof`** Sheet

#### Returns

`string`

#### Defined in

[geom/sheet.ts:368](https://github.com/soimy/atlasify/blob/c9f928b/src/geom/sheet.ts#L368)

___

### rot

• `get` **rot**(): `boolean`

Status from packer whether `Sheet` should be rotated.

note: if `rot` set to `true`, image data will be rotated automaticlly,
and `width/height` is swaped.

**`memberof`** Sheet

#### Returns

`boolean`

#### Overrides

Rectangle.rot

#### Defined in

[geom/sheet.ts:332](https://github.com/soimy/atlasify/blob/c9f928b/src/geom/sheet.ts#L332)

• `set` **rot**(`value`): `void`

Status from packer whether `Sheet` should be rotated.

note: if `rot` set to `true`, image data will be rotated automaticlly,
and `width/height` is swaped.

**`memberof`** Sheet

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `boolean` |

#### Returns

`void`

#### Overrides

Rectangle.rot

#### Defined in

[geom/sheet.ts:335](https://github.com/soimy/atlasify/blob/c9f928b/src/geom/sheet.ts#L335)

___

### x

• `get` **x**(): `number`

#### Returns

`number`

#### Overrides

Rectangle.x

#### Defined in

[geom/sheet.ts:311](https://github.com/soimy/atlasify/blob/c9f928b/src/geom/sheet.ts#L311)

• `set` **x**(`value`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `number` |

#### Returns

`void`

#### Overrides

Rectangle.x

#### Defined in

[geom/sheet.ts:307](https://github.com/soimy/atlasify/blob/c9f928b/src/geom/sheet.ts#L307)

___

### y

• `get` **y**(): `number`

#### Returns

`number`

#### Overrides

Rectangle.y

#### Defined in

[geom/sheet.ts:317](https://github.com/soimy/atlasify/blob/c9f928b/src/geom/sheet.ts#L317)

• `set` **y**(`value`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `number` |

#### Returns

`void`

#### Overrides

Rectangle.y

#### Defined in

[geom/sheet.ts:313](https://github.com/soimy/atlasify/blob/c9f928b/src/geom/sheet.ts#L313)

## Methods

### extrude

▸ **extrude**(`border`): `void`

Extrude edge pixels. Should `trimAlpha` first

**`memberof`** Sheet

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `border` | `number` | extrude pixels |

#### Returns

`void`

#### Defined in

[geom/sheet.ts:237](https://github.com/soimy/atlasify/blob/c9f928b/src/geom/sheet.ts#L237)

___

### parse

▸ **parse**(`data`, `target?`): [`Sheet`](Sheet)

Load sheet settings from json object

**`memberof`** Sheet

#### Parameters

| Name | Type |
| :------ | :------ |
| `data` | `object` |
| `target` | `object` |

#### Returns

[`Sheet`](Sheet)

#### Defined in

[geom/sheet.ts:177](https://github.com/soimy/atlasify/blob/c9f928b/src/geom/sheet.ts#L177)

___

### rotate

▸ **rotate**(`clockwise?`): `void`

Rotate image data 90-degree CW, and swap width/height

note: rotate is done automaticly when `Sheet.rot` set to `true`, normally
you don't need to do this manually unless you know what you are doing.

**`memberof`** Sheet

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `clockwise` | `boolean` | `true` |

#### Returns

`void`

#### Defined in

[geom/sheet.ts:279](https://github.com/soimy/atlasify/blob/c9f928b/src/geom/sheet.ts#L279)

___

### serialize

▸ **serialize**(): `object`

Return a serialized json object

**`memberof`** Sheet

#### Returns

`object`

#### Defined in

[geom/sheet.ts:130](https://github.com/soimy/atlasify/blob/c9f928b/src/geom/sheet.ts#L130)

___

### trimAlpha

▸ **trimAlpha**(`tolerance?`): `void`

Crop surrounding transparent pixels

**`memberof`** Sheet

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `tolerance` | `number` | `0` |

#### Returns

`void`

#### Defined in

[geom/sheet.ts:205](https://github.com/soimy/atlasify/blob/c9f928b/src/geom/sheet.ts#L205)

___

### Factory

▸ `Static` **Factory**(`data`): [`Sheet`](Sheet)

#### Parameters

| Name | Type |
| :------ | :------ |
| `data` | `any` |

#### Returns

[`Sheet`](Sheet)

#### Defined in

[geom/sheet.ts:193](https://github.com/soimy/atlasify/blob/c9f928b/src/geom/sheet.ts#L193)
