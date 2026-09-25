# Virtual Cryptography Lab Simulator

An educational browser-based simulator for the **Numeric-Key Modulo-26 Caesar Cipher**.

## Project

**Virtual Cryptography Lab Simulator**

## Algorithm

**Modulo-26 Caesar Cipher**

The simulator uses a numeric secret key. Only English letters are shifted. Spaces, punctuation, and numbers remain unchanged, and uppercase/lowercase letter case is preserved.

### Alphabet mapping

The alphabet uses zero-based positions:

```text
A = 0
B = 1
...
Z = 25
```

### Encryption

For a plaintext position `P` and numeric key `K`:

```text
C = (P + K) mod 26
```

### Decryption

For a ciphertext position `C` and numeric key `K`:

```text
P = (C - K + 26) mod 26
```

### Key normalization

Keys larger than 26 are supported. The effective shift is calculated without hiding the original key:

```text
effectiveKey = K % 26
```

For example:

```text
Key = 30
30 % 26 = 4
effective shift = 4
```

The original key remains visible in the simulator, transformation table, terminal output, and implementations.

## Worked example

```text
Plaintext:  Hello World
Key:        30
```

Since `30 % 26 = 4`, the cipher applies an effective shift of 4:

```text
Ciphertext: Lipps Asvph
Recovered:  Hello World
```

The simulator also shows the per-character calculation. For example:

```text
H = 7
(7 + 30) % 26 = 11
11 = L
```

Non-letters pass through unchanged and do not participate in the letter transformation.

## Implementations

The project keeps one Java source file, used by the in-browser source viewer:

```text
public/SymmetricMOD26Cipher.java
```

The Java class is:

```java
public class SymmetricMOD26Cipher
```

It provides:

```java
public static String encrypt(String plaintext, int key)
public static String decrypt(String ciphertext, int key)
public static void main(String[] args)
```

A matching Python implementation is also provided:

```text
SymmetricMOD26Cipher.py
```

The JavaScript, Java, and Python implementations use the same formulas and produce the same results.

## Running the project

Install dependencies and start the Vite development server:

```bash
npm ci
npm run dev
```

Build the production bundle:

```bash
npm run build
```

Compile and run the Java implementation:

```bash
javac public/SymmetricMOD26Cipher.java
printf 'Hello World\n30\n' | java -cp public SymmetricMOD26Cipher
```

Expected key result:

```text
Effective Shift: 4
Ciphertext: Lipps Asvph
Recovered Text: Hello World
```

## Educational scope and security limitations

This is a **classical educational cipher** intended to demonstrate symmetric encryption, alphabet mapping, modulo arithmetic, key normalization, and reversible transformations.

A Caesar cipher has a very small effective keyspace and is weak against brute-force attempts and other basic cryptanalysis techniques. It is **not modern secure cryptography** and must not be used to protect real-world confidential communication.
