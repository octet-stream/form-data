import {Readable} from "stream"
import {basename} from "path"

import invariant from "@octetstream/invariant"
import mimes from "mime-types"

import bind from "./util/bind"
import concat from "./util/concat"
import nextTick from "./util/nextTick"
import boundary from "./util/boundary"

import isString from "./util/isString"

import isBuffer from "./util/isBuffer"
import isReadable from "./util/isReadable"

import StreamIterator from "./util/StreamIterator"

class FormData {
  constructor() {
    bind([
      Symbol.iterator, Symbol.asyncIterator,
      "toString", "toJSON", "inspect",
      "keys", "values", "entries"
    ], this)

    this.__carriage = "\r\n"
    this.__defaultContentType = "application/octet-steam"

    this.__dashes = "--"
    this.__boundary = concat("NodeJSFormDataStream", boundary())


    this.__contents = new Map()
    this.__entries = this.__contents.entries()

    this.__curr = this.__getField()

    const read = this.__read

    this.__stream = new Readable({read})
  }

  /**
   * Check if given value is instance of FormData
   * Note: This method is not a part of client-side FormData interface.
   *
   * @param {any} value
   *
   * @return {boolean}
   */
  static isFormData(value) {
    return value instanceof FormData
  }

  __getMime = filename => mimes.lookup(filename) || this.__defaultContentType

  __getHeader(name, filename) {
    const head = [
      this.__dashes, this.__boundary, this.__carriage,
      "Content-Disposition: form-data; ", `name="${name}"`,
    ]

    if (filename) {
      head.push(`; filename="${filename}"${this.__carriage}`)
      head.push(`Content-Type: "${this.__getMime(filename)}"`)
    }

    head.push(this.__carriage.repeat(2))

    return Buffer.from(concat(head))
  }

  __getFooter = () => (
    Buffer.from(
      concat(
        this.__dashes, this.__boundary,
        this.__dashes, this.__carriage.repeat(2)
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

      const [name, {values, filename}] = curr.value

      yield this.__getHeader(name, filename)

      for (const value of values) {
        if (isReadable(value)) {
          yield* new StreamIterator(value) // Read the stream contents
        } else {
          yield value
        }
      }

      yield this.__carriage
    }
  }

  /**
   * Read values from internal storage and push it to the internal stream
   *
   * @private
   */
  __read = () => {
    const onFulfilled = curr => {
      if (curr.done) {
        return this.__stream.push(null)
      }

      const chunk = curr.value

      this.__stream.push(isBuffer(chunk) ? chunk : Buffer.from(String(chunk)))
    }

    const onRejected = err => this.__stream.emit("error", err)

    this.__curr.next().then(onFulfilled, onRejected)
  }

  /**
   * Set a new filed to internal FormData Map object
   *
   * @param {string} name
   * @param {any} value
   * @param {string} filename
   * @param {boolean} append
   *
   * @return {void}
   */
  __setField(name, value, filename, append = false) {
    invariant(
      !isString(name), TypeError,
      "Field name should be a string. Received %s", typeof name
    )

    invariant(
      filename && !isString(filename), TypeError,
      "Filename should be a string (if passed). Received %s", typeof filename
    )

    // Try to get a filename for buffer and stream values
    if (isBuffer(value) && filename) {
      filename = basename(filename)
    } else if (isReadable(value) && (value.path || filename)) {
      filename = basename(value.path || filename)
    }

    append = Boolean(append)

    const field = this.__contents.get(name)

    // Set a new field
    if (!field) {
      return void this.__contents.set(name, {append, filename, values: [value]})
    }

    // Replace a value of the existing field if "set" called
    if (!append) {
      return void this.__contents.set(name, {append, filename, values: [value]})
    }

    if (!field.append) {
      return
    }

    // Append a new value to the existing field
    field.values.push(value)

    this.__contents.set(name, field)
  }

  /**
   * Returns boundary string
   */
  get boundary() {
    return this.__boundary
  }

  /**
   * Returns the internal stream
   *
   * @return {stream.Readable}
   */
  get stream() {
    return this.__stream
  }

  append = (name, value, filename) => this.__setField(name, value, filename, 1)

  /**
   * Set new field on FormData
   *
   * @param {string} name – field name
   * @param {any} value – field value
   * @param {string} filename
   *
   * @return {void}
   */
  set = (name, value, filename) => this.__setField(name, value, filename)

  /**
   * Check if the value with given key exists
   *
   * @param {string} name – name of a value you are looking for
   *
   * @return {boolean}
   */
  has = name => this.__contents.has(name)

  get = name => {
    const field = this.__contents.get(name)

    // NOTE: This method should return only the first field value.
    // I should add this behaviour somehow
    if (!field) {
      return void 0
    }

    const [value] = field.values

    return isBuffer(value) || isReadable(value) ? value : String(value)
  }

  getAll = name => {
    const res = []

    const field = this.__contents.get(name)

    if (field) {
      for (const value of field.values) {
        res.push(isBuffer(value) || isReadable(value) ? value : String(value))
      }
    }

    return res
  }

  delete = name => void this.__contents.delete(name)

  pipe = (dest, options) => this.__stream.pipe(dest, options)

  on = (name, fn) => {
    this.__stream.on(name, fn)

    return this
  }

  forEach = (fn, ctx = null) => {
    for (const [name, value] of this.entries()) {
      fn.call(ctx, value, name, this)
    }
  }

  toString() {
    return `[object ${this.constructor.name}]`
  }

  toJSON() {
    return this.constructor.name
  }

  inspect() {
    return this.constructor.name
  }

  * keys() {
    for (const key of this.__contents.keys()) {
      yield key
    }
  }

  * values() {
    for (const name of this.keys()) {
      const value = this.getAll(name)

      yield value.length === 1 ? value[0] : value
    }
  }

  * entries() {
    for (const name of this.keys()) {
      const value = this.getAll(name)

      yield [name, value.length === 1 ? value[0] : value]
    }
  }

  [Symbol.iterator]() {
    return this.entries()
  }

  /**
   * This method allows to read a content from internal stream
   * using async generators and for-await..of APIs
   *
   * @return {StreamIterator}
   */
  [Symbol.asyncIterator]() {
    return new StreamIterator(this.__stream)
  }
}

export default FormData
