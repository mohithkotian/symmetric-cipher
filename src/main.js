import { encrypt, decrypt } from './ciphers/caesar.js';
import { encrypt as vigEncrypt, decrypt as vigDecrypt } from './ciphers/vigenere.js';

// Numeric-key modulo-26 Caesar cipher engine
const MAX_PLAINTEXT_LENGTH = 10000;
const MAX_KEY_LENGTH = 100;

function parseNumericKey(key) {
  const keyText = String(key).trim();
  if (!/^\d+$/.test(keyText)) {
    throw new TypeError('The secret key must be a non-negative integer.');
  }

  const numericKey = Number(keyText);
  if (!Number.isSafeInteger(numericKey)) {
    throw new RangeError('The secret key must be a safe integer.');
  }

  return numericKey;
}

function effectiveKey(key) {
  return parseNumericKey(key) % 26;
}

function validateInputs(plaintext, key) {
  if (!plaintext || plaintext.length === 0) {
    return { valid: false, message: 'Plaintext message cannot be empty.' };
  }
  if (plaintext.length > MAX_PLAINTEXT_LENGTH) {
    return { valid: false, message: `Plaintext message is too long. Please limit it to ${MAX_PLAINTEXT_LENGTH.toLocaleString()} characters.` };
  }

  const keyText = String(key);
  if (keyText.length > MAX_KEY_LENGTH) {
    return { valid: false, message: `Secret key is too long. Please limit it to ${MAX_KEY_LENGTH} characters.` };
  }
  if (keyText.trim() === '') {
    return { valid: false, message: 'Secret key cannot be empty. Enter a non-negative integer.' };
  }
  try {
    parseNumericKey(key);
  } catch (error) {
    return { valid: false, message: error.message };
  }
  return { valid: true, message: '' };
}

let _lastCiphertext = '';
let _lastPlaintext = '';
let _lastKey = '';

function setText(id, value) {
  const element = document.getElementById(id);
  if (element) element.textContent = value;
}

function showError(message) {
  setText('sim-error-text', message);
  const errorDiv = document.getElementById('sim-error');
  if (errorDiv) errorDiv.classList.remove('hidden');
}

function hideError() {
  const errorDiv = document.getElementById('sim-error');
  if (errorDiv) errorDiv.classList.add('hidden');
}

function updateEffectiveShift(key) {
  const numericKey = parseNumericKey(key);
  const shift = numericKey % 26;
  setText('effective-shift', `${numericKey} mod 26 = ${shift}`);
  setText('effective-shift-detail', `${numericKey} ≡ ${shift} (mod 26)`);
  setText('trace-key', String(numericKey));
  setText('trace-shift', String(shift));
  setText('step-card-k', String(numericKey));
  setText('step-card-shift', String(shift));
}

function createTextElement(tagName, className, text) {
  const element = document.createElement(tagName);
  element.className = className;
  element.textContent = String(text);
  return element;
}

function createCharacterCell(character, cellClass, badgeClass) {
  const cell = createTextElement('td', cellClass, '');
  cell.appendChild(createTextElement('span', badgeClass, character));
  return cell;
}

