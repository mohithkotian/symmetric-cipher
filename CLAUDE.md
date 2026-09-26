# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm ci          # install dependencies
npm run dev     # start Vite dev server at http://localhost:5173
npm run build   # production bundle → dist/
npm run preview # preview the production build locally
```

No linter, formatter, or test runner is configured.

Run the reference Java implementation:
```bash
javac public/SymmetricMOD26Cipher.java
printf 'Hello World\n30\n' | java -cp public SymmetricMOD26Cipher
```

Run the reference Python implementation:
```bash
echo -e "Hello World\n30" | python SymmetricMOD26Cipher.py
```

## Architecture

**Single-page app** — no framework. One HTML file (`index.html`) wired to one JavaScript entry point (`src/main.js`), bundled by Vite. Tailwind CSS is loaded from CDN at runtime (not PostCSS); the theme config is inlined in a `<script id="tailwind-config">` block inside `index.html`. Fonts come from Google Fonts (Outfit, Reenie Beanie, Material Symbols Outlined).

**`src/main.js`** is the entire JavaScript codebase: cipher engine, DOM manipulation, sidebar navigation (hash-based, IntersectionObserver-driven), transformation table renderer, terminal output renderer, about-modal logic, and FAQ accordion. All functions that the HTML needs to call inline (`onclick="..."`) are exported onto `window` via `Object.assign(window, {...})` at the bottom of the file.

**`index.html`** is a multi-section lab report layout:
- Fixed pill navbar with hash-based section links
- Left sidebar navigation (desktop) + horizontal tab strip (mobile), both driven by `#sidebar-nav` / `#mobile-tabs` selectors
- Sections: `introduction`, `objective`, `theory`, `simulator`, `program`, `output`, `procedure`, `result`, `faq`
- Sections are observed by `IntersectionObserver`; active sidebar state and `window.location.hash` update on scroll

**`public/SymmetricMOD26Cipher.java`** is served as a static asset and fetched at runtime by `loadJavaSource()` to populate the in-page source viewer (`#code-snippet`).

**`vercel.json`** sets security response headers (CSP, HSTS, X-Frame-Options, etc.) for Vercel deployments.

## Caesar cipher logic

All cipher logic lives in `src/main.js`:

- `parseNumericKey(key)` — validates and parses the key; throws `TypeError`/`RangeError` on invalid input
- `effectiveKey(key)` — returns `key % 26`
- `encrypt(text, key)` — `C = (P + K) % 26`, non-letters pass through unchanged, case preserved
- `decrypt(text, key)` — `P = (C - K + 26) % 26`, same pass-through rule
- `validateInputs(plaintext, key)` — returns `{ valid, message }` for UI error display

State between encrypt and decrypt passes is held in three module-level variables: `_lastCiphertext`, `_lastPlaintext`, `_lastKey`.

Matching implementations (same formulas, same behaviour): `SymmetricMOD26Cipher.py` and `public/SymmetricMOD26Cipher.java`.

## Styling conventions

- **Tailwind utility classes only** — no separate CSS files beyond the four inline rules in `<style>` in `index.html` (scroll-margin, overflow helpers).
- **Material Design 3 colour tokens** as Tailwind colours: `surface`, `on-surface`, `primary`, `primary-container`, `on-primary-container`, `secondary`, `tertiary`, `error`, `error-container`, etc. The full palette is defined in `tailwind.config` inside `index.html`.
- **Typography scale**: `font-headline-xl`, `font-headline-lg`, `font-headline-md`, `font-body-lg`, `font-body-md`, `font-label-md` — all map to Outfit. `font-annotation` maps to Reenie Beanie (handwritten accent).
- **Rounded design**: `rounded-full` for pills/buttons, `rounded-3xl` / `rounded-2xl` for cards.
- **Icons**: Material Symbols Outlined via `<span class="material-symbols-outlined">icon_name</span>`.
- DOM text is always set with `element.textContent` (never `innerHTML`) to prevent XSS.

## Planned expansion — multi-cipher crypto lab

**Architectural decision**: the project is expanding into a multi-cipher lab. All cipher modules must follow this contract:

```js
// src/ciphers/<name>.js
export const name = 'Caesar';      // display name
export const family = 'Classical'; // cipher family (e.g. Classical, Substitution, Transposition)
export function encrypt(plaintext, key) { /* pure function */ }
export function decrypt(ciphertext, key) { /* pure function */ }
```

**Registry** (`src/ciphers/index.js`): every cipher module is imported and re-exported as an array/map. UI components import cipher implementations exclusively from this registry — never implement cipher logic directly in UI code.

The current Caesar cipher logic in `src/main.js` must be extracted to `src/ciphers/caesar.js` as the first module following this contract before adding any new ciphers.
