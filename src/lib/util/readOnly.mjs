const readOnly = (target, key, descriptor) => ({
  ...descriptor, writable: false, configurable: false
})

export default readOnly
