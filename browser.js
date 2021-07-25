const accessValue = name => (
  globalThis !== "undefined" // new standardized access to the global object
    ? globalThis[name]
    : typeof self !== "undefined" // WebWorker specific access
    ? self[name]
    : window[name]
)

/** @type {FormData} */
export const FormData = accessValue('FormData')

/** @type {Blob} */
export const Blob = accessValue('Blob')

/** @type {File} */
export const File = accessValue('File')
