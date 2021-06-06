import {File} from "../File"

/**
 * Check if given value is a File, Blob or file-look-a-like object
 *
 * @param value A value to test
 */
const isFile = (value: unknown): value is File => value instanceof File

export default isFile
