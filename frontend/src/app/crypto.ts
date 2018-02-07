export class Crypto {

  static hash(data: string) {
    const bits = sjcl.hash.sha256.hash(data);
    return sjcl.codec.hex.fromBits(bits);
  }

  static toJson(data: string) {
    return JSON.parse(data);
  }

  static fromJson(data) {
    return JSON.stringify(data);
  }

  static getRand(cnt = 5): string {
    return sjcl.codec.hex.fromBits(sjcl.random.randomWords(cnt));
  }

  constructor(private password?: string,
              private pubK?: sjcl.SjclElGamalPublicKey,
              private priK?: sjcl.SjclElGamalSecretKey) {
  }

  // Key creation and storage
  // ------------------------
  newKey() {
    // 6 => Paranoia value
    const pair = sjcl.ecc.elGamal.generateKeys(256, 6);
    this.priK = pair.sec;
    this.pubK = pair.pub;
  }

  diffieHellman(pub: string): string {
    let pp = new sjcl.ecc.elGamal.publicKey(
      sjcl.ecc.curves.c256,
      sjcl.codec.base64.toBits(pub)
    );
    return sjcl.codec.hex.fromBits(this.priK.dh(pp));
  }

  serializePub(): string {
    const pub = this.pubK.get();
    return sjcl.codec.base64.fromBits(pub.x.concat(pub.y));
  }

  deserializePub(serializedVal: string) {
    this.pubK = new sjcl.ecc.elGamal.publicKey(
      sjcl.ecc.curves.c256,
      sjcl.codec.base64.toBits(serializedVal)
    );
  }

  serializePriv(): string {
    return sjcl.codec.base64.fromBits(this.priK.get());
  }

  deserializePriv(sec: string) {
    let bitsec = sjcl.codec.base64.toBits(sec);
    this.priK = new sjcl.ecc.elGamal.secretKey(
      sjcl.ecc.curves.c256,
      sjcl.ecc.curves.c256.field.fromBits(bitsec)
    );
  }

  // Symmetric enc and dec
  // ---------------------
  encryptSym(data: string) {
    return sjcl.json.encrypt(this.password, data);
  }

  decryptSym(data: sjcl.SjclCipherEncrypted) {
    try {
      return sjcl.json.decrypt(this.password, data) || '{}';
    } catch (e) {
      return '{}';
    }
  }

  // Asymmetric enc and dec
  // ----------------------
  encryptAsym(data: string): sjcl.SjclCipherEncrypted {
    if (!this.pubK) {
      console.error('Using non-existing public key');
      return;
    }

    return sjcl.encrypt(this.pubK, data);
  }


  decryptAsym(data: sjcl.SjclCipherEncrypted): string | undefined {
    if (!this.priK) {
      console.error('Decryption requires private key');
      return undefined;
    }

    try {
      return sjcl.decrypt(this.priK, data);
    } catch (e) {
      return undefined;
    }
  }
}
