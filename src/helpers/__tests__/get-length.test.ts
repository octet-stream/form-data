import { Readable } from 'stream';
import { createReadStream } from 'fs';
// eslint-disable-next-line import/no-unresolved
import { stat } from 'fs/promises';
import { getLength } from '../get-length';

describe(getLength, () => {
	test('should return undefined for stream.Readable value', async () => {
		// eslint-disable-next-line @typescript-eslint/no-empty-function
		expect(await getLength(new Readable({ read() {} }))).toBeUndefined();
	});

	it('should return a length of given ReadStream value', async () => {
		const stream = createReadStream(__filename);

		const expected = await stat(stream.path).then(({ size }) => size);
		const actual = await getLength(stream);

		expect(actual).toBe(expected);
	});

	test('return a length of given Buffer', async () => {
		const buffer = Buffer.from('My hovercraft is full of eels');

		expect(await getLength(buffer)).toBe(buffer.length);
	});

	test('should return a length of given string value', async () => {
		const string = 'My hovercraft is full of eels';

		expect(await getLength(string)).toBe(Buffer.from(string).length);
	});
});
