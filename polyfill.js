const {FormData, File, fileFromPathSync} = require(".")

globalThis.FormData = FormData

if (!globalThis.File) {
  globalThis.File = File
}

exports.fileFromPathSync = fileFromPathSync
exports.FormData = FormData
exports.File = File
