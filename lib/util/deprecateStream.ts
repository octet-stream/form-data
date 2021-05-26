import {deprecate} from "util"

function deprecateReadStream(
  _t: unknown,
  _k: string,
  descriptor: PropertyDescriptor
) {
  const fn = deprecate(
    descriptor.get!,

    "FormData#stream property is non-standard and will be removed "
      + "from this package in the next major release (4.x). "
      + "Use https://npmjs.com/form-data-encoder package to serilize FormData."
  )

  descriptor.get = function () {
    return fn.call(this)
  }
}

export default deprecateReadStream
