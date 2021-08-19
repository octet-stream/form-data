/**
 * Casts filename to string or return default filename.
 * Returns "blob" if given filename is undefined.
 *
 * @param name A filename to normalize
 */
const normalizeFilename = (name: string = "blob"): string => String(name)

export default normalizeFilename
