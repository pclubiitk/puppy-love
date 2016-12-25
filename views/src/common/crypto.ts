/// <reference path="../../sjcl/sjcl.d.ts" />

export class Crypto {
  private pubK: sjcl.SjclElGamalPublicKey;
  private priK: sjcl.SjclElGamalSecretKey;

  static hash(data: string) {
    let bits = sjcl.hash.sha256.hash(data);
    return sjcl.codec.hex.fromBits(bits);
  }

  static toJson(data: string) {
    return JSON.parse(data);
  }

  static fromJson(data) {
    return JSON.stringify(data);
  }

  static getRand(cnt?: number): string {
    if (!cnt) cnt = 5;
    return sjcl.codec.hex.fromBits(sjcl.random.randomWords(cnt));
  }

  constructor(private password?: string,
              pubK?: sjcl.SjclElGamalPublicKey,
              priK?: sjcl.SjclElGamalSecretKey) {
    this.pubK = pubK;
    this.priK = priK;
  }

  test() {
    let ct = sjcl.encrypt(this.pubK, 'Hello World!');
    let pt = sjcl.decrypt(this.priK, ct);
    console.log(ct);
    console.log(pt);

    ct = this.encryptAsym('Hello dude');
    pt = this.decryptAsym(ct);
    console.log(ct);
    console.log(pt);
  }

  // Key creation and storage
  // ------------------------
  newKey() {
    // 6 => Paranoia value
    let pair = sjcl.ecc.elGamal.generateKeys(256, 6);
    this.priK = pair.sec;
    this.pubK = pair.pub;
  }

  serializePub() {
    let pub = this.pubK.get();
    return sjcl.codec.base64.fromBits(pub.x.concat(pub.y));
  }

  deserializePub(serializedVal: string) {
    this.pubK = new sjcl.ecc.elGamal.publicKey(
      sjcl.ecc.curves.c256,
      sjcl.codec.base64.toBits(serializedVal)
    );
  }

  serializePriv() {
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


  decryptAsym(data: sjcl.SjclCipherEncrypted) {
    if (!this.priK) {
      console.error('Decryption requires private key');
      return;
    }

    return sjcl.decrypt(this.priK, data);
  }
}