function renderTransformationTable(text, key) {
  const container = document.getElementById('caesar-table-container');
  if (!container) return;

  container.replaceChildren();
  if (!text) {
    container.appendChild(createTextElement(
      'div',
      'text-on-surface-variant text-sm py-4 text-center',
      'Enter plaintext and a numeric key to view the transformation table.'
    ));
    return;
  }

  const numericKey = parseNumericKey(key);
  const shift = numericKey % 26;
  const table = document.createElement('table');
  table.className = 'w-full border-collapse text-xs sm:text-sm';

  const headerRow = document.createElement('tr');
  headerRow.className = 'border-b border-surface-container text-left text-on-surface-variant';
  ['#', 'Plaintext Character', 'P Value', 'Secret Key', 'Effective Shift', 'Calculation', 'Cipher Character']
    .forEach((heading, index) => {
      const headingClass = index === 0
        ? 'py-2.5 px-3 text-center font-label-md font-medium'
        : 'py-2.5 px-3 text-center font-label-md font-medium whitespace-nowrap';
      headerRow.appendChild(createTextElement('th', headingClass, heading));
    });
  const tableHead = document.createElement('thead');
  tableHead.appendChild(headerRow);
  table.appendChild(tableHead);

  const tableBody = document.createElement('tbody');
  String(text).split('').forEach((character, index) => {
    const code = character.charCodeAt(0);
    const isUppercase = code >= 65 && code <= 90;
    const isLowercase = code >= 97 && code <= 122;
    const isLetter = isUppercase || isLowercase;
    const displayCharacter = character === ' ' ? '␠' : character;
    const row = document.createElement('tr');
    row.className = 'border-b border-surface-container/60 last:border-0';

    if (!isLetter) {
      const unchangedClass = 'py-2.5 px-3 text-center font-mono text-on-surface-variant';
      row.appendChild(createTextElement('td', unchangedClass, `#${index + 1}`));
      row.appendChild(createCharacterCell(
        displayCharacter,
        'py-2.5 px-3 text-center font-bold text-on-surface',
        'inline-block min-w-[1.5rem] px-2 py-0.5 rounded-lg bg-surface-container-lowest shadow-xs'
      ));
      row.appendChild(createTextElement('td', unchangedClass, '—'));
      row.appendChild(createTextElement('td', unchangedClass, '—'));
      row.appendChild(createTextElement('td', unchangedClass, '—'));
      row.appendChild(createTextElement('td', `${unchangedClass} whitespace-nowrap`, `unchanged (${displayCharacter})`));
      row.appendChild(createCharacterCell(
        displayCharacter,
        'py-2.5 px-3 text-center font-bold text-on-surface',
        'inline-block min-w-[1.5rem] px-2 py-0.5 rounded-lg bg-surface-container-lowest shadow-xs'
      ));
      tableBody.appendChild(row);
      return;
    }

    const alphabetStart = isUppercase ? 65 : 97;
    const pValue = code - alphabetStart;
    const cipherValue = (pValue + numericKey) % 26;
    const cipherCharacter = String.fromCharCode(cipherValue + alphabetStart);
    row.appendChild(createTextElement('td', 'py-2.5 px-3 text-center font-mono text-on-surface-variant', `#${index + 1}`));
    row.appendChild(createCharacterCell(
      character,
      'py-2.5 px-3 text-center font-bold text-on-surface',
      'inline-block min-w-[1.5rem] px-2 py-0.5 rounded-lg bg-surface-container-lowest shadow-xs'
    ));
    row.appendChild(createTextElement('td', 'py-2.5 px-3 text-center font-mono text-on-surface-variant', pValue));
    row.appendChild(createTextElement('td', 'py-2.5 px-3 text-center font-mono text-primary font-medium', numericKey));
    row.appendChild(createTextElement('td', 'py-2.5 px-3 text-center font-mono text-secondary font-medium', shift));
    row.appendChild(createTextElement(
      'td',
      'py-2.5 px-3 text-center font-mono text-on-surface whitespace-nowrap',
      `(${pValue} + ${numericKey}) % 26 = ${cipherValue}`
    ));
    row.appendChild(createCharacterCell(
      cipherCharacter,
      'py-2.5 px-3 text-center font-bold text-on-primary-container',
      'inline-block min-w-[1.5rem] px-2 py-0.5 rounded-lg bg-primary-container'
    ));
    tableBody.appendChild(row);
  });

  table.appendChild(tableBody);
  container.appendChild(table);
  container.appendChild(createTextElement(
    'p',
    'text-[10px] text-on-surface-variant mt-3',
    'Spaces and punctuation pass through unchanged and do not participate in the letter shift.'
  ));
}

function updateVerificationUI(isVerified) {
  const card = document.getElementById('trace-success-card');
  const icon = document.getElementById('trace-status-icon');
  const label = document.getElementById('verification-label');
  if (!card || !icon || !label) return;

  if (isVerified) {
    card.className = 'bg-tertiary-fixed/60 p-4 rounded-2xl shadow-sm flex items-center justify-between gap-4 border border-tertiary transition-all';
    icon.textContent = 'check_circle';
    icon.className = 'material-symbols-outlined text-tertiary text-[20px]';
    label.textContent = '✓ Round-trip verified';
  } else {
    card.className = 'bg-error-container/40 p-4 rounded-2xl shadow-sm flex items-center justify-between gap-4 border border-error transition-all';
    icon.textContent = 'cancel';
    icon.className = 'material-symbols-outlined text-error text-[20px]';
    label.textContent = 'Verification mismatch';
  }
}

