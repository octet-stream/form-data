const accessValue = (name) =>
  globalThis !== 'undefined' // new standardized access to the global object
    ? globalThis[name]
    : typeof self !== 'undefined' // WebWorker specific access
    ? self[name]
    : window[name];

export const FormData = accessValue('FormData');
export const Blob = accessValue('Blob');
export const File = accessValue('File');
