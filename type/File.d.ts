// <reference types="node" />
import Blob, {BlobParts, BlobOptions} from "./Blob"

declare interface File extends Blob {
  new (parts: BlobParts, name: string, options?: BlobOptions)
}

export default File
