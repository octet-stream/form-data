const globalObject = ((): typeof globalThis => {
  // new standardized access to the global object
  if (typeof globalThis !== "undefined") {
    return globalThis
  }

  // WebWorker specific access
  if (typeof self !== "undefined") {
    return self
  }

  return window
})()

export const {FormData, Blob, File} = globalObject
