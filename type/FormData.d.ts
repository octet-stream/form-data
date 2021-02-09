// <reference types="node" />
import {Readable} from "stream"
import {ReadStream} from "fs"
import {inspect} from "util"

declare interface File {
  name: string
  type: string
  size: number
  lastModified: number

  stream(): Readable

  arrayBuffer(): ArrayBuffer
}

declare type FormDataEntry = string | ReadStream | Readable | Buffer | File

declare interface FormDataFieldOptions {
  size?: number,
  type?: string,
  lastModified?: number,
  filename?: string
}

declare type FormDataFields = Array<{
  name: string,
  value: any,
  filename?: string,
  options?: object
}>

declare class FormData {
  public [Symbol.toStringTag]: string

  /**
   * Returns boundary string
   */
  public boundary: string

  /**
   * Returns the internal stream
   */
  public stream: Readable

  /**
   * Returns headers for multipart/form-data
   */
  public headers: {
    "Content-Type": string
  }

  constructor(fields?: FormDataFields)

  /**
   * Returns computed length of the FormData content.
   * If data contains stream.Readable field(s),
   * the method will always return undefined.
   */
  public getComputedLength(): Promise<number | void>

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
  public append(name: string, value: any, filename?: string): void
  public append(name: string, value: any, options?: FormDataFieldOptions): void
  public append(name: string, value: any, filename?: string, options?: FormDataFieldOptions): void

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
  public set(name: string, value: any, filename?: string): void
  public set(name: string, value: any, options?: FormDataFieldOptions): void
  public set(name: string, value: any, filename?: string, options?: FormDataFieldOptions): void

  /**
   * Check if a field with the given name exists inside FormData.
   *
   * @param name A name of the field you want to test for.
   */
  public has(name: string): boolean

  /**
   * Returns the first value associated with the given name.
   * Buffer and Readable values will be returned as-is.
   *
   * @param name A name of the value you want to retrieve.
   */
  public get(name: string): FormDataEntry | void

  /**
   * Returns all the values associated with
   * a given key from within a FormData object.
   *
   * @param name A name of the value you want to retrieve.
   */
  public getAll(name: string): Array<FormDataEntry>

  /**
   * Deletes a key and its value(s) from a FormData object.
   *
   * @param name The name of the key you want to delete.
   */
  public delete(name: string): void

  public keys(): IterableIterator<string>

  public values(): IterableIterator<FormDataEntry>

  public entries(): IterableIterator<[string, FormDataEntry]>

  public toString(): string

  public inspect(): string

  public [inspect.custom](): string

  /**
   * Executes a given callback for each field of the FormData instance
   */
  public forEach(
    fn: (value: FormDataEntry, name: string, fd: FormData) => void,

    ctx?: any
  ): void

  public [Symbol.iterator](): IterableIterator<[string, FormDataEntry]>

  /**
   * Allows to read a content from internal stream
   * using async generators and for-await-of APIs
   */
  public [Symbol.asyncIterator](): AsyncIterableIterator<Buffer>
}

export type {FormDataFieldOptions, FormDataFields, FormDataEntry, File}

export default FormData
