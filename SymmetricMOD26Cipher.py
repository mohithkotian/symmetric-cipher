"""Numeric-key Modulo-26 Caesar cipher for educational use."""


def encrypt(plaintext: str, key: int) -> str:
    effective_key = key % 26
    result = []
    for character in plaintext:
        if "A" <= character <= "Z":
            position = ord(character) - ord("A")
            result.append(chr((position + effective_key) % 26 + ord("A")))
        elif "a" <= character <= "z":
            position = ord(character) - ord("a")
            result.append(chr((position + effective_key) % 26 + ord("a")))
        else:
            result.append(character)
    return "".join(result)


def decrypt(ciphertext: str, key: int) -> str:
    effective_key = key % 26
    result = []
    for character in ciphertext:
        if "A" <= character <= "Z":
            position = ord(character) - ord("A")
            result.append(chr((position - effective_key + 26) % 26 + ord("A")))
        elif "a" <= character <= "z":
            position = ord(character) - ord("a")
            result.append(chr((position - effective_key + 26) % 26 + ord("a")))
        else:
            result.append(character)
    return "".join(result)


if __name__ == "__main__":
    plaintext = input("Enter plaintext: ")
    key = int(input("Enter numeric key: ").strip())
    effective_key = key % 26
    ciphertext = encrypt(plaintext, key)
    recovered_text = decrypt(ciphertext, key)
    print(f"Effective Shift: {effective_key}")
    print(f"Ciphertext: {ciphertext}")
    print(f"Recovered Text: {recovered_text}")
    print(f"Verification: {'successful' if recovered_text == plaintext else 'failed'}")
