import {Readable} from "stream"
import {basename} from "path"
import {inspect} from "util"

import {File} from "./File"

import {fileFromPathSync} from "./fileFromPath"

import isFile from "./util/isFile"
import getLength from "./util/getLength"
import isPlainObject from "./util/isPlainObject"
import deprecateReadStream from "./util/deprecateReadStream"
import deprecateStreamProp from "./util/deprecateStreamProp"
import createBoundary from "./util/createBoundary"
import getMime from "./util/getMimeFromFilename"
import isReadStream from "./util/isReadStream"
import getFilename from "./util/getFilename"

const {isBuffer} = Buffer

const DASHES = "-".repeat(2)
const CRLF = "\r\n"
const CRLF_BYTES_LENGTH = Buffer.byteLength(CRLF)

export type FormDataFieldValue = string | File

export interface FormDataFieldOptions {
  /**
   * Returns the media type ([`MIME`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types)) of the file represented by a `File` object.
   */
  type?: string

  /**
   * The last modified date of the file as the number of milliseconds since the Unix epoch (January 1, 1970 at midnight). Files without a known last modified date return the current date.
   */
  lastModified?: number,

  /**
   * The name of the file.
   */
  filename?: string
}

/**
 * Private options for FormData#_setField() method
 */
interface FormDataSetFieldOptions {
  name: string
  value: unknown
  append: boolean
  filenameOrOptions?: string | FormDataFieldOptions
  options?: FormDataFieldOptions
  argsLength: number
}

/**
 * Internal representation of a field
 */
interface FormDataField {
  /**
   * Indicates whether the field was added with FormData#append() method
   */
  append: boolean

  /**
   * Contains a set of necessary field's information
   */
  values: [FormDataFieldValue, ...FormDataFieldValue[]]
}

/**
 * Constructor entries for FormData
 */
export type FormDataConstructorEntries = Array<{
  name: string,
  value: unknown,
  filename?: string
  options?: FormDataFieldOptions
}>

export class FormData {
  readonly #stream: Readable

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
  readonly #content = new Map<string, FormDataField>()

  /**
   * Returns field's footer
   */
  readonly #footer = `${DASHES}${this.boundary}${DASHES}${CRLF.repeat(2)}`

  constructor(entries?: FormDataConstructorEntries) {
    this.#stream = Readable.from(this)

    if (entries) {
      entries.forEach(({name, value, filename, options}) => this.append(
        name, value, filename, options
      ))
    }
  }

  private _getHeader(name: string, value: FormDataFieldValue): string {
    let header = ""

    header += `${DASHES}${this.boundary}${CRLF}`
    header += `Content-Disposition: form-data; name="${name}"`

    if (isFile(value)) {
      header += `; filename="${value.name}"${CRLF}`
      header += `Content-Type: ${value.type || getMime(value.name)}`
    }

    return `${header}${CRLF.repeat(2)}`
  }

  private async* _getField(): AsyncGenerator<string | Buffer, void, undefined> {
    // Note to switch back to reading from this.#content if any extra logic will be necessary in a future, because the public FormData API returns values only as `string | File`
    for (const [name, value] of this) {
      // Set field's header
      yield this._getHeader(name, value)

      if (isFile(value)) {
        yield* value.stream()
      } else {
        yield value
      }

      // Add trailing carriage
      yield CRLF
    }

    // Add a footer when all fields ended
    yield this.#footer
  }

