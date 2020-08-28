const Blob = require("fetch-blob")

class File extends Blob {
  constructor(blobParts, name, options) {
    super(blobParts, options)

    this.name = name
  }
}

module.exports = File
