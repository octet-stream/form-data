const {FormData, File} = require(".")

global.FormData = FormData

if (!global.File) {
  global.File = File
}

exports.FormData = FormData
exports.File = File
