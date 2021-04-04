import {createInterface} from "readline"
import {Readable} from "stream"

async function* readLine(readable: Readable) {
  const lines = createInterface(readable)

  for await (const line of lines) {
    yield line
  }
}

export default readLine
