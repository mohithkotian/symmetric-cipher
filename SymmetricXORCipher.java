import java.util.Scanner;

/**
 * SymmetricXORCipher
 * 
 * Educational implementation of a symmetric key cipher using the bitwise
 * Exclusive-OR (XOR) operation.
 * 
 * In symmetric cryptography, the exact same secret key is used for both
 * encryption and decryption. Because XOR is its own inverse ((P ^ K) ^ K = P),
 * applying the key a second time perfectly restores the original plaintext.
 */
public class SymmetricXORCipher {

    /**
     * Encrypts plaintext using bitwise XOR with cyclic key repetition.
     * Formula: cipher[i] = plaintext[i] ^ key[i % key.length]
     *
     * @param plaintext The original text message
     * @param key       The secret key
     * @return Character array representing the encrypted bytes
     */
    public static char[] encrypt(String plaintext, String key) {
        char[] ciphertext = new char[plaintext.length()];
        for (int i = 0; i < plaintext.length(); i++) {
            ciphertext[i] = (char) (plaintext.charAt(i) ^ key.charAt(i % key.length()));
        }
        return ciphertext;
    }

    /**
     * Decrypts ciphertext using bitwise XOR with the same cyclic key.
     * Formula: recovered[i] = cipher[i] ^ key[i % key.length]
     *
     * @param ciphertext The encrypted character array
     * @param key        The secret key
     * @return Reconstructed plaintext string
     */
    public static String decrypt(char[] ciphertext, String key) {
        char[] recovered = new char[ciphertext.length];
        for (int i = 0; i < ciphertext.length; i++) {
            recovered[i] = (char) (ciphertext[i] ^ key.charAt(i % key.length()));
        }
        return new String(recovered);
    }

    /**
     * Converts characters into space-separated 2-digit hexadecimal representations.
     * Hexadecimal is used because XOR operations frequently produce non-printable
     * ASCII control characters.
     *
     * @param data Array of characters/bytes
     * @return Formatted hexadecimal string (e.g., "03 00 15 07 0a")
     */
    public static String toHex(char[] data) {
        StringBuilder hexString = new StringBuilder();
        for (char c : data) {
            hexString.append(String.format("%02x ", (int) c));
        }
        return hexString.toString().trim();
    }

    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);

        System.out.println("==================================================");
        System.out.println("  Symmetric Cipher Model (Basic XOR Simulator)");
        System.out.println("==================================================");

        System.out.print("Enter plaintext: ");
        String plaintext = scanner.nextLine();

        System.out.print("Enter secret key: ");
        String key = scanner.nextLine();

        // Validate that neither input is empty
        if (plaintext == null || plaintext.trim().isEmpty()) {
            System.err.println("Error: Plaintext cannot be empty.");
            scanner.close();
            return;
        }

        if (key == null || key.trim().isEmpty()) {
            System.err.println("Error: Secret key cannot be empty (division/modulo by zero is invalid).");
            scanner.close();
            return;
        }

        // 1. Encryption Phase
        System.out.println("\n--- Encryption Phase ---");
        char[] ciphertext = encrypt(plaintext, key);
        String hexCiphertext = toHex(ciphertext);
        System.out.println("Plaintext:        " + plaintext);
        System.out.println("Secret Key:       " + key);
        System.out.println("Ciphertext (Hex): " + hexCiphertext);

        // 2. Decryption Phase
        System.out.println("\n--- Decryption Phase ---");
        String recoveredText = decrypt(ciphertext, key);
        System.out.println("Recovered Text:   " + recoveredText);

        // 3. Verification Phase
        System.out.println("\n--- Verification ---");
        if (recoveredText.equals(plaintext)) {
            System.out.println("[OK] Verification successful: Recovered plaintext matches original message!");
        } else {
            System.out.println("[FAIL] Verification failed: Recovered plaintext does not match!");
        }

        scanner.close();
    }
}
