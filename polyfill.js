const {FormData, Blob, File, fileFromPathSync, fileFromPath} = require(".")

if (!globalThis.FormData) {
  globalThis.FormData = FormData
}

if (!globalThis.Blob) {
  globalThis.Blob = Blob
}

if (!globalThis.File) {
  globalThis.File = File
}

exports.fileFromPathSync = fileFromPathSync
exports.fileFromPath = fileFromPath
exports.FormData = FormData
exports.Blob = Blob
exports.File = File
