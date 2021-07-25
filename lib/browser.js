module.exports = typeof globalThis !== 'undefined' // new standardized access to the global object
  ? globalThis.FormData
  : typeof self !== 'undefined' // WebWorker specific access
  ? self.FormData
  : window.FormData;
