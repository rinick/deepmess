import JsonEsc from 'jsonesc';
import {RC4} from "./rc4";
import {Base64} from "./base64";

function getKeyArray(key: any) {
  if (key == null) {
    key = __filename;
  }
  const keyStr = JsonEsc.stringify(key, null, true);
  let r = new RC4([0], 1);
  r.encryptBytes(Buffer.from(keyStr, 'utf-8'));
  return r.S;
}

export class EnvCode {
  static encode(str: string, key: any = null): string {
    const keyArray = getKeyArray(key);
    let r = new RC4(keyArray);
    let buffer = Buffer.from(str, 'utf-8');
    r.encryptBytes(buffer);
    return Base64.encode(buffer);
  }

  static decode(str: string, key: any = null): string {
    const bytes = Base64.decode(str);
    const buffer = Buffer.from(bytes);

    const keyArray = getKeyArray(key);
    let r = new RC4(keyArray);
    r.decryptBytes(buffer);

    return buffer.toString();
  }
}