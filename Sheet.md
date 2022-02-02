# Class: Sheet

## Hierarchy

- `Rectangle`

  ↳ **`Sheet`**

## Table of contents

### Constructors

- [constructor](../wiki/Sheet#constructor)

### Properties

- [\_allowRotation](../wiki/Sheet#_allowrotation)
- [\_border](../wiki/Sheet#_border)
- [\_data](../wiki/Sheet#_data)
- [\_dirty](../wiki/Sheet#_dirty)
- [\_hash](../wiki/Sheet#_hash)
- [\_height](../wiki/Sheet#_height)
- [\_imageDirty](../wiki/Sheet#_imagedirty)
- [\_rot](../wiki/Sheet#_rot)
- [\_rotated](../wiki/Sheet#_rotated)
- [\_width](../wiki/Sheet#_width)
- [\_x](../wiki/Sheet#_x)
- [\_y](../wiki/Sheet#_y)
- [anchor](../wiki/Sheet#anchor)
- [dummy](../wiki/Sheet#dummy)
- [frame](../wiki/Sheet#frame)
- [last](../wiki/Sheet#last)
- [name](../wiki/Sheet#name)
- [nineSliceFrame](../wiki/Sheet#ninesliceframe)
- [oversized](../wiki/Sheet#oversized)
- [sourceFrame](../wiki/Sheet#sourceframe)
- [tag](../wiki/Sheet#tag)
- [trimmed](../wiki/Sheet#trimmed)
- [url](../wiki/Sheet#url)

### Accessors

- [allowRotation](../wiki/Sheet#allowrotation)
- [data](../wiki/Sheet#data)
- [dirty](../wiki/Sheet#dirty)
- [hash](../wiki/Sheet#hash)
- [height](../wiki/Sheet#height)
- [rot](../wiki/Sheet#rot)
- [width](../wiki/Sheet#width)
- [x](../wiki/Sheet#x)
- [y](../wiki/Sheet#y)

### Methods

- [alphaScanner](../wiki/Sheet#alphascanner)
- [area](../wiki/Sheet#area)
- [collide](../wiki/Sheet#collide)
- [contain](../wiki/Sheet#contain)
- [extrude](../wiki/Sheet#extrude)
- [getChannelIndex](../wiki/Sheet#getchannelindex)
- [parse](../wiki/Sheet#parse)
- [rotate](../wiki/Sheet#rotate)
- [serialize](../wiki/Sheet#serialize)
- [setDirty](../wiki/Sheet#setdirty)
- [trimAlpha](../wiki/Sheet#trimalpha)
- [Collide](../wiki/Sheet#collide)
- [Contain](../wiki/Sheet#contain)
- [Factory](../wiki/Sheet#factory)

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

[src/geom/sheet.ts:104](https://github.com/soimy/atlasify/blob/c9f928b/src/geom/sheet.ts#L104)

## Properties

### \_allowRotation

• `Protected` **\_allowRotation**: `undefined` \| `boolean`

#### Inherited from

Rectangle.\_allowRotation

#### Defined in

node_modules/maxrects-packer/dist/maxrects-packer.d.ts:99

___

### \_border

• `Private` **\_border**: `number` = `0`

#### Defined in

[src/geom/sheet.ts:302](https://github.com/soimy/atlasify/blob/c9f928b/src/geom/sheet.ts#L302)

___

### \_data

• `Protected` **\_data**: `any`

#### Inherited from

Rectangle.\_data

#### Defined in

node_modules/maxrects-packer/dist/maxrects-packer.d.ts:113

___

### \_dirty

• `Protected` **\_dirty**: `number`

#### Inherited from

Rectangle.\_dirty

#### Defined in

node_modules/maxrects-packer/dist/maxrects-packer.d.ts:116

___

### \_hash

• `Private` **\_hash**: `string` = `""`

#### Defined in

[src/geom/sheet.ts:304](https://github.com/soimy/atlasify/blob/c9f928b/src/geom/sheet.ts#L304)

___

### \_height

• `Protected` **\_height**: `number`

#### Inherited from

Rectangle.\_height

#### Defined in

node_modules/maxrects-packer/dist/maxrects-packer.d.ts:74

___

### \_imageDirty

• `Private` **\_imageDirty**: `number` = `0`

#### Defined in

[src/geom/sheet.ts:305](https://github.com/soimy/atlasify/blob/c9f928b/src/geom/sheet.ts#L305)

___

### \_rot

• `Protected` **\_rot**: `boolean`

#### Inherited from

Rectangle.\_rot

#### Defined in

node_modules/maxrects-packer/dist/maxrects-packer.d.ts:83

___

### \_rotated

• `Private` **\_rotated**: `boolean` = `false`

#### Defined in

[src/geom/sheet.ts:303](https://github.com/soimy/atlasify/blob/c9f928b/src/geom/sheet.ts#L303)

___

### \_width

• `Protected` **\_width**: `number`

#### Inherited from

Rectangle.\_width

#### Defined in

node_modules/maxrects-packer/dist/maxrects-packer.d.ts:71

___

### \_x

• `Protected` **\_x**: `number`

#### Inherited from

Rectangle.\_x

#### Defined in

node_modules/maxrects-packer/dist/maxrects-packer.d.ts:77

___

### \_y

• `Protected` **\_y**: `number`

#### Inherited from

Rectangle.\_y

#### Defined in

node_modules/maxrects-packer/dist/maxrects-packer.d.ts:80

___

### anchor

• **anchor**: `Vec2`

anchor/pivot point

**`memberof`** Sheet

#### Defined in

[src/geom/sheet.ts:51](https://github.com/soimy/atlasify/blob/c9f928b/src/geom/sheet.ts#L51)

___

### dummy

• **dummy**: `string`[] = `[]`

Dummy tag which represent a clone of other sheet

**`memberof`** Sheet

#### Defined in

[src/geom/sheet.ts:83](https://github.com/soimy/atlasify/blob/c9f928b/src/geom/sheet.ts#L83)

___

### frame

• **frame**: `Rectangle`

frame rectangle to be rendered to final atlas

**`memberof`** Sheet

#### Defined in

[src/geom/sheet.ts:33](https://github.com/soimy/atlasify/blob/c9f928b/src/geom/sheet.ts#L33)

___

### last

• **last**: `boolean` = `false`

for controlling mustache template trailing comma, don't touch

**`memberof`** Sheet

#### Defined in

[src/geom/sheet.ts:91](https://github.com/soimy/atlasify/blob/c9f928b/src/geom/sheet.ts#L91)

___

### name

• **name**: `string` = `""`

sprite name, normally filename before packing

if `Atlasify.Options.basenameOnly = true` there will be no extension.

if `Atlasify.Options.appendPath = true` name will include relative path.

**`memberof`** Sheet

#### Defined in

[src/geom/sheet.ts:17](https://github.com/soimy/atlasify/blob/c9f928b/src/geom/sheet.ts#L17)

___

### nineSliceFrame

• **nineSliceFrame**: `Rectangle`

9-sliced center rectangle

**`memberof`** Sheet

#### Defined in

[src/geom/sheet.ts:59](https://github.com/soimy/atlasify/blob/c9f928b/src/geom/sheet.ts#L59)

___

### oversized

• **oversized**: `boolean`

Oversized tag on rectangle which is bigger than packer itself.

**`memberof`** Rectangle

#### Inherited from

Rectangle.oversized

#### Defined in

node_modules/maxrects-packer/dist/maxrects-packer.d.ts:15

___

### sourceFrame

• **sourceFrame**: `Rectangle`

orignal source rectangle

`x` and `y` refer to the negative offset from the frame rectangle

**`memberof`** Sheet

#### Defined in

[src/geom/sheet.ts:43](https://github.com/soimy/atlasify/blob/c9f928b/src/geom/sheet.ts#L43)

___

### tag

• `Optional` **tag**: `string`

tag of group packing

**`memberof`** Sheet

#### Defined in

[src/geom/sheet.ts:75](https://github.com/soimy/atlasify/blob/c9f928b/src/geom/sheet.ts#L75)

___

### trimmed

• **trimmed**: `boolean` = `false`

alpha trimmed

**`memberof`** Sheet

#### Defined in

[src/geom/sheet.ts:67](https://github.com/soimy/atlasify/blob/c9f928b/src/geom/sheet.ts#L67)

___

### url

• **url**: `string` = `""`

path/url to the source image

**`memberof`** Sheet

#### Defined in

[src/geom/sheet.ts:25](https://github.com/soimy/atlasify/blob/c9f928b/src/geom/sheet.ts#L25)

## Accessors

### allowRotation

• `get` **allowRotation**(): `undefined` \| `boolean`

If the rectangle allow rotation

**`memberof`** Rectangle

#### Returns

`undefined` \| `boolean`

#### Inherited from

Rectangle.allowRotation

#### Defined in

node_modules/maxrects-packer/dist/maxrects-packer.d.ts:106

• `set` **allowRotation**(`value`): `void`

Set the allowRotation tag of the rectangle.

**`memberof`** Rectangle

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `undefined` \| `boolean` |

#### Returns

`void`

#### Inherited from

Rectangle.allowRotation

#### Defined in

node_modules/maxrects-packer/dist/maxrects-packer.d.ts:112

___

### data

• `get` **data**(): `Jimp`

image data object

**`memberof`** Sheet

#### Returns

`Jimp`

#### Overrides

Rectangle.data

#### Defined in

[src/geom/sheet.ts:350](https://github.com/soimy/atlasify/blob/c9f928b/src/geom/sheet.ts#L350)

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

[src/geom/sheet.ts:351](https://github.com/soimy/atlasify/blob/c9f928b/src/geom/sheet.ts#L351)

___

### dirty

• `get` **dirty**(): `boolean`

#### Returns

`boolean`

#### Inherited from

Rectangle.dirty

#### Defined in

node_modules/maxrects-packer/dist/maxrects-packer.d.ts:117

___

### hash

• `get` **hash**(): `string`

hash string generated from image, for identifing

**`memberof`** Sheet

#### Returns

`string`

#### Defined in

[src/geom/sheet.ts:368](https://github.com/soimy/atlasify/blob/c9f928b/src/geom/sheet.ts#L368)

___

### height

• `get` **height**(): `number`

#### Returns

`number`

#### Inherited from

Rectangle.height

#### Defined in

node_modules/maxrects-packer/dist/maxrects-packer.d.ts:75

• `set` **height**(`value`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `number` |

#### Returns

`void`

#### Inherited from

Rectangle.height

#### Defined in

node_modules/maxrects-packer/dist/maxrects-packer.d.ts:76

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

[src/geom/sheet.ts:332](https://github.com/soimy/atlasify/blob/c9f928b/src/geom/sheet.ts#L332)

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

[src/geom/sheet.ts:335](https://github.com/soimy/atlasify/blob/c9f928b/src/geom/sheet.ts#L335)

___

### width

• `get` **width**(): `number`

#### Returns

`number`

#### Inherited from

Rectangle.width

#### Defined in

node_modules/maxrects-packer/dist/maxrects-packer.d.ts:72

• `set` **width**(`value`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `number` |

#### Returns

`void`

#### Inherited from

Rectangle.width

#### Defined in

node_modules/maxrects-packer/dist/maxrects-packer.d.ts:73

___

### x

• `get` **x**(): `number`

#### Returns

`number`

#### Overrides

Rectangle.x

#### Defined in

[src/geom/sheet.ts:311](https://github.com/soimy/atlasify/blob/c9f928b/src/geom/sheet.ts#L311)

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

[src/geom/sheet.ts:307](https://github.com/soimy/atlasify/blob/c9f928b/src/geom/sheet.ts#L307)

___

### y

• `get` **y**(): `number`

#### Returns

`number`

#### Overrides

Rectangle.y

#### Defined in

[src/geom/sheet.ts:317](https://github.com/soimy/atlasify/blob/c9f928b/src/geom/sheet.ts#L317)

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

[src/geom/sheet.ts:313](https://github.com/soimy/atlasify/blob/c9f928b/src/geom/sheet.ts#L313)

## Methods

### alphaScanner

▸ `Private` **alphaScanner**(`forward?`, `horizontal?`, `tolerance?`): `number`

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `forward` | `boolean` | `true` |
| `horizontal` | `boolean` | `true` |
| `tolerance` | `number` | `0x00` |

#### Returns

`number`

#### Defined in

[src/geom/sheet.ts:375](https://github.com/soimy/atlasify/blob/c9f928b/src/geom/sheet.ts#L375)

___

### area

▸ **area**(): `number`

Get the area (w * h) of the rectangle

**`memberof`** Rectangle

#### Returns

`number`

#### Inherited from

Rectangle.area

#### Defined in

node_modules/maxrects-packer/dist/maxrects-packer.d.ts:54

___

### collide

▸ **collide**(`rect`): `boolean`

Test if the given rectangle collide with this rectangle.

**`memberof`** Rectangle

#### Parameters

| Name | Type |
| :------ | :------ |
| `rect` | `IRectangle` |

#### Returns

`boolean`

#### Inherited from

Rectangle.collide

#### Defined in

node_modules/maxrects-packer/dist/maxrects-packer.d.ts:62

___

### contain

▸ **contain**(`rect`): `boolean`

Test if this rectangle contains the given rectangle.

**`memberof`** Rectangle

#### Parameters

| Name | Type |
| :------ | :------ |
| `rect` | `IRectangle` |

#### Returns

`boolean`

#### Inherited from

Rectangle.contain

#### Defined in

node_modules/maxrects-packer/dist/maxrects-packer.d.ts:70

___

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

[src/geom/sheet.ts:237](https://github.com/soimy/atlasify/blob/c9f928b/src/geom/sheet.ts#L237)

___

### getChannelIndex

▸ `Private` **getChannelIndex**(`x`, `y`, `offset?`): `number`

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `x` | `number` | `undefined` |
| `y` | `number` | `undefined` |
| `offset` | `number` | `3` |

#### Returns

`number`

#### Defined in

[src/geom/sheet.ts:398](https://github.com/soimy/atlasify/blob/c9f928b/src/geom/sheet.ts#L398)

___

### parse

▸ **parse**(`data`, `target?`): [`Sheet`](../wiki/Sheet)

Load sheet settings from json object

**`memberof`** Sheet

#### Parameters

| Name | Type |
| :------ | :------ |
| `data` | `object` |
| `target` | `object` |

#### Returns

[`Sheet`](../wiki/Sheet)

#### Defined in

[src/geom/sheet.ts:177](https://github.com/soimy/atlasify/blob/c9f928b/src/geom/sheet.ts#L177)

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

[src/geom/sheet.ts:279](https://github.com/soimy/atlasify/blob/c9f928b/src/geom/sheet.ts#L279)

___

### serialize

▸ **serialize**(): `object`

Return a serialized json object

**`memberof`** Sheet

#### Returns

`object`

#### Defined in

[src/geom/sheet.ts:130](https://github.com/soimy/atlasify/blob/c9f928b/src/geom/sheet.ts#L130)

___

### setDirty

▸ **setDirty**(`value?`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `value?` | `boolean` |

#### Returns

`void`

#### Inherited from

Rectangle.setDirty

#### Defined in

node_modules/maxrects-packer/dist/maxrects-packer.d.ts:118

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

[src/geom/sheet.ts:205](https://github.com/soimy/atlasify/blob/c9f928b/src/geom/sheet.ts#L205)

___

### Collide

▸ `Static` **Collide**(`first`, `second`): `any`

Test if two given rectangle collide each other

**`static`**

**`memberof`** Rectangle

#### Parameters

| Name | Type |
| :------ | :------ |
| `first` | `IRectangle` |
| `second` | `IRectangle` |

#### Returns

`any`

#### Inherited from

Rectangle.Collide

#### Defined in

node_modules/maxrects-packer/dist/maxrects-packer.d.ts:37

___

### Contain

▸ `Static` **Contain**(`first`, `second`): `any`

Test if the first rectangle contains the second one

**`static`**

**`memberof`** Rectangle

#### Parameters

| Name | Type |
| :------ | :------ |
| `first` | `IRectangle` |
| `second` | `IRectangle` |

#### Returns

`any`

#### Inherited from

Rectangle.Contain

#### Defined in

node_modules/maxrects-packer/dist/maxrects-packer.d.ts:47

___

### Factory

▸ `Static` **Factory**(`data`): [`Sheet`](../wiki/Sheet)

#### Parameters

| Name | Type |
| :------ | :------ |
| `data` | `any` |

#### Returns

[`Sheet`](../wiki/Sheet)

#### Defined in

[src/geom/sheet.ts:193](https://github.com/soimy/atlasify/blob/c9f928b/src/geom/sheet.ts#L193)
