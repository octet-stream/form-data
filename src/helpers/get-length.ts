import { ReadStream } from 'fs';
// eslint-disable-next-line import/no-unresolved
import { stat } from 'fs/promises';
import { Readable } from 'stream';
import { FormDataEntry } from '..';
import { File } from './file';

/**
 * Get lenght of given value (in bytes)
 */
export async function getLength(value: FormDataEntry): Promise<number | undefined> {
	if (value instanceof Readable) {
		if (!(value instanceof ReadStream)) {
			return;
		}

		return stat(value.path).then(({ size }) => size);
	}

	if (Buffer.isBuffer(value)) {
		return value.length;
	}

	if (value instanceof File) {
		return value.size;
	}

	return Buffer.from(value).length;
}
