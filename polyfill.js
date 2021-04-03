const {FormData, File} = require("./lib/cjs")

global.FormData = FormData

if (!global.File) {
  global.File = File
}

module.exports = FormData
