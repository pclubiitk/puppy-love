/* SystemJS module definition */
declare var module: NodeModule;
interface NodeModule {
  id: string;
}

// Type definitions for sjcl v1.0.1
// Project: http://crypto.stanford.edu/sjcl/
// Definitions by: Eugene Chernyshov <https://github.com/Evgenus>
// Definitions: https://github.com/borisyankov/DefinitelyTyped

// Development repository: https://github.com/Evgenus/sjcl-typescript-definitions
// For answers, fixes and cutting edge version please see development repository.
declare module sjcl {

    /**
     * Module for encoding/decoding BitArray into various representations.
     */
    module codec {

        /**
         * UTF-8 strings.
         */
        module utf8String {

            /**
             * Convert from a BitArray to a UTF-8 string.
             *
             * @param {BitArray} bits The source BitArray object.
             *
             * @return {string} A string.
             */
            export function fromBits(bits: BitArray): string;

            /**
             * Convert from a UTF-8 string to a BitArray.
             *
             * @param {string} value The source string value.
             *
             * @return {BitArray} value as a BitArray.
             */
            export function toBits(value: string): BitArray;
        }

        /**
         * Hexadecimal.
         */
        module hex {

            /**
             * Convert from a BitArray to a hex string.
             *
             * @param {BitArray} bits The source BitArray object.
             *
             * @return {string} A string.
             */
            export function fromBits(bits: BitArray): string;

            /**
             * Convert from a hex string to a BitArray.
             *
             * @param {string} value The source string with hexes.
             *
             * @return {BitArray} value as a BitArray.
             */
            export function toBits(value: string): BitArray;
        }

        /**
         * Base64 encoding/decoding.
         */
        module base64 {

            /**
             * Convert from a BitArray to a base64 string.
             *
             * @param {BitArray} bits The source BitArray object.
             *
             * @return {string} A string.
             */
            export function fromBits(bits: BitArray): string;

            /**
             * Convert from a base64 string to a BitArray.
             *
             * @param {string} value The source string with base64 representation.
             *
             * @return {BitArray} value as a BitArray.
             */
            export function toBits(value: string): BitArray;
        }

        /**
         * Base64 encoding/decoding.
         */
        module base64url {

            /**
             * Convert from a BitArray to a base64 string.
             *
             * @param {BitArray} bits The source BitArray object.
             *
             * @return {string} A string.
             */
            export function fromBits(bits: BitArray): string;

            /**
             * Convert from a base64 string to a BitArray.
             *
             * @param {string} value The source string with base64 representation suitable for inserting into
             *                       URLs.
             *
             * @return {BitArray} value as a BitArray.
             */
            export function toBits(value: string): BitArray;
        }

        /**
         * Arrays of bytes.
         */
        module bytes {

            /**
             * Convert from a BitArray to an array of bytes.
             *
             * @param {BitArray} bits The source BitArray object.
             *
             * @return {number[]} A array of numbers where each item represents byte.
             */
            export function fromBits(bits: BitArray): number[];

            /**
             * Convert from an array of bytes to a BitArray.
             *
             * @param {number[]} value The source array of numbers where each item represents byte.
             *
             * @return {BitArray} value as a BitArray.
             */
            export function toBits(value: number[]): BitArray;
        }
    }

    interface BitArray extends Array<number> {
    }

    module bitArray {

        /**
         * Array slices in units of bits.
         *
         * @param {BitArray} a    The array to slice.
         * @param {number} bstart The offset to the start of the slice, in bits.
         * @param {number} bend   The offset to the end of the slice, in bits.  If this is undefined, slice
         *                        until the end of the array.
         *
         * @return {BitArray} The requested slice.
         */
        export function bitSlice(a: BitArray, bstart: number, bend: number): BitArray;

        /**
         * Extract a number packed into a bit array.
         *
         * @param {BitArray} a    The array to slice.
         * @param {number} bstart The offset to the start of the slice, in bits.
         * @param {number} blenth The length of the number to extract.
         *
         * @return {number} The requested slice.
         */
        export function extract(a: BitArray, bstart: number, blenth: number): number;

