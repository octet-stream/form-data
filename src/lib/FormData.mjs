import stream from "stream"
import util from "util"
import path from "path"

import mimes from "mime-types"

import getStreamIterator from "./util/getStreamIterator"
import getLength from "./util/getLength"
import isObject from "./util/isObject"
import isBuffer from "./util/isBuffer"
import isStream from "./util/isStream"
import boundary from "./util/boundary"
import isBlob from "./util/isBlob"
import concat from "./util/concat"
import toFile from "./util/toFile"
import bind from "./util/bind"

const isArray = Array.isArray

/**
 * FormData implementation for Node.js environments.
 * Bult over Readable stream and async generators.
 * Can be used to communicate between servers with multipart/form-data format.
 *
 * @api public
 */
class FormData {
  /**
   * @param {array} fields – an optional FormData initial fields.
   *   Each initial field should be passed as a collection of the objects
   *   with "name", "value" and "filename" props.
   *   See the FormData#append for more info about the available format.
   */
  constructor(entries = null) {
    bind([
      Symbol.iterator, Symbol.asyncIterator,
      "toString", "inspect",
      "keys", "values", "entries"
    ], this)

    this.__carriage = "\r\n"
    this.__defaultContentType = "application/octet-stream"

    this.__dashes = "--"
    this.__boundary = concat(["NodeJSFormDataStream", boundary()])

    this.__content = new Map()

    this.__curr = this.__getField()

    this.__stream = new stream.Readable({read: this.__read})

    if (isArray(entries)) {
      this.__appendFromInitialFields(entries)
    }
  }

  /**
   * @private
   */
  __getMime = filename => mimes.lookup(filename) || this.__defaultContentType

  /**
   * @private
   */
  __getHeader(name, filename) {
    const head = [
      this.__dashes, this.__boundary, this.__carriage,
      "Content-Disposition: form-data; ", `name="${name}"`,
    ]

    if (filename) {
      head.push(`; filename="${filename}"${this.__carriage}`)
      head.push("Content-Type: ", this.__getMime(filename))
    }

    head.push(this.__carriage.repeat(2))

    return concat(head)
  }

  /**
   * @private
   */
  __getFooter = () => concat([
    this.__dashes, this.__boundary,
    this.__dashes, this.__carriage.repeat(2)
  ])

  /**
   * Get each field from internal Map
   *
   * @private
   */
  async* __getField() {
    for (const [name, {values, filename}] of this.__content) {
      // Set field header
      yield this.__getHeader(name, filename)

      for (const value of values) {
        if (isBlob(value)) {
          yield* getStreamIterator(value.stream())
        } else if (isStream(value)) {
          // Read the stream content
          yield* getStreamIterator(value)
        } else {
          yield value
        }
      }

      // Add trailing carriage
      yield this.__carriage
    }

    // Add a footer when all fields ended
    yield this.__getFooter()
  }

  /**
   * Read values from internal storage and push it to the internal stream
   *
   * @return {void}
   *
   * @private
   */
  __read = () => {
    const onFulfilled = ({done, value}) => {
      if (done) {
        return this.__stream.push(null)
      }

      this.__stream.push(isBuffer(value) ? value : Buffer.from(String(value)))
    }

    const onRejected = err => this.__stream.emit("error", err)

    this.__curr.next().then(onFulfilled).catch(onRejected)
  }

  /**
   * Append initial fields
   *
   * @param {array} fields
   *
   * @return {void}
   *
   * @private
   */
  __appendFromInitialFields = fields => {
    for (const field of fields) {
      if (isObject(field) && !isArray(field)) {
        this.append(field.name, field.value, field.filename)
      }
    }
  }

