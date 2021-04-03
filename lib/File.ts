import Blob from "fetch-blob"

export interface FileOptions {
  type?: string
  lastModified?: number
}

class File extends Blob {
  name: string

  lastModified: number

  constructor(
    blobParts: Array<string | Blob | ArrayBufferLike | ArrayBufferView | Buffer>,
    name: string,
    options: FileOptions = {}
  ) {
    super(blobParts, options)

    this.name = name
    this.lastModified = options.lastModified || Date.now()
  }
}

export default File
