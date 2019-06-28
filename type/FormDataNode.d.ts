// <reference types="node" />
import {Readable} from "stream"
import {ReadStream} from "fs"

declare type FormDataEntry = string | ReadStream | Readable | Buffer

declare class FormData {
  [Symbol.toStringTag]: string

  /**
   * Returns boundary string
   */
  boundary: string

  /**
   * Returns headers for multipart/form-data
   */
  headers: {
    "Content-Type": string
  }

  /**
   * Returns the internal stream
   */
  stream: Readable

  constructor(entries?: Array<{
    name: string,
    value: any,
    filename?: string
  }>)

  /**
   * Returns computed length of the FormData content.
   * If data contains stream.Readable field(s),
   * the method will always return undefined.
   */
  getComputedLength(): Promise<number | void>

  /**
   * Appends a new value onto an existing key inside a FormData object,
   * or adds the key if it does not already exist.
   *
   * @param name The name of the field whose data
   *   is contained in value
   *
   * @param value The field value. You can pass any primitive type
   *   (including null and undefined), Buffer or Readable stream.
   *   Note that Arrays and Object will be converted to string
   *   by using String function.
   *
   * @param filename A filename of given field.
   *   Can be added only for Buffer and Readable
   */
  append(name: string, value: any, filename?: string): void

  /**
   * Set a new value for an existing key inside FormData,
   * or add the new field if it does not already exist.
   *
   * @param name The name of the field whose data
   *   is contained in value
   *
   * @param value The field value. You can pass any primitive type
   *   (including null and undefined), Buffer or Readable stream.
   *   Note that Arrays and Object will be converted to string
   *   by using String function.
   *
   * @param filename A filename of given field.
   *   Can be added only for Buffer and Readable
   */
  set(name: string, value: any, filename?: string): void

  /**
   * Check if a field with the given name exists inside FormData.
   *
   * @param name A name of the field you want to test for.
   */
  has(name: string): boolean

  /**
   * Returns the first value associated with the given name.
   * Buffer and Readable values will be returned as-is.
   *
   * @param name A name of the value you want to retrieve.
   */
  get(name: string): FormDataEntry | void

  /**
   * Returns all the values associated with
   * a given key from within a FormData object.
   *
   * @param name A name of the value you want to retrieve.
   */
  getAll(name: string): Array<FormDataEntry>

  /**
   * Deletes a key and its value(s) from a FormData object.
   *
   * @param name The name of the key you want to delete.
   */
  delete(name: string): void

  toString(): string

  inspect(): string

  keys(): IterableIterator<string>

  values(): IterableIterator<FormDataEntry>

  entries(): IterableIterator<[string, FormDataEntry]>

  /**
   * Executes a given callback for each field of the FormData instance
   */
  forEach(
    fn: (value: FormDataEntry, name: string, fd: FormData) => void,
    ctx?: any
  ): void

  [Symbol.iterator](): IterableIterator<[string, FormDataEntry]>

  /**
   * Allows to read a content from internal stream
   * using async generators and for-await-of APIs
   */
  [Symbol.asyncIterator](): AsyncIterableIterator<Buffer>
}

export default FormData