  /**
   * Appends a new value onto an existing key inside a FormData object,
   * or adds the key if it does not already exist.
   *
   * @param {string} name – The name of the field whose data
   *   is contained in value
   *
   * @param {any} value – The field value. You can pass any primitive type
   *   (including null and undefined), Buffer or Readable stream.
   *   Note that Arrays and Object will be converted to string
   *   by using String function.
   *
   * @param {string} [filename = undefined] A filename of given field.
   *   Can be added only for Buffer and Readable
   *
   * @param {object} [options = {}] An object with additional paramerets.
   *
   * @return {void}
   *
   * @private
   */
  __setField(name, value, filename, options, append, argsLength) {
    const methodName = append ? "append" : "set"

    if (isObject(filename)) {
      [options, filename] = [filename, undefined]
    }

    // FormData required at least 2 arguments to be set.
    if (argsLength < 2) {
      throw new TypeError(
        `Failed to execute '${methodName}' on 'FormData': ` +
        `2 arguments required, but only ${argsLength} present.`
      )
    }

    // FormData requires the second argument to be some kind of binary data
    // when a filename has been set.
    if (filename && !(isBlob(value) || isStream(value) || isBuffer(value))) {
      throw new TypeError(
        `Failed to execute '${methodName}' on 'FormData': ` +
        "parameter 2 is not one of the following types: ",
        "ReadableStream | ReadStream | Readable | Buffer | File | Blob"
      )
    }

    // Get a filename for Buffer, Blob, File, ReadableStream and Readable values
    if (isBuffer(value) && filename) {
      filename = path.basename(filename)
    } else if (isBlob(value)) {
      filename = path.basename(value.name || filename)
    } else if (isStream(value) && (value.path || filename)) {
      // Readable stream which created from fs.createReadStream
      // have a "path" property. So, we can get a "filename"
      // from the stream itself.
      filename = path.basename(value.path || filename)
    }

    // Normalize field content
    if (isStream(value)) {
      if (options.size != null) {
        value = toFile(value, filename || name, options)
      }
    } else if (isBlob(value) || isBuffer(value)) {
      value = toFile(value, filename || name, options)
    } else {
      value = String(value)
    }

    const field = this.__content.get(name)

    // Set a new field if given name is not exists
    if (!field) {
      return void this.__content.set(name, {append, filename, values: [value]})
    }

    // Replace a value of the existing field if "set" called
    if (!append) {
      return void this.__content.set(name, {append, filename, values: [value]})
    }

    // Do nothing if the field has been created from .set()
    if (!field.append) {
      return undefined
    }

    // Append a new value to the existing field
    field.values.push(value)

    this.__content.set(name, field)
  }

  /**
   * Returns boundary string
   *
   * @return {string}
   *
   * @public
   */
  get boundary() {
    return this.__boundary
  }

  /**
   * Returns headers for multipart/form-data
   */
  get headers() {
    return {
      "Content-Type": concat([
        "multipart/form-data; ", "boundary=", this.boundary
      ])
    }
  }

  /**
   * Returns the internal stream
   *
   * @return {stream.Readable}
   *
   * @public
   */
  get stream() {
    return this.__stream
  }

  /**
   * Returns computed length of the FormData content.
   * If data contains stream.Readable field(s),
   * the method will always return undefined.
   *
   * @return {number}
   */
  async getComputedLength() {
    if (this.__content.size === 0) {
      return 0
    }

    let length = 0
    const carriageLength = Buffer.from(this.__carriage).length

    for (const [name, {filename, values}] of this.__content) {
      length += Buffer.from(this.__getHeader(name, filename)).length

      for (const value of values) {
        const valueLength = await getLength(value)

        if (valueLength == null) {
          return undefined
        }

        length += Number(valueLength)
      }

      length += carriageLength
    }

    length += Buffer.from(this.__getFooter()).length

    return length
  }

  /**
   * Appends a new value onto an existing key inside a FormData object,
   * or adds the key if it does not already exist.
   *
   * @param {string} name – The name of the field whose data
   *   is contained in value
   *
   * @param {any} value – The field value. You can pass any primitive type
   *   (including null and undefined), Buffer or Readable stream.
   *   Note that Arrays and Object will be converted to string
   *   by using String function.
   *
   * @param {string} [filename = undefined] A filename of given field.
   *   Can be added only for Buffer and Readable
   *
   * @return {void}
   *
   * @public
   */
  append(name, value, filename = undefined, options = {}) {
    return this.__setField(
      name, value, filename, options, true, arguments.length
    )
  }