        /**
         * Concatenate two bit arrays.
         *
         * @param {BitArray} a1 The first array.
         * @param {BitArray} a2 The second array.
         *
         * @return {BitArray} The concatenation of a1 and a2.
         */
        export function concat(a1: BitArray, a2: BitArray): BitArray

        /**
         * Find the length of an array of bits.
         *
         * @param {BitArray} a The array.
         *
         * @return {number} The length of a, in bits.
         */
        export function bitLength(a: BitArray): number;

        /**
         * Truncate an array.
         *
         * @param {BitArray} a The array.
         * @param {number} len The length to truncate to, in bits.
         *
         * @return {BitArray} A new array, truncated to len bits.
         */
        export function clamp(a: BitArray, len: number): BitArray;

        /**
         * Make a partial word for a bit array.
         *
         * @param {number} len   The number of bits in the word.
         * @param {number} x     The bits.
         * @param {number=} _end (Optional) _end Pass 1 if x has already been shifted to the high side.
         *
         * @return {number} The partial word.
         */
        export function partial(len: number, x: number, _end?: number): number;

        /**
         * Get the number of bits used by a partial word.
         *
         * @param {number} x The partial word.
         *
         * @return {number} The number of bits used by the partial word.
         */
        export function getPartial(x: number): number;

        /**
         * Compare two arrays for equality in a predictable amount of time.
         *
         * @param {BitArray} a The first array.
         * @param {BitArray} b The second array.
         *
         * @return {boolean} true if a == b; false otherwise.
         */
        export function equal(a: BitArray, b: BitArray): boolean;

        /**
         * Shift an array right.
         *
         * @private This function is for internal use.
         *
         * @param {BitArray} a    The array to shift.
         * @param {number} shift  The number of bits to shift.
         * @param {number=} carry (Optional) A byte to carry in.
         * @param {BitArray=} out (Optional) An array to prepend to the output.
         *
         * @return {BitArray} A shifted BitArray.
         */
        export function _shiftRight(a: BitArray, shift: number, carry?: number, out?: BitArray): BitArray;

        /**
         * xor a block of 4 words together.
         *
         * @private This function is for internal use.
         *
         * @param {number[]} x The first block of 4 words.
         * @param {number[]} y The second block of 4 words.
         *
         * @return A result block of 4 words as array of numbers.
         */
        export function _xor4(x: number[], y: number[]): number[];
    }

    module hash {
        interface SjclHash {

            /**
             * The hash's block size, in bits.
             * @constant.
             */
            blockSize: number;

            /**
             * Reset the hash state.
             * @return this
             */
            reset(): SjclHash;

            /**
             * Input several words to the hash.
             *
             * @param {string} data the data to hash.
             *
             * @return this.
             */
            update(data: string|BitArray): SjclHash;

            /**
             * Complete hashing and output the hash value.
             *
             * @return {BitArray} The hash value.
             */
            finalize(): BitArray;
        }

        interface SjclHashStatic {
            new (hash?: SjclHash): SjclHash;

            /**
             * Hash a string.
             * @static.
             *
             * @param {string|BitArray} data the data to hash.
             *
             * @return {BitArray} The hash value.
             */
            hash(data: string|BitArray): BitArray;
        }

        class sha1 implements SjclHash {

            /**
             * Context for a SHA-1 operation in progress.
             *
             * @class Secure Hash Algorithm, 160 bits.
             *
             * @constructor.
             *
             * @param {sha1=} hash (Optional) the hash to copy.
             */
            constructor(hash?: sha1);

            /**
             * The hash's block size, in bits.
             *
             * @constant Equals to 512.
             */
            blockSize: number;

            /**
             * Reset the hash state.
             * @return this
             */
            reset(): SjclHash;

            /**
             * Input several words to the hash.
             *
             * @param {string|BitArray} data the data to hash.
             *
             * @return this.
             */
            update(data: string|BitArray): SjclHash;

