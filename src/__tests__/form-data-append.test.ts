import { FormData } from '../form-data';

describe(FormData.prototype.append, () => {
	it('should append new values', () => {
		const fd = new FormData();

		fd.append('a', 'a');

		expect([...fd.entries()]).toStrictEqual([['a', 'a']]);
	});

	it('should append a value to the existing field', () => {
		const fd = new FormData();

		fd.append('names', 'John');
		fd.append('names', 'Max');

		expect(fd.getAll('names')).toStrictEqual(['John', 'Max']);
	});

	test('Throws a TypeError when a filename parameter has been set for non-binary value type', () => {
		const fd = new FormData();

		expect(() => fd.append('name', 'Just a string', 'file.txt')).toThrowError(
			new TypeError(
				"Failed to execute 'append' on 'FormData': is not one of the following types: ReadStream | Readable | Buffer | File",
			),
		);
	});
});
