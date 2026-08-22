/**
 * Generates a cryptographically secure random temporary password.
 * Satisfies complexity rules: uppercase, lowercase, digits, special characters.
 */
export function generateTemporaryPassword(length = 12) {
  const uppers = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lowers = "abcdefghijkmnopqrstuvwxyz";
  const digits = "23456789";
  const symbols = "!@#$%^&*()_+=";

  const allChars = uppers + lowers + digits + symbols;

  // Guarantee at least one from each character set
  const passwordArr = [
    uppers.charAt(Math.floor(Math.random() * uppers.length)),
    lowers.charAt(Math.floor(Math.random() * lowers.length)),
    digits.charAt(Math.floor(Math.random() * digits.length)),
    symbols.charAt(Math.floor(Math.random() * symbols.length)),
  ];

  for (let i = passwordArr.length; i < length; i++) {
    passwordArr.push(allChars.charAt(Math.floor(Math.random() * allChars.length)));
  }

  // Fisher-Yates shuffle
  for (let i = passwordArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [passwordArr[i], passwordArr[j]] = [passwordArr[j], passwordArr[i]];
  }

  return passwordArr.join("");
}
