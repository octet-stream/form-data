import nextTick from "./nextTick"

class StreamIterator {
  constructor(stream) {
    this.__stream = stream

    this.__states = {
      init: Symbol("init"),
      pending: Symbol("pending"),
      read: Symbol("read"),
      end: Symbol("end"),
      error: Symbol("error")
    }

    this.__errors = new Set()

    this.__state = this.__states.pending

    this.__error = null

    this.__stream.on("error", err => {
      this.__error = err

      this.__setState(this.__states.error)
    })
  }

  __setState = state => void (this.__state = state)

  __isState = state => this.__state === state

  __isPendingState = () => this.__isState(this.__states.pending)

  __isEndState = () => {
    // Temporarily hack while waiting for new public APIs of streams:
    // See for more info: https://github.com/nodejs/node/issues/445
    // eslint-disable-next-line
    const state = this.__stream._readableState

    return state.ended && state.endEmitted
  }

  __isErrorState = () => this.__isState(this.__states.error)

  __ensureRead = () => new Promise(resolve => {
    const fulfill = () => {
      resolve(this.__setState(this.__states.read))
    }

    this.__stream.once("readable", fulfill)
  })

  // __ensureEnd = () => new Promise(resolve => {
  //   const fulfill = () => resolve(this.__setState(this.__states.end))

  //   this.__stream.once("end", fulfill)
  // })

  next = async () => {
    while (true) {
      await nextTick()

      if (this.__isEndState()) {
        return {
          value: void 0,
          done: true
        }
      }

      if (this.__isPendingState()) {
        await this.__ensureRead()

        continue
      }

      const value = this.__stream.read()

      if (value == null) {
        this.__setState(this.__states.pending)

        continue
      }

      return {value, done: false}
    }
  }

  [Symbol.asyncIterator]() {
    return this
  }
}

export default StreamIterator
