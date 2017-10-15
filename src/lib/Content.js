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

    console.log(value)

    if (isReadable(value)) {
      while (true) {
        const ch = value.read()

        console.log(ch)

        if (ch == null) {
          break
        }

        yield ch
      }
    } else {
      yield curr.value
    }
  }
}

export default Content
