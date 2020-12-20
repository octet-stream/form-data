const {Readable} = require("stream")
const {inspect} = require("util")
const {basename} = require("path")

const mimes = require("mime-types")

const getStreamIterator = require("./util/getStreamIterator.js")
const getLength = require("./util/getLength.js")
const isObject = require("./util/isObject.js")
const isStream = require("./util/isStream.js")
const boundary = require("./util/boundary.js")
const isBlob = require("./util/isBlob.js")
const toFile = require("./util/toFile.js")

const {isBuffer} = Buffer
const {isArray} = Array
const {freeze} = Object

/**
 * @const DEFAULT_CONTENT_TYPE
 *
 * @type {"application/octet-stream"}
 */
const DEFAULT_CONTENT_TYPE = "application/octet-stream"

/**
 * @const DASHES
 *
 * @type{"--"}
 */
const DASHES = "-".repeat(2)

/**
 * @const CARRIAGE
 *
 * @type {"\r\n"}
 */
const CARRIAGE = "\r\n"

/**
 * @typedef {Object} FieldOptions
 *
 * @property {number} size
 */

/**
 * FormData implementation for Node.js.
 *
 * @api public
 */
class FormData {
  /**
   * Refers to the internal Readable stream
   *
   * @type {Readable}
   *
   * @public
   * @property
   * @readonly
   */
  get stream() {
    return Readable.from(this.__read())
  }

  /**
   * Returns a string representation of the FormData
   *
   * @type {string}
   */
  get [Symbol.toStringTag]() {
    return "FormData"
  }

  /**
   * @param {Array<{name: string, value: any, filename?: string, options?: FieldOptions}>} [fields] – an optional FormData initial fields.
   *   Each field must be passed as a collection of the objects
   *   with "name", "value" and "filename" props.
   *   See the FormData#append() method for more information.
   */
  constructor(fields = null) {
    /**
     * Generates a new boundary string once FormData instance constructed
     *
     * @type {string}
     *
     * @public
     * @property
     * @readonly
     */
    this.boundary = `NodeJSFormDataStreamBoundary${boundary()}`

    /**
     * Returns headers for multipart/form-data
     *
     * @type {{"Content-Type": string}}
     *
     * @public
     * @property
     * @readonly
     */
    this.headers = freeze({
      "Content-Type": `multipart/form-data; boundary=${this.boundary}`
    })

    /**
     * @type {Map<string, {append: boolean, values: Array<{value: any, filename: string}>}>}
     *
     * @private
     * @readonly
     * @property
     */
    this.__content = new Map()

    /**
     * @type {string}
     *
     * @private
     * @readonly
     * @property
     */
    this.__footer = `${DASHES}${this.boundary}${DASHES}`
      + `${CARRIAGE.repeat(2)}`

    /**
     * Alias of the FormData#[util.inspect.custom]()
     *
     * @return {string}
     *
     * @public
     * @method
     */
    this.inspect = this[inspect.custom]

    if (isArray(fields)) {
      this.__appendFromInitialFields(fields)
    }
  }

  /**
   * Returns a mime type by field's filename
   *
   * @param {string} filename
   *
   * @return {string}
   *
   * @private
   * @method
   */
  __getMime(filename) {
    return mimes.lookup(filename) || DEFAULT_CONTENT_TYPE
  }

  /**
   * Returns a headers for given field's data
   *
   * @param {string} name
   * @param {string} filename
   *
   * @return {string}
   *
   * @private
   * @method
   */
  __getHeader(name, filename) {
    let header = ""

    header += `${DASHES}${this.boundary}${CARRIAGE}`
    header += `Content-Disposition: form-data; name="${name}"`

    if (filename) {
      header += `; filename="${filename}"${CARRIAGE}`
      header += `Content-Type: ${this.__getMime(filename)}`
    }

    return `${header}${CARRIAGE.repeat(2)}`
  }

