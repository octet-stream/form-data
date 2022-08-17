import {Blob} from "./Blob.js"

export const isBlob = (value: unknown): value is Blob => value instanceof Blob
