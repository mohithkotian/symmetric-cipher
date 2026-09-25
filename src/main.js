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

/** Encrypt letters with C = (P + K) % 26; non-letters remain unchanged. */
function encrypt(text, key) {
  const shift = effectiveKey(key);
  return String(text).split('').map((character) => {
    const code = character.charCodeAt(0);
    const isUppercase = code >= 65 && code <= 90;
    const isLowercase = code >= 97 && code <= 122;
    if (!isUppercase && !isLowercase) return character;

    const alphabetStart = isUppercase ? 65 : 97;
    return String.fromCharCode(((code - alphabetStart + shift) % 26) + alphabetStart);
  }).join('');
}

/** Decrypt letters with P = (C - K + 26) % 26; non-letters remain unchanged. */
function decrypt(text, key) {
  const shift = effectiveKey(key);
  return String(text).split('').map((character) => {
    const code = character.charCodeAt(0);
    const isUppercase = code >= 65 && code <= 90;
    const isLowercase = code >= 97 && code <= 122;
    if (!isUppercase && !isLowercase) return character;

    const alphabetStart = isUppercase ? 65 : 97;
    return String.fromCharCode(((code - alphabetStart - shift + 26) % 26) + alphabetStart);
  }).join('');
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

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  }[character]));
}

function renderTransformationTable(text, key) {
  const container = document.getElementById('caesar-table-container');
  if (!container) return;

  if (!text) {
    container.innerHTML = '<div class="text-on-surface-variant text-sm py-4 text-center">Enter plaintext and a numeric key to view the transformation table.</div>';
    return;
  }

  const numericKey = parseNumericKey(key);
  const shift = numericKey % 26;
  const rows = String(text).split('').map((character, index) => {
    const code = character.charCodeAt(0);
    const isUppercase = code >= 65 && code <= 90;
    const isLowercase = code >= 97 && code <= 122;
    const isLetter = isUppercase || isLowercase;
    const displayCharacter = character === ' ' ? '␠' : character;

    if (!isLetter) {
      return `<tr class="border-b border-surface-container/60 last:border-0">
        <td class="py-2.5 px-3 text-center font-mono text-on-surface-variant">#${index + 1}</td>
        <td class="py-2.5 px-3 text-center font-bold text-on-surface"><span class="inline-block min-w-[1.5rem] px-2 py-0.5 rounded-lg bg-surface-container-lowest shadow-xs">${escapeHtml(displayCharacter)}</span></td>
        <td class="py-2.5 px-3 text-center font-mono text-on-surface-variant">—</td>
        <td class="py-2.5 px-3 text-center font-mono text-on-surface-variant">—</td>
        <td class="py-2.5 px-3 text-center font-mono text-on-surface-variant">—</td>
        <td class="py-2.5 px-3 text-center font-mono text-on-surface-variant whitespace-nowrap">unchanged (${escapeHtml(displayCharacter)})</td>
        <td class="py-2.5 px-3 text-center font-bold text-on-surface"><span class="inline-block min-w-[1.5rem] px-2 py-0.5 rounded-lg bg-surface-container-lowest shadow-xs">${escapeHtml(displayCharacter)}</span></td>
      </tr>`;
    }

    const alphabetStart = isUppercase ? 65 : 97;
    const pValue = code - alphabetStart;
    const cipherValue = (pValue + numericKey) % 26;
    const cipherCharacter = String.fromCharCode(cipherValue + alphabetStart);
    return `<tr class="border-b border-surface-container/60 last:border-0">
      <td class="py-2.5 px-3 text-center font-mono text-on-surface-variant">#${index + 1}</td>
      <td class="py-2.5 px-3 text-center font-bold text-on-surface"><span class="inline-block min-w-[1.5rem] px-2 py-0.5 rounded-lg bg-surface-container-lowest shadow-xs">${escapeHtml(character)}</span></td>
      <td class="py-2.5 px-3 text-center font-mono text-on-surface-variant">${pValue}</td>
      <td class="py-2.5 px-3 text-center font-mono text-primary font-medium">${numericKey}</td>
      <td class="py-2.5 px-3 text-center font-mono text-secondary font-medium">${shift}</td>
      <td class="py-2.5 px-3 text-center font-mono text-on-surface whitespace-nowrap">(${pValue} + ${numericKey}) % 26 = ${cipherValue}</td>
      <td class="py-2.5 px-3 text-center font-bold text-on-primary-container"><span class="inline-block min-w-[1.5rem] px-2 py-0.5 rounded-lg bg-primary-container">${escapeHtml(cipherCharacter)}</span></td>
    </tr>`;
  }).join('');

  container.innerHTML = `<table class="w-full border-collapse text-xs sm:text-sm">
    <thead><tr class="border-b border-surface-container text-left text-on-surface-variant">
      <th class="py-2.5 px-3 text-center font-label-md font-medium">#</th>
      <th class="py-2.5 px-3 text-center font-label-md font-medium whitespace-nowrap">Plaintext Character</th>
      <th class="py-2.5 px-3 text-center font-label-md font-medium whitespace-nowrap">P Value</th>
      <th class="py-2.5 px-3 text-center font-label-md font-medium whitespace-nowrap">Secret Key</th>
      <th class="py-2.5 px-3 text-center font-label-md font-medium whitespace-nowrap">Effective Shift</th>
      <th class="py-2.5 px-3 text-center font-label-md font-medium whitespace-nowrap">Calculation</th>
      <th class="py-2.5 px-3 text-center font-label-md font-medium whitespace-nowrap">Cipher Character</th>
    </tr></thead><tbody>${rows}</tbody>
  </table><p class="text-[10px] text-on-surface-variant mt-3">Spaces and punctuation pass through unchanged and do not participate in the letter shift.</p>`;
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
    label.textContent = '✓ Verification successful';
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
      ? '[OK] Verification successful:'
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
  if (termContent) termContent.innerHTML = '<p class="text-[#A8D5BA]">&gt; Modulo-26 Caesar Cipher</p><p class="text-white/50 italic">[Ready — enter plaintext and numeric key above to execute]</p>';
}

function copyCodeSnippet() {
  const codeText = document.getElementById('code-snippet')?.innerText ?? '';
  navigator.clipboard.writeText(codeText);
  alert('Code snippet copied to clipboard!');
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

const SECTION_IDS = ['introduction', 'objective', 'theory', 'simulator', 'program', 'output', 'procedure', 'result', 'faq'];
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
  navigateToSection, setActiveSidebarSection, openAboutModal, closeAboutModal
});

document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeAboutModal(); });

function initApp() {
  loadJavaSource();
  initSidebarNavigation();
  updateEffectiveShift(30);
  renderTransformationTable('Hello World', 30);
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initApp);
else initApp();
