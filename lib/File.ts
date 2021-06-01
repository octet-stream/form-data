import {Readable} from "stream"

import Blob from "fetch-blob"

export {Blob}

export interface FileLike {
  /**
   * Name of the file referenced by the File object.
   */
  name: string

  /**
   * Size of the file parts in bytes
   */
  size: number

  /**
   * The last modified date of the file as the number of milliseconds since the Unix epoch (January 1, 1970 at midnight). Files without a known last modified date return the current date.
   */
  lastModified: number

  stream(): Readable | {
    [Symbol.asyncIterator](): AsyncIterableIterator<Uint8Array>
  }
}

export interface FileOptions {
  /**
   * Returns the media type ([`MIME`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types)) of the file represented by a `File` object.
   */
  type?: string

  /**
   * The last modified date of the file as the number of milliseconds since the Unix epoch (January 1, 1970 at midnight). Files without a known last modified date return the current date.
   */
  lastModified?: number
}

export class File extends Blob implements FileLike {
  /**
   * Returns the name of the file referenced by the File object.
   */
  name: string

  /**
   * The last modified date of the file as the number of milliseconds since the Unix epoch (January 1, 1970 at midnight). Files without a known last modified date return the current date.
   */
  lastModified: number

  /**
   * Creates a new File instance.
   *
   * @param blobParts An `Array` strings, or [`Buffer`](https://nodejs.org/dist/latest/docs/api/buffer.html#buffer_class_buffer), [`ArrayBuffer`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer), [`ArrayBufferView`](https://developer.mozilla.org/en-US/docs/Web/API/ArrayBufferView), [`Blob`](https://developer.mozilla.org/en-US/docs/Web/API/Blob) objects, or a mix of any of such objects, that will be put inside the [`File`](https://developer.mozilla.org/en-US/docs/Web/API/File).
   * @param name The name of the file.
   * @param options An options object containing optional attributes for the file.
   */
  constructor(
    blobParts: Array<
    string | Blob | ArrayBufferLike | ArrayBufferView | Buffer | FileLike
    >,
    name: string,
    options: FileOptions = {}
  ) {
    if (arguments.length < 2) {
      throw new TypeError(
        "Failed to construct 'File': 2 arguments required, "
          + `but only ${arguments.length} present.`
      )
    }

    super(blobParts as any[], options)

    this.name = name
    this.lastModified = options.lastModified || Date.now()
  }
}
