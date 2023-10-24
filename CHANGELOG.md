# formdata-node

## 6.0.3

### Patch Changes

- [`996b4b5`](https://github.com/octet-stream/form-data/commit/996b4b528b7a54aa1f8c7ce0e002d044613958e9) Thanks [@octet-stream](https://github.com/octet-stream)! - Remove removeComments from tsconfig.json

## 6.0.2

### Patch Changes

- [`d88ffae`](https://github.com/octet-stream/form-data/commit/d88ffae5a66dd4d75b7ae4639578f3d97731dad9) Thanks [@octet-stream](https://github.com/octet-stream)! - Remove tsup config and changelog from distro

## 6.0.1

### Patch Changes

- [`32fa6da`](https://github.com/octet-stream/form-data/commit/32fa6da19096fbdd29401452d40e61ef9619343a) Thanks [@octet-stream](https://github.com/octet-stream)! - Remove changeset config from distro

## 6.0.0

### Major Changes

- [`324a9a5`](https://github.com/octet-stream/form-data/commit/324a9a59ac6d6ca623269545355b8000de227cc2) Thanks [@octet-stream](https://github.com/octet-stream)! - Drop [node-domexception](https://github.com/jimmywarting/node-domexception) in favour of Node.js' builtins. Consider polyfilling [DOMException](https://developer.mozilla.org/en-US/docs/Web/API/DOMException) if you want to run this package in older environment

- [`324a9a5`](https://github.com/octet-stream/form-data/commit/324a9a59ac6d6ca623269545355b8000de227cc2) Thanks [@octet-stream](https://github.com/octet-stream)! - Bring back CJS support via tsup. You can now import package in both ES and CJS modules

- [`324a9a5`](https://github.com/octet-stream/form-data/commit/324a9a59ac6d6ca623269545355b8000de227cc2) Thanks [@octet-stream](https://github.com/octet-stream)! - Drop [web-streams-polyfill](https://github.com/MattiasBuelens/web-streams-polyfill) in favour of Node.js' builtins. Consider polyfilling [ReadableStream](https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream) if you want to run this package in older environment

- [`47a3ff8`](https://github.com/octet-stream/form-data/commit/47a3ff8bc131dec70251927de066891b0b930b69) Thanks [@octet-stream](https://github.com/octet-stream)! - Add ReadableStream w/o Symbol.asyncIterator support in Blob

- [`0f68880`](https://github.com/octet-stream/form-data/commit/0f688808f8c9eeefe8fdb384e7c5b2e7094bdfeb) Thanks [@octet-stream](https://github.com/octet-stream)! - Add typings tests to make sure FormData, Blob and File compatible with globally available BodyInit type

- [`47a3ff8`](https://github.com/octet-stream/form-data/commit/47a3ff8bc131dec70251927de066891b0b930b69) Thanks [@octet-stream](https://github.com/octet-stream)! - Drop Node.js 16. Now minimal required version is 18.0.0
