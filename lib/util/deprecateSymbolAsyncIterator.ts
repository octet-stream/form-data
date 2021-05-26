import {deprecate} from "util"

function deprecateSymbolAsyncIterator(
  _t: unknown,
  _k: Symbol,
  descriptor: PropertyDescriptor
) {
  descriptor.value = deprecate(
    descriptor.value!,

    "FormData#[Symbol.asyncIterator]() method is non-standard and will be "
      + "removed from this package in the next major release (4.x). "
      + "Use https://npmjs.com/form-data-encoder package to serilize FormData."
  )
}

export default deprecateSymbolAsyncIterator
