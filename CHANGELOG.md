# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [0.5.7](https://github.com/soimy/atlasify/compare/v0.5.6...v0.5.7) (2026-02-23)


### Bug Fixes

* **ci:** restore `registry-url` in setup-node to unblock npm OIDC trusted publishing ([#65](https://github.com/soimy/atlasify/issues/65)) ([2f0607b](https://github.com/soimy/atlasify/commit/2f0607b6acf6f4baba0e79ae06cf8e4e762c7aa6))

### [0.5.6](https://github.com/soimy/atlasify/compare/v0.5.5...v0.5.6) (2026-02-23)

### [0.5.5](https://github.com/soimy/atlasify/compare/v0.5.4...v0.5.5) (2026-02-23)

### [0.5.4](https://github.com/soimy/atlasify/compare/v0.5.3...v0.5.4) (2026-02-23)

### [0.5.3](https://github.com/soimy/atlasify/compare/v0.5.2...v0.5.3) (2026-02-23)

### [0.5.2](https://github.com/soimy/atlasify/compare/v0.5.1...v0.5.2) (2026-02-23)

### [0.5.1](https://github.com/soimy/atlasify/compare/v0.5.0...v0.5.1) (2026-02-23)

## [0.5.0](https://github.com/soimy/atlasify/compare/v0.4.1...v0.5.0) (2026-02-23)


### Features

* Add initial agent system infrastructure, including skills, workflows, and agent definitions. ([5178da9](https://github.com/soimy/atlasify/commit/5178da9cf01b0f237b7f884384390f03363ec512))
* upgrade deps and migrate image pipeline to sharp ([008b190](https://github.com/soimy/atlasify/commit/008b190d487856bd8d2d8ad35a85f2019d75a85d))

### [0.4.1](https://github.com/soimy/atlasify/compare/v0.4.0...v0.4.1) (2020-09-18)


### Bug Fixes

* Upstream fix on non-exclusive tag option in maxrects-packer ([c06c3b6](https://github.com/soimy/atlasify/commit/c06c3b6))



## [0.4.0](https://github.com/soimy/atlasify/compare/v0.3.0...v0.4.0) (2020-09-17)


### Features

* New option `--group-folder` ([4e6183a](https://github.com/soimy/atlasify/commit/4e6183a))



## [0.3.0](https://github.com/soimy/atlasify/compare/v0.2.0...v0.3.0) (2020-02-01)


### Bug Fixes

* --search-dummy use pixelMatch to do deep compare ([be61458](https://github.com/soimy/atlasify/commit/be61458))
* detect duplicate dummy in loaded sheets ([4bf489c](https://github.com/soimy/atlasify/commit/4bf489c))
* Fix alpha premultiplied black edge issue ([a0db046](https://github.com/soimy/atlasify/commit/a0db046))
* Fix multi spritesheet image filename sequence bug ([45d4a56](https://github.com/soimy/atlasify/commit/45d4a56)), closes [#8](https://github.com/soimy/atlasify/issues/8)
* Fix prune index not working on id=0 ([c03204a](https://github.com/soimy/atlasify/commit/c03204a))
* loaded sheet should preserve saved metric ([f741692](https://github.com/soimy/atlasify/commit/f741692)), closes [#6](https://github.com/soimy/atlasify/issues/6)
* Tagcount 0 eq. null bug ([c554cdb](https://github.com/soimy/atlasify/commit/c554cdb)), closes [#8](https://github.com/soimy/atlasify/issues/8)


### Features

* Add --search-dummy option ([2f59717](https://github.com/soimy/atlasify/commit/2f59717))



## 0.2.0 (2019-07-11)


### Features

* Implemented save/load function and CLI [#3](https://github.com/soimy/atlasify/issues/3) ([c2702e0](https://github.com/soimy/atlasify/commit/c2702e0))
