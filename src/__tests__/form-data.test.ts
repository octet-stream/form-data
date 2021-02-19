import { Readable } from 'stream';
import { createReadStream } from 'fs';
// eslint-disable-next-line import/no-unresolved
import { stat } from 'fs/promises';
import { FormData } from '../form-data';
import { File } from '../helpers/file';

function count(fd: FormData): number {
	return [...fd.keys()].length;
}

describe(FormData, () => {
	test('the stream accessor returns a Readable stream', () => {
		const fd = new FormData();
		expect(fd.stream).toBeInstanceOf(Readable);
	});

	it('have no fields by default', () => {
		const fd = new FormData();
		expect(count(fd)).toBe(0);
	});

	it('applies initial fields from a collection', () => {
		const fields = [
			{
				name: 'nick',
				value: 'Rarara',
			},
			{
				name: 'eyes',
				value: 'blue',
			},
		];

		const fd = new FormData(fields);

		expect(count(fd)).toBe(2);
		expect(fd.get('nick')).toBe('Rarara');
		expect(fd.get('eyes')).toBe('blue');
	});

	it('the filename parameter has priority over the ReadStream#path value', async () => {
		const expected = 'form-data.test.ts';
		const fd = new FormData();

		const stream = createReadStream(__filename);
		fd.set('stream', stream, expected, { size: await stat(__filename).then(({ size }) => size) });

		expect(fd.get<File>('stream')!.name).toBe(expected);
	});
});