  private _setField({
    name,
    value,
    append,
    filenameOrOptions,
    options,
    argsLength
  }: FormDataSetFieldOptions): void {
    const fieldName = String(name)
    const methodName = append ? "append" : "set"

    let filename: string | undefined
    if (isPlainObject(filenameOrOptions)) {
      [options, filename] = [filenameOrOptions, undefined]
    } else {
      filename = filenameOrOptions
    }

    // FormData required at least 2 arguments to be set.
    if (argsLength < 2) {
      throw new TypeError(
        `Failed to execute '${methodName}' on 'FormData': `
          + `2 arguments required, but only ${argsLength} present.`
      )
    }

    // Get a filename from either an argument or options
    filename ||= options?.filename

    // If a value is a file-like object, then get and normalize the filename
    if (isFile(value) || isReadStream(value) || isBuffer(value)) {
      // Note that the user-defined filename has higher precedence
      filename = basename(filename || getFilename(value))
    } else if (filename) { // If a value is not a file-like, but the filename is present, then throw the error
      throw new TypeError(
        `Failed to execute '${methodName}' on 'FormData': `
          + "parameter 2 is not one of the following types: "
          + "ReadStream | Buffer | File | Blob"
      )
    }

    // Normalize field's value
    if (isReadStream(value)) {
      value = fileFromPathSync(String(value.path), filename, options)
    } else if (isBuffer(value)) {
      value = new File([value], filename as string, options)
    } else if (isFile(value)) {
      value = new File([value], filename as string, {
        ...options,

        // Take params from the previous File or Blob instance
        // But keep user-defined options higher percidence
        type: options?.type || value.type,
        lastModified: options?.lastModified || value.lastModified
      })
    } else {
      // A non-file fields must be converted to string
      value = String(value)
    }

    const field = this.#content.get(fieldName)

    if (!field) {
      return void this.#content.set(fieldName, {
        append, values: [value as FormDataFieldValue]
      })
    }

    // Replace a value of the existing field if "set" called
    if (!append) {
      return void this.#content.set(fieldName, {
        append, values: [value as FormDataFieldValue]
      })
    }

    // Do nothing if the field has been created from .set()
    if (!field.append) {
      return undefined
    }

    // Append a new value to the existing field
    field.values.push(value as FormDataFieldValue)

    this.#content.set(fieldName, field)
  }

  /**
   * Returns internal readable stream, allowing to read the FormData content
   *
   * @deprecated Use `Readable.from()` to create a stream from `FormData` instance.
   */
  @deprecateStreamProp
  get stream() {
    return this.#stream
  }

  /**
   * Returns computed length of the FormData content.
   */
  async getComputedLength(): Promise<number | undefined> {
    let length = 0

    for (const [name, value] of this) {
      length += Buffer.byteLength(this._getHeader(name, value))

      const valueLength = await getLength(value)

      length += Number(valueLength) + CRLF_BYTES_LENGTH
    }

    return length + Buffer.byteLength(this.#footer)
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
    value: unknown,
    options?: FormDataFieldOptions & {filename?: string}
  ): void
  append(
    name: string,
    value: unknown,
    filename?: string,
    options?: FormDataFieldOptions
  ): void
  @deprecateReadStream
  append(
    name: string,
    value: unknown,
    filenameOrOptions?: string | FormDataFieldOptions,
    options?: FormDataFieldOptions
  ): void {
    return this._setField({
      name,
      value,
      filenameOrOptions,
      options,
      append: true,
      argsLength: arguments.length
    })
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
  @deprecateReadStream
  set(
    name: string,
    value: unknown,
    filenameOrOptions?: string | FormDataFieldOptions,
    options?: FormDataFieldOptions
  ): void {
    return this._setField({
      name,
      value,
      filenameOrOptions,
      options,
      append: false,
      argsLength: arguments.length
    })
  }

  /**
   * Returns the first value associated with the given name.
   * Buffer and Readable values will be returned as-is.
   *
   * @param {string} name A name of the value you want to retrieve.
   */
  get(name: string): FormDataFieldValue | null {
    name = String(name)

    const field = this.#content.get(name)

    if (!field) {
      return null
    }

    return field.values[0]
  }

  /**
   * Returns all the values associated with
   * a given key from within a FormData object.
   *
   * @param {string} name A name of the value you want to retrieve.
   */
  getAll(name: string): FormDataFieldValue[] {
    name = String(name)

    const field = this.#content.get(name)

    if (!field) {
      return []
    }

    return [...field.values]
  }

  /**
   * Check if a field with the given name exists inside FormData.
   *
   * @param name A name of the field you want to test for.
   *
   * @return
   */
  has(name: string): boolean {
    return this.#content.has(String(name))
  }

  /**
   * Deletes a key and its value(s) from a FormData object.
   *
   * @param name The name of the key you want to delete.
   */
  delete(name: string): void {
    return void this.#content.delete(String(name))
  }

  /**
   * Returns an [`iterator`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols) allowing to go through the **FormData** keys
   */
  * keys(): Generator<string> {
    for (const key of this.#content.keys()) {
      yield key
    }
  }

  /**
   * Returns an [`iterator`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols) allowing to go through the **FormData** key/value pairs
   */
  * entries(): Generator<[string, FormDataFieldValue]> {
    for (const name of this.keys()) {
      const values = this.getAll(name)

      // Yield each value of a field, like browser-side FormData does.
      for (const value of values) {
        yield [name, value]
      }
    }
  }

  /**
   * Returns an [`iterator`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols) allowing to go through the **FormData** values
   */
  * values(): Generator<FormDataFieldValue> {
    for (const [, value] of this) {
      yield value
    }
  }

  /**
   * An alias for FormData#entries()
   */
  [Symbol.iterator]() {
    return this.entries()
  }

  /**
   * Executes given callback function for each field of the FormData instance
   */
  forEach(
    fn: (value: FormDataFieldValue, key: string, fd: FormData) => void,

    ctx?: unknown
  ): void {
    for (const [name, value] of this) {
      fn.call(ctx, value, name, this)
    }
  }

  get [Symbol.toStringTag](): string {
    return "FormData"
  }

  [inspect.custom](): string {
    return this[Symbol.toStringTag]
  }

  /**
   * Returns an async iterator allowing to read form-data body using **for-await-of** syntax.
   * Read the [`async iteration proposal`](https://github.com/tc39/proposal-async-iteration) to get more info about async iterators.
   */
  async* [Symbol.asyncIterator]() {
    for await (const ch of this._getField()) {
      yield isBuffer(ch) ? ch : Buffer.from(String(ch))
    }
  }
}