function updateTerminal(plaintext, key, ciphertext, recoveredText, isVerified = true) {
  const termContent = document.getElementById('terminal-content');
  if (!termContent) return;
  termContent.replaceChildren();
  const lines = [
    ['text-[#A8D5BA]', '> java SymmetricMOD26Cipher'],
    ['text-white/40', '=================================================='],
    ['text-white font-bold', 'Symmetric Cipher Model - Modulo-26 Caesar Cipher'],
    ['text-white/40', '=================================================='],
    ['text-white/80', `Enter plaintext: ${plaintext}`],
    ['text-white/80', `Enter secret key: ${key}`],
    ['text-white/40', ''],
    ['text-[#F4A261] font-bold', '--- Key Processing ---'],
    ['text-white/80', ''],
    ['text-white/80', `Secret Key: ${key}`],
    ['text-white/80', `Effective Shift: ${key} % 26 = ${effectiveKey(key)}`],
    ['text-white/40', ''],
    ['text-[#F4A261] font-bold', '--- Encryption Phase ---'],
    ['text-white/80', ''],
    ['text-white/80', `Plaintext:        ${plaintext}`],
    ['text-white/80', `Secret Key:       ${key}`],
    ['text-white/80', `Effective Shift:  ${effectiveKey(key)}`],
    ['text-white font-bold', `Ciphertext:       ${ciphertext}`],
    ['text-white/40', ''],
    ['text-[#F4A261] font-bold', '--- Decryption Phase ---'],
    ['text-white/80', ''],
    ['text-white/80', `Recovered Text:   ${recoveredText}`],
    ['text-white/40', ''],
    ['text-[#F4A261] font-bold', '--- Verification ---'],
    ['text-white/80', ''],
    [isVerified ? 'text-[#A8D5BA] font-bold' : 'text-[#FFB4AB] font-bold', isVerified
      ? '[OK] Round-trip verified:'
      : '[FAIL] Verification failed:'],
    [isVerified ? 'text-[#A8D5BA] font-bold' : 'text-[#FFB4AB] font-bold', isVerified
      ? 'Recovered plaintext matches original message!'
      : 'Recovered plaintext does not match original message!']
  ];
  lines.forEach(([className, text]) => {
    const line = document.createElement('p');
    line.className = className;
    line.textContent = text;
    termContent.appendChild(line);
  });
}

function revealTrace() {
  const container = document.getElementById('animated-trace-container');
  if (container) {
    container.classList.remove('opacity-0', 'translate-y-4');
    container.classList.add('opacity-100', 'translate-y-0');
  }
}

function runSimulation(mode) {
  const plaintext = document.getElementById('input-plaintext')?.value ?? '';
  const key = document.getElementById('input-key')?.value ?? '';
  const validation = validateInputs(plaintext, key);
  if (!validation.valid) {
    showError(validation.message);
    return false;
  }
  hideError();

  const numericKey = parseNumericKey(key);
  const shift = numericKey % 26;

  if (mode === 'decrypt') {
    if (!_lastCiphertext) {
      showError('No ciphertext is available yet. Click Encrypt first.');
      return false;
    }
    const recoveredText = decrypt(_lastCiphertext, numericKey);
    setText('result-decrypt-text', recoveredText);
    document.getElementById('result-decrypt')?.classList.remove('hidden');
    setText('trace-p', _lastPlaintext);
    setText('trace-key', String(numericKey));
    setText('trace-shift', String(shift));
    setText('trace-c', _lastCiphertext);
    setText('trace-recovered', recoveredText);
    setText('step-card-p', _lastPlaintext.substring(0, 12));
    setText('step-card-k', String(numericKey));
    setText('step-card-shift', String(shift));
    setText('step-card-c', _lastCiphertext.substring(0, 12));
  setText('step-card-d', recoveredText.substring(0, 12));
    renderTransformationTable(_lastPlaintext, numericKey);
    updateVerificationUI(recoveredText === _lastPlaintext);
    updateTerminal(_lastPlaintext, numericKey, _lastCiphertext, recoveredText, recoveredText === _lastPlaintext);
    revealTrace();
    return true;
  }

  const ciphertext = encrypt(plaintext, numericKey);
  const recoveredText = decrypt(ciphertext, numericKey);
  _lastCiphertext = ciphertext;
  _lastPlaintext = plaintext;
  _lastKey = String(numericKey);

  updateEffectiveShift(numericKey);
  setText('result-encrypt-text', ciphertext);
  document.getElementById('result-encrypt')?.classList.remove('hidden');
  setText('trace-p', plaintext);
  setText('trace-key', String(numericKey));
  setText('trace-shift', String(shift));
  setText('trace-c', ciphertext);
  setText('trace-recovered', recoveredText);
  setText('step-card-p', plaintext.substring(0, 12));
  setText('step-card-k', String(numericKey));
  setText('step-card-shift', String(shift));
  setText('step-card-c', ciphertext.substring(0, 12));
  setText('step-card-d', recoveredText.substring(0, 12));
  renderTransformationTable(plaintext, numericKey);
  updateVerificationUI(recoveredText === plaintext);
  updateTerminal(plaintext, numericKey, ciphertext, recoveredText, recoveredText === plaintext);
  revealTrace();
  return true;
}