            /**
             * Complete hashing and output the hash value.
             *
             * @return {BitArray} The hash value, an array of 5 big-endian words.
             */
            finalize(): BitArray;

            /**
             * Hash a string.
             * @static.
             *
             * @param {string|BitArray} data the data to hash.
             *
             * @return {BitArray} The hash value, an array of 5 big-endian words.
             */
            static hash(data: string|BitArray): BitArray;
        }

        class sha256 implements SjclHash {

            /**
             * Context for a SHA-256 operation in progress.
             *
             * @class Secure Hash Algorithm, 256 bits.
             *
             * @constructor.
             *
             * @param {sha256=} hash (Optional) the hash to copy.
             */
            constructor(hash?: sha256);

            /**
             * The hash's block size, in bits.
             *
             * @constant Equals to 512.
             */
            blockSize: number;

            /**
             * Reset the hash state.
             *
             * @return this.
             */
            reset(): SjclHash;

            /**
             * Input several words to the hash.
             *
             * @param {string|BitArray} data the data to hash.
             *
             * @return this.
             */
            update(data: string|BitArray): SjclHash;

            /**
             * Complete hashing and output the hash value.
             *
             * @return {BitArray} The hash value, an array of 8 big-endian words.
             */
            finalize(): BitArray;

            /**
             * Hash a string.
             * @static.
             *
             * @param {string|BitArray} data the data to hash.
             *
             * @return {BitArray} The hash value, an array of 8 big-endian words.
             */
            static hash(data: string|BitArray): BitArray;
        }

        class sha512 implements SjclHash {

            /**
             * Context for a SHA-512 operation in progress.
             *
             * @class Secure Hash Algorithm, 512 bits.
             *
             * @constructor.
             *
             * @param {sha512=} hash (Optional) the hash.
             */
            constructor(hash?: sha512);

            /**
             * The hash's block size, in bits.
             *
             * @constant Equals to 1024.
             */
            blockSize: number;

            /**
             * Reset the hash state.
             *
             * @return this.
             */
            reset(): SjclHash;

            /**
             * Input several words to the hash.
             *
             * @param {string|BitArray} data the data to hash.
             *
             * @return this.
             */
            update(data: string|BitArray): SjclHash;

            /**
             * Complete hashing and output the hash value.
             *
             * @return {BitArray} The hash value, an array of 16 big-endian words.
             */
            finalize(): BitArray;

            /**
             * Hash a string.
             * @static.
             *
             * @param {string} data the data to hash.
             *
             * @return {BitArray} The hash value, an array of 16 big-endian words.
             */
            static hash(data: string|BitArray): BitArray;
        }
    }

    module mode {

        /**
         * @namespace Galois/Counter mode.
         */
        module gcm {

            /**
             * The name of the mode.
             * @type {string}
             * @constant Equals to `gcm`.
             */
            var name: string;

            /**
             * Encrypt in GCM mode.
             *
             * @static.
             *
             * @param {SjclCipher} prp     The pseudorandom function.  It must have a block size of 16 bytes.
             * @param {BitArray} plaintext The plaintext data.
             * @param {BitArray} iv        The initialization value.
             * @param {BitArray=} adata    (Optional) The authenticated data. Default is [].
             * @param {number=} tlen       (Optional) The desired tag length, in bits. Default is 128.
             *
             * @return {BitArray} The encrypted data, an array of bytes.
             */
            export function encrypt(prp: SjclCipher, plaintext: BitArray, iv: BitArray, adata?: BitArray, tlen?: number): BitArray;

            /**
             * Decrypt in GCM mode.
             *
             * @static.
             *
             * @param {SjclCipher} prp      The pseudorandom function.  It must have a block size of 16 bytes.
             * @param {BitArray} ciphertext The ciphertext data.
             * @param {BitArray} iv         The initialization value.
             * @param {BitArray=} adata     (Optional) The authenticated data. Default is [].
             * @param {number=} tlen        (Optional) The desired tag length, in bits. Default is 128.
             *
             * @return {BitArray} The decrypted data.
             */
            export function decrypt(prp: SjclCipher, ciphertext: BitArray, iv: BitArray, adata?: BitArray, tlen?: number): BitArray;

