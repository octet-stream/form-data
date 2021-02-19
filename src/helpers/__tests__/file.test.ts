import { Readable } from 'stream';
import { File } from '../file';

export function createReadable(): Readable {
	return new Readable({
		read() {
			// eslint-disable-next-line unicorn/no-null
			this.push(null);
		},
	});
}

describe(File.prototype.stream, () => {
	it('should return Readable stream for Buffer content', () => {
		const buffer = Buffer.from('What time is it?');
		const file = new File(buffer, 'file.txt', { size: buffer.length, type: 'text/plain' });

		expect(file.stream()).toBeInstanceOf(Readable);
	});

	it('should return Readable stream for Readable content', () => {
		const readable = createReadable();
		const file = new File(readable, 'file.txt');

		expect(file.stream()).toBeInstanceOf(Readable);
	});

	it("should return ArrayBuffer for Buffer file's content", async () => {
		const buffer = Buffer.from('What time is it?');
		const file = new File(buffer, 'file.txt', { size: buffer.length, type: 'text/plain' });

		expect(await file.arrayBuffer()).toBeInstanceOf(ArrayBuffer);
	});

	it("should return ArrayBuffer for Readable file's content", async () => {
		const readable = createReadable();
		const file = new File(readable, 'file.txt');

		expect(await file.arrayBuffer()).toBeInstanceOf(ArrayBuffer);
	});
});

describe(File.prototype[Symbol.toStringTag], () => {
	it('should return a string', () => {
		const buffer = Buffer.from('What time is it?');
		const file = new File(buffer, 'file.txt', { size: buffer.length, type: 'text/plain' });

		expect(typeof file[Symbol.toStringTag]).toBe('string');
	});
});
