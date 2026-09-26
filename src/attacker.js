const ENGLISH_FREQUENCIES = { a: 8.167, b: 1.492, c: 2.782, d: 4.253, e: 12.702, f: 2.228, g: 2.015, h: 6.094, i: 6.966, j: 0.153, k: 0.772, l: 4.025, m: 2.406, n: 6.749, o: 7.507, p: 1.929, q: 0.095, r: 5.987, s: 6.327, t: 9.056, u: 2.758, v: 0.978, w: 2.360, x: 0.150, y: 1.974, z: 0.074 };
const ALPHABET = 'abcdefghijklmnopqrstuvwxyz';

function caesarDecrypt(text, shift) {
  return [...text].map((character) => {
    const lower = character.toLowerCase();
    const index = ALPHABET.indexOf(lower);
    if (index < 0) return character;
    const decoded = ALPHABET[(index - shift + 26) % 26];
    return character === character.toUpperCase() ? decoded.toUpperCase() : decoded;
  }).join('');
}

function chiSquared(text) {
  const letters = [...text.toLowerCase()].filter(char => ALPHABET.includes(char));
  if (!letters.length) return Number.POSITIVE_INFINITY;
  const counts = Object.fromEntries([...ALPHABET].map(char => [char, 0]));
  letters.forEach(char => { counts[char] += 1; });
  const total = letters.length;
  return [...ALPHABET].reduce((score, char) => {
    const expected = total * (ENGLISH_FREQUENCIES[char] / 100);
    return score + ((counts[char] - expected) ** 2) / expected;
  }, 0);
}

const COMMON_WORDS = new Set(['a', 'an', 'and', 'are', 'be', 'for', 'hello', 'in', 'is', 'of', 'on', 'the', 'this', 'to', 'world']);
function candidateScore(text) {
  const words = text.toLowerCase().match(/[a-z]+/g) ?? [];
  const wordPrior = words.reduce((score, word) => score + (COMMON_WORDS.has(word) ? 24 : 0), 0);
  return chiSquared(text) - wordPrior;
}

function setText(id, value) { const element = document.getElementById(id); if (element) element.textContent = String(value); }
function show(id) { document.getElementById(id)?.classList.remove('hidden'); }
function hide(id) { document.getElementById(id)?.classList.add('hidden'); }
function createCell(tag, text, className = '') { const cell = document.createElement(tag); cell.className = className; cell.textContent = String(text); return cell; }

function renderFrequencyChart(ciphertext, candidate) {
  const chart = document.getElementById('atk-freq-chart');
  if (!chart) return;
  chart.replaceChildren();
  const observed = Object.fromEntries([...ALPHABET].map(char => [char, 0]));
  [...ciphertext.toLowerCase()].filter(char => ALPHABET.includes(char)).forEach(char => { observed[char] += 1; });
  const total = Object.values(observed).reduce((sum, value) => sum + value, 0) || 1;
  [...ALPHABET].forEach((char) => {
    const row = document.createElement('div'); row.className = 'grid grid-cols-[1.25rem_1fr_3rem] gap-2 items-center text-xs';
    row.appendChild(createCell('span', char.toUpperCase(), 'font-mono font-semibold text-on-surface'));
    const track = document.createElement('div'); track.className = 'h-2 rounded-full bg-surface-container overflow-hidden';
    const bar = document.createElement('div'); bar.className = 'h-full rounded-full bg-primary transition-all'; bar.style.width = `${Math.min(100, (observed[char] / total) * 100)}%`; track.appendChild(bar); row.appendChild(track);
    row.appendChild(createCell('span', `${(observed[char] / total * 100).toFixed(1)}%`, 'text-right font-mono text-on-surface-variant'));
    chart.appendChild(row);
  });
  setText('atk-chart-caption', `Observed letters in ciphertext; candidate shift ${candidate.shift}.`);
}

function renderDetail(candidate, ciphertext) {
  setText('atk-detail-shift', `Shift ${candidate.shift}`);
  setText('atk-detail-score', candidate.score.toFixed(2));
  setText('atk-detail-text', candidate.plaintext);
  renderFrequencyChart(ciphertext, candidate);
}

function renderResults(ciphertext, results) {
  const body = document.getElementById('atk-table-body');
  if (!body) return;
  body.replaceChildren();
  results.forEach((candidate, index) => {
    const row = document.createElement('tr'); row.className = 'border-b border-outline-variant/60 hover:bg-surface-container transition-colors cursor-pointer'; row.dataset.shift = String(candidate.shift);
    row.addEventListener('click', () => renderDetail(candidate, ciphertext));
    row.appendChild(createCell('td', `#${index + 1}`, 'px-3 py-3 font-mono text-on-surface-variant'));
    row.appendChild(createCell('td', String(candidate.shift), 'px-3 py-3 font-mono font-semibold text-primary'));
    row.appendChild(createCell('td', candidate.plaintext, 'px-3 py-3 text-on-surface max-w-[28rem] truncate'));
    row.appendChild(createCell('td', candidate.score.toFixed(2), 'px-3 py-3 text-right font-mono text-on-surface-variant'));
    if (index === 0) row.classList.add('bg-tertiary-fixed/50');
    body.appendChild(row);
  });
  renderDetail(results[0], ciphertext);
  show('atk-results');
}

export function runBreaker() {
  const ciphertext = document.getElementById('atk-ciphertext')?.value ?? '';
  const error = document.getElementById('atk-error');
  hide('atk-error');
  if (!ciphertext.trim()) { setText('atk-error-text', 'Enter ciphertext before running the breaker.'); show('atk-error'); hide('atk-results'); return; }
  const results = Array.from({ length: 26 }, (_, shift) => ({ shift, plaintext: caesarDecrypt(ciphertext, shift), score: candidateScore(caesarDecrypt(ciphertext, shift)) })).sort((a, b) => a.score - b.score);
  renderResults(ciphertext, results);
}

export function resetBreaker() {
  const input = document.getElementById('atk-ciphertext'); if (input) input.value = 'Lipps Asvph';
  hide('atk-error'); hide('atk-results');
  document.getElementById('atk-table-body')?.replaceChildren();
  document.getElementById('atk-freq-chart')?.replaceChildren();
}

export function openAboutModal() { const modal = document.getElementById('about-modal'); const card = document.getElementById('about-modal-card'); if (!modal) return; modal.classList.remove('opacity-0', 'pointer-events-none'); modal.classList.add('opacity-100'); card?.classList.remove('scale-95'); card?.classList.add('scale-100'); }
export function closeAboutModal() { const modal = document.getElementById('about-modal'); const card = document.getElementById('about-modal-card'); if (!modal) return; modal.classList.add('opacity-0', 'pointer-events-none'); modal.classList.remove('opacity-100'); card?.classList.add('scale-95'); card?.classList.remove('scale-100'); }

window.runBreaker = runBreaker; window.resetBreaker = resetBreaker; window.openAboutModal = openAboutModal; window.closeAboutModal = closeAboutModal;
document.addEventListener('DOMContentLoaded', () => { document.getElementById('atk-run')?.addEventListener('click', runBreaker); document.getElementById('atk-reset')?.addEventListener('click', resetBreaker); resetBreaker(); });
