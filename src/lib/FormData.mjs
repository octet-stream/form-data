import {Readable} from "stream"
import {inspect} from "util"
import {basename} from "path"

import mimes from "mime-types"

import getStreamIterator from "./util/getStreamIterator"
import getLength from "./util/getLength"
import isObject from "./util/isObject"
import isBuffer from "./util/isBuffer"
import isStream from "./util/isStream"
import boundary from "./util/boundary"
import readOnly from "./util/readOnly"
import isBlob from "./util/isBlob"
import toFile from "./util/toFile"

const {isArray} = Array
const {freeze} = Object

/**
 * FormData implementation for Node.js.
 *
 * @api public
 */
class FormData {
  /**
   * Generates a new boundary string once FormData instance constructed
   *
   * @type string
   *
   * @public
   */
  @readOnly boundary = `NodeJSFormDataStreamBoundary${boundary()}`

  /**
   * Returns headers for multipart/form-data
   *
   * @type object
   *
   * @public
   */
  @readOnly headers = freeze({
    "Content-Type": `multipart/form-data; boundary=${this.boundary}`
  })

  /**
   * Refers to the internal Readable stream
   *
   * @type stream.Readable
   *
   * @public
   */
  @readOnly stream = new Readable({read: () => this.__read()})

  /**
   * @type string
   *
   * @private
   */
  @readOnly __carriage = "\r\n"

  /**
   * @type string
   *
   * @private
   */
  @readOnly __dashes = "-".repeat(2)

  /**
   * @type string
   *
   * @private
   */
  @readOnly __footer = `${this.__dashes}${this.boundary}${this.__dashes}`
    + `${this.__carriage.repeat(2)}`

  /**
   * @type string
   *
   * @private
   */
  @readOnly __defaultContentType = "application/octet-stream"

  /**
   * @type Map
   *
   * @private
   */
  @readOnly __content = new Map()

  /**
   * @type AsyncIterableIterator<Buffer>
   *
   * @private
   */
  @readOnly __curr = this.__getField()

  /**
   * Returns a string representation of the FormData
   *
   * @return {string}
   */
  get [Symbol.toStringTag]() {
    return "FormData"
  }

  /**
   * @param {array} fields – an optional FormData initial fields.
   *   Each field must be passed as a collection of the objects
   *   with "name", "value" and "filename" props.
   *   See the FormData#append() method for more information.
   */
  constructor(fields = null) {
    if (isArray(fields)) {
      this.__appendFromInitialFields(fields)
    }
  }

  /**
   * Returns a mime type by field's filename
   *
   * @private
   */
  __getMime(filename) {
    return mimes.lookup(filename) || this.__defaultContentType
  }

  /**
   * Returns a headers for given field's data
   *
   * @private
   */
  __getHeader(name, filename) {
    let header = ""

    header += `${this.__dashes}${this.boundary}${this.__carriage}`
    header += `Content-Disposition: form-data; name="${name}"`

    if (filename) {
      header += `; filename="${filename}"${this.__carriage}`
      header += `Content-Type: ${this.__getMime(filename)}`
    }

    return `${header}${this.__carriage.repeat(2)}`
  }

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
    yield this.__footer
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
        return this.stream.push(null)
      }

      this.stream.push(isBuffer(value) ? value : Buffer.from(String(value)))
    }

    const onRejected = err => this.stream.emit("error", err)

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
  __appendFromInitialFields(fields) {
    for (const field of fields) {
      if (isObject(field) && !isArray(field)) {
        this.append(field.name, field.value, field.filename, field.options)
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
      filename = basename(filename)
    } else if (isBlob(value)) {
      filename = basename(value.name || filename)
    } else if (isStream(value) && (value.path || filename)) {
      // Readable stream which created from fs.createReadStream
      // have a "path" property. So, we can get a "filename"
      // from the stream itself.
      filename = basename(value.path || filename)
    }

    // Normalize field content
    if (isStream(value)) {
      if (options.size != null) {
        value = toFile(value, filename || name || options.filename, options)
      }
    } else if (isBlob(value) || isBuffer(value)) {
      value = toFile(value, filename || name || options.filename, options)
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
   * Returns computed length of the FormData content.
   * If data contains stream.Readable field(s),
   * the method will always return undefined.
   *
   * @return {Promise<number | undefined>}
   *
   * @public
   */
  async getComputedLength() {
    let length = 0

    if (this.__content.size === 0) {
      return length
    }

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

    length += Buffer.from(this.__footer).length

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
   * @return {IterableIterator<[string, any]>}
   */
  [Symbol.iterator]() {
    return this.entries()
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
   * This method allows to read a content from internal stream
   * using async generators and for-await-of APIs.
   * An alias of FormData#stream[Symbol.asyncIterator]()
   *
   * @return {AsyncIterableIterator<Buffer>}
   *
   * @public
   */
  [Symbol.asyncIterator]() {
    return this.stream[Symbol.asyncIterator]()
  }

  /**
   * Alias of the FormData#[util.inspect.custom]()
   *
   * @return {string}
   */
  inspect = this[inspect.custom]

  /**
   * Returns a string representation of the FormData
   *
   * @return {string}
   */
  toString() {
    return "[object FormData]"
  }

  [inspect.custom]() {
    return "FormData"
  }
}

export default FormData