  /**
   * Get each field from internal Map
   *
   * @yields {Buffer | string}
   *
   * @private
   * @method
   * @async
   * @generator
   */
  async* __getField() {
    for (const [name, {values}] of this.__content) {
      for (const {value, filename} of values) {
        // Set field's header
        yield this.__getHeader(name, filename)

        if (isBlob(value)) {
          yield* getStreamIterator(value.stream())
        } else if (isStream(value)) {
          // Read the stream content
          yield* getStreamIterator(value)
        } else {
          yield value
        }

        // Add trailing carriage
        yield CARRIAGE
      }
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
   * @method
   */
  async* __read() {
    for await (const ch of this.__getField()) {
      yield isBuffer(ch) ? ch : Buffer.from(String(ch))
    }
  }

  /**
   * Append initial fields
   *
   * @param {Array<{name: string, value: any, filename?: string, options?: FieldOptions}>} fields
   *
   * @return {void}
   *
   * @private
   * @method
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
   * @param {string} name The name of the field whose data
   *   is contained in value
   *
   * @param {any} value The field value. You can pass any primitive type
   *   (including null and undefined), Buffer or Readable stream.
   *   Note that Arrays and Object will be converted to string
   *   by using String function.
   *
   * @param {string} [filename = undefined] A filename of given field.
   *   Can be added only for Buffer and Readable
   *
   * @param {FieldOptions} [options = {}] An object with additional paramerets.
   * @param {boolean} append
   * @param {number} argsLength
   *
   * @return {void}
   *
   * @private
   */
  __setField(name, value, filename, options, append, argsLength) {
    const fieldName = String(name)
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
      filename = basename(
        filename
          || value.name
          || (value.constructor.name === "Blob" ? "blob" : String(value.name))
      )
    } else if (isStream(value) && (filename || value.path)) {
      // Readable stream which created from fs.createReadStream
      // have a "path" property. So, we can get a "filename"
      // from the stream itself.
      filename = basename(filename || value.path)
    }

    // TODO: Rewrite File and Blob normalization to make FormData create a new objects for them
    // TODO: Also, don't forget to test for the filename priorities
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

    const field = this.__content.get(fieldName)

    // Set a new field if given name is not exists
    if (!field) {
      return void this.__content.set(fieldName, {
        append, values: [{value, filename}]
      })
    }

    // Replace a value of the existing field if "set" called
    if (!append) {
      return void this.__content.set(fieldName, {
        append, values: [{value, filename}]
      })
    }

    // Do nothing if the field has been created from .set()
    if (!field.append) {
      return undefined
    }

    // Append a new value to the existing field
    field.values.push({value, filename})

    this.__content.set(fieldName, field)
  }

  /**
   * Returns computed length of the FormData content.
   * If data contains stream.Readable field(s),
   * the method will always return undefined.
   *
   * @return {Promise<number | undefined>}
   *
   * @public
   * @method
   */
  async getComputedLength() {
    let length = 0

    const carriageLength = Buffer.from(CARRIAGE).length

    for (const [name, {values}] of this.__content) {
      for (const {value, filename} of values) {
        length += Buffer.from(this.__getHeader(name, filename)).length

        const valueLength = await getLength(value)

        // Return `undefined` if can't tell field's length
        // (it's probably a stream with unknown length)
        if (valueLength == null) {
          return undefined
        }

        length += Number(valueLength) + carriageLength
      }
    }

    return length + Buffer.from(this.__footer).length
  }

  /**
   * Appends a new value onto an existing key inside a FormData object,
   * or adds the key if it does not already exist.
   *
   * @param {string} name The name of the field whose data
   *   is contained in value
   *
   * @param {any} value The field value. You can pass any primitive type
   *   (including null and undefined), Buffer or Readable stream.
   *   Note that Arrays and Object will be converted to string
   *   by using String function.
   *
   * @param {string} [filename = undefined] A filename of given field.
   *   Can be added only for Buffer and Readable
   *
   * @param {FieldOptions} [options = {}]
   *
   * @return {void}
   *
   * @public
   * @method
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
   * @param {string} name The name of the field whose data
   *   is contained in value
   *
   * @param {any} value The field value. You can pass any primitive type
   *   (including null and undefined), Buffer or Readable stream.
   *   Note that Arrays and Object will be converted to string
   *   by using String function.
   *
   * @param {string} [filename = undefined] A filename of given field.
   *   Can be added only for Buffer and Readable
   *
   * @param {FieldOptions} [options = {}]
   *
   * @return {void}
   *
   * @public
   * @method
   */
  set(name, value, filename = undefined, options = {}) {
    return this.__setField(
      name, value, filename, options, false, arguments.length
    )
  }

  /**
   * Check if a field with the given name exists inside FormData.
   *
   * @param {string} name A name of the field you want to test for.
   *
   * @return {boolean}
   *
   * @public
   * @method
   */
  has(name) {
    return this.__content.has(String(name))
  }

  /**
   * Returns the first value associated with the given name.
   * Buffer and Readable values will be returned as-is.
   *
   * @param {string} name A name of the value you want to retrieve.
   *
   * @public
   */
  get(name) {
    name = String(name)

    if (!this.has(name)) {
      return null
    }

    const field = this.__content.get(name)

    return field.values[0].value
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
    const field = this.__content.get(String(name))

    return field ? field.values.map(({value}) => value) : []
  }

  /**
   * Deletes a key and its value(s) from a FormData object.
   *
   * @param {string} name – The name of the key you want to delete.
   *
   * @public
   */
  delete(name) {
    this.__content.delete(String(name))
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
   * @param {(value: any, name: string, fd: FormData) => void} fn Function to execute for each element,
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
   * @method
   */
  [Symbol.asyncIterator]() {
    return this.stream[Symbol.asyncIterator]()
  }

  /**
   * Returns a string representation of the FormData
   *
   * @return {string}
   *
   * @public
   * @method
   */
  toString() {
    return "[object FormData]"
  }

  /**
   * @type {string}
   *
   * @public
   * @property
   */
  [inspect.custom]() {
    return "FormData"
  }
}

module.exports = FormData
module.exports.default = FormData
