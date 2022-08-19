import {Blob} from "./Blob"

export const isBlob = (value: unknown): value is Blob => value instanceof Blob
