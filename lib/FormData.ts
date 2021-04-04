import {Readable} from "stream"
import {basename} from "path"
import {inspect} from "util"

import mimes from "mime-types"
import fromPath from "fetch-blob/from"

import {ReadableStream} from "web-streams-polyfill"

import File from "./File"
import isBlob from "./util/isBlob"
import isStream from "./util/isStream"
import isObject from "./util/isObject"
import getLength from "./util/getLength"
import createBoundary from "./util/createBoundary"
import getStreamIterator from "./util/getStreamIterator"
import isReadStream from "./util/isReadStream"
import getFilename from "./util/getFilename"

const {isBuffer} = Buffer

const DEFAULT_CONTENT_TYPE = "application/octet-stream"

const DASHES = "-".repeat(2)

const CARRIAGE = "\r\n"

export type FormDataFieldValue = string | ReadableStream | Readable | File

export interface FormDataFieldOptions {
  type?: string
  lastModified?: number
}

interface FormDataField {
  /**
   * Indicates whether the field was added with FormData#append() method
   */
  append: boolean

  /**
   * Contains a set of necessary field's information
   */
  values: Array<{value: FormDataFieldValue, filename: string}>
}

interface SetFieldOptions {
  name: string
  value: unknown
}

export class FormData {
  /**
   * Returns internal readable stream, allowing to read the FormData content
   */
  readonly stream: Readable

  /**
   * Returns a boundary string
   */
  readonly boundary = `NodeJSFormDataStreamBoundary${createBoundary()}`

  /**
   * Returns headers for multipart/form-data
   */
  readonly headers = {
    "Content-Type": `multipart/form-data; boundary=${this.boundary}`
  }

  /**
   * Stores internal data for every field
   */
  private readonly _content = new Map<string, FormDataField>()

  /**
   * Returns field's footer
   */
  private readonly _footer =
    `${DASHES}${this.boundary}${DASHES}${CARRIAGE.repeat(2)}`

  constructor() {
    this.stream = Readable.from(this._read())
  }

  private _getMime(filename: string): string {
    return mimes.lookup(filename) || DEFAULT_CONTENT_TYPE
  }

  private _getHeader(name: string, filename: string): string {
    let header = ""

    header += `${DASHES}${this.boundary}${CARRIAGE}`
    header += `Content-Disposition: form-data; name="${name}"`

    if (filename) {
      header += `; filename="${filename}"${CARRIAGE}`
      header += `Content-Type: ${this._getMime(filename)}`
    }

    return `${header}${CARRIAGE.repeat(2)}`
  }

