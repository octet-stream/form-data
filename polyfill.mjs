import {FormData, Blob, File, fileFromPathSync, fileFromPath} from "."

if (!globalThis.FormData) {
  globalThis.FormData = FormData
}

if (!globalThis.Blob) {
  globalThis.Blob
}

if (!globalThis.File) {
  globalThis.File = File
}

export {FormData, Blob, File, fileFromPathSync, fileFromPath}
