import {Readable} from "stream"
import {basename} from "path"

import nano from "nanoid"
import invariant from "@octetstream/invariant"

import bind from "./util/bind"
import concat from "./util/concat"
import isBuffer from "./util/isBuffer"
import isReadable from "./util/isReadable"

class FormData {
  constructor() {
    bind([Symbol.iterator, "keys", "values", "entries"], this)

    this.__caret = "\r\n"
    this.__defaultContentType = "application/octet-steam"
    this.__boundary = concat("--", nano())

    this.__contents = new Map()
    this.__curr = this.__contents.entries()

    const read = this.__read

    this.__stream = new Readable({read})

    this.headers = {
      "Content-Type": concat("multipart/form-data; ", this.__boundary)
    }
  }

  __generateHead(name) {
    const head = [
      this.__boundary, this.__caret,
      "Content-Disposition: form-data;", "name=\"", name, "\";"
    ]

    return concat(head)
  }

  /**
   * @private
   */
  __generateField(name, value) {
    const field = [
      this.__generateHead(name, value),
      this.__generateContent(value)
    ]

    for (const [idx, val] of field.entries()) {
      field[idx] = Buffer.from(val)
    }

    return Buffer.concat(field)
  }

  /**
   * @private
   */
  __read = () => {
    const curr = this.__curr.next()

    if (curr.done) {
      return void this.__stream.push(null)
    }

    const [name, {value, filename}] = curr.value

    this.__stream.push(this.__generateField(name, value, filename))
  }

  __setField(name, value, filename, append = false) {
    if (isBuffer(value)) {
      invariant(!filename, Error, "Filename required for Buffer values.")

      filename = basename(filename)
    } else if (isReadable(value)) {
      filename = basename(filename || value.path)
    } else {
      value = String(value)
    }

    append = Boolean(append)

    this.__contents.set(String(name), {append, value, filename})
  }

  append = (name, value, filename) => {
    if (this.has(name) === false) {
      return this.__setField(name, value, filename, true)
    }

    const field = this.get(name)

    if (field.append === true) {
      this.__setField(name, `${field.value}${value}`, filename)
    }
  }

  /**
   * Set new field on FormData
   *
   * @param {string} name – field name
   * @param {any} value – field value
   */
  set = (name, value, filename) => this.__setField(name, value, filename)

  has = name => this.__contents.has(name)

  // NOTE: This method should return only the first field value.
  // I should add this behaviour somehow
  get = name => {
    const field = this.__contents.get(name)

    return field ? field.value : void 0
  }

  // TODO: Implement this method due to spec
  // getAll = () => {}

  delete = name => void this.__contents.delete(name)

  pipe = (...args) => this.__stream.pipe(...args)

  on = (name, fn) => {
    this.__stream.on(name, fn)

    return this
  }

  [Symbol.iterator] = () => this.__contents[Symbol.iterator]()

  keys() {
    return this.__contents.keys()
  }

  values() {
    return this.__contents.values()
  }

  entries() {
    return this.__contents.entries()
  }

  toString() {
    return "[object FormData]"
  }

  inspect() {
    return "FormData { }"
  }
}

export default FormData
