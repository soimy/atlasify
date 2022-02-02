# Class: Atlasify

## Table of contents

### Constructors

- [constructor](../wiki/Atlasify#constructor)

### Properties

- [\_atlas](../wiki/Atlasify#_atlas)
- [\_debugColor](../wiki/Atlasify#_debugcolor)
- [\_dirty](../wiki/Atlasify#_dirty)
- [\_exporter](../wiki/Atlasify#_exporter)
- [\_inputPaths](../wiki/Atlasify#_inputpaths)
- [\_packer](../wiki/Atlasify#_packer)
- [\_sheets](../wiki/Atlasify#_sheets)
- [\_spritesheets](../wiki/Atlasify#_spritesheets)
- [options](../wiki/Atlasify#options)

### Accessors

- [atlas](../wiki/Atlasify#atlas)
- [exporter](../wiki/Atlasify#exporter)
- [spritesheets](../wiki/Atlasify#spritesheets)

### Methods

- [addBuffers](../wiki/Atlasify#addbuffers)
- [addURLs](../wiki/Atlasify#addurls)
- [getLeafFolder](../wiki/Atlasify#getleaffolder)
- [load](../wiki/Atlasify#load)
- [metricFromImage](../wiki/Atlasify#metricfromimage)
- [next](../wiki/Atlasify#next)
- [pack](../wiki/Atlasify#pack)
- [pruneTagIndex](../wiki/Atlasify#prunetagindex)
- [save](../wiki/Atlasify#save)
- [Load](../wiki/Atlasify#load)

## Constructors

### constructor

• **new Atlasify**(`options`)

Creates an instance of Atlasify.

**`memberof`** Atlasify

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `options` | [`Options`](../wiki/Options) | Atlasify Options class |

#### Defined in

[src/atlasify.ts:190](https://github.com/soimy/atlasify/blob/c9f928b/src/atlasify.ts#L190)

## Properties

### \_atlas

• `Private` **\_atlas**: [`Atlas`](../wiki/Exports#atlas)[] = `[]`

#### Defined in

[src/atlasify.ts:547](https://github.com/soimy/atlasify/blob/c9f928b/src/atlasify.ts#L547)

___

### \_debugColor

• `Private` **\_debugColor**: `number` = `0xff000088`

#### Defined in

[src/atlasify.ts:545](https://github.com/soimy/atlasify/blob/c9f928b/src/atlasify.ts#L545)

___

### \_dirty

• `Private` **\_dirty**: `number` = `0`

#### Defined in

[src/atlasify.ts:548](https://github.com/soimy/atlasify/blob/c9f928b/src/atlasify.ts#L548)

___

### \_exporter

• `Private` **\_exporter**: `Exporter`

#### Defined in

[src/atlasify.ts:574](https://github.com/soimy/atlasify/blob/c9f928b/src/atlasify.ts#L574)

___

### \_inputPaths

• `Private` **\_inputPaths**: `string`[]

#### Defined in

[src/atlasify.ts:542](https://github.com/soimy/atlasify/blob/c9f928b/src/atlasify.ts#L542)

___

### \_packer

• `Private` **\_packer**: `MaxRectsPacker`<[`Sheet`](../wiki/Sheet)\>

#### Defined in

[src/atlasify.ts:544](https://github.com/soimy/atlasify/blob/c9f928b/src/atlasify.ts#L544)

___

### \_sheets

• `Private` **\_sheets**: [`Sheet`](../wiki/Sheet)[]

#### Defined in

[src/atlasify.ts:543](https://github.com/soimy/atlasify/blob/c9f928b/src/atlasify.ts#L543)

___

### \_spritesheets

• `Private` **\_spritesheets**: [`Spritesheet`](../wiki/Exports#spritesheet)[] = `[]`

#### Defined in

[src/atlasify.ts:561](https://github.com/soimy/atlasify/blob/c9f928b/src/atlasify.ts#L561)

___

### options

• **options**: [`Options`](../wiki/Options)

## Accessors

### atlas

• `get` **atlas**(): [`Atlas`](../wiki/Exports#atlas)[]

Get all atlas/image array

note: this will only available with all async image load & packing done.

**`readonly`**

**`memberof`** Atlasify

#### Returns

[`Atlas`](../wiki/Exports#atlas)[]

#### Defined in

[src/atlasify.ts:559](https://github.com/soimy/atlasify/blob/c9f928b/src/atlasify.ts#L559)

___

### exporter

• `get` **exporter**(): `Exporter`

#### Returns

`Exporter`

#### Defined in

[src/atlasify.ts:575](https://github.com/soimy/atlasify/blob/c9f928b/src/atlasify.ts#L575)

___

### spritesheets

• `get` **spritesheets**(): [`Spritesheet`](../wiki/Exports#spritesheet)[]

Get all serialized spritesheets array.

note: this will only available with all async image load & packing done.

**`readonly`**

**`memberof`** Atlasify

#### Returns

[`Spritesheet`](../wiki/Exports#spritesheet)[]

#### Defined in

[src/atlasify.ts:572](https://github.com/soimy/atlasify/blob/c9f928b/src/atlasify.ts#L572)

## Methods

### addBuffers

▸ **addBuffers**(`buffers`, `callback`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `buffers` | `Buffer`[] |
| `callback` | (`atlas`: [`Atlas`](../wiki/Exports#atlas)[], `spritesheets`: [`Spritesheet`](../wiki/Exports#spritesheet)[]) => `void` |

#### Returns

`void`

#### Defined in

[src/atlasify.ts:377](https://github.com/soimy/atlasify/blob/c9f928b/src/atlasify.ts#L377)

___

### addURLs

▸ **addURLs**(`paths`, `callback?`): `Promise`<[`Atlasify`](../wiki/Atlasify)\>

Add arrays of pathalike images url and do packing

**`memberof`** Atlasify

#### Parameters

| Name | Type |
| :------ | :------ |
| `paths` | `string`[] |
| `callback?` | (`err?`: `Error`, `atlas?`: [`Atlas`](../wiki/Exports#atlas)[], `spritesheets?`: [`Spritesheet`](../wiki/Exports#spritesheet)[]) => `void` |

#### Returns

`Promise`<[`Atlasify`](../wiki/Atlasify)\>

#### Defined in

[src/atlasify.ts:210](https://github.com/soimy/atlasify/blob/c9f928b/src/atlasify.ts#L210)

___

### getLeafFolder

▸ `Private` **getLeafFolder**(`pathalike`): `undefined` \| `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `pathalike` | `string` |

#### Returns

`undefined` \| `string`

#### Defined in

[src/atlasify.ts:577](https://github.com/soimy/atlasify/blob/c9f928b/src/atlasify.ts#L577)

___

### load

▸ **load**(`pathalike`, `overrides?`): `Promise`<[`Atlasify`](../wiki/Atlasify)\>

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `pathalike` | `string` | `undefined` |
| `overrides` | `any` | `null` |

#### Returns

`Promise`<[`Atlasify`](../wiki/Atlasify)\>

#### Defined in

[src/atlasify.ts:476](https://github.com/soimy/atlasify/blob/c9f928b/src/atlasify.ts#L476)

___

### metricFromImage

▸ `Private` **metricFromImage**(`image`, `imgPath`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `image` | `Jimp` |
| `imgPath` | `string` |

#### Returns

`void`

#### Defined in

[src/atlasify.ts:227](https://github.com/soimy/atlasify/blob/c9f928b/src/atlasify.ts#L227)

___

### next

▸ **next**(): `number`

Enclose previous packing bin and start a new one.

**`memberof`** Atlasify

#### Returns

`number`

#### Defined in

[src/atlasify.ts:387](https://github.com/soimy/atlasify/blob/c9f928b/src/atlasify.ts#L387)

___

### pack

▸ **pack**(`callback?`): `Promise`<[`Atlasify`](../wiki/Atlasify)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `callback?` | (`err?`: `Error`, `atlas?`: [`Atlas`](../wiki/Exports#atlas)[], `spritesheets?`: [`Spritesheet`](../wiki/Exports#spritesheet)[]) => `void` |

#### Returns

`Promise`<[`Atlasify`](../wiki/Atlasify)\>

#### Defined in

[src/atlasify.ts:288](https://github.com/soimy/atlasify/blob/c9f928b/src/atlasify.ts#L288)

___

### pruneTagIndex

▸ `Private` **pruneTagIndex**(`tagCount`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `tagCount` | `Object` |

#### Returns

`void`

#### Defined in

[src/atlasify.ts:582](https://github.com/soimy/atlasify/blob/c9f928b/src/atlasify.ts#L582)

___

### save

▸ **save**(`humanReadable?`): `Promise`<`string`\>

Async serialize current project & settings to string

**`memberof`** Atlasify

#### Parameters

| Name | Type |
| :------ | :------ |
| `humanReadable?` | `boolean` |

#### Returns

`Promise`<`string`\>

>}

#### Defined in

[src/atlasify.ts:399](https://github.com/soimy/atlasify/blob/c9f928b/src/atlasify.ts#L399)

▸ **save**(`humanReadable?`, `pathalike?`): `Promise`<`boolean`\>

Asycn save current project & settings to file

**`memberof`** Atlasify

#### Parameters

| Name | Type |
| :------ | :------ |
| `humanReadable?` | `boolean` |
| `pathalike?` | `string` |

#### Returns

`Promise`<`boolean`\>

>}

#### Defined in

[src/atlasify.ts:408](https://github.com/soimy/atlasify/blob/c9f928b/src/atlasify.ts#L408)

___

### Load

▸ `Static` **Load**(`pathalike`, `overrides?`): `Promise`<[`Atlasify`](../wiki/Atlasify)\>

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `pathalike` | `string` | `undefined` |
| `overrides` | `any` | `null` |

#### Returns

`Promise`<[`Atlasify`](../wiki/Atlasify)\>

#### Defined in

[src/atlasify.ts:471](https://github.com/soimy/atlasify/blob/c9f928b/src/atlasify.ts#L471)
