---
id: "Atlasify"
title: "Class: Atlasify"
sidebar_label: "Atlasify"
sidebar_position: 0
custom_edit_url: null
---

## Constructors

### constructor

• **new Atlasify**(`options`)

Creates an instance of Atlasify.

**`memberof`** Atlasify

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `options` | [`Options`](Options) | Atlasify Options class |

#### Defined in

[atlasify.ts:190](https://github.com/soimy/atlasify/blob/c9f928b/src/atlasify.ts#L190)

## Properties

### options

• **options**: [`Options`](Options)

## Accessors

### atlas

• `get` **atlas**(): [`Atlas`](../modules#atlas)[]

Get all atlas/image array

note: this will only available with all async image load & packing done.

**`readonly`**

**`memberof`** Atlasify

#### Returns

[`Atlas`](../modules#atlas)[]

#### Defined in

[atlasify.ts:559](https://github.com/soimy/atlasify/blob/c9f928b/src/atlasify.ts#L559)

___

### exporter

• `get` **exporter**(): [`Exporter`](Exporter)

#### Returns

[`Exporter`](Exporter)

#### Defined in

[atlasify.ts:575](https://github.com/soimy/atlasify/blob/c9f928b/src/atlasify.ts#L575)

___

### spritesheets

• `get` **spritesheets**(): [`Spritesheet`](../modules#spritesheet)[]

Get all serialized spritesheets array.

note: this will only available with all async image load & packing done.

**`readonly`**

**`memberof`** Atlasify

#### Returns

[`Spritesheet`](../modules#spritesheet)[]

#### Defined in

[atlasify.ts:572](https://github.com/soimy/atlasify/blob/c9f928b/src/atlasify.ts#L572)

## Methods

### addBuffers

▸ **addBuffers**(`buffers`, `callback`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `buffers` | `Buffer`[] |
| `callback` | (`atlas`: [`Atlas`](../modules#atlas)[], `spritesheets`: [`Spritesheet`](../modules#spritesheet)[]) => `void` |

#### Returns

`void`

#### Defined in

[atlasify.ts:377](https://github.com/soimy/atlasify/blob/c9f928b/src/atlasify.ts#L377)

___

### addURLs

▸ **addURLs**(`paths`, `callback?`): `Promise`<[`Atlasify`](Atlasify)\>

Add arrays of pathalike images url and do packing

**`memberof`** Atlasify

#### Parameters

| Name | Type |
| :------ | :------ |
| `paths` | `string`[] |
| `callback?` | (`err?`: `Error`, `atlas?`: [`Atlas`](../modules#atlas)[], `spritesheets?`: [`Spritesheet`](../modules#spritesheet)[]) => `void` |

#### Returns

`Promise`<[`Atlasify`](Atlasify)\>

#### Defined in

[atlasify.ts:210](https://github.com/soimy/atlasify/blob/c9f928b/src/atlasify.ts#L210)

___

### load

▸ **load**(`pathalike`, `overrides?`): `Promise`<[`Atlasify`](Atlasify)\>

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `pathalike` | `string` | `undefined` |
| `overrides` | `any` | `null` |

#### Returns

`Promise`<[`Atlasify`](Atlasify)\>

#### Defined in

[atlasify.ts:476](https://github.com/soimy/atlasify/blob/c9f928b/src/atlasify.ts#L476)

___

### next

▸ **next**(): `number`

Enclose previous packing bin and start a new one.

**`memberof`** Atlasify

#### Returns

`number`

#### Defined in

[atlasify.ts:387](https://github.com/soimy/atlasify/blob/c9f928b/src/atlasify.ts#L387)

___

### pack

▸ **pack**(`callback?`): `Promise`<[`Atlasify`](Atlasify)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `callback?` | (`err?`: `Error`, `atlas?`: [`Atlas`](../modules#atlas)[], `spritesheets?`: [`Spritesheet`](../modules#spritesheet)[]) => `void` |

#### Returns

`Promise`<[`Atlasify`](Atlasify)\>

#### Defined in

[atlasify.ts:288](https://github.com/soimy/atlasify/blob/c9f928b/src/atlasify.ts#L288)

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

[atlasify.ts:399](https://github.com/soimy/atlasify/blob/c9f928b/src/atlasify.ts#L399)

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

[atlasify.ts:408](https://github.com/soimy/atlasify/blob/c9f928b/src/atlasify.ts#L408)

___

### Load

▸ `Static` **Load**(`pathalike`, `overrides?`): `Promise`<[`Atlasify`](Atlasify)\>

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `pathalike` | `string` | `undefined` |
| `overrides` | `any` | `null` |

#### Returns

`Promise`<[`Atlasify`](Atlasify)\>

#### Defined in

[atlasify.ts:471](https://github.com/soimy/atlasify/blob/c9f928b/src/atlasify.ts#L471)
