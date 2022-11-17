import {assert} from 'chai';
import {Base64} from '../lib';

const input = Buffer.from('hello', 'utf-8');
const output = 'Q6LiR6y=';

describe('base64', () => {
  it('basic', () => {
    assert.equal(Base64.encode(input), output);
    assert.deepEqual(Base64.decode(output), Array.from(input));
  });
});
