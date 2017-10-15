import StreamIterator from "./util/StreamIterator"
import isReadable from "./util/isReadable"

class Content extends Map {
  constructor(...args) {
    super(...args)

    this.__curr = this.entries()
  }

  async* read() {
    const curr = this.__curr.next()

    if (curr.done === true) {
      return
    }

    const [, {value}] = curr.value

    if (isReadable(value)) {
      const iterator = new StreamIterator(value)

      for await (const ch of iterator) {
        yield ch
      }
    } else {
      yield curr.value
    }
  }
}

export default Content
