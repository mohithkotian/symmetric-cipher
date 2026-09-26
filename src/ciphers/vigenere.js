export const name = 'Vigenère';
export const family = 'Classical';

export function encrypt(plaintext, key) {
  if (!/^[A-Za-z]+$/.test(key)) {
    throw new TypeError('Vigenère key must contain only letters (A–Z).');
  }
  const normKey = key.toUpperCase();
  let keyIndex = 0;
  return String(plaintext).split('').map((ch) => {
    const code = ch.charCodeAt(0);
    const isUpper = code >= 65 && code <= 90;
    const isLower = code >= 97 && code <= 122;
    if (!isUpper && !isLower) return ch;
    const base = isUpper ? 65 : 97;
    const shift = normKey.charCodeAt(keyIndex % normKey.length) - 65;
    keyIndex++;
    return String.fromCharCode(((code - base + shift) % 26) + base);
  }).join('');
}

export function decrypt(ciphertext, key) {
  if (!/^[A-Za-z]+$/.test(key)) {
    throw new TypeError('Vigenère key must contain only letters (A–Z).');
  }
  const normKey = key.toUpperCase();
  let keyIndex = 0;
  return String(ciphertext).split('').map((ch) => {
    const code = ch.charCodeAt(0);
    const isUpper = code >= 65 && code <= 90;
    const isLower = code >= 97 && code <= 122;
    if (!isUpper && !isLower) return ch;
    const base = isUpper ? 65 : 97;
    const shift = normKey.charCodeAt(keyIndex % normKey.length) - 65;
    keyIndex++;
    return String.fromCharCode(((code - base - shift + 26) % 26) + base);
  }).join('');
}
