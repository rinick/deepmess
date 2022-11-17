import {assert} from 'chai';
import {EnvCode} from '../lib/env-code';

describe('envcode', () => {
  it('basic', () => {
    const input = 'hello';
    const encoded = EnvCode.encode(input);
    assert.equal(EnvCode.decode(encoded), input);
  });
});
