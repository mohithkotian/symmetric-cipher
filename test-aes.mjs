import assert from 'node:assert/strict';
import { encryptBlock, decryptBlock, hexToBytes, bytesToHex } from './src/ciphers/aes.js';

const key = hexToBytes('000102030405060708090a0b0c0d0e0f');
const plaintext = hexToBytes('00112233445566778899aabbccddeeff');
const expected = '69c4e0d86a7b0430d8cdb78070b4c55a';

const trace = [];
const ciphertext = encryptBlock(plaintext, key, trace);
assert.equal(bytesToHex(ciphertext), expected);
console.log('PASS 1: AES-128 FIPS-197 encryption');

assert.equal(bytesToHex(decryptBlock(ciphertext, key)), bytesToHex(plaintext));
console.log('PASS 2: AES-128 decryption round trip');

assert.equal(trace.length, 41);
assert.equal(trace[0].label, 'Input');
assert.equal(trace.at(-1).label, 'AddRoundKey');
console.log('PASS 3: 41 AES transformation snapshots');
