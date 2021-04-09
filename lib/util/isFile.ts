import {File} from "../File"

const isFile = (value: unknown): value is File => value instanceof File

export default isFile
