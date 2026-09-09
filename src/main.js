// Input validation helper
function validateInputs(plaintext, key) {
  const isPlaintextEmpty = !plaintext || plaintext.length === 0;
  const isKeyEmpty = !key || key.length === 0;

  if (isPlaintextEmpty && isKeyEmpty) {
    return { valid: false, message: "Please provide both a plaintext message and a secret key to proceed." };
  }
  if (isPlaintextEmpty) {
    return { valid: false, message: "Plaintext message cannot be empty. Please enter characters, spaces, or numbers." };
  }
  if (isKeyEmpty) {
    return { valid: false, message: "Secret key cannot be empty. A non-empty key is required to avoid division/modulo by zero in cyclic repetition." };
  }

  return { valid: true, message: "" };
}

/**
 * Encrypts plaintext using bitwise XOR with a cyclic key.
 * Formula: cipherBytes[i] = plaintext[i] ^ key[i % key.length]
 * @param {string} plaintext - Original text
 * @param {string} key - Secret key
 * @returns {number[]} Array of ciphertext byte values
 */
function encrypt(plaintext, key) {
  if (!plaintext || !key || key.length === 0) return [];
  const cipherBytes = [];
  for (let i = 0; i < plaintext.length; i++) {
    const code = plaintext.charCodeAt(i) ^ key.charCodeAt(i % key.length);
    cipherBytes.push(code);
  }
  return cipherBytes;
}

/**
 * Decrypts ciphertext bytes using bitwise XOR with the same cyclic key.
 * Formula: recovered[i] = cipherBytes[i] ^ key[i % key.length]
 * @param {number[]} cipherBytes - Array of ciphertext byte values
 * @param {string} key - Secret key
 * @returns {string} Recovered plaintext string
 */
function decrypt(cipherBytes, key) {
  if (!cipherBytes || cipherBytes.length === 0 || !key || key.length === 0) return '';
  let recoveredText = '';
  for (let i = 0; i < cipherBytes.length; i++) {
    const plainCode = cipherBytes[i] ^ key.charCodeAt(i % key.length);
    recoveredText += String.fromCharCode(plainCode);
  }
  return recoveredText;
}

/**
 * Converts array of byte values to space-separated 2-digit lowercase hex string.
 * @param {number[]} bytes
 * @returns {string} Formatted hex string
 */
function toHex(bytes) {
  return bytes.map(b => b.toString(16).padStart(2, '0')).join(' ');
}

function computeXOR(text, key) {
  const bytes = encrypt(text, key);
  return {
    bytes: bytes,
    hex: toHex(bytes),
    text: bytes.map(b => String.fromCharCode(b)).join('')
  };
}

// Module-level storage so Decrypt can use the most recent cipher bytes
let _lastCipherBytes = [];
let _lastCipherKey = '';

