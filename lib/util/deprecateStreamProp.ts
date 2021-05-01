import {deprecate} from "util"

function deprecateReadStream(
  _t: unknown,
  _k: string,
  descriptor: PropertyDescriptor
) {
  const fn = deprecate(
    descriptor.get!,
    "To create a stream from the instance use Readable.from(formData) instead"
  )

  descriptor.get = function () {
    return fn.call(this)
  }
}

export default deprecateReadStream
