import Blob from "fetch-blob"

const isBlob = (value: unknown): value is Blob => value instanceof Blob

export default isBlob
