const readOnly = (target, key, descriptor) => ({
  ...descriptor, writable: false, configurable: false
})

module.exports = readOnly
