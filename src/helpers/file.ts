import { Readable } from 'stream';
import { ReadStream } from 'fs';
import mime from 'mime-types';
import type { FormDataFieldOptions } from '..';

export class File {
	public readonly name: string;
	public readonly type: string;
	public readonly size: number;
	public readonly lastModified: number;

	private readonly content: Buffer | Readable | ReadStream;

	public constructor(
		content: Buffer | Readable | ReadStream,
		name: string,
		options?: Omit<FormDataFieldOptions, 'filename'>,
	) {
		this.name = name;
		this.type = options?.type || mime.lookup(name) || '';
		this.size = options?.size ?? 0;
		this.lastModified = options?.lastModified ?? Date.now();

		this.content = content;
	}

	public stream(): Readable {
		const content = this.content;

		if (content instanceof File) {
			return content.stream();
		}

		if (Buffer.isBuffer(content)) {
			// eslint-disable-next-line @typescript-eslint/no-empty-function
			const readable = new Readable({ read() {} });

			readable.push(content);
			// eslint-disable-next-line unicorn/no-null, unicorn/no-array-push-push
			readable.push(null);

			return readable;
		}

		return content;
	}

	public async arrayBuffer(): Promise<ArrayBuffer> {
		const chunks = [];
		for await (const chunk of this.stream()) {
			chunks.push(chunk);
		}

		return Buffer.concat(chunks).buffer;
	}

	public get [Symbol.toStringTag](): string {
		return 'File';
	}
}
