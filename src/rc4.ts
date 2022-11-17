/// a simple class that can be used for encryption, descyption and prng
export class RC4 {
  i = 0;
  j = 0;
  S = new Array<number>(256);

  constructor(key: number[] | Uint8Array, round = 2) {
    for (let x = 0; x < 256; ++x) {
      this.S[x] = x;
    }
    const keylen = key.length;
    for (let r = 0; r < round; ++r) {
      let j = 0;
      for (let i = 0; i < 256; ++i) {
        let keyv = key[i % keylen];
        j = (j + this.S [i] + keyv) & 0xFF;
        let t = this.S [i];
        this.S [i] = this.S [j];
        this.S [j] = t;
      }
    }
  }

  /// standard RC4 bytes
  xorBytes(bytes: number[] | Uint8Array) {
    let t, len = bytes.length;
    for (let x = 0; x < len; ++x) {
      this.i = (this.i + 1) & 0xFF;
      this.j = (this.j + this.S[this.i]) & 0xFF;
      t = this.S[this.i];
      this.S[this.i] = this.S[this.j];
      this.S[this.j] = t;
      bytes[x] ^= this.S[(this.S[this.i] + this.S[this.j]) & 0xFF];
    }
  }

  /// custom encryption
  encryptBytes(bytes: number[] | Uint8Array) {
    let t, len = bytes.length;
    for (let x = 0; x < len; ++x) {
      this.i = (this.i + 1) & 0xFF;
      this.j = (this.j + this.S[this.i]) & 0xFF;
      t = this.S[this.i];
      this.S[this.i] = this.S[this.j];
      this.S[this.j] = t;
      bytes[x] ^= this.S[(this.S[this.i] + this.S[this.j]) & 0xFF];
      this.j = (this.j + bytes[x]) & 0xFF;
    }
  }

  /// custom decryption
  decryptBytes(bytes: number[] | Uint8Array) {
    let t, len = bytes.length;
    for (let x = 0; x < len; ++x) {
      this.i = (this.i + 1) & 0xFF;
      this.j = (this.j + this.S[this.i]) & 0xFF;
      t = this.S[this.i];
      this.S[this.i] = this.S[this.j];
      this.S[this.j] = t;
      let byte = bytes[x];
      bytes[x] ^= this.S[(this.S[this.i] + this.S[this.j]) & 0xFF];
      this.j = (this.j + byte) & 0xFF;
    }
  }

  /// prng

  nextByte() {
    this.i = (this.i + 1) & 0xFF;
    this.j = (this.j + this.S[this.i]) & 0xFF;
    let t = this.S[this.i];
    this.S[this.i] = this.S[this.j];
    this.S[this.j] = t;
    return this.S[(this.S[this.i] + this.S[this.j]) & 0xFF];
  }

  nextInt(max: number) {
    let round = max;
    let v = this.nextByte();
    do {
      v = v << 8 | this.nextByte();
      if (v >= max) {
        v %= max;
      }
      round >>= 6;
    } while (round !== 0);
    return v;
  }
}