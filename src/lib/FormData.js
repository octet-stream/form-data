import {Readable} from "stream"
import {basename} from "path"

import nano from "nanoid"
import invariant from "@octetstream/invariant"

import bind from "./util/bind"
import concat from "./util/concat"
import isBuffer from "./util/isBuffer"
import isReadable from "./util/isReadable"
import nextTick from "./util/nextTick"

import StreamIterator from "./util/StreamIterator"

// import Content from "./util/Content"

class FormData {
  constructor() {
    bind([Symbol.iterator, "keys", "values", "entries"], this)

    this.__caret = "\r\n"
    this.__defaultContentType = "application/octet-steam"

    // TODO: Remove all non alpha-numeric characters from boundary
    this.__boundary = concat("--", nano())

    // this.__contents = new Content()
    // this.__curr = this.__contents.read()


    this.__contents = new Map()
    this.__entries = this.__contents.entries()

    this.__curr = this.__getField()

    const read = this.__read

    this.__stream = new Readable({read})

    this.headers = {
      "Content-Type": concat(
        "multipart/form-data; boundary=", this.__boundary
      )
    }
  }

  __generateHead(name) {
    const head = [
      this.__boundary, this.__caret,
      "Content-Disposition: form-data; ", "name=\"", name, "\"",
      this.__caret.repeat(2)
    ]

    return concat(head)
  }

  /**
   * @private
   */
  async* __getField() {
    while (true) {
      await nextTick()

      const curr = this.__entries.next()

      if (curr.done === true) {
        return null
      }

      const [, {value}] = curr.value

      if (isReadable(value)) {
        const iterator = new StreamIterator(value)

        for await (const ch of iterator) {
          yield ch
        }
      } else {
        yield isBuffer(value) ? value : Buffer.from(value)
      }
    }
  }

  /**
   * @private
   */
  __read = () => {
    const onFulfilled = curr => {
      if (curr.done) {
        return this.__stream.push(null)
      }

      const ch = curr.value

      this.__stream.push(ch)
    }

    const onRejected = err => this.__stream.emit("error", err)

    this.__curr.next().then(onFulfilled, onRejected)
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
