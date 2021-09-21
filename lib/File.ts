import {Blob, BlobPropertyBag} from "./Blob"

export interface FileLike {
  /**
   * Name of the file referenced by the File object.
   */
  readonly name: string

  /**
   * Size of the file parts in bytes
   */
  readonly size: number

  /**
   * Returns the media type ([`MIME`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types)) of the file represented by a `File` object.
   */
  readonly type: string

  /**
   * The last modified date of the file as the number of milliseconds since the Unix epoch (January 1, 1970 at midnight). Files without a known last modified date return the current date.
   */
  readonly lastModified: number

  [Symbol.toStringTag]: string

  /**
   * Returns a [`ReadableStream`](https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream) which upon reading returns the data contained within the [`File`](https://developer.mozilla.org/en-US/docs/Web/API/File).
   */
  stream(): AsyncIterable<Uint8Array>
}

export interface FileOptions extends BlobPropertyBag {
  /**
   * The last modified date of the file as the number of milliseconds since the Unix epoch (January 1, 1970 at midnight). Files without a known last modified date return the current date.
   */
  lastModified?: number
}

export class File extends Blob implements FileLike {
  /**
   * Returns the name of the file referenced by the File object.
   */
  readonly #name: string

  /**
   * The last modified date of the file as the number of milliseconds since the Unix epoch (January 1, 1970 at midnight). Files without a known last modified date return the current date.
   */
  readonly #lastModified: number = 0

  /**
   * Creates a new File instance.
   *
   * @param fileBits An `Array` strings, or [`ArrayBuffer`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer), [`ArrayBufferView`](https://developer.mozilla.org/en-US/docs/Web/API/ArrayBufferView), [`Blob`](https://developer.mozilla.org/en-US/docs/Web/API/Blob) objects, or a mix of any of such objects, that will be put inside the [`File`](https://developer.mozilla.org/en-US/docs/Web/API/File).
   * @param name The name of the file.
   * @param options An options object containing optional attributes for the file.
   */
  constructor(
    fileBits: unknown[],
    name: string,
    options: FileOptions = {lastModified: Date.now()}
  ) {
    super(fileBits, options)

    if (arguments.length < 2) {
      throw new TypeError(
        "Failed to construct 'File': 2 arguments required, "
          + `but only ${arguments.length} present.`
      )
    }

    this.#name = String(name)

    // Simulate WebIDL type casting for NaN value in lastModified option.
    const lastModified = Number(options.lastModified)
    if (!Number.isNaN(lastModified)) {
      this.#lastModified = lastModified
    }
  }

  get name() {
    return this.#name
  }

  get lastModified(): number {
    return this.#lastModified
  }

  get [Symbol.toStringTag](): string {
    return "File"
  }
}
