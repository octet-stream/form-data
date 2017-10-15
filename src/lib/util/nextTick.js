const nextTick = () => new Promise(resolve => process.nextTick(resolve))

export default nextTick
