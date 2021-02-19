import { Readable } from 'stream';
import { basename } from 'path';
import { randomBytes } from 'crypto';
import { ReadStream } from 'fs';
import mimes from 'mime-types';
import { File, getLength } from './helpers';

const DEFAULT_CONTENT_TYPE = 'application/octet-stream';
const DASHES = '--';
const CARRIAGE = '\r\n';

export interface FormDataFieldOptions {
	size?: number;
	type?: string;
	lastModified?: number;
	filename?: string;
}

export type FormDataEntry = string | ReadStream | Readable | Buffer | File;

export interface FormDataField {
	/**
	 * 	 *
	 * @param {string} name The name of the field whose data
	 *   is contained in value
	 *
	 */
	name: string;
	/**
	 * The field value. You can pass any primitive type
	 * (including null and undefined), Buffer or Readable stream.
	 * Note that Arrays and Object will be converted to string
	 * by using String function.
	 */
	value: FormDataEntry;
	/**
	 * A filename of given field. Can be added only for Buffer and Readable.
	 */
	filename?: string;
	options?: FormDataFieldOptions;
}

/**
 * FormData implementation for Node.js.
 */
export class FormData {
	/**
	 * Generates a new boundary string once FormData instance constructed
	 */
	public readonly boundary = `NodeJSFormDataStreamBoundary${randomBytes(16).toString('hex')}`;

	/**
	 * Returns headers for multipart/form-data
	 */
	public readonly headers = Object.freeze({
		'Content-Type': `multipart/form-data;boundary=${this.boundary}`,
	});

	private readonly content = new Map<
		string,
		{ append: boolean; values: { value: FormDataEntry; filename?: string }[] }
	>();
	private readonly footer = `${DASHES}${this.boundary}${DASHES}` + `${CARRIAGE.repeat(2)}`;

	/**
	 * @param fields an optional FormData initial fields.
	 * Each field must be passed as a collection of the objects
	 * with "name", "value" and "filename" props.
	 * See the `FormData#append()` method for more information.
	 */
	public constructor(fields?: FormDataField[]) {
		if (fields) {
			for (const field of fields) {
				this.setField(field, false);
			}
		}
	}

	/**
	 * Refers to the internal Readable stream
	 */
	public get stream(): Readable {
		return Readable.from(this.read());
	}

	/**
	 * Returns a mime type by field's filename
	 */
	private getMimeType(filename: string): string {
		return mimes.lookup(filename) || DEFAULT_CONTENT_TYPE;
	}

	/**
	 * Returns a headers for given field's data
	 */
	private getHeader(name: string, filename?: string) {
		let header = `${DASHES}${this.boundary}${CARRIAGE}Content-Disposition: form-data;name="${name}"`;

		if (filename) {
			header += `;filename="${filename}"${CARRIAGE}Content-Type: ${this.getMimeType(filename)}`;
		}

		return `${header}${CARRIAGE.repeat(2)}`;
	}

	/**
	 * Get each field from internal Map
	 */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	private async *getField(): AsyncGenerator<Buffer | string, void, any> {
		for (const [name, { values }] of this.content) {
			for (const { value, filename } of values) {
				// Set field's header
				yield this.getHeader(name, filename);

				if (value instanceof File) {
					yield* value.stream();
				} else if (value instanceof Readable) {
					// Read the stream content
					yield* value;
				} else {
					yield value;
				}

				// Add trailing carriage
				yield CARRIAGE;
			}
		}

		// Add a footer when all fields ended
		yield this.footer;
	}

	/**
	 * Read values from internal storage and push it to the internal stream
	 */
	private async *read(): AsyncGenerator<Buffer> {
		for await (const field of this.getField()) {
			yield Buffer.isBuffer(field) ? field : Buffer.from(field);
		}
	}

	/**
	 * Appends a new value onto an existing key inside a FormData object,
	 * or adds the key if it does not already exist.
	 */
	// eslint-disable-next-line sonarjs/cognitive-complexity
	private setField({ name, value, filename, options }: FormDataField, append: boolean): void {
		// FormData requires the `value` to be some kind of binary data when a filename has been set.
		if (filename && !(value instanceof File || value instanceof Readable || Buffer.isBuffer(value))) {
			throw new TypeError(
				`Failed to execute '${
					append ? 'append' : 'set'
				}' on 'FormData': is not one of the following types: ReadStream | Readable | Buffer | File`,
			);
		}

		// Get a filename for Buffer, File, ReadStream and Readable values
		if (value instanceof ReadStream) {
			// Readable stream which created from fs.createReadStream
			// have a "path" property. So, we can get a "filename"
			// from the stream itself.
			filename = basename(value.path.toString('utf8'));
		} else if (filename && (Buffer.isBuffer(value) || value instanceof Readable)) {
			filename = basename(filename);
		} else if (value instanceof File) {
			filename = basename(filename || value.name);
		}

		// TODO: Also, don't forget to test for the filename priorities
		// Normalize field content
		if ((value instanceof Readable && options?.size) || Buffer.isBuffer(value)) {
			value = new File(value, filename || name, {
				...options,
				size: Buffer.isBuffer(value) ? value.length : options?.size,
			});
		}

		const field = this.content.get(name);

		// Set a new field if given name is not exists
		if (!field) {
			this.content.set(name, {
				append,
				values: [{ value, filename: filename! }],
			});
			return;
		}

		// Replace a value of the existing field if "set" called
		if (!append) {
			this.content.set(name, {
				append,
				values: [{ value, filename }],
			});
			return;
		}

		// Do nothing if the field has been created from .set()
		if (!field.append) {
			return;
		}

		// Append a new value to the existing field
		field.values.push({ value, filename });

		this.content.set(name, field);
	}