function runCompleteSimulation() {
  if (runSimulation('encrypt')) runSimulation('decrypt');
}

function resetSimulator() {
  _lastCiphertext = '';
  _lastPlaintext = '';
  _lastKey = '';
  const plaintext = document.getElementById('input-plaintext');
  const key = document.getElementById('input-key');
  if (plaintext) plaintext.value = 'Hello World';
  if (key) key.value = '30';
  hideError();

  ['result-encrypt', 'result-decrypt'].forEach((id) => document.getElementById(id)?.classList.add('hidden'));
  ['result-encrypt-text', 'result-decrypt-text', 'trace-p', 'trace-key', 'trace-shift', 'trace-c', 'trace-recovered', 'step-card-p', 'step-card-k', 'step-card-shift', 'step-card-c', 'step-card-d'].forEach((id) => setText(id, '—'));
  setText('effective-shift', '30 mod 26 = 4');
  setText('effective-shift-detail', '30 ≡ 4 (mod 26)');
  renderTransformationTable('Hello World', 30);
  updateVerificationUI(true);
  const container = document.getElementById('animated-trace-container');
  if (container) {
    container.classList.add('opacity-0', 'translate-y-4');
    container.classList.remove('opacity-100', 'translate-y-0');
  }
  const termContent = document.getElementById('terminal-content');
  if (termContent) {
    termContent.replaceChildren(
      createTextElement('p', 'text-[#A8D5BA]', '> Modulo-26 Caesar Cipher'),
      createTextElement('p', 'text-white/50 italic', '[Ready — enter plaintext and numeric key above to execute]')
    );
  }
}

function copyCodeSnippet() {
  const codeText = document.getElementById('code-snippet')?.innerText ?? '';
  navigator.clipboard.writeText(codeText);
  alert('Code snippet copied to clipboard!');
}

// ── Vigenère Cipher Simulator ─────────────────────────────────────────────────

let _vigLastCiphertext = '';
let _vigLastPlaintext = '';
let _vigLastKey = '';

function validateVigenereInputs(plaintext, key) {
  if (!plaintext || plaintext.length === 0) {
    return { valid: false, message: 'Plaintext message cannot be empty.' };
  }
  if (plaintext.length > MAX_PLAINTEXT_LENGTH) {
    return { valid: false, message: `Plaintext is too long. Limit to ${MAX_PLAINTEXT_LENGTH.toLocaleString()} characters.` };
  }
  if (!key || key.trim() === '') {
    return { valid: false, message: 'Key cannot be empty. Enter one or more letters (A–Z).' };
  }
  if (!/^[A-Za-z]+$/.test(key)) {
    return { valid: false, message: 'Key must contain only letters (A–Z). Digits and symbols are not allowed.' };
  }
  return { valid: true, message: '' };
}