function runSimulation(mode) {
  const plaintext = document.getElementById('input-plaintext').value;
  const key = document.getElementById('input-key').value;
  const errorDiv = document.getElementById('sim-error');
  const errorText = document.getElementById('sim-error-text');

  const encCard = document.getElementById('result-encrypt');
  const encHexEl = document.getElementById('result-encrypt-hex');
  const decCard = document.getElementById('result-decrypt');
  const decTextEl = document.getElementById('result-decrypt-text');

  // ── DECRYPT-ONLY mode ────────────────────────────────────────────────────
  if (mode === 'decrypt') {
    // Need cipher bytes stored from a prior Encrypt (or full simulation)
    if (_lastCipherBytes.length === 0) {
      // Show a helpful inline message
      if (decCard) decCard.classList.remove('hidden');
      if (decTextEl) decTextEl.textContent = '⚠ No ciphertext available yet. Please click Encrypt first.';
      return false;
    }

    // Use same-key checkbox — if checked, re-use the encryption key input
    const useSameKey = document.getElementById('use-same-key');
    const decKey = (useSameKey && useSameKey.checked) ? _lastCipherKey : key;

    if (!decKey || decKey.length === 0) {
      if (errorText) errorText.textContent = 'Secret key cannot be empty.';
      if (errorDiv) errorDiv.classList.remove('hidden');
      return false;
    }
    if (errorDiv) errorDiv.classList.add('hidden');

    const recoveredText = decrypt(_lastCipherBytes, decKey);
    const hexCipher = toHex(_lastCipherBytes);

    // Show Decryption Result card
    if (decCard) decCard.classList.remove('hidden');
    if (decTextEl) decTextEl.textContent = recoveredText;

    // Update live trace
    const cyclicKey = Array.from({length: _lastCipherBytes.length}, (_, i) => decKey[i % decKey.length]).join('');
    document.getElementById('trace-p').textContent = plaintext || '(see ciphertext above)';
    document.getElementById('trace-k').textContent = cyclicKey;
    document.getElementById('trace-c').textContent = hexCipher;
    document.getElementById('trace-recovered').textContent = recoveredText;
    updateVerificationUI(recoveredText === plaintext);
    updateTerminal(plaintext || '(decryption)', decKey, hexCipher, recoveredText, recoveredText === plaintext);
    document.getElementById('step-card-k').textContent = decKey;
    document.getElementById('step-card-c').textContent = hexCipher.substring(0, 8) + '...';
    document.getElementById('step-card-d').textContent = recoveredText.substring(0, 8);

    return true;
  }

  // ── ENCRYPT mode (default, also used by runCompleteSimulation) ───────────
  const validation = validateInputs(plaintext, key);
  if (!validation.valid) {
    if (errorText) errorText.textContent = validation.message;
    if (errorDiv) errorDiv.classList.remove('hidden');
    return false;
  }
  if (errorDiv) errorDiv.classList.add('hidden');

  let cyclicKey = '';
  for (let i = 0; i < plaintext.length; i++) {
    cyclicKey += key[i % key.length];
  }

  // 1. Encryption Phase
  const cipherBytes = encrypt(plaintext, key);
  const hexCipher = toHex(cipherBytes);

  // Store for subsequent Decrypt
  _lastCipherBytes = cipherBytes;
  _lastCipherKey = key;

  // 2. Decryption Phase (for live trace verification)
  const decryptedText = decrypt(cipherBytes, key);
  const isVerified = (decryptedText === plaintext);

  // Show Encryption Result card
  if (encCard) encCard.classList.remove('hidden');
  if (encHexEl) encHexEl.textContent = hexCipher;

  // Update trace values
  document.getElementById('trace-p').textContent = plaintext;
  document.getElementById('trace-k').textContent = cyclicKey;
  document.getElementById('trace-c').textContent = hexCipher;
  document.getElementById('trace-recovered').textContent = decryptedText;

  updateVerificationUI(isVerified);
  updateTerminal(plaintext, key, hexCipher, decryptedText, isVerified);

  document.getElementById('step-card-p').textContent = plaintext.substring(0, 8);
  document.getElementById('step-card-k').textContent = key;
  document.getElementById('step-card-c').textContent = hexCipher.substring(0, 8) + '...';
  document.getElementById('step-card-d').textContent = decryptedText.substring(0, 8);

  renderByteVisualization(plaintext, key);

  return true;
}

// Update verification card visual status
function updateVerificationUI(isVerified) {
  const card = document.getElementById('trace-success-card');
  const icon = document.getElementById('trace-status-icon');

  if (card && icon) {
    if (isVerified) {
      card.className = "bg-tertiary-fixed/60 p-4 rounded-2xl shadow-sm flex items-center justify-between gap-4 border border-tertiary transition-all";
      icon.textContent = "check_circle";
      icon.className = "material-symbols-outlined text-tertiary text-[20px]";
    } else {
      card.className = "bg-error-container/40 p-4 rounded-2xl shadow-sm flex items-center justify-between gap-4 border border-error transition-all";
      icon.textContent = "cancel";
      icon.className = "material-symbols-outlined text-error text-[20px]";
    }
  }
}

