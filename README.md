# Virtual Cryptography Lab Simulator

An educational, browser-based cryptography lab for CS students. Experiment 01 covers the **Numeric-Key Modulo-26 Caesar Cipher** and the **Vigenère Cipher** through interactive simulators, step-by-step transformation tables, a live execution terminal, and an in-browser source code viewer.

> **Course:** BCS703 — Cryptography & Network Security

---

## Features

| Feature | Description |
|---|---|
| Caesar cipher simulator | Encrypt and decrypt with any numeric key; keys ≥ 26 are reduced automatically |
| Vigenère cipher simulator | Polyalphabetic substitution with a cycling keyword |
| 5-step live trace | Shows plaintext → key → effective shift → ciphertext → round-trip verification |
| Transformation table | Per-character breakdown: position value, key, shift, calculation, result |
| Key tape (Vigenère) | Visual alignment of plaintext letters to cycling keyword characters |
| Terminal-style output | Mirrors the Java program's stdout, complete with key-processing and verification phases |
| Source code viewer | Fetches and displays `SymmetricMOD26Cipher.java` directly in the browser |
| Lab report layout | Sidebar navigation with section links: Introduction, Objective, Theory, Simulator, Vigenère, Program, Output, Procedure, Result, FAQ |
| About modal | Project members, faculty, and experiment metadata |

---

## Tech stack

| Tool | Version | Role |
|---|---|---|
| [Vite](https://vitejs.dev/) | ^5.4.11 | Dev server and production bundler |
| Vanilla JavaScript (ESM) | — | All cipher logic and DOM manipulation |
| Tailwind CSS (CDN) | latest | Utility-class styling via `<script src="cdn.tailwindcss.com">` |
| Material Design 3 tokens | — | Color palette defined in inline `tailwind.config` |
| Google Fonts | — | Outfit (body/headings), Reenie Beanie (handwritten accent), Material Symbols Outlined (icons) |

No framework (React/Vue/Angular). No PostCSS. No test runner.

---

## Project structure

```
symmetric-cipher/
├── index.html                    # Single-page app shell; inline Tailwind config and MD3 palette
├── src/
│   ├── main.js                   # Entry point: simulator logic, DOM, sidebar nav, terminal, modals
│   └── ciphers/
│       ├── index.js              # Cipher registry (re-exports all cipher modules)
│       ├── caesar.js             # Caesar cipher module (encrypt / decrypt pure functions)
│       └── vigenere.js           # Vigenère cipher module (encrypt / decrypt pure functions)
├── public/
│   └── SymmetricMOD26Cipher.java # Java reference implementation (served as static asset)
├── SymmetricMOD26Cipher.py       # Python reference implementation
├── vercel.json                   # Security response headers for Vercel deployments
└── package.json                  # npm scripts; only dev dependency is Vite
```

---

## Cipher algorithm

### Alphabet mapping

Each English letter maps to a zero-based numeric position:

```
A = 0   B = 1   C = 2   ...   Y = 24   Z = 25
```

### Encryption

For plaintext position `P` and numeric key `K`:

```
C = (P + K) mod 26
```

### Decryption

For ciphertext position `C` and the same numeric key `K`:

```
P = (C − K + 26) mod 26
```

Adding 26 before the modulo keeps the result non-negative.

### Key normalization

Any key ≥ 26 is automatically reduced to its effective shift without hiding the original value:

```
effectiveShift = K % 26
```

Example — key 30:

```
30 % 26 = 4    →    effective shift = 4
```

### How characters are transformed

| Step | Example (H, key 30) |
|---|---|
| Letter position | H = 7 |
| Apply key | (7 + 30) = 37 |
| Modulo 26 | 37 % 26 = **11** |
| Map back | 11 = **L** |

| Step | Example (Y, key 30) |
|---|---|
| Letter position | Y = 24 |
| Apply key | (24 + 30) = 54 |
| Modulo 26 | 54 % 26 = **2** |
| Map back | 2 = **C** (wraps around) |

**Case is preserved** — uppercase letters shift within A–Z, lowercase within a–z. Spaces, punctuation, digits, and all non-letter characters pass through **unchanged**.

### Worked example — "Hello World" / key 30

```
Plaintext:       Hello World
Key:             30
Effective shift: 4

Ciphertext:      Lipps Asvph
Recovered:       Hello World
```

---

## Vigenère cipher

The Vigenère simulator uses a cycling *keyword* (letters only) instead of a single numeric key. Each plaintext letter is shifted by its aligned keyword character:

```
C = (P + Kᵢ) mod 26     where Kᵢ cycles through the keyword
P = (C − Kᵢ + 26) mod 26
```

The keyword repeats from the beginning when exhausted. Non-letter characters pass through unchanged and do not advance the keyword index.

---

## Implementations

JavaScript, Java, and Python all use the same formulas and produce identical output.

### JavaScript (browser)

`src/ciphers/caesar.js` and `src/ciphers/vigenere.js` — pure ES module functions imported by `src/main.js`.

### Java

```bash
javac public/SymmetricMOD26Cipher.java
printf 'Hello World\n30\n' | java -cp public SymmetricMOD26Cipher
```

Expected output:

```
Effective Shift: 4
Ciphertext: Lipps Asvph
Recovered Text: Hello World
```

### Python

```bash
echo -e "Hello World\n30" | python SymmetricMOD26Cipher.py
```

Expected output:

```
Effective Shift: 4
Ciphertext: Lipps Asvph
Recovered Text: Hello World
Verification: successful
```

---

## Running the project

```bash
# Install dependencies
npm ci

# Start the Vite dev server (http://localhost:5173)
npm run dev

# Build for production (output → dist/)
npm run build

# Preview the production build locally
npm run preview
```

---



## Security disclaimer

This simulator implements classical educational ciphers intended for learning substitution, modulo arithmetic, key normalization, and reversible transformations. A Caesar cipher has only 25 effective keys and is trivially broken by brute-force or frequency analysis. The Vigenère cipher is similarly weak against known-plaintext and Kasiski attacks. **Neither cipher is suitable for protecting real-world confidential information** and must not be used as a substitute for modern authenticated encryption.
