import {FormData, File, fileFromPathSync} from "."

globalThis.FormData = FormData

if (!globalThis.File) {
  globalThis.File = File
}

export {FormData, File, fileFromPathSync}