// Mirror execution to terminal panel
function updateTerminal(plaintext, key, hexCipher, recoveredText, isVerified = true) {
  const termContent = document.getElementById('terminal-content');
  if (!termContent) return;
  const verificationBadge = isVerified 
    ? `<p class="text-[#A8D5BA] font-bold">&gt;&gt; Decrypted Verification: ${recoveredText} [OK - Verification Successful]</p>`
    : `<p class="text-[#FFB4AB] font-bold">&gt;&gt; Decrypted Verification: ${recoveredText} [FAIL - Verification Mismatch]</p>`;

  termContent.innerHTML = `
    <p class="text-[#A8D5BA]">&gt; java SymmetricXORCipher</p>
    <p class="text-white/80">Enter plaintext: <span class="text-primary-container font-semibold">${plaintext}</span></p>
    <p class="text-white/80">Enter secret key: <span class="text-primary-container font-semibold">${key}</span></p>
    <p class="text-white font-bold">&gt;&gt; Ciphertext Hex Stream:</p>
    <p class="text-primary-container font-mono" id="terminal-hex">${hexCipher}</p>
    ${verificationBadge}
  `;
}

// Reset simulator to initial empty ready state
function resetSimulator() {
  const pInput = document.getElementById('input-plaintext');
  const kInput = document.getElementById('input-key');
  if (pInput) pInput.value = '';
  if (kInput) kInput.value = '';

  _lastCipherBytes = [];
  _lastCipherKey = '';

  const encCard = document.getElementById('result-encrypt');
  const encHexEl = document.getElementById('result-encrypt-hex');
  const decCard = document.getElementById('result-decrypt');
  const decTextEl = document.getElementById('result-decrypt-text');
  if (encCard) encCard.classList.add('hidden');
  if (encHexEl) encHexEl.textContent = '—';
  if (decCard) decCard.classList.add('hidden');
  if (decTextEl) decTextEl.textContent = '—';

  const errorDiv = document.getElementById('sim-error');
  if (errorDiv) errorDiv.classList.add('hidden');

  const traceP = document.getElementById('trace-p');
  const traceK = document.getElementById('trace-k');
  const traceC = document.getElementById('trace-c');
  const traceR = document.getElementById('trace-recovered');
  if (traceP) traceP.textContent = '—';
  if (traceK) traceK.textContent = '—';
  if (traceC) traceC.textContent = '—';
  if (traceR) traceR.textContent = '—';

  const cardP = document.getElementById('step-card-p');
  const cardK = document.getElementById('step-card-k');
  const cardC = document.getElementById('step-card-c');
  const cardD = document.getElementById('step-card-d');
  if (cardP) cardP.textContent = '—';
  if (cardK) cardK.textContent = '—';
  if (cardC) cardC.textContent = '—';
  if (cardD) cardD.textContent = '—';

  const animContainer = document.getElementById('animated-trace-container');
  if (animContainer) {
    animContainer.classList.add('opacity-0', 'translate-y-4');
    animContainer.classList.remove('opacity-100', 'translate-y-0');
  }

  const termContent = document.getElementById('terminal-content');
  if (termContent) {
    termContent.innerHTML = `
      <p class="text-[#A8D5BA]">&gt; java SymmetricXORCipher</p>
      <p class="text-white/50 italic">[Ready — enter plaintext and secret key above to execute]</p>
    `;
  }

  updateVerificationUI(true);
  renderByteVisualization('', '');
}

