const {FormData, File, fileFromPathSync} = require(".")

global.FormData = FormData

if (!global.File) {
  global.File = File
}

exports.fileFromPathSync = fileFromPathSync
exports.FormData = FormData
exports.File = File