function renderVigenereTape(plaintext, key, ciphertext, mode) {
  const container = document.getElementById('vig-tape-container');
  if (!container) return;
  container.replaceChildren();
  if (!plaintext || !key) {
    container.appendChild(createTextElement(
      'div', 'text-on-surface-variant text-sm py-4 text-center',
      'Enter plaintext and a letter key to view the character mapping.'
    ));
    return;
  }

  const normKey = key.toUpperCase();
  let keyIndex = 0;
  const positions = String(plaintext).split('').map((ch) => {
    const code = ch.charCodeAt(0);
    const isLetter = (code >= 65 && code <= 90) || (code >= 97 && code <= 122);
    if (!isLetter) return { ch, isLetter: false, keyCh: null, cipherCh: ch };
    const base = (code >= 65 && code <= 90) ? 65 : 97;
    const pVal = code - base;
    const keyCh = normKey[keyIndex % normKey.length];
    const kVal = keyCh.charCodeAt(0) - 65;
    const cVal = mode === 'encrypt' ? (pVal + kVal) % 26 : (pVal - kVal + 26) % 26;
    keyIndex++;
    return { ch, isLetter: true, keyCh, kVal, pVal, cVal, cipherCh: String.fromCharCode(cVal + base) };
  });

  const tapeRows = [
    { label: 'Plaintext', rowKey: 'plain', colorClass: 'bg-surface-container text-on-surface' },
    { label: 'Key', rowKey: 'key', colorClass: 'bg-secondary-container text-on-secondary-container' },
    { label: 'Ciphertext', rowKey: 'cipher', colorClass: 'bg-primary-container text-on-primary-container' },
  ];
  const tape = document.createElement('div');
  tape.className = 'flex flex-col gap-1.5';
  tapeRows.forEach(({ label, rowKey, colorClass }) => {
    const row = document.createElement('div');
    row.className = 'flex items-center gap-1.5';
    row.appendChild(createTextElement('span', 'text-[10px] uppercase tracking-wider text-on-surface-variant font-medium w-16 shrink-0 text-right pr-2', label));
    const cells = document.createElement('div');
    cells.className = 'flex flex-wrap gap-1';
    positions.forEach((pos) => {
      const badge = document.createElement('span');
      badge.className = `inline-flex items-center justify-center w-7 h-7 rounded-md font-mono font-bold text-xs ${pos.isLetter ? colorClass : 'bg-surface-container-low text-on-surface-variant'}`;
      if (!pos.isLetter) {
        badge.textContent = rowKey === 'key' ? '—' : (pos.ch === ' ' ? '␠' : pos.ch);
      } else {
        if (rowKey === 'plain') badge.textContent = mode === 'encrypt' ? pos.ch : pos.cipherCh;
        else if (rowKey === 'key') badge.textContent = pos.keyCh;
        else badge.textContent = mode === 'encrypt' ? pos.cipherCh : pos.ch;
      }
      cells.appendChild(badge);
    });
    row.appendChild(cells);
    tape.appendChild(row);
  });
  container.appendChild(tape);

  const chipsHeading = createTextElement(
    'p', 'text-[10px] uppercase tracking-wider text-on-surface-variant font-medium mt-4 mb-1.5',
    mode === 'encrypt' ? 'Encryption — per-character calculation' : 'Decryption — per-character calculation'
  );
  container.appendChild(chipsHeading);

  const chips = document.createElement('div');
  chips.className = 'flex flex-wrap gap-1.5';
  positions.forEach((pos) => {
    const chip = document.createElement('div');
    if (!pos.isLetter) {
      const dispCh = pos.ch === ' ' ? '␠' : pos.ch;
      chip.className = 'flex flex-col items-center bg-surface-container rounded-xl px-2 py-1.5 min-w-[2.75rem] text-center border border-outline-variant/40';
      chip.appendChild(createTextElement('span', 'font-mono font-bold text-xs text-on-surface-variant', dispCh));
      chip.appendChild(createTextElement('span', 'text-[8px] text-on-surface-variant/60 leading-tight mt-0.5', 'pass'));
    } else {
      chip.className = 'flex flex-col items-center bg-primary-container rounded-xl px-2 py-1.5 min-w-[2.75rem] text-center border border-primary/20 shadow-xs';
      const op = mode === 'encrypt' ? '+' : '−';
      chip.appendChild(createTextElement('span', 'font-mono font-bold text-[11px] text-on-primary-container whitespace-nowrap', `${pos.ch}${op}${pos.keyCh}→${pos.cipherCh}`));
      const calcStr = mode === 'encrypt'
        ? `(${pos.pVal}+${pos.kVal})%26=${pos.cVal}`
        : `(${pos.pVal}-${pos.kVal}+26)%26=${pos.cVal}`;
      chip.appendChild(createTextElement('span', 'text-[8px] text-primary leading-tight mt-0.5', calcStr));
    }
    chips.appendChild(chip);
  });
  container.appendChild(chips);
}