            /**
             * GCM CTR mode. Encrypt or decrypt data and tag with the prf in GCM-style CTR mode.
             *
             * @private.
             *
             * @param {boolean} encrypt True if encrypt, false if decrypt.
             * @param {SjclCipher} prf  The PRF.
             * @param {BitArray} data   The data to be encrypted or decrypted.
             * @param {BitArray} adata  The associated data to be tagged.
             * @param {BitArray} iv     The initialization vector.
             * @param {number} tlen     The length of the tag, in bits.
             *
             * @return An export.
             */
            export function _ctrMode(encrypt: boolean, prf: SjclCipher, data: BitArray, adata: BitArray, iv: BitArray, tlen: number): {
                tag: BitArray;
                data: BitArray;
            };
        }

        /**
         * @namespace CBC mode with PKCS#5 padding.
         *
         * @deprecated CBC mode is dangerous because it doesn't protect message integrity.
         */
        module cbc {

            /**
             * The name of the mode.
             * @type {string}
             * @constant Equals to `cbc`.
             */
            var name: string;

            /**
             * Encrypt in CBC mode with PKCS#5 padding.
             *
             * @param {SjclCipher} prp     The block cipher.  It must have a block size of 16 bytes.
             * @param {BitArray} plaintext The plaintext data.
             * @param {BitArray} iv        The initialization value.
             * @param {BitArray=} adata    (Optional) The authenticated data.  Must be empty.
             *
             * @return The encrypted data, an array of bytes.
             */
            export function encrypt(prp: SjclCipher, plaintext: BitArray, iv: BitArray, adata?: BitArray): BitArray;

            /**
             * Decrypt in CBC mode.
             *
             * @param {SjclCipher} prp      The block cipher.  It must have a block size of 16 bytes.
             * @param {BitArray} ciphertext The ciphertext data.
             * @param {BitArray} iv         The initialization value.
             * @param {BitArray=} adata     (Optional) The authenticated data.  It must be empty.
             *
             * @return The decrypted data, an array of bytes.
             *
             * @throws {sjcl.exception.invalid} if the IV isn't exactly 128 bits, or if any adata is specified.
             * @throws {sjcl.exception.corrupt} if if the message is corrupt.
             */
            export function decrypt(prp: SjclCipher, ciphertext: BitArray, iv: BitArray, adata?: BitArray): BitArray;
        }

        module ccm {

            /**
             * The name of the mode.
             * @type {string}
             * @constant Equals to `ccm`.
             */
            var name: string;

            /**
             * Encrypt in CCM mode.
             * @static.
             *
             * @param {SjclCipher} prp     The pseudorandom function. It must have a block size of 16 bytes.
             * @param {BitArray} plaintext The plaintext data.
             * @param {BitArray} iv        The initialization value.
             * @param {BitArray=} adata    (Optional) The authenticated data. Default is [].
             * @param {number=} tlen       (Optional) the desired tag length, in bits. Default is 64.
             *
             * @return {BitArray} The encrypted data, an array of bytes.
             */
            export function encrypt(prp: SjclCipher, plaintext: BitArray, iv: BitArray, adata?: BitArray, tlen?: number): BitArray;

            /**
             * Decrypt in CCM mode.
             * @static.
             *
             * @param {SjclCipher} prp      The pseudorandom function.  It must have a block size of 16 bytes.
             * @param {BitArray} ciphertext The ciphertext data.
             * @param {BitArray} iv         The initialization value.
             * @param {BitArray=} adata     (Optional) adata The authenticated data. Default is [].
             * @param {number=} tlen        (Optional) tlen the desired tag length, in bits. Default is 64.
             *
             * @return {BitArray} The decrypted data.
             */
            export function decrypt(prp: SjclCipher, ciphertext: BitArray, iv: BitArray, adata?: BitArray, tlen?: number): BitArray;
        }

        module ocb2 {

            /**
             * The name of the mode.
             * @type {string}
             * @constant Equals to `ocb2`.
             */
            var name: string;

