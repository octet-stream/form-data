import Blob from "fetch-blob"

class File extends Blob {
  constructor(blobParts, name, options) {
    super(blobParts, options)

    this.name = name
  }
}

export default File
