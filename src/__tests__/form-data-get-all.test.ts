import { createReadStream } from 'fs';
// eslint-disable-next-line import/no-unresolved
import { readFile } from 'fs/promises';
import { join } from 'path';
import { FormData } from '../form-data';
import { File } from '../helpers/file';
import { read } from './form-data-get-computed-length.test';

const filePath = join(__dirname, '../../package.json');

describe(FormData.prototype.getAll, () => {
	it('should always return an array, even if the FormData has no fields', () => {
		const fd = new FormData();
		expect(Array.isArray(fd.getAll('nope'))).toBe(true);
	});

	it('should get all values', () => {
		const fd = new FormData();

		fd.set('a', 'a');
		expect(fd.getAll('a')).toStrictEqual(['a']);

		fd.set('1', 'b');
		expect(fd.getAll('1')).toStrictEqual(['b']);
	});

	it('should return an array', () => {
		const fd = new FormData();
		fd.set('number', '451');

		expect(fd.getAll('number')).toStrictEqual(['451']);
	});

	it('should return an array with non-stringified Readable', () => {
		const fd = new FormData();
		const stream = createReadStream(filePath);
		fd.set('stream', stream);

		expect(fd.getAll('stream')).toStrictEqual([stream]);
	});

	it('should return an array with non-stringified Buffer', async () => {
		const fd = new FormData();
		const buffer = await readFile(filePath);
		fd.set('buffer', buffer);

		const [actual] = fd.getAll('buffer');

		expect(actual).toBeInstanceOf(File);
		expect((await read((actual as File).stream())).equals(buffer)).toBe(true);
	});
});