            /**
             * Encrypt in OCB mode, version 2.0.
             *
             * @param {SjclCipher} prp     The block cipher.  It must have a block size of 16 bytes.
             * @param {BitArray} plaintext The plaintext data.
             * @param {BitArray} iv        The initialization value.
             * @param {BitArray=} adata    (Optional) The authenticated data. Default is [].
             * @param {number=} tlen       (Optional) the desired tag length, in bits. Default is 64.
             * @param {boolean=} premac    (Optional) 1 if the authentication data is pre-macced with PMAC.
             *
             * @return The encrypted data, an array of bytes.
             *
             * @throws {sjcl.exception.invalid} if the IV isn't exactly 128 bits.
             */
            export function encrypt(prp: SjclCipher, plaintext: BitArray, iv: BitArray, adata?: BitArray, tlen?: number, premac?: boolean): BitArray;

            /**
             * Decrypt in OCB mode.
             *
             * @param {SjclCipher} prp      The block cipher.  It must have a block size of 16 bytes.
             * @param {BitArray} ciphertext The ciphertext data.
             * @param {BitArray} iv         The initialization value.
             * @param {BitArray=} adata     (Optional) The authenticated data. Default is [].
             * @param {number=} tlen        (Optional) the desired tag length, in bits. Default is 64.
             * @param {boolean=} premac     (Optional) true if the authentication data is pre-macced with
             *                              PMAC. Default is false.
             *
             * @return The decrypted data, an array of bytes.
             *
             * @throws {sjcl.exception.invalid} if the IV isn't exactly 128 bits.
             * @throws {sjcl.exception.corrupt} if if the message is corrupt.
             */
            export function decrypt(prp: SjclCipher, ciphertext: BitArray, iv: BitArray, adata?: BitArray, tlen?: number, premac?: boolean): BitArray;

            /**
             * PMAC authentication for OCB associated data.
             *
             * @param {SjclCipher} prp The block cipher.  It must have a block size of 16 bytes.
             * @param {BitArray} adata The authenticated data.
             *
             * @return {number[]} A number[].
             */
            export function pmac(prp: SjclCipher, adata: BitArray): number[];
        }
    }

    export var bn: BigNumberStatic;
    export var exception: SjclExceptions;
    export var cipher: SjclCiphers;
    export var misc: SjclMisc;
    export var ecc: SjclEllipticCurveCryptography;
    export var random: SjclRandom;
    export var prng: SjclRandomStatic;
    export var keyexchange: SjclKeyExchange;
    export var json: SjclJson;

    export function encrypt(password: string|BitArray|SjclElGamalPublicKey, plaintext: string, params?: SjclCipherEncryptParams, rp?: SjclCipherEncrypted): SjclCipherEncrypted;
    export function decrypt(password: string|BitArray|SjclElGamalSecretKey, ciphertext: SjclCipherEncrypted, params?: SjclCipherDecryptParams, rp?: SjclCipherDecrypted): string;

    // ________________________________________________________________________

    interface BigNumber {
        radix: number;
        maxMul: number;

        copy(): BigNumber;

        /// Initializes this with it, either as a bn, a number, or a hex string.
        initWith(that: number|string|BigNumber): BigNumber;

        /// Returns true if "this" and "that" are equal.  Calls fullReduce().
        /// Equality test is in constant time.
        equals(that: number|BigNumber): boolean;

        /// Get the i'th limb of this, zero if i is too large.
        getLimb(index: number): number;

        /// Constant time comparison function.
        /// Returns 1 if this >= that, or zero otherwise.
        greaterEquals(that: number|BigNumber): boolean;

        /// Convert to a hex string.
        toString(): string;

        /// this += that.  Does not normalize.
        addM(that: number|string|BigNumber): BigNumber;

        /// this *= 2.  Requires normalized; ends up normalized.
        doubleM(): BigNumber;

        /// this /= 2, rounded down.  Requires normalized; ends up normalized.
        halveM(): BigNumber;

