/* eslint-disable no-undef, no-restricted-globals */

type Names = "FormData" | "Blob" | "File"

function accessValue(name: Names): unknown {
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

export const FormData = accessValue("FormData") as typeof globalThis.FormData
export const Blob = accessValue("Blob") as typeof globalThis.Blob
export const File = accessValue("File") as typeof globalThis.File
