import {Readable} from "stream"
import {basename} from "path"

import invariant from "@octetstream/invariant"
import mimes from "mime-types"

import bind from "./util/bind"
import concat from "./util/concat"
import isBuffer from "./util/isBuffer"
import isReadable from "./util/isReadable"
import nextTick from "./util/nextTick"
import boundary from "./util/boundary"

import StreamIterator from "./util/StreamIterator"

const isString = val => typeof val === "string"

class FormData {
  constructor() {
    bind([
      Symbol.iterator, Symbol.asyncIterator, "keys", "values", "entries"
    ], this)

    this.__caret = "\r\n"
    this.__defaultContentType = "application/octet-steam"

    this.__dashes = "--"
    this.__boundary = concat("NodeJSFormDataStream", boundary())


    this.__contents = new Map()
    this.__entries = this.__contents.entries()

    this.__curr = this.__getField()

    const read = this.__read

    this.__stream = new Readable({read})

    this.headers = {
      "Content-Type": concat(
        "multipart/form-data; boundary=", this.__boundary
      )
    }
  }

  __getMime = filename => mimes.lookup(filename) || this.__defaultContentType

  __getHeader(name, filename) {
    const head = [
      this.__dashes, this.__boundary, this.__caret,
      "Content-Disposition: form-data; ", `name="${name}"`,
    ]

    if (filename) {
      head.push(`; filename="${filename}"${this.__caret}`)
      head.push(`Content-Type: "${this.__getMime(filename)}"`)
    }

    head.push(this.__caret.repeat(2))

    return Buffer.from(concat(head))
  }

  __getFooter = () => (
    Buffer.from(
      concat(
        this.__dashes, this.__boundary,
        this.__dashes, this.__caret.repeat(2)
      )
    )
  )

  /**
   * @private
   */
  async* __getField() {
    while (true) {
      await nextTick()

      const curr = this.__entries.next()

      if (curr.done === true) {
        yield this.__getFooter()

        return
      }

      const [name, {value, filename}] = curr.value

      yield this.__getHeader(name, filename)

      if (isReadable(value)) {
        const iterator = new StreamIterator(value)

        for await (const ch of iterator) {
          yield ch
        }
      } else {
        yield isBuffer(value) ? value : Buffer.from(value)
      }

      yield Buffer.from(this.__caret)
    }
  }

  /**
   * @private
   */
  __read = () => {
    const onFulfilled = curr => {
      if (curr.done) {
        return this.__stream.push(null)
      }

      const ch = curr.value

      this.__stream.push(ch)
    }

    const onRejected = err => this.__stream.emit("error", err)

    this.__curr.next().then(onFulfilled, onRejected)
  }

  __setField(name, value, filename, append = false) {
    invariant(
      !isString(name), TypeError,
      "Field name should be a string. Received %s", typeof name
    )

    invariant(
      filename && !isString(filename), TypeError,
      "Filename should be a string (if passed). Received %s", typeof filename
    )

    if (isBuffer(value) && filename) {
      filename = basename(filename)
    } else if (isReadable(value) && (value.path || filename)) {
      filename = basename(value.path || filename)
    } else {
      value = String(value)
    }

    append = Boolean(append)

    this.__contents.set(String(name), {append, value, filename})
  }

  get boundary() {
    return this.__boundary
  }

  // append = (name, value, filename) => {
  //   if (this.has(name) === false) {
  //     return this.__setField(name, value, filename, true)
  //   }

  //   const field = this.get(name)

  //   if (field.append === true) {
  //     this.__setField(name, `${field.value}${value}`, filename)
  //   }
  // }

  /**
   * Set new field on FormData
   *
   * @param {string} name – field name
   * @param {any} value – field value
   */
  set = (name, value, filename) => this.__setField(name, value, filename)

  has = name => this.__contents.has(name)

  // NOTE: This method should return only the first field value.
  // I should add this behaviour somehow
  get = name => {
    const field = this.__contents.get(name)

    return field ? field.value : void 0
  }

  // TODO: Implement this method due to spec
  // getAll = () => {}

  delete = name => void this.__contents.delete(name)

  pipe = (dest, options) => this.__stream.pipe(dest, options)

  on = (name, fn) => {
    this.__stream.on(name, fn)

    return this
  }

  [Symbol.iterator]() {
    return this.__contents[Symbol.iterator]()
  }

  [Symbol.asyncIterator]() {
    return new StreamIterator(this.__stream)
  }

  keys() {
    return this.__contents.keys()
  }

  values() {
    return this.__contents.values()
  }

  entries() {
    return this.__contents.entries()
  }

  toString() {
    return "[object FormData]"
  }

  inspect() {
    return "FormData { }"
  }
}

export default FormData
