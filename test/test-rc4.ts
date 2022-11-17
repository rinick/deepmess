import {assert} from 'chai';
import {RC4} from '../lib';

describe('rc4', () => {
  it('basic', () => {
    const bytes = [3, 5, 1, 2, 3];

    const rc4Encode = new RC4([1, 2, 3]);
    rc4Encode.encryptBytes(bytes);
    assert.deepEqual(bytes, [19, 132, 236, 40, 217]);

    const rc4Decode = new RC4([1, 2, 3]);
    rc4Decode.decryptBytes(bytes);
    assert.deepEqual(bytes, [3, 5, 1, 2, 3]);
  });
});
