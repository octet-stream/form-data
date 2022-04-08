import {File} from "./File.js"

/**
 * Checks if given value is a File, Blob or file-look-a-like object.
 *
 * @param value A value to test
 */
export const isFile = (value: unknown): value is File => value instanceof File
