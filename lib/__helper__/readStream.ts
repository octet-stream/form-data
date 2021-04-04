import {Readable} from "stream"

async function readStream(
  readable: Readable,

  // eslint-disable-next-line no-undef
  encoding?: BufferEncoding
): Promise<Buffer | string> {
  const chunks: Buffer[] = []

  for await (const chunk of readable) {
    chunks.push(chunk as Buffer)
  }

  const buffer = Buffer.concat(chunks)

  return encoding ? buffer.toString(encoding) : buffer
}

export default readStream