        /// this -= that.  Does not normalize.
        subM(that: number|string|BigNumber): BigNumber;

        mod(that: number|string|BigNumber): BigNumber;

        /// return inverse mod prime p.  p must be odd. Binary extended Euclidean algorithm mod p.
        inverseMod(p: number|string|BigNumber): BigNumber;

        /// this + that.  Does not normalize.
        add(that: number|string|BigNumber): BigNumber;

        /// this - that.  Does not normalize.
        sub(that: number|string|BigNumber): BigNumber;

        /// this * that.  Normalizes and reduces.
        mul(that: number|string|BigNumber): BigNumber;

        /// this ^ 2.  Normalizes and reduces.
        square(): BigNumber;

        /// this ^ n.  Uses square-and-multiply.  Normalizes and reduces.
        power(n: number|number[]|BigNumber): BigNumber;

        /// this * that mod N
        mulmod(that: number|string|BigNumber, N: number|string|BigNumber): BigNumber;

        /// this ^ x mod N
        powermod(that: number|string|BigNumber, N: number|string|BigNumber): BigNumber;

        trim(): BigNumber;

        /// Reduce mod a modulus.  Stubbed for subclassing.
        reduce(): BigNumber;

        /// Reduce and normalize.
        fullReduce(): BigNumber;

        /// Propagate carries.
        normalize(): BigNumber;

        /// Constant-time normalize. Does not allocate additional space.
        cnormalize(): BigNumber;

        /// Serialize to a bit array
        toBits(len?: number): BitArray;

        /// Return the length in bits, rounded up to the nearest byte.
        bitLength(): number;
    }

    interface BigNumberStatic {
        new (n?: string|number|BigNumber): BigNumber;

        fromBits(bits: BitArray): BigNumber;
        random(bits: number): BigNumber;
        prime: {
            p127: PseudoMersennePrimeStatic;
            // Bernstein's prime for Curve25519
            p25519: PseudoMersennePrimeStatic;
            // Koblitz primes
            p192k: PseudoMersennePrimeStatic;
            p224k: PseudoMersennePrimeStatic;
            p256k: PseudoMersennePrimeStatic;
            // NIST primes
            p192: PseudoMersennePrimeStatic;
            p224: PseudoMersennePrimeStatic;
            p256: PseudoMersennePrimeStatic;
            p384: PseudoMersennePrimeStatic;
            p521: PseudoMersennePrimeStatic;
        };

        pseudoMersennePrime(exponent: number, coeff: number[][]): PseudoMersennePrimeStatic;
    }

    interface PseudoMersennePrime extends BigNumber {
        reduce(): PseudoMersennePrime;
        fullReduce(): PseudoMersennePrime;
        inverse(): PseudoMersennePrime;
    }

    interface PseudoMersennePrimeStatic extends BigNumberStatic {
        new (n: string|number|BigNumber): PseudoMersennePrime;
    }

    // ________________________________________________________________________

    interface SjclExceptions {
        corrupt: SjclExceptionFactory;
        invalid: SjclExceptionFactory;
        bug: SjclExceptionFactory;
        notReady: SjclExceptionFactory;
    }

    interface SjclExceptionFactory {
        new (message: string): Error;
    }

    // ________________________________________________________________________

    interface SjclCiphers {
        aes: SjclCipherStatic;
    }

    interface SjclCipher {
        encrypt(data: number[]): number[];
        decrypt(data: number[]): number[];
    }

    interface SjclCipherStatic {
        new (key: number[]): SjclCipher;
    }


    // ________________________________________________________________________

    interface Pbkdf2Params {
        iter?: number;
        salt?: BitArray;
    }

    interface SjclMisc {
        pbkdf2(password: string|BitArray, salt: string|BitArray, count?: number, length?: number, Prff?: SjclPseudorandomFunctionFamilyStatic): BitArray;
        hmac: SjclHmacStatic;
        cachedPbkdf2(password: string, obj?: Pbkdf2Params): {
            key: BitArray;
            salt: BitArray;
        };
    }

    class SjclPseudorandomFunctionFamily {
        encrypt(data: string|BitArray): BitArray;
    }

