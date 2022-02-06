---
id: "Options"
title: "Class: Options"
sidebar_label: "Options"
sidebar_position: 0
custom_edit_url: null
---

Options class for atlasify and maxrects-packer

**`implements`** {IOption}

## Implements

- `IOption`

## Constructors

### constructor

• **new Options**(`name?`, `width?`, `height?`, `padding?`, `type?`)

Creates an instance of Options.

**`memberof`** Options

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `name` | `string` | `'sprite'` |
| `width` | `number` | `2048` |
| `height` | `number` | `2048` |
| `padding` | `number` | `0` |
| `type` | `string` | `"JsonHash"` |

#### Defined in

[atlasify.ts:133](https://github.com/soimy/atlasify/blob/c9f928b/src/atlasify.ts#L133)

## Properties

### allowRotation

• **allowRotation**: `boolean` = `false`

Allow 90-degree rotation while packing

**`memberof`** Options

#### Implementation of

IOption.allowRotation

#### Defined in

[atlasify.ts:49](https://github.com/soimy/atlasify/blob/c9f928b/src/atlasify.ts#L49)

___

### alphaTolerence

• **alphaTolerence**: `number` = `0`

Trim alpha with tolerence value

**`memberof`** Options

#### Defined in

[atlasify.ts:99](https://github.com/soimy/atlasify/blob/c9f928b/src/atlasify.ts#L99)

___

### border

• **border**: `number` = `0`

Controlling packer border to edge

**`memberof`** Options

#### Implementation of

IOption.border

#### Defined in

[atlasify.ts:57](https://github.com/soimy/atlasify/blob/c9f928b/src/atlasify.ts#L57)

___

### debug

• **debug**: `boolean` = `false`

Draw debug info onto atlas

**`memberof`** Options

#### Defined in

[atlasify.ts:115](https://github.com/soimy/atlasify/blob/c9f928b/src/atlasify.ts#L115)

___

### exclusiveTag

• `Optional` **exclusiveTag**: `boolean`

#### Implementation of

IOption.exclusiveTag

#### Defined in

[atlasify.ts:83](https://github.com/soimy/atlasify/blob/c9f928b/src/atlasify.ts#L83)

___

### extrude

• **extrude**: `number` = `0`

Extrude amount of edge pixels, will automaticly `trimAlpha` first.

**`memberof`** Options

#### Defined in

[atlasify.ts:107](https://github.com/soimy/atlasify/blob/c9f928b/src/atlasify.ts#L107)

___

### groupFolder

• **groupFolder**: `boolean` = `false`

Group sheets packing based on folder

**`memberof`** Options

#### Defined in

[atlasify.ts:82](https://github.com/soimy/atlasify/blob/c9f928b/src/atlasify.ts#L82)

___

### height

• **height**: `number` = `2048`

___

### instant

• **instant**: `boolean` = `false`

Instant mode will skip sorting and pack using given array order

**`memberof`** Options

#### Defined in

[atlasify.ts:65](https://github.com/soimy/atlasify/blob/c9f928b/src/atlasify.ts#L65)

___

### name

• **name**: `string` = `'sprite'`

___

### padding

• **padding**: `number` = `0`

___

### pot

• **pot**: `boolean` = `true`

Atlas size shall be power of 2

**`memberof`** Options

#### Implementation of

IOption.pot

#### Defined in

[atlasify.ts:33](https://github.com/soimy/atlasify/blob/c9f928b/src/atlasify.ts#L33)

___

### searchDummy

• **searchDummy**: `boolean` = `false`

Search duplicated dummy sprites to reduce atlas element

**`memberof`** Options

#### Defined in

[atlasify.ts:123](https://github.com/soimy/atlasify/blob/c9f928b/src/atlasify.ts#L123)

___

### seperateFolder

• **seperateFolder**: `boolean` = `false`

Seperate sheets packing based on folder

**`memberof`** Options

#### Defined in

[atlasify.ts:73](https://github.com/soimy/atlasify/blob/c9f928b/src/atlasify.ts#L73)

___

### smart

• **smart**: `boolean` = `true`

Atlas will automaticly shrink to the smallest possible square

**`memberof`** Options

#### Implementation of

IOption.smart

#### Defined in

[atlasify.ts:25](https://github.com/soimy/atlasify/blob/c9f928b/src/atlasify.ts#L25)

___

### square

• **square**: `boolean` = `false`

Atlas size shall be square

**`memberof`** Options

#### Implementation of

IOption.square

#### Defined in

[atlasify.ts:41](https://github.com/soimy/atlasify/blob/c9f928b/src/atlasify.ts#L41)

___

### tag

• `Optional` **tag**: `boolean`

#### Implementation of

IOption.tag

#### Defined in

[atlasify.ts:74](https://github.com/soimy/atlasify/blob/c9f928b/src/atlasify.ts#L74)

___

### trimAlpha

• **trimAlpha**: `boolean` = `false`

Remove surrounding transparent pixels

**`memberof`** Options

#### Defined in

[atlasify.ts:91](https://github.com/soimy/atlasify/blob/c9f928b/src/atlasify.ts#L91)

___

### type

• **type**: `string` = `"JsonHash"`

___

### width

• **width**: `number` = `2048`
