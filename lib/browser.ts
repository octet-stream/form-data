/* eslint-disable no-undef, no-restricted-globals */

type Name = "FormData" | "Blob" | "File";
type Exports = typeof FormData | typeof Blob | typeof File;
type AccessValue = (name: Name) => Exports;

const accessValue: AccessValue = name => {
  // new standardized access to the global object
  if (typeof globalThis !== "undefined") {
    return globalThis[name]
  }
  // WebWorker specific access
  if (typeof self !== "undefined") {
    return self[name]
  }

  return window[name]
}

const formData = accessValue("FormData")
const blob = accessValue("Blob")
const file = accessValue("File")

export {formData as FormData, blob as Blob, file as File}
