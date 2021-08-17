import {inspect} from "util"

import {File} from "./File"
import {isFile} from "./isFile"

export type FormDataFieldValue = string | File

type FormDataFieldValues = [FormDataFieldValue, ...FormDataFieldValue[]]

/**
 * Private options for FormData#setField() method
 */
interface FormDataSetFieldOptions {
  name: string
  value: unknown
  filename?: string
  append: boolean
  argsLength: number
}

/**
 * Constructor entries for FormData
 */
export type FormDataConstructorEntries = Array<{
  name: string,
  value: unknown,
  filename?: string
}>

/**
 * Provides a way to easily construct a set of key/value pairs representing form fields and their values, which can then be easily sent using fetch().
 *
 * Note that this object is not a part of Node.js, so you might need to check is an HTTP client of your choice support spec-compliant FormData.
 * However, if your HTTP client does not support FormData, you can use [`form-data-encoder`](https://npmjs.com/package/form-data-encoder) package to handle "multipart/form-data" encoding.
 */
export class FormData {
  /**
   * Stores internal data for every entry
   */
  readonly #entries = new Map<string, FormDataFieldValues>()

  constructor(entries?: FormDataConstructorEntries) {
    if (entries) {
      entries.forEach(({name, value, filename}) => this.append(
        name, value, filename
      ))
    }
  }

  #setField({
    name,
    value,
    append,
    filename,
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
    if (isFile(value)) {
      // Take params from the previous File or Blob instance
      value = new File([value], filename || value.name || "blob", {
        type: value.type,
        lastModified: value.lastModified
      })
    } else if (filename) { // If a value is not a file-like, but the filename is present, then throw the error
      throw new TypeError(
        `Failed to execute '${methodName}' on 'FormData': `
          + "parameter 2 is not of type 'Blob'."
      )
    } else {
      // A non-file fields must be converted to string
      value = String(value)
    }

    const values = this.#entries.get(name)

    if (!values) {
      return void this.#entries.set(name, [value as FormDataFieldValue])
    }

    // Replace a value of the existing field if "set" called
    if (!append) {
      return void this.#entries.set(name, [value as FormDataFieldValue])
    }

    // Append a new value to the existing field
    values.push(value as FormDataFieldValue)
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
  append(name: string, value: unknown, filename?: string): void {
    return this.#setField({
      name,
      value,
      filename,
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
  set(name: string, value: unknown, filename?: string): void {
    return this.#setField({
      name,
      value,
      filename,
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
    const field = this.#entries.get(String(name))

    if (!field) {
      return null
    }

    return field[0]
  }

  /**
   * Returns all the values associated with
   * a given key from within a FormData object.
   *
   * @param {string} name A name of the value you want to retrieve.
   */
  getAll(name: string): FormDataFieldValue[] {
    const field = this.#entries.get(String(name))

    if (!field) {
      return []
    }

    return field.slice()
  }

  /**
   * Check if a field with the given name exists inside FormData.
   *
   * @param name A name of the field you want to test for.
   *
   * @return
   */
  has(name: string): boolean {
    return this.#entries.has(String(name))
  }

  /**
   * Deletes a key and its value(s) from a FormData object.
   *
   * @param name The name of the key you want to delete.
   */
  delete(name: string): void {
    return void this.#entries.delete(String(name))
  }

  /**
   * Returns an [`iterator`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols) allowing to go through the **FormData** keys
   */
  * keys(): Generator<string> {
    for (const key of this.#entries.keys()) {
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
}
