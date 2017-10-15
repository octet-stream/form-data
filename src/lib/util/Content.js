import StreamIterator from "./StreamIterator"
import isReadable from "./isReadable"
import nextTick from "./nextTick"

const assign = Object.assign

class Content extends Map {
  constructor(...args) {
    super(...args)

    this.__curr = this.entries()
  }

  async* read() {
    while (true) {
      await nextTick()

      const curr = this.__curr.next()

      if (curr.done === true) {
        return null
      }

      // console.log("head")

      const [name, {value}] = curr.value

      if (isReadable(value)) {
        const iterator = new StreamIterator(value)

        for await (const ch of iterator) {
          yield [
            name, assign({}, curr.value, {
              value: ch
            })
          ]
        }
      } else {
        yield [name, curr.value]
      }
    }
  }
}

export default Content