// Educational Byte-by-Byte Visualization
function renderByteVisualization(plaintext, key) {
  const container = document.getElementById('byte-vis-container');
  if (!container) return;

  if (!plaintext || !key) {
    container.innerHTML = '<div class="text-on-surface-variant text-sm py-4 text-center">Enter plaintext and a secret key to view byte-by-byte XOR calculations.</div>';
    return;
  }

  let headers = `
    <tr class="border-b border-surface-container text-left text-on-surface-variant">
      <th class="py-2.5 px-3 sticky left-0 bg-surface-container-low z-10 font-label-md font-medium">Metric</th>
  `;
  for (let i = 0; i < plaintext.length; i++) {
    headers += `<th class="py-2.5 px-3 text-center min-w-[54px] font-mono text-xs font-semibold text-on-surface-variant/80">#${i + 1}</th>`;
  }
  headers += `</tr>`;

  let rowPChar = `<tr class="border-b border-surface-container/60 hover:bg-surface-container-lowest/50 transition-colors"><td class="py-2.5 px-3 sticky left-0 bg-surface-container-low z-10 font-label-md text-on-surface font-semibold whitespace-nowrap">Plaintext Char</td>`;
  let rowPAscii = `<tr class="border-b border-surface-container/60 hover:bg-surface-container-lowest/50 transition-colors"><td class="py-2 px-3 sticky left-0 bg-surface-container-low z-10 font-label-md text-on-surface-variant whitespace-nowrap">Plaintext ASCII</td>`;
  let rowKChar = `<tr class="border-b border-surface-container/60 hover:bg-surface-container-lowest/50 transition-colors"><td class="py-2.5 px-3 sticky left-0 bg-surface-container-low z-10 font-label-md text-primary font-semibold whitespace-nowrap">Key Char (Cyclic)</td>`;
  let rowKAscii = `<tr class="border-b border-surface-container/60 hover:bg-surface-container-lowest/50 transition-colors"><td class="py-2 px-3 sticky left-0 bg-surface-container-low z-10 font-label-md text-on-surface-variant whitespace-nowrap">Key ASCII</td>`;
  let rowXorDec = `<tr class="border-b border-surface-container/60 hover:bg-surface-container-lowest/50 transition-colors"><td class="py-2 px-3 sticky left-0 bg-surface-container-low z-10 font-label-md text-secondary whitespace-nowrap">XOR Result (Dec)</td>`;
  let rowHex = `<tr class="hover:bg-surface-container-lowest/50 transition-colors"><td class="py-2.5 px-3 sticky left-0 bg-surface-container-low z-10 font-label-md text-primary font-bold whitespace-nowrap">Ciphertext (Hex)</td>`;

  for (let i = 0; i < plaintext.length; i++) {
    const pChar = plaintext[i];
    const pAscii = plaintext.charCodeAt(i);
    const kChar = key[i % key.length];
    const kAscii = key.charCodeAt(i % key.length);
    const xorVal = pAscii ^ kAscii;
    const hexVal = xorVal.toString(16).padStart(2, '0');

    const displayPChar = pChar === ' ' ? '␣' : pChar;
    const displayKChar = kChar === ' ' ? '␣' : kChar;

    rowPChar += `<td class="py-2.5 px-3 text-center font-bold text-on-surface"><span class="inline-block px-2 py-0.5 rounded-lg bg-surface-container-lowest shadow-xs">${displayPChar}</span></td>`;
    rowPAscii += `<td class="py-2 px-3 text-center font-mono text-on-surface-variant">${pAscii}</td>`;
    rowKChar += `<td class="py-2.5 px-3 text-center font-bold text-primary"><span class="inline-block px-2 py-0.5 rounded-lg bg-primary-fixed/50">${displayKChar}</span></td>`;
    rowKAscii += `<td class="py-2 px-3 text-center font-mono text-on-surface-variant">${kAscii}</td>`;
    rowXorDec += `<td class="py-2 px-3 text-center font-mono text-secondary font-medium">${xorVal}</td>`;
    rowHex += `<td class="py-2.5 px-3 text-center font-mono font-bold text-on-primary-container"><span class="inline-block px-2 py-0.5 rounded-lg bg-primary-container">${hexVal}</span></td>`;
  }

  rowPChar += `</tr>`;
  rowPAscii += `</tr>`;
  rowKChar += `</tr>`;
  rowKAscii += `</tr>`;
  rowXorDec += `</tr>`;
  rowHex += `</tr>`;

  container.innerHTML = `
    <table class="w-full border-collapse">
      <thead>${headers}</thead>
      <tbody>
        ${rowPChar}
        ${rowPAscii}
        ${rowKChar}
        ${rowKAscii}
        ${rowXorDec}
        ${rowHex}
      </tbody>
    </table>
  `;
}

