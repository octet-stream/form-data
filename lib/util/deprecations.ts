import {deprecate} from "util"

import noop from "./noop"

export const deprecateBoundary = deprecate(
  noop,

  "FormData#boundary property is non-standard and will be removed "
    + "from this package in the next major release (4.x). "
    + "Use https://npmjs.com/form-data-encoder package to serilize FormData."
)

export const deprecateHeaders = deprecate(
  noop,

  "FormData#headers property is non-standard and will be removed "
    + "from this package in the next major release (4.x). "
    + "Use https://npmjs.com/form-data-encoder package to serilize FormData."
)

export const deprecateStream = deprecate(
  noop,

  "FormData#stream property is non-standard and will be removed "
    + "from this package in the next major release (4.x). "
    + "Use https://npmjs.com/form-data-encoder package to serilize FormData."
)

export const deprecateBuffer = deprecate(
  noop,

  "The usage of Buffer in entry's value is deprecated. "
    + "Use Blob, File, fileFromPath() or fileFromPathSync() instead."
)

export const deprecateReadStream = deprecate(
  noop,

  "The usage of ReadStream in entry's value is deprecated. "
    + "Use Blob, File, fileFromPath or fileFromPathSync() instead."
)

export const deprecateOptions = deprecate(
  noop,

  "The options argument is non-standard and will be removed "
    + "from this package in the next major release (4.x)."
)

export const deprecateGetComputedLength = deprecate(
  noop,

  "FormData#getComputedLength() method is non-standard and will be "
    + "removed from this package in the next major release (4.x). "
    + "Use https://npmjs.com/form-data-encoder package to serilize FormData."
)

export const deprecateSymbolAsyncIterator = deprecate(
  noop,

  "FormData#[Symbol.asyncIterator]() method is non-standard and will be "
    + "removed from this package in the next major release (4.x). "
    + "Use https://npmjs.com/form-data-encoder package to serilize FormData."
)