function renderVigenereTransformationTable(text, key) {
  const container = document.getElementById('vig-table-container');
  if (!container) return;
  container.replaceChildren();
  if (!text || !key) {
    container.appendChild(createTextElement(
      'div',
      'text-on-surface-variant text-sm py-4 text-center',
      'Enter plaintext and a letter key to view the transformation table.'
    ));
    return;
  }

  const normKey = key.toUpperCase();
  const table = document.createElement('table');
  table.className = 'w-full border-collapse text-xs sm:text-sm';

  const headerRow = document.createElement('tr');
  headerRow.className = 'border-b border-surface-container text-left text-on-surface-variant';
  ['#', 'Plaintext Character', 'P Value', 'Key Character', 'K Value', 'Calculation', 'Cipher Character']
    .forEach((heading, index) => {
      const headingClass = index === 0
        ? 'py-2.5 px-3 text-center font-label-md font-medium'
        : 'py-2.5 px-3 text-center font-label-md font-medium whitespace-nowrap';
      headerRow.appendChild(createTextElement('th', headingClass, heading));
    });
  const tableHead = document.createElement('thead');
  tableHead.appendChild(headerRow);
  table.appendChild(tableHead);

  const tableBody = document.createElement('tbody');
  let keyIndex = 0;
  String(text).split('').forEach((character, index) => {
    const code = character.charCodeAt(0);
    const isUppercase = code >= 65 && code <= 90;
    const isLowercase = code >= 97 && code <= 122;
    const isLetter = isUppercase || isLowercase;
    const displayCharacter = character === ' ' ? '␠' : character;
    const row = document.createElement('tr');
    row.className = 'border-b border-surface-container/60 last:border-0';

    if (!isLetter) {
      const unchangedClass = 'py-2.5 px-3 text-center font-mono text-on-surface-variant';
      row.appendChild(createTextElement('td', unchangedClass, `#${index + 1}`));
      row.appendChild(createCharacterCell(
        displayCharacter,
        'py-2.5 px-3 text-center font-bold text-on-surface',
        'inline-block min-w-[1.5rem] px-2 py-0.5 rounded-lg bg-surface-container-lowest shadow-xs'
      ));
      row.appendChild(createTextElement('td', unchangedClass, '—'));
      row.appendChild(createTextElement('td', unchangedClass, '—'));
      row.appendChild(createTextElement('td', unchangedClass, '—'));
      row.appendChild(createTextElement('td', `${unchangedClass} whitespace-nowrap`, `unchanged (${displayCharacter})`));
      row.appendChild(createCharacterCell(
        displayCharacter,
        'py-2.5 px-3 text-center font-bold text-on-surface',
        'inline-block min-w-[1.5rem] px-2 py-0.5 rounded-lg bg-surface-container-lowest shadow-xs'
      ));
    } else {
      const alphabetStart = isUppercase ? 65 : 97;
      const pVal = code - alphabetStart;
      const keyCh = normKey[keyIndex % normKey.length];
      const kVal = keyCh.charCodeAt(0) - 65;
      const cVal = (pVal + kVal) % 26;
      const cipherChar = String.fromCharCode(cVal + alphabetStart);
      keyIndex++;
      row.appendChild(createTextElement('td', 'py-2.5 px-3 text-center font-mono text-on-surface-variant', `#${index + 1}`));
      row.appendChild(createCharacterCell(
        character,
        'py-2.5 px-3 text-center font-bold text-on-surface',
        'inline-block min-w-[1.5rem] px-2 py-0.5 rounded-lg bg-surface-container-lowest shadow-xs'
      ));
      row.appendChild(createTextElement('td', 'py-2.5 px-3 text-center font-mono text-on-surface-variant', pVal));
      row.appendChild(createTextElement('td', 'py-2.5 px-3 text-center font-mono text-secondary font-medium', keyCh));
      row.appendChild(createTextElement('td', 'py-2.5 px-3 text-center font-mono text-secondary font-medium', kVal));
      row.appendChild(createTextElement(
        'td',
        'py-2.5 px-3 text-center font-mono text-on-surface whitespace-nowrap',
        `(${pVal} + ${kVal}) % 26 = ${cVal}`
      ));
      row.appendChild(createCharacterCell(
        cipherChar,
        'py-2.5 px-3 text-center font-bold text-on-primary-container',
        'inline-block min-w-[1.5rem] px-2 py-0.5 rounded-lg bg-primary-container'
      ));
    }
    tableBody.appendChild(row);
  });

  table.appendChild(tableBody);
  container.appendChild(table);
  container.appendChild(createTextElement(
    'p',
    'text-[10px] text-on-surface-variant mt-3',
    'Spaces and punctuation pass through unchanged. The key character only advances on alphabetic characters.'
  ));
}

function updateVigenereKeyInfo(key) {
  const normKey = key ? key.toUpperCase() : '';
  setText('vig-key-len', normKey ? `Length: ${normKey.length}` : '—');
  setText('vig-key-display', normKey || '—');
}

