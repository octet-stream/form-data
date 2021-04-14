import {Readable} from "stream"

type Input<T = any> = Readable | {
  [Symbol.asyncIterator](): AsyncIterableIterator<T>
}

async function readStream<T = any>(input: Input<T>): Promise<Buffer>
async function readStream<T = any>(
  input: Input<T>,

  // eslint-disable-next-line no-undef
  encoding: BufferEncoding
): Promise<string>
async function readStream<T = any>(
  input: Input<T>,

  // eslint-disable-next-line no-undef
  encoding?: BufferEncoding
): Promise<Buffer | string> {
  const chunks: Buffer[] = []

  for await (const chunk of input) {
    chunks.push(chunk as Buffer)
  }

  const buffer = Buffer.concat(chunks)

  return encoding ? buffer.toString(encoding) : buffer
}

export default readStream
