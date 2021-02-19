import { createReadStream } from 'fs';
import { Readable } from 'stream';
import { FormData } from '../form-data';

export async function read(stream: Readable): Promise<Buffer> {
	const contents = [];
	for await (const chunk of stream) {
		contents.push(chunk);
	}
	return Buffer.concat(contents);
}

describe(FormData.prototype.getComputedLength, () => {
	it('should return a length of the empty FormData', async () => {
		const fd = new FormData();
		const actual = await fd.getComputedLength();

		expect(actual).toBe(Buffer.byteLength(`--${fd.boundary}--\r\n\r\n`));
	});

	it('should return undefined when FormData have Readable fields', async () => {
		const fd = new FormData();

		fd.set('field', 'On Soviet Moon, landscape see binoculars through YOU.');
		// eslint-disable-next-line @typescript-eslint/no-empty-function
		fd.set('another', new Readable({ read() {} }));

		const actual = await fd.getComputedLength();
		expect(actual).toBe(undefined);
	});

	it('should correctly compute content length of the FormData with regular field', async () => {
		const fd = new FormData();

		fd.set('name', 'Nyx');

		const actual = await fd.getComputedLength();
		const expected = await read(fd.stream).then(({ length }) => length);

		expect(actual).toBe(expected);
	});

	it('should correctly compute content length of the FormData with Buffer', async () => {
		const fd = new FormData();

		fd.set('field', Buffer.from('Just another string'));

		const actual = await fd.getComputedLength();
		const expected = await read(fd.stream).then(({ length }) => length);

		expect(actual).toBe(expected);
	});

	it('should correctly compute content length of the FormData with file', async () => {
		const fd = new FormData();
		fd.set('file', createReadStream(__filename));

		const actual = await fd.getComputedLength();
		const expected = await read(fd.stream).then(({ length }) => length);

		expect(actual).toBe(expected);
	});
});
