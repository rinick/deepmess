const PAD = 61; // '='
const CR = 13;  // '\r'
const LF = 10;  // '\n'

const _encodeTable =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz+/";

/// Lookup table used for finding Base 64 alphabet index of a given byte.
/// -2 : Outside Base 64 alphabet.
/// -1 : '\r' or '\n'
/// 0 : = (Padding character).
/// >=0 : Base 64 alphabet index of given byte.
const _decodeTable: number[] = (() => {
  let table: number[] = new Array(256);
  table.fill(-2, 0, 256);
  let len = _encodeTable.length;
  for (let i = 0; i < len; ++i) {
    table[_encodeTable.charCodeAt(i)] = i;
  }
  table[CR] = -1;
  table[LF] = -1;
  table[32] = -1;
  table[LF] = -1;
  table[PAD] = 0;
  return table;
})();


/// Special class for the license and JS obscuration.
export class Base64 {

  static encode(bytes: number[] | Uint8Array, lineSize = 0) {
    let len = bytes.length;
    if (len === 0) {
      return "";
    }
    // Size of 24 bit chunks.
    let remainderLength = len % 3;
    let chunkLength = len - remainderLength;
    // Size of base output.
    let outputLen = (Math.floor(len / 3) * 4) + ((remainderLength > 0) ? 4 : 0);
    // Add extra for line separators.
    let lineSizeGroup = lineSize >> 2;
    if (lineSizeGroup > 0) {
      outputLen += Math.floor((outputLen - 1) / (lineSizeGroup << 2)) << 1;
    }
    let out: number[] = new Array(outputLen);

    // Encode 24 bit chunks.
    let j = 0, i = 0, c = 0;
    while (i < chunkLength) {
      let x = (((bytes[i++] % 256) << 16) & 0xFFFFFF) |
        (((bytes[i++] % 256) << 8) & 0xFFFFFF) |
        (bytes[i++] % 256);
      out[j++] = _encodeTable.charCodeAt(x >> 18);
      out[j++] = _encodeTable.charCodeAt((x >> 12) & 0x3F);
      out[j++] = _encodeTable.charCodeAt((x >> 6) & 0x3F);
      out[j++] = _encodeTable.charCodeAt(x & 0x3f);
      // Add optional line separator for each 76 char output.
      if (lineSizeGroup > 0 && ++c === lineSizeGroup && j < outputLen - 2) {
        out[j++] = CR;
        out[j++] = LF;
        c = 0;
      }
    }

    // If input length is not a multiple of 3, encode remaining bytes and
    // add padding.
    if (remainderLength === 1) {
      let x = bytes[i] % 256;
      out[j++] = _encodeTable.charCodeAt(x >> 2);
      out[j++] = _encodeTable.charCodeAt((x << 4) & 0x3F);
      out[j++] = PAD;
      out[j++] = PAD;
    } else if (remainderLength === 2) {
      let x = bytes[i] % 256;
      let y = bytes[i + 1] % 256;
      out[j++] = _encodeTable.charCodeAt(x >> 2);
      out[j++] = _encodeTable.charCodeAt(((x << 4) | (y >> 4)) & 0x3F);
      out[j++] = _encodeTable.charCodeAt((y << 2) & 0x3F);
      out[j++] = PAD;
    }

    return String.fromCharCode(...out);
  }

  static decode(input: string): number[] {
    let len = input.length;
    if (len === 0) {
      return [];
    }

    // Count '\r', '\n' and illegal characters, For illegal characters,
    // throw an exception.
    let extrasLen = 0;
    for (let i = 0; i < len; i++) {
      let c = _decodeTable[input.charCodeAt(i)];
      if (c < 0) {
        extrasLen++;
        if (c === -2) {
          throw new Error(`Invalid character: ${input[i]}`);
        }
      }
    }

    if ((len - extrasLen) % 4 !== 0) {
      throw new Error(`Size of Base 64 characters in Input must be a multiple of 4. Input: $input`);
    }

    // Count pad characters.
    let padLength = 0;
    for (let i = len - 1; i >= 0; i--) {
      let currentCodeUnit = input.charCodeAt(i);
      if (_decodeTable[currentCodeUnit] > 0) break;
      if (currentCodeUnit === PAD) padLength++;
    }
    let outputLen = (((len - extrasLen) * 6) >> 3) - padLength;
    let out: number[] = new Array(outputLen);

    for (let i = 0, o = 0; o < outputLen;) {
      // Accumulate 4 valid 6 bit Base 64 characters into an int.
      let x = 0;
      for (let j = 4; j > 0;) {
        let c = _decodeTable[input.charCodeAt(i++)];
        if (c >= 0) {
          x = ((x << 6) & 0xFFFFFF) | c;
          j--;
        }
      }
      out[o++] = x >> 16;
      if (o < outputLen) {
        out[o++] = (x >> 8) & 0xFF;
        if (o < outputLen) out[o++] = x & 0xFF;
      }
    }
    return out;
  }
}