function runVigenereSimulation(mode) {
  const plaintext = document.getElementById('vig-input-plaintext')?.value ?? '';
  const key = document.getElementById('vig-input-key')?.value ?? '';
  const validation = validateVigenereInputs(plaintext, key);
  const errorDiv = document.getElementById('vig-error');
  const errorText = document.getElementById('vig-error-text');
  if (!validation.valid) {
    if (errorText) errorText.textContent = validation.message;
    if (errorDiv) errorDiv.classList.remove('hidden');
    return false;
  }
  if (errorDiv) errorDiv.classList.add('hidden');
  updateVigenereKeyInfo(key);

  if (mode === 'decrypt') {
    if (!_vigLastCiphertext) {
      if (errorText) errorText.textContent = 'No ciphertext available yet. Click Encrypt first.';
      if (errorDiv) errorDiv.classList.remove('hidden');
      return false;
    }
    const recovered = vigDecrypt(_vigLastCiphertext, key);
    setText('vig-result-decrypt-text', recovered);
    document.getElementById('vig-result-decrypt')?.classList.remove('hidden');
    renderVigenereTape(_vigLastCiphertext, key, recovered, 'decrypt');
    renderVigenereTransformationTable(_vigLastPlaintext, key);
    return true;
  }

  const ciphertext = vigEncrypt(plaintext, key);
  _vigLastCiphertext = ciphertext;
  _vigLastPlaintext = plaintext;
  _vigLastKey = key;
  setText('vig-result-encrypt-text', ciphertext);
  document.getElementById('vig-result-encrypt')?.classList.remove('hidden');
  document.getElementById('vig-result-decrypt')?.classList.add('hidden');
  renderVigenereTape(plaintext, key, ciphertext, 'encrypt');
  renderVigenereTransformationTable(plaintext, key);
  return true;
}

function runVigenereCompleteSimulation() {
  if (runVigenereSimulation('encrypt')) runVigenereSimulation('decrypt');
}

function resetVigenereSimulator() {
  _vigLastCiphertext = '';
  _vigLastPlaintext = '';
  _vigLastKey = '';
  const pt = document.getElementById('vig-input-plaintext');
  const k = document.getElementById('vig-input-key');
  if (pt) pt.value = 'ATTACKATDAWN';
  if (k) k.value = 'LEMON';
  document.getElementById('vig-error')?.classList.add('hidden');
  document.getElementById('vig-result-encrypt')?.classList.add('hidden');
  document.getElementById('vig-result-decrypt')?.classList.add('hidden');
  updateVigenereKeyInfo('LEMON');
  renderVigenereTape('', '', '', 'encrypt');
}

function runProgramSimulation() {
  runCompleteSimulation();
  document.getElementById('output')?.scrollIntoView({ behavior: 'smooth' });
}

function toggleFaq(btn) {
  const content = btn.nextElementSibling;
  const icon = btn.querySelector('.material-symbols-outlined');
  if (content.style.maxHeight && content.style.maxHeight !== '0px') {
    content.style.maxHeight = '0px';
    icon.style.transform = 'rotate(0deg)';
  } else {
    content.style.maxHeight = content.scrollHeight + 'px';
    icon.style.transform = 'rotate(45deg)';
  }
}

async function loadJavaSource() {
  const codeSnippet = document.getElementById('code-snippet');
  if (!codeSnippet) return;
  try {
    const response = await fetch('/SymmetricMOD26Cipher.java');
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    codeSnippet.textContent = await response.text();
  } catch (error) {
    codeSnippet.textContent = `Could not load source file: ${error.message}`;
  }
}

const SECTION_IDS = ['introduction', 'objective', 'theory', 'simulator', 'vigenere', 'program', 'output', 'procedure', 'result', 'faq'];
let isProgrammaticScroll = false;
let scrollTimeoutId = null;

