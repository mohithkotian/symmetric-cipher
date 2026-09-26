export const name = 'Caesar';
export const family = 'Classical';

export function encrypt(plaintext, key) {
  const shift = ((key % 26) + 26) % 26;
  return String(plaintext).split('').map((ch) => {
    const code = ch.charCodeAt(0);
    const isUpper = code >= 65 && code <= 90;
    const isLower = code >= 97 && code <= 122;
    if (!isUpper && !isLower) return ch;
    const base = isUpper ? 65 : 97;
    return String.fromCharCode(((code - base + shift) % 26) + base);
  }).join('');
}

export function decrypt(ciphertext, key) {
  const shift = ((key % 26) + 26) % 26;
  return String(ciphertext).split('').map((ch) => {
    const code = ch.charCodeAt(0);
    const isUpper = code >= 65 && code <= 90;
    const isLower = code >= 97 && code <= 122;
    if (!isUpper && !isLower) return ch;
    const base = isUpper ? 65 : 97;
    return String.fromCharCode(((code - base - shift + 26) % 26) + base);
  }).join('');
}
