import {inspect} from "util"

import {File} from "./File"
import {isFile} from "./isFile"

import normalizeFilename from "./normalizeFilename"

/**
 * A `string` or `File` that represents a single value from a set of `FormData` key-value pairs.
 */
export type FormDataEntryValue = string | File

type FormDataEntryValues = [FormDataEntryValue, ...FormDataEntryValue[]]

/**
 * Private options for FormData#setEntry() method
 */
interface FormDataSetFieldOptions {
  name: string
  value: unknown
  fileName?: string
  append: boolean
  argsLength: number
}

/**
 * Constructor entries for FormData
 */
export type FormDataConstructorEntries = Array<{
  name: string,
  value: unknown,
  fileName?: string
}>

/**
 * Provides a way to easily construct a set of key/value pairs representing form fields and their values, which can then be easily sent using fetch().
 *
 * Note that this object is not a part of Node.js, so you might need to check if an HTTP client of your choice support spec-compliant FormData.
 * However, if your HTTP client does not support FormData, you can use [`form-data-encoder`](https://npmjs.com/package/form-data-encoder) package to handle "multipart/form-data" encoding.
 */
export class FormData {
  /**
   * Stores internal data for every entry
   */
  readonly #entries = new Map<string, FormDataEntryValues>()

  constructor(entries?: FormDataConstructorEntries) {
    if (entries) {
      entries.forEach(({name, value, fileName}) => this.append(
        name, value, fileName
      ))
    }
  }

  #setEntry({
    name,
    value,
    append,
    fileName,
    argsLength
  }: FormDataSetFieldOptions): void {
    const methodName = append ? "append" : "set"

    name = String(name)

    // FormData required at least 2 arguments to be set.
    if (argsLength < 2) {
      throw new TypeError(
        `Failed to execute '${methodName}' on 'FormData': `
          + `2 arguments required, but only ${argsLength} present.`
      )
    }

    // Normalize field's value
    let normalizedValue: FormDataEntryValue
    if (isFile(value)) {
      fileName = normalizeFilename(
        fileName === undefined ? value.name : fileName
      )

      // Take params from the previous File or Blob instance
      normalizedValue = new File([value], fileName, {
        type: value.type,
        lastModified: value.lastModified
      })
    } else if (fileName) { // If a value is not a file-like, but the filename is present, then throw the error
      throw new TypeError(
        `Failed to execute '${methodName}' on 'FormData': `
          + "parameter 2 is not of type 'Blob'."
      )
    } else {
      // A non-file entries must be converted to string
      normalizedValue = String(value)
    }

    const values = this.#entries.get(name)

    if (!values) {
      return void this.#entries.set(name, [normalizedValue])
    }

    // Replace a value of the existing entry if "set" called
    if (!append) {
      return void this.#entries.set(name, [normalizedValue])
    }

    // Append a new value to the existing entry
    values.push(normalizedValue)
  }

  /**
   * Appends a new value onto an existing key inside a FormData object,
   * or adds the key if it does not already exist.
   *
   * The difference between `set()` and `append()` is that if the specified key already exists, `set()` will overwrite all existing values with the new one, whereas `append()` will append the new value onto the end of the existing set of values.
   *
   * @param name The name of the field whose data is contained in `value`.
   * @param value The field's value. This can be [`Blob`](https://developer.mozilla.org/en-US/docs/Web/API/Blob)
    or [`File`](https://developer.mozilla.org/en-US/docs/Web/API/File). If none of these are specified the value is converted to a string.
   * @param fileName The filename reported to the server, when a Blob or File is passed as the second parameter. The default filename for Blob objects is "blob". The default filename for File objects is the file's filename.
   */
  append(name: string, value: unknown, fileName?: string): void {
    return this.#setEntry({
      name,
      value,
      fileName,
      append: true,
      argsLength: arguments.length
    })
  }

  /**
   * Set a new value for an existing key inside FormData,
   * or add the new field if it does not already exist.
   *
   * @param name The name of the field whose data is contained in `value`.
   * @param value The field's value. This can be [`Blob`](https://developer.mozilla.org/en-US/docs/Web/API/Blob)
    or [`File`](https://developer.mozilla.org/en-US/docs/Web/API/File). If none of these are specified the value is converted to a string.
   * @param fileName The filename reported to the server, when a Blob or File is passed as the second parameter. The default filename for Blob objects is "blob". The default filename for File objects is the file's filename.
   *
   */
  set(name: string, value: unknown, fileName?: string): void {
    return this.#setEntry({
      name,
      value,
      fileName,
      append: false,
      argsLength: arguments.length
    })
  }

  /**
   * Returns the first value associated with a given key from within a `FormData` object.
   * If you expect multiple values and want all of them, use the `getAll()` method instead.
   *
   * @param {string} name A name of the value you want to retrieve.
   *
   * @returns A `FormDataEntryValue` containing the value. If the key doesn't exist, the method returns null.
   */
  get(name: string): FormDataEntryValue | null {
    const field = this.#entries.get(String(name))

    if (!field) {
      return null
    }

    return field[0]
  }

  /**
   * Returns all the values associated with a given key from within a `FormData` object.
   *
   * @param {string} name A name of the value you want to retrieve.
   *
   * @returns An array of `FormDataEntryValue` whose key matches the value passed in the `name` parameter. If the key doesn't exist, the method returns an empty list.
   */
  getAll(name: string): FormDataEntryValue[] {
    const field = this.#entries.get(String(name))

    if (!field) {
      return []
    }

    return field.slice()
  }

  /**
   * Returns a boolean stating whether a `FormData` object contains a certain key.
   *
   * @param name A string representing the name of the key you want to test for.
   *
   * @return A boolean value.
   */
  has(name: string): boolean {
    return this.#entries.has(String(name))
  }

  /**
   * Deletes a key and its value(s) from a `FormData` object.
   *
   * @param name The name of the key you want to delete.
   */
  delete(name: string): void {
    return void this.#entries.delete(String(name))
  }

  /**
   * Returns an [`iterator`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols) allowing to go through all keys contained in this `FormData` object.
   * Each key is a `string`.
   */
  * keys(): Generator<string> {
    for (const key of this.#entries.keys()) {
      yield key
    }
  }

  /**
   * Returns an [`iterator`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols) allowing to go through the `FormData` key/value pairs.
   * The key of each pair is a string; the value is a [`FormDataValue`](https://developer.mozilla.org/en-US/docs/Web/API/FormDataEntryValue).
   */
  * entries(): Generator<[string, FormDataEntryValue]> {
    for (const name of this.keys()) {
      const values = this.getAll(name)

      // Yield each value of a field, like browser-side FormData does.
      for (const value of values) {
        yield [name, value]
      }
    }
  }

  /**
   * Returns an [`iterator`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols) allowing to go through all values contained in this object `FormData` object.
   * Each value is a [`FormDataValue`](https://developer.mozilla.org/en-US/docs/Web/API/FormDataEntryValue).
   */
  * values(): Generator<FormDataEntryValue> {
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
    fn: (value: FormDataEntryValue, key: string, fd: FormData) => void,

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
}
