import * as sjcl from 'sjcl';

export class Crypto {
  constructor(private password: string) {
  }

  encrypt(data: string) {
    return sjcl.json.encrypt(this.password, data);
  }

  decrypt(data: sjcl.SjclCipherEncrypted) {
    try {
      return sjcl.json.decrypt(this.password, data) || '{}';
    } catch (e) {
      return '{}';
    }
  }

  toJson(data: string) {
    // return sjcl.json.decode(data);
    return JSON.parse(data);
  }

  fromJson(data) {
    // return sjcl.json.encode(data);
    return JSON.stringify(data);
  }
}