  /**
   * Set a new value for an existing key inside FormData,
   * or add the new field if it does not already exist.
   *
   * @param {string} name – The name of the field whose data
   *   is contained in value
   *
   * @param {any} value – The field value. You can pass any primitive type
   *   (including null and undefined), Buffer or Readable stream.
   *   Note that Arrays and Object will be converted to string
   *   by using String function.
   *
   * @param {string} [filename = undefined] A filename of given field.
   *   Can be added only for Buffer and Readable
   *
   * @return {void}
   *
   * @public
   */
  set(name, value, filename = undefined, options = {}) {
    return this.__setField(
      name, value, filename, options, false, arguments.length
    )
  }

  /**
   * Check if a field with the given name exists inside FormData.
   *
   * @param {string} name – A name of the field you want to test for.
   *
   * @return {boolean}
   *
   * @public
   */
  has(name) {
    return this.__content.has(name)
  }

  /**
   * Returns the first value associated with the given name.
   * Buffer and Readable values will be returned as-is.
   *
   * @param {string} name – A name of the value you want to retrieve.
   *
   * @public
   */
  get(name) {
    const field = this.__content.get(name)

    if (!field) {
      return undefined
    }

    return field.values[0]
  }

  /**
   * Returns all the values associated with
   * a given key from within a FormData object.
   *
   * @param {string} name – A name of the value you want to retrieve.
   *
   * @public
   */
  getAll(name) {
    const field = this.__content.get(name)

    return field ? Array.from(field.values) : []
  }

  /**
   * Deletes a key and its value(s) from a FormData object.
   *
   * @param {string} name – The name of the key you want to delete.
   *
   * @public
   */
  delete(name) {
    this.__content.delete(name)
  }

  /**
   * Returns a string representation of the FormData
   *
   * @return {string}
   */
  toString() {
    return "[object FormData]"
  }

  /**
   * Alias of the FormData#[util.inspect.custom]()
   *
   * @return {string}
   */
  inspect = this[util.inspect.custom]

  get [Symbol.toStringTag]() {
    return "FormData"
  }

  /**
   * @return {IterableIterator<string>}
   */
  * keys() {
    for (const key of this.__content.keys()) {
      yield key
    }
  }

  /**
   * @return {IterableIterator<[string, any]>}
   */
  * entries() {
    for (const name of this.keys()) {
      const values = this.getAll(name)

      // Yield each value of a field, like browser-side FormData does.
      for (const value of values) {
        yield [name, value]
      }
    }
  }

  /**
   * @return {IterableIterator<any>}
   */
  * values() {
    for (const [, values] of this) {
      yield values
    }
  }

  /**
   * Executes a given callback for each field of the FormData instance
   *
   * @param {function} fn – Function to execute for each element,
   *   taking three arguments:
   *     + {any} value – A value(s) of the current field.
   *     + {string} – Name of the current field.
   *     + {FormData} fd – The FormData instance that forEach
   *       is being applied to
   *
   * @param {any} [ctx = null]
   *
   * @public
   */
  forEach(fn, ctx = null) {
    for (const [name, value] of this) {
      fn.call(ctx, value, name, this)
    }
  }

  /**
   * @return {IterableIterator<[string, any]>}
   */
  [Symbol.iterator]() {
    return this.entries()
  }

  /**
   * This method allows to read a content from internal stream
   * using async generators and for-await-of APIs
   *
   * @return {IterableIterator<Promise<Buffer>>}
   *
   * @public
   */
  [Symbol.asyncIterator]() {
    return this.stream[Symbol.asyncIterator]()
  }

  [util.inspect.custom]() {
    return "FormData"
  }
}

export default FormData
