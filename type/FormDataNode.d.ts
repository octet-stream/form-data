import {Readable} from "stream"

declare type FormDataNodeEntry = string | Readable | Buffer

declare type FormDataNodeEntryValue = FormDataNodeEntry
  | number
  | boolean
  | any[]
  | object

declare class FormDataNode {
  [Symbol.toStringTag]: string

  boundary: string

  headers: {
    "Content-Type": string
  }

  stream: Readable

  getComputedLength(): Promise<number | void>

  append(name: string, value: FormDataNodeEntryValue, filename?: string): void

  set(name: string, value: FormDataNodeEntryValue, filename?: string): void

  has(name: string): boolean

  get(name: string): FormDataNodeEntry | void

  getAll(name: string): Array<FormDataNodeEntry>

  delete(name: string): void

  toString(): string

  inspect(): string

  keys(): IterableIterator<string>

  values(): IterableIterator<FormDataNodeEntry>

  entries(): IterableIterator<[string, FormDataNodeEntry]>
}

export default FormDataNode
