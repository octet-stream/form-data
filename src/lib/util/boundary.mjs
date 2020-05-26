/**
 * @api private
 *
 * @return {string}
 */
const boundary = () => Math.random().toString(32).slice(2)

export default boundary
