import {deprecate} from "util"

function deprecateGetComputedLength(
  _t: unknown,
  _k: string,
  descriptor: PropertyDescriptor
) {
  descriptor.value = deprecate(
    descriptor.value!,

    "FormData#getComputedLength() method is non-standard and will be "
      + "removed from this package in the next major release (4.x). "
      + "Use https://npmjs.com/form-data-encoder package to serilize FormData."
  )
}

export default deprecateGetComputedLength