    interface SjclHmac extends SjclPseudorandomFunctionFamily {
        mac(data: string|BitArray): BitArray;
        reset(): void;
        update(data: string|BitArray): void;
        digest(): BitArray;
    }

    interface SjclPseudorandomFunctionFamilyStatic {
        new (key: BitArray): SjclPseudorandomFunctionFamily;
    }

    interface SjclHmacStatic {
        new (key: BitArray, Hash?: hash.SjclHashStatic): SjclHmac;
    }

    // ________________________________________________________________________

    interface SjclEllipticCurveCryptography {
        point: SjclEllipticalPointStatic;
        pointJac: SjclPointJacobianStatic;
        curve: SjclEllipticalCurveStatic;
        curves: {
            c192: SjclEllipticalCurve;
            c224: SjclEllipticalCurve;
            c256: SjclEllipticalCurve;
            c384: SjclEllipticalCurve;
            k192: SjclEllipticalCurve;
            k224: SjclEllipticalCurve;
            k256: SjclEllipticalCurve;
        };
        basicKey: SjclECCBasic;
        elGamal: SjclElGamal;
        ecdsa: SjclEcdsa;
    }

    interface SjclEllipticalPoint {
        toJac(): SjclPointJacobian;
        mult(k: BigNumber): SjclEllipticalPoint;
        mult2(k: BigNumber, k2: BigNumber, affine2: SjclEllipticalPoint): SjclEllipticalPoint;
        multiples(): Array<SjclEllipticalPoint>;
        isValid(): boolean;
        toBits(): BitArray;
    }

    interface SjclEllipticalPointStatic {
        new (curve: SjclEllipticalCurve, x?: BigNumber, y?: BigNumber): SjclEllipticalPoint;
    }

    interface SjclPointJacobian {
        add(T: SjclEllipticalPoint): SjclPointJacobian;
        doubl(): SjclPointJacobian;
        toAffine(): SjclEllipticalPoint;
        mult(k: BigNumber, affine: SjclEllipticalPoint): SjclPointJacobian;
        mult2(k1: BigNumber, affine: SjclEllipticalPoint, k2: BigNumber, affine2: SjclEllipticalPoint): SjclPointJacobian;
        isValid(): boolean;
    }

    interface SjclPointJacobianStatic {
        new (curve: SjclEllipticalCurve, x?: BigNumber, y?: BigNumber, z?: BigNumber): SjclPointJacobian;
    }

    interface SjclEllipticalCurve {
        fromBits(bits: BitArray): SjclEllipticalPoint;
        field: BigNumberStatic;
    }

    interface SjclEllipticalCurveStatic {
        new (Field: BigNumber, r: BigNumber, a: BigNumber, b: BigNumber, x: BigNumber, y: BigNumber): SjclEllipticalCurve;
    }

    interface SjclKeyPair<P extends SjclECCPublicKey, S extends SjclECCSecretKey> {
        pub: P;
        sec: S;
    }

    interface SjclKeysGenerator<P extends SjclECCPublicKey, S extends SjclECCSecretKey> {
        (curve: SjclEllipticalCurve, paranoia: number, sec?: BigNumber): SjclKeyPair<P, S>;
        (curve: number, paranoia: number, sec?: BigNumber): SjclKeyPair<P, S>;
    }

    interface SjclECCPublicKeyData {
        x: BitArray;
        y: BitArray;
    }

    class SjclECCPublicKey {
        get(): SjclECCPublicKeyData;
    }

    class SjclECCSecretKey {
        get(): BitArray;
    }

    interface SjclECCPublicKeyFactory<T extends SjclECCPublicKey> {
        new (curve: SjclEllipticalCurve, point: SjclEllipticalPoint|BitArray): T;
    }

    interface SjclECCSecretKeyFactory<T extends SjclECCSecretKey> {
        new (curve: SjclEllipticalCurve, exponent: BigNumber): T;
    }