function runCompleteSimulation() {
  const success = runSimulation('encrypt');
  if (!success) return;
  const animContainer = document.getElementById('animated-trace-container');
  if (animContainer) {
    animContainer.classList.remove('opacity-0', 'translate-y-4');
    animContainer.classList.add('opacity-100', 'translate-y-0');
  }
}

function copyCodeSnippet() {
  const codeText = document.getElementById('code-snippet').innerText;
  navigator.clipboard.writeText(codeText);
  alert('Code snippet copied to clipboard!');
}

function runProgramSimulation() {
  runCompleteSimulation();
  document.getElementById('output').scrollIntoView({ behavior: 'smooth' });
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

// Synchronize Java source code from public/SymmetricXORCipher.java
async function loadJavaSource() {
  const codeSnippet = document.getElementById('code-snippet');
  if (!codeSnippet) return;

  try {
    const response = await fetch('/SymmetricXORCipher.java');
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    const javaCode = await response.text();
    codeSnippet.textContent = javaCode;
  } catch (error) {
    console.error('Failed to load SymmetricXORCipher.java:', error);
    codeSnippet.innerHTML = `<span style="color: #ffdad6;">Could not load source file (SymmetricXORCipher.java).<br>Error: ${error.message}</span>`;
  }
}

// ==========================================
// Sidebar & Hash Navigation Management
// ==========================================
const SECTION_IDS = [
  'introduction',
  'objective',
  'theory',
  'simulator',
  'program',
  'output',
  'procedure',
  'result',
  'faq'
];

let isProgrammaticScroll = false;
let scrollTimeoutId = null;

function parseCurrentHashSection() {
  const hash = window.location.hash.toLowerCase();
  if (!hash || hash === '#' || hash === '#/' || hash === '#introduction') {
    return 'introduction';
  }
  const clean = hash.replace(/^#\/?/, '');
  if (SECTION_IDS.includes(clean)) {
    return clean;
  }
  return 'introduction';
}

function setActiveSidebarSection(activeSection) {
  if (!SECTION_IDS.includes(activeSection)) {
    activeSection = 'introduction';
  }

  // Desktop sidebar links
  const sidebarLinks = document.querySelectorAll('#sidebar-nav .sidebar-nav-link');
  sidebarLinks.forEach(link => {
    const sec = link.getAttribute('data-section');
    const arrow = link.querySelector('.active-arrow');
    if (sec === activeSection) {
      link.classList.add('bg-primary-container', 'text-on-primary-container', 'font-medium');
      link.classList.remove('text-on-surface-variant', 'hover:bg-surface-container', 'hover:text-on-surface');
      if (arrow) arrow.classList.remove('hidden');
    } else {
      link.classList.remove('bg-primary-container', 'text-on-primary-container', 'font-medium');
      link.classList.add('text-on-surface-variant', 'hover:bg-surface-container', 'hover:text-on-surface');
      if (arrow) arrow.classList.add('hidden');
    }
  });

  // Mobile navigation tabs
  const mobileLinks = document.querySelectorAll('#mobile-tabs .mobile-tab-link');
  mobileLinks.forEach(link => {
    const sec = link.getAttribute('data-section');
    if (sec === activeSection) {
      link.classList.add('bg-primary-container', 'text-on-primary-container', 'font-medium');
      link.classList.remove('bg-surface-container', 'text-on-surface-variant');
    } else {
      link.classList.remove('bg-primary-container', 'text-on-primary-container', 'font-medium');
      link.classList.add('bg-surface-container', 'text-on-surface-variant');
    }
  });
}

function scrollToSection(sectionId, smooth = true) {
  if (sectionId === 'introduction') {
    window.scrollTo({ top: 0, behavior: smooth ? 'smooth' : 'auto' });
  } else {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'start' });
    }
  }
}

