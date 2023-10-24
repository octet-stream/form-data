# formdata-node

## 6.0.0

### Major Changes

- [`324a9a5`](https://github.com/octet-stream/form-data/commit/324a9a59ac6d6ca623269545355b8000de227cc2) Thanks [@octet-stream](https://github.com/octet-stream)! - Drop [node-domexception](https://github.com/jimmywarting/node-domexception) in favour of Node.js' builtins. Consider polyfilling [DOMException](https://developer.mozilla.org/en-US/docs/Web/API/DOMException) if you want to run this package in older environment

- [`324a9a5`](https://github.com/octet-stream/form-data/commit/324a9a59ac6d6ca623269545355b8000de227cc2) Thanks [@octet-stream](https://github.com/octet-stream)! - Bring back CJS support via tsup. You can now import package in both ES and CJS modules

- [`324a9a5`](https://github.com/octet-stream/form-data/commit/324a9a59ac6d6ca623269545355b8000de227cc2) Thanks [@octet-stream](https://github.com/octet-stream)! - Drop [web-streams-polyfill](https://github.com/MattiasBuelens/web-streams-polyfill) in favour of Node.js' builtins. Consider polyfilling [ReadableStream](https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream) if you want to run this package in older environment

- [`47a3ff8`](https://github.com/octet-stream/form-data/commit/47a3ff8bc131dec70251927de066891b0b930b69) Thanks [@octet-stream](https://github.com/octet-stream)! - Add ReadableStream w/o Symbol.asyncIterator support in Blob

- [`0f68880`](https://github.com/octet-stream/form-data/commit/0f688808f8c9eeefe8fdb384e7c5b2e7094bdfeb) Thanks [@octet-stream](https://github.com/octet-stream)! - Add typings tests to make sure FormData, Blob and File compatible with globally available BodyInit type

- [`47a3ff8`](https://github.com/octet-stream/form-data/commit/47a3ff8bc131dec70251927de066891b0b930b69) Thanks [@octet-stream](https://github.com/octet-stream)! - Drop Node.js 16. Now minimal required version is 18.0.0