	/**
	 * Returns computed length of the FormData content.
	 * If data contains stream.Readable field(s),
	 * the method will always return undefined.
	 */
	public async getComputedLength(): Promise<number | undefined> {
		let length = 0;
		const carriageLength = Buffer.from(CARRIAGE).length;

		for (const [name, { values }] of this.content) {
			for (const { value, filename } of values) {
				length += Buffer.from(this.getHeader(name, filename)).length;

				const valueLength = await getLength(value);

				// Return `undefined` if can't tell field's length
				// (it's probably a stream with unknown length)
				if (valueLength === undefined) {
					return;
				}

				length += valueLength + carriageLength;
			}
		}

		return length + Buffer.from(this.footer).length;
	}

	/**
	 * Appends a new value onto an existing key inside a FormData object,
	 * or adds the key if it does not already exist.
	 */
	public append(name: string, value: FormDataEntry, filename?: string): void;
	public append(name: string, value: FormDataEntry, options?: FormDataFieldOptions): void;
	public append(name: string, value: FormDataEntry, filename?: string, options?: FormDataFieldOptions): void;
	public append(
		name: string,
		value: FormDataEntry,
		filename?: string | FormDataFieldOptions,
		options?: FormDataFieldOptions,
	): void {
		return this.setField({ name, value, filename: typeof filename === 'string' ? filename : undefined, options }, true);
	}

	/**
	 * Set a new value for an existing key inside FormData,
	 * or add the new field if it does not already exist.
	 */
	public set(name: string, value: FormDataEntry, filename?: string): void;
	public set(name: string, value: FormDataEntry, options?: FormDataFieldOptions): void;
	public set(name: string, value: FormDataEntry, filename?: string, options?: FormDataFieldOptions): void;
	public set(
		name: string,
		value: FormDataEntry,
		filename?: string | FormDataFieldOptions,
		options?: FormDataFieldOptions,
	): void {
		return this.setField(
			{ name, value, filename: typeof filename === 'string' ? filename : undefined, options },
			false,
		);
	}

	/**
	 * Check if a field with the given name exists inside FormData.
	 *
	 * @param name A name of the field you want to test for.
	 */
	public has(name: string): boolean {
		return this.content.has(name);
	}

	/**
	 * Returns the first value associated with the given name.
	 * Buffer and Readable values will be returned as-is.
	 *
	 * @param name A name of the value you want to retrieve.
	 */
	public get<T extends FormDataEntry = FormDataEntry>(name: string): T | undefined {
		return this.content.get(name)?.values[0].value as T | undefined;
	}

	/**
	 * Returns all the values associated with
	 * a given key from within a FormData object.
	 *
	 * @param name A name of the value you want to retrieve.
	 */
	public getAll<T extends FormDataEntry = FormDataEntry>(name: string): T[] {
		return (this.content.get(name)?.values.map(({ value }) => value) ?? []) as T[];
	}

	/**
	 * Deletes a key and its value(s) from a FormData object.
	 *
	 * @param name The name of the key you want to delete.
	 */
	public delete(name: string): boolean {
		return this.content.delete(name);
	}

	public keys(): IterableIterator<string> {
		return this.content.keys();
	}

	public *entries<T extends FormDataEntry = FormDataEntry>(): IterableIterator<[string, T]> {
		for (const name of this.keys()) {
			const values = this.getAll(name);

			// Yield each value of a field, like browser-side FormData does.
			for (const value of values) {
				yield [name, value as T];
			}
		}
	}

	public *values<T extends FormDataEntry = FormDataEntry>(): IterableIterator<T> {
		for (const [, values] of this) {
			yield values as T;
		}
	}

	public [Symbol.iterator](): IterableIterator<[string, FormDataEntry]> {
		return this.entries();
	}

	/**
	 * Executes a given callback for each field of the FormData instance
	 *
	 * @param callbackfn Function to execute for each element,
	 *   taking three arguments:
	 *     * `value` – A value(s) of the current field.
	 *     * `name` – Name of the current field.
	 *     * `fd` – The FormData instance that forEach
	 *       is being applied to
	 */
	public forEach(callbackfn: (value: FormDataEntry, name: string, fd: FormData) => void, thisArg?: unknown): void {
		for (const [name, value] of this) {
			callbackfn.call(thisArg, value, name, this);
		}
	}

	/**
	 * This method allows to read a content from internal stream
	 * using async generators and for-await-of APIs.
	 * An alias of FormData#stream[Symbol.asyncIterator]()
	 */
	public [Symbol.asyncIterator](): AsyncIterableIterator<Buffer> {
		return this.stream[Symbol.asyncIterator]();
	}

	public get [Symbol.toStringTag](): string {
		return 'FormData';
	}
}