function parseCurrentHashSection() {
  const hash = window.location.hash.toLowerCase();
  if (!hash || hash === '#' || hash === '#/' || hash === '#introduction') return 'introduction';
  const clean = hash.replace(/^#\/?/, '');
  return SECTION_IDS.includes(clean) ? clean : 'introduction';
}

function setActiveSidebarSection(activeSection) {
  if (!SECTION_IDS.includes(activeSection)) activeSection = 'introduction';
  document.querySelectorAll('#sidebar-nav .sidebar-nav-link').forEach((link) => {
    const active = link.getAttribute('data-section') === activeSection;
    const arrow = link.querySelector('.active-arrow');
    link.classList.toggle('bg-primary-container', active);
    link.classList.toggle('text-on-primary-container', active);
    link.classList.toggle('font-medium', active);
    link.classList.toggle('text-on-surface-variant', !active);
    link.classList.toggle('hover:bg-surface-container', !active);
    link.classList.toggle('hover:text-on-surface', !active);
    arrow?.classList.toggle('hidden', !active);
  });
  document.querySelectorAll('#mobile-tabs .mobile-tab-link').forEach((link) => {
    const active = link.getAttribute('data-section') === activeSection;
    link.classList.toggle('bg-primary-container', active);
    link.classList.toggle('text-on-primary-container', active);
    link.classList.toggle('font-medium', active);
    link.classList.toggle('bg-surface-container', !active);
    link.classList.toggle('text-on-surface-variant', !active);
  });
}

function scrollToSection(sectionId, smooth = true) {
  if (sectionId === 'introduction') window.scrollTo({ top: 0, behavior: smooth ? 'smooth' : 'auto' });
  else document.getElementById(sectionId)?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'start' });
}

function navigateToSection(sectionId, updateHash = true) {
  if (!SECTION_IDS.includes(sectionId)) return;
  isProgrammaticScroll = true;
  clearTimeout(scrollTimeoutId);
  scrollTimeoutId = setTimeout(() => { isProgrammaticScroll = false; }, 900);
  setActiveSidebarSection(sectionId);
  scrollToSection(sectionId, true);
  if (updateHash) {
    const targetHash = sectionId === 'introduction' ? '#/' : `#${sectionId}`;
    if (window.location.hash !== targetHash) history.pushState(null, '', targetHash);
  }
}

function initSidebarNavigation() {
  document.querySelectorAll('#sidebar-nav .sidebar-nav-link, #mobile-tabs .mobile-tab-link').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      navigateToSection(link.getAttribute('data-section'));
    });
  });
  const syncHash = () => {
    const section = parseCurrentHashSection();
    setActiveSidebarSection(section);
    scrollToSection(section, true);
  };
  window.addEventListener('hashchange', syncHash);
  window.addEventListener('popstate', syncHash);
  const observer = new IntersectionObserver((entries) => {
    if (isProgrammaticScroll) return;
    entries.forEach((entry) => {
      if (entry.isIntersecting && SECTION_IDS.includes(entry.target.id)) {
        setActiveSidebarSection(entry.target.id);
        const newHash = entry.target.id === 'introduction' ? '#/' : `#${entry.target.id}`;
        if (window.location.hash !== newHash) history.replaceState(null, '', newHash);
      }
    });
  }, { rootMargin: '-10% 0px -70% 0px', threshold: 0 });
  SECTION_IDS.forEach((id) => { const element = document.getElementById(id); if (element) observer.observe(element); });
  const initialSection = parseCurrentHashSection();
  setActiveSidebarSection(initialSection);
  if (initialSection !== 'introduction') setTimeout(() => scrollToSection(initialSection, false), 100);
}

function openAboutModal() {
  const modal = document.getElementById('about-modal');
  const card = document.getElementById('about-modal-card');
  if (!modal || !card) return;
  modal.classList.remove('opacity-0', 'pointer-events-none');
  modal.classList.add('opacity-100', 'pointer-events-auto');
  card.classList.remove('scale-95');
  card.classList.add('scale-100');
  document.body.style.overflow = 'hidden';
}

function closeAboutModal() {
  const modal = document.getElementById('about-modal');
  const card = document.getElementById('about-modal-card');
  if (!modal || !card) return;
  modal.classList.remove('opacity-100', 'pointer-events-auto');
  modal.classList.add('opacity-0', 'pointer-events-none');
  card.classList.remove('scale-100');
  card.classList.add('scale-95');
  document.body.style.overflow = '';
}

Object.assign(window, {
  encrypt, decrypt, parseNumericKey, effectiveKey, runSimulation, runCompleteSimulation,
  resetSimulator, copyCodeSnippet, runProgramSimulation, toggleFaq, loadJavaSource,
  navigateToSection, setActiveSidebarSection, openAboutModal, closeAboutModal,
  runVigenereSimulation, runVigenereCompleteSimulation, resetVigenereSimulator,
});

document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeAboutModal(); });

function initApp() {
  loadJavaSource();
  initSidebarNavigation();
  updateEffectiveShift(30);
  renderTransformationTable('Hello World', 30);
  updateVigenereKeyInfo('LEMON');
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initApp);
else initApp();
