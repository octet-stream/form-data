import {FormData, File, fileFromPathSync} from "."

global.FormData = FormData

if (!global.File) {
  global.File = File
}

export {FormData, File, fileFromPathSync}