    interface SjclECCBasic {
        publicKey: SjclECCPublicKeyFactory<SjclECCPublicKey>;
        secretKey: SjclECCSecretKeyFactory<SjclECCSecretKey>;
        generateKeys(cn: string): SjclKeysGenerator<SjclECCPublicKey, SjclECCSecretKey>;
    }

    class SjclElGamalPublicKey extends SjclECCPublicKey {
        kem(paranoia: number): {
            key: BitArray;
            tag: BitArray;
        };
    }

    class SjclElGamalSecretKey extends SjclECCSecretKey {
        unkem(tag: BitArray): BitArray;
        dh(pk: SjclECCPublicKey): BitArray;
    }

    interface SjclElGamal {
        publicKey: SjclECCPublicKeyFactory<SjclElGamalPublicKey>;
        secretKey: SjclECCSecretKeyFactory<SjclElGamalSecretKey>;
        generateKeys: SjclKeysGenerator<SjclElGamalPublicKey, SjclElGamalSecretKey>;
    }

    class SjclEcdsaPublicKey extends SjclECCPublicKey {
        verify(hash: BitArray, rs: BitArray, fakeLegacyVersion: boolean): boolean;
    }

    class SjclEcdsaSecretKey extends SjclECCSecretKey {
        sign(hash: BitArray, paranoia: number, fakeLegacyVersion: boolean, fixedKForTesting?: BigNumber): BitArray;
    }

    interface SjclEcdsa {
        publicKey: SjclECCPublicKeyFactory<SjclEcdsaPublicKey>;
        secretKey: SjclECCSecretKeyFactory<SjclEcdsaSecretKey>;
        generateKeys: SjclKeysGenerator<SjclEcdsaPublicKey, SjclEcdsaSecretKey>;
    }

    // ________________________________________________________________________

    interface SjclRandom {
        randomWords(nwords: number, paranoia?: number): BitArray;
        setDefaultParanoia(paranoia: number, allowZeroParanoia: string): void;
        addEntropy(data: number|number[]|string, estimatedEntropy: number, source: string): void;
        isReady(paranoia?: number): boolean;
        getProgress(paranoia?: number): number;
        startCollectors(): void;
        stopCollectors(): void;
        addEventListener(name: string, cb: Function): void;
        removeEventListener(name: string, cb: Function): void;
    }

    interface SjclRandomStatic {
        new (defaultParanoia: number): SjclRandom;
    }

    // ________________________________________________________________________

    interface SjclKeyExchange {
        srp: SecureRemotePassword;
    }

    interface SjclSRPGroup {
        N: BigNumber;
        g: BigNumber;
    }

    interface SecureRemotePassword {
        makeVerifier(username: string, password: string, salt: BitArray, group: SjclSRPGroup): BitArray;
        makeX(username: string, password: string, salt: BitArray): BitArray;
        knownGroup(i: string|number): SjclSRPGroup;
    }

    // ________________________________________________________________________

    interface SjclCipherParams {
        v?: number;
        iter?: number;
        ks?: number;
        ts?: number;
        mode?: string;
        adata?: string;
        cipher?: string;
    }

    interface SjclCipherEncryptParams extends SjclCipherParams {
        salt: BitArray;
        iv: BitArray;
    }

    interface SjclCipherDecryptParams extends SjclCipherParams {
        salt?: BitArray;
        iv?: BitArray;
    }

    interface SjclCipherEncrypted extends SjclCipherEncryptParams {
        kemtag?: BitArray;
        ct: BitArray;
    }

    interface SjclCipherDecrypted extends SjclCipherEncrypted {
        key: BitArray;
    }

    interface SjclJson {
        encrypt(password: string|BitArray|SjclElGamalPublicKey, plaintext: string, params?: SjclCipherEncryptParams, rp?: SjclCipherEncrypted): SjclCipherEncrypted;
        decrypt(password: string|BitArray|SjclElGamalSecretKey, ciphertext: SjclCipherEncrypted, params?: SjclCipherDecryptParams, rp?: SjclCipherDecrypted): string;
        encode(obj: Object): string;
        decode(obj: string): Object;
    }
}