  private async* _getField() {
    for (const [name, {values}] of this._content) {
      for (const {value, filename} of values) {
        // Set field's header
        yield this._getHeader(name, filename)

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
    yield this._footer
  }

  private async* _read() {
    for await (const ch of this._getField()) {
      yield isBuffer(ch) ? ch : Buffer.from(String(ch))
    }
  }

  private _setField(
    name: string,
    value: unknown,
    filenameOrOptions: string | FormDataFieldOptions,
    options: FormDataFieldOptions & {filename?: string},
    append: boolean,
    argsLength: number
  ): void {
    const fieldName = String(name)
    const methodName = append ? "append" : "set"

    let filename: string
    if (isObject(filenameOrOptions)) {
      [options, filename] = [filenameOrOptions, undefined]
    } else {
      [filename, options] = [filenameOrOptions, {}]
    }

    // FormData required at least 2 arguments to be set.
    if (argsLength < 2) {
      throw new TypeError(
        `Failed to execute '${methodName}' on 'FormData': `
          + `2 arguments required, but only ${argsLength} present.`
      )
    }

    // Get a filename from either an argument or oprions
    filename ||= options.filename

    // If a value is a file-like object, then get and normalize the filename
    if (isBlob(value) || isStream(value) || isBuffer(value)) {
      // Note that the user-defined filename has higher precedence
      filename = basename(filename || getFilename(value as any))
    } else if (filename) { // If a value is not a file-like, but the filename is present, then throw the error
      throw new TypeError(
        `Failed to execute '${methodName}' on 'FormData': `
          + "parameter 2 is not one of the following types: "
          + "ReadableStream | ReadStream | Readable | Buffer | File | Blob"
      )
    }

    // Normalize field's value
    if (isReadStream(value)) {
      value = new File([fromPath(String(value.path))], filename, options)
    } else if (isBlob(value) || isBuffer(value)) {
      value = new File([value], filename, options)
    } else {
      // A non-file fields must be converted to string
      value = String(value)
    }

    const field = this._content.get(fieldName)

    if (!field) {
      return void this._content.set(fieldName, {
        append, values: [{value: value as FormDataFieldValue, filename}]
      })
    }

    // Replace a value of the existing field if "set" called
    if (!append) {
      return void this._content.set(fieldName, {
        append, values: [{value: value as FormDataFieldValue, filename}]
      })
    }

    // Do nothing if the field has been created from .set()
    if (!field.append) {
      return undefined
    }

    // Append a new value to the existing field
    field.values.push({value: value as FormDataFieldValue, filename})

    this._content.set(fieldName, field)
  }

  /**
   * Returns computed length of the FormData content.
   * If data contains stream.Readable field(s),
   * the method will always return undefined.
   */
  async getComputedLength(): Promise<number | undefined> {
    let length = 0

    const carriageLength = Buffer.from(CARRIAGE).length

    for (const [name, {values}] of this._content) {
      for (const {value, filename} of values) {
        length += Buffer.from(this._getHeader(name, filename)).length

        const valueLength = await getLength(value)

        // Return `undefined` if can't tell field's length
        // (it's probably a stream with unknown length)
        if (valueLength === undefined) {
          return undefined
        }

        length += Number(valueLength) + carriageLength
      }
    }

    return length + Buffer.from(this._footer).length
  }

  /**
   * Appends a new value onto an existing key inside a FormData object,
   * or adds the key if it does not already exist.
   *
   * @param name The name of the field whose data is contained in value
   * @param value The field value. You can pass any primitive type
   *   (including null and undefined), Buffer or Readable stream.
   *   Note that Arrays and Object will be converted to string
   *   by using String function.
   * @param filename A filename of given field.
   * @param options Additional field options.
   */
  append(name: string, value: unknown): void
  append(name: string, value: unknown, filename?: string): void
  append(
    name: string,
    value: unknown, options?: FormDataFieldOptions & {filename?: string}
  ): void
  append(
    name: string,
    value: unknown,
    filename?: string,
    options?: FormDataFieldOptions
  ): void
  append(
    name: string,
    value: unknown,
    filenameOrOptions?: string | FormDataFieldOptions,
    options?: FormDataFieldOptions
  ): void {
    return this._setField(
      name,
      value,
      filenameOrOptions,
      options,
      true,
      arguments.length
    )
  }

  /**
   * Set a new value for an existing key inside FormData,
   * or add the new field if it does not already exist.
   *
   * @param name The name of the field whose data is contained in value
   * @param value The field value. You can pass any primitive type
   *   (including null and undefined), Buffer or Readable stream.
   *   Note that Arrays and Object will be converted to string
   *   by using String function.
   * @param filename A filename of given field.
   * @param options Additional field options.
   *
   */
  set(name: string, value: unknown): void
  set(name: string, value: unknown, filename?: string): void
  set(
    name: string,
    value: unknown,
    options?: FormDataFieldOptions & {filename?: string}
  ): void
  set(
    name: string,
    value: unknown,
    filename?: string,
    options?: FormDataFieldOptions
  ): void
  set(
    name: string,
    value: unknown,
    filenameOrOptions?: string | FormDataFieldOptions,
    options?: FormDataFieldOptions
  ): void {
    return this._setField(
      name,
      value,
      filenameOrOptions,
      options,
      false,
      arguments.length
    )
  }

  /**
   * Returns the first value associated with the given name.
   * Buffer and Readable values will be returned as-is.
   *
   * @param {string} name A name of the value you want to retrieve.
   */
  get(name: string): FormDataFieldValue {
    name = String(name)

    if (!this.has(name)) {
      return null
    }

    return this._content.get(name).values[0].value
  }

  /**
   * Returns all the values associated with
   * a given key from within a FormData object.
   *
   * @param {string} name A name of the value you want to retrieve.
   */
  getAll(name: string): FormDataFieldValue[] {
    name = String(name)

    if (!this.has(name)) {
      return []
    }

    return this._content.get(name).values.map(({value}) => value)
  }

  /**
   * Check if a field with the given name exists inside FormData.
   *
   * @param name A name of the field you want to test for.
   *
   * @return
   */
  has(name: string) {
    return this._content.has(String(name))
  }

  /**
   * Deletes a key and its value(s) from a FormData object.
   *
   * @param name The name of the key you want to delete.
   */
  delete(name: string) {
    return this._content.delete(String(name))
  }

  * keys() {
    for (const key of this._content.keys()) {
      yield key
    }
  }

  * entries() {
    for (const name of this.keys()) {
      const values = this.getAll(name)

      // Yield each value of a field, like browser-side FormData does.
      for (const value of values) {
        yield [name, value]
      }
    }
  }

  * values() {
    for (const [, values] of this) {
      yield values
    }
  }

  [Symbol.iterator]() {
    return this.entries()
  }

  forEach(
    fn: (value: FormDataFieldValue, key: string, fd: FormData) => void,

    ctx?: unknown
  ): void {
    for (const [name, value] of this) {
      fn.call(ctx, value, name, this)
    }
  }

  toString(): string {
    return "[object FormData]"
  }

  get [Symbol.toStringTag](): string {
    return "FormData"
  }

  [inspect.custom](): string {
    return this[Symbol.toStringTag]
  }
}

export default FormData
