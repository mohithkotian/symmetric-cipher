import java.util.Scanner;

/**
 * Numeric-key Modulo-26 Caesar cipher for educational use.
 * The same numeric key encrypts and decrypts the message.
 */
public class SymmetricMOD26Cipher {

    /** Encrypt letters with C = (P + effectiveKey) % 26. */
    public static String encrypt(String plaintext, int key) {
        int effectiveKey = key % 26;
        StringBuilder ciphertext = new StringBuilder(plaintext.length());

        for (char character : plaintext.toCharArray()) {
            if (character >= 'A' && character <= 'Z') {
                int p = character - 'A';
                int c = (p + effectiveKey) % 26;
                ciphertext.append((char) ('A' + c));
            } else if (character >= 'a' && character <= 'z') {
                int p = character - 'a';
                int c = (p + effectiveKey) % 26;
                ciphertext.append((char) ('a' + c));
            } else {
                ciphertext.append(character);
            }
        }

        return ciphertext.toString();
    }

    /** Decrypt letters with P = (C - effectiveKey + 26) % 26. */
    public static String decrypt(String ciphertext, int key) {
        int effectiveKey = key % 26;
        StringBuilder plaintext = new StringBuilder(ciphertext.length());

        for (char character : ciphertext.toCharArray()) {
            if (character >= 'A' && character <= 'Z') {
                int c = character - 'A';
                int p = (c - effectiveKey + 26) % 26;
                plaintext.append((char) ('A' + p));
            } else if (character >= 'a' && character <= 'z') {
                int c = character - 'a';
                int p = (c - effectiveKey + 26) % 26;
                plaintext.append((char) ('a' + p));
            } else {
                plaintext.append(character);
            }
        }

        return plaintext.toString();
    }

    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);

        System.out.println("==================================================");
        System.out.println("Symmetric Cipher Model - Modulo-26 Caesar Cipher");
        System.out.println("==================================================");

        System.out.print("Enter plaintext: ");
        String plaintext = scanner.nextLine();
        System.out.print("Enter secret key: ");
        int key = Integer.parseInt(scanner.nextLine().trim());
        if (key < 0) {
            System.err.println("Error: Secret key must be a non-negative integer.");
            scanner.close();
            return;
        }

        int effectiveKey = key % 26;
        String ciphertext = encrypt(plaintext, key);
        String recoveredText = decrypt(ciphertext, key);

        System.out.println();
        System.out.println("--- Key Processing ---");
        System.out.println();
        System.out.println("Secret Key: " + key);
        System.out.println("Effective Shift: " + key + " % 26 = " + effectiveKey);

        System.out.println();
        System.out.println("--- Encryption Phase ---");
        System.out.println();
        System.out.println("Plaintext:        " + plaintext);
        System.out.println("Secret Key:       " + key);
        System.out.println("Effective Shift:  " + effectiveKey);
        System.out.println("Ciphertext:       " + ciphertext);

        System.out.println();
        System.out.println("--- Decryption Phase ---");
        System.out.println();
        System.out.println("Recovered Text:   " + recoveredText);

        System.out.println();
        System.out.println("--- Verification ---");
        System.out.println();
        if (recoveredText.equals(plaintext)) {
            System.out.println("[OK] Verification successful:");
            System.out.println("Recovered plaintext matches original message!");
        } else {
            System.out.println("[FAIL] Verification failed:");
            System.out.println("Recovered plaintext does not match original message!");
        }

        scanner.close();
    }

}