function navigateToSection(sectionId, updateHash = true) {
  if (!SECTION_IDS.includes(sectionId)) return;

  isProgrammaticScroll = true;
  if (scrollTimeoutId) clearTimeout(scrollTimeoutId);
  scrollTimeoutId = setTimeout(() => {
    isProgrammaticScroll = false;
  }, 900);

  setActiveSidebarSection(sectionId);
  scrollToSection(sectionId, true);

  if (updateHash) {
    const targetHash = sectionId === 'introduction' ? '#/' : `#${sectionId}`;
    if (window.location.hash !== targetHash) {
      history.pushState(null, '', targetHash);
    }
  }
}

function initSidebarNavigation() {
  // Click listeners for desktop sidebar
  const sidebarLinks = document.querySelectorAll('#sidebar-nav .sidebar-nav-link');
  sidebarLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const sec = link.getAttribute('data-section');
      if (sec) navigateToSection(sec, true);
    });
  });

  // Click listeners for mobile tabs
  const mobileLinks = document.querySelectorAll('#mobile-tabs .mobile-tab-link');
  mobileLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const sec = link.getAttribute('data-section');
      if (sec) navigateToSection(sec, true);
    });
  });

  // Hash change handler (browser back/forward or external hash changes)
  window.addEventListener('hashchange', () => {
    const sec = parseCurrentHashSection();
    setActiveSidebarSection(sec);
    scrollToSection(sec, true);
  });

  window.addEventListener('popstate', () => {
    const sec = parseCurrentHashSection();
    setActiveSidebarSection(sec);
    scrollToSection(sec, true);
  });

  // Scrollspy via IntersectionObserver
  const observerOptions = {
    root: null,
    rootMargin: '-10% 0px -70% 0px',
    threshold: 0
  };

  const observer = new IntersectionObserver((entries) => {
    if (isProgrammaticScroll) return;

    if (window.scrollY < 120) {
      setActiveSidebarSection('introduction');
      if (window.location.hash && window.location.hash !== '#/' && window.location.hash !== '#introduction') {
        history.replaceState(null, '', '#/');
      }
      return;
    }

    entries.forEach(entry => {
      if (entry.isIntersecting && !isProgrammaticScroll) {
        const id = entry.target.id;
        if (SECTION_IDS.includes(id)) {
          setActiveSidebarSection(id);
          const newHash = id === 'introduction' ? '#/' : `#${id}`;
          if (window.location.hash !== newHash) {
            history.replaceState(null, '', newHash);
          }
        }
      }
    });
  }, observerOptions);

  SECTION_IDS.forEach(id => {
    const el = document.getElementById(id);
    if (el) observer.observe(el);
  });

  window.addEventListener('scroll', () => {
    if (isProgrammaticScroll) return;
    if (window.scrollY < 100) {
      setActiveSidebarSection('introduction');
    }
  }, { passive: true });

  // Initial load check
  const initialSection = parseCurrentHashSection();
  setActiveSidebarSection(initialSection);
  if (initialSection !== 'introduction') {
    setTimeout(() => {
      scrollToSection(initialSection, false);
    }, 100);
  }
}

// Expose functions globally for inline HTML event handlers
window.encrypt = encrypt;
window.decrypt = decrypt;
window.toHex = toHex;
window.computeXOR = computeXOR;
window.runSimulation = runSimulation;
window.runCompleteSimulation = runCompleteSimulation;
window.copyCodeSnippet = copyCodeSnippet;
window.runProgramSimulation = runProgramSimulation;
window.toggleFaq = toggleFaq;
window.loadJavaSource = loadJavaSource;
window.renderByteVisualization = renderByteVisualization;
window.resetSimulator = resetSimulator;
window.navigateToSection = navigateToSection;
window.setActiveSidebarSection = setActiveSidebarSection;

// About Modal Management
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

window.openAboutModal = openAboutModal;
window.closeAboutModal = closeAboutModal;

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeAboutModal();
  }
});

// Initialize on page load
function initApp() {
  loadJavaSource();
  initSidebarNavigation();
  const pInput = document.getElementById('input-plaintext');
  const kInput = document.getElementById('input-key');
  if (pInput && kInput) {
    renderByteVisualization(pInput.value, kInput.value);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}


