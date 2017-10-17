import nextTick from "./nextTick"

/**
 * StreamIterator helps with getting data from a Readable stream using an
 * async iterator
 *
 * @api private
 */
class StreamIterator {
  /**
   * @param {stream.Readable} stream
   */
  constructor(stream) {
    this.__stream = stream

    this.__states = {
      pending: Symbol("pending"),
      read: Symbol("read"),
      error: Symbol("error")
    }

    this.__state = this.__states.pending

    this.__error = null

    this.__stream.on("error", this.__onError)
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

  __onError = err => {
    this.__error = err

    this.__setState(this.__states.error)
  }

  __ensureRead = () => new Promise(resolve => {
    const fulfill = () => resolve(this.__setState(this.__states.read))

    this.__stream.once("readable", fulfill)
  })

  next = async () => {
    while (true) {
      await nextTick()

      if (this.__isErrorState()) {
        throw this.__error
      }

      // Ensure of a Readable ending
      if (this.__isEndState()) {
        return {
          value: void 0,
          done: true
        }
      }

      // Set the "readable" event listener (using once method)
      // and wait for the event emitting
      if (this.__isPendingState()) {
        await this.__ensureRead()

        continue
      }

      const value = this.__stream.read()

      // Back to the "pending" state if given value is nullish
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
